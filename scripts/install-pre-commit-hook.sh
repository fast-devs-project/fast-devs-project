#!/usr/bin/env zsh
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
tracked_hook="$repo_root/scripts/pre-commit-cache-bust.sh"
hook_path="$repo_root/.git/hooks/pre-commit"

if [[ ! -f "$tracked_hook" ]]; then
  echo "Missing tracked hook script: $tracked_hook" >&2
  exit 1
fi

mkdir -p "$(dirname "$hook_path")"

cat > "$hook_path" <<'EOF'
#!/usr/bin/env zsh
set -euo pipefail
repo_root="$(git rev-parse --show-toplevel)"
tracked_hook="$repo_root/scripts/pre-commit-cache-bust.sh"
[[ -f "$tracked_hook" ]] || exit 0
exec "$tracked_hook"
EOF

chmod +x "$hook_path"
echo "Installed pre-commit hook wrapper at .git/hooks/pre-commit"
