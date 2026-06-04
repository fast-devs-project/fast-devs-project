#!/usr/bin/env zsh
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

staged_files="$(git diff --cached --name-only)"

if [[ -z "$staged_files" ]]; then
  exit 0
fi

should_bust=false

while IFS= read -r file; do
  case "$file" in
    index.html|css/*|js/*|data/*|images/*|site.webmanifest|device-monitor/*|iwindrose/*)
      should_bust=true
      break
      ;;
  esac
done <<< "$staged_files"

if [[ "$should_bust" != true ]]; then
  exit 0
fi

scripts/cache-bust.sh
git add -- index.html device-monitor/index.html iwindrose/index.html

echo "[cache-bust] Updated and staged HTML cache references."
