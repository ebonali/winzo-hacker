-- ============================================================
-- Book Editor migration: chapters + settings stored in DB
-- Run this in Supabase SQL Editor (one time)
-- ============================================================

-- ---------- BOOK SETTINGS (single row) ----------
create table if not exists public.book_settings (
  id integer primary key default 1 check (id = 1),
  title text not null default 'WINGO HACKER (জিরো থেকে এডভান্স)',
  subtitle text not null default 'কালার ট্রেডিং এ আর লস নয়, মার্কেট বুঝে ট্রেড করুন — লেখক: Guru Analysis',
  price_usdt numeric not null default 49,
  price_bdt numeric not null default 999,
  wallet_address text not null default 'TQ9xZ8m1uK2v9XpL4wN7yR3mJ8sF1dQ5zA',
  updated_at timestamptz
);

insert into public.book_settings (id) values (1) on conflict (id) do nothing;

-- ---------- CHAPTERS ----------
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique,
  title text not null,
  subtitle text not null default '',
  read_time text not null default '',
  key_takeaways jsonb not null default '[]',
  content text not null default '',
  has_interactive_simulator boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.book_settings enable row level security;
alter table public.chapters enable row level security;

-- RLS: no policies → clients cannot read/write directly.
-- Only the server (service role) accesses these tables.
