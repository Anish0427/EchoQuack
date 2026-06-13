# EchoQuack | Full Broadcast Guide

This app is configured for **Firebase App Hosting**, supporting full background notifications across devices with zero database logging.

## 🚀 Step 1: Download & Prepare
1.  **Download**: Click the **Download Project** icon (usually at the top right of this studio interface) to get your project as a `.zip` file.
2.  **Unzip**: Extract the files to a folder on your computer.
3.  **Setup Keys**: Create a file named `.env.local` in the root folder and paste your Firebase keys as discussed.

## 🚀 Step 2: Push to GitHub
1.  **Create a Repository**: Go to [GitHub](https://github.com/new) and create a new repository named `echoquack`. Keep it private if you want to protect your code.
2.  **Initialize Git**: Open your terminal in the project folder and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
3.  **Link and Push**:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/echoquack.git
    git branch -M main
    git push -u origin main
    ```

## 🚀 Step 3: Deploy to Firebase App Hosting
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select **App Hosting** from the left-hand menu.
3.  Click **Get Started** and connect your GitHub account.
4.  Select your `echoquack` repository and choose the `main` branch.
5.  **Important: Set Environment Variables (Secrets)**:
    In the App Hosting setup (under the "Secrets" or "Environment Variables" tab), you MUST add the following variables so the live site works:
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`
    *   `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (The long string from Cloud Messaging settings)
    *   `FIREBASE_SERVICE_ACCOUNT` (The entire JSON content from your Service Account file)

## ✨ Features
- **Zero-Log Sync**: No database used. Uses FCM Topics for instant relay.
- **Background Alerts**: Receive quacks even when the browser is closed.
- **PWA Ready**: Tap "Add to Home Screen" on your phone to use it like a real app.

## 🛠 Tech Stack
- **Next.js 15** (App Router)
- **Firebase Admin SDK** (For Background Messaging)
- **Tailwind CSS** & **Lucide Icons**
