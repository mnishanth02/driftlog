# Reference: Web Compatibility Gaps

This document provides the complete analysis of web compatibility issues found in the DriftLog codebase.

---

## Executive Summary

| Category | Web Ready | Notes |
|----------|-----------|-------|
| Core Framework | 90% | React, Expo, Router support web |
| State Management | 100% | Zustand fully compatible |
| Styling | 95% | NativeWind v5 supports web |
| Database | Needs Setup | expo-sqlite requires OPFS configuration |
| Storage | 80% | AsyncStorage works, SecureStore doesn't |
| UI Components | 70% | FlashList, DraggableFlatList need replacement |
| Animations | 60% | Reanimated has partial support |

**Overall Web Readiness:** ~50% (before implementation)

---

## Critical Blockers

### 1. expo-sqlite (Database Layer)

**Status:** ❌ Requires configuration

**Files affected:**
- `src/core/db/index.ts` (lines 1-2, 11)
- `src/features/session/store.ts` (line 1)
- `src/features/history/store.ts` (line 1)
- `src/features/routines/store.ts` (line 1)

**Issue:** expo-sqlite is native-only by default.

**Solution:** expo-sqlite SDK 54+ supports web via OPFS (Origin Private File System). Requires:
1. Metro configuration to bundle WASM files
2. COOP/COEP headers on server for SharedArrayBuffer
3. Modern browser (Chrome 102+, Safari 15.2+, Firefox 111+, Edge 102+)

**Impact:** **CRITICAL** - App cannot function without database.

---

### 2. @shopify/flash-list

**Status:** ❌ No web support

**File:** `app/(tabs)/history.tsx` (lines 2, 408)

**Issue:** FlashList is a high-performance native list component with no web support.

**Solution:** Conditional rendering with FlatList on web:
```tsx
const ListComponent = Platform.OS === "web" ? FlatList : FlashList;
```

**Impact:** **CRITICAL** - History screen won't render on web.

---

### 3. react-native-draggable-flatlist

**Status:** ❌ No web support

**Files affected:**
- `app/routines/[id].tsx` (lines 19-22, 437-456)
- `app/session/[routineId].tsx` (lines 15-18, 301)

**Issue:** Relies on native gesture recognizers from react-native-gesture-handler.

**Solution:** Use @dnd-kit for cross-platform drag-and-drop:
- Native: Keep react-native-draggable-flatlist
- Web: Implement with @dnd-kit/core and @dnd-kit/sortable

**Impact:** **CRITICAL** - Exercise reordering broken on web.

---

## High Impact Issues

### 4. expo-haptics

**Status:** ⚠️ Requires platform check

**Files affected:**
- `src/components/session/ExerciseRow.tsx` (lines 2, 29)
- `app/routines/[id].tsx` (lines 2, 440, 443)

**Issue:** Tactile feedback API only works on physical devices.

**Solution:** Platform-aware wrapper that no-ops on web:
```typescript
export function triggerHaptic() {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
```

**Impact:** **HIGH** - App will crash or show errors without platform check.

---

### 5. Alert.alert() (23 instances)

**Status:** ⚠️ Limited web functionality

**Files with Alert.alert():**
- `app/session/[routineId].tsx` - 6 instances (lines 79, 113, 135, 153, 175, 211)
- `app/routines/[id].tsx` - 4 instances (lines 118, 143, 181, 195)
- `app/(tabs)/plan.tsx` - 3 instances (lines 150, 159, 176)
- `app/history/[id].tsx` - 2 instances (lines 77, 85)
- `src/core/utils/errors.ts` - 3 instances (lines 134, 145, 168)
- `src/features/session/store.ts` - 6 instances (lines 62, 141, 346, 351, 447, 494)
- `src/components/session/ActiveSessionBanner.tsx` - 1 instance (line 32)
- `src/components/history/InProgressSessionCard.tsx` - 1 instance (line 25)

