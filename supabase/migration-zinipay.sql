-- ============================================================
-- ZiniPay integration migration
-- Run this in Supabase SQL Editor (one time)
-- ============================================================

alter table public.orders add column if not exists payment_method text not null default 'usdt';
alter table public.orders add column if not exists invoice_id text;

create index if not exists orders_invoice_id_idx on public.orders (invoice_id);
