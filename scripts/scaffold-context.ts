import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type PackageJson = {
  name?: string;
  description?: string;
  packageManager?: string;
  type?: string;
  workspaces?: string[] | { packages?: string[] };
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
};

type TsConfig = {
  compilerOptions?: {
    strict?: boolean;
    module?: string;
    moduleResolution?: string;
    target?: string;
    jsx?: string;
    noEmit?: boolean;
    baseUrl?: string;
    paths?: Record<string, string[]>;
  };
};

type WorkspaceInfo = {
  dir: string;
  relDir: string;
  packageName: string;
  description: string;
  scripts: Record<string, string>;
};

type Args = {
  target: string;
  write: boolean;
  force: boolean;
  agentShim: boolean;
  packageOverlays: boolean;
  currentFocus: boolean;
  help: boolean;
};

type PlannedFile = {
  path: string;
  content: string;
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const ctxRoot = resolve(scriptDir, "..");
const templateDir = join(ctxRoot, "templates", "agent-context");

const GENERATED_ARTIFACTS = [
  "dist",
  "build",
  "coverage",
  "node_modules",
  ".turbo",
  ".next",
  ".vite",
  ".cache",
  "out",
];

const SECRET_PATHS = [
  ".env",
  ".env.* except .env.example",
  ".secrets",
  "*.pem",
  "*.key",
  "*.p12",
  "infra/params/*.local.json",
  "copied certs",
  "raw provider payload dumps",
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const target = resolve(args.target || process.cwd());
  const rootPackage = (await readJson<PackageJson>(join(target, "package.json"))) ?? {};
  const tsConfig = await readFirstJson<TsConfig>(target, ["tsconfig.json", "tsconfig.base.json"]);
  const packageManager = await detectPackageManager(target, rootPackage);
  const workspaces = await detectWorkspaces(target, rootPackage);
  const context = await buildContext(target, rootPackage, tsConfig, packageManager, workspaces);

  const files: PlannedFile[] = [
    {
      path: join(target, "AGENTS.md"),
      content: render(await loadTemplate("AGENTS.md.tmpl"), context),
    },
    {
      path: join(target, ".context", "project-context.md"),
      content: render(await loadTemplate("project-context.md.tmpl"), context),
    },
    {
      path: join(target, ".context", "engineering-guide.md"),
      content: render(await loadTemplate("engineering-guide.md.tmpl"), context),
    },
    {
      path: join(target, ".context", "roadmap-notes.md"),
      content: render(await loadTemplate("roadmap-notes.md.tmpl"), context),
    },
  ];

  if (args.agentShim) {
    files.push({
      path: join(target, "AGENT.md"),
      content: render(await loadTemplate("AGENT.md.tmpl"), context),
    });
  }

  if (args.currentFocus) {
    files.push({
      path: join(target, ".context", "current-focus.md"),
      content: render(await loadTemplate("current-focus.md.tmpl"), context),
    });
  }

  if (args.packageOverlays) {
    const overlayTemplate = await loadTemplate("package-AGENTS.md.tmpl");
    for (const workspace of workspaces) {
      files.push({
        path: join(workspace.dir, "AGENTS.md"),
        content: render(overlayTemplate, {
          ...context,
          packageName: workspace.packageName,
          packageDir: workspace.relDir,
          packageDescription: workspace.description,
          packageCommands: formatCommands(workspace.scripts, packageManager, workspace.relDir),
        }),
      });
    }
  }

  await applyPlan(target, files, args);
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    target: "",
    write: false,
    force: false,
    agentShim: false,
    packageOverlays: false,
    currentFocus: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--target") {
      const value = argv[++i];
      if (!value || value.startsWith("--")) throw new Error("--target requires a path");
      args.target = value;
    }
    else if (arg.startsWith("--target=")) args.target = arg.slice("--target=".length);
    else if (arg === "--write") args.write = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--agent-shim") args.agentShim = true;
    else if (arg === "--package-overlays") args.packageOverlays = true;
    else if (arg === "--current-focus") args.currentFocus = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: bun run scaffold -- [--target <repo>] [options]

Options:
  --target <repo>      Target repo. Default is current directory.
  --write              Write files. Default is dry-run.
  --force              Overwrite existing files.
  --agent-shim         Also generate AGENT.md as a compatibility shim.
  --package-overlays   Generate AGENTS.md inside detected workspace packages.
  --current-focus      Generate .context/current-focus.md for short-lived notes.
  --help               Show this help.
`);
}

async function applyPlan(target: string, files: PlannedFile[], args: Args) {
  console.log(`${args.write ? "write" : "dry-run"}: ${target}`);
  for (const file of files) {
    const relPath = relative(target, file.path) || file.path;
    const existsAlready = await exists(file.path);
    if (existsAlready && !args.force) {
      console.log(`skip exists: ${relPath}`);
      continue;
    }

    if (!args.write) {
      console.log(`${existsAlready ? "would overwrite" : "would create"}: ${relPath}`);
      continue;
    }

    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, ensureTrailingNewline(file.content), "utf8");
    console.log(`${existsAlready ? "overwrote" : "created"}: ${relPath}`);
  }
}

async function buildContext(
  target: string,
  rootPackage: PackageJson,
  tsConfig: TsConfig | null,
  packageManager: string,
  workspaces: WorkspaceInfo[],
): Promise<Record<string, string>> {
  const repoName = rootPackage.name ?? basename(target) ?? "TODO_REPO_NAME";
  const repoDescription = rootPackage.description ?? "TODO: describe what this repository builds and who uses it.";
  const commands = formatCommands(rootPackage.scripts ?? {}, packageManager, ".");
  const workspaceTable = formatWorkspaceTable(workspaces);
  const workspaceSummary = workspaces.length > 0
    ? `${workspaces.length} workspace package${workspaces.length === 1 ? "" : "s"} detected.`
    : "No workspace packages detected from package.json.";
  const tsSummary = formatTsSummary(rootPackage, tsConfig);
  const tsRules = formatTsRules(rootPackage, tsConfig, packageManager);
  const testGuidance = formatTestGuidance(rootPackage, packageManager);
  const safetyRules = SECRET_PATHS.map((path) => `- Do not read or copy \`${path}\`.`).join("\n");
  const artifactRules = GENERATED_ARTIFACTS.map((path) => `- Avoid editing generated/local artifacts: \`${path}\`.`).join("\n");
  const detectedConfigs = await formatDetectedConfigs(target);

  return {
    repoName,
    repoDescription,
    packageManager,
    commands,
    workspaceTable,
    workspaceSummary,
    tsSummary,
    tsRules,
    testGuidance,
    safetyRules,
    artifactRules,
    detectedConfigs,
    generatedDate: new Date().toISOString().slice(0, 10),
  };
}

