# Phase 2: PWA Assets & Manifest

**Duration:** 1-2 hours

---

## Overview

Create PWA icons in required sizes and the web app manifest file.

---

## Tasks

### 2.1 Create public/ Directory

Create `public/` folder at project root. Files here are copied to `dist/` during build.

```bash
mkdir -p public
```

---

### 2.2 Generate PWA Icons

Generate from existing `assets/icon.png` (1024x1024):

| File | Size | Purpose |
|------|------|---------|
| `public/icon-192.png` | 192x192 | Standard PWA icon |
| `public/icon-512.png` | 512x512 | Large PWA icon |
| `public/icon-maskable-192.png` | 192x192 | Maskable (add 20% padding) |
| `public/icon-maskable-512.png` | 512x512 | Maskable (add 20% padding) |
| `public/apple-touch-icon.png` | 180x180 | iOS homescreen |

**Maskable icons:** Add safe zone padding (20% on all sides) to prevent clipping on Android adaptive icons.

**Tools for generating icons:**
- ImageMagick: `convert icon.png -resize 192x192 icon-192.png`
- Figma: Export at specific sizes
- Online tools: [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

**Maskable icon safe zone:**
```
Original: 1024x1024
Content area: 800x800 (centered)
Safe zone: 112px padding on all sides
```

---

### 2.3 Copy Favicon

Copy `assets/favicon.png` to `public/favicon.ico` or keep as PNG.

```bash
cp assets/favicon.png public/favicon.ico
```

---

### 2.4 Create Web Manifest

**File:** `public/manifest.json`

Required fields:
- `name`: "DriftLog"
- `short_name`: "DriftLog"
- `description`: "Offline-first workout logging for endurance athletes"
- `start_url`: "/"
- `display`: "standalone"
- `orientation`: "portrait"
- `theme_color`: "#f4a261"
- `background_color`: "#faf4f0"
- `icons`: Array with all icon files, including `purpose: "maskable"` for maskable icons

**Complete manifest.json:**
```json
{
  "name": "DriftLog",
  "short_name": "DriftLog",
  "description": "Offline-first workout logging for endurance athletes",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#f4a261",
  "background_color": "#faf4f0",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

## Validation

After completing this phase:

1. **Files exist in `public/`:**
   ```bash
   ls -la public/
   ```
   Should show:
   - `manifest.json`
   - `icon-192.png`, `icon-512.png`
   - `icon-maskable-192.png`, `icon-maskable-512.png`
   - `apple-touch-icon.png`
   - `favicon.ico` or `favicon.png`

2. **Manifest is valid JSON:**
   ```bash
   cat public/manifest.json | jq .
   ```

3. **Icon dimensions are correct:**
   Use `file` or `identify` command to verify sizes

---

## Files Created

| File | Purpose |
|------|---------|
| `public/manifest.json` | PWA manifest |
| `public/icon-192.png` | Standard PWA icon (192x192) |
| `public/icon-512.png` | Large PWA icon (512x512) |
| `public/icon-maskable-192.png` | Maskable icon (192x192) |
| `public/icon-maskable-512.png` | Maskable icon (512x512) |
| `public/apple-touch-icon.png` | iOS homescreen (180x180) |
| `public/favicon.ico` | Browser tab icon |

---

## Optional Enhancements

### Additional Icon Sizes
For broader compatibility, consider adding:
- 144x144 (Windows tiles)
- 96x96 (Android Chrome)
- 72x72, 48x48 (legacy)

### Splash Screens
For iOS splash screens, add meta tags in `app/+html.tsx`:
```html
<link rel="apple-touch-startup-image" href="/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px)" />
```

---

## Next Phase

[Phase 3: Component Replacements](./03-COMPONENTS.md)
