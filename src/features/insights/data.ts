/**
 * Demo data for the Family Intelligence screens (timeline, achievements,
 * businesses). References people by id from the seed family. A real app would
 * store these in Supabase tables scoped by family_id.
 */

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  personId?: string;
  emoji: string;
}

export interface Achievement {
  id: string;
  personId: string;
  title: string;
  year: number;
  story: string;
  emoji: string;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  category: string;
  location: string;
  contact: string;
  emoji: string;
}

export const TIMELINE: TimelineEvent[] = [
  { id: 'ev1', year: 1970, title: 'Rustam & Zulfiya marry in Samarkand', emoji: '💍' },
  { id: 'ev2', year: 1973, title: 'Bahodir is born', personId: 'p_bahodir', emoji: '👶' },
  { id: 'ev3', year: 1996, title: 'Aziz is born', personId: 'p_aziz', emoji: '👶' },
  { id: 'ev4', year: 2015, title: 'Sardor opens the family plov house', personId: 'p_sardor', emoji: '🍲' },
  { id: 'ev5', year: 2018, title: 'Timur is born', personId: 'p_timur', emoji: '👶' },
  { id: 'ev6', year: 2021, title: 'Laylo is born', personId: 'p_laylo', emoji: '👶' },
  { id: 'ev7', year: 2026, title: 'The family joins Legacy', emoji: '🌳' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach1', personId: 'p_dilnoza', title: 'Chief Pediatrician', year: 2019, story: 'Recognized for 20 years of caring for children in Tashkent.', emoji: '🩺' },
  { id: 'ach2', personId: 'p_kamila', title: 'Medical scholarship', year: 2023, story: 'Awarded a full scholarship to study medicine in Istanbul.', emoji: '🎓' },
  { id: 'ach3', personId: 'p_aziz', title: 'Launched Legacy', year: 2026, story: 'Built the family platform to keep everyone connected.', emoji: '🚀' },
];

export const BUSINESSES: Business[] = [
  { id: 'biz1', name: 'Karimov Plov House', ownerId: 'p_sardor', category: 'Restaurant', location: 'Samarkand', contact: '+998 66 234 56 78', emoji: '🍲' },
  { id: 'biz2', name: 'Dilnoza Kids Clinic', ownerId: 'p_dilnoza', category: 'Healthcare', location: 'Tashkent', contact: '+998 71 200 10 20', emoji: '🏥' },
];
