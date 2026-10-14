#!/usr/bin/env zsh
set -euo pipefail

# Always operate on the repo root, whatever the caller's cwd.
cd "$(git -C "${0:A:h}" rev-parse --show-toplevel)"

usage() {
  cat <<'USAGE'
Usage:
  scripts/cache-bust.sh [timestamp|commit|VALUE]

Examples:
  scripts/cache-bust.sh            # UTC timestamp, recommended for manual deploys
  scripts/cache-bust.sh timestamp  # same as default
  scripts/cache-bust.sh commit     # current git HEAD short hash
  scripts/cache-bust.sh 20260604   # custom cache version
USAGE
}

mode="${1:-timestamp}"

case "$mode" in
  -h|--help)
    usage
    exit 0
    ;;
  timestamp)
    version="$(date -u +%Y%m%d%H%M%S)"
    ;;
  commit)
    version="$(git rev-parse --short HEAD)"
    ;;
  *)
    version="$mode"
    ;;
esac

export CACHE_BUST_VERSION="$version"

targets=(
  index.html
  device-monitor/index.html
  iwindrose/index.html
  televideo-pro/index.html
)

for file in "${targets[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing target file: $file" >&2
    exit 1
  fi
done

perl -0pi -e 's#((?:href|src)="(?:css/style\.css|js/icons\.js|js/app\.js|data/i18n\.json)\?v=)[^"]+#${1}$ENV{CACHE_BUST_VERSION}#g' \
  "${targets[@]}"

echo "Cache version set to $version"
