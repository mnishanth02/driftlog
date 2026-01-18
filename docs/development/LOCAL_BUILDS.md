# Local builds (no EAS) — DriftLog

This guide documents how to create **local builds** for DriftLog on macOS without using EAS Build.

DriftLog is an Expo (SDK 54) + React Native 0.81 app. In Expo terminology, you can build locally via:

- **Expo CLI run commands** (`pnpx expo run:*`) which will generate native projects (via Prebuild) and compile them locally.
- **Native toolchains** (Xcode / Gradle) after generating the `ios/` and `android/` directories.

> Important: A “production/release” build is not automatically **store-signed** just because it’s built with `--configuration Release` / `--variant release`. Signing is a separate step.


## Project-specific identifiers

From `app.json`:

- iOS bundle identifier: `com.driftlog.app`
- iOS build number: `1`
- Android applicationId/package: `com.driftlog.app`
- Android versionCode: `1`

From `package.json`:

- Expo SDK: `expo@^54.0.31`
- React Native: `0.81.5`
- React: `19.1.0`


## Local build scripts added to this repo

We keep your existing scripts (including EAS scripts) untouched.

New scripts are prefixed with `local:`:

- `ppnpm local:doctor` — sanity check Expo/RN environment
- `ppnpm local:prebuild` — generate native projects (android + ios)
- `ppnpm local:prebuild:clean` — clean regenerate native projects (see note below)
- `ppnpm local:run:android` / `ppnpm local:run:ios` — compile and run debug builds locally
- `ppnpm local:run:android:release` / `ppnpm local:run:ios:release` — compile *unsigned* release builds for device testing
- `ppnpm local:build:android:apk` — Gradle assembleRelease (requires `android/` exists)
- `ppnpm local:build:android:aab` — Gradle bundleRelease (requires `android/` exists)
- `ppnpm local:build:android:install:release` — Gradle installRelease to a connected device
- `ppnpm local:ios:open` — open iOS workspace in Xcode (`xed ios`)

### Why `local:prebuild:clean` is a wrapper

`pnpx expo prebuild --clean` deletes and recreates `ios/` and `android/`. This repo contains an iOS privacy manifest at `ios/PrivacyInfo.xcprivacy`.

The wrapper script (`scripts/local-prebuild-clean.mjs`) backs up that file before cleaning, then restores it afterwards.

References:
- Expo Prebuild / CNG: https://docs.expo.dev/workflow/prebuild/


## Prerequisites (macOS)

### iOS

- Install **Xcode** + Xcode Command Line Tools
- Install **Watchman** (recommended)

Reference:
- Expo environment setup (iOS, local): https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=physical&mode=development-build&buildEnv=local

### Android

- Install **Android Studio** and SDK Platform(s)
- Install **JDK** (Expo docs recommend Azul Zulu 17) and configure `JAVA_HOME`
- Configure `ANDROID_HOME` and ensure `adb` works

Reference:
- Expo environment setup (Android, local): https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build&buildEnv=local


## Path A — Fast local compilation with Expo CLI

This is the easiest route for local builds and debugging.

### Debug build (development)

- Android: `ppnpm local:run:android`
- iOS: `ppnpm local:run:ios`

Expo notes:
- If `android/` or `ios/` is missing, Expo CLI will run Prebuild once to generate them.
- You can target a device using `--device`.

Reference:
- Local app development: https://docs.expo.dev/guides/local-app-development/
- Expo CLI compiling reference: https://docs.expo.dev/more/expo-cli/#compiling

### Release-mode compile (for testing)

- Android release (unsigned): `ppnpm local:run:android:release`
- iOS Release configuration (not store-signed): `ppnpm local:run:ios:release`

Reference:
- Expo CLI `--variant release` / `--configuration Release`: https://docs.expo.dev/more/expo-cli/#compiling


## Path B — “Real” release artifacts (APK/AAB/IPA) via native toolchains

This is what you’ll use when you want a file you can distribute.

### Android: signed APK/AAB (for sharing or store upload)

Expo’s official local production guide (SDK 54 compatible) recommends:

1) Ensure you have `android/` generated
   - Run `ppnpm local:prebuild` (or `ppnpm local:prebuild:clean` if you want a fresh regen)

2) Create an upload key with `keytool` and move it into `android/app/`

3) Add signing variables to `android/gradle.properties`
   - **Do not commit secrets**. Prefer `~/.gradle/gradle.properties` on your machine.

4) Add a release signing config to `android/app/build.gradle`

5) Build an `.aab` via Gradle
   - `ppnpm local:build:android:aab`

References:
- Expo “Create a release build locally”: https://docs.expo.dev/guides/local-app-production/
- Android command-line builds (Gradle wrapper): https://developer.android.com/studio/build/building-cmdline
- Android signing concepts: https://developer.android.com/studio/publish/app-signing

#### Where outputs end up

Typical Gradle outputs:

- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`


### iOS: release archive (Xcode)

For iOS, Apple’s distribution pipeline is fundamentally signing-driven.

Expo’s local production guide:

1) Ensure `ios/` exists (Prebuild)
2) Open the iOS workspace in Xcode
   - `ppnpm local:ios:open`
3) In Xcode: Signing & Capabilities → select your Team
4) Edit Scheme → Run → Build configuration = Release
5) Product → Archive
6) Distribute App

Reference:
- Expo “Create a release build locally”: https://docs.expo.dev/guides/local-app-production/

Apple reference:
- Xcode distribution overview (Archive → Distribute): https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases

#### Reality check: “host on my website” for iOS

Android allows straightforward direct distribution of APKs (with user opt-in). iOS **does not** allow arbitrary installs from a website for general users.

Common iOS distribution options:

- **TestFlight** (requires App Store Connect + Apple Developer Program)
- **Ad Hoc** distribution to registered devices (requires device UDIDs)
- **Enterprise** distribution (Apple Developer Enterprise Program; only for organizations)

If your goal is “download from my site,” that’s typically feasible for **Android**, but for iOS you’ll still be constrained by Apple’s signing + distribution rules.


## Keeping native directories: two recommended workflows

### Option 1: Treat this as a CNG project (regen native folders)

- Keep using Prebuild to generate `ios/` and `android/`.
- Avoid manual edits inside `ios/` and `android/`.
- If you must customize native code, move changes into **config plugins** so regeneration is safe.

Reference:
- Prebuild / CNG: https://docs.expo.dev/workflow/prebuild/

### Option 2: Commit native directories and maintain them

- Once you start customizing signing, Gradle, entitlements, etc., you may choose to commit `ios/` and `android/` and stop running `--clean` regularly.
- This is closer to a “bare React Native” workflow.

Tradeoff: upgrades can get more manual.


## Troubleshooting

### `expo prebuild --clean` wiped something I needed

That’s expected behavior: it deletes and recreates `ios/` and `android/`.

Use `ppnpm local:prebuild:clean` which preserves `ios/PrivacyInfo.xcprivacy`.

### Android: `adb` not found

Make sure `ANDROID_HOME` and your `PATH` include `platform-tools`.

Reference:
- Expo environment setup (Android): https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build&buildEnv=local

### iOS: code signing fails from CLI

Release signing is often easiest to handle directly in Xcode (Signing & Capabilities → Team), then Archive/Distribute.

Reference:
- Apple distribution overview: https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases

