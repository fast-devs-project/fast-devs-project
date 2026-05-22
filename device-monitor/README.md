# Device Monitor² — Landing Page

Official landing page for the **Device Monitor²** app, available on the App Store for iPhone, iPad, Apple Watch and Mac.

🔗 **[App Store](https://apps.apple.com/it/app/device-monitor/id1522870046)** · **[Fast-Devs Project](https://fastdevsproject.altervista.org)** · **[@FastDevsProject](https://x.com/FastDevsProject)**

---

## Tech Stack

- HTML5 + CSS3 + vanilla JavaScript
- [Tailwind CSS](https://tailwindcss.com) via CDN
- Fully static site — no server, no build tools
- Content managed through manually editable JSON files
- Multi-language support (Italian / English)

---

## Project Structure

```
├── index.html              # Main page
├── css/
│   └── style.css           # Custom styles
├── js/
│   ├── app.js              # Main logic and dynamic rendering
│   └── icons.js            # Inline SVG icon set
├── data/
│   ├── i18n.json           # IT / EN translations
│   ├── changelog.json      # App version history
│   ├── features.json       # Main features
│   ├── kits.json           # Premium in-app kits
│   ├── compatibility.json  # Device compatibility
│   ├── gallery.json        # Screenshots per device
│   └── press.json          # External mentions and videos
├── images/
│   ├── icon/               # App icon
│   ├── banner/             # Hero banner
│   ├── badges/             # App Store badges
│   ├── favicon/            # Favicon
│   ├── kit/                # In-app kit icons
│   ├── qr-code/            # App Store QR code
│   └── screenshots/        # iPhone, iPad, Apple Watch screenshots
├── README.md               # This file
└── RELEASE.md              # Release guide
```

---

## Local Development

No tools required. Just start a static server in the project folder:

```bash
python3 -m http.server 8099
```

Then open `http://localhost:8099` in your browser.

> ⚠️ Opening `index.html` directly via double-click (`file://`) won't work: JSON files are blocked by the browser due to CORS.

---

## Updating Content

All text and data live in the JSON files inside `data/`. You can edit them directly without touching HTML or JS.

For details on what to do for each new app release, see **[RELEASE.md](RELEASE.md)**.

---

## License

© 2021-2026 Fast-Devs Project by Marco Ricca. All rights reserved.
