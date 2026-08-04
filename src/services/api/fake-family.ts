/**
 * Demo family generator.
 *
 * Produces a full, realistic-looking extended family (grandparents on both
 * sides, parents, uncles/aunts + their spouses, cousins, siblings + their
 * spouses, and nieces/nephews) connected to the signed-in user's own node.
 *
 * IMPORTANT: this is a FRONT-END ONLY overlay. These people are never sent to
 * the backend, never linked to real accounts, and never touch the messaging /
 * username system — so they cannot affect real create / message / call. They
 * exist purely to make the tree look complete. Edits and deletes to demo
 * members are persisted locally (see family-repo `loadFake`).
 */
import type { Gender, Person, Relationship } from '@/types/models';

export const FAKE_PREFIX = 'fake_';

/**
 * Placeholder for the signed-in user's own node inside the demo edges. It is
 * rewritten to the real self id when the overlay is merged (see family-repo),
 * so the demo family stays correctly attached no matter which account loads it.
 */
export const SELF_ANCHOR = `${FAKE_PREFIX}self_anchor`;

export function isFakeId(id: string | undefined | null): boolean {
  return !!id && id.startsWith(FAKE_PREFIX) && id !== SELF_ANCHOR;
}

// ── Deterministic PRNG so each user gets a stable-but-unique family ──
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MALE_NAMES = ['Anvar', 'Bekzod', 'Davron', 'Farrukh', 'Jasur', 'Kamol', 'Nodir', 'Otabek', 'Rustam', 'Sardor', 'Timur', 'Ulugbek', 'Aziz', 'Bahodir', 'Sherzod'];
const FEMALE_NAMES = ['Aisha', 'Dilnoza', 'Feruza', 'Gulnora', 'Kamila', 'Laylo', 'Malika', 'Nigora', 'Sevara', 'Zarina', 'Madina', 'Nilufar', 'Shahnoza', 'Umida', 'Yulduz'];
const SURNAMES = ['Karimov', 'Yusupov', 'Rakhimov', 'Sultonov', 'Ibragimov', 'Nazarov', 'Tashkentov', 'Abdullaev', 'Ergashev', 'Toshpulatov'];
const MALE_PROF = ['Engineer', 'Doctor', 'Teacher', 'Farmer', 'Businessman', 'Architect', 'Driver', 'Accountant', 'Lawyer', 'Craftsman'];
const FEMALE_PROF = ['Teacher', 'Doctor', 'Designer', 'Nurse', 'Accountant', 'Homemaker', 'Pharmacist', 'Tailor', 'Chef', 'Journalist'];
const CITIES = ['Tashkent', 'Samarkand', 'Bukhara', 'Andijan', 'Namangan', 'Fergana', 'Nukus', 'Qarshi', 'Termez', 'Urgench'];
const BIOS = [
  'Loves gathering the whole family for Sunday plov.',
  'Keeps every childhood photo in a shoebox.',
  'Always the first to call on birthdays.',
  'Grows the sweetest grapes in the neighborhood.',
  'Never misses a family wedding.',
  'Tells the best stories about the old days.',
  'The one everyone asks for advice.',
  'Makes the strongest tea in the family.',
  'Can fix just about anything around the house.',
  'Knows every relative by heart.',
];

export interface FakeFamily {
  people: Person[];
  relationships: Relationship[];
}

/**
 * Build a full extended family around the current user (referenced via
 * SELF_ANCHOR, rewritten to the real self id at merge time). Deterministic for
 * a given `seed` so the same account keeps the same demo family.
 */
export function generateFakeFamily(seed: string, familyId: string): FakeFamily {
  const selfId = SELF_ANCHOR;
  const rnd = mulberry32(hashSeed(seed));
  const p = (a: string[]) => a[Math.floor(rnd() * a.length)];
  const surname = p(SURNAMES);

  const people: Person[] = [];
  const rels: Relationship[] = [];
  let rc = 0;
  const rel = (fromId: string, toId: string, type: Relationship['type']) => {
    rels.push({ id: `${FAKE_PREFIX}r${rc++}`, familyId, fromId, toId, type });
  };

  const person = (
    key: string,
    gender: Gender,
    birthYear: number,
    opts?: { profession?: boolean },
  ): string => {
    const id = `${FAKE_PREFIX}${key}`;
    const first = p(gender === 'male' ? MALE_NAMES : FEMALE_NAMES);
    const month = String(1 + Math.floor(rnd() * 12)).padStart(2, '0');
    const day = String(1 + Math.floor(rnd() * 28)).padStart(2, '0');
    const showProf = opts?.profession !== false;
    const portrait = Math.floor(rnd() * 90);
    people.push({
      id,
      familyId,
      name: `${first} ${surname}`,
      gender,
      photoUrl: `https://randomuser.me/api/portraits/${gender === 'male' ? 'men' : 'women'}/${portrait}.jpg`,
      dateOfBirth: `${birthYear}-${month}-${day}`,
      phone: `+998 9${Math.floor(rnd() * 9)} ${100 + Math.floor(rnd() * 900)} ${10 + Math.floor(rnd() * 90)} ${10 + Math.floor(rnd() * 90)}`,
      telegram: `${first.toLowerCase()}_${surname.toLowerCase()}`,
      profession: showProf ? p(gender === 'male' ? MALE_PROF : FEMALE_PROF) : undefined,
      bio: p(BIOS),
      location: p(CITIES),
    });
    return id;
  };

  // Generation -2: grandparents (both sides)
  const pgf = person('pgf', 'male', 1948);
  const pgm = person('pgm', 'female', 1951);
  const mgf = person('mgf', 'male', 1950);
  const mgm = person('mgm', 'female', 1953);

  // Generation -1: parents, uncles, aunts, their spouses
  const father = person('father', 'male', 1974);
  const mother = person('mother', 'female', 1977);
  const uncleP = person('uncleP', 'male', 1972); // father's brother (amaki)
  const unclePsp = person('unclePsp', 'female', 1975);
  const auntP = person('auntP', 'female', 1979); // father's sister (amma)
  const uncleM = person('uncleM', 'male', 1976); // mother's brother (tog'a)
  const auntM = person('auntM', 'female', 1980); // mother's sister (xola)
  const auntMsp = person('auntMsp', 'male', 1978);

  // Generation 0: siblings, sibling spouse, cousins
  const bro = person('bro', 'male', 1998); // older brother (aka)
  const brosp = person('brosp', 'female', 2000);
  const sis = person('sis', 'female', 2004); // younger sister (singil)
  const cousin1 = person('cousin1', 'male', 2001);
  const cousin2 = person('cousin2', 'female', 2003);

  // Generation +1: nieces / nephews (jiyan) and a young cousin's child
  const nephew = person('nephew', 'male', 2019, { profession: false });
  const niece = person('niece', 'female', 2021, { profession: false });

  // Edges (type 'parent' => from is parent of to). Co-parents of a shared
  // child are auto-inferred as spouses by buildGraph, so couples sit together.
  const parents = (dad: string, mom: string, ...kids: string[]) => {
    for (const k of kids) {
      rel(dad, k, 'parent');
      rel(mom, k, 'parent');
    }
  };

  parents(pgf, pgm, father, uncleP, auntP);
  parents(mgf, mgm, mother, uncleM, auntM);
  parents(father, mother, selfId, bro, sis);
  parents(uncleP, unclePsp, cousin1);
  parents(auntMsp, auntM, cousin2);
  parents(bro, brosp, nephew, niece);

  return { people, relationships: rels };
}
