/**
 * Core domain models for Legacy.
 *
 * The family is modeled as a graph: `Person` nodes connected by directed
 * `Relationship` edges. Tree layout and "how am I related to X" are both
 * computed from this edge list (see `utils/relationships`).
 */

export type Gender = 'male' | 'female' | 'other';

/** The four primitive relationship edges we store. Everything else is derived. */
export type RelationType = 'parent' | 'child' | 'spouse' | 'sibling';

export interface Person {
  id: string;
  familyId: string;
  name: string;
  photoUrl?: string;
  /** Free-text relation to the current user (e.g. "Grandfather", "Aunt"). Overrides the computed label. */
  relation?: string;
  /** ISO date (YYYY-MM-DD). */
  dateOfBirth?: string;
  gender?: Gender;
  phone?: string;
  telegram?: string;
  /** Shown in UI only for people 18+ (see `isAdult`). */
  profession?: string;
  bio?: string;
  /** Free-text "what I'm currently doing". */
  status?: string;
  /** City / country the person has chosen to share (Family Map, later phase). */
  location?: string;
  /** True for the signed-in user's own node. */
  isSelf?: boolean;
  online?: boolean;
  /** Set when this person's telegram matches a registered user — enables real chat. */
  linkedUserId?: string | null;
}

export interface Relationship {
  id: string;
  familyId: string;
  /** Edge direction: `from` is the `type` of `to`. e.g. type 'parent' => from is parent of to. */
  fromId: string;
  toId: string;
  type: RelationType;
}

export interface Family {
  id: string;
  name: string;
  createdBy: string;
}

/** A person plus their computed relationship label to the current user. */
export interface RelatedPerson extends Person {
  /** e.g. "Grandfather", "Sister", "Cousin" — empty for self. */
  relationLabel: string;
  /** Graph generation offset from self: -2 grandparents, 0 self, +1 children. */
  generation: number;
}
