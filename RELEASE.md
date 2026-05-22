# Release Guide

Follow these steps every time you publish an app update.

---

## Device Monitor²

### 1. Update the version number

Change the version in **4 places** (find and replace the old number with the new one):

**`device-monitor/js/app.js`**
```js
const CACHE_VER = '26.5.0'; // ← update here
```

**`device-monitor/index.html`**
```html
<link rel="stylesheet" href="css/style.css?v=26.5.0">
<script src="js/icons.js?v=26.5.0"></script>
<script src="js/app.js?v=26.5.0"></script>
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

- [ ] `CACHE_VER` updated in `app.js`
- [ ] `?v=` updated in the 3 lines of `index.html`
- [ ] New entry added at the top of `changelog.json`
- [ ] `"Ultima versione"` badge moved to the new version
- [ ] Modified content JSON files updated

---

## iWindrose²

### 1. Update the version number

**`iwindrose/js/app.js`**
```js
const CACHE_VER = '5.7.2'; // ← update here
```

**`iwindrose/index.html`**
```html
<link rel="stylesheet" href="css/style.css?v=5.7.2">
<script src="js/icons.js?v=5.7.2"></script>
<script src="js/app.js?v=5.7.2"></script>
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

- [ ] `CACHE_VER` updated in `app.js`
- [ ] `?v=` updated in the 3 lines of `index.html`
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
