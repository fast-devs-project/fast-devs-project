# Release Guide

Follow these steps every time you publish an app update.

---

## 1. Update the version number

Change the version in **4 places** (find and replace the old number with the new one):

### `js/app.js` — line ~9
```js
const CACHE_VER = '26.5.0'; // ← update here
```
This automatically busts the cache for all JSON files (features, kits, gallery, etc.).

### `index.html` — lines ~44, ~495, ~496
```html
<link rel="stylesheet" href="css/style.css?v=26.5.0">   <!-- ← update -->
<script src="js/icons.js?v=26.5.0"></script>             <!-- ← update -->
<script src="js/app.js?v=26.5.0"></script>               <!-- ← update -->
```
This forces the browser to reload CSS and JS after the update.

---

## 2. Add the new version to the changelog

Open `data/changelog.json` and insert a new object **at the top** of the array:

```json
{
  "version": "26.6.0",
  "date": "DD/MM/YYYY",
  "badge": "Ultima versione",
  "badge_en": "Latest version",
  "highlights": [
    "Descrizione modifica 1",
    "Descrizione modifica 2"
  ],
  "highlights_en": [
    "Change description 1",
    "Change description 2"
  ]
},
```

Remember to **remove** `"badge": "Ultima versione"` from the previous version (set it to `null`).

The version shown in the hero badge **updates automatically** by reading the first element of the changelog.

---

## 3. Update the content that changed

Depending on what's new in the release, edit the relevant JSON files:

| What changed | File to update |
|---|---|
| New or modified kit | `data/kits.json` |
| New feature | `data/features.json` |
| Price changes | `data/kits.json` |
| New screenshots | `data/gallery.json` + copy images to `images/screenshots/` |
| Device compatibility | `data/compatibility.json` |
| New mention / video | `data/press.json` |

---

## 4. Deploy to GitHub Pages

```bash
# From the project folder:
git add .
git commit -m "Release v26.6.0"
git push
```

GitHub Pages updates automatically within 1-2 minutes after the push.

---

## Quick Checklist

- [ ] `CACHE_VER` updated in `app.js`
- [ ] `?v=` updated in the 3 lines of `index.html`
- [ ] New entry added at the top of `changelog.json`
- [ ] "Ultima versione" badge moved to the new version
- [ ] Modified content JSON files updated
- [ ] Push to GitHub
