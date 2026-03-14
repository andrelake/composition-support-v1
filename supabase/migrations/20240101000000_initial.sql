-- =============================================================
-- Composition Support — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- ---------------------------------------------------------------
-- 1. profiles table
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null default '',
  tier        text not null default 'FREE' check (tier in ('FREE', 'PREMIUM')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 2. subscriptions table (for Stripe webhook)
-- ---------------------------------------------------------------
create table if not exists public.subscriptions (
  id                   text primary key,  -- Stripe subscription ID
  user_id              uuid not null references public.profiles(id) on delete cascade,
  status               text not null,     -- active | canceled | past_due | ...
  price_id             text,              -- Stripe price ID
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;

-- profiles: users can only read/update their own row
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- subscriptions: users can only read their own subscriptions
create policy "subscriptions: select own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 4. Trigger — auto-create profile on new user sign-up
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop if already exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- 5. updated_at auto-refresh helper
-- ---------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();
