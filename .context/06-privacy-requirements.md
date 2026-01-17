# DriftLog - Privacy Requirements for App Store Submission

## Overview

DriftLog is an **OFFLINE-FIRST** workout logging app with these characteristics:
- ❌ NO user accounts or authentication
- ❌ NO network calls or API connections
- ❌ NO analytics or tracking SDKs
- ❌ NO third-party services
- ❌ NO cloud sync
- ✅ ALL data stored locally in SQLite database
- ✅ Uses AsyncStorage for session persistence

---

## iOS App Store Privacy Requirements

### 1. App Privacy Nutrition Labels

Since DriftLog collects **NO user data**, select:

**"Data Not Collected"**

When filling out App Store Connect privacy questions:
- Data Types: None selected
- Data Linked to You: None
- Data Used to Track You: None

### 2. Privacy Manifests (iOS 17+)

Required declaration for AsyncStorage (UserDefaults API):

**Add to app.json:**
```json
{
  "expo": {
    "ios": {
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
    }
  }
}
```

**Reason Code CA92.1**: "Access info from within the app itself that the user has previously selected."

### 3. App Tracking Transparency

**NOT REQUIRED** for DriftLog because:
- No tracking of user data
- No advertising identifiers used
- No cross-app tracking
- No third-party analytics

### 4. Export Compliance (Encryption)

**Add to app.json:**
```json
{
  "expo": {
    "ios": {
      "config": {
        "usesNonExemptEncryption": false
      },
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    }
  }
}
```

DriftLog uses **NO encryption** that requires export compliance.

---

## Google Play Store Privacy Requirements

### 1. Data Safety Section

When filling out the Data Safety form in Play Console:

**Does your app collect or share any of the required user data types?**
- Select: **"No"**

**Data collection and security practices:**
- Data encrypted in transit: N/A (no network calls)
- Data can be deleted: Yes (uninstall removes all data)
- Committed to Play Families Policy: If targeting children

### 2. Permissions Declaration

DriftLog should have **NO permissions** declared:

```json
{
  "expo": {
    "android": {
      "permissions": [],
      "blockedPermissions": [
        "android.permission.INTERNET",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

**Important**: Block INTERNET permission to prove offline-only nature.

---

## Privacy Policy Requirements

### Why It's Required

Both Apple and Google **REQUIRE** a privacy policy URL, even for apps that collect no data.

### Hosting Options

1. **GitHub Pages** (Free) - Recommended
2. **Notion Public Page** (Free)
3. **Website** (if you have one)

### Privacy Policy Template for DriftLog

```markdown
# DriftLog Privacy Policy

**Last Updated: January 17, 2026**

## Overview

DriftLog ("the App") is a workout logging application that operates 
entirely offline. We are committed to protecting your privacy.

## Data Collection

**We do not collect any personal data.**

The App:
- Does NOT require user accounts
- Does NOT connect to the internet
- Does NOT use analytics or tracking
- Does NOT share data with third parties
- Does NOT store data on external servers

## Data Storage

All workout data is stored locally on your device using SQLite 
database. This data:
- Never leaves your device
- Is not accessible to us or any third party
- Is completely deleted when you uninstall the App

## Third-Party Services

The App does not integrate with any third-party services, 
analytics platforms, or advertising networks.

## Children's Privacy

The App does not knowingly collect information from children 
under 13. As we collect no data, this is not applicable.

## Changes to This Policy

We may update this Privacy Policy. Any changes will be posted 
within the App.

## Contact Us

If you have questions about this Privacy Policy:
Email: privacy@driftlog.app

## Your Rights

Since we collect no data, there is no personal data to access, 
modify, or delete. Uninstalling the App removes all local data.
```

---

## App Store Review Considerations

### Common Rejection Reasons (Privacy-Related)

1. **Missing Privacy Policy URL**
   - Solution: Host and link privacy policy before submission

2. **Privacy Manifest Missing**
   - Solution: Add `privacyManifests` to app.json

3. **Encryption Declaration Missing**
   - Solution: Add `ITSAppUsesNonExemptEncryption: false`

4. **Data Safety Form Incomplete**
   - Solution: Complete all questions in Play Console

### App Review Notes Template

Include in App Store Connect submission notes:

```
This is an offline-first workout logging application.

Privacy Information:
- The app operates entirely offline
- No user accounts are required
- All data is stored locally on the device
- No data is collected, transmitted, or shared
- No analytics or tracking is used
- Uninstalling the app removes all data

The app uses UserDefaults (AsyncStorage) for session 
state persistence, as declared in our privacy manifest.
```

---

## Implementation Checklist

### iOS App Store

- [ ] Add `privacyManifests` to app.json
- [ ] Add `ITSAppUsesNonExemptEncryption: false`
- [ ] Add `usesNonExemptEncryption: false`
- [ ] Create and host privacy policy
- [ ] Complete App Privacy questionnaire in App Store Connect
- [ ] Add review notes explaining offline nature

### Google Play Store

- [ ] Add `blockedPermissions` to block INTERNET
- [ ] Complete Data Safety form
- [ ] Link privacy policy URL
- [ ] Verify no unnecessary permissions

---

## Summary

DriftLog's offline-first, privacy-focused design makes App Store compliance straightforward:

| Requirement | Status |
|-------------|--------|
| iOS Privacy Labels | "Data Not Collected" |
| iOS Privacy Manifest | UserDefaults (CA92.1) only |
| iOS ATT Framework | NOT required |
| iOS Encryption | None (exempt) |
| Android Data Safety | "No data collected" |
| Android Permissions | None required |
| Privacy Policy | Required (template provided) |
