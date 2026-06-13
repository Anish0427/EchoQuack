
# EchoQuack | GitHub Pages Guide

This app is configured for **Static Hosting**. 

## ⚠️ Important Limitation
Because GitHub Pages is a static host, the **background notification** feature (sending alerts when the app is closed) is not supported. The app will only "Quack" if it is currently **open** in your browser.

## Deployment Steps
1. **Firebase Config**: Ensure your `.env.local` keys are set.
2. **Service Worker**: Open `public/firebase-messaging-sw.js` and manually paste your Firebase configuration keys into the `firebase.initializeApp` section.
3. **Build**: Run `npm run build`. This will generate an `out` folder.
4. **Deploy**: Upload the contents of the `out` folder to your GitHub repository's `gh-pages` branch.

## Installation
- **iOS**: Open the link in Safari, tap **Share** > **Add to Home Screen**.
- **Android**: Open the link in Chrome, tap the menu > **Install App**.
