# EchoQuack | Broadcast Mode

A minimalist, real-time alert system for intimate connections.

## Setup Instructions

To get the app working with real-time notifications, you need to configure your Firebase credentials in `.env.local`:

### 1. Web App Credentials
- Go to [Firebase Console](https://console.firebase.google.com).
- Click **Project Settings** (the gear icon).
- Scroll down to "Your apps" and select your Web app.
- Copy the `apiKey`, `authDomain`, `projectId`, etc., and paste them into `.env.local` inside double quotes.

### 2. VAPID Key (For Web Push)
- In Project Settings, go to the **Cloud Messaging** tab.
- Scroll down to **Web configuration**.
- Click **Generate Key Pair**.
- Copy the long string and paste it as `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in `.env.local`.

### 3. Service Account (For Background Broadcasts)
- In Project Settings, go to the **Service Accounts** tab.
- Click **Generate new private key**.
- Open the downloaded JSON file.
- Copy the entire content of that JSON file and paste it as `FIREBASE_SERVICE_ACCOUNT` in `.env.local`. 
- *Tip: Ensure the JSON is all on one line or properly escaped in the env file.*

## Features
- **Global Broadcast**: One tap alerts every device with the app open.
- **Real-time Sync**: Uses Firestore `onSnapshot` for instant foreground sound triggers.
- **Background Support**: Uses Firebase Cloud Messaging (FCM) to reach devices when the app is closed.
