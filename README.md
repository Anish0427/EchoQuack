
# EchoQuack | Zero-Log Broadcast Relay

This is a private, real-time communication tool designed for 2 people. It uses Firebase Cloud Messaging (FCM) Topics to relay alerts without ever storing a message log or user data in a database.

## 🚀 Setup Instructions

### 1. Local Configuration
1. **Download the project** and unzip it.
2. Open the project in your code editor (like VS Code).
3. You will see a file named `.env.local`. 
4. Fill in your Firebase keys from the Firebase Console (Project Settings).
5. Open your terminal in the project folder and run:
   ```bash
   npm install
   npm run dev
   ```

### 2. Push to GitHub
1. Create a new repository on GitHub named `echoquack`.
2. In your local terminal, run:
   ```bash
   git init
   git add .
   git commit -m "Initialize EchoQuack"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/echoquack.git
   git push -u origin main
   ```

### 3. Deploy to Firebase App Hosting
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select **App Hosting** from the left-hand menu.
3. Click **Get Started** and connect your GitHub repository.
4. **Important**: In the App Hosting dashboard, go to the "Secrets" or "Environment Variables" tab and add all the keys from your `.env.local` so the live site can send notifications.

## ✨ Key Features
- **PWA Ready**: Visit the site on your phone and tap "Deploy Locally" to install it as an app.
- **Background Alerts**: Receive "Quacks" even when your browser is closed.
- **Privacy First**: No Firestore used. No logs. Just instant relays.
