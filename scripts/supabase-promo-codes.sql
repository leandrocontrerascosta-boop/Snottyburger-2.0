-- Promo codes table for discount codes at checkout
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text null,
  discount_percent integer not null check (discount_percent > 0 and discount_percent <= 100),
  apply_to text not null default 'burgers' check (apply_to in ('burgers', 'total')),
  is_active boolean not null default true,
  max_uses integer null check (max_uses is null or max_uses > 0),
  current_uses integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast lookups when validating codes at checkout
create index if not exists idx_promo_codes_code_active
  on public.promo_codes (code, is_active);

-- Index for admin panel queries
create index if not exists idx_promo_codes_created_at
  on public.promo_codes (created_at desc);

-- Trigger to update updated_at timestamp
drop trigger if exists trg_promo_codes_updated_at on public.promo_codes;
create trigger trg_promo_codes_updated_at
before update on public.promo_codes
for each row execute function public.touch_updated_at();

-- Function to safely increment promo code uses
create or replace function public.increment_promo_code_uses(promo_code text)
returns void
language plpgsql
as $$
begin
  update public.promo_codes
  set current_uses = current_uses + 1
  where code = promo_code and is_active = true;
end;
$$;
