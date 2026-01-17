# DriftLog App Store Privacy Requirements Guide

> **Last Updated:** January 2026  
> **App Type:** Offline-First, No Network, No Accounts  
> **Status:** Pre-Submission Checklist

This document covers all privacy-related requirements for submitting DriftLog to the iOS App Store and Google Play Store.

---

## Table of Contents
1. [iOS App Store Privacy Requirements](#ios-app-store-privacy-requirements)
2. [Google Play Store Privacy Requirements](#google-play-store-privacy-requirements)
3. [Privacy Policy Template](#privacy-policy-template)
4. [App Store Review Considerations](#app-store-review-considerations)
5. [Implementation Checklist](#implementation-checklist)

---

## iOS App Store Privacy Requirements

### 1. App Privacy Nutrition Labels (App Store Connect)

Apple requires all apps to disclose their data collection practices via "Privacy Nutrition Labels" in App Store Connect. For DriftLog's offline-first architecture:

#### What to Select in App Store Connect

Since DriftLog:
- ❌ Does NOT collect user data
- ❌ Does NOT transmit data off-device
- ❌ Does NOT use third-party analytics
- ❌ Does NOT have user accounts
- ❌ Does NOT use advertising
- ❌ Does NOT track users

**You should select: "Data Not Collected"**

#### Questionnaire Answers

| Question | Answer | Reasoning |
|----------|--------|-----------|
| "Does your app collect any data?" | **No** | All data stays on device in SQLite |
| "Do you or your third-party partners collect data from this app?" | **No** | No network calls, no SDKs that transmit data |
| "Is any data linked to the user's identity?" | **No** | No user accounts exist |
| "Is any data used for tracking?" | **No** | No tracking whatsoever |

#### Definition of "Collect" (Apple's Definition)
> "Collect" refers to transmitting data off the device in a way that allows you and/or your third-party partners to access it for a period longer than what is necessary to service the transmitted request in real-time.

Since DriftLog **never transmits data off-device**, you are not "collecting" data by Apple's definition.

**✅ Action: Select "Data Not Collected" in App Store Connect Privacy section**

---

### 2. Privacy Manifests (iOS 17+)

Starting with iOS 17, Apple requires apps to declare certain "Required Reason APIs" in a privacy manifest file (`PrivacyInfo.xcprivacy`).

#### Required Reason APIs That May Apply to DriftLog

Review if your app or any dependencies use these APIs:

| API Category | DriftLog Usage | Declaration Required? |
|--------------|----------------|----------------------|
| **File timestamp APIs** (`NSFileCreationDate`, `NSFileModificationDate`) | Possibly via SQLite/file system | Check dependencies |
| **System boot time APIs** (`systemUptime`, `mach_absolute_time`) | Possibly for timer | Check dependencies |
| **Disk space APIs** (`volumeAvailableCapacityKey`) | Unlikely | Check dependencies |
| **User defaults APIs** (`NSUserDefaults`) | Yes - AsyncStorage uses this | **Yes - Declare** |
| **Active keyboard APIs** | No | No |

#### Creating the Privacy Manifest

Create `PrivacyInfo.xcprivacy` in your Xcode project's root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Privacy Tracking -->
    <key>NSPrivacyTracking</key>
    <false/>
    
    <!-- No tracking domains since we don't make network calls -->
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    
    <!-- No data collection since everything stays on device -->
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    
    <!-- Required Reason APIs -->
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <!-- UserDefaults API (used by AsyncStorage for settings) -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <!-- CA92.1: Access info from same app, same group -->
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

#### UserDefaults API Reasons (CA92)

DriftLog uses AsyncStorage (which wraps NSUserDefaults) for:
- Session state persistence
- User settings (theme, session duration, etc.)

**Approved Reason Code: `CA92.1`**
> "Declare this reason to access user defaults to read and write information that is only accessible to the app itself."

#### Third-Party SDK Privacy Manifests

If using any of these SDKs, ensure they include their own privacy manifests:

| SDK | Status for DriftLog |
|-----|---------------------|
| expo-sqlite | Check for privacy manifest |
| @react-native-async-storage/async-storage | Check for privacy manifest |
| react-native | Check for privacy manifest |

**✅ Action: Create `PrivacyInfo.xcprivacy` and add to Xcode project**

---

### 3. App Tracking Transparency (ATT)

#### Is ATT Required for DriftLog?

**No.** App Tracking Transparency is only required when:
- You track users across apps/websites owned by other companies
- You share device identifiers with data brokers
- You use advertising identifiers (IDFA)

Since DriftLog:
- ❌ Does NOT track users
- ❌ Does NOT use IDFA
- ❌ Does NOT share data with third parties
- ❌ Does NOT have advertising

**ATT permission prompt is NOT required.**

**✅ Action: Do not implement ATT - it would be misleading to show this prompt**

---

### 4. Export Compliance (Encryption)

#### Does DriftLog Use Encryption?

**SQLite with Expo:**
- Default expo-sqlite does NOT use encryption
- Data is stored in plain SQLite database

**HTTPS/Network:**
- DriftLog makes NO network calls
- No HTTPS encryption to declare

#### App Store Connect Export Compliance Questions

| Question | Answer |
|----------|--------|
| "Does your app use encryption?" | **No** (if using default expo-sqlite) |
| "Does your app qualify for any exemptions?" | N/A if no encryption |
| "Does your app contain, use, or access third-party encryption?" | Check dependencies |

**If you only use standard iOS encryption (HTTPS, which you don't use):**
Select: "Your app is made available only in the US and Canada" OR "Qualifies for exemption"

**✅ Action: Answer "No" to encryption questions (verify dependencies)**

---

### 5. NSPrivacyAccessedAPITypes Configuration

For DriftLog, the only API requiring declaration is likely **UserDefaults** used by AsyncStorage.

#### Full Configuration

```xml
<key>NSPrivacyAccessedAPITypes</key>
<array>
    <!-- UserDefaults API -->
    <dict>
        <key>NSPrivacyAccessedAPIType</key>
        <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
        <key>NSPrivacyAccessedAPITypeReasons</key>
        <array>
            <string>CA92.1</string>
        </array>
    </dict>
</array>
```

#### API Categories Reference

| Category | API | Likely Used By | DriftLog Status |
|----------|-----|----------------|-----------------|
| `NSPrivacyAccessedAPICategoryFileTimestamp` | File modification dates | File operations | Verify |
| `NSPrivacyAccessedAPICategorySystemBootTime` | System boot time | Performance timing | Unlikely |
| `NSPrivacyAccessedAPICategoryDiskSpace` | Disk space checks | Storage management | Unlikely |
| `NSPrivacyAccessedAPICategoryActiveKeyboards` | Active keyboards | Keyboard customization | No |
| `NSPrivacyAccessedAPICategoryUserDefaults` | NSUserDefaults | **AsyncStorage** | **Yes** |

---

## Google Play Store Privacy Requirements

### 1. Data Safety Section

Google Play requires all apps to complete a Data Safety form. For DriftLog:

#### Section 1: Data Collection Overview

| Question | Answer |
|----------|--------|
| "Does your app collect or share any of the required user data types?" | **No** |
| "Is all of the user data collected by your app encrypted in transit?" | **N/A** (no network calls) |
| "Do you provide a way for users to request that their data is deleted?" | **Yes** (user can delete app / clear data) |

#### Section 2: Data Types

For each data type, select "Not collected":

| Data Type | Collected? | Shared? | Notes |
|-----------|------------|---------|-------|
| Location | ❌ No | ❌ No | No location features |
| Personal info | ❌ No | ❌ No | No accounts |
| Financial info | ❌ No | ❌ No | No payments |
| Health and fitness | ❌ No | ❌ No | Workout data stays on device only |
| Messages | ❌ No | ❌ No | No messaging |
| Photos and videos | ❌ No | ❌ No | No media features |
| Audio files | ❌ No | ❌ No | No audio features |
| Files and docs | ❌ No | ❌ No | No file access |
| Calendar | ❌ No | ❌ No | No calendar access |
| Contacts | ❌ No | ❌ No | No contacts access |
| App activity | ❌ No | ❌ No | No analytics |
| Web browsing | ❌ No | ❌ No | No web views |
| App info and performance | ❌ No | ❌ No | No crash reporting |
| Device or other IDs | ❌ No | ❌ No | No device identifiers |

#### Section 3: Security Practices

| Question | Answer |
|----------|--------|
| "Is data encrypted in transit?" | N/A - no data transmitted |
| "Can users request data deletion?" | Yes - via app uninstall/data clear |
| "Committed to Play Families Policy?" | N/A unless targeting kids |

**✅ Action: Complete Data Safety form declaring "No data collected"**

---

### 2. Permissions Declaration

DriftLog should require **minimal permissions**:

#### Required Permissions Analysis

| Permission | Required? | Reason |
|------------|-----------|--------|
| `INTERNET` | ❌ **No** | No network calls |
| `ACCESS_NETWORK_STATE` | ❌ **No** | No network features |
| `READ_EXTERNAL_STORAGE` | ❌ **No** | SQLite is internal |
| `WRITE_EXTERNAL_STORAGE` | ❌ **No** | SQLite is internal |
| `VIBRATE` | ⚠️ Optional | Haptic feedback for timers |
| `RECEIVE_BOOT_COMPLETED` | ❌ **No** | No background services |

#### Android Manifest Review

Ensure `AndroidManifest.xml` does not request unnecessary permissions:

```xml
<!-- Minimal permissions for DriftLog -->
<manifest>
    <!-- NO INTERNET permission needed! -->
    <!-- NO STORAGE permissions needed! -->
    
    <!-- Optional: for haptic feedback -->
    <uses-permission android:name="android.permission.VIBRATE" />
</manifest>
```

**✅ Action: Audit AndroidManifest.xml to remove unnecessary permissions**

---

### 3. Privacy Policy Requirements

Google Play requires ALL apps to have a privacy policy, even if they don't collect data.

**Requirements:**
1. Must be publicly accessible (URL)
2. Must clearly state what data is collected (or that none is collected)
3. Must be linked in:
   - Play Console (Store Listing → Privacy Policy URL)
   - Within the app (Settings screen)

---

## Privacy Policy Template

### DriftLog Privacy Policy

Save as `PRIVACY_POLICY.md` and host publicly:

```markdown
# DriftLog Privacy Policy

**Last Updated: [DATE]**
**Effective Date: [DATE]**

## Introduction

DriftLog ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle information in relation to our mobile application, DriftLog (the "App").

## Summary

**DriftLog does not collect, store, or transmit any personal data to external servers.** All workout data you create is stored locally on your device only.

## Information Collection

### Data We DO NOT Collect

DriftLog is designed as a completely offline application. We do not collect, access, or transmit:

- Personal information (name, email, phone number)
- Location data
- Device identifiers
- Usage analytics
- Crash reports
- Health data to external servers
- Any data to third-party services

### Data Stored Locally on Your Device

The App stores workout data locally on your device using SQLite database:

- Workout sessions and exercises
- Set information (reps, weight)
- Workout routines you create
- App preferences (theme, session duration)

**This data never leaves your device** and is not accessible to us or any third parties.

## Data Storage and Security

All data is stored locally on your device using:
- SQLite database for workout data
- AsyncStorage for app preferences

Data remains on your device until you:
- Delete the app
- Clear the app's data through your device settings
- Manually delete entries within the app

## Third-Party Services

DriftLog does not integrate with any third-party services including:
- Analytics platforms
- Advertising networks
- Cloud storage providers
- Social media platforms
- Crash reporting services

## User Accounts

DriftLog does not require or offer user account creation. There is no login, registration, or authentication of any kind.

## Children's Privacy

DriftLog does not knowingly collect any information from anyone, including children under 13 years of age. Since no data is collected or transmitted, there is no children's data to protect. The App is suitable for users of all ages.

## Data Deletion

Since all data is stored locally on your device, you have complete control over your data:

1. **Delete individual entries**: Use the delete functions within the app
2. **Delete all data**: Clear the app's data in your device settings
3. **Complete removal**: Uninstall the app

We cannot delete your data because we do not have access to it.

## International Users

DriftLog functions identically regardless of your location. Since no data is transmitted, there are no cross-border data transfers or international data processing concerns.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy.

## Your Rights

Since we do not collect any personal data, traditional data subject rights (access, correction, deletion, portability) are not applicable in the traditional sense. However, you maintain complete control over all data stored locally on your device.

## Contact Us

If you have questions about this Privacy Policy, please contact us at:

- **Email**: [YOUR_EMAIL]
- **Website**: [YOUR_WEBSITE]

## California Privacy Rights (CCPA)

DriftLog does not sell personal information because we do not collect personal information.

## European Privacy Rights (GDPR)

DriftLog does not process personal data as defined under GDPR because no personal data is collected or transmitted from your device.

---

© [YEAR] [YOUR_COMPANY_NAME]. All rights reserved.
```

### Hosting Recommendations

| Option | Pros | Cons | Recommended For |
|--------|------|------|-----------------|
| **GitHub Pages** | Free, reliable, HTTPS | Requires GitHub account | Indie developers |
| **Notion Public Page** | Free, easy to update | Less professional URL | Quick setup |
| **Your Website** | Professional | Hosting costs | Established developers |
| **Firebase Hosting** | Free tier, fast | More setup | Technical developers |

#### Quick GitHub Pages Setup

1. Create a public repository (e.g., `driftlog-privacy`)
2. Add `index.html` with privacy policy content
3. Enable GitHub Pages in repository settings
4. URL: `https://yourusername.github.io/driftlog-privacy`

**✅ Action: Create and host privacy policy at a public URL**

---

## App Store Review Considerations

### 1. Common Rejection Reasons Related to Privacy

| Rejection Reason | Risk for DriftLog | Mitigation |
|------------------|-------------------|------------|
| Missing privacy policy | Medium | Add privacy policy URL |
| Incorrect privacy nutrition labels | Low | Accurately declare "No data collected" |
| Missing privacy manifest | Medium | Create PrivacyInfo.xcprivacy |
| Requesting unnecessary permissions | Low | Audit permissions |
| Privacy practice mismatch | Low | Ensure declarations match app behavior |
| No visible privacy info in app | Medium | Add privacy policy link in Settings |

### 2. Privacy Questionnaire Best Practices

#### Questions You May Be Asked

**Q: "Your app appears to collect fitness/health data. Please explain."**

**A:** "DriftLog stores workout data (exercises, sets, reps) locally on the user's device using SQLite. This data never leaves the device and is not transmitted to any server. Users have complete control over this data and can delete it at any time. The app has no network capabilities and makes no API calls."

**Q: "Does your app track users across apps or websites?"**

**A:** "No. DriftLog does not track users in any way. The app has no analytics, no advertising, no network connectivity, and does not use any device identifiers."

**Q: "How do users delete their data?"**

**A:** "Users can delete their data in three ways:
1. Delete individual workout entries within the app
2. Clear app data through device settings
3. Uninstall the app entirely

Since all data is stored locally, no server-side deletion is required."

### 3. App Review Notes Template

Include in App Store Connect under "Notes for Review":

```
PRIVACY INFORMATION:

DriftLog is a completely offline workout logging app with the following privacy characteristics:

✓ NO user accounts or authentication
✓ NO network calls or API connections
✓ NO analytics or tracking SDKs
✓ NO advertising
✓ NO cloud sync or backup
✓ NO third-party services

All workout data is stored locally on the device using SQLite. The app does not request or use internet permissions.

DATA STORED LOCALLY ONLY:
- Workout sessions
- Exercise and set information
- User preferences (theme, timer settings)

Users can delete all data by clearing app data or uninstalling the app.

PERMISSIONS USED:
- None (or VIBRATE only for haptic feedback)

THIRD-PARTY SDKS:
- Expo SDK (app framework)
- expo-sqlite (local database)
- AsyncStorage (local preferences)
- No SDKs transmit data off-device

If you have any questions about our privacy practices, please contact us.
```

---

## Implementation Checklist

### iOS App Store

- [ ] **App Store Connect Privacy Section**
  - [ ] Navigate to App Privacy section
  - [ ] Select "Data Not Collected"
  - [ ] Save and verify display

- [ ] **Privacy Manifest**
  - [ ] Create `PrivacyInfo.xcprivacy` file
  - [ ] Declare UserDefaults API usage (CA92.1)
  - [ ] Add to Xcode project
  - [ ] Verify in build settings

- [ ] **Export Compliance**
  - [ ] Answer encryption questions
  - [ ] Select appropriate exemption
  - [ ] Document compliance

- [ ] **Privacy Policy**
  - [ ] Create privacy policy document
  - [ ] Host at public URL
  - [ ] Add URL to App Store Connect
  - [ ] Add link in app Settings screen

### Google Play Store

- [ ] **Data Safety Form**
  - [ ] Complete all sections
  - [ ] Declare "No data collected"
  - [ ] Submit for review

- [ ] **Permissions Audit**
  - [ ] Review AndroidManifest.xml
  - [ ] Remove unnecessary permissions
  - [ ] Justify any permissions requested

- [ ] **Privacy Policy**
  - [ ] Add URL to Play Console
  - [ ] Verify accessibility
  - [ ] Add link in app Settings screen

### In-App Privacy

- [ ] **Settings Screen**
  - [ ] Add "Privacy Policy" link
  - [ ] Opens privacy policy URL in browser
  - [ ] Accessible from main navigation

- [ ] **Data Deletion**
  - [ ] Implement "Clear All Data" option
  - [ ] Add confirmation dialog
  - [ ] Document in privacy policy

---

## References

### Apple Documentation
- [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Privacy Manifest Files](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)
- [Required Reason APIs](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api)
- [App Store Review Guidelines - Privacy](https://developer.apple.com/app-store/review/guidelines/#privacy)

### Google Documentation
- [Data Safety Section](https://support.google.com/googleplay/android-developer/answer/10787469)
- [User Data Policy](https://support.google.com/googleplay/android-developer/answer/10144311)

### Privacy Law References
- GDPR (EU General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- COPPA (Children's Online Privacy Protection Act)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial document |

---

**Document Owner:** DriftLog Development Team  
**Review Frequency:** Before each app submission
