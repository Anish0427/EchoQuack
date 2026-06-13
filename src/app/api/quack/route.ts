
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
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
    const { firestore } = initializeFirebase();
    if (!firestore) {
      // Note: During SSR/API routes, client-side initializeFirebase might return null.
      // We rely on standard firebase-admin for server-side firestore if needed.
      return NextResponse.json({ error: 'Firestore not available' }, { status: 500 });
    }

    // 1. Fetch all registered tokens from Firestore
    // In a real broadcast app, you'd use a more scalable approach, 
    // but for 2 users, this is perfect.
    const tokensSnapshot = await admin.firestore().collection('tokens').get();
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

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
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Successfully sent to ${response.successCount} devices. Failures: ${response.failureCount}`);

    return NextResponse.json({ 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount 
    });
  } catch (error) {
    console.error('Broadcast Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
