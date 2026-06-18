# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## Overview

Static marketing site for **Fast-Devs Project** (independent Italian iOS developer Marco Ricca). Pure HTML5 + CSS3 + vanilla JS, no build step, no framework, no package manager. Tailwind is loaded via CDN. Served on GitHub Pages. All copy is bilingual (Italian default / English) and should be driven by JSON whenever the existing page does so.

The repo hosts **four independent sites** in one tree:

- Root (`index.html`, `css/`, `js/`, `data/`) — the Fast-Devs Project home page.
- `device-monitor/` — landing page for the Device Monitor² app.
- `iwindrose/` — landing page for the iWindrose² app.
- `televideo-pro/` — landing page for the Televideo² Pro app (removed from App Store).

Each subfolder is a self-contained mini-site with its own `index.html`, `css/`, `js/app.js`, `js/icons.js`, `data/`, and `images/`. They share conventions but **not code** — there is no shared bundle; the same patterns are duplicated per site.

## Local Development

No tooling. Run a static server **from the repo root** because relative `fetch()` calls for JSON require HTTP; opening `file://` fails on CORS:

```bash
python3 -m http.server 8099
```

Then open:

- `http://localhost:8099/` — main site
- `http://localhost:8099/device-monitor/` — Device Monitor²
- `http://localhost:8099/iwindrose/` — iWindrose²
- `http://localhost:8099/televideo-pro/` — Televideo² Pro

There are no tests, no linter, and no build. Verification usually means loading the affected page in a browser and checking the relevant interactions.

## Architecture

### Content is data, not markup

HTML files contain layout and empty containers with `id`s. `js/app.js` fetches JSON from `data/`, renders cards/sections into those containers, and wires interactions. To change copy or listings, prefer editing the relevant JSON in `data/` instead of hardcoding content in HTML/JS.

### i18n pattern

- Translations live in `data/i18n.json`, keyed by language (`it` / `en`) then by string key.
- Markup opts in with `data-i18n`, `data-i18n-placeholder`, or `data-i18n-aria`.
- `applyLang(lang)` walks those attributes and re-renders dynamic sections. Language preference is persisted in `localStorage`.
- Content JSON entries usually carry parallel `_en` fields, such as `tagline` / `tagline_en` and `content` / `content_en`; helper functions choose the localized variant at render time.

### Cache busting

CSS/JS/JSON are loaded with a `?v=` query string for GitHub Pages cache invalidation.

- `js/app.js` reads its own `?v=` value from its script tag and forwards it to every JSON `fetch()`.
- `scripts/cache-bust.sh` rewrites `?v=` values in the four `index.html` files.
- A local `pre-commit` hook can run `cache-bust.sh` automatically when a commit touches site files, then re-stage the HTML:

```bash
cp scripts/pre-commit-cache-bust.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

Do not hand-edit `?v=` values; let the script/hook manage them.

## App Landing Pages

The `device-monitor/`, `iwindrose/`, and `televideo-pro/` sites use the same general engine as the root, with app-specific config constants at the top of their `app.js` files (`APP_STORE_URL`, `SUPPORT_URL`, plus feature/compatibility color maps). These sites split content across several JSON files: `changelog.json`, `features.json`, `compatibility.json`, `gallery.json`, `press.json`, `i18n.json`, plus `kits.json` for Device Monitor². The `televideo-pro/` landing is for a removed app — it has no App Store CTA and shows "removed" badges instead.

The hero version badge is derived automatically from the **first entry** of `changelog.json`. When releasing, prepend the new version object and set the previous entry's `"badge"` to `null`.

Gallery thumbnail aspect ratios (set via `--thumb-ratio` in JS): iPhone `499/1080`, iPad `2560/1919`, Apple Watch `1/1`, Apple TV `16/9`, Mac `16/10`.

## Releasing

See [RELEASE.md](RELEASE.md). Short version per app: prepend a new entry at the top of that app's `data/changelog.json`, move the `"Ultima versione"` badge to it, update any changed content JSON, then commit. Deploy is just `git push`; GitHub Pages publishes within a couple of minutes.

## Conventions

- Vanilla JS only — no frameworks, no npm dependencies, no transpilation.
- Match the existing IIFE-free, module-free style: globals plus `DOMContentLoaded` init.
- `loadJSON()` fails soft; render functions should guard on `null` and bail rather than throw.
- Scroll-reveal animations use a shared `IntersectionObserver` via `observeReveal()`; newly injected `.reveal` elements must be re-registered by calling it after `innerHTML` updates.
- The root contact form posts to FormSubmit with a honeypot field (`_honey`) and a 3-second minimum fill time as spam guards.
- Preserve existing user changes in the working tree. Do not reset or clean unrelated files.
