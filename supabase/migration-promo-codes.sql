-- ============================================================
-- Promo codes migration
-- Run this in Supabase SQL Editor (one time)
-- ============================================================

-- ---------- PROMO CODES ----------
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'fixed' check (discount_type in ('fixed', 'percent')),
  discount_value numeric not null default 0,
  max_uses integer not null default 0,
  used_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- track which promo was used on an order
alter table public.orders add column if not exists promo_code text;

alter table public.promo_codes enable row level security;

-- RLS: no policies → clients cannot read/write directly.
-- Only the server (service role) accesses this table.