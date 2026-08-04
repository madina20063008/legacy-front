/**
 * AI photo restoration client.
 *
 * Heavy image models must NOT run in the app. A real implementation uploads the
 * photo to a backend (Supabase Storage) and calls a restoration Edge Function
 * that returns a processed image URL. Here we return the original so the
 * before/after flow is demonstrable without a backend.
 */
import { config, isSupabaseConfigured } from '@/services/api/config';

export interface RestoreResult {
  uri: string;
  restored: boolean;
}

export async function restorePhoto(uri: string): Promise<RestoreResult> {
  if (isSupabaseConfigured && config.aiFunctionUrl) {
    try {
      const base = config.aiFunctionUrl.replace(/\/[^/]+$/, '/ai-photo-restore');
      const res = await fetch(base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.supabaseAnonKey}`,
        },
        body: JSON.stringify({ imageUri: uri }),
      });
      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url) return { uri: data.url, restored: true };
      }
    } catch {
      // fall through to demo behavior
    }
  }
  // Demo: echo the original image back as the "restored" result.
  return { uri, restored: false };
}
