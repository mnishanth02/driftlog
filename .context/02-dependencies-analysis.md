# DriftLog Dependencies Analysis - App Store Readiness

## Executive Summary

DriftLog is built on **Expo SDK 54** with **React Native 0.81.5**. The dependency stack is relatively modern and well-suited for production builds. However, there are several areas requiring attention before App Store submission.

---

## 📦 Complete Dependency Analysis

### Core Framework Dependencies

| Package | Version | SDK 54 Compatible | Production Ready | Notes |
|---------|---------|-------------------|------------------|-------|
| `expo` | ^54.0.31 | ✅ Yes | ✅ Yes | Core SDK - latest stable |
| `react` | 19.1.0 | ✅ Yes | ✅ Yes | React 19 stable release |
| `react-native` | 0.81.5 | ✅ Yes | ✅ Yes | Matches SDK 54 requirements |
| `expo-router` | ^6.0.21 | ✅ Yes | ✅ Yes | File-based routing |

### Expo Modules

| Package | Version | Native Module | Permissions Required | Production Notes |
|---------|---------|---------------|---------------------|------------------|
| `expo-sqlite` | ^16.0.10 | ✅ Yes | ❌ None | Local storage only |
| `expo-haptics` | ^15.0.8 | ✅ Yes | ❌ None | No special permissions |
| `expo-constants` | ^18.0.13 | ✅ Yes | ❌ None | Device info access |
| `expo-font` | ^14.0.10 | ✅ Yes | ❌ None | Font loading |
| `expo-linear-gradient` | ~15.0.8 | ✅ Yes | ❌ None | UI only |
| `expo-linking` | ^8.0.11 | ✅ Yes | ❌ None | Deep linking support |
| `expo-splash-screen` | ^31.0.13 | ✅ Yes | ❌ None | Launch screen |
| `expo-status-bar` | ~3.0.9 | ✅ Yes | ❌ None | Status bar styling |

### Animation & Gesture Libraries

| Package | Version | Babel Plugin | Production Considerations |
|---------|---------|--------------|--------------------------|
| `react-native-reanimated` | ~4.1.6 | ⚠️ **Missing** | **Critical: Needs babel plugin** |
| `react-native-gesture-handler` | ~2.28.0 | ❌ N/A | ✅ Properly wrapped in GestureHandlerRootView |
| `react-native-worklets` | 0.5.1 | ✅ Configured | Used by reanimated/draggable-flatlist |

### UI Libraries

| Package | Version | Native Deps | Production Notes |
|---------|---------|-------------|------------------|
| `@shopify/flash-list` | 2.0.2 | ✅ Yes | High-performance list |
| `react-native-calendars` | ^1.1313.0 | ❌ No | JS-only |
| `react-native-draggable-flatlist` | ^4.0.3 | ✅ Yes | Depends on reanimated |
| `react-native-safe-area-context` | ~5.6.2 | ✅ Yes | Required for notch handling |
| `react-native-screens` | ~4.16.0 | ✅ Yes | Native navigation |
| `@expo/vector-icons` | ^15.0.3 | ✅ Yes | Icon library |

### Styling Libraries

| Package | Version | Configuration | Production Notes |
|---------|---------|---------------|------------------|
| `nativewind` | preview | ✅ Metro configured | Using preview channel |
| `tailwindcss` | ^4.1.18 | ✅ PostCSS configured | v4 latest major |
| `@tailwindcss/postcss` | ^4.1.18 | ✅ Configured | PostCSS integration |
| `postcss` | ^8.5.6 | ✅ Yes | Required for TailwindCSS |
| `react-native-css` | latest | ⚠️ `latest` tag | **Should pin to specific version** |
| `lightningcss` | 1.30.1 (override) | ✅ Pinned | Critical for NativeWind stability |

### Data Management

| Package | Version | Production Notes |
|---------|---------|------------------|
| `drizzle-orm` | ^0.45.1 | ✅ Production ready |
| `@react-native-async-storage/async-storage` | 2.2.0 | ✅ Production ready |
| `zustand` | ^5.0.9 | ✅ JS-only state management |
| `date-fns` | ^4.1.0 | ✅ JS-only date utilities |

---

## 🚨 Critical Issues to Address

### 1. Missing Reanimated Babel Plugin

**Severity: HIGH**

The `react-native-reanimated` package requires its Babel plugin for production builds.

**Current babel.config.js:**
```javascript
module.exports = (api) => {
  api.cache(true);
  const plugins = [];
  plugins.push("react-native-worklets/plugin");
  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
```

**Required Fix:**
```javascript
module.exports = (api) => {
  api.cache(true);
  const plugins = [];
  plugins.push("react-native-worklets/plugin");
  plugins.push("react-native-reanimated/plugin"); // Must be last
  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
```

### 2. NativeWind Preview Channel

**Severity: MEDIUM**

Using `"nativewind": "preview"` is risky for production.

**Recommendation:** Pin to the latest stable preview version:
```json
"nativewind": "^4.1.23"
```

### 3. Unpinned `react-native-css`

**Severity: MEDIUM**

Using `"react-native-css": "latest"` can cause unexpected breaking changes.

**Recommendation:** Pin to current resolved version:
```json
"react-native-css": "^0.0.6"
```

---

## 📱 iOS App Store Specific Considerations

### No Special Permissions Required

✅ **Good news:** DriftLog uses no APIs requiring special permissions:
- No camera access
- No location services
- No health data
- No push notifications
- No background processing
- No contacts/calendar access

---

## 🤖 Android Play Store Considerations

### Recommended Android Config Updates

```json
"android": {
  "package": "com.driftlog.app",
  "versionCode": 1,
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#f4a261"
  },
  "permissions": [],
  "blockedPermissions": [
    "android.permission.RECORD_AUDIO",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.ACCESS_FINE_LOCATION"
  ]
}
```

---

## 📋 Pre-Submission Checklist

### Critical (Must Fix)

- [ ] **Add `react-native-reanimated/plugin` to babel.config.js**
- [ ] **Pin `nativewind` to specific version**
- [ ] **Pin `react-native-css` to specific version**

### Recommended

- [ ] Add `blockedPermissions` to Android config
- [ ] Test production build: `eas build --platform ios --profile production`
- [ ] Test on physical devices before submission

---

## 📊 Dependency Risk Matrix

| Risk Level | Count | Dependencies |
|------------|-------|--------------|
| 🔴 High | 1 | Missing reanimated babel plugin |
| 🟡 Medium | 2 | `nativewind` (preview), `react-native-css` (latest) |
| 🟢 Low | 25+ | All other dependencies |

---

## ✅ Summary

**Overall Assessment: READY WITH MINOR FIXES**

DriftLog's dependency stack is well-suited for App Store submission. The architecture follows Expo best practices, and the app requires no special permissions that could cause rejection.

**Priority Actions:**
1. Fix babel.config.js to include reanimated plugin
2. Pin unstable dependency versions
3. Run production build test before submission

The app is **offline-first** with **no network calls**, which simplifies the App Store review process significantly.
