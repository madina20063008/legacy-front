/**
 * Firebase client — only used for Google sign-in. Enabled when the public
 * `EXPO_PUBLIC_FIREBASE_*` config is present. Everything is lazy-imported so the
 * app doesn't pull Firebase in unless Google sign-in is actually used.
 */
import { config } from './config';

export function isFirebaseConfigured(): boolean {
  return !!config.firebase.apiKey && !!config.firebase.projectId;
}

let ready = false;
async function ensureApp() {
  if (ready) return;
  const { getApps, initializeApp } = await import('firebase/app');
  if (!getApps().length) initializeApp(config.firebase);
  ready = true;
}

/**
 * Exchange a Google `id_token` (from the expo-auth-session prompt) for a Firebase
 * ID token — this is what the backend verifies at `/api/auth/google`.
 */
export async function exchangeGoogleToken(googleIdToken: string): Promise<string> {
  if (!isFirebaseConfigured()) throw new Error('Firebase is not configured');
  await ensureApp();
  const { getAuth, GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
  const auth = getAuth();
  const credential = GoogleAuthProvider.credential(googleIdToken);
  const result = await signInWithCredential(auth, credential);
  return result.user.getIdToken();
}
