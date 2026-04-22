/**
 * Firebase configuration — initialized once, imported everywhere.
 *
 * Environment variables are validated at load time so that missing
 * config fails fast with a clear error instead of silent runtime bugs.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { z } from 'zod';

const ConfigSchema = z.object({
  apiKey: z.string().min(1, 'VITE_FIREBASE_API_KEY is required'),
  authDomain: z.string().min(1, 'VITE_FIREBASE_AUTH_DOMAIN is required'),
  projectId: z.string().min(1, 'VITE_FIREBASE_PROJECT_ID is required'),
  storageBucket: z.string().min(1, 'VITE_FIREBASE_STORAGE_BUCKET is required'),
  messagingSenderId: z.string().min(1, 'VITE_FIREBASE_MESSAGING_SENDER_ID is required'),
  appId: z.string().min(1, 'VITE_FIREBASE_APP_ID is required'),
});

function readConfig() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const result = ConfigSchema.safeParse(config);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.message).join(', ');
    throw new Error(
      `Firebase config invalid. Missing or empty: ${missing}. Copy .env.example to .env and fill in values.`,
    );
  }
  return result.data;
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = initializeApp(readConfig());
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
    if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
      connectAuthEmulator(_auth, 'http://localhost:9099', { disableWarnings: true });
    }
  }
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) {
    _db = initializeFirestore(getFirebaseApp(), {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
    if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
      connectFirestoreEmulator(_db, 'localhost', 8080);
    }
  }
  return _db;
}