function formatCommands(scripts: Record<string, string>, packageManager: string, scope: string): string {
  const lines: string[] = [];
  const installCommand = installFor(packageManager);
  if (scope === ".") lines.push(`- \`${installCommand}\` - install dependencies.`);

  for (const name of ["build", "typecheck", "lint", "format", "test", "dev", "start", "codegen"]) {
    if (scripts[name]) lines.push(`- \`${runFor(packageManager, name)}\` - runs \`${scripts[name]}\`.`);
  }

  if (lines.length === 0) {
    return "- TODO: add verified commands from package.json, justfile, Makefile, or repo docs.";
  }

  const prefix = scope === "." ? "" : `From \`${scope}\`, or use a workspace filter from the repo root when supported.\n\n`;
  return `${prefix}${lines.join("\n")}`;
}

function formatWorkspaceTable(workspaces: WorkspaceInfo[]): string {
  if (workspaces.length === 0) {
    return "| Path | Package | Purpose |\n|------|---------|---------|\n| TODO | TODO | Add workspace map if this becomes a monorepo. |";
  }

  const rows = workspaces.map((workspace) => {
    return `| \`${workspace.relDir}\` | \`${workspace.packageName}\` | ${workspace.description} |`;
  });
  return ["| Path | Package | Purpose |", "|------|---------|---------|", ...rows].join("\n");
}

