/**
 * AI biography generation. Uses the assistant Edge Function when configured
 * (Claude writes a warm biography strictly from the family data); otherwise
 * composes a clean, fact-only biography locally. Never invents.
 */
import type { RelatedPerson } from '@/types/models';
import { ageFromDob, isAdult } from '@/utils/relationships';
import { askAssistant, type AiContext } from './assistant';

type Translate = (key: string, opts?: Record<string, unknown>) => string;

function composeLocalBio(person: RelatedPerson, t: Translate): string {
  const facts: string[] = [person.name];
  if (person.relationLabel && person.relationLabel !== 'You') facts.push(person.relationLabel);
  const age = ageFromDob(person.dateOfBirth);
  if (age !== undefined) facts.push(t('profile.years', { count: age }));
  if (person.profession && isAdult(person.dateOfBirth)) facts.push(person.profession);
  if (person.location) facts.push(person.location);

  return [facts.join(' · '), person.bio, person.status].filter(Boolean).join('\n\n');
}

export async function generateBiography(
  person: RelatedPerson,
  ctx: AiContext,
  t: Translate,
): Promise<string> {
  const question = `Write a warm 3–4 sentence biography of ${person.name} using only the family data. Do not invent anything.`;
  const viaEdge = await askAssistant(question, ctx, t);
  // If the edge function answered (i.e. not the local fallback string), use it.
  // The local askAssistant fallback for this phrasing returns the generic "about"
  // line, so prefer our richer local composer when there's no backend.
  const localAbout = composeLocalBio(person, t);
  return viaEdge && viaEdge.length > localAbout.length ? viaEdge : localAbout;
}
