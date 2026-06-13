'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

/**
 * FirebaseClientProvider ensures Firebase is initialized on the client
 * and provides the context to the rest of the application.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Initialize Firebase eagerly on the client. 
  // initializeFirebase is already guarded against server-side execution.
  const { firebaseApp, firestore, auth } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider 
      firebaseApp={firebaseApp} 
      firestore={firestore} 
      auth={auth}
    >
      {children}
    </FirebaseProvider>
  );
};
