# Release Guide

Follow these steps every time you publish an app update.

---

## Pre-commit hook

The cache-busting logic lives in the tracked script [`scripts/pre-commit-cache-bust.sh`](scripts/pre-commit-cache-bust.sh). The installed hook at `.git/hooks/pre-commit` is just a thin wrapper that delegates to it, so editing the tracked script takes effect with no reinstall.

Before preparing a release, make sure the wrapper exists. On a fresh clone, install it once:

```bash
cat > .git/hooks/pre-commit <<'EOF'
#!/usr/bin/env zsh
set -euo pipefail
repo_root="$(git rev-parse --show-toplevel)"
tracked_hook="$repo_root/scripts/pre-commit-cache-bust.sh"
[[ -f "$tracked_hook" ]] || exit 0
exec "$tracked_hook"
EOF
chmod +x .git/hooks/pre-commit
```

> Never put logic in the wrapper — edit `scripts/pre-commit-cache-bust.sh` instead.

---

## Device Monitor²

### 1. Update the website cache version

The local pre-commit hook runs this automatically when a commit includes site files:

```bash
scripts/cache-bust.sh
```

You can still run it manually from the repo root if you want to force a new cache version before committing. It updates the `?v=` cache-busting value in the HTML files with a UTC timestamp. The JS data loader reads that value automatically from `app.js?v=...`, so JSON content gets refreshed too.

If you publish through an automated build after the commit already exists, you can use the current commit hash instead:

```bash
scripts/cache-bust.sh commit
```

### 2. Add the new version to the changelog

Open `device-monitor/data/changelog.json` and insert a new object **at the top**:

```json
{
  "version": "26.6.0",
  "date": "DD/MM/YYYY",
  "badge": "Ultima versione",
  "badge_en": "Latest version",
  "highlights": ["Descrizione modifica 1"],
  "highlights_en": ["Change description 1"]
},
```

Remember to set `"badge": null` on the previous version.

The version shown in the hero badge **updates automatically** from the first changelog entry.

### 3. Update changed content

| What changed | File to update |
|---|---|
| New or modified kit | `device-monitor/data/kits.json` |
| New feature | `device-monitor/data/features.json` |
| New screenshots | `device-monitor/data/gallery.json` + images in `images/screenshots/` |
| Device compatibility | `device-monitor/data/compatibility.json` |
| New press mention / video | `device-monitor/data/press.json` |

### Quick Checklist — Device Monitor²

- [ ] Pre-commit hook ran, or `scripts/cache-bust.sh` was run manually
- [ ] New entry added at the top of `changelog.json`
- [ ] `"Ultima versione"` badge moved to the new version
- [ ] Modified content JSON files updated

---

## iWindRose²

### 1. Update the website cache version

The local pre-commit hook runs this automatically when a commit includes site files:

```bash
scripts/cache-bust.sh
```

You can still run it manually from the repo root if you want to force a new cache version before committing. It updates the `?v=` cache-busting value in the HTML files with a UTC timestamp. The JS data loader reads that value automatically from `app.js?v=...`, so JSON content gets refreshed too.

If you publish through an automated build after the commit already exists, you can use the current commit hash instead:

```bash
scripts/cache-bust.sh commit
```

### 2. Add the new version to the changelog

Open `iwindrose/data/changelog.json` and insert a new object **at the top**:

```json
{
  "version": "5.8.0",
  "date": "DD/MM/YYYY",
  "badge": "Ultima versione",
  "badge_en": "Latest version",
  "highlights": ["Descrizione modifica 1"],
  "highlights_en": ["Change description 1"]
},
```

Remember to set `"badge": null` on the previous version.

### 3. Update changed content

| What changed | File to update |
|---|---|
| New feature | `iwindrose/data/features.json` |
| New screenshots | `iwindrose/data/gallery.json` + images in `images/screenshots/` |
| Device compatibility | `iwindrose/data/compatibility.json` |
| New press mention / video | `iwindrose/data/press.json` |

### Quick Checklist — iWindRose²

- [ ] Pre-commit hook ran, or `scripts/cache-bust.sh` was run manually
- [ ] New entry added at the top of `changelog.json`
- [ ] `"Ultima versione"` badge moved to the new version
- [ ] Modified content JSON files updated

---

## Local Server

```bash
# Start (from repo root)
python3 -m http.server 8099

# Stop
pkill -f "python3 -m http.server 8099"
```

---

## Deploy to GitHub Pages

```bash
git add .
git commit -m "Release Device Monitor² vX.X.X / iWindRose² vX.X.X"
git push
```

GitHub Pages updates automatically within 1-2 minutes after the push. The live site is served at **[fastdevsproject.com](https://fastdevsproject.com)** (custom domain managed through Cloudflare).
