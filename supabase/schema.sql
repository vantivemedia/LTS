-- ============================================================
-- LTS Elite Prep — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
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
                   check (program in ('futures','high','college','private','trial')),
  preferred_date date,
  preferred_time text,
  message        text,

  -- Admin use
  status         text        not null default 'pending'
                   check (status in ('pending','confirmed','cancelled'))
);

-- ── Row Level Security ───────────────────────────────────────
alter table bookings enable row level security;

-- Anyone can INSERT a booking (public booking form)
create policy "Public can insert bookings"
  on bookings for insert
  to anon
  with check (true);

-- Only authenticated users (admin) can read/update
create policy "Authenticated can read bookings"
  on bookings for select
  to authenticated
  using (true);

create policy "Authenticated can update bookings"
  on bookings for update
  to authenticated
  using (true);

-- ── Index ────────────────────────────────────────────────────
create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_status_idx      on bookings (status);

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

-- Public can insert events (client-side tracking calls)
create policy "Public can insert analytics events"
  on analytics_events for insert
  to anon
  with check (true);

-- Public can read events (admin dashboard uses the anon client, gated by a password screen)
create policy "Public can read analytics events"
  on analytics_events for select
  to anon
  using (true);

create index if not exists analytics_events_created_at_idx on analytics_events (created_at desc);
create index if not exists analytics_events_type_idx       on analytics_events (event_type);
create index if not exists analytics_events_page_idx       on analytics_events (page);
