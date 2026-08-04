/**
 * Public runtime configuration. Only ever reads `EXPO_PUBLIC_*` values — these
 * are safe to ship in the app bundle. Secret keys live on the backend.
 */

export const config = {
  /** REST backend base URL, e.g. http://localhost:4000 (legacy-server). */
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, ''),

  /** Firebase web config (public) — enables Google sign-in when set. */
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
  /** Google OAuth client ids for expo-auth-session (public). */
  google: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  },

  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  aiFunctionUrl: process.env.EXPO_PUBLIC_AI_FUNCTION_URL ?? '',
} as const;

/** True once a REST backend is configured. This is the primary data source. */
export const isApiConfigured = config.apiUrl.startsWith('http');

/** Legacy Supabase path (kept for reference). API takes precedence. */
export const isSupabaseConfigured =
  !isApiConfigured && config.supabaseUrl.startsWith('http') && config.supabaseAnonKey.length > 20;
