# DriftLog - EAS Build & Submit Configuration Guide

## Overview

This guide provides complete EAS Build configuration for DriftLog with profiles for development, preview (internal testing), and production (App Store/Play Store) builds.

---

## eas.json Configuration

Create this file at the project root:

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote",
    "promptToConfigurePushNotifications": false
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "env": {
        "APP_ENV": "development"
      },
      "channel": "development"
    },
    "development-simulator": {
      "extends": "development",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "APP_ENV": "preview"
      },
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "APP_ENV": "production"
      },
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal",
        "releaseStatus": "draft",
        "changesNotSentForReview": true
      }
    }
  }
}
```

---

## First-Time Setup Commands

### 1. Install EAS CLI

```bash
pnpm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Initialize Project on Expo Servers

```bash
eas project:init
```

### 4. Configure Build

```bash
eas build:configure
```

---

## Build Commands

### Development Builds

```bash
# iOS Simulator
eas build --profile development-simulator --platform ios

# iOS Device (requires Apple Developer account)
eas build --profile development --platform ios

# Android APK
eas build --profile development --platform android
```

### Preview Builds (Internal Testing)

```bash
# Both platforms
eas build --profile preview --platform all

# iOS only
eas build --profile preview --platform ios

# Android only
eas build --profile preview --platform android
```

### Production Builds (App Store/Play Store)

```bash
# Both platforms
eas build --profile production --platform all

# iOS only
eas build --profile production --platform ios

# Android only
eas build --profile production --platform android
```

---

## Submission Commands

### iOS App Store

```bash
# Submit latest iOS production build
eas submit --platform ios --profile production

# Submit specific build
eas submit --platform ios --id BUILD_ID

# Build and auto-submit
eas build --platform ios --profile production --auto-submit
```

### Google Play Store

```bash
# Submit latest Android production build
eas submit --platform android --profile production

# Submit specific build
eas submit --platform android --id BUILD_ID

# Build and auto-submit
eas build --platform android --profile production --auto-submit
```

---

## iOS App Store Submission Prerequisites

### 1. Apple Developer Account
- Cost: $99/year
- Sign up at: https://developer.apple.com/programs/

### 2. App Store Connect Setup
1. Create app record in App Store Connect
2. Get `ascAppId` (Apple ID) from App Information
3. Note your Apple Team ID

### 3. Configure Credentials

```bash
eas credentials --platform ios
```

This will guide you through:
- Creating/selecting distribution certificate
- Creating/selecting provisioning profile
- Configuring App Store Connect API Key

---

## Google Play Store Submission Prerequisites

### 1. Google Play Developer Account
- Cost: $25 one-time
- Sign up at: https://play.google.com/console

### 2. Create App in Play Console
- Create new app
- Complete initial setup

### 3. Create Service Account
1. Go to Google Cloud Console
2. Create new service account
3. Grant "Service Account User" role
4. Download JSON key
5. Save as `google-play-service-account.json`

### 4. First Manual Upload (Required)
- First submission MUST be manual
- Upload AAB from EAS Build to Play Console
- After first upload, EAS Submit can handle subsequent submissions

---

## Recommended package.json Scripts

```json
{
  "scripts": {
    "build:dev": "eas build --profile development --platform all",
    "build:dev:ios": "eas build --profile development --platform ios",
    "build:dev:sim": "eas build --profile development-simulator --platform ios",
    "build:dev:android": "eas build --profile development --platform android",
    "build:preview": "eas build --profile preview --platform all",
    "build:preview:ios": "eas build --profile preview --platform ios",
    "build:preview:android": "eas build --profile preview --platform android",
    "build:prod": "eas build --profile production --platform all",
    "build:prod:ios": "eas build --profile production --platform ios",
    "build:prod:android": "eas build --profile production --platform android",
    "submit:ios": "eas submit --platform ios --profile production",
    "submit:android": "eas submit --platform android --profile production",
    "submit:all": "eas submit --platform all --profile production"
  }
}
```

---

## Pre-Submission Checklist

### Before First Build

- [ ] `eas login` completed
- [ ] `eas project:init` completed
- [ ] Apple Developer account active (for iOS)
- [ ] Google Play Developer account active (for Android)

### Before Production Build

- [ ] `app.json` version updated
- [ ] All code changes committed
- [ ] `ppnpm typecheck` passes
- [ ] `ppnpm lint` passes
- [ ] Tested on physical devices

### Before Submission

- [ ] App Store Connect app record created (iOS)
- [ ] Play Console app created (Android)
- [ ] Privacy policy URL ready
- [ ] Screenshots prepared
- [ ] App description written
