# Fast-Devs Project — Landing Pages

Static landing pages for the iOS/watchOS apps by **[Fast-Devs Project](https://fastdevsproject.altervista.org)**.

🔗 **[Website](https://fastdevsproject.altervista.org)** · **[@FastDevsProject](https://x.com/FastDevsProject)**

---

## Apps

| App | Folder | App Store |
|---|---|---|
| **Device Monitor²** | [`device-monitor/`](device-monitor/) | [App Store](https://apps.apple.com/it/app/device-monitor/id1522870046) |
| **iWindrose²** | [`iwindrose/`](iwindrose/) | [App Store](https://apps.apple.com/it/app/iwindrose/id1403142267) |

---

## Tech Stack

- HTML5 + CSS3 + vanilla JavaScript
- [Tailwind CSS](https://tailwindcss.com) via CDN
- Fully static — no server, no build tools
- Content managed through JSON files
- Multi-language support (Italian / English)

---

## Project Structure

Each app has its own self-contained folder:

```
├── device-monitor/
│   ├── index.html
│   ├── css/style.css
│   ├── js/
│   │   ├── app.js
│   │   └── icons.js
│   ├── data/
│   │   ├── i18n.json           # IT / EN translations
│   │   ├── changelog.json      # App version history
│   │   ├── features.json       # Main features
│   │   ├── kits.json           # Premium in-app kits
│   │   ├── compatibility.json  # Device compatibility
│   │   ├── gallery.json        # Screenshots per device
│   │   └── press.json          # External mentions and videos
│   └── images/
│
└── iwindrose/
    ├── index.html
    ├── css/style.css
    ├── js/
    │   ├── app.js
    │   └── icons.js
    ├── data/
    │   ├── i18n.json
    │   ├── changelog.json
    │   ├── features.json
    │   ├── compatibility.json
    │   ├── gallery.json
    │   └── press.json
    └── images/
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
- `http://localhost:8099/device-monitor/` — Device Monitor²
- `http://localhost:8099/iwindrose/` — iWindrose²

> ⚠️ Opening `index.html` directly via double-click (`file://`) won't work: JSON files are blocked by the browser due to CORS.

---

## Updating Content

All text and data live in the JSON files inside each app's `data/` folder. You can edit them directly without touching HTML or JS.

For a step-by-step release checklist, see **[RELEASE.md](RELEASE.md)**.

---

## GitHub Pages

Both sites are served from the same repo:

- `https://<user>.github.io/<repo>/device-monitor/`
- `https://<user>.github.io/<repo>/iwindrose/`

---

## License

© 2018-2026 Fast-Devs Project by Marco Ricca. All rights reserved.
