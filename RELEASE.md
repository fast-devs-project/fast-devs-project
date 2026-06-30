# Release Guide

Follow these steps every time you publish an app update.

---

## Before You Start

Install the local pre-commit hook wrapper once per clone:

```bash
zsh scripts/install-pre-commit-hook.sh
```

The wrapper delegates to [`scripts/pre-commit-cache-bust.sh`](scripts/pre-commit-cache-bust.sh). Edit the tracked script, not `.git/hooks/pre-commit`.

---

## Common Steps

1. Add a new object at the top of the app's `data/changelog.json`.
2. Move `"Ultima versione"` / `"Latest version"` to that new entry and set the previous entry's `"badge"` / `"badge_en"` to `null`.
3. Update only the changed content JSON files for that app.
4. Commit the release. The pre-commit hook bumps the `?v=` cache values automatically when site files are staged.

The version shown in each landing-page hero comes from the first entry in `changelog.json`.

To force cache busting manually before a commit, run:

```bash
scripts/cache-bust.sh
```

For automated publishing after a commit already exists, use the current commit hash:

```bash
scripts/cache-bust.sh commit
```

---

## Changelog Template

```json
{
  "version": "X.Y.Z",
  "date": "DD/MM/YYYY",
  "badge": "Ultima versione",
  "badge_en": "Latest version",
  "highlights": ["Descrizione modifica 1"],
  "highlights_en": ["Change description 1"]
},
```

---

## Content Maps

| App | Changelog | Content files |
|---|---|---|
| Device Monitor² | `device-monitor/data/changelog.json` | `kits.json`, `features.json`, `gallery.json`, `compatibility.json`, `press.json` |
| iWindRose² | `iwindrose/data/changelog.json` | `features.json`, `gallery.json`, `compatibility.json`, `press.json` |

Screenshots also require adding the image files under the relevant app's `images/screenshots/` folder.

`televideo-pro/` is an archived landing page for a removed app. Update its JSON only for site maintenance, not as part of a normal App Store release.

---

## Quick Checklist

- [ ] Pre-commit hook installed, or `scripts/cache-bust.sh` run manually
- [ ] New changelog entry added at the top
- [ ] Latest-version badge moved to the new changelog entry
- [ ] Changed content JSON files updated
- [ ] Affected page checked locally

---

## Local Server

To preview a release before pushing, run a static server from the repo root and open the affected page — see **[README.md → Local Development](README.md#local-development)** for the command and URLs.

---

## Deploy to GitHub Pages

```bash
git add .
git commit -m "Release Device Monitor² vX.X.X / iWindRose² vX.X.X"
git push
```

GitHub Pages updates automatically within 1-2 minutes after the push. The live site is served at **[fastdevsproject.com](https://fastdevsproject.com)**.
