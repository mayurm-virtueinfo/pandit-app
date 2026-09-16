# CI/CD Pipeline Documentation — PanditApp

This document details the complete CI/CD pipeline implemented for **PanditApp** (`com.panditjiapp.pandit`) using **Fastlane**, **GitHub Actions**, **Firebase App Distribution**, and **Apple TestFlight**.

---

## 1. Distribution Architecture & Scope

| Platform | Environment | Artifact | Distribution Target | Access / Audience |
| :--- | :--- | :--- | :--- | :--- |
| **Android** | Development | APK & AAB | **Firebase App Distribution** | Internal Team (`pandit-dev-testers`) |
| **Android** | Production | APK & AAB | **Firebase App Distribution** | Beta / QA / Stakeholders (`pandit-prod-testers`) |
| **iOS** | Development | IPA (Ad-Hoc / Dev) | **Firebase App Distribution** | Internal Team (`pandit-dev-testers`) |
| **iOS** | Production | IPA (App Store) | **Apple TestFlight** | External / Internal Beta Testers |

### Strict Operational Boundaries
* **NO Google Play Console Uploads:** The pipeline strictly avoids Google Play deployment (`supply` / `upload_to_play_store` is forbidden).
* **NO Public App Store Release:** The iOS production pipeline stops at TestFlight. It **never** submits for public App Store review (`deliver` is forbidden).

---

## 2. Fastlane Structure

Fastlane files are organized in the root `fastlane/` directory:

```
fastlane/
├── Appfile       # App & bundle identifiers, developer team IDs
├── Fastfile      # Platform lanes, build orchestration, distribution rules
└── Pluginfile    # Fastlane plugins (fastlane-plugin-firebase_app_distribution)
```

### Available Lanes

Run lanes via Bundler:

#### Android Lanes
```bash
# Development Builds (distributed to pandit-dev-testers on Firebase)
bundle exec fastlane android build_and_distribute_dev_apk
bundle exec fastlane android build_and_distribute_dev_aab
bundle exec fastlane android development # builds both APK & AAB

# Production Builds (distributed to pandit-prod-testers on Firebase)
bundle exec fastlane android build_and_distribute_prod_apk
bundle exec fastlane android build_and_distribute_prod_aab
bundle exec fastlane android production  # builds both APK & AAB
```

#### iOS Lanes
```bash
# Development Build (distributed to BOTH Apple TestFlight & Firebase App Distribution)
bundle exec fastlane ios development

# Production Build (distributed to BOTH Apple TestFlight & Firebase App Distribution)
bundle exec fastlane ios production
```

---

## 3. GitHub Actions Workflows

All workflows are located under `.github/workflows/`:

| Workflow File | Target | Trigger | Description |
| :--- | :--- | :--- | :--- |
| `android-development-apk.yml` | Android Dev APK | Push to `develop` & `workflow_dispatch` | Builds Dev APK with `.env.development` & distributes to Firebase |
| `android-development-aab.yml` | Android Dev AAB | `workflow_dispatch` (Manual only) | Builds Dev AAB with `.env.development` & distributes to Firebase |
| `android-production-apk.yml` | Android Prod APK | `workflow_dispatch` (Manual only) | Builds Prod APK with `.env.production` & distributes to Firebase |
| `android-production-aab.yml` | Android Prod AAB | `workflow_dispatch` (Manual only) | Builds Prod AAB with `.env.production` & distributes to Firebase |
| `ios-development.yml` | iOS Dev IPA | Push to `develop` & `workflow_dispatch` | Builds Dev IPA with `.env.development` & distributes to **BOTH TestFlight & Firebase** |
| `ios-production.yml` | iOS Prod IPA | `workflow_dispatch` (Manual only) | Builds Prod IPA with `.env.production` & distributes to **BOTH TestFlight & Firebase** |

### Manual Dispatch Inputs (Android Workflows)
- **`version_code`** *(Optional)*: Set a custom integer version code (e.g. `17`, `20`). If left blank, it automatically auto-increments via `(16 + GITHUB_RUN_NUMBER)` ensuring no collision or duplicate build on Firebase.
- **`version_name`** *(Optional)*: Set a custom semantic version string (e.g. `1.0.8`, `1.1.0`). If left blank, it automatically uses the version configured in `build.gradle` (`1.0.7`).
- **`release_notes`** *(Optional)*: Custom release notes or changelog shown to testers in Firebase App Distribution.

### Manual Dispatch Inputs (iOS Workflows)
- **`build_number`** *(Optional)*: Set a custom integer build number (e.g. `22`, `25`). If left blank, Fastlane automatically retrieves the latest build number from Apple TestFlight and auto-increments it by 1 (`latest + 1`)!
- **`version_name`** *(Optional)*: Set a custom marketing version string (e.g. `1.1.0`). If left blank, it automatically uses the version configured in `PanditApp.xcodeproj` (`1.0.9`).
- **`release_notes`** *(Optional)*: Custom release notes or changelog shown in TestFlight and Firebase App Distribution.




---

## 4. GitHub Environments Setup

