/**
 * Firebase configuration — initialized once, imported everywhere.
 *
 * In dev mode (VITE_DEV_MODE=true), Firebase is NOT initialized.
 * The auth and progress modules use dev mocks instead.
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

export function isDevMode(): boolean {
  return import.meta.env.VITE_DEV_MODE === 'true';
}

function readConfig() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  };

  const missing = Object.entries(config)
    .filter(([_, v]) => !v || v === 'dev-placeholder')
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `Firebase config invalid. Missing: ${missing.join(', ')}. Set VITE_DEV_MODE=true for development without Firebase.`,
    );
  }

  return config;
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (isDevMode()) throw new Error('Firebase not available in dev mode');
  if (!_app) {
    _app = initializeApp(readConfig());
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (isDevMode()) throw new Error('Firebase Auth not available in dev mode');
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
    if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
      connectAuthEmulator(_auth, 'http://localhost:9099', { disableWarnings: true });
    }
  }
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (isDevMode()) throw new Error('Firestore not available in dev mode');
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
