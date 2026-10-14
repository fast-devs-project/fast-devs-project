# AGENTS.md

Read the home-level `~/.codex/AGENTS.md` every session start.

This file provides guidance to Codex when working with code in this repository.

## Overview

Static marketing site for **Fast-Devs Project** (independent Italian iOS developer Marco Ricca). Pure HTML5 + CSS3 + vanilla JS, no build step, no framework, no package manager, and no runtime CSS framework. Served on GitHub Pages. All copy is bilingual (Italian default / English) and should be driven by JSON whenever the existing page does so.

The repo hosts **four independent sites** in one tree:

- Root (`index.html`, `css/`, `js/`, `data/`) — the Fast-Devs Project home page.
- `device-monitor/` — landing page for the Device Monitor² app.
- `iwindrose/` — landing page for the iWindRose² app.
- `televideo-pro/` — landing page for the Televideo² Pro app (removed from App Store).

Each subfolder is a self-contained mini-site with its own `index.html`, `css/`, `js/app.js`, `js/icons.js`, `data/`, and `images/`. They share conventions but **not code** — there is no shared bundle; the same patterns are duplicated per site.

The tree also contains `diving-center/`, which is not a site but a data/asset feed (see [Diving Center data feed](#diving-center-data-feed)).

## Local Development

No tooling for the sites (the only exception is the `diving-center/` maintenance scripts, see below). Run a static server **from the repo root** because relative `fetch()` calls for JSON require HTTP; opening `file://` fails on CORS. See [README.md → Local Development](README.md#local-development) for the exact command and per-site URLs.

There are no tests, no linter, and no build. Verification usually means loading the affected page in a browser and checking the relevant interactions.

## Architecture

### Content is data, not markup

HTML files contain layout and empty containers with `id`s. `js/app.js` fetches JSON from `data/`, renders cards/sections into those containers, and wires interactions. To change copy or listings, prefer editing the relevant JSON in `data/` instead of hardcoding content in HTML/JS.

### i18n pattern

- Translations live in `data/i18n.json`, keyed by language (`it` / `en`) then by string key.
- Markup opts in with `data-i18n`, `data-i18n-placeholder`, or `data-i18n-aria`.
- `applyLang(lang)` walks those attributes and re-renders dynamic sections. Language preference is persisted in `localStorage`.
- Content JSON entries usually carry parallel `_en` fields, such as `tagline` / `tagline_en` and `content` / `content_en`; helper functions choose the localized variant at render time.
- App landings: hard-coded numbers (ratings, stats) carry `data-number` (raw value, e.g. `"4.7"`, `"44317"`) and optional `data-suffix`; `applyLang` formats them per language (`4,7` / `4.7`). The `hero.rating` `data-count` is a raw number too. Gallery screenshots have `alt` / `alt_en`; on language switch `applyLang` updates the thumbnails' alt/aria-label in place (no re-render, so loaded images and videos are kept).
- Keep the Italian HTML fallback text identical to the `it` value in `i18n.json` (it is what crawlers and no-JS visitors see).

### Cache busting

CSS/JS/JSON are loaded with a `?v=` query string for GitHub Pages cache invalidation.

- `js/app.js` reads its own `?v=` value from its script tag and forwards it to every JSON `fetch()`.
- `scripts/cache-bust.sh` rewrites `?v=` values in the four `index.html` files.
- A local `pre-commit` hook bumps the `?v=` values automatically when a commit touches site files. All logic lives in the tracked `scripts/pre-commit-cache-bust.sh`; the installed `.git/hooks/pre-commit` is only a wrapper. On a fresh clone, run `zsh scripts/install-pre-commit-hook.sh` once.

Do not hand-edit `?v=` values; let the script/hook manage them.

Images are **not** cache-busted (no `?v=`). When an image changes, save it under a new filename and update the references instead of overwriting the existing file.

## App Landing Pages

The `device-monitor/`, `iwindrose/`, and `televideo-pro/` sites use the same general engine as the root, with app-specific config constants at the top of their `app.js` files (`APP_STORE_URL`, `SUPPORT_URL`, plus feature/compatibility color maps). These sites split content across several JSON files: `changelog.json`, `features.json`, `compatibility.json`, `gallery.json`, `press.json`, `i18n.json`, plus `kits.json` for Device Monitor². `press.json` exists only for Device Monitor² and iWindRose², not for `televideo-pro/`. The `televideo-pro/` landing is for a removed app — it has no App Store CTA and shows "removed" badges instead.

The hero version badge is derived automatically from `changelog.json`:

- `device-monitor/` and `televideo-pro/` entries carry a `platform` field (`"ios"` / `"macos"` for Device Monitor², `"ios"` / `"tvos"` for Televideo² Pro). Each hero version comes from the **first entry of that platform**, and the changelog card shows the platform label.
- `iwindrose/` entries have no `platform`; the hero version comes from the **first entry**.

When releasing, prepend the new version object (with its `platform` where used) and move the `"latest"` badge to it. On sites with `platform`, `"latest"` goes on the newest entry **of each platform**, so two entries can carry it at once (see below).

In every app's `data/changelog.json`, `badge` is an enum key or an array of keys (rendered stacked in a column); there is no `badge_en`. Keys are defined in `CHANGELOG_BADGES` in each site's `js/app.js` (key → hex color, applied via the `--badge-color` CSS variable; keep the map identical across sites) and their labels in that site's `i18n.json` as `changelog.badge.<key>`: `latest` (blue), `major` (orange), `fix` (red), `first` (green). Unknown keys are ignored. To add a badge type, add the key with its color to `CHANGELOG_BADGES` and both translations in every app site; no CSS change is needed. When releasing, remove only `"latest"` from the previous entry (of the same platform, where `platform` is used) and keep its other badges.

Gallery thumbnail aspect ratios (set via `--thumb-ratio` in each site's `renderGallery()`):

- `device-monitor/`: iPhone `499/1080`, iPad `1280/960`, Apple Watch `5/8`, Mac `16/10`.
- `iwindrose/`: iPhone `499/1080`, iPad `2560/1919`, Apple Watch `242/296`.
- `televideo-pro/`: iPhone `499/1080`, iPad `2560/1919`, Apple TV `16/9`, Apple Watch `242/296`.

### Device Monitor² kits review (every 3 months)

The content of every kit in `device-monitor/data/kits.json` (`description`, `features`, and their `_en` variants) must be reviewed every 3 months against the current App Store descriptions for iOS and macOS, which are the source of truth. Kit features change between app releases, so stale entries are expected.

- **Last review: 2026-10-14.** At session start, if more than 3 months have passed since this date, remind the user that the kits review is due before doing anything else.
- Ask the user for the current App Store descriptions; do not infer kit features from memory or other JSON files.
- Review each kit individually: remove features no longer listed, add new ones, and keep Italian and English arrays aligned.
- When a feature differs by platform, use a platform group object instead of a plain string: `{ "platform": "iPhone e iPad", "items": [...] }` (English: `"iPhone and iPad"`, `"Mac"`). Features shared by all platforms stay plain strings listed before the groups.
- After the review, update the "Last review" date above.

## Diving Center data feed

`diving-center/` is a tracked data/asset folder with **no HTML**: `data/diving.json` plus images (badges, banners, icon). It is served publicly at <https://fastdevsproject.com/diving-center/data/diving.json> and consumed by an external app, so keep its JSON shape stable.

- The top-level `version` field of `diving.json` is managed manually by the user; never change it.
- The feed is not cache-busted (no `?v=`, not covered by `scripts/cache-bust.sh` or the pre-commit hook).
- Its maintenance scripts live in `scripts/*diving*` and use Node.js (`.mjs`) and Python. This is a deliberate exception to the no-tooling rule, which applies to the sites only.

## Releasing

See [RELEASE.md](RELEASE.md). Short version per app: prepend a new entry at the top of that app's `data/changelog.json`, move the `"latest"` badge key to it, update any changed content JSON, then commit. Deploy is just `git push`; GitHub Pages publishes within a couple of minutes.

## Conventions

- Vanilla JS only — no frameworks, no npm dependencies, no transpilation.
- Match the existing IIFE-free, module-free style: globals plus `DOMContentLoaded` init.
- `loadJSON()` fails soft; render functions should guard on `null` and bail rather than throw.
- Scroll-reveal animations use a shared `IntersectionObserver` via `observeReveal()`; newly injected `.reveal` elements must be re-registered by calling it after `innerHTML` updates.
- The root contact form posts to FormSubmit with a honeypot field (`_honey`) and a 3-second minimum fill time as spam guards. Success shows `#email-alert`; a failed send (or a submit within 3 s) shows `#email-alert-error` (`contact.error`) and keeps the form content. A honeypot hit is dropped silently.
- Feature icon colors come from `FEATURE_COLORS` and compatibility gradients from `COMPAT_GRADIENTS` in each `app.js`, not from JSON; gallery ratios are set in `renderGallery()`.
- Publishing: `_config.yml` excludes docs and `scripts/` from the GitHub Pages site — add any new doc/tooling file there. `robots.txt` and `sitemap.xml` live at the root; add new landing pages to `sitemap.xml`. Each site has a 180×180 opaque `images/icon/apple-touch-icon.png` (no transparency: iOS fills it with black).
- Preserve existing user changes in the working tree. Do not reset or clean unrelated files.
