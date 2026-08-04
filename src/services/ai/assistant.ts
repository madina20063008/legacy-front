/**
 * Family AI assistant client.
 *
 * When the Edge Function is configured, questions + the family graph are sent to
 * a Supabase Edge Function that calls Claude (secret key stays server-side). The
 * function is instructed to answer ONLY from the provided data and never invent.
 *
 * Until then, a local, graph-driven heuristic answers the common questions
 * (relationship, profession, location, "about X") with the same never-guess rule.
 */
import i18n from '@/i18n';
import { api } from '@/services/api/client';
import { config, isApiConfigured, isSupabaseConfigured } from '@/services/api/config';
import type { Person } from '@/types/models';
import { ageFromDob, relationLabel } from '@/utils/relationships';

type Graph = ReturnType<typeof import('@/utils/relationships').buildGraph>;
type Translate = (key: string, opts?: Record<string, unknown>) => string;

export interface AiContext {
  people: Person[];
  graph: Graph;
  selfId: string;
}

const STOPWORDS = new Set([
  'who', 'is', 'a', 'an', 'the', 'in', 'my', 'me', 'to', 'how', 'am', 'i', 'of', 'are',
  'family', 'does', 'do', 'live', 'lives', 'where', 'related', 'related?', 'and', 'our',
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function findPerson(question: string, people: Person[]): Person | undefined {
  const q = question.toLowerCase();
  return people.find(
    (p) => q.includes(p.name.toLowerCase()) || q.includes(p.name.split(' ')[0].toLowerCase()),
  );
}

/** Answer using only the family graph. Returns a localized string. */
export function answerLocally(question: string, ctx: AiContext, t: Translate): string {
  const { people, graph, selfId } = ctx;
  const q = question.toLowerCase().trim();
  const qTokens = tokens(question);
  const person = findPerson(question, people);

  // Greetings / small talk → a friendly guide using a real family name.
  if (/^(hi|hii|hey|hello|yo|salom|assalom|assalomu|privet|привет|здравств)/i.test(q)) {
    const example = people.find((p) => !p.isSelf)?.name.split(' ')[0] ?? 'Aziz';
    return t('ai.answers.greeting', { name: example });
  }

  const labelOf = (p: Person) => p.relation?.trim() || relationLabel(graph, selfId, p).label;
  const others = people.filter((p) => !p.isSelf);
  const self = people.find((p) => p.isSelf);

  // ── About the user themselves ──
  if (self) {
    if (/\b(who\s*am\s*i|who'?m\s*i|what'?s?\s+my\s+name|what\s+is\s+my\s+name|my name|как меня зовут|мо[её]\s+имя|ismim|men kim)\b/.test(q))
      return t('ai.answers.selfName', { name: self.name });
    if (/\b(how\s+old\s+am\s+i|my age|мой возраст|сколько мне лет|yoshim|necha\s+yosh)\b/.test(q)) {
      const age = ageFromDob(self.dateOfBirth);
      return age !== undefined ? t('ai.answers.selfAge', { age }) : t('ai.answers.selfAgeNone');
    }
    if (/\b(where\s+do\s+i\s+live|where\s+am\s+i|где я живу|qayerda\s+yasha|manzilim)\b/.test(q))
      return self.location ? t('ai.answers.selfLocation', { place: self.location }) : t('ai.answers.selfLocationNone');
    if (/\b(what\s+do\s+i\s+do|my\s+(job|profession|work|occupation)|кем я работаю|моя профессия|kasbim)\b/.test(q))
      return self.profession ? t('ai.answers.selfProfession', { profession: self.profession }) : t('ai.answers.selfProfessionNone');
  }

  // "How many people are in my family?"
  if (/how many|number of|nechta|necha ta|скольк/.test(q)) {
    return t('ai.answers.count', { count: people.length });
  }

  // "Who is in my family? / list everyone"
  if (/(who.*(in|are).*(family|member))|(list|all).*(family|member|relativ)|kimlar|a.?zolar|члены семь|вся семь|весь список/.test(q)) {
    if (!others.length) return t('ai.answers.list', { names: self?.name ?? '' });
    return t('ai.answers.list', { names: people.map((p) => p.name).join(', ') });
  }

  // ── "Who is my <relation>?" ── match a relative by their label; if the
  // relation is understood but nobody fills it, say so explicitly.
  const REL_GROUPS: { q: RegExp; label: RegExp }[] = [
    { q: /\b(dad|daddy|father|papa|ota|otam|папа|отец|отца)\b/, label: /father|dad|papa|\bota\b/ },
    { q: /\b(mom|mum|mummy|mommy|mother|mama|ona|onam|мама|мать|матери)\b/, label: /mother|mom|mum|mama|\bona\b/ },
    { q: /\b(brother|aka|uka|брат|брата)\b/, label: /brother|aka|uka/ },
    { q: /\b(sister|opa|singil|сестра|сестры)\b/, label: /sister|opa|singil/ },
    { q: /\b(wife|xotin|жена|жены)\b/, label: /wife|xotin|spouse/ },
    { q: /\b(husband|мужа?|турмуш)\b/, label: /husband|spouse/ },
    { q: /\b(son|o'?g'?il|сын|сына)\b/, label: /\bson\b|o.?g.?il/ },
    { q: /\b(daughter|qiz|дочь|дочери)\b/, label: /daughter|qiz/ },
    { q: /\b(grandfather|grandpa|granddad|bobo|bob|дед|дедушк)\b/, label: /grandfather|grandpa|granddad|bob/ },
    { q: /\b(grandmother|grandma|granny|buvi|buv|бабушк)\b/, label: /grandmother|grandma|granny|buv/ },
    { q: /\b(uncle|amaki|tog'?a|дядя|дяди)\b/, label: /uncle|amaki|tog/ },
    { q: /\b(aunt|xola|amma|тётя|тети)\b/, label: /aunt|xola|amma/ },
    { q: /\b(cousin|amakivachcha|jiyan|двоюродн)\b/, label: /cousin|amakivachcha|jiyan/ },
  ];
  const asksWho = /\bwho\b|\bkim\b|\bкто\b/.test(q) || /\bmy\b|мо[йяё]|мени|мениki/.test(q);
  for (const g of REL_GROUPS) {
    const m = g.q.exec(q);
    if (!m) continue;
    const match = others.find((p) => g.label.test(labelOf(p).toLowerCase()));
    if (match) return t('ai.answers.whoIs', { relation: labelOf(match), name: match.name });
    if (asksWho) return t('ai.answers.noRelative', { relation: m[0] });
  }

  // Generic "who is my <label>" — match by the exact relation word the user typed.
  if (/who is|who'?s|who'?re|кто\b/.test(q)) {
    const match = others.find((p) => {
      const first = labelOf(p).toLowerCase().split(/[\s-]/)[0];
      return first.length > 2 && q.includes(first);
    });
    if (match) return t('ai.answers.whoIs', { relation: labelOf(match), name: match.name });
  }

  const wantsLocation = /\b(where|live|lives|living)\b/.test(q) || /живёт|живет|yasha/.test(q);
  const wantsRelation = /\b(relat|related)\b/.test(q) || /приход|родств|kim bo|qarindosh/.test(q);

  // "Where does X live?"
  if (person && wantsLocation) {
    return person.location
      ? t('ai.answers.livesIn', { name: person.name, place: person.location })
      : t('ai.answers.livesUnknown', { name: person.name });
  }

  // "How am I related to X?"
  if (person && wantsRelation) {
    const { label } = relationLabel(graph, selfId, person);
    if (!label || label === 'Relative') return t('ai.answers.noRelation', { name: person.name });
    return t('ai.answers.relation', { name: person.name, relation: label });
  }

  // Profession query — token overlap with any stored profession.
  const professionMatches = people.filter(
    (p) => p.profession && tokens(p.profession).some((w) => qTokens.includes(w)),
  );
  const asksDoctor = /\bdoctor|physician|врач|shifokor|doktor\b/.test(q);
  const doctorMatches = asksDoctor
    ? people.filter((p) => /doctor|pediatric|physician/i.test(p.profession ?? ''))
    : [];
  const profHits = professionMatches.length ? professionMatches : doctorMatches;
  if ((professionMatches.length || asksDoctor) && qTokens.length) {
    if (!profHits.length) return t('ai.answers.professionNone');
    return t('ai.answers.professionList', { names: profHits.map((p) => p.name).join(', ') });
  }

  // Location query — token matches a stored location.
  const locationMatches = people.filter(
    (p) => p.location && qTokens.includes(p.location.toLowerCase()),
  );
  if (wantsLocation) {
    if (!locationMatches.length) return t('ai.answers.locationNone');
    const place = locationMatches[0].location!;
    return t('ai.answers.locationList', { place, names: locationMatches.map((p) => p.name).join(', ') });
  }

  // "Tell me about X"
  if (person) {
    const { label } = relationLabel(graph, selfId, person);
    const details = [person.profession, person.location, person.bio].filter(Boolean).join('. ');
    if (!details) return t('ai.answers.aboutNoData', { name: person.name });
    return t('ai.answers.about', { name: person.name, relation: label, details });
  }

  return t('ai.answers.fallback');
}

/** Ask the assistant. Uses the Edge Function when available, else the local engine. */
export async function askAssistant(
  question: string,
  ctx: AiContext,
  t: Translate,
): Promise<string> {
  if (isApiConfigured) {
    try {
      const data = await api.post<{ reply: string | null }>('/ai', {
        question,
        language: i18n.language,
      });
      if (data.reply) return data.reply;
    } catch {
      // Fall back to the local engine on any error.
    }
    return answerLocally(question, ctx, t);
  }
  if (isSupabaseConfigured && config.aiFunctionUrl) {
    try {
      const res = await fetch(config.aiFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.supabaseAnonKey}`,
        },
        body: JSON.stringify({
          question,
          language: i18n.language,
          // Only the fields needed to answer — never secrets.
          people: ctx.people.map((p) => ({
            id: p.id,
            name: p.name,
            gender: p.gender,
            profession: p.profession,
            location: p.location,
            dateOfBirth: p.dateOfBirth,
          })),
          selfId: ctx.selfId,
        }),
      });
      if (!res.ok) throw new Error(`AI function ${res.status}`);
      const data = (await res.json()) as { reply?: string };
      if (data.reply) return data.reply;
    } catch {
      // Fall back to the local engine on any network/function error.
    }
  }
  return answerLocally(question, ctx, t);
}
