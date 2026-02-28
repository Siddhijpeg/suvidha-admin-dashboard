-- Supabase schema for SUVIDHA (public schema)
-- Run in Supabase SQL editor

-- Extensions
create extension if not exists "pgcrypto";

-- Utility function for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text,
  department text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, department, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', ''),
    coalesce(new.raw_user_meta_data->>'department', ''),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Kiosks
create table if not exists public.kiosks (
  id uuid primary key default gen_random_uuid(),
  "kioskId" text unique not null,
  location text not null,
  city text not null,
  state text not null,
  ip text,
  status text default 'offline',
  uptime numeric default 0,
  "currentSession" text default 'None',
  "printerStatus" text default 'unknown',
  "networkStatus" text default 'unknown',
  "softwareVersion" text default 'v1.0.0',
  "lastOnline" timestamptz,
  "totalSessions" integer default 0,
  "todaySessions" integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists kiosks_set_updated_at on public.kiosks;
create trigger kiosks_set_updated_at
before update on public.kiosks
for each row execute procedure public.set_updated_at();

-- Departments
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  icon text default 'office',
  color text default '#3b82f6',
  description text default '',
  "serviceHours" text default '9 AM - 5 PM',
  enabled boolean default true,
  services jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists departments_set_updated_at on public.departments;
create trigger departments_set_updated_at
before update on public.departments
for each row execute procedure public.set_updated_at();

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  "txnId" text unique not null,
  "paymentId" text default '',
  "deptName" text,
  service text,
  account text,
  amount numeric default 0,
  method text default 'NA',
  status text default 'pending',
  "kioskId" text,
  location text,
  "failReason" text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
before update on public.transactions
for each row execute procedure public.set_updated_at();

-- Complaints
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  "complaintId" text unique,
  "deptName" text,
  category text,
  account text,
  description text default '',
  status text default 'open',
  priority text default 'medium',
  "assignedTo" text default '',
  "kioskId" text,
  resolution text default '',
  "resolvedAt" timestamptz,
  "escalatedAt" timestamptz,
  history jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists complaints_set_updated_at on public.complaints;
create trigger complaints_set_updated_at
before update on public.complaints
for each row execute procedure public.set_updated_at();

-- Settings (single row)
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  "sessionTimeout" integer default 5,
  "defaultLanguage" text default 'hi',
  "audioGuidance" boolean default true,
  "loggingLevel" text default 'info',
  "uiTheme" text default 'light',
  "printerModel" text default 'Epson TM-T88VI',
  "printerBaudRate" integer default 9600,
  "paymentMode" text default 'test',
  "txnFee" numeric default 2.5,
  "razorpayKeyId" text default '',
  "enabledMethods" jsonb default '["upi","card","netbanking"]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
before update on public.settings
for each row execute procedure public.set_updated_at();

-- Blacklist
create table if not exists public.blacklist (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  reason text default 'Manual blacklist',
  "addedBy" text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists blacklist_set_updated_at on public.blacklist;
create trigger blacklist_set_updated_at
before update on public.blacklist
for each row execute procedure public.set_updated_at();

-- CMS
create table if not exists public.cms (
  id uuid primary key default gen_random_uuid(),
  type text default 'announcement',
  title text not null,
  message text not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists cms_set_updated_at on public.cms;
create trigger cms_set_updated_at
before update on public.cms
for each row execute procedure public.set_updated_at();

-- Audit logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  "user" text not null,
  role text default '',
  ip text default '',
  detail text default '',
  created_at timestamptz default now()
);
