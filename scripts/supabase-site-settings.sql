-- Site settings table for dynamic content (story, etc.)
-- Run in Supabase SQL Editor.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Insert default story (adjust text as needed)
insert into public.site_settings (key, value)
values (
  'story',
  '{"title": "Nuestra Historia", "body": "Snottyburger arranco como una cocina chica obsesionada por hacer la burger perfecta: pan suave, carne con sello propio y salsas caseras. Hoy seguimos con la misma regla: todo fresco, sin atajos y con sabor real.", "updatedAt": "2026-01-01T00:00:00.000Z"}'::jsonb
)
on conflict (key) do nothing;
