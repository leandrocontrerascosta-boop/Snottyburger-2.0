-- Sales tables for panel ventas (orders + items)
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  contact_phone text not null,
  location_name text not null,
  location_address text not null,
  fulfillment_method text not null check (fulfillment_method in ('pickup', 'delivery')),
  payment_method text not null check (payment_method in ('cash', 'transfer')),
  status text not null default 'paid' check (status in ('paid', 'pending', 'cancelled')),
  subtotal integer not null default 0,
  delivery_price integer not null default 0,
  total integer not null default 0,
  item_count integer not null default 0,
  delivery_address_label text,
  delivery_lat double precision,
  delivery_lng double precision
);

alter table public.sales_orders drop constraint if exists sales_orders_payment_method_check;

update public.sales_orders
set payment_method = 'transfer'
where payment_method = 'mercado-pago';

alter table public.sales_orders
  add constraint sales_orders_payment_method_check
  check (payment_method in ('cash', 'transfer'));

create table if not exists public.sales_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.sales_orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price integer not null default 0,
  line_total integer not null default 0,
  size_label text check (size_label in ('SIMPLE', 'DOBLE')),
  fries text[] not null default '{}',
  extras text[] not null default '{}',
  observation text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_orders_created_at on public.sales_orders(created_at desc);
create index if not exists idx_sales_orders_status on public.sales_orders(status);
create index if not exists idx_sales_orders_location on public.sales_orders(location_name);
create index if not exists idx_sales_order_items_order_id on public.sales_order_items(order_id);

alter table public.sales_orders enable row level security;
alter table public.sales_order_items enable row level security;

-- Public read because panel is currently open in app. When panel auth is enabled,
-- change this to only authenticated/admin users.
drop policy if exists "public can read sales orders" on public.sales_orders;
create policy "public can read sales orders"
on public.sales_orders
for select
to anon, authenticated
using (true);

drop policy if exists "public can read sales order items" on public.sales_order_items;
create policy "public can read sales order items"
on public.sales_order_items
for select
to anon, authenticated
using (true);
