# EchoQuack | Full Broadcast Guide

This app is configured for **Firebase App Hosting**, supporting full background notifications across devices.

## 🚀 Setup & Deployment

### 1. Configure Local Environment
Create a file named `.env.local` in the root of your project and fill in the values from your Firebase Console.

**Where to find the keys:**
- **Client Config**: Project Settings > General > Your Apps.
- **VAPID Key**: Project Settings > Cloud Messaging > Web Push Certificates.
- **Service Account**: Project Settings > Service Accounts > Generate new private key. (Paste the whole JSON content into the `FIREBASE_SERVICE_ACCOUNT` variable).

### 2. Deployment (Firebase App Hosting)
1. Push your code to a GitHub repository.
2. In the Firebase Console, go to **App Hosting** and connect your repository.
3. **Important**: You must add these same environment variables as **Secrets** in the App Hosting dashboard so the live site can see them.

## ✨ Features
- **Instant Quack**: Real-time synchronization via Firestore.
- **Background Alerts**: Receive push notifications even when the browser is closed.
- **PWA Ready**: Tap "Add to Home Screen" on your phone to use it like a real app.

## 🛠 Tech Stack
- **Next.js 15** (App Router)
- **Firebase** (Firestore, Auth, Cloud Messaging)
- **Tailwind CSS** & **ShadCN UI**
- **Lucide Icons**
