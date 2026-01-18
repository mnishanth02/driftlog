# Phase 7: Testing & QA

**Duration:** 2-3 hours

---

## Overview

Comprehensive testing across browsers, PWA installation, and offline functionality.

---

## Browser Testing Matrix

Test in all supported browsers:

| Browser | Version | Test Status |
|---------|---------|-------------|
| Chrome | 102+ | [ ] |
| Safari | 15.4+ | [ ] |
| Firefox | 111+ | [ ] |
| Edge | 102+ | [ ] |

---

## Functional Testing Checklist

### Core Functionality
- [ ] App loads without errors
- [ ] Database initializes successfully
- [ ] Can create new workout session
- [ ] Can add exercises to session
- [ ] Can complete/uncomplete exercises
- [ ] Can drag and drop to reorder exercises
- [ ] Can end session and save to history
- [ ] History list loads with sessions
- [ ] Can view session details
- [ ] Can add reflections to sessions
- [ ] Routines CRUD works
- [ ] Planning screen works
- [ ] Settings persist across reloads

### Web-Specific
- [ ] Alerts display as modals (not browser alerts)
- [ ] Hover states work on interactive elements
- [ ] No haptics errors in console
- [ ] Layout centered on desktop viewport
- [ ] Responsive at various widths (320px, 768px, 1024px, 1440px)
- [ ] No horizontal scrolling

### PWA
- [ ] Manifest loads (DevTools > Application > Manifest)
- [ ] Service worker registered (DevTools > Application > Service Workers)
- [ ] Install prompt appears (address bar or menu)
- [ ] Can install PWA
- [ ] Installed PWA opens in standalone mode
- [ ] App icon appears correctly
- [ ] Theme color applies to browser chrome

### Offline
- [ ] Go offline (DevTools > Network > Offline)
- [ ] App still loads from cache
- [ ] Can navigate between screens
- [ ] Database operations work offline
- [ ] Can create session while offline
- [ ] Data persists after going back online
- [ ] Service worker caches WASM file

---

## Lighthouse PWA Audit

Run Lighthouse audit in Chrome DevTools:

1. Open DevTools (F12)
2. Go to **Lighthouse** tab
3. Select **Progressive Web App** category
4. Click "Analyze page load"

**Target results:**
- **PWA:** All badges green (Installable, PWA Optimized)
- **Performance:** > 70
- **Accessibility:** > 90
- **Best Practices:** > 90

> **Note:** Lighthouse no longer gives a numeric PWA score. Instead, it shows pass/fail badges for PWA criteria.

**Common issues and fixes:**

| Issue | Fix |
|-------|-----|
| Missing icons | Verify all icon sizes in manifest.json |
| No offline support | Check service worker registration |
| Not installable | Verify manifest linked in HTML |
| HTTP instead of HTTPS | Deploy to HTTPS host |
| Missing theme-color | Add meta tag to +html.tsx |
| Missing viewport meta | Add to +html.tsx |

---

## Browser Compatibility Check

Test unsupported browser behavior:

**Method 1: Use old browser version**
- Find browser older than minimum version
- Load app
- Should see UnsupportedBrowser component

**Method 2: Disable SharedArrayBuffer**
- Open DevTools
- Go to Console
- Type: `delete window.SharedArrayBuffer`
- Reload page
- Should see compatibility error

**Verify:**
- [ ] Clear error message displayed
- [ ] Lists supported browsers with versions
- [ ] Suggests upgrading browser
- [ ] No cryptic JavaScript errors

---

## Console Error Check

In each browser, check console for:
- [ ] No red errors
- [ ] No unhandled promise rejections
- [ ] No React warnings (in development)
- [ ] No deprecation warnings
- [ ] Service worker logs correctly

**Common console checks:**
```
✓ SW registered: ...
✓ Database initialized successfully
✓ No CORS errors
✓ No 404s for assets
✓ WASM loaded successfully
```

---

## Performance Testing

### Load Time
- [ ] Initial load < 3 seconds (3G network)
- [ ] Initial load < 1 second (WiFi)
- [ ] Subsequent loads < 500ms (service worker cache)

### Interaction
- [ ] Navigation between tabs < 500ms
- [ ] List scrolling smooth (60fps, no jank)
- [ ] Drag and drop responsive
- [ ] No input lag in forms

### Tools:**
- Chrome DevTools > Performance tab
- Network tab throttling (Fast 3G, Slow 3G)
- FPS meter in DevTools

---

## Responsive Testing

Test at various viewport widths:

| Viewport | Width | Device | Status |
|----------|-------|--------|--------|
| Mobile S | 320px | iPhone SE | [ ] |
| Mobile M | 375px | iPhone 12 | [ ] |
| Mobile L | 428px | iPhone 12 Pro Max | [ ] |
| Tablet | 768px | iPad | [ ] |
| Laptop | 1024px | MacBook | [ ] |
| Desktop | 1440px | Monitor | [ ] |
| Desktop L | 1920px | Large monitor | [ ] |

**Check at each size:**
- [ ] Content readable
- [ ] No horizontal scroll
- [ ] Buttons tappable/clickable
- [ ] Images scale properly
- [ ] Layout doesn't break

---

## Edge Cases

Test unusual scenarios:

