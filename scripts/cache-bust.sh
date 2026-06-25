#!/usr/bin/env zsh
set -euo pipefail

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

perl -0pi -e 's#((?:href|src)="(?:css/style\.css|js/icons\.js|js/app\.js|data/i18n\.json)\?v=)[^"]+#${1}$ENV{CACHE_BUST_VERSION}#g' \
  index.html \
  device-monitor/index.html \
  iwindrose/index.html \
  televideo-pro/index.html

echo "Cache version set to $version"
