# Soul Pharma Android App — Setup Guide

## Prerequisites
- Node.js 18+
- Android Studio (Hedgehog or newer)
- Android SDK 34
- Java 17

---

## 1. Install dependencies

```bash
cd SoulApp
npm install
```

---

## 2. Add Android platform

```bash
npx cap add android
npx cap sync
```

---

## 3. Copy Kotlin patch files

The `android-patches/` directory contains native Kotlin files that must be
copied into the generated Android project.

Target package directory (replace path if your drive differs):

```
android/app/src/main/java/com/soulpharma/app/
```

Copy these files there:

| Source (android-patches/)      | Destination                                    |
|--------------------------------|------------------------------------------------|
| MainActivity.kt                | .../com/soulpharma/app/MainActivity.kt         |
| SoulTrackerPlugin.kt           | .../com/soulpharma/app/SoulTrackerPlugin.kt    |
| LocationForegroundService.kt   | .../com/soulpharma/app/LocationForegroundService.kt |
| BootReceiver.kt                | .../com/soulpharma/app/BootReceiver.kt         |

---

## 4. Merge AndroidManifest.xml

Open `android/app/src/main/AndroidManifest.xml` and:

1. Add all `<uses-permission>` blocks from `android-patches/AndroidManifest.xml`
   inside the root `<manifest>` tag.

2. Add the `<service>` and `<receiver>` blocks from `android-patches/AndroidManifest.xml`
   inside the `<application>` tag.

---

## 5. Add the notification icon

Create a small 24×24dp white icon and place it at:

```
android/app/src/main/res/drawable/ic_stat_soul.xml
```

Quick placeholder (white circle):

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="#FFFFFF" />
</shape>
```

Or use Android Studio → File → New → Image Asset → Notification Icons and
name the asset `ic_stat_soul`.

---

## 6. Add Google Play Services (FusedLocation)

Open `android/app/build.gradle` and add inside `dependencies {}`:

```gradle
implementation 'com.google.android.gms:play-services-location:21.2.0'
```

Then sync Gradle (Android Studio → Sync Now).

---

## 7. Build & run

```bash
# Open in Android Studio
npx cap open android

# Or run directly (device must be connected / emulator running)
npx cap run android
```

---

## Architecture overview

```
WebView (www/assets/js/app.js)
    │
    │  window.Capacitor.Plugins.SoulTracker.startService({ token, empId, empName })
    ▼
SoulTrackerPlugin.kt  (Capacitor bridge — registers as "SoulTracker")
    │
    │  startForegroundService(Intent → ACTION_START)
    ▼
LocationForegroundService.kt  (Android Foreground Service)
    ├── FusedLocationProviderClient  → location every 5 min
    ├── POST /api/employee/location  → Render backend
    ├── Persistent notification      → "Soul Pharma — Last synced at HH:MM"
    └── START_STICKY                 → OS restarts if killed

BootReceiver.kt
    └── On BOOT_COMPLETED → restarts LocationForegroundService
        (reads token from CapacitorStorage SharedPreferences)

Token flow:
    WebView login → stores token in localStorage + Capacitor Preferences
    Kotlin reads from SharedPreferences("CapacitorStorage") key="token"
```

---

## Permissions requested at runtime

| Permission                        | When                   | Required |
|-----------------------------------|------------------------|----------|
| ACCESS_FINE_LOCATION              | Permissions screen     | Yes — blocks login |
| ACCESS_BACKGROUND_LOCATION        | After fine location    | Yes — for always-on tracking |
| POST_NOTIFICATIONS                | Permissions screen     | No — recommended |

---

## Troubleshooting

**"Class not found" crash on launch**  
→ Make sure `registerPlugin(SoulTrackerPlugin::class.java)` is in `MainActivity.kt`
  and the file is in the correct package directory.

**Location stops after app is swiped away**  
→ Verify `foregroundServiceType="location"` is in the `<service>` tag in the manifest
  and `FOREGROUND_SERVICE_LOCATION` permission is declared.

**Notification icon shows grey square**  
→ The icon must be a flat white shape on a transparent background (Android design rule).
  Use Android Studio's Image Asset wizard.

**Token not found in Kotlin after login**  
→ Check that `app.js` calls both `localStorage.setItem` and
  `cap("Preferences").set({ key: "token", value: token })` after login succeeds.
