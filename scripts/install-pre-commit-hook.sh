#!/usr/bin/env zsh
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"
tracked_hook="$repo_root/scripts/pre-commit-cache-bust.sh"
# Resolve the real hooks location (works with worktrees and core.hooksPath).
hook_path="$(git rev-parse --git-path hooks/pre-commit)"

if [[ ! -f "$tracked_hook" ]]; then
  echo "Missing tracked hook script: $tracked_hook" >&2
  exit 1
fi

mkdir -p "$(dirname "$hook_path")"

wrapper="$(cat <<'EOF'
#!/usr/bin/env zsh
# Minimal wrapper — delegates to the tracked hook script so that edits to
# scripts/pre-commit-cache-bust.sh take effect immediately, with no reinstall.
# Do not put logic here; edit scripts/pre-commit-cache-bust.sh instead.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
tracked_hook="$repo_root/scripts/pre-commit-cache-bust.sh"

# If the tracked script is missing (e.g. fresh checkout before install), skip
# rather than block the commit.
[[ -f "$tracked_hook" ]] || exit 0

exec "$tracked_hook"
EOF
)"

# Back up an existing, different hook instead of silently overwriting it.
if [[ -e "$hook_path" ]] && [[ "$(<"$hook_path")" != "$wrapper" ]]; then
  cp -p "$hook_path" "$hook_path.bak"
  echo "Existing pre-commit hook backed up to $hook_path.bak"
fi

print -r -- "$wrapper" > "$hook_path"
chmod +x "$hook_path"
echo "Installed pre-commit hook wrapper at $hook_path"