**Issue:** On web, `Alert.alert()` falls back to `window.alert()` which:
- Doesn't support multiple buttons
- Has inconsistent styling
- Poor UX compared to native

**Solution:** Custom modal-based AlertDialog with React Context:
```tsx
const { showAlert } = useAlert();
showAlert({
  title: "Confirm",
  message: "Are you sure?",
  buttons: [
    { text: "Cancel", style: "cancel" },
    { text: "OK", onPress: handleOk }
  ]
});
```

**Impact:** **HIGH** - Confirmation dialogs won't work properly on web.

---

### 6. expo-secure-store

**Status:** ⚠️ Fallback exists

**Files affected:**
- `src/core/utils/secureStorage.ts` (lines 47, 50-55, 84-103, 129-155, 178-203, 254-280)
- `src/features/session/persistence.ts` (lines 9, 15, 44-50)

**Issue:** Uses native platform secure storage (iOS Keychain, Android EncryptedSharedPreferences).

**Existing mitigation:** Code already has AsyncStorage fallback starting at line 58 in `secureStorage.ts`.

**Impact:** **MEDIUM** - Web data stored unencrypted in localStorage. Acceptable for local-only offline-first app with no accounts.

---

## Medium Impact Issues

### 7. Platform.OS Checks Missing Web

**Status:** ⚠️ Incomplete

**Files with incomplete platform checks:**
- `app/routines/[id].tsx` (lines 73, 335, 475)
- `app/session/[routineId].tsx` (line 271)
- `app/history/[id].tsx` (line 440)

**Current pattern:**
```typescript
// Line 73 in app/routines/[id].tsx
if (Platform.OS !== "android") return;

// Line 335 in app/routines/[id].tsx
behavior={Platform.OS === "ios" ? "padding" : "height"}
```

**Issue:** Code only distinguishes iOS vs Android, doesn't handle web.

**Solution:**
```typescript
// Better pattern
if (Platform.OS === "ios" || Platform.OS === "web") return;

// Keyboard behavior
behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "web" ? undefined : "height"}
```

**Impact:** **MEDIUM** - Keyboard handling and layout behavior incorrect on web.

---

### 8. android_ripple Prop

**Status:** ⚠️ No visual feedback

**Files affected:** Multiple components using `android_ripple` prop on `Pressable`:
- `src/components/ui/BottomSheet.tsx` (line 76)
- `src/components/session/ExerciseRow.tsx` (lines 57, 71)
- `src/components/planning/WeekNavigationRail.tsx` (line 119)
- Many more throughout app

**Issue:** `android_ripple` is Android-only, ignored on web and iOS.

**Solution:** Add CSS-based hover/active states:
```tsx
<Pressable className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700">
```

**Impact:** **LOW** - Visual polish issue, not functional blocker.

---

### 9. No Responsive Design

**Status:** ⚠️ Mobile-only layouts

**Issue:** All layouts designed for mobile viewport widths (375-428px). Will look cramped on desktop.

**Solution:** Hybrid approach:
1. Wrap content in centered container with max-width on web
2. Add responsive breakpoints for key screens
3. Use NativeWind responsive classes: `md:`, `lg:`, etc.

**Impact:** **MEDIUM** - UX issue on larger screens.

---

### 10. Missing Web Configuration

**Status:** ⚠️ Minimal config

**File:** `app.json` (lines 7-9)

**Current config:**
```json
"web": {
  "favicon": "./assets/favicon.png"
}
```

**Missing:**
- No `bundler` specification
- No `output` configuration
- No PWA manifest settings
- No theme color
- No description

**Solution:** Add comprehensive web configuration (see Phase 1).

**Impact:** **MEDIUM** - PWA won't work without proper configuration.

---

### 11. No Custom HTML Shell

**Status:** ⚠️ Missing file

**Issue:** No `app/+html.tsx` file for customizing HTML shell.

