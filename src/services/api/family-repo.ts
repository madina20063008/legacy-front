/**
 * Family data repository.
 *
 * Single source of truth for people + relationships. When Supabase is configured
 * it reads/writes the `people` and `relationships` tables; otherwise it uses the
 * seed data, persisting edits to AsyncStorage so add/edit survive reloads.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Person, Relationship } from '@/types/models';
import { api } from './client';
import { isApiConfigured, isSupabaseConfigured } from './config';
import { generateFakeFamily, isFakeId, SELF_ANCHOR } from './fake-family';
import {
  MOCK_FAMILY_ID,
  MOCK_SELF_ID,
  mockPeople,
  mockRelationships,
} from './mock-data';
import { getFamilyId as sessionFamilyId, getSelfId as sessionSelfId } from './session';
import { supabase } from './supabase';

/** Person fields accepted when creating/updating (no ids). */
type PersonInput = Omit<Person, 'id' | 'familyId' | 'isSelf' | 'online'>;

function personFields(p: Partial<Person>): PersonInput {
  const { name, photoUrl, relation, dateOfBirth, gender, phone, telegram, profession, bio, status, location } = p;
  return { name: name ?? '', photoUrl, relation, dateOfBirth, gender, phone, telegram, profession, bio, status, location };
}

const STORAGE_KEY = 'legacy.mock.family.v1';

interface FamilyState {
  people: Person[];
  relationships: Relationship[];
}

let cache: FamilyState | null = null;

async function loadMock(): Promise<FamilyState> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as FamilyState;
      return cache;
    }
  } catch {
    // fall through to seed
  }
  cache = { people: [...mockPeople], relationships: [...mockRelationships] };
  await persistMock();
  return cache;
}

async function persistMock() {
  if (!cache) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // non-fatal
  }
}

// ── Demo family overlay ──
// A full extended family (front-end only) is layered on top of the real data so
// the tree looks complete. Generated per-user, then persisted so demo edits and
// deletes stick. Never sent to the backend — cannot affect real create/msg/call.
const FAKE_KEY = 'legacy.fake.family.v2';
let fakeCache: FamilyState & { selfId: string } | null = null;

async function loadFake(): Promise<FamilyState> {
  const selfId = getSelfId();
  if (fakeCache && fakeCache.selfId === selfId) return fakeCache;
  try {
    const raw = await AsyncStorage.getItem(FAKE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as FamilyState & { selfId: string };
      if (saved.selfId === selfId) {
        fakeCache = saved;
        return fakeCache;
      }
    }
  } catch {
    // fall through to regenerate
  }
  const gen = generateFakeFamily(selfId, getFamilyId());
  fakeCache = { selfId, people: gen.people, relationships: gen.relationships };
  await persistFake();
  return fakeCache;
}

async function persistFake() {
  if (!fakeCache) return;
  try {
    await AsyncStorage.setItem(FAKE_KEY, JSON.stringify(fakeCache));
  } catch {
    // non-fatal
  }
}

/** Id of the signed-in user's own node within the active family. */
export function getSelfId(): string {
  if (isApiConfigured) return sessionSelfId() ?? MOCK_SELF_ID;
  return MOCK_SELF_ID;
}

export function getFamilyId(): string {
  if (isApiConfigured) return sessionFamilyId() ?? MOCK_FAMILY_ID;
  return MOCK_FAMILY_ID;
}

export async function fetchPeople(): Promise<Person[]> {
  if (isApiConfigured) {
    const real = await api.get<Person[]>('/people');
    const fake = (await loadFake()).people;
    return [...real, ...fake];
  }
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('people').select('*').eq('family_id', getFamilyId());
    if (error) throw error;
    return (data ?? []).map(rowToPerson);
  }
  return (await loadMock()).people;
}

export async function fetchRelationships(): Promise<Relationship[]> {
  if (isApiConfigured) {
    const real = await api.get<Relationship[]>('/relationships');
    const selfId = getSelfId();
    // Rewrite the demo self-anchor to the real self node so the demo family
    // attaches correctly regardless of which account is signed in.
    const fake = (await loadFake()).relationships.map((r) => ({
      ...r,
      fromId: r.fromId === SELF_ANCHOR ? selfId : r.fromId,
      toId: r.toId === SELF_ANCHOR ? selfId : r.toId,
    }));
    return [...real, ...fake];
  }
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('relationships').select('*').eq('family_id', getFamilyId());
    if (error) throw error;
    return (data ?? []).map(rowToRelationship);
  }
  return (await loadMock()).relationships;
}