- [ ] Very long session with 50+ exercises
- [ ] Exercise names with special characters (emoji, unicode)
- [ ] Search with special characters
- [ ] Empty states display correctly (no sessions, no routines)
- [ ] Error states display correctly
- [ ] Very long routine names (truncation)
- [ ] Date edge cases (leap year, year boundaries)
- [ ] Rapid interactions (double-click, spam buttons)
- [ ] Browser back/forward navigation

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys work in date pickers

### Screen Reader (Optional)
- [ ] All buttons have labels
- [ ] Form inputs have labels
- [ ] Images have alt text (if any)
- [ ] Semantic HTML used

### Color Contrast
- [ ] Text readable in light mode
- [ ] Text readable in dark mode
- [ ] Run Lighthouse accessibility audit

---

## Cross-Platform Verification

Ensure mobile app still works after PWA changes:

### iOS
- [ ] Run `pnpm ios`
- [ ] App builds successfully
- [ ] All features work
- [ ] No web-only code breaks mobile

### Android
- [ ] Run `pnpm android`
- [ ] App builds successfully
- [ ] All features work
- [ ] No web-only code breaks mobile

**Critical:** Platform abstractions should not affect native builds.

---

## Security Testing

### Headers Check
```bash
curl -I https://your-app.vercel.app
```

Verify headers present:
```
cross-origin-opener-policy: same-origin
cross-origin-embedder-policy: require-corp
```

### Content Security Policy (Optional)
If implementing CSP, verify it doesn't break functionality.

### Local Storage Security
- [ ] No sensitive data in localStorage (acceptable per design)
- [ ] Reflections stored securely (encrypted via existing encryption)

---

## Final Verification

Before marking PWA implementation complete:

1. [ ] All functional tests pass
2. [ ] All 4 browsers tested
3. [ ] Lighthouse PWA badges all green
4. [ ] No console errors
5. [ ] PWA installs successfully
6. [ ] Offline mode works
7. [ ] Mobile (native) apps still work
8. [ ] Deployment successful
9. [ ] COOP/COEP headers confirmed
10. [ ] Documentation updated

---

## Troubleshooting Guide

### Database not working on web

**Symptom:** Errors about SQLite or database initialization

**Check:**
1. COOP/COEP headers present (Network tab)
2. `typeof SharedArrayBuffer !== "undefined"` in console
3. WASM file loaded (Network tab > Filter: wasm)

**Fix:**
- Verify `vercel.json` headers configuration
- Check `metro.config.js` includes WASM in assetExts
- Redeploy if configuration changed

---

### Service worker not registering

**Symptom:** No service worker in DevTools > Application

**Check:**
1. HTTPS enabled (required except localhost)
2. Console for registration errors
3. `/sw.js` exists and accessible

**Fix:**
- Verify `workbox-config.js` configuration
- Check service worker registration code in `+html.tsx`
- Ensure `web:build` script ran successfully

---

### PWA not installable

**Symptom:** No install prompt appears

**Check:**
1. Manifest valid (DevTools > Application > Manifest)
2. All required icons present
3. HTTPS enabled
4. Service worker registered
5. `start_url` accessible

**Fix:**
- Validate `manifest.json` syntax
- Generate missing icon sizes
- Check manifest linked in HTML

---

### Drag and drop not working

**Symptom:** Cannot reorder exercises

**Check:**
1. @dnd-kit packages installed
2. Correct platform file used (SortableList.web.tsx)
3. No JavaScript errors in console

**Fix:**
- Verify platform abstraction in SortableList/index.ts
- Check @dnd-kit setup in SortableList.web.tsx
- Test with console logging

---

### Alerts showing as browser alerts

**Symptom:** Old-style browser alert() instead of modal

**Check:**
1. AlertProvider wrapping app
2. AlertDialog component rendered
3. Components using `useAlert()` hook

**Fix:**
- Verify AlertProvider in `_layout.tsx`
- Check all Alert.alert() replaced with useAlert()
- Test with console logging

---

### Performance issues

**Symptom:** Slow load times, laggy interactions

**Check:**
1. Network tab for large assets
2. Performance tab for bottlenecks
3. Service worker caching effectively

**Fix:**
- Optimize images (compress, resize)
- Enable service worker caching
- Check bundle size with `pnpm web:build`

---

## Testing Checklist Summary

Print this checklist and mark off as you test:

**Setup**
- [ ] Local build works (`pnpm web:build`)
- [ ] Local serve works (`pnpm web:serve`)
- [ ] Production deployed

**Browsers**
- [ ] Chrome 102+
- [ ] Safari 15.4+
- [ ] Firefox 111+
- [ ] Edge 102+

**Core Features**
- [ ] Sessions
- [ ] Exercises
- [ ] Routines
- [ ] History
- [ ] Planning
- [ ] Settings

**Web-Specific**
- [ ] Alerts
- [ ] Hover states
- [ ] Responsive
- [ ] Offline

**PWA**
- [ ] Install
- [ ] Standalone
- [ ] Lighthouse PWA badges green

**Cross-Platform**
- [ ] iOS still works
- [ ] Android still works

---

## Completion

Once all tests pass, the PWA implementation is complete! 🎉

**Next steps:**
1. Monitor production for errors
2. Gather user feedback
3. Iterate on web-specific UX improvements
4. Consider additional optimizations
