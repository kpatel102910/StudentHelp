-- Database schema for Student Help app
-- Run this in your Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null default 'request',
  name text not null,
  email text,
  subject text not null,
  topic text not null,
  description text not null,
  status text not null default 'pending'
    check (status in ('pending', 'in-progress', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists submissions_set_updated_at on public.submissions;

create trigger submissions_set_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

-- Note: No public RLS policies are added by default.
-- The server.js uses SUPABASE_SERVICE_ROLE_KEY for database access,
-- which bypasses RLS. This is secure because the key is server-only
-- and never exposed to the browser.
