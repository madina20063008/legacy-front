/**
 * In-memory session cache for the REST backend: the JWT plus the resolved
 * self/family ids from `/api/me`. The auth store populates this; the
 * repositories read from it.
 *
 * Token persistence uses SecureStore on native and AsyncStorage (localStorage)
 * on web, where SecureStore is unavailable.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'legacy.jwt';
const isWeb = Platform.OS === 'web';

const storage = {
  get: (k: string) => (isWeb ? AsyncStorage.getItem(k) : SecureStore.getItemAsync(k)),
  set: (k: string, v: string) => (isWeb ? AsyncStorage.setItem(k, v) : SecureStore.setItemAsync(k, v)),
  del: (k: string) => (isWeb ? AsyncStorage.removeItem(k) : SecureStore.deleteItemAsync(k)),
};

let token: string | null = null;
let userId: string | null = null;
let selfId: string | null = null;
let familyId: string | null = null;

export async function loadToken(): Promise<string | null> {
  if (token) return token;
  token = await storage.get(TOKEN_KEY);
  return token;
}

export async function setToken(value: string): Promise<void> {
  token = value;
  await storage.set(TOKEN_KEY, value);
}

export async function clearSession(): Promise<void> {
  token = null;
  userId = null;
  selfId = null;
  familyId = null;
  await storage.del(TOKEN_KEY);
}

export function setContext(ids: { userId?: string | null; selfId: string | null; familyId: string | null }): void {
  if (ids.userId !== undefined) userId = ids.userId;
  selfId = ids.selfId;
  familyId = ids.familyId;
}

export function getToken(): string | null {
  return token;
}
export function getUserId(): string | null {
  return userId;
}
export function getSelfId(): string | null {
  return selfId;
}
export function getFamilyId(): string | null {
  return familyId;
}
