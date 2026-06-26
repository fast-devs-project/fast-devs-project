# CLAUDE.md

Read the home-level `~/.claude/CLAUDE.md` every session start.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static marketing site for **Fast-Devs Project** (independent Italian iOS developer Marco Ricca). Pure HTML5 + CSS3 + vanilla JS, no build step, no framework, no package manager, and no runtime CSS framework. Served on GitHub Pages. All copy is bilingual (Italian default / English) and driven by JSON, not hardcoded in markup.

The repo hosts **four independent sites** in one tree:

- Root (`index.html`, `css/`, `js/`, `data/`) — the Fast-Devs Project home page.
- `device-monitor/` — landing page for the Device Monitor² app.
- `iwindrose/` — landing page for the iWindRose² app.
- `televideo-pro/` — landing page for the Televideo² Pro app (removed from App Store).

Each subfolder is a self-contained mini-site with its own `index.html`, `css/`, `js/app.js`, `js/icons.js`, `data/`, and `images/`. They share conventions but **not code** — there is no shared bundle; the same patterns are duplicated per site.

## Local Development

No tooling. Run a static server **from the repo root** (relative `fetch()` of JSON requires HTTP — opening `file://` fails on CORS):

```bash
python3 -m http.server 8099                     # start
pkill -f "python3 -m http.server 8099"          # stop
```

- `http://localhost:8099/` — main site
- `http://localhost:8099/device-monitor/` — Device Monitor²
- `http://localhost:8099/iwindrose/` — iWindRose²
- `http://localhost:8099/televideo-pro/` — Televideo² Pro

There are no tests, no linter, and no build. "Testing" means loading the pages in a browser.

## Architecture

### Content is data, not markup
HTML files contain layout and empty containers with `id`s. `js/app.js` fetches JSON from `data/`, renders cards/sections into those containers, and wires interactions. To change copy or listings, **edit the JSON in `data/` — do not touch HTML/JS**.

### i18n pattern (consistent across all four sites)
- Translations live in `data/i18n.json`, keyed by language (`it` / `en`) then by string key.
- Markup opts in with attributes: `data-i18n` (textContent), `data-i18n-placeholder`, `data-i18n-aria`.
- `applyLang(lang)` walks those attributes and also re-renders dynamic sections. Language preference is persisted in `localStorage` (`site_lang` on the root site), defaulting to browser language.
- Content JSON entries carry parallel `_en` fields (e.g. `tagline` / `tagline_en`, `content` / `content_en`); a helper picks the localized variant at render time.

### Cache busting (important — read before editing HTML)
CSS/JS/JSON are loaded with a `?v=` query string for GitHub Pages cache invalidation. The flow:
- `js/app.js` reads its own `?v=` value from its script tag and forwards it to every `fetch()` of JSON, so bumping the JS version refreshes content too.
- `scripts/cache-bust.sh` rewrites the `?v=` values in the four `index.html` files (default: UTC timestamp; `commit` = git short hash; or a custom value).
- A **local `pre-commit` hook** bumps the `?v=` values automatically when a commit touches site files, re-staging only those references (partial commits keep working). All logic lives in the tracked `scripts/pre-commit-cache-bust.sh`; the installed `.git/hooks/pre-commit` is a thin wrapper that `exec`s the tracked script, so editing the script needs no reinstall. On a fresh clone, install the wrapper once:
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
- Do not hand-edit `?v=` values, and never put logic in the wrapper — edit `scripts/pre-commit-cache-bust.sh` instead.

### App landing page sites (device-monitor / iwindrose / televideo-pro)
Same engine as the root, with app-specific config constants at the top of `app.js` (`APP_STORE_URL`, `SUPPORT_URL`, plus `FEATURE_COLORS` / `COMPAT_GRADIENTS` maps that color feature icons and compatibility badges by key). These sites split content across several JSON files: `changelog.json`, `features.json`, `compatibility.json`, `gallery.json`, `press.json`, `i18n.json` (+ `kits.json` for Device Monitor²). The `televideo-pro/` landing is for a removed app — it has no App Store CTA and shows "removed" badges instead.

The hero version badge is derived automatically from the **first entry** of `changelog.json`. When releasing, prepend the new version object and set the previous entry's `"badge"` to `null`.

Gallery thumbnail aspect ratios (set via `--thumb-ratio` in JS): iPhone `499/1080`, iPad `2560/1919`, Apple Watch `1/1`, Apple TV `16/9`, Mac `16/10`.

## Releasing

Full checklist in [RELEASE.md](RELEASE.md). The short version per app: prepend a new entry at the top of that app's `data/changelog.json`, move the `"Ultima versione"` badge to it, update any changed content JSON, then commit (the pre-commit hook handles cache busting). Deploy is just `git push` — GitHub Pages publishes within 1–2 minutes.

## Conventions

- Vanilla JS only — no frameworks, no npm dependencies, no transpilation. Match the existing IIFE-free, module-free style (globals + `DOMContentLoaded` init).
- `loadJSON()` fails soft (returns `null`, logs a warning); render functions guard on null and bail rather than throw.
- Scroll-reveal animations use a shared `IntersectionObserver` (`observeReveal()`); newly injected `.reveal` elements must be re-registered by calling it after `innerHTML` updates.
- The root contact form posts to FormSubmit with a honeypot field (`_honey`) and a 3-second minimum fill time as spam guards.
