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
    index.html|css/*|js/*|data/*|images/*|site.webmanifest|device-monitor/*|iwindrose/*|televideo-pro/*)
      should_bust=true
      break
      ;;
  esac
done <<< "$staged_files"

if [[ "$should_bust" != true ]]; then
  exit 0
fi

# Compute the cache version once and apply it to the working tree so that the
# checkout the developer sees matches what gets committed.
version="$(date -u +%Y%m%d%H%M%S)"
scripts/cache-bust.sh "$version"

# Re-stage ONLY the bumped `?v=` references, not whatever else the developer
# left unstaged in these HTML files. We take each file's current *index*
# content (HEAD content plus any chunks the developer chose to stage), apply
# only the `?v=` substitution to it, write it as a blob and point the index
# entry at that blob. Unstaged chunks in the working tree are never touched, so
# partial commits keep working.
html_files=(index.html device-monitor/index.html iwindrose/index.html televideo-pro/index.html)

for file in "${html_files[@]}"; do
  # Mode of the existing index entry (falls back to a regular file).
  mode="$(git ls-files --stage -- "$file" | awk '{print $1}')"
  [[ -n "$mode" ]] || mode=100644

  # Substitute on the index content (NOT the working tree) and stage the result.
  # Piping straight through avoids the trailing-newline loss of $(...).
  blob="$(git show ":$file" \
    | CACHE_BUST_VERSION="$version" perl -0pe 's#((?:href|src)="(?:css/style\.css|js/icons\.js|js/app\.js|data/i18n\.json)\?v=)[^"]+#${1}$ENV{CACHE_BUST_VERSION}#g' \
    | git hash-object -w --stdin)"

  git update-index --cacheinfo "$mode" "$blob" "$file"
done

echo "[cache-bust] Updated working tree and staged only the ?v= references (v=$version)."
