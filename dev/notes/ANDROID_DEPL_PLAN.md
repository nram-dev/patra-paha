# Android Deployment & Testing Guide

This guide covers how to package and test **GAnAmruta Thuli** PWA on Android devices.

## Overview

Since this is a Progressive Web App (PWA), you have two main options:
1. **Test as PWA** - Install directly from browser (easiest)
2. **Package as Native App** - Use Capacitor to create an APK (for Play Store)

---

## Option 1: Testing as PWA (Recommended for Quick Testing)

### Prerequisites
- Android device (tablet recommended for 10" landscape optimization)
- Both your computer and Android device on the same Wi-Fi network
- Chrome browser on Android device

### Steps

#### 1. Build the Production Version

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

#### 2. Update Google OAuth Configuration

Before testing, update your Google Cloud Console OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add your local network IP to **Authorized JavaScript origins**:
   - `http://YOUR_LOCAL_IP:5173` (for dev server)
   - `http://YOUR_LOCAL_IP:4173` (for preview server)
5. Add the same URLs to **Authorized redirect URIs**

**Find your local IP:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

#### 3. Serve the Build Locally

**Option A: Using Vite Preview (Recommended)**

```bash
npm run preview
```

This serves the production build. Note the URL (usually `http://localhost:4173`).

**Option B: Using a Simple HTTP Server**

```bash
# Install http-server globally (if not already installed)
npm install -g http-server

# Navigate to dist folder and serve
cd dist
http-server -p 4173 --host 0.0.0.0
```

The `--host 0.0.0.0` flag makes it accessible from other devices on your network.

#### 4. Access from Android Device

1. On your Android device, open Chrome browser
2. Navigate to: `http://YOUR_COMPUTER_IP:4173`
   - Example: `http://192.168.1.100:4173`
3. The app should load

#### 5. Install as PWA

1. In Chrome on Android, tap the **menu** (three dots)
2. Select **"Add to Home screen"** or **"Install app"**
3. Confirm the installation
4. The app icon will appear on your home screen
5. Launch it - it will run in standalone mode (no browser UI)

#### 6. Test PWA Features

- ✅ Offline functionality (after initial load)
- ✅ Service worker caching
- ✅ IndexedDB storage
- ✅ Google Drive OAuth authentication
- ✅ Responsive layout on tablet
- ✅ Theme switching
- ✅ Font rendering (Tamil/Sanskrit)

---

## Option 2: Package as Native Android App (Using Capacitor)

This creates a native Android APK that can be installed directly or published to Play Store.

### Prerequisites

- **Android Studio** installed
- **Java Development Kit (JDK)** 17 or higher
- **Android SDK** (installed via Android Studio)
- **Node.js** 18+

### Steps

#### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```

When prompted:
- **App name:** GAnAmruta Thuli
- **App ID:** com.ganamruta.thuli (or your preferred reverse domain)
- **Web dir:** dist

#### 2. Build Your App

```bash
npm run build
```

#### 3. Add Android Platform

```bash
npx cap add android
```

This creates an `android/` folder in your project.

#### 4. Configure Android App

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest ...>
    <application
        android:usesCleartextTraffic="true"
        ...>
        <!-- Allow HTTP connections for local testing -->
    </application>
</manifest>
```

**Important:** For production, you'll need HTTPS. Consider:
- Using a local reverse proxy (ngrok, localtunnel)
- Deploying to Firebase Hosting or similar
- Using a self-signed certificate for testing

#### 5. Update Google OAuth for Android

In Google Cloud Console:
1. Create a new **Android** OAuth Client ID (or add to existing)
2. Add your app's package name: `com.ganamruta.thuli`
3. Add SHA-1 fingerprint (see below)

**Get SHA-1 Fingerprint:**

```bash
# For debug keystore (testing)
cd android/app
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release keystore (production)
keytool -list -v -keystore release.keystore -alias release
```

Copy the SHA-1 fingerprint and add it to Google Cloud Console.

#### 6. Update Environment Variables

Create `android/app/src/main/assets/capacitor.config.json` or update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ganamruta.thuli',
  appName: 'GAnAmruta Thuli',
  webDir: 'dist',
  server: {
    androidScheme: 'https', // or 'http' for local testing
    // For local network testing:
    // hostname: 'YOUR_LOCAL_IP',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
    },
  },
};

export default config;
```

#### 7. Sync Capacitor

```bash
npx cap sync android
```

This copies your web assets to the Android project.

#### 8. Open in Android Studio

```bash
npx cap open android
```

This opens the project in Android Studio.

#### 9. Build APK in Android Studio

1. In Android Studio, wait for Gradle sync to complete
2. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
3. Wait for build to complete
4. Click **locate** to find the APK file
5. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 10. Install APK on Android Device

**Option A: Via USB (ADB)**
```bash
# Enable USB debugging on Android device
# Connect device via USB
adb devices  # Verify device is connected
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Option B: Transfer and Install**
1. Copy `app-debug.apk` to your Android device
2. On device, enable **"Install from Unknown Sources"**
3. Open the APK file and install

#### 11. Test the Native App

- Launch the app from home screen
- Test all features (same as PWA testing)
- Check native Android integration

---

## Option 3: Deploy to Web Hosting (Easiest for Testing)

Deploy to a free hosting service and access from Android:

### Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (if not already)
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

After deployment, access from Android:
1. Open Chrome on Android
2. Navigate to your Firebase URL
3. Install as PWA

**Update Google OAuth:**
- Add your Firebase URL to Authorized JavaScript origins
- Add to Authorized redirect URIs

### Other Hosting Options

- **Vercel:** `npm install -g vercel && vercel`
- **Netlify:** Drag and drop `dist` folder to Netlify
- **GitHub Pages:** Use GitHub Actions for automatic deployment

---

## Troubleshooting

### PWA Not Installing

- **Check HTTPS:** PWAs require HTTPS (except localhost)
- **Check manifest:** Verify `manifest.json` is accessible
- **Check service worker:** Open DevTools > Application > Service Workers

### OAuth Not Working

- **CORS errors:** Verify OAuth origins match exactly
- **Redirect URI mismatch:** Check redirect URI in Google Console
- **Network issues:** Ensure device can reach your server

### Build Errors

- **TypeScript errors:** Run `npm run build` and fix any TS errors
- **Missing dependencies:** Run `npm install`
- **Capacitor sync issues:** Delete `android/` folder and re-add platform

### Android Studio Issues

- **Gradle sync failed:** Check internet connection, update Gradle
- **SDK not found:** Install Android SDK via Android Studio
- **Build failed:** Check `android/app/build.gradle` for errors

---

## Production Checklist

Before publishing to Play Store:

- [ ] Update app version in `package.json` and `android/app/build.gradle`
- [ ] Create release keystore for signing
- [ ] Update OAuth configuration with production URLs
- [ ] Test on multiple Android versions (API 21+)
- [ ] Optimize app icons (all required sizes)
- [ ] Test offline functionality thoroughly
- [ ] Verify Google Drive API quotas
- [ ] Add privacy policy URL (required for Play Store)
- [ ] Test on actual 10" tablet device
- [ ] Performance testing (load times, memory usage)

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Capacitor (if using native app)
npx cap sync android           # Sync web assets to Android
npx cap open android           # Open in Android Studio
npx cap run android            # Build and run on connected device

# Testing
# Access from Android: http://YOUR_IP:4173
# Install as PWA from Chrome menu
```

---

## Notes

- **Local Network Testing:** Both devices must be on same Wi-Fi
- **HTTPS Requirement:** PWAs need HTTPS except for localhost
- **OAuth Configuration:** Must match exactly (no trailing slashes)
- **Tablet Optimization:** App is optimized for 10" landscape tablets
- **Offline First:** App caches content in IndexedDB for offline use

---

## Next Steps

1. Start with **Option 1** (PWA testing) for quick validation
2. Use **Option 3** (Web hosting) for easier testing without network setup
3. Use **Option 2** (Native app) only if you need Play Store distribution

For most use cases, the PWA approach (Option 1 or 3) is sufficient and easier to maintain.
