
// This is a static Service Worker file for GitHub Pages.
// IMPORTANT: You must manually replace the strings below with your Firebase Config values
// because static files cannot access environment variables at runtime.

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || 'EchoQuack';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    data: { url: '/' }
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
