-- ============================================================
-- Color Trading Mastery — Supabase Schema
-- Run this in Supabase Dashboard -> SQL Editor (one time)
-- ============================================================

-- ---------- PROFILES (synced with auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------- ORDERS (USDT payment submissions) ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  tx_id text not null,
  screenshot_path text,
  amount_usdt numeric not null default 49,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- ---------- BOOK ACCESS (who can read the ebook) ----------
create table if not exists public.book_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  granted_at timestamptz not null default now()
);

-- ---------- Helper: is current auth user an admin? ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ---------- Trigger: auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.book_access enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "read own orders" on public.orders;
create policy "read own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "read own access" on public.book_access;
create policy "read own access"
  on public.book_access for select
  using (auth.uid() = user_id or public.is_admin());

-- ---------- Storage: private bucket for payment screenshots ----------
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

drop policy if exists "users upload own proofs" on storage.objects;
create policy "users upload own proofs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
