# Fast-Devs Project — Website

![Fast-Devs Project banner](images/banner/fdp-banner.webp)

Static landing pages by **Fast-Devs Project**.

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

CSS, JS, and JSON content use a `?v=` cache-busting value so GitHub Pages and browsers load fresh files after a release. The local pre-commit hook handles this automatically; on a fresh clone, install its wrapper once with `zsh scripts/install-pre-commit-hook.sh`.

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
