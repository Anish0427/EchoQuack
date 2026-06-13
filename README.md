
# EchoQuack | Deployment Guide

Follow these steps to get your private broadcast app live on the internet for free.

## 1. Firebase Project Setup
1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Create a new project (e.g., "EchoQuack").
3. **Firestore**: Click "Firestore Database" in the sidebar and "Create database". Use **Test Mode** for now.
4. **Cloud Messaging**: 
   - Go to Project Settings (gear icon) > Cloud Messaging.
   - Under "Web configuration", click "Generate Key Pair". This is your **VAPID Key**.

## 2. Deployment (Firebase App Hosting)
Firebase App Hosting is the best way to host Next.js apps.
1. In the Firebase Console sidebar, click **App Hosting**.
2. Click **Get Started** and connect your GitHub repository.
3. Follow the wizard. It will automatically detect your Next.js project.
4. **Environment Variables**: 
   - During setup (or later in the App Hosting dashboard), you **must** add all variables from your `.env.local` file (API Key, Project ID, etc.).
   - Make sure `FIREBASE_SERVICE_ACCOUNT` is a single line wrapped in quotes.

## 3. Install as an App
Once the deployment finishes, Firebase will give you a URL (e.g., `echoquack-123.web.app`).
- **Android**: Open the link in Chrome. A "Add to Home Screen" banner should appear.
- **iOS**: Open the link in Safari. Tap the **Share** button, scroll down, and tap **Add to Home Screen**.

## 4. Environment Variables Checklist
Ensure these are set in your App Hosting dashboard:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (The long string you generated)
- `FIREBASE_SERVICE_ACCOUNT` (The entire JSON string)
