/**
 * Seed family used until real Supabase credentials are configured.
 * Spans four generations so the tree, profiles, and relationship inference all
 * have something meaningful to render.
 */
import type { Person, Relationship } from '@/types/models';

export const MOCK_FAMILY_ID = 'fam_legacy_demo';
export const MOCK_SELF_ID = 'p_aziz';

export const mockPeople: Person[] = [
  // ── Grandparents (paternal) ──
  { id: 'p_rustam', familyId: MOCK_FAMILY_ID, name: 'Rustam Karimov', gender: 'male', dateOfBirth: '1949-03-12', profession: 'Retired teacher', location: 'Samarkand', bio: 'Family patriarch. Loves gardening and telling stories.', status: 'Tending the orchard' },
  { id: 'p_zulfiya', familyId: MOCK_FAMILY_ID, name: 'Zulfiya Karimova', gender: 'female', dateOfBirth: '1952-08-04', profession: 'Retired doctor', location: 'Samarkand', bio: 'Grandmother, keeper of family recipes.', status: 'Baking non for the weekend' },
  // ── Grandparents (maternal) ──
  { id: 'p_anvar', familyId: MOCK_FAMILY_ID, name: 'Anvar Yusupov', gender: 'male', dateOfBirth: '1947-11-20', profession: 'Retired engineer', location: 'Tashkent', bio: 'Built bridges across the region.', status: 'Reading history books' },
  { id: 'p_malika', familyId: MOCK_FAMILY_ID, name: 'Malika Yusupova', gender: 'female', dateOfBirth: '1950-06-15', profession: 'Retired seamstress', location: 'Tashkent', status: 'Knitting for the grandchildren' },
  // ── Parents & their generation ──
  { id: 'p_bahodir', familyId: MOCK_FAMILY_ID, name: 'Bahodir Karimov', gender: 'male', dateOfBirth: '1973-01-30', profession: 'Civil engineer', location: 'Tashkent', telegram: '@bahodir_k', bio: 'Father of two, weekend fisherman.', status: 'On a project in Nukus' },
  { id: 'p_dilnoza', familyId: MOCK_FAMILY_ID, name: 'Dilnoza Karimova', gender: 'female', dateOfBirth: '1975-05-18', profession: 'Pediatrician', location: 'Tashkent', telegram: '@dilnoza', bio: 'Mother, doctor, and the family organizer.', status: 'At the clinic' },
  { id: 'p_sardor', familyId: MOCK_FAMILY_ID, name: 'Sardor Karimov', gender: 'male', dateOfBirth: '1970-09-09', profession: 'Restaurateur', location: 'Samarkand', bio: "Bahodir's older brother. Runs a plov house.", status: 'Cooking for guests' },
  { id: 'p_nigora', familyId: MOCK_FAMILY_ID, name: 'Nigora Karimova', gender: 'female', dateOfBirth: '1974-02-25', profession: 'Accountant', location: 'Samarkand', status: 'Balancing the books' },
  // ── Me, spouse, sibling, cousin ──
  { id: MOCK_SELF_ID, familyId: MOCK_FAMILY_ID, name: 'Aziz Karimov', gender: 'male', dateOfBirth: '1996-07-14', profession: 'Software engineer', location: 'Tashkent', telegram: '@aziz', phone: '+998 90 123 45 67', bio: 'Building Legacy — a home for our family.', status: 'Shipping the family tree', isSelf: true, online: true },
  { id: 'p_sevara', familyId: MOCK_FAMILY_ID, name: 'Sevara Karimova', gender: 'female', dateOfBirth: '1998-04-02', profession: 'UX designer', location: 'Tashkent', telegram: '@sevara', bio: 'Designer and mother of two.', status: 'Sketching', online: true },
  { id: 'p_kamila', familyId: MOCK_FAMILY_ID, name: 'Kamila Karimova', gender: 'female', dateOfBirth: '1999-12-01', profession: 'Medical student', location: 'Istanbul', telegram: '@kamila', bio: "Aziz's younger sister, studying abroad.", status: 'Exams season' },
  { id: 'p_jasur', familyId: MOCK_FAMILY_ID, name: 'Jasur Karimov', gender: 'male', dateOfBirth: '1997-10-22', profession: 'Chef', location: 'Samarkand', bio: 'Cousin, works at the family plov house.', status: 'Prepping for a wedding' },
  // ── Children ──
  { id: 'p_timur', familyId: MOCK_FAMILY_ID, name: 'Timur Karimov', gender: 'male', dateOfBirth: '2018-03-08', bio: 'Loves dinosaurs and football.', status: 'In 2nd grade' },
  { id: 'p_laylo', familyId: MOCK_FAMILY_ID, name: 'Laylo Karimova', gender: 'female', dateOfBirth: '2021-09-19', bio: 'The youngest of the family.', status: 'Learning to draw' },
];

/** Parent + spouse edges. Siblings are derived from shared parents. */
export const mockRelationships: Relationship[] = [
  // Grandparent marriages
  rel('r1', 'p_rustam', 'p_zulfiya', 'spouse'),
  rel('r2', 'p_anvar', 'p_malika', 'spouse'),
  // Paternal grandparents -> their children (Bahodir, Sardor)
  rel('r3', 'p_rustam', 'p_bahodir', 'parent'),
  rel('r4', 'p_zulfiya', 'p_bahodir', 'parent'),
  rel('r5', 'p_rustam', 'p_sardor', 'parent'),
  rel('r6', 'p_zulfiya', 'p_sardor', 'parent'),
  // Maternal grandparents -> Dilnoza
  rel('r7', 'p_anvar', 'p_dilnoza', 'parent'),
  rel('r8', 'p_malika', 'p_dilnoza', 'parent'),
  // Parent marriages
  rel('r9', 'p_bahodir', 'p_dilnoza', 'spouse'),
  rel('r10', 'p_sardor', 'p_nigora', 'spouse'),
  // Parents -> me + sister
  rel('r11', 'p_bahodir', 'p_aziz', 'parent'),
  rel('r12', 'p_dilnoza', 'p_aziz', 'parent'),
  rel('r13', 'p_bahodir', 'p_kamila', 'parent'),
  rel('r14', 'p_dilnoza', 'p_kamila', 'parent'),
  // Uncle + aunt -> cousin
  rel('r15', 'p_sardor', 'p_jasur', 'parent'),
  rel('r16', 'p_nigora', 'p_jasur', 'parent'),
  // My marriage + children
  rel('r17', 'p_aziz', 'p_sevara', 'spouse'),
  rel('r18', 'p_aziz', 'p_timur', 'parent'),
  rel('r19', 'p_sevara', 'p_timur', 'parent'),
  rel('r20', 'p_aziz', 'p_laylo', 'parent'),
  rel('r21', 'p_sevara', 'p_laylo', 'parent'),
];

function rel(
  id: string,
  fromId: string,
  toId: string,
  type: Relationship['type'],
): Relationship {
  return { id, familyId: MOCK_FAMILY_ID, fromId, toId, type };
}
