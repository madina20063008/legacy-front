/** Family statistics computed from the graph — no backend needed. */
import type { Person } from '@/types/models';
import { ageFromDob } from '@/utils/relationships';

export interface ProfessionCount {
  profession: string;
  count: number;
}

export interface FamilyStats {
  members: number;
  cities: string[];
  professions: ProfessionCount[];
  oldest?: { person: Person; age: number };
  youngest?: { person: Person; age: number };
}

export function computeStats(people: Person[]): FamilyStats {
  const cities = [...new Set(people.map((p) => p.location).filter(Boolean) as string[])].sort();

  const counts = new Map<string, number>();
  for (const p of people) {
    if (p.profession && (ageFromDob(p.dateOfBirth) ?? 0) >= 18) {
      counts.set(p.profession, (counts.get(p.profession) ?? 0) + 1);
    }
  }
  const professions = [...counts.entries()]
    .map(([profession, count]) => ({ profession, count }))
    .sort((a, b) => b.count - a.count);

  let oldest: FamilyStats['oldest'];
  let youngest: FamilyStats['youngest'];
  for (const p of people) {
    const age = ageFromDob(p.dateOfBirth);
    if (age === undefined) continue;
    if (!oldest || age > oldest.age) oldest = { person: p, age };
    if (!youngest || age < youngest.age) youngest = { person: p, age };
  }

  return { members: people.length, cities, professions, oldest, youngest };
}
