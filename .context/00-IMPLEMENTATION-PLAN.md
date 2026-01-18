# DriftLog - App Store Submission Implementation Plan

## Executive Summary

DriftLog v1.0.0 is an **offline-first workout logging application** built with Expo SDK 54 and React Native 0.81.5. This document provides a comprehensive implementation plan to prepare the application for submission to both the **iOS App Store** and **Google Play Store**.

**Current Readiness: 65%** | **Target: 100%** | **Estimated Effort: 12-16 hours**

---

## Table of Contents

1. [Critical Issues (Blocking)](#1-critical-issues-blocking)
2. [High Priority (Required for Submission)](#2-high-priority-required-for-submission)
3. [Medium Priority (Quality Improvements)](#3-medium-priority-quality-improvements)
4. [Low Priority (Polish)](#4-low-priority-polish)
5. [Implementation Checklist](#5-implementation-checklist)
6. [Step-by-Step Guide](#6-step-by-step-guide)

---

## 1. Critical Issues (Blocking)

### 1.1 Missing Babel Plugin for Reanimated

**Status**: 🔴 CRITICAL
**Impact**: Build will fail or animations won't work in production
**Effort**: 5 minutes

**Current `babel.config.js`:**
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
  plugins.push("react-native-reanimated/plugin"); // MUST be last
  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
```

### 1.2 iOS Privacy Manifest (iOS 17+ Requirement)

**Status**: 🔴 CRITICAL
**Impact**: App Store rejection
**Effort**: 10 minutes

Add to `app.json` under `expo.ios`:
```json
"privacyManifests": {
  "NSPrivacyTracking": false,
  "NSPrivacyTrackingDomains": [],
  "NSPrivacyCollectedDataTypes": [],
  "NSPrivacyAccessedAPITypes": [
    {
      "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
      "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
    }
  ]
}
```

### 1.3 iOS Encryption Declaration

**Status**: 🔴 CRITICAL
**Impact**: App Store review delays
**Effort**: 5 minutes

Add to `app.json` under `expo.ios`:
```json
"config": {
  "usesNonExemptEncryption": false
},
"infoPlist": {
  "ITSAppUsesNonExemptEncryption": false,
  "CFBundleDisplayName": "DriftLog",
  "NSHumanReadableCopyright": "© 2026 The Techlete. All rights reserved."
}
```

### 1.4 Privacy Policy URL

**Status**: 🔴 CRITICAL
**Impact**: Both stores require this
**Effort**: 2 hours

- Create privacy policy page (template provided in `.context/06-privacy-requirements.md`)
- Host on GitHub Pages or similar
- Add URL to store listings

---

## 2. High Priority (Required for Submission)

### 2.1 Create eas.json Configuration

**Status**: 🟡 HIGH
**Impact**: Cannot build without this
**Effort**: 30 minutes

Create `eas.json` at project root (see `.context/05-eas-build-guide.md` for full configuration).

### 2.2 Pin Unstable Dependencies

**Status**: 🟡 HIGH
**Impact**: Potential build failures
**Effort**: 10 minutes

Update `package.json`:
```json
{
  "dependencies": {
    "nativewind": "^4.1.23",
    "react-native-css": "^0.0.6"
  }
}
```

### 2.3 App Store Screenshots

**Status**: 🟡 HIGH
**Impact**: Cannot submit without screenshots
**Effort**: 4 hours

**Required iOS Screenshots:**
- 6.7" Display (iPhone 15 Pro Max): 1290×2796 - Minimum 3
- 6.5" Display (iPhone 14 Plus): 1284×2778 - Minimum 3

**Required Android Screenshots:**
- Phone: 1080×1920 minimum - Minimum 2
- Feature Graphic: 1024×500 - Required

### 2.4 App Store Descriptions

**Status**: 🟡 HIGH
**Impact**: Store listing quality
**Effort**: 2 hours

Prepare:
- Short description (80 characters)
- Full description (4000 characters max)
- Keywords (iOS only)
- What's New text

---

## 3. Medium Priority (Quality Improvements)

### 3.1 Dark Mode Splash Screen

**Status**: 🟠 MEDIUM
**Impact**: User experience
**Effort**: 1 hour

Create `assets/splash-dark.png` and update `app.json`:
```json
"ios": {
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#faf4f0",
    "dark": {
      "image": "./assets/splash-dark.png",
      "backgroundColor": "#0f0f0f"
    }
  }
}
```

### 3.2 Android Monochrome Icon

**Status**: 🟠 MEDIUM
**Impact**: Android 13+ themed icons
**Effort**: 30 minutes

Create `assets/adaptive-icon-monochrome.png` (1024×1024, single color) and update:
```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#f4a261",
    "monochromeImage": "./assets/adaptive-icon-monochrome.png"
  }
}
```

### 3.3 App Name Capitalization

**Status**: 🟠 MEDIUM
**Impact**: Brand consistency
**Effort**: 5 minutes

Update `app.json`:
```json
{
  "expo": {
    "name": "DriftLog"
  }
}
```

---

## 4. Low Priority (Polish)

### 4.1 Add Package.json Build Scripts

**Status**: 🟢 LOW
**Impact**: Developer convenience
**Effort**: 10 minutes

Add to `package.json`:
```json
{
  "scripts": {
    "build:dev:sim": "eas build --profile development-simulator --platform ios",
    "build:preview": "eas build --profile preview --platform all",
    "build:prod": "eas build --profile production --platform all",
    "submit:ios": "eas submit --platform ios --profile production",
    "submit:android": "eas submit --platform android --profile production"
  }
}
```

### 4.2 Add .gitignore Entries

**Status**: 🟢 LOW
**Impact**: Security
**Effort**: 5 minutes

Add to `.gitignore`:
```
# EAS Credentials
google-play-service-account.json
.env.local
*.p12
*.mobileprovision
```

---

## 5. Implementation Checklist

### Phase 1: Critical Fixes (Day 1)

- [ ] Fix `babel.config.js` - Add reanimated plugin
- [ ] Update `app.json` - Add iOS privacy manifest
- [ ] Update `app.json` - Add encryption declaration
- [ ] Update `app.json` - Add infoPlist entries
- [ ] Pin `nativewind` version in `package.json`
- [ ] Pin `react-native-css` version in `package.json`
- [ ] Run `ppnpm install` to lock versions
- [ ] Run `ppnpm typecheck` to verify no regressions
- [ ] Run `ppnpm lint` to verify code quality

### Phase 2: EAS Setup (Day 1-2)

- [ ] Install EAS CLI: `pnpm install -g eas-cli`
- [ ] Login: `eas login`
- [ ] Initialize project: `eas project:init`
- [ ] Create `eas.json` configuration
- [ ] Test development build: `eas build --profile development-simulator --platform ios`
- [ ] Test preview build: `eas build --profile preview --platform ios`

### Phase 3: Store Assets (Day 2-3)

- [ ] Verify `icon.png` is 1024×1024 with no transparency
- [ ] Create `splash-dark.png` for dark mode
- [ ] Create `adaptive-icon-monochrome.png` for Android 13+
- [ ] Create feature graphic for Play Store (1024×500)
- [ ] Capture iPhone screenshots (6.7" and 6.5")
- [ ] Capture Android screenshots

### Phase 4: Store Setup (Day 3-4)

- [ ] Create App Store Connect app record
- [ ] Create Google Play Console app record
- [ ] Write privacy policy and host it
- [ ] Write app descriptions (short & full)
- [ ] Upload screenshots to both stores
- [ ] Complete iOS App Privacy questionnaire
- [ ] Complete Android Data Safety form

### Phase 5: Production Build & Submit (Day 4-5)

- [ ] Run production build: `eas build --profile production --platform all`
- [ ] Download and test iOS build on physical device
- [ ] Download and test Android build on physical device
- [ ] Submit iOS build to App Store Connect
- [ ] Submit Android build to Play Console (first submission manual)
- [ ] Complete store submission forms
- [ ] Submit for review

---

## 6. Step-by-Step Guide

### Step 1: Fix Babel Configuration

```bash
# Open babel.config.js and add reanimated plugin
code babel.config.js
```

### Step 2: Update app.json

```bash
# Open app.json and apply all changes
code app.json
```

See the complete recommended `app.json` in `.context/03-app-config-analysis.md`.

### Step 3: Update Dependencies

```bash
# Update package.json
ppnpm add nativewind@^4.1.23 react-native-css@^0.0.6

# Verify installation
ppnpm install

# Check for issues
ppnpm typecheck
ppnpm lint
```

### Step 4: Setup EAS

```bash
# Install EAS CLI globally
pnpm install -g eas-cli

# Login to your Expo account
eas login

# Initialize the project on Expo servers
eas project:init

# Create eas.json (copy from .context/05-eas-build-guide.md)
code eas.json

# Configure build
eas build:configure
```

### Step 5: Test Builds

```bash
# Build for iOS Simulator (fastest for testing)
eas build --profile development-simulator --platform ios

# Once successful, build preview for internal testing
eas build --profile preview --platform all
```

### Step 6: Store Submissions

**iOS App Store:**
1. Go to https://appstoreconnect.apple.com
2. Create new app with bundle ID: `com.driftlog.app`
3. Fill in app information, privacy policy URL
4. Upload screenshots
5. Complete App Privacy questionnaire
6. Build production and submit: `eas build --platform ios --profile production --auto-submit`

**Google Play Store:**
1. Go to https://play.google.com/console
2. Create new app with package: `com.driftlog.app`
3. Complete initial setup checklist
4. Upload screenshots and feature graphic
5. Complete Data Safety form
6. First submission must be manual (upload AAB file)
7. Subsequent submissions can use EAS Submit

---

## Timeline Summary

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1 | Critical Fixes | 2-3 hours |
| Phase 2 | EAS Setup | 2-3 hours |
| Phase 3 | Store Assets | 4-5 hours |
| Phase 4 | Store Setup | 2-3 hours |
| Phase 5 | Build & Submit | 2-3 hours |
| **Total** | | **12-17 hours** |

---

## Files Created in .context/

| File | Description |
|------|-------------|
| `01-architecture-analysis.md` | Complete app architecture review |
| `02-dependencies-analysis.md` | Dependency compatibility analysis |
| `03-app-config-analysis.md` | app.json configuration review |
| `04-build-config-analysis.md` | Build tool configurations |
| `05-eas-build-guide.md` | EAS Build setup and commands |
| `06-privacy-requirements.md` | Privacy policy and compliance |

---

## Quick Commands Reference

```bash
# Development
ppnpm start                    # Start Expo dev server
ppnpm typecheck                # TypeScript check
ppnpm lint                     # Lint check

# EAS Build
eas build --profile development-simulator --platform ios
eas build --profile preview --platform all
eas build --profile production --platform all

# EAS Submit
eas submit --platform ios --profile production
eas submit --platform android --profile production

# Build + Auto Submit
eas build --platform all --profile production --auto-submit
```

---

## Support Resources

- **Expo Documentation**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Play Store Guidelines**: https://developer.android.com/distribute/best-practices/launch/launch-checklist

---

*Document generated: January 17, 2026*
*DriftLog Version: 1.0.0*
*Expo SDK: 54*
