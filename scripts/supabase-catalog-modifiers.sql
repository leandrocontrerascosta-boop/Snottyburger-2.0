-- Catalog modifiers for burgers (extras + fries type)
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.menu_modifier_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  selection_type text not null check (selection_type in ('single', 'multi')),
  sort_order integer not null default 100,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_modifier_choices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  group_slug text not null,
  label text not null,
  price_delta integer not null default 0,
  kind text not null default 'addon' check (kind in ('extra', 'remove', 'addon')),
  sort_order integer not null default 100,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_menu_modifier_group_slug
    foreign key (group_slug)
    references public.menu_modifier_groups(slug)
    on update cascade
    on delete cascade
);

alter table public.menu_modifier_groups enable row level security;
alter table public.menu_modifier_choices enable row level security;

drop policy if exists "public can read active menu modifier groups" on public.menu_modifier_groups;
create policy "public can read active menu modifier groups"
on public.menu_modifier_groups
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "public can read active menu modifier choices" on public.menu_modifier_choices;
create policy "public can read active menu modifier choices"
on public.menu_modifier_choices
for select
to anon, authenticated
using (status = 'active');

-- Seed base groups
insert into public.menu_modifier_groups (slug, title, description, selection_type, sort_order, status)
values
  ('fries-type', 'Tipo de papas', 'Elegi como queres las papas incluidas.', 'single', 10, 'active'),
  ('extras', 'Extras', null, 'multi', 20, 'active')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  selection_type = excluded.selection_type,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

-- Seed fries choices
insert into public.menu_modifier_choices (slug, group_slug, label, price_delta, kind, sort_order, status)
values
  ('fries-seasoned', 'fries-type', 'Sazonadas', 0, 'addon', 10, 'active'),
  ('fries-plain', 'fries-type', 'Sin sazon', 0, 'addon', 20, 'active')
on conflict (slug) do update set
  group_slug = excluded.group_slug,
  label = excluded.label,
  price_delta = excluded.price_delta,
  kind = excluded.kind,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();

-- Seed extras choices
insert into public.menu_modifier_choices (slug, group_slug, label, price_delta, kind, sort_order, status)
values
  ('extra-cheddar', 'extras', 'Queso cheddar', 1000, 'extra', 10, 'active'),
  ('extra-mayo-pot', 'extras', 'Pote de mayo', 600, 'extra', 20, 'active'),
  ('extra-egg', 'extras', 'Huevo', 500, 'extra', 30, 'active'),
  ('extra-bacon', 'extras', 'Bacon', 800, 'extra', 40, 'active'),
  ('extra-patty-double-cheese', 'extras', 'Medallon extra (con doble queso)', 3500, 'addon', 50, 'active')
on conflict (slug) do update set
  group_slug = excluded.group_slug,
  label = excluded.label,
  price_delta = excluded.price_delta,
  kind = excluded.kind,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = now();
