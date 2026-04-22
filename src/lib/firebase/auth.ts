/**
 * Firebase Authentication service.
 *
 * Wraps Firebase Auth SDK into simple functions the app calls.
 * No UI logic here — just auth operations.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { getFirebaseAuth } from './config';

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
};

function toAuthUser(user: User): AuthUser {
  const providerId = user.providerData[0]?.providerId ?? 'unknown';
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider: providerId,
  };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  return toAuthUser(user);
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return toAuthUser(user);
}

export async function signInWithGoogle(): Promise<AuthUser> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const { user } = await signInWithPopup(auth, provider);
  return toAuthUser(user);
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: AuthUser | null) => void): Unsubscribe {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? toAuthUser(firebaseUser) : null);
  });
}
