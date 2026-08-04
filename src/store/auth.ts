/**
 * Authentication + session state.
 *
 * REST backend (isApiConfigured): email + password (register / login) → JWT,
 * plus optional Google sign-in via Firebase. Self/family ids resolved from
 * `/api/me`. No backend: a simulated flow so onboarding stays walkable.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { api } from '@/services/api/client';
import { isApiConfigured } from '@/services/api/config';
import { exchangeGoogleToken, isFirebaseConfigured } from '@/services/api/firebase';
import { clearSession, loadToken, setContext, setToken } from '@/services/api/session';

const TOKEN_KEY = 'legacy.session.token';
const PROFILE_KEY = 'legacy.profile.complete';

export interface ProfileDraft {
  name: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  telegram?: string;
  profession?: string;
  bio?: string;
}

interface MeResponse {
  user: { id: string; email: string };
  hasProfile: boolean;
  familyId: string | null;
  self: { id: string } | null;
}

type AuthStatus = 'loading' | 'signedOut' | 'needsProfile' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  googleEnabled: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  /** Exchange a Google id_token (from the sign-in prompt) for a session. */
  googleLogin: (googleIdToken: string) => Promise<void>;
  completeProfile: (draft: ProfileDraft) => Promise<void>;
  signOut: () => Promise<void>;
}

async function syncContext(): Promise<boolean> {
  const me = await api.get<MeResponse>('/me');
  setContext({ userId: me.user.id, selfId: me.self?.id ?? null, familyId: me.familyId });
  return me.hasProfile;
}

/** Store the token and resolve the resulting auth status. */
async function applyToken(token: string, hasProfile: boolean): Promise<AuthStatus> {
  await setToken(token);
  const resolved = hasProfile ? await syncContext() : false;
  return resolved ? 'signedIn' : 'needsProfile';
}

export const useAuth = create<AuthState>((set) => ({
  status: 'loading',
  googleEnabled: isApiConfigured && isFirebaseConfigured(),

  async hydrate() {
    if (isApiConfigured) {
      const token = await loadToken();
      if (!token) return set({ status: 'signedOut' });
      try {
        const hasProfile = await syncContext();
        return set({ status: hasProfile ? 'signedIn' : 'needsProfile' });
      } catch {
        await clearSession();
        return set({ status: 'signedOut' });
      }
    }
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) return set({ status: 'signedOut' });
    const hasProfile = (await AsyncStorage.getItem(PROFILE_KEY)) === 'true';
    set({ status: hasProfile ? 'signedIn' : 'needsProfile' });
  },

  async signIn(email: string, password: string) {
    if (isApiConfigured) {
      const res = await api.post<{ token: string; hasProfile: boolean }>('/auth/login', { email, password });
      return set({ status: await applyToken(res.token, res.hasProfile) });
    }
    await SecureStore.setItemAsync(TOKEN_KEY, 'mock-session');
    const hasProfile = (await AsyncStorage.getItem(PROFILE_KEY)) === 'true';
    set({ status: hasProfile ? 'signedIn' : 'needsProfile' });
  },

  async signUp(email: string, password: string) {
    if (isApiConfigured) {
      const res = await api.post<{ token: string; hasProfile: boolean }>('/auth/register', { email, password });
      return set({ status: await applyToken(res.token, res.hasProfile) });
    }
    await SecureStore.setItemAsync(TOKEN_KEY, 'mock-session');
    set({ status: 'needsProfile' });
  },

  async googleLogin(googleIdToken: string) {
    if (!isApiConfigured) throw new Error('Google sign-in requires the backend');
    // Exchange the Google token for a Firebase ID token, then for our session.
    const firebaseIdToken = await exchangeGoogleToken(googleIdToken);
    const res = await api.post<{ token: string; hasProfile: boolean }>('/auth/google', { idToken: firebaseIdToken });
    set({ status: await applyToken(res.token, res.hasProfile) });
  },

  async completeProfile(draft: ProfileDraft) {
    if (isApiConfigured) {
      await api.post('/me/profile', draft);
      await syncContext();
      return set({ status: 'signedIn' });
    }
    await AsyncStorage.setItem(PROFILE_KEY, 'true');
    await AsyncStorage.setItem('legacy.profile.draft', JSON.stringify(draft));
    set({ status: 'signedIn' });
  },

  async signOut() {
    if (isApiConfigured) {
      try {
        await api.post('/auth/logout');
      } catch {
        // ignore
      }
      await clearSession();
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    await AsyncStorage.removeItem(PROFILE_KEY);
    set({ status: 'signedOut' });
  },
}));
