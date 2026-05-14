create extension if not exists pgcrypto;

create table if not exists public.shared_cart_sessions (
  id uuid primary key default gen_random_uuid(),
  pin_4 char(4) not null check (pin_4 ~ '^[0-9]{4}$'),
  owner_token_hash text not null,
  status text not null default 'active' check (status in ('active', 'closed')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_cart_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.shared_cart_sessions(id) on delete cascade,
  item_id text not null,
  product_id text not null,
  quantity integer not null check (quantity > 0),
  selected_choice_ids text[] not null default '{}',
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, item_id)
);

create table if not exists public.shared_cart_join_attempts (
  id bigint generated always as identity primary key,
  ip_address text not null,
  pin_4 char(4) not null check (pin_4 ~ '^[0-9]{4}$'),
  was_success boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_shared_cart_sessions_pin_status_expires
  on public.shared_cart_sessions (pin_4, status, expires_at);

create index if not exists idx_shared_cart_sessions_expires
  on public.shared_cart_sessions (expires_at);

create index if not exists idx_shared_cart_join_attempts_ip_created
  on public.shared_cart_join_attempts (ip_address, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_shared_cart_sessions_updated_at on public.shared_cart_sessions;
create trigger trg_shared_cart_sessions_updated_at
before update on public.shared_cart_sessions
for each row execute function public.touch_updated_at();

drop trigger if exists trg_shared_cart_items_updated_at on public.shared_cart_items;
create trigger trg_shared_cart_items_updated_at
before update on public.shared_cart_items
for each row execute function public.touch_updated_at();

create or replace function public.purge_expired_shared_cart_sessions()
returns integer
language plpgsql
as $$
declare
  deleted_count integer;
begin
  delete from public.shared_cart_sessions where expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
