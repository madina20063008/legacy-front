/**
 * Kinship inference over the family graph.
 *
 * We store only four primitive edges (parent/child/spouse/sibling) and derive
 * everything else. `relationLabel` answers "who is X to me?" by locating the
 * lowest common ancestor over blood edges, with a spouse pass for in-laws.
 *
 * This is intentionally heuristic — it covers the common Central-Asian family
 * vocabulary the app needs, and falls back to a neutral "Relative" when unsure.
 */
import type { Gender, Person, Relationship } from '@/types/models';

interface Graph {
  parents: Map<string, Set<string>>;
  children: Map<string, Set<string>>;
  spouses: Map<string, Set<string>>;
  siblings: Map<string, Set<string>>;
}

function add(map: Map<string, Set<string>>, a: string, b: string) {
  if (!map.has(a)) map.set(a, new Set());
  map.get(a)!.add(b);
}

export function buildGraph(rels: Relationship[]): Graph {
  const g: Graph = {
    parents: new Map(),
    children: new Map(),
    spouses: new Map(),
    siblings: new Map(),
  };
  for (const r of rels) {
    switch (r.type) {
      case 'parent': // from is parent of to
        add(g.parents, r.toId, r.fromId);
        add(g.children, r.fromId, r.toId);
        break;
      case 'child': // from is child of to (inverse of parent)
        add(g.parents, r.fromId, r.toId);
        add(g.children, r.toId, r.fromId);
        break;
      case 'spouse':
        add(g.spouses, r.fromId, r.toId);
        add(g.spouses, r.toId, r.fromId);
        break;
      case 'sibling':
        add(g.siblings, r.fromId, r.toId);
        add(g.siblings, r.toId, r.fromId);
        break;
    }
  }
  // Derive implicit siblings from shared parents.
  for (const [child, parents] of g.parents) {
    const parentList = [...parents];
    for (const parent of parentList) {
      for (const other of g.children.get(parent) ?? []) {
        if (other !== child) {
          add(g.siblings, child, other);
          add(g.siblings, other, child);
        }
      }
    }
    // Co-parents of the same child are treated as spouses (so a child's two
    // parents show as husband/wife to each other).
    for (let i = 0; i < parentList.length; i++) {
      for (let j = i + 1; j < parentList.length; j++) {
        if (!g.siblings.get(parentList[i])?.has(parentList[j])) {
          add(g.spouses, parentList[i], parentList[j]);
          add(g.spouses, parentList[j], parentList[i]);
        }
      }
    }
  }
  return g;
}

/** Map of ancestor id -> generational depth (self is depth 0), walking parent edges. */
function ancestorDepths(g: Graph, start: string): Map<string, number> {
  const depths = new Map<string, number>([[start, 0]]);
  const queue: string[] = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    const d = depths.get(cur)!;
    for (const p of g.parents.get(cur) ?? []) {
      if (!depths.has(p)) {
        depths.set(p, d + 1);
        queue.push(p);
      }
    }
  }
  return depths;
}

function pick<T>(gender: Gender | undefined, male: T, female: T, neutral: T): T {
  if (gender === 'male') return male;
  if (gender === 'female') return female;
  return neutral;
}

/** Prefix "Great-" repeated `n` times. */
function great(n: number, base: string): string {
  return `${'Great-'.repeat(Math.max(0, n))}${base}`;
}

interface Labeled {
  label: string;
  /** Generation offset from self: negative = older, positive = younger. */
  generation: number;
}

