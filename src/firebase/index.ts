
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Validates the Firebase configuration and initializes services.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
} {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null };
  }

  const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

  if (!hasConfig) {
    console.warn('Firebase configuration is missing or incomplete.');
    return { firebaseApp: null, auth: null };
  }

  try {
    const firebaseApp =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, auth };
  } catch (error) {
    console.error('Error initializing Firebase services:', error);
    return { firebaseApp: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
