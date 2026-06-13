
# EchoQuack | Broadcast Mode

A minimalist, real-time alert system for intimate connections.

## Deployment (Spark Plan)
1. **Firebase App Hosting**: Connect this repository to Firebase App Hosting in the Firebase Console.
2. **Environment Variables**: In the App Hosting dashboard, ensure you add all the variables from `.env.local` to the "Environment Variables" section of your deployment.
3. **The Link**: Firebase will provide a URL (e.g., `echoquack-123.web.app`) once the build finishes.

## Mobile Installation
This app is a **PWA (Progressive Web App)**:
- **Android**: Chrome will prompt you to "Add EchoQuack to Home Screen".
- **iOS**: Tap the **Share** button (box with arrow) in Safari, then scroll down and tap **Add to Home Screen**.

## Setup Instructions
To get the app working with real-time notifications, you need to configure your Firebase credentials in `.env.local`:

### 1. Web App Credentials
- Go to [Firebase Console](https://console.firebase.google.com).
- Click **Project Settings** (the gear icon).
- Scroll down to "Your apps" and select your Web app.
- Copy the `apiKey`, `authDomain`, `projectId`, etc.

### 2. VAPID Key (For Web Push)
- In Project Settings, go to the **Cloud Messaging** tab.
- Scroll down to **Web configuration**.
- Click **Generate Key Pair**.
- Copy the long string and paste it as `NEXT_PUBLIC_FIREBASE_VAPID_KEY="..."`.

### 3. Service Account (For Background Broadcasts)
- In Project Settings, go to the **Service Accounts** tab.
- Click **Generate new private key**.
- Open the downloaded JSON file.
- **Copy the entire content** and paste it as `FIREBASE_SERVICE_ACCOUNT="..."`.