/** Blood-relation label from `self` to `target`, or null if no blood path. */
function bloodLabel(g: Graph, selfId: string, targetId: string, gender?: Gender): Labeled | null {
  const selfAnc = ancestorDepths(g, selfId);
  const targetAnc = ancestorDepths(g, targetId);

  let lca: string | null = null;
  let best = Infinity;
  let aBest = 0;
  let bBest = 0;
  for (const [id, a] of selfAnc) {
    const b = targetAnc.get(id);
    if (b === undefined) continue;
    if (a + b < best) {
      best = a + b;
      lca = id;
      aBest = a;
      bBest = b;
    }
  }
  if (lca === null) return null;

  const a = aBest; // self -> LCA
  const b = bBest; // target -> LCA
  const generation = b - a;

  // Direct ancestor / descendant lines.
  if (a === 0) {
    // target is self's descendant, b generations down.
    if (b === 1) return { label: pick(gender, 'Son', 'Daughter', 'Child'), generation };
    if (b === 2) return { label: pick(gender, 'Grandson', 'Granddaughter', 'Grandchild'), generation };
    return { label: great(b - 2, pick(gender, 'Grandson', 'Granddaughter', 'Grandchild')), generation };
  }
  if (b === 0) {
    // target is self's ancestor, a generations up.
    if (a === 1) return { label: pick(gender, 'Father', 'Mother', 'Parent'), generation };
    if (a === 2) return { label: pick(gender, 'Grandfather', 'Grandmother', 'Grandparent'), generation };
    return { label: great(a - 2, pick(gender, 'Grandfather', 'Grandmother', 'Grandparent')), generation };
  }
  // Collateral lines (share an ancestor but neither is ancestor of the other).
  if (a === 1 && b === 1) return { label: pick(gender, 'Brother', 'Sister', 'Sibling'), generation };
  if (a === 2 && b === 2) return { label: 'Cousin', generation };
  if (a === 1) {
    // self's sibling's descendants -> niece/nephew line.
    const base = pick(gender, 'Nephew', 'Niece', 'Nephew/Niece');
    return { label: b === 2 ? base : great(b - 2, `Grand-${base}`), generation };
  }
  if (b === 1) {
    // ancestor's siblings -> uncle/aunt line.
    const base = pick(gender, 'Uncle', 'Aunt', 'Uncle/Aunt');
    return { label: a === 2 ? base : great(a - 2, `Grand-${base}`), generation };
  }
  return { label: 'Cousin', generation };
}

/** Spouse-mediated (in-law) label, or null. */
function inLawLabel(g: Graph, selfId: string, targetId: string, gender?: Gender): Labeled | null {
  // Direct spouse.
  if (g.spouses.get(selfId)?.has(targetId)) {
    return { label: pick(gender, 'Husband', 'Wife', 'Spouse'), generation: 0 };
  }
  // target is the spouse of one of my blood relatives.
  for (const spouseOf of g.spouses.get(targetId) ?? []) {
    const bl = bloodLabel(g, selfId, spouseOf, undefined);
    if (bl) {
      if (bl.label === 'Sibling' || bl.label === 'Brother' || bl.label === 'Sister')
        return { label: pick(gender, 'Brother-in-law', 'Sister-in-law', 'Sibling-in-law'), generation: 0 };
      if (bl.label === 'Son' || bl.label === 'Daughter' || bl.label === 'Child')
        return { label: pick(gender, 'Son-in-law', 'Daughter-in-law', 'Child-in-law'), generation: 1 };
      return { label: `${bl.label}'s spouse`, generation: bl.generation };
    }
  }
  // target is a blood relative of my spouse.
  for (const mySpouse of g.spouses.get(selfId) ?? []) {
    const bl = bloodLabel(g, mySpouse, targetId, gender);
    if (bl) {
      if (bl.label === 'Father' || bl.label === 'Mother' || bl.label === 'Parent')
        return { label: pick(gender, 'Father-in-law', 'Mother-in-law', 'Parent-in-law'), generation: -1 };
      if (bl.label === 'Brother' || bl.label === 'Sister' || bl.label === 'Sibling')
        return { label: pick(gender, 'Brother-in-law', 'Sister-in-law', 'Sibling-in-law'), generation: 0 };
      return { label: `${bl.label} (in-law)`, generation: bl.generation };
    }
  }
  return null;
}

/** Resolve the relationship label from `self` to `target`. */
export function relationLabel(
  g: Graph,
  selfId: string,
  target: Pick<Person, 'id' | 'gender'>,
): { label: string; generation: number } {
  if (selfId === target.id) return { label: 'You', generation: 0 };
  const blood = bloodLabel(g, selfId, target.id, target.gender);
  if (blood) return blood;
  const inLaw = inLawLabel(g, selfId, target.id, target.gender);
  if (inLaw) return inLaw;
  return { label: 'Relative', generation: 0 };
}

/** Age in whole years from an ISO date-of-birth, or undefined. */
export function ageFromDob(dob?: string): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/** Profession is only shown for adults (spec: 18+). */
export function isAdult(dob?: string): boolean {
  const age = ageFromDob(dob);
  return age === undefined ? false : age >= 18;
}
