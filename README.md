# EchoQuack | Broadcast Mode

A minimalist, real-time alert system for intimate connections.

## Setup Instructions

To get the app working with real-time notifications, you need to configure your Firebase credentials:

1.  **Create a Firebase Project** at [console.firebase.google.com](https://console.firebase.google.com).
2.  **Add a Web App** to your project.
3.  **Copy the Config**: In Project Settings > General, scroll down to "Your apps" and copy the `firebaseConfig` values.
4.  **Update `.env.local`**: Open the `.env.local` file in the root of this project and paste your values.
5.  **VAPID Key (For Notifications)**: 
    - Go to Project Settings > Cloud Messaging.
    - Under "Web configuration", click "Generate Key Pair" for Web Push certificates.
    - Copy this key and paste it as `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in your `.env.local`.

## Features
- **Global Broadcast**: One tap alerts every device with the app open.
- **Real-time Sync**: Uses Firestore `onSnapshot` for instant foreground sound triggers.
- **Background Support**: Configured to use Firebase Cloud Messaging (FCM) for push notifications.
