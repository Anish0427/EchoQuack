import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Validates the Firebase configuration and initializes services.
 * Returns null for services if the configuration is invalid or missing.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
} {
  // Always check for window to ensure client-side only
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  // Check if we have at least an API Key and Project ID to attempt initialization
  const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

  if (!hasConfig) {
    console.warn('Firebase configuration is missing or incomplete. Check your environment variables.');
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    const firebaseApp =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // Some services might still fail if specific config parts are missing
    // getAuth specifically throws if apiKey is invalid/missing
    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
