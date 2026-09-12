-- ==============================================================================
-- NISSI SUPER STORES - SUPABASE DATABASE SCHEMA
-- Project: https://ymmpbrktvjoghwirmiqm.supabase.co
-- Run this SQL in your Supabase Dashboard: SQL Editor -> New query -> Run
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create 'products' Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  name_te text,
  category text not null default 'grocery',
  price numeric not null,
  mrp numeric not null,
  unit text not null default '1 kg',
  stock integer not null default 20,
  low_stock_threshold integer not null default 5,
  badge text default 'Fresh',
  description text default '',
  image_2d text,
  fallback_emoji text default '🛒',
  image_bg text default '#F5F5F0',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) and public access policy
alter table public.products enable row level security;

create policy "Allow public read on products"
  on public.products for select
  using (true);

create policy "Allow public insert/update on products"
  on public.products for all
  using (true);

-- 3. Create 'orders' Table
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  address text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  discount_amount numeric not null default 0,
  applied_coupon text,
  delivery_fee numeric not null default 0,
  total_amount numeric not null default 0,
  delivery_type text not null default 'Normal',
  status text not null default 'Placed',
  delivery_window text default 'Within 15 Mins',
  is_emergency boolean default false,
  payment_method text not null default 'COD',
  payment_status text not null default 'Unpaid',
  upi_id text default 'abicharan07@axl',
  utr text default '',
  payment_proof text,
  assigned_rider text default 'Raju M. (+91 91234 56789)',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) and public access policy
alter table public.orders enable row level security;

create policy "Allow public read on orders"
  on public.orders for select
  using (true);

create policy "Allow public insert/update on orders"
  on public.orders for all
  using (true);

-- 4. Enable Supabase Realtime Replication for 'orders' table
alter publication supabase_realtime add table public.orders;
