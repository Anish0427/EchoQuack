
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { firestore } = initializeFirebase();
    if (!firestore) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
    }

    // 1. Fetch all registered tokens
    // Note: In a large app, you'd use a more efficient batching system.
    // Since only ~2 users are expected, we fetch them all.
    const tokensSnapshot = await getDocs(collection(firestore, 'tokens'));
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'No devices registered' });
    }

    console.log(`Broadcasting QUACK to ${tokens.length} devices.`);

    /**
     * IMPLEMENTATION NOTE:
     * To actually send FCM from the server side, you would typically use 
     * the FCM HTTP v1 API with a Google Service Account.
     * 
     * Example structure (requires process.env.FIREBASE_SERVICE_ACCOUNT):
     * 
     * await Promise.all(tokens.map(token => {
     *   return fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
     *     method: 'POST',
     *     headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ message: { token, notification: { title: 'QUACK!', body: 'Someone quacked!' } } })
     *   });
     * }));
     */

    return NextResponse.json({ success: true, count: tokens.length });
  } catch (error) {
    console.error('Broadcast Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