export async function fetchPerson(id: string): Promise<Person | undefined> {
  const people = await fetchPeople();
  return people.find((p) => p.id === id);
}

/** Create a new person in the active family; returns it with its server id. */
export async function createPerson(input: Partial<Person>): Promise<Person> {
  if (isApiConfigured) return api.post<Person>('/people', personFields(input));
  const person: Person = { ...personFields(input), id: makeLocalId(), familyId: getFamilyId() };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('people').insert(personToRow(person)).select().single();
    if (error) throw error;
    return rowToPerson(data);
  }
  const state = await loadMock();
  state.people.push(person);
  await persistMock();
  return person;
}

/** Update an existing person. */
export async function updatePerson(person: Person): Promise<Person> {
  // Demo members live only on the device — patch the local overlay.
  if (isFakeId(person.id)) {
    const state = await loadFake();
    const idx = state.people.findIndex((p) => p.id === person.id);
    if (idx >= 0) state.people[idx] = { ...state.people[idx], ...personFields(person) };
    await persistFake();
    return state.people[idx] ?? person;
  }
  if (isApiConfigured) return api.put<Person>(`/people/${person.id}`, personFields(person));
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('people').upsert(personToRow(person)).select().single();
    if (error) throw error;
    return rowToPerson(data);
  }
  const state = await loadMock();
  const idx = state.people.findIndex((p) => p.id === person.id);
  if (idx >= 0) state.people[idx] = person;
  else state.people.push(person);
  await persistMock();
  return person;
}

export async function addRelationship(rel: {
  fromId: string;
  toId: string;
  type: Relationship['type'];
}): Promise<Relationship> {
  if (isApiConfigured) {
    return api.post<Relationship>('/relationships', { fromId: rel.fromId, toId: rel.toId, type: rel.type });
  }
  const full: Relationship = { id: makeLocalId(), familyId: getFamilyId(), ...rel };
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('relationships').insert(relationshipToRow(full)).select().single();
    if (error) throw error;
    return rowToRelationship(data);
  }
  const state = await loadMock();
  state.relationships.push(full);
  await persistMock();
  return full;
}

export async function deletePerson(id: string): Promise<void> {
  // Demo members: drop from the local overlay (and any edges touching them).
  if (isFakeId(id)) {
    const state = await loadFake();
    state.people = state.people.filter((p) => p.id !== id);
    state.relationships = state.relationships.filter((r) => r.fromId !== id && r.toId !== id);
    await persistFake();
    return;
  }
  if (isApiConfigured) {
    await api.del(`/people/${id}`);
    return;
  }
  const state = await loadMock();
  state.people = state.people.filter((p) => p.id !== id);
  state.relationships = state.relationships.filter((r) => r.fromId !== id && r.toId !== id);
  await persistMock();
}

function makeLocalId(): string {
  return `l_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Reset the local mock family back to the seed (dev helper). */
export async function resetMockFamily(): Promise<void> {
  cache = { people: [...mockPeople], relationships: [...mockRelationships] };
  await persistMock();
}

// ── Row mappers (snake_case DB ↔ camelCase domain) ──

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToPerson(r: any): Person {
  return {
    id: r.id,
    familyId: r.family_id,
    name: r.name,
    photoUrl: r.photo_url ?? undefined,
    dateOfBirth: r.date_of_birth ?? undefined,
    gender: r.gender ?? undefined,
    phone: r.phone ?? undefined,
    telegram: r.telegram ?? undefined,
    profession: r.profession ?? undefined,
    bio: r.bio ?? undefined,
    status: r.status ?? undefined,
    location: r.location ?? undefined,
    isSelf: r.is_self ?? undefined,
    online: r.online ?? undefined,
  };
}

function personToRow(p: Person) {
  return {
    id: p.id,
    family_id: p.familyId,
    name: p.name,
    photo_url: p.photoUrl ?? null,
    date_of_birth: p.dateOfBirth ?? null,
    gender: p.gender ?? null,
    phone: p.phone ?? null,
    telegram: p.telegram ?? null,
    profession: p.profession ?? null,
    bio: p.bio ?? null,
    status: p.status ?? null,
    location: p.location ?? null,
    is_self: p.isSelf ?? false,
  };
}

function rowToRelationship(r: any): Relationship {
  return { id: r.id, familyId: r.family_id, fromId: r.from_id, toId: r.to_id, type: r.type };
}

function relationshipToRow(r: Relationship) {
  return { id: r.id, family_id: r.familyId, from_id: r.fromId, to_id: r.toId, type: r.type };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
