# Fast-Devs Project — Website

![Fast-Devs Project banner](images/banner/fdp-banner.webp)

Static landing pages for by **Fast-Devs Project**.

🔗 **[@FastDevsProject](https://x.com/FastDevsProject)**

---

## Apps

| App | Folder | App Store |
|---|---|---|
| **Device Monitor²** | [`device-monitor/`](device-monitor/) | [App Store](https://apps.apple.com/it/app/device-monitor/id1522870046) |
| **iWindRose²** | [`iwindrose/`](iwindrose/) | [App Store](https://apps.apple.com/it/app/iwindrose/id1403142267) |
| **Televideo² Pro** | [`televideo-pro/`](televideo-pro/) | Removed |

---

## Tech Stack

- HTML5 + CSS3 + vanilla JavaScript
- Custom CSS only, no runtime CSS framework
- Fully static — no server, no build tools
- Content managed through JSON files
- Multi-language support (Italian / English)

---

## Project Structure

The repo root is the main site. Each app landing page lives in its own subfolder:

```
├── index.html              # Main site (Fast-Devs Project home)
├── css/style.css           # Main site styles
├── js/app.js               # Main site logic
├── data/
│   ├── i18n.json           # Main site translations
│   ├── apps.json           # App listings
│   └── blog.json           # Blog articles
├── images/                 # Main site images
│
├── device-monitor/         # Device Monitor² landing page
│   ├── index.html
│   ├── css/, js/, data/, images/
│
├── iwindrose/              # iWindRose² landing page
│   ├── index.html
│   ├── css/, js/, data/, images/
│
└── televideo-pro/          # Televideo² Pro landing page
    ├── index.html
    ├── css/, js/, data/, images/
```

---

## Local Development

No tools required. Start a static server from the **repo root**:

```bash
# Start
python3 -m http.server 8099

# Stop
pkill -f "python3 -m http.server 8099"
```

Then open:
- `http://localhost:8099/` — Fast-Devs Project (main site)
- `http://localhost:8099/device-monitor/` — Device Monitor²
- `http://localhost:8099/iwindrose/` — iWindRose²
- `http://localhost:8099/televideo-pro/` — Televideo² Pro

> ⚠️ Opening `index.html` directly via double-click (`file://`) won't work: JSON files are blocked by the browser due to CORS.

---

## Updating Content

All text and data live in the JSON files inside each app's `data/` folder. You can edit them directly without touching HTML or JS.

CSS, JS, and JSON content use a `?v=` cache-busting value so GitHub Pages and browsers load fresh files after a release.

This working copy has a local `pre-commit` hook installed. When a commit includes site files, it bumps the `?v=` values in the four `index.html` files and re-stages only those `?v=` references, so partial commits keep working and the working tree stays clean after the commit.

**How it's wired:** all the logic lives in the tracked script [`scripts/pre-commit-cache-bust.sh`](scripts/pre-commit-cache-bust.sh). The installed hook at `.git/hooks/pre-commit` is a thin wrapper that just delegates to it — so editing the tracked script takes effect immediately, with no reinstall.

If you clone the repo on another machine, install the wrapper once:

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

> The wrapper has no business logic — never edit it. Change `scripts/pre-commit-cache-bust.sh` instead.

For a step-by-step release checklist, see **[RELEASE.md](RELEASE.md)**.

---

## Hosting

All sites are served from the same repo via GitHub Pages, behind the custom domain **[fastdevsproject.com](https://fastdevsproject.com)** (managed through Cloudflare):

- `https://fastdevsproject.com/` — Main site
- `https://fastdevsproject.com/device-monitor/` — Device Monitor²
- `https://fastdevsproject.com/iwindrose/` — iWindRose²
- `https://fastdevsproject.com/televideo-pro/` — Televideo² Pro

---

## License

© 2018-2026 Fast-Devs Project by Marco Ricca. All rights reserved.
