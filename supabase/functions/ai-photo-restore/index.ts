/**
 * Legacy — AI photo restoration Edge Function (Supabase / Deno). STUB.
 *
 * Wire this to an image-restoration provider (e.g. Replicate GFP-GAN / a
 * colorization model). The provider API key stays in this function's env, never
 * in the app. Flow: app uploads the photo to Supabase Storage, passes the URL
 * here, this function runs restoration and returns the processed image URL.
 *
 * Deploy:  supabase functions deploy ai-photo-restore
 * Secret:  supabase secrets set RESTORE_PROVIDER_KEY=...
 */

const PROVIDER_KEY = Deno.env.get('RESTORE_PROVIDER_KEY') ?? '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  const { imageUri } = (await req.json().catch(() => ({}))) as { imageUri?: string };
  if (!imageUri) return json({ error: 'imageUri required' }, 400);

  if (!PROVIDER_KEY) {
    // Not configured yet — tell the client to fall back to the demo flow.
    return json({ error: 'Restoration provider not configured', url: null }, 200);
  }

  // TODO: call the restoration provider with `imageUri` + PROVIDER_KEY,
  // poll for completion, then return the processed image URL.
  // const url = await restoreWithProvider(imageUri, PROVIDER_KEY);
  return json({ url: imageUri });
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}
