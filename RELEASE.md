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

1. Add a new object at the top of the app's `data/changelog.json` (with `"platform"` on Device Monitor² and Televideo² Pro, see the template below).
2. Add the `"latest"` badge key to that new entry (e.g. `"badge": ["latest", "major"]`) and remove only `"latest"` from the previous one of the same platform (set `"badge"` to `null` if nothing is left). Available keys: `latest`, `major`, `fix`, `first` (see `CHANGELOG_BADGES` in the app's `js/app.js`); labels come from `i18n.json`, so there is no `badge_en`.
3. Update only the changed content JSON files for that app.
4. Commit the release. The pre-commit hook bumps the `?v=` cache values automatically when site files are staged.

The version shown in each landing-page hero comes from `changelog.json`: on sites that use `"platform"` (Device Monitor²: `ios` / `macos`; Televideo² Pro: `ios` / `tvos`) each hero version is the first entry of that platform, so `"latest"` goes on the newest entry of each platform; iWindRose² has no `platform` and uses the first entry.

To force cache busting manually before a commit, run (works from any directory):

```bash
scripts/cache-bust.sh
```

`scripts/cache-bust.sh commit` writes the current `HEAD` short hash instead. Note that committing that change re-runs the pre-commit hook, which overwrites the value with a fresh UTC timestamp. The `commit` mode therefore only sticks if you commit with `git commit --no-verify`, or in CI / deploy pipelines that publish the working tree without committing.

---

## Changelog Template

```json
{
  "version": "X.Y.Z",
  "date": "DD/MM/YYYY",
  "badge": "latest",
  "highlights": ["Descrizione modifica 1"],
  "highlights_en": ["Change description 1"],
  "platform": "ios"
},
```

`"platform"` is used only by `device-monitor/` (`"ios"` or `"macos"`) and `televideo-pro/` (`"ios"` or `"tvos"`). Omit it for `iwindrose/`.

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
git add device-monitor/data/ iwindrose/data/   # add only the paths you changed
git status                                     # check nothing unrelated is staged
git commit -m "Release Device Monitor² vX.X.X / iWindRose² vX.X.X"
git push
```

GitHub Pages updates automatically within 1-2 minutes after the push. The live site is served at **[fastdevsproject.com](https://fastdevsproject.com)**.
