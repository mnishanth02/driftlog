# Phase 1: Foundation Setup

**Duration:** 2-3 hours

---

## Overview

Set up the base requirements for web support including dependencies, Metro configuration for WASM, and custom HTML shell.

---

## Tasks

### 1.1 Install Web Dependencies

```bash
pnpm add react-dom react-native-web @expo/metro-runtime
```

These packages provide:
- `react-dom`: React rendering for web
- `react-native-web`: React Native component implementations for web
- `@expo/metro-runtime`: Metro bundler runtime for web

---

### 1.2 Update app.json

Add comprehensive web configuration to the existing `expo` object:

**File:** `app.json`

Add/update the `web` key with:
- `bundler`: "metro"
- `output`: "single" (SPA mode)
- `favicon`: existing path
- `name`: "DriftLog"
- `shortName`: "DriftLog"
- `description`: "Offline-first workout logging for endurance athletes"
- `themeColor`: "#f4a261" (primary brand color)
- `backgroundColor`: "#faf4f0" (light mode background)
- `lang`: "en"

**Example structure:**
```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/favicon.png",
      "name": "DriftLog",
      "shortName": "DriftLog",
      "description": "Offline-first workout logging for endurance athletes",
      "themeColor": "#f4a261",
      "backgroundColor": "#faf4f0",
      "lang": "en"
    }
  }
}
```

---

### 1.3 Configure Metro for WASM

expo-sqlite web support requires WASM files to be bundled.

**File:** `metro.config.js`

Add `"wasm"` to `config.resolver.assetExts` array.

**Example:**
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Required for expo-sqlite web support (WASM files)
config.resolver.assetExts.push("wasm");

module.exports = withNativewind(config);
```

This allows Metro to bundle the SQLite WASM file that expo-sqlite uses on web.

---

### 1.4 Create Custom HTML Shell

For SPA mode (`"output": "single"`), create the HTML shell using the Expo customize command:

```bash
npx expo customize public/index.html
```

Then modify `public/index.html` to add:

**Required elements:**
1. Standard meta tags (charset, viewport, X-UA-Compatible)
2. PWA meta tags:
   - `theme-color`
   - `description`
   - `apple-mobile-web-app-capable`
   - `apple-mobile-web-app-status-bar-style`
   - `apple-mobile-web-app-title`
3. Link to manifest (`/manifest.json`)
4. Link to apple-touch-icon
5. Service worker registration script

**Service worker registration pattern (with localhost check):**
```javascript
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.error('SW registration failed:', err));
  });
}
```

**Example public/index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  
  <!-- PWA meta tags -->
  <meta name="theme-color" content="#f4a261" />
  <meta name="description" content="Offline-first workout logging for endurance athletes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="DriftLog" />
  
  <!-- Manifest and icons -->
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  
  <title>DriftLog</title>
  
  <!-- Service worker registration -->
  <script>
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('SW registered:', reg.scope))
          .catch(err => console.error('SW registration failed:', err));
      });
    }
  </script>
</head>
<body>
  <!-- Expo will inject the app here -->
</body>
</html>
```

> **Note:** `app/+html.tsx` is for static/server rendering modes. For SPA mode with `"output": "single"`, use `public/index.html` instead.

---

### 1.5 Add Web Scripts to package.json

Add the following scripts:

```json
{
  "scripts": {
    "web": "expo start --web",
    "web:build": "npx expo export -p web && npx workbox-cli generateSW workbox-config.js",
    "web:serve": "npx serve dist",
    "web:preview": "pnpm web:build && pnpm web:serve"
  }
}
```

---

## Validation

After completing this phase:

```bash
pnpm web
```

Should start the web development server. The app may have errors due to incompatible components (addressed in Phase 3), but the server should start.

**Expected output:**
- Metro bundler starts
- Web server available at http://localhost:8081
- May show component errors (FlashList, DraggableFlatList, etc.) - this is expected

---

## Files Changed

| File | Action |
|------|--------|
| `package.json` | Modified (dependencies, scripts) |
| `app.json` | Modified (web config) |
| `metro.config.js` | Modified (WASM support) |
| `public/index.html` | Created |

---

## Troubleshooting

**Issue:** Metro won't start
- Clear cache: `pnpm start --clear`
- Delete `node_modules/.cache`

**Issue:** WASM files not loading
- Verify `assetExts` includes "wasm"
- Restart Metro after config change

---

## Next Phase

[Phase 2: PWA Assets](./02-ASSETS.md)