function formatTsSummary(rootPackage: PackageJson, tsConfig: TsConfig | null): string {
  const opts = tsConfig?.compilerOptions ?? {};
  const parts = [
    rootPackage.type ? `package type \`${rootPackage.type}\`` : "package type not declared",
    opts.strict === true ? "strict TypeScript enabled" : opts.strict === false ? "strict TypeScript disabled" : "strict mode not detected",
    opts.module ? `module \`${opts.module}\`` : "module not detected",
    opts.moduleResolution ? `moduleResolution \`${opts.moduleResolution}\`` : "moduleResolution not detected",
    opts.target ? `target \`${opts.target}\`` : "target not detected",
    opts.jsx ? `jsx \`${opts.jsx}\`` : "jsx not detected",
  ];
  return parts.join("; ") + ".";
}

function formatTsRules(rootPackage: PackageJson, tsConfig: TsConfig | null, packageManager: string): string {
  const opts = tsConfig?.compilerOptions ?? {};
  const rules = [
    "- Preserve the repository's existing TypeScript module style and import suffix convention.",
    "- Use `import type` and `export type` for type-only symbols.",
    "- Keep runtime validation at external boundaries: HTTP, CLI args, env, files, queues, provider SDKs.",
    "- Prefer small, typed modules over broad utility files.",
    "- Keep public package APIs behind existing barrels only when the repo already uses barrels.",
  ];

  if (rootPackage.type === "module") rules.push("- Treat source as ESM unless a local package or config says otherwise.");
  if (opts.strict === true) rules.push("- Keep `strict` TypeScript clean; do not loosen compiler options to ship a change.");
  if (opts.moduleResolution === "NodeNext" || opts.moduleResolution === "Node16") {
    rules.push("- NodeNext/Node16 projects usually require explicit runtime file extensions for relative imports; follow current source convention.");
  }
  if (packageManager === "bun") rules.push("- Use Bun commands and Bun-compatible APIs unless existing code intentionally targets Node APIs.");

  return rules.join("\n");
}

function formatTestGuidance(rootPackage: PackageJson, packageManager: string): string {
  const scripts = rootPackage.scripts ?? {};
  const deps = {
    ...(rootPackage.dependencies ?? {}),
    ...(rootPackage.devDependencies ?? {}),
    ...(rootPackage.peerDependencies ?? {}),
  };
  const lines = [
    scripts.test
      ? `- Default test command: \`${runFor(packageManager, "test")}\`. Verify scope before calling it full coverage.`
      : "- TODO: add default test command once tests exist.",
  ];

  if ("vitest" in deps) lines.push("- Vitest detected; keep tests close to source or in existing test folders.");
  if (scripts.test?.includes("bun test")) lines.push("- Bun test detected; use Bun test APIs and avoid Jest-only globals.");
  if ("jest" in deps) lines.push("- Jest detected; preserve existing Jest config and transform setup.");
  if ("@playwright/test" in deps) lines.push("- Playwright detected; keep browser tests isolated from unit tests unless scripts combine them.");
  lines.push("- Prefer real local behavior in tests; mock only network, filesystem, time, and other process boundaries.");
  lines.push("- Reset env vars, singletons, mocks, and injected factories in test cleanup.");
  return lines.join("\n");
}

async function formatDetectedConfigs(target: string): Promise<string> {
  const names = [
    "package.json",
    "tsconfig.json",
    "tsconfig.base.json",
    "biome.json",
    "biome.jsonc",
    "eslint.config.js",
    "eslint.config.mjs",
    "vitest.config.ts",
    "vitest.config.mts",
    "jest.config.js",
    "playwright.config.ts",
    "justfile",
    "Makefile",
  ];
  const found: string[] = [];
  for (const name of names) {
    if (await exists(join(target, name))) found.push(`- \`${name}\``);
  }
  return found.length > 0 ? found.join("\n") : "- No common config files detected.";
}

