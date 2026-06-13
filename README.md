
# EchoQuack | Full Broadcast Guide

This app is configured for **Firebase App Hosting**, supporting full background notifications.

## 🚀 Deployment Steps (Firebase)

1. **Environment Variables**:
   In your Firebase Console (Project Settings > App Hosting), add the following secrets:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (Web Push Public Key)
   - `FIREBASE_SERVICE_ACCOUNT` (The entire JSON from your Service Account Private Key, wrapped in quotes)

2. **Connect Repo**:
   Connect your GitHub repository to Firebase App Hosting. It will automatically detect Next.js and build the project.

3. **Install as PWA**:
   - **iOS**: Open the URL in Safari, tap **Share** > **Add to Home Screen**.
   - **Android**: Open the URL in Chrome, tap the menu > **Install App**.

## ✨ Features
- **Instant Quack**: Real-time sync via Firestore.
- **Background Alerts**: Receive push notifications even when the browser is closed.
- **No Pairing Needed**: All devices with the app installed join the broadcast loop automatically.
