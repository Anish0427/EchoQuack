
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK for Cloud Messaging
// Vercel environment variables will provide the service account JSON
if (!admin.apps.length) {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
    }
  } catch (e) {
    console.error('Failed to initialize Firebase Admin SDK:', e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, token } = body;

    // 1. Subscribe a device to the shared 'quacks' topic
    if (action === 'subscribe' && token) {
      await admin.messaging().subscribeToTopic(token, 'quacks');
      return NextResponse.json({ success: true, message: 'Subscribed to topic' });
    }

    // 2. Broadcast a message to everyone subscribed to the topic
    const message = {
      topic: 'quacks',
      notification: {
        title: 'QUACK!',
        body: 'Quack-e-Quack.',
      },
      webpush: {
        fcmOptions: {
          link: '/',
        },
        notification: {
          icon: 'https://picsum.photos/seed/quack192/192/192',
          badge: 'https://picsum.photos/seed/quackbadge/96/96',
          vibrate: [200, 100, 200],
          tag: 'quack-alert',
          renotify: true,
        }
      },
    };

    await admin.messaging().send(message);
    
    return NextResponse.json({ success: true, message: 'Broadcast triggered' });
  } catch (error) {
    console.error('Broadcast API Error:', error);
    return NextResponse.json({ error: 'Messaging Failed' }, { status: 500 });
  }
}
