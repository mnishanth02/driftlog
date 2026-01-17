# DriftLog - EAS Build & Submission Guide

Complete guide for building and submitting DriftLog to the App Store and Google Play Store using Expo EAS Build.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [First-Time Setup](#first-time-setup)
3. [Build Profiles Explained](#build-profiles-explained)
4. [Building the App](#building-the-app)
5. [Submitting to Stores](#submitting-to-stores)
6. [Environment Variables](#environment-variables)
7. [Versioning Strategy](#versioning-strategy)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- **Expo Account**: [expo.dev](https://expo.dev) (free tier works)
- **Apple Developer Account**: $99/year for App Store submission
- **Google Play Developer Account**: $25 one-time fee

### Required Tools

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Verify installation
eas --version
```

### Project Requirements ✅

DriftLog already meets these requirements:
- Expo SDK 54 ✅
- Bundle identifier configured: `com.driftlog.app` ✅
- Android package configured: `com.driftlog.app` ✅
- App icons and splash screens in `assets/` ✅

---

## First-Time Setup

### Step 1: Login to Expo

```bash
eas login
```

### Step 2: Configure EAS for the Project

```bash
# Initialize EAS (already done - eas.json created)
eas build:configure
```

### Step 3: Link Project to Expo Account

```bash
# This creates a project on Expo's servers
eas project:init

# Or link to existing project
eas project:link
```

### Step 4: iOS Credentials Setup

For iOS builds, you need:

```bash
# Option A: Let EAS manage credentials (RECOMMENDED)
# EAS will automatically create/manage certificates and provisioning profiles
# Just run the build and follow prompts

# Option B: Use existing credentials
eas credentials
```

**Apple Developer Portal Setup:**
1. Log into [developer.apple.com](https://developer.apple.com)
2. Create an App ID with bundle identifier: `com.driftlog.app`
3. EAS will handle certificates and provisioning profiles

### Step 5: Android Credentials Setup

For Android builds:

```bash
# Option A: Let EAS manage credentials (RECOMMENDED)
# EAS will generate a keystore automatically on first build

# Option B: Use existing keystore
eas credentials
```

### Step 6: Set Up Environment Variables for Submission

Create a `.env.local` file (DO NOT commit):

```bash
# Apple App Store Connect
APPLE_ID=your-apple-id@email.com
ASC_APP_ID=1234567890  # From App Store Connect
APPLE_TEAM_ID=XXXXXXXXXX  # Your team ID

# These are used during eas submit
```

Or set them as EAS Secrets:

```bash
eas secret:create --scope project --name APPLE_ID --value "your-apple-id@email.com"
eas secret:create --scope project --name ASC_APP_ID --value "1234567890"
eas secret:create --scope project --name APPLE_TEAM_ID --value "XXXXXXXXXX"
```

---

## Build Profiles Explained

### `development` Profile

**Purpose**: Development builds with Expo Dev Client for hot reloading and debugging.

| Setting | Value | Description |
|---------|-------|-------------|
| `developmentClient` | `true` | Includes Expo Dev Client |
| `distribution` | `internal` | For team testing only |
| `ios.simulator` | `false` | Real device build |
| `android.buildType` | `apk` | APK for easy installation |

**Use when**: Daily development on physical devices.

### `development-simulator` Profile

**Purpose**: iOS Simulator builds for local development.

| Setting | Value | Description |
|---------|-------|-------------|
| `developmentClient` | `true` | Includes Expo Dev Client |
| `ios.simulator` | `true` | Simulator architecture |

**Use when**: Testing on iOS Simulator without a physical device.

### `preview` Profile

**Purpose**: Internal testing builds for QA and beta testers.

| Setting | Value | Description |
|---------|-------|-------------|
| `distribution` | `internal` | Ad-hoc distribution |
| `ios` | Ad-hoc provisioning | Limited device installs |
| `android.buildType` | `apk` | Direct APK install |
| `channel` | `preview` | OTA update channel |

**Use when**: Sharing with testers before App Store submission.

### `production` Profile

**Purpose**: Final builds for App Store and Google Play submission.

| Setting | Value | Description |
|---------|-------|-------------|
| `distribution` | `store` | App Store/Play Store |
| `autoIncrement` | `true` | Auto-bump build numbers |
| `android.buildType` | `app-bundle` | AAB for Play Store |
| `channel` | `production` | Production OTA channel |

**Use when**: Submitting to app stores.

---

## Building the App

### Development Builds

```bash
# iOS (physical device)
eas build --profile development --platform ios

# iOS Simulator
eas build --profile development-simulator --platform ios

# Android
eas build --profile development --platform android

# Both platforms
eas build --profile development --platform all
```

### Preview Builds (Internal Testing)

```bash
# iOS (requires registered device UDIDs)
eas build --profile preview --platform ios

# Android
eas build --profile preview --platform android

# Both platforms
eas build --profile preview --platform all
```

### Production Builds

```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android (Play Store)
eas build --profile production --platform android

# Both platforms
eas build --profile production --platform all
```

### Useful Build Options

```bash
# Run build locally (requires Xcode/Android Studio)
eas build --profile development --platform ios --local

# Non-interactive mode (CI/CD)
eas build --profile production --platform all --non-interactive

# Clear cache before building
eas build --profile production --platform ios --clear-cache

# Check build status
eas build:list

# View specific build logs
eas build:view [BUILD_ID]
```

---

## Submitting to Stores

### iOS App Store Submission

#### Step 1: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: DriftLog
   - Primary Language: English
   - Bundle ID: `com.driftlog.app`
   - SKU: `driftlog-ios`

4. Note the **Apple ID** (number) from the app page - this is your `ASC_APP_ID`

#### Step 2: Submit Build

```bash
# Submit the latest production build
eas submit --platform ios --latest

# Or submit a specific build
eas submit --platform ios --id [BUILD_ID]

# Or build and submit in one command
eas build --profile production --platform ios --auto-submit
```

#### Step 3: Complete App Store Listing

In App Store Connect:
- Add screenshots (required sizes: 6.7", 6.5", 5.5" iPhones)
- Write description and keywords
- Set age rating
- Add privacy policy URL
- Submit for review

### Google Play Store Submission

#### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Play Android Developer API**
4. Create a Service Account with **Editor** role
5. Download JSON key file
6. Place as `google-play-service-account.json` in project root

**Important**: Add to `.gitignore`:
```
google-play-service-account.json
```

#### Step 2: Link Service Account to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. **Settings** → **API access**
3. Link your Google Cloud project
4. Grant access to the service account

#### Step 3: Create App in Play Console

1. **All apps** → **Create app**
2. Fill in app details
3. Complete the app setup checklist

#### Step 4: Submit Build

```bash
# Submit to internal testing track (default)
eas submit --platform android --latest

# Submit to specific track
eas submit --platform android --latest --track production

# Build and submit in one command
eas build --profile production --platform android --auto-submit
```

### Combined Build & Submit

```bash
# Build and submit both platforms
eas build --profile production --platform all --auto-submit
```

---

## Environment Variables

### Build-Time Variables

Set in `eas.json` under each profile's `env`:

```json
{
  "build": {
    "production": {
      "env": {
        "APP_ENV": "production",
        "API_URL": "https://api.production.com"
      }
    }
  }
}
```

### Sensitive Secrets (EAS Secrets)

```bash
# Create secrets (stored on Expo servers)
eas secret:create --scope project --name SECRET_KEY --value "xxx"

# List secrets
eas secret:list

# Delete secret
eas secret:delete SECRET_KEY
```

Access in code:
```typescript
const secretKey = process.env.SECRET_KEY;
```

### Local Development

Create `.env.local` for local overrides:

```bash
APP_ENV=development
```

---

## Versioning Strategy

### Automatic Version Increment

With `"autoIncrement": true` in the production profile:

- **iOS**: `buildNumber` increments (1 → 2 → 3)
- **Android**: `versionCode` increments (1 → 2 → 3)

### Manual Version Updates

Update `app.json` for marketing version changes:

```json
{
  "expo": {
    "version": "1.1.0",  // Marketing version
    "ios": {
      "buildNumber": "1"  // Reset for new version
    },
    "android": {
      "versionCode": 10  // Must always increase
    }
  }
}
```

### Version Commands

```bash
# Check current versions
eas build:version:get

# Set versions manually
eas build:version:set --platform ios --build-number 5
eas build:version:set --platform android --version-code 5

# Sync versions from app.json
eas build:version:sync
```

---

## Adding npm Scripts

Add these to `package.json` for convenience:

```json
{
  "scripts": {
    "build:dev": "eas build --profile development --platform all",
    "build:dev:ios": "eas build --profile development --platform ios",
    "build:dev:android": "eas build --profile development --platform android",
    "build:dev:sim": "eas build --profile development-simulator --platform ios",
    "build:preview": "eas build --profile preview --platform all",
    "build:preview:ios": "eas build --profile preview --platform ios",
    "build:preview:android": "eas build --profile preview --platform android",
    "build:prod": "eas build --profile production --platform all",
    "build:prod:ios": "eas build --profile production --platform ios",
    "build:prod:android": "eas build --profile production --platform android",
    "submit:ios": "eas submit --platform ios --latest",
    "submit:android": "eas submit --platform android --latest",
    "submit:all": "eas submit --platform all --latest"
  }
}
```

---

## Troubleshooting

### Common Issues

#### "No matching provisioning profile"

```bash
# Clear iOS credentials and regenerate
eas credentials --platform ios
# Select "Remove" then rebuild
```

#### "Keystore not found"

```bash
# Clear Android credentials and regenerate
eas credentials --platform android
# Select "Remove" then rebuild
```

#### "Build failed - Out of memory"

Add to `eas.json`:
```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-large"
      }
    }
  }
}
```

#### "Native module not compatible"

```bash
# Clear all caches
eas build --profile production --platform ios --clear-cache

# Or rebuild native directories locally
npx expo prebuild --clean
```

#### "Version code already exists" (Android)

```bash
# Increment version code
eas build:version:set --platform android --version-code [NEW_NUMBER]
```

### Debug Commands

```bash
# View project configuration
eas config --platform ios --profile production

# Validate credentials
eas credentials --platform ios

# Check build queue
eas build:list --status in_queue

# Cancel a build
eas build:cancel [BUILD_ID]
```

### Getting Help

```bash
# EAS CLI help
eas --help
eas build --help

# Check EAS status
# https://status.expo.dev
```

---

## Quick Reference Card

### First Time Setup
```bash
npm install -g eas-cli
eas login
eas project:init
```

### Daily Development
```bash
# iOS Simulator
eas build --profile development-simulator --platform ios

# Physical device
eas build --profile development --platform ios
```

### Internal Testing
```bash
eas build --profile preview --platform all
```

### App Store Release
```bash
# Build
eas build --profile production --platform all

# Submit
eas submit --platform all --latest

# Or combined
eas build --profile production --platform all --auto-submit
```

---

## Checklist Before Submission

### iOS App Store

- [ ] App icon (1024x1024, no transparency)
- [ ] Screenshots for all required device sizes
- [ ] App description (4000 chars max)
- [ ] Keywords (100 chars max)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating completed
- [ ] App category selected

### Google Play Store

- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (min 2, max 8 per device type)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Target audience declaration
- [ ] Data safety form completed

---

*Last updated: January 2026*
*Expo SDK: 54 | EAS CLI: 16.x*