**Impact:** Cannot add:
- PWA meta tags
- Manifest link
- Service worker registration
- Custom head elements

**Solution:** Create `app/+html.tsx` (see Phase 1).

**Impact:** **MEDIUM** - PWA features require this file.

---

## Low Impact Issues

### 12. Expo Crypto

**Status:** ✅ Compatible

**File:** `src/core/utils/encryption.ts` (lines 15, 118, 281)

**Issue:** Uses expo-crypto for hashing and encryption.

**Web support:** expo-crypto uses Web Crypto API on web - fully compatible.

**Impact:** **NONE** - Works on web.

---

### 13. React Native Reanimated

**Status:** ⚠️ Partial support

**File:** `src/components/ui/BottomSheet.tsx` (lines 3-8)

**Issue:** react-native-reanimated v4 has experimental web support.

**Impact:** **LOW** - Animations may not be as smooth on web, but should work.

---

### 14. React Native Calendars

**Status:** ⚠️ Limited support

**Files:**
- `src/components/ui/DatePicker.tsx` (line 2)
- `src/components/ui/DateRangePicker.tsx` (line 4)

**Issue:** react-native-calendars has limited web support with potential styling issues.

**Impact:** **LOW** - May need testing, consider web-native date picker as fallback.

---

### 15. Expo Linear Gradient

**Status:** ✅ Compatible

**File:** `src/components/planning/WeekNavigationRail.tsx` (lines 1, 181-194)

**Issue:** None - expo-linear-gradient uses CSS gradients on web.

**Impact:** **NONE** - Works on web.

---

### 16. Safe Area Context

**Status:** ✅ Compatible

**Files:** Multiple screens using `useSafeAreaInsets()`

**Issue:** Returns `{ top: 0, bottom: 0, left: 0, right: 0 }` on web (no safe areas).

**Impact:** **NONE** - Expected behavior, layout may appear slightly different but won't break.

---

### 17. Expo Status Bar

**Status:** ✅ No-op

**Files:** All screen files using `<StatusBar />`

**Issue:** No status bar on web, component is no-op.

**Impact:** **NONE** - Safe to leave as-is.

---

## Package Compatibility Reference

### Full Web Support (✅)

- `@expo/vector-icons` - Via web fonts
- `@react-native-async-storage/async-storage` - Uses localStorage
- `@tailwindcss/postcss` - CSS tool
- `date-fns` - Pure JS
- `drizzle-orm` - Works with web adapter
- `expo` - Full support
- `expo-constants` - Full support
- `expo-crypto` - Web Crypto API
- `expo-font` - Full support
- `expo-linear-gradient` - CSS gradients
- `expo-linking` - Full support
- `expo-router` - Full support
- `nativewind` - Via Tailwind CSS
- `postcss` - CSS tool
- `react` - Full support
- `react-native` - Via react-native-web
- `react-native-calendars` - Full support
- `react-native-safe-area-context` - Full support
- `react-native-screens` - Full support
- `zustand` - Pure JS

### Limited/Partial Support (⚠️)

- `@shopify/flash-list` - Falls back to FlatList on web
- `expo-haptics` - No-op on web (no haptic feedback)
- `expo-splash-screen` - Different behavior on web
- `expo-status-bar` - No-op on web (no status bar)
- `expo-system-ui` - Limited features on web
- `react-native-gesture-handler` - Some gestures work on web
- `react-native-reanimated` - Limited animation support on web

### No Support - Need Replacement (❌)

- `expo-sqlite` - **Needs OPFS configuration** (not replacement)
- `expo-secure-store` - Use AsyncStorage fallback on web
- `react-native-draggable-flatlist` - Replace with @dnd-kit on web
- `react-native-worklets` - Not needed on web

---

## Browser Requirements

For expo-sqlite with OPFS:

| Browser | Minimum Version | OPFS Support | SharedArrayBuffer |
|---------|-----------------|--------------|-------------------|
| Chrome | 102+ | ✅ | ✅ |
| Safari | 15.2+ | ✅ | ✅ |
| Firefox | 111+ | ✅ | ✅ |
| Edge | 102+ | ✅ | ✅ |

**Requirements:**
- `SharedArrayBuffer` support (requires COOP/COEP headers)
- OPFS (Origin Private File System) support
- Modern JavaScript features (ES2020+)

---

## File Change Summary

### Must Create (14 files)

1. `app/+html.tsx` - HTML shell with PWA tags
2. `public/manifest.json` - PWA manifest
3. `public/icon-192.png` - PWA icon
4. `public/icon-512.png` - PWA icon
5. `public/icon-maskable-192.png` - Maskable icon
6. `public/icon-maskable-512.png` - Maskable icon
7. `public/apple-touch-icon.png` - iOS icon
8. `src/core/utils/browserCompat.ts` - Browser detection
9. `src/components/ui/UnsupportedBrowser.tsx` - Error UI
10. `src/core/contexts/AlertContext.tsx` - Alert state
11. `src/components/ui/AlertDialog.tsx` - Alert modal
12. `src/core/utils/haptics.ts` - Haptics wrapper
13. `src/components/ui/VirtualizedList.tsx` - List wrapper
14. `src/components/ui/SortableList/*` - DnD abstraction (4 files)
15. `src/components/ui/WebContainer.tsx` - Responsive container
16. `workbox-config.js` - Service worker config
17. `vercel.json` - Deployment config

### Must Modify (~15 files)

1. `package.json` - Dependencies, scripts
2. `app.json` - Web configuration
3. `metro.config.js` - WASM support
4. `app/_layout.tsx` - Providers, browser check
5. `app/(tabs)/history.tsx` - VirtualizedList
6. `app/routines/[id].tsx` - SortableList, Platform.OS, alerts, haptics
7. `app/session/[routineId].tsx` - SortableList, Platform.OS, alerts
8. `app/(tabs)/plan.tsx` - Alerts
9. `app/history/[id].tsx` - Platform.OS, alerts
10. `src/core/utils/errors.ts` - Alerts
11. `src/features/session/store.ts` - Alerts (special handling)
12. `src/components/session/ExerciseRow.tsx` - Haptics
13. `src/components/session/ActiveSessionBanner.tsx` - Alerts
14. `src/components/history/InProgressSessionCard.tsx` - Alerts
15. `global.css` - Optional responsive breakpoints

---

## Implementation Priority

### Phase 1: Foundation (MUST DO)
- Install web dependencies
- Configure Metro for WASM
- Update app.json
- Create +html.tsx

### Phase 2: Critical Blockers (MUST DO)
- Browser compatibility check
- Replace FlashList
- Replace DraggableFlatList
- Replace Alert.alert()
- Add haptics wrapper

### Phase 3: PWA Setup (MUST DO)
- Create manifest and icons
- Configure service worker
- Deploy with COOP/COEP headers

### Phase 4: Polish (SHOULD DO)
- Responsive design
- Hover states
- Update Platform.OS checks

### Phase 5: Testing (MUST DO)
- Browser testing
- Offline testing
- PWA installation
- Lighthouse audit

---

## Success Criteria

- [ ] App loads on Chrome 102+, Safari 15.2+, Firefox 111+, Edge 102+
- [ ] PWA installable from browser
- [ ] App works offline after installation
- [ ] Database persists across sessions
- [ ] All existing mobile functionality preserved
- [ ] Lighthouse PWA score > 90
- [ ] No console errors
- [ ] iOS and Android builds still work

---

## Related Documentation

- [Phase-by-phase implementation](./README.md)
- [Expo PWA Documentation](https://docs.expo.dev/guides/progressive-web-apps/)
- [expo-sqlite Web Support](https://docs.expo.dev/versions/latest/sdk/sqlite/#web-setup)
- [Project Architecture](../development/ARCHITECTURE.md)
