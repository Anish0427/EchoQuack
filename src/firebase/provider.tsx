
'use client';

import React, { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';

interface FirebaseContextProps {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextProps | undefined>(undefined);

export const FirebaseProvider: React.FC<{
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  children: React.ReactNode;
}> = ({ firebaseApp, auth, children }) => {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useAuth = () => useFirebase().auth;
