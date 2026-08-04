/**
 * Legacy — AI family assistant Edge Function (Supabase / Deno).
 *
 * Receives a question + the family graph from the app and asks Claude to answer
 * strictly from that data. The Anthropic API key lives ONLY in this function's
 * environment (`supabase secrets set ANTHROPIC_API_KEY=...`) — never in the app.
 *
 * Deploy:  supabase functions deploy ai-assistant
 */

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const MODEL = 'claude-sonnet-4-6';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Body {
  question: string;
  language?: 'en' | 'ru' | 'uz';
  selfId: string;
  people: {
    id: string;
    name: string;
    gender?: string;
    profession?: string;
    location?: string;
    dateOfBirth?: string;
  }[];
}

const LANGUAGE_NAME: Record<string, string> = {
  en: 'English',
  ru: 'Russian',
  uz: 'Uzbek',
};

function systemPrompt(language: string): string {
  const lang = LANGUAGE_NAME[language] ?? 'English';
  return [
    'You are the family assistant inside the Legacy app.',
    'You answer questions about the user\'s family using ONLY the JSON family data provided in the user message.',
    'The data lists people (with id, name, gender, profession, location, date of birth) and the id of the current user (selfId).',
    'Rules:',
    '- Use only the provided data. NEVER invent names, relationships, professions, or locations.',
    '- If the data does not contain enough information to answer, clearly say the family data does not have that information.',
    '- Be warm, concise, and specific.',
    `- Always respond in ${lang}.`,
  ].join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  try {
    const body = (await req.json()) as Body;
    if (!ANTHROPIC_API_KEY) {
      return json({ error: 'AI is not configured on the server.' }, 500);
    }

    const userContent = [
      `Question: ${body.question}`,
      `Current user id (selfId): ${body.selfId}`,
      `Family data (JSON):`,
      JSON.stringify(body.people),
    ].join('\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system: systemPrompt(body.language ?? 'en'),
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!res.ok) {
      return json({ error: `Anthropic error ${res.status}` }, 502);
    }
    const data = await res.json();
    const reply = data?.content?.[0]?.text ?? '';
    return json({ reply });
  } catch (err) {
    return json({ error: String(err) }, 400);
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}
