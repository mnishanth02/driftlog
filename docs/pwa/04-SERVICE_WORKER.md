# Phase 4: Service Worker & Offline Support

**Duration:** 2 hours

---

## Overview

Configure Workbox to generate a service worker for offline caching.

---

## Tasks

### 4.1 Install Workbox CLI

```bash
pnpm add -D workbox-cli
```

Workbox is Google's library for generating production-ready service workers with smart caching strategies.

---

### 4.2 Create Workbox Configuration

**Create:** `workbox-config.js` at project root

**Configuration:**
```javascript
module.exports = {
  globDirectory: "dist/",
  globPatterns: [
    "**/*.{js,css,html,png,jpg,jpeg,svg,woff,woff2,ttf,ico,json,wasm}"
  ],
  swDest: "dist/sw.js",
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:wasm)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "wasm-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
};
```

**Configuration explanation:**

| Option | Purpose |
|--------|---------|
| `globDirectory` | Source directory for files to cache |
| `globPatterns` | File types to include in precache |
| `swDest` | Output location for service worker |
| `clientsClaim` | Service worker takes control immediately |
| `skipWaiting` | New service worker activates immediately (no waiting) |
| `runtimeCaching` | Custom caching strategy for WASM files |

**Why CacheFirst for WASM:**
- SQLite WASM file is large (~1-2MB)
- Doesn't change frequently
- Critical for offline functionality
- Aggressive caching improves performance

---

### 4.3 Verify Build Scripts

Ensure `package.json` has the web build script (from Phase 1):

```json
{
  "scripts": {
    "web:build": "npx expo export -p web && npx workbox-cli generateSW workbox-config.js",
    "web:serve": "npx serve dist",
    "web:preview": "pnpm web:build && pnpm web:serve"
  }
}
```

**Build process:**
1. `npx expo export -p web` - Exports app to `dist/`
2. `npx workbox-cli generateSW workbox-config.js` - Generates `dist/sw.js`

---

### 4.4 Verify Service Worker Registration

Service worker registration should already be in `public/index.html` (from Phase 1).

**Verify it includes (with localhost check for development):**
```html
<script>
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.error('SW registration failed:', err));
  });
}
</script>
```

---

## Validation

### Test Build Process

```bash
pnpm web:build
```

**Expected output:**
1. Metro bundler exports app
2. `dist/` folder created with:
   - `index.html`
   - JavaScript bundles
   - Assets (icons, fonts, images)
   - WASM files
3. Workbox generates `dist/sw.js`
4. Console shows precached file count

**Verify service worker file:**
```bash
ls -la dist/sw.js
cat dist/sw.js | head -n 20
```

Should see Workbox-generated service worker code.

---

### Test Locally

```bash
pnpm web:serve
```

**Manual testing:**
1. Open browser to `http://localhost:3000` (or port shown)
2. Open DevTools (F12)
3. Go to **Application** tab > **Service Workers**
4. Verify service worker is registered
5. Check **Cache Storage** - should show precached files

**Test offline functionality:**
1. With app loaded, go to **Network** tab
2. Select **Offline** from dropdown
3. Refresh page (Cmd/Ctrl + R)
4. App should still load (from cache)

---

### Service Worker Lifecycle

Understanding the lifecycle helps with debugging:

1. **Register**: Service worker JavaScript downloaded and registered
2. **Install**: Service worker installs, precaches files
3. **Activate**: Service worker takes control of pages
4. **Fetch**: Service worker intercepts network requests

**Workbox configuration impact:**
- `skipWaiting: true` - Skips waiting period, activates immediately
- `clientsClaim: true` - Takes control of pages immediately

This means updates deploy quickly without requiring users to close all tabs.

---

## Troubleshooting

**Issue:** Service worker doesn't register
- **Check:** HTTPS is required (localhost is exempt)
- **Check:** Console for registration errors
- **Fix:** Verify `/sw.js` path is correct

**Issue:** App doesn't work offline
- **Check:** Service worker status in DevTools
- **Check:** Cache storage contains files
- **Fix:** Ensure `globPatterns` includes all required file types

**Issue:** Updates don't deploy
- **Solution:** `skipWaiting: true` and `clientsClaim: true` handle this
- **Fallback:** Users can close all tabs and reopen

**Issue:** WASM file not cached
- **Check:** `runtimeCaching` configuration
- **Check:** Network tab shows WASM file loaded
- **Fix:** Verify WASM files are in dist/ after build

---

## Advanced: Update Notification

Optional enhancement for production:

Show notification when new version is available:

```tsx
// In app/_layout.tsx or similar
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showAlert({
              title: "Update Available",
              message: "A new version is ready. Refresh to update.",
              buttons: [
                { text: "Later", style: "cancel" },
                { text: "Refresh", onPress: () => window.location.reload() }
              ]
            });
          }
        });
      });
    });
  }
}, []);
```

---

## Files

| File | Action |
|------|--------|
| `workbox-config.js` | Created |
| `package.json` | Verified (should be done in Phase 1) |
| `public/index.html` | Verified (should be done in Phase 1) |

---

## Next Phase

[Phase 5: Deployment](./05-DEPLOYMENT.md)
