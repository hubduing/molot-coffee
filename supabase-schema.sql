-- МОЛОТ·КОФЕ — Supabase schema
-- Выполнить в Supabase Dashboard → SQL Editor
-- Project: https://xpcatojxhxjmfoeayymw.supabase.co

-- Профили (1:1 к auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text default '',
  created_at timestamptz default now()
);

-- Брони столиков
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  date text not null,
  "time" text not null,
  guests text default '',
  zone text default '',
  email text default '',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;

-- profiles: каждый видит/меняет только свой
drop policy if exists "profiles self" on public.profiles;
create policy "profiles self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- bookings: создать может любой (гость без входа тоже бронирует),
-- читать/удалять — только свои
drop policy if exists "bookings insert any" on public.bookings;
create policy "bookings insert any" on public.bookings
  for insert with check (true);

drop policy if exists "bookings select own" on public.bookings;
create policy "bookings select own" on public.bookings
  for select using (auth.uid() = user_id);

drop policy if exists "bookings delete own" on public.bookings;
create policy "bookings delete own" on public.bookings
  for delete using (auth.uid() = user_id);

-- Автосоздание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
