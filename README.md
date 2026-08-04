# Legacy — Family Platform (React Native / Expo)

A digital family home: an interactive family tree, member profiles, and an AI
family assistant. Built with Expo (SDK 57), TypeScript, and expo-router.

> **Runs with zero backend setup.** Until Supabase credentials are provided, the
> app uses a seed family and a local, graph-driven AI. Add credentials to switch
> to the real backend — no code changes needed.

## Quick start

```bash
npm install
npm run ios      # or: npm run android / npm run web
```

## Phase 1 (MVP) — what's implemented

- **Auth flow**: welcome → phone → OTP → profile setup (simulated OTP in demo
  mode; real Supabase phone OTP when configured).
- **Bottom tabs**: Family (tree home), Money, Alerts, Messages, Market, Settings.
  Money & Market are polished "Coming Soon" states per the MVP scope.
- **Family Tree home**: interactive 2D tree with pinch-zoom, pan, and double-tap
  reset; profile + AI icons in the header; add-member FAB.
- **Member profiles**: My Profile vs. other members, auto-computed relationship
  label, and profession shown only for people 18+.
- **Add / edit members** and relationships (parent / child / spouse / sibling).
- **AI assistant**: chat over the family graph (who's related to whom, who lives
  where, who shares a profession). Never invents — says when data is missing.
- **i18n**: English / Русский / O‘zbekcha. English is the default on first launch;
  the choice persists locally.

## Architecture

```
src/
  app/            expo-router routes: (auth), (tabs), family/, ai/
  components/ui/  themed primitives (Text, Button, Card, Avatar, Icon, …)
  components/family/  tree node
  features/       familyTree (layout + canvas), familyMembers (form)
  services/       api (supabase, config, repo, mock), ai (assistant)
  hooks/          use-family, use-app-theme
  store/          auth (zustand + SecureStore)
  i18n/           i18next + en/ru/uz locales
  theme/          design tokens (colors, spacing, radius, shadows, motion)
  types/          domain models
  utils/          relationship inference, ids
supabase/         schema.sql (tables + RLS), functions/ai-assistant (Edge Function)
```

Kinship is a graph: `people` nodes + four primitive `relationships`
(parent/child/spouse/sibling). Tree layout and "who is X to me?" are both derived
(`src/utils/relationships.ts`).

## Connecting the backend

1. Create a Supabase project. Run `supabase/schema.sql` in the SQL editor.
2. Copy `.env.example` → `.env` and set `EXPO_PUBLIC_SUPABASE_URL` and
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy the AI function and set its secret:
   ```bash
   supabase functions deploy ai-assistant
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```
   Set `EXPO_PUBLIC_AI_FUNCTION_URL` to the function URL.

The Anthropic key stays server-side only. The app never contains secret keys.

## Stack

Expo · TypeScript · expo-router · TanStack Query · Zustand · React Hook Form ·
Zod · Reanimated · Gesture Handler · react-native-svg · i18next · Supabase.