The workflows are configured with GitHub Environments (`environment: development` and `environment: production`):

1. Go to your GitHub repository > **Settings > Environments**.
2. Click **New environment** and create:
   - `development`
   - `production`
3. *(Optional)* For `production`, you can enable protection rules like **Required reviewers** (build requires human sign-off before running).

### Environment Secrets vs Repository Secrets:
- You can add `ENV_FILE` (or `ENV_DEVELOPMENT` / `ENV_PRODUCTION`) inside each specific environment.
- Global secrets (like `FIREBASE_SERVICE_ACCOUNT_JSON`, `ANDROID_KEYSTORE_PROPERTIES`, `ANDROID_RELEASE_KEYSTORE_BASE64`, etc.) can be placed under **Settings > Secrets and variables > Actions > Repository secrets** so they are shared automatically across all environments!

---

## 5. GitHub Secrets Reference Matrix

Navigate to your GitHub Repository **Settings > Secrets and variables > Actions** (or within **Settings > Environments**):


### A. Environment Configuration
| Secret Name | Required By | Description / Example |
| :--- | :--- | :--- |
| `ENV_DEVELOPMENT` | Dev workflows | Raw contents of `.env.development` |
| `ENV_PRODUCTION` | Prod workflows | Raw contents of `.env.production` |

### B. Firebase App Distribution
| Secret Name | Required By | Description / Example |
| :--- | :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | All workflows | Raw JSON string of the GCP / Firebase Service Account key (Role: *Firebase App Distribution Admin*) |
| `FIREBASE_APP_ID_ANDROID` | Android | *(Optional, defaults to `1:763089003272:android:ef8b3f3f1ab892936342bd`)* |
| `FIREBASE_APP_ID_IOS` | iOS Dev | *(Optional, defaults to `1:763089003272:ios:c172ce64912035c96342bd`)* |
| `FIREBASE_TESTER_GROUPS_DEV` | Dev workflows | *(Optional, defaults to `pandit-dev-testers`)* |
| `FIREBASE_TESTER_GROUPS_PROD` | Prod workflows | *(Optional, defaults to `pandit-prod-testers`)* |

### C. Android Code Signing
| Secret Name | Required By | Description / Example |
| :--- | :--- | :--- |
| `ANDROID_RELEASE_KEYSTORE_BASE64` | Android | Base64-encoded binary string of `release.keystore` |
| `ANDROID_KEYSTORE_PROPERTIES` | Android | Raw content of `android/keystore.properties` pointing to `android/app/release.keystore` |

### D. iOS Code Signing & TestFlight
| Secret Name | Required By | Description / Example |
| :--- | :--- | :--- |
| `IOS_BUILD_CERTIFICATE_BASE64` | iOS Dev | Base64-encoded Apple Development or Ad-Hoc `.p12` certificate |
| `IOS_BUILD_CERTIFICATE_PASSWORD` | iOS Dev | Password used when exporting the `.p12` file |
| `IOS_PROVISIONING_PROFILE_DEV_BASE64` | iOS Dev | Base64-encoded Development or Ad-Hoc `.mobileprovision` file |
| `IOS_DISTRIBUTION_CERTIFICATE_BASE64` | iOS Prod | Base64-encoded Apple Distribution `.p12` certificate |
| `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD` | iOS Prod | Password used when exporting the Distribution `.p12` file |
| `IOS_PROVISIONING_PROFILE_PROD_BASE64` | iOS Prod | Base64-encoded App Store `.mobileprovision` file |
| `APP_STORE_CONNECT_API_KEY_KEY_ID` | iOS Prod | App Store Connect API Key ID (e.g. `6VW5M69FV3`) |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID` | iOS Prod | App Store Connect Issuer UUID (from App Store Connect API keys page) |
| `APP_STORE_CONNECT_API_KEY_KEY` | iOS Prod | Private Key string starting with `-----BEGIN PRIVATE KEY-----` |
| `APPLE_TEAM_ID` | iOS workflows | Apple Developer Team ID (10-character alphanumeric ID) |

---

## 5. Helpful Commands to Generate Base64 Secrets

### Convert Files to Base64 on macOS / Linux:

```bash
# Android Keystore
base64 -i android/app/release.keystore | pbcopy

# iOS Certificate (.p12)
base64 -i cert.p12 | pbcopy

# iOS Provisioning Profile (.mobileprovision)
base64 -i profile.mobileprovision | pbcopy
```
*(On Linux, replace `base64 -i file | pbcopy` with `base64 -w 0 file | xclip -selection clipboard`)*

---

## 6. Firebase & TestFlight Tester Group Setup

### Firebase App Distribution
1. Go to **Firebase Console > App Distribution**.
2. Click **Testers & Groups**.
3. Create two groups:
   - `pandit-dev-testers`
   - `pandit-prod-testers`
4. Add tester email addresses to each group. When builds are deployed, testers receive download invites instantly.

### Apple TestFlight
1. Go to **App Store Connect > Apps > PanditApp > TestFlight**.
2. Testers can be added to internal testing groups or public beta links after build processing completes.
