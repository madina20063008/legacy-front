/**
 * Supabase client, configured for React Native:
 *  - AsyncStorage-backed auth session persistence
 *  - no URL session detection (there's no browser redirect flow on device)
 *
 * When credentials are absent (`isSupabaseConfigured === false`) we still export
 * a client object, but callers should branch on `isSupabaseConfigured` and use
 * the mock repository instead of hitting the network.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { config, isSupabaseConfigured } from './config';

export const supabase = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseAnonKey || 'public-anon-placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export { isSupabaseConfigured };
