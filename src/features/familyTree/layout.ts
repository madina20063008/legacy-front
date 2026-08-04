/**
 * Pure layout math for the 2D family tree. Groups people into generational rows
 * and assigns (x, y) coordinates, then derives parent→child connector segments.
 */
import type { RelatedPerson, Relationship } from '@/types/models';

export const NODE = 64;
export const COL_W = 104;
export const ROW_H = 150;
export const PAD = 40;

export interface Positioned extends RelatedPerson {
  x: number;
  y: number;
}

export interface Segment {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface TreeLayout {
  nodes: Positioned[];
  segments: Segment[];
  width: number;
  height: number;
}

export function computeLayout(
  people: RelatedPerson[],
  relationships: Relationship[],
): TreeLayout {
  if (people.length === 0) return { nodes: [], segments: [], width: 0, height: 0 };

  // Group by generation (older/smaller generation at the top).
  const byGen = new Map<number, RelatedPerson[]>();
  for (const p of people) {
    const g = p.generation;
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g)!.push(p);
  }
  const gens = [...byGen.keys()].sort((a, b) => a - b);

  // Spouse pairs = explicit spouse edges + co-parents of the same child.
  const spouseOf = new Map<string, string>();
  const pair = (a: string, b: string) => {
    if (!spouseOf.has(a)) spouseOf.set(a, b);
    if (!spouseOf.has(b)) spouseOf.set(b, a);
  };
  const parentsByChild = new Map<string, string[]>();
  const addParent = (child: string, parent: string) => {
    const list = parentsByChild.get(child) ?? [];
    list.push(parent);
    parentsByChild.set(child, list);
  };
  for (const r of relationships) {
    if (r.type === 'spouse') pair(r.fromId, r.toId);
    else if (r.type === 'parent') addParent(r.toId, r.fromId);
    else if (r.type === 'child') addParent(r.fromId, r.toId);
  }
  for (const ps of parentsByChild.values()) if (ps.length >= 2) pair(ps[0], ps[1]);

  // Order each generation: self first, then by name, with spouses kept adjacent
  // (couples side by side, like a printed family tree).
  for (const g of gens) {
    const row = byGen.get(g)!;
    const byId = new Map(row.map((p) => [p.id, p] as const));
    const placed = new Set<string>();
    const ordered: RelatedPerson[] = [];
    const place = (p: RelatedPerson) => {
      if (placed.has(p.id)) return;
      placed.add(p.id);
      ordered.push(p);
      const sp = spouseOf.get(p.id);
      if (sp && byId.has(sp) && !placed.has(sp)) {
        placed.add(sp);
        ordered.push(byId.get(sp)!);
      }
    };
    [...row]
      .sort((a, b) => (a.isSelf ? -1 : b.isSelf ? 1 : a.name.localeCompare(b.name)))
      .forEach(place);
    byGen.set(g, ordered);
  }

  const maxRow = Math.max(...gens.map((g) => byGen.get(g)!.length));
  const contentWidth = maxRow * COL_W;

  const pos = new Map<string, { x: number; y: number }>();
  const nodes: Positioned[] = [];

  gens.forEach((g, gi) => {
    const row = byGen.get(g)!;
    const rowWidth = row.length * COL_W;
    const offsetX = PAD + (contentWidth - rowWidth) / 2;
    const y = PAD + gi * ROW_H;
    row.forEach((person, i) => {
      const x = offsetX + i * COL_W + COL_W / 2;
      pos.set(person.id, { x, y });
      nodes.push({ ...person, x, y });
    });
  });

  // Orthogonal connectors, grouped by parent-set → children, like a printed
  // family tree: a couple joined by a short line, a vertical drop to a shared
  // horizontal "sibling bus", then a vertical up to each child.
  const segments: Segment[] = [];
  const groups = new Map<string, { parents: string[]; children: string[] }>();
  for (const [child, ps] of parentsByChild) {
    const present = ps.filter((id) => pos.has(id));
    if (!present.length || !pos.has(child)) continue;
    const key = [...present].sort().join('|');
    const g = groups.get(key) ?? { parents: present, children: [] };
    g.children.push(child);
    groups.set(key, g);
  }
  for (const { parents: pids, children } of groups.values()) {
    const pP = pids.map((id) => pos.get(id)!).filter(Boolean);
    const cP = children.map((id) => pos.get(id)!).filter(Boolean);
    if (!pP.length || !cP.length) continue;

    const coupleY = pP[0].y; // parents share a row
    const childTopY = Math.min(...cP.map((c) => c.y)) - NODE / 2;
    const busY = (coupleY + Math.min(...cP.map((c) => c.y))) / 2;
    const midX = pP.reduce((s, p) => s + p.x, 0) / pP.length;

    // Marriage line between the two parents (at their centers).
    if (pP.length >= 2) {
      const xs = pP.map((p) => p.x).sort((a, b) => a - b);
      segments.push({ from: { x: xs[0], y: coupleY }, to: { x: xs[xs.length - 1], y: coupleY } });
    }
    // Vertical drop from the couple's midpoint down to the sibling bus.
    const dropStartY = pP.length >= 2 ? coupleY : coupleY + NODE / 2;
    segments.push({ from: { x: midX, y: dropStartY }, to: { x: midX, y: busY } });
    // Horizontal sibling bus spanning the children (and the drop point).
    const busLeft = Math.min(midX, ...cP.map((c) => c.x));
    const busRight = Math.max(midX, ...cP.map((c) => c.x));
    if (busRight > busLeft) segments.push({ from: { x: busLeft, y: busY }, to: { x: busRight, y: busY } });
    // Vertical from the bus up to each child.
    for (const c of cP) segments.push({ from: { x: c.x, y: busY }, to: { x: c.x, y: childTopY } });
  }

  const width = contentWidth + PAD * 2;
  const height = PAD * 2 + (gens.length - 1) * ROW_H + NODE;
  return { nodes, segments, width, height };
}
