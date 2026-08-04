/**
 * Family Vault repository (mock, AsyncStorage — metadata only).
 *
 * SECURITY: real documents must be encrypted and stored on a secure backend
 * with access control, never only on the device. This demo stores lightweight
 * metadata + a local image URI to show the flow.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VaultCategory = 'passport' | 'diploma' | 'certificate' | 'will' | 'other';

export const VAULT_CATEGORIES: VaultCategory[] = ['passport', 'diploma', 'certificate', 'will', 'other'];

export interface VaultDoc {
  id: string;
  title: string;
  category: VaultCategory;
  uri?: string;
  addedAt: number;
}

const STORAGE_KEY = 'legacy.vault.v1';
let cache: VaultDoc[] | null = null;

async function load(): Promise<VaultDoc[]> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as VaultDoc[]) : [];
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

export async function listDocs(): Promise<VaultDoc[]> {
  return (await load()).slice().sort((a, b) => b.addedAt - a.addedAt);
}

export async function addDoc(input: Omit<VaultDoc, 'id' | 'addedAt'>): Promise<VaultDoc> {
  const list = await load();
  const doc: VaultDoc = { ...input, id: `doc_${Date.now().toString(36)}`, addedAt: Date.now() };
  list.push(doc);
  await persist();
  return doc;
}

export async function removeDoc(id: string): Promise<void> {
  cache = (await load()).filter((d) => d.id !== id);
  await persist();
}
