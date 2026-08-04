-- Legacy — Supabase schema + Row Level Security.
-- Run in the Supabase SQL editor (or `supabase db push`). The family graph is
-- modeled as `people` nodes + `relationships` edges, scoped by `family_id`.
-- RLS ensures a user only sees families they are a member of.

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists families (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now()
);

-- Links an auth user to a family (and to their own `people` node).
create table if not exists family_members (
  family_id   uuid not null references families (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  person_id   uuid,
  role        text not null default 'member',
  created_at  timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists people (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families (id) on delete cascade,
  name          text not null,
  photo_url     text,
  date_of_birth date,
  gender        text check (gender in ('male','female','other')),
  phone         text,
  telegram      text,
  profession    text,
  bio           text,
  status        text,
  location      text,
  is_self       boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists relationships (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references families (id) on delete cascade,
  from_id    uuid not null references people (id) on delete cascade,
  to_id      uuid not null references people (id) on delete cascade,
  type       text not null check (type in ('parent','child','spouse','sibling')),
  created_at timestamptz not null default now()
);

create index if not exists people_family_idx on people (family_id);
create index if not exists relationships_family_idx on relationships (family_id);

-- ── Helper: families the current user belongs to ─────────────────────────────

create or replace function current_user_families()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select family_id from family_members where user_id = auth.uid()
$$;

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table families        enable row level security;
alter table family_members  enable row level security;
alter table people          enable row level security;
alter table relationships   enable row level security;

-- Families: members can read; any authenticated user can create.
create policy families_read on families
  for select using (id in (select current_user_families()));
create policy families_insert on families
  for insert with check (auth.uid() = created_by);

-- Membership rows: a user sees their own memberships.
create policy members_read on family_members
  for select using (user_id = auth.uid() or family_id in (select current_user_families()));
create policy members_insert on family_members
  for insert with check (user_id = auth.uid());

-- People + relationships: full access within the user's families.
create policy people_all on people
  for all using (family_id in (select current_user_families()))
  with check (family_id in (select current_user_families()));

create policy relationships_all on relationships
  for all using (family_id in (select current_user_families()))
  with check (family_id in (select current_user_families()));
