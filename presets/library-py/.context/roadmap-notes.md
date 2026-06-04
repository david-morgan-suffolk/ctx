# Roadmap Notes

Durable project knowledge. Not a task tracker. Record completed milestones, decisions that should outlive a single PR, accepted tech debt, and staged work.

## Completed Milestones

TODO: append each shipped capability with an ISO date and one-line description. Examples:

- `YYYY-MM-DD` — Initial scaffold (uv + ruff + ty + pytest + hatchling).
- `YYYY-MM-DD` — `py.typed` marker shipped; first wheel uploaded to PyPI.
- `YYYY-MM-DD` — Public API surface stabilized; cut `1.0.0`.
- `YYYY-MM-DD` — Optional CLI (`<bin-name>`) shipped behind `[project.scripts]`.

## Durable Decisions

Record decisions here so they survive turnover. Add the **why** in one line.

- `uv` for environment and dependency management. *Why: fast, lockfile-based, single tool replaces venv + pip + pip-tools.*
- `hatchling` as the build backend. *Why: PEP 517 standard, minimal config, plays well with `uv build`.*
- `ruff` for lint and format. *Why: one tool, consistent config, fast.*
- `ty` for static type checking, strict. *Why: catches contract drift before tests run.*
- `pytest` for tests, no `unittest.TestCase` subclassing. *Why: fixtures are simpler and more composable.*
- Public surface declared via `__init__.py` re-exports + `__all__` per module. *Why: contract is in one file per package; submodule paths are not promised.*
- `py.typed` shipped in the wheel. *Why: consumers' type checkers pick up our types without stubs.*
- No `os.environ` reads in library code. *Why: the host owns configuration; libraries take options in explicitly.*
- No `logging.basicConfig`; modules use `getLogger(__name__)`. *Why: the host owns observability; libraries do not fight for the root logger.*
- Internal data: `@dataclass(frozen=True, slots=True)`. *Why: type system is enough internally; immutability + slots catches bugs cheap.*
- No `unittest.mock.patch` on first-party modules. *Why: if you need it, the code is missing a seam — fix the structure instead.*
- `CHANGELOG.md` hand-maintained in Keep-a-Changelog format. *Why: every user-facing change is forced through a human-written release note.*
- TODO: supported Python minor range (e.g., 3.11–3.13) and reason.
- TODO: sync-only vs async public API stance and reason.
- TODO: optional extras strategy (per-feature extras vs single core) and reason.
- TODO: CLI (yes / no) and, if yes, argv parser choice and reason.

## Accepted Tech Debt

TODO. Things you know are not ideal but consciously deferred. One-line cause + trigger to revisit. Examples:

- TODO: sync-only — async wrappers add surface; revisit when ≥1 consumer needs them inside an event loop.
- TODO: no benchmark suite — perf is "good enough" by inspection; revisit if a consumer files a regression.
- TODO: `ty` configured but not yet at full strict — incremental adoption; track in this file.
- TODO: `CHANGELOG.md` hand-edited rather than tool-generated — fine at current PR volume; revisit if release overhead grows.

## Staged Work

TODO. Next planned chunks, ordered. Keep this short — it is a pointer, not a backlog.

1. TODO
2. TODO
3. TODO

## Refresh Checklist

When this file is updated, also confirm:

- Commands in `.context/engineering-guide.md` still match `pyproject.toml`.
- Public surface listed in `.context/project-context.md` still matches `src/<pkg>/__init__.py` and `__all__`.
- `[build-system]`, `[project]`, `[project.scripts]`, `[tool.hatch.build.targets.wheel]` in `pyproject.toml` still match the documented build shape.
- `py.typed` is present in `src/<pkg>/` and lands in the built wheel.
- `grep -rn 'os.environ' src/` returns nothing (CLI may be the documented exception).
- `grep -rn 'logging.basicConfig' src/` returns nothing.
- Supported-Python-versions claim in `README.md` still matches what CI proves.
- Durable decisions above still match what the code does. If a decision was silently reversed, fix the code or update the note.
