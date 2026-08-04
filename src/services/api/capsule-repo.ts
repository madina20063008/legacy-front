/**
 * Memory Capsule repository (mock, AsyncStorage). A real capsule requires
 * server-side scheduled delivery + secure storage; this models the create/seal/
 * open lifecycle locally so the flow is demonstrable.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Capsule {
  id: string;
  title: string;
  message: string;
  deliverAt: string; // ISO date (YYYY-MM-DD)
  recipientIds: string[];
  mediaUri?: string;
  createdAt: number;
}

const STORAGE_KEY = 'legacy.capsules.v1';
let cache: Capsule[] | null = null;

async function load(): Promise<Capsule[]> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Capsule[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache ?? []));
  } catch {
    // non-fatal
  }
}

export async function listCapsules(): Promise<Capsule[]> {
  return (await load()).slice().sort((a, b) => a.deliverAt.localeCompare(b.deliverAt));
}

export async function addCapsule(input: Omit<Capsule, 'id' | 'createdAt'>): Promise<Capsule> {
  const list = await load();
  const capsule: Capsule = { ...input, id: `cap_${Date.now().toString(36)}`, createdAt: Date.now() };
  list.push(capsule);
  await persist();
  return capsule;
}

/** True once the delivery date has arrived. */
export function isOpenable(capsule: Capsule, now = new Date()): boolean {
  return new Date(capsule.deliverAt).getTime() <= now.getTime();
}
