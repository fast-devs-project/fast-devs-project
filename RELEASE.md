# Release Guide

Follow these steps every time you publish an app update.

---

## Pre-commit hook

Before preparing a release, make sure the local Git hook exists at `.git/hooks/pre-commit`:

```bash
cp scripts/pre-commit-cache-bust.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

If you need to recreate it manually, use this code:

```bash
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
```

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

## iWindrose²

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

### Quick Checklist — iWindrose²

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
git commit -m "Release Device Monitor² vX.X.X / iWindrose² vX.X.X"
git push
```

GitHub Pages updates automatically within 1-2 minutes after the push.
