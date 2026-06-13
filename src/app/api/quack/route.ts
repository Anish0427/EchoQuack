
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import * as admin from 'firebase-admin';

// Initialize Admin SDK once
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
    const senderDeviceId = body.senderId || "unknown";

    // 1. Fetch all registered tokens from Firestore
    const tokensSnapshot = await admin.firestore().collection('tokens').get();
    
    // Filter out the sender's own device if possible, but for 2 people, 
    // it's often better to just send to all to confirm broadcast success.
    // However, we'll collect all tokens except potentially specific ones if needed.
    const tokens = tokensSnapshot.docs
      .map(doc => doc.data())
      .filter(data => data.token) // ensure token exists
      .map(data => data.token);

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'No devices registered' });
    }

    // 2. Send Multicast Message
    const message = {
      tokens: tokens,
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

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Broadcast: Sent to ${response.successCount} devices from device ${senderDeviceId}`);

    return NextResponse.json({ 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount 
    });
  } catch (error) {
    console.error('Broadcast API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
