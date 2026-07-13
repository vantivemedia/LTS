-- ============================================================
-- LTS Elite Prep — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Safe to run on a fresh project or re-run on an existing one —
-- every statement uses IF NOT EXISTS / OR REPLACE.
--
-- Note: this app does not use Supabase Auth. The admin dashboard
-- authenticates with a plain password check in the React app and
-- talks to Supabase using the anon key for everything (reads AND
-- writes). RLS policies below grant the `anon` role what the app
-- actually needs — there is no `authenticated` role in play here.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Bookings table ──────────────────────────────────────────
create table if not exists bookings (
  id             uuid        default gen_random_uuid() primary key,
  created_at     timestamptz default now()            not null,

  -- Athlete info
  name           text        not null,
  email          text        not null,
  phone          text,

  -- Session preferences
  program        text        not null
                   check (program in (
                     'futures','high','college','private','trial',
                     'micro-academy','pass-5','pass-10','pass-usage'
                   )),
  preferred_date date,
  preferred_time text,
  message        text,

  -- Admin use
  status         text        not null default 'pending'
                   check (status in ('pending','confirmed','cancelled'))
);

alter table bookings enable row level security;

drop policy if exists "Public can insert bookings" on bookings;
create policy "Public can insert bookings"
  on bookings for insert
  to anon
  with check (true);

drop policy if exists "Authenticated can read bookings" on bookings;
drop policy if exists "Public can read bookings" on bookings;
create policy "Public can read bookings"
  on bookings for select
  to anon
  using (true);

drop policy if exists "Authenticated can update bookings" on bookings;
drop policy if exists "Public can update bookings" on bookings;
create policy "Public can update bookings"
  on bookings for update
  to anon
  using (true);

create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_status_idx      on bookings (status);

-- ── Camp registrations table ─────────────────────────────────
-- Used by /api/camp and the Admin → Camp tab.
create table if not exists camp_registrations (
  id             uuid        default gen_random_uuid() primary key,
  created_at     timestamptz default now()            not null,

  athlete_name   text        not null,
  parent_name    text        not null,
  parent_email   text        not null,

  camp_id        text,
  camp_name      text,
  amount         text,   -- stored as a display string, e.g. "$249.99"
  package_type   text,   -- 'weekend-1' | 'weekend-2' | 'both' | 'dropin'
  dropin_session text,

  status         text        not null default 'pending_payment'
                   check (status in ('pending_payment','paid','cancelled'))
);

alter table camp_registrations enable row level security;

drop policy if exists "Public can insert camp registrations" on camp_registrations;
create policy "Public can insert camp registrations"
  on camp_registrations for insert
  to anon
  with check (true);

drop policy if exists "Public can read camp registrations" on camp_registrations;
create policy "Public can read camp registrations"
  on camp_registrations for select
  to anon
  using (true);

drop policy if exists "Public can update camp registrations" on camp_registrations;
create policy "Public can update camp registrations"
  on camp_registrations for update
  to anon
  using (true);

create index if not exists camp_registrations_created_at_idx on camp_registrations (created_at desc);

-- ── Pass holders table ───────────────────────────────────────
-- Used by /api/buy-pass, /api/book (session deduction), and Admin → Pass Holders.
create table if not exists pass_holders (
  id             uuid        default gen_random_uuid() primary key,
  created_at     timestamptz default now()            not null,

  name           text        not null,
  email          text        not null,
  phone          text,

  pass_type      text        not null check (pass_type in ('pass-5','pass-10')),
  sessions_total integer     not null,
  sessions_used  integer     not null default 0,

  status         text        not null default 'active'
                   check (status in ('active','expired','cancelled'))
);

alter table pass_holders enable row level security;

drop policy if exists "Public can insert pass holders" on pass_holders;
create policy "Public can insert pass holders"
  on pass_holders for insert
  to anon
  with check (true);

drop policy if exists "Public can read pass holders" on pass_holders;
create policy "Public can read pass holders"
  on pass_holders for select
  to anon
  using (true);

-- Admin +5 / -1 / cancel buttons update this table directly from the browser (anon key)
drop policy if exists "Public can update pass holders" on pass_holders;
create policy "Public can update pass holders"
  on pass_holders for update
  to anon
  using (true);

create index if not exists pass_holders_email_idx  on pass_holders (email);
create index if not exists pass_holders_status_idx on pass_holders (status);

-- ── Classes table ────────────────────────────────────────────
-- Used by /api/admin/classes and Admin → Schedule tab.
create table if not exists classes (
  id           uuid        default gen_random_uuid() primary key,
  created_at   timestamptz default now()            not null,

  title        text        not null,
  description  text,
  program      text        not null default 'futures',
  class_date   date        not null,
  start_time   time        not null,
  end_time     time        not null,
  coach        text,
  capacity     integer     not null default 15,
  booked_count integer     not null default 0
);

alter table classes enable row level security;

drop policy if exists "Public can read classes" on classes;
create policy "Public can read classes"
  on classes for select
  to anon
  using (true);

-- Inserts/updates/deletes go through /api/admin/classes using the service role key,
-- which bypasses RLS — no anon write policy needed here.

create index if not exists classes_class_date_idx on classes (class_date);

-- ── Registrations table (legacy/compat) ──────────────────────
-- Written by /api/register alongside `bookings`, for backwards compatibility.
create table if not exists registrations (
  id         uuid        default gen_random_uuid() primary key,
  created_at timestamptz default now()            not null,

  name       text        not null,
  email      text        not null,
  phone      text,
  type       text,
  amount     text,
  status     text        not null default 'pending_payment'
);

alter table registrations enable row level security;

drop policy if exists "Public can insert registrations" on registrations;
create policy "Public can insert registrations"
  on registrations for insert
  to anon
  with check (true);

drop policy if exists "Public can read registrations" on registrations;
create policy "Public can read registrations"
  on registrations for select
  to anon
  using (true);

-- ── Analytics events table ──────────────────────────────────
-- Tracks page views, button clicks, and form submissions site-wide.
create table if not exists analytics_events (
  id         uuid        default gen_random_uuid() primary key,
  created_at timestamptz default now()            not null,

  event_type text        not null
               check (event_type in ('page_view','button_click','form_submit')),
  page       text        not null,   -- e.g. "/camp"
  label      text,                   -- e.g. "camp_continue", "camp_registration"
  session_id text        not null,   -- random id stored client-side per browser session
  metadata   jsonb
);

alter table analytics_events enable row level security;

drop policy if exists "Public can insert analytics events" on analytics_events;
create policy "Public can insert analytics events"
  on analytics_events for insert
  to anon
  with check (true);

drop policy if exists "Public can read analytics events" on analytics_events;
create policy "Public can read analytics events"
  on analytics_events for select
  to anon
  using (true);

create index if not exists analytics_events_created_at_idx on analytics_events (created_at desc);
create index if not exists analytics_events_type_idx       on analytics_events (event_type);
create index if not exists analytics_events_page_idx       on analytics_events (page);
