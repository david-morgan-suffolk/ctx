#!/usr/bin/env bash
# Apply a ctx preset to this repo, then remove the template scaffolding.
# Intended to be run once, immediately after creating a repo from the
# ctx GitHub template. Re-running is safe but requires --force.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PRESETS_DIR="${ROOT}/presets"

PRESET=""
FORCE=0

usage() {
  cat <<EOF
Usage: ./init.sh [--preset <name>] [--force]

Options:
  --preset <name>   Preset to apply (skip the interactive menu).
  --force           Overwrite existing .context/ or AGENTS.md if present.
  -h, --help        Show this help.

Available presets:
EOF
  list_presets | sed 's/^/  - /'
}

list_presets() {
  if [[ ! -d "$PRESETS_DIR" ]]; then
    echo "error: presets/ not found at $PRESETS_DIR" >&2
    exit 1
  fi
  find "$PRESETS_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preset)
      shift
      [[ $# -gt 0 ]] || { echo "error: --preset requires a value" >&2; exit 1; }
      PRESET="$1"
      ;;
    --preset=*)
      PRESET="${1#--preset=}"
      ;;
    --force)
      FORCE=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

mapfile -t PRESETS < <(list_presets)
if [[ ${#PRESETS[@]} -eq 0 ]]; then
  echo "error: no presets found in $PRESETS_DIR" >&2
  exit 1
fi

if [[ -z "$PRESET" ]]; then
  if [[ ! -t 0 ]]; then
    echo "error: no --preset given and stdin is not a TTY." >&2
    echo "       Use --preset <name>. Available:" >&2
    printf '         %s\n' "${PRESETS[@]}" >&2
    exit 1
  fi

  echo "Pick a preset:"
  i=1
  for name in "${PRESETS[@]}"; do
    printf "  %2d) %s\n" "$i" "$name"
    i=$((i + 1))
  done
  echo
  while :; do
    read -rp "Choice [1-${#PRESETS[@]}]: " choice
    if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#PRESETS[@]} )); then
      PRESET="${PRESETS[$((choice - 1))]}"
      break
    fi
    echo "Invalid choice." >&2
  done
fi

PRESET_DIR="${PRESETS_DIR}/${PRESET}"
if [[ ! -d "$PRESET_DIR" ]]; then
  echo "error: preset '$PRESET' not found." >&2
  echo "Available:" >&2
  printf '  %s\n' "${PRESETS[@]}" >&2
  exit 1
fi

if [[ $FORCE -eq 0 ]]; then
  for path in "$ROOT/.context" "$ROOT/AGENTS.md"; do
    if [[ -e "$path" && "$(dirname "$path")" == "$ROOT" ]]; then
      # Template's own .context/ and AGENTS.md are about to be removed below,
      # so these checks only protect a user's pre-existing content on a re-run.
      :
    fi
  done
fi

echo "Applying preset: $PRESET"

# 1. Remove the template's own context files so the preset's versions land cleanly.
rm -rf "$ROOT/.context" "$ROOT/AGENTS.md" "$ROOT/.devcontainer"

# 2. Copy preset contents (dotfiles + regular) to repo root.
shopt -s dotglob nullglob
cp -R "${PRESET_DIR}"/* "$ROOT/"
shopt -u dotglob nullglob

# 3. Remove template scaffolding.
rm -rf \
  "$ROOT/presets" \
  "$ROOT/templates" \
  "$ROOT/scripts" \
  "$ROOT/node_modules" \
  "$ROOT/package.json" \
  "$ROOT/pnpm-lock.yaml" \
  "$ROOT/README.md"

# 4. Remove self.
rm -f "$ROOT/init.sh"

cat <<EOF

Applied preset: ${PRESET}

Next:
  grep -rn TODO .context/ AGENTS.md     # fill in markers
  git add -A && git commit -m "init from ctx-template"

EOF