async function detectPackageManager(target: string, rootPackage: PackageJson): Promise<string> {
  const declared = rootPackage.packageManager?.split("@")[0];
  if (declared) return declared;
  if (await exists(join(target, "bun.lock")) || await exists(join(target, "bun.lockb"))) return "bun";
  if (await exists(join(target, "pnpm-lock.yaml"))) return "pnpm";
  if (await exists(join(target, "yarn.lock"))) return "yarn";
  if (await exists(join(target, "package-lock.json"))) return "npm";
  return "npm";
}

async function detectWorkspaces(target: string, rootPackage: PackageJson): Promise<WorkspaceInfo[]> {
  const patterns = Array.isArray(rootPackage.workspaces)
    ? rootPackage.workspaces
    : rootPackage.workspaces?.packages ?? [];
  const results: WorkspaceInfo[] = [];
  for (const pattern of patterns) {
    const dirs = await expandWorkspacePattern(target, pattern);
    for (const dir of dirs) {
      const pkg = await readJson<PackageJson>(join(dir, "package.json"));
      if (!pkg) continue;
      results.push({
        dir,
        relDir: relative(target, dir),
        packageName: pkg.name ?? relative(target, dir),
        description: pkg.description ?? "TODO: describe package ownership.",
        scripts: pkg.scripts ?? {},
      });
    }
  }
  return results.sort((a, b) => a.relDir.localeCompare(b.relDir));
}

async function expandWorkspacePattern(target: string, pattern: string): Promise<string[]> {
  const normalized = pattern.replace(/\\/g, "/");
  if (!normalized.includes("*")) {
    const dir = join(target, normalized);
    return (await isDirectory(dir)) ? [dir] : [];
  }

  const starIndex = normalized.indexOf("*");
  const base = normalized.slice(0, starIndex).replace(/\/$/, "");
  const suffix = normalized.slice(starIndex + 1).replace(/^\//, "");
  const baseDir = join(target, base);
  if (!(await isDirectory(baseDir))) return [];

  const entries = await readdir(baseDir, { withFileTypes: true });
  const dirs: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    const candidate = suffix ? join(baseDir, entry.name, suffix) : join(baseDir, entry.name);
    if (await isDirectory(candidate)) dirs.push(candidate);
  }
  return dirs;
}

function installFor(packageManager: string): string {
  if (packageManager === "bun") return "bun install";
  if (packageManager === "pnpm") return "pnpm install";
  if (packageManager === "yarn") return "yarn install";
  return "npm install";
}

function runFor(packageManager: string, script: string): string {
  if (packageManager === "bun") return `bun run ${script}`;
  if (packageManager === "pnpm") return `pnpm run ${script}`;
  if (packageManager === "yarn") return `yarn ${script}`;
  return `npm run ${script}`;
}

async function loadTemplate(name: string): Promise<string> {
  return readFile(join(templateDir, name), "utf8");
}

function render(template: string, values: Record<string, string>): string {
  return template.replace(/{{([a-zA-Z0-9_]+)}}/g, (_, key: string) => values[key] ?? `TODO_${key}`);
}

async function readFirstJson<T>(dir: string, names: string[]): Promise<T | null> {
  for (const name of names) {
    const value = await readJson<T>(join(dir, name));
    if (value) return value;
  }
  return null;
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const text = await readFile(path, "utf8");
    return JSON.parse(text) as T;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw new Error(`Failed to read JSON ${path}: ${(error as Error).message}`);
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (isNotFound(error)) return false;
    throw error;
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch (error) {
    if (isNotFound(error)) return false;
    throw error;
  }
}

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function ensureTrailingNewline(value: string): string {
  return value.endsWith("\n") ? value : `${value}\n`;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
