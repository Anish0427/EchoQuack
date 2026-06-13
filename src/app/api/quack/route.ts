
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (e) {
    console.error('Failed to initialize Firebase Admin SDK:', e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'send';
    const token = body.token;

    // 1. Handle Subscription to Topic
    if (action === 'subscribe' && token) {
      await admin.messaging().subscribeToTopic(token, 'quacks');
      return NextResponse.json({ success: true, message: 'Subscribed to broadcast' });
    }

    // 2. Handle Broadcast to Topic
    const message = {
      topic: 'quacks',
      notification: {
        title: 'QUACK!',
        body: 'Someone in your loop is reaching out.',
      },
      webpush: {
        fcmOptions: {
          link: '/',
        },
        notification: {
          icon: 'https://picsum.photos/seed/quack192/192/192',
          badge: 'https://picsum.photos/seed/quackbadge/96/96',
          vibrate: [200, 100, 200],
        }
      },
    };

    await admin.messaging().send(message);
    
    return NextResponse.json({ success: true, message: 'Broadcast sent to topic' });
  } catch (error) {
    console.error('Broadcast API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
