-- ============================================================
-- SUVIDHA Admin Dashboard — Supabase SQL Schema
-- Paste this entire file into: Supabase → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password      TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('super_admin','department_admin','operator')),
  department_id UUID,
  is_active     BOOLEAN DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  login_attempts INT DEFAULT 0,
  locked_until  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Departments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT UNIQUE NOT NULL,
  icon          TEXT DEFAULT '🏢',
  color         TEXT DEFAULT '#3b82f6',
  description   TEXT DEFAULT '',
  service_hours TEXT DEFAULT '9 AM – 5 PM',
  enabled       BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Services (child of departments) ──────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  fee           NUMERIC(10,2) DEFAULT 0,
  enabled       BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Kiosks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kiosks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kiosk_id         TEXT UNIQUE NOT NULL,
  location         TEXT NOT NULL,
  city             TEXT NOT NULL,
  state            TEXT NOT NULL,
  ip               TEXT,
  status           TEXT DEFAULT 'offline' CHECK (status IN ('online','offline','maintenance')),
  uptime           NUMERIC(5,2) DEFAULT 0,
  current_session  TEXT DEFAULT 'None',
  printer_status   TEXT DEFAULT 'unknown' CHECK (printer_status IN ('ok','error','unknown')),
  network_status   TEXT DEFAULT 'unknown' CHECK (network_status IN ('ok','down','unknown')),
  software_version TEXT DEFAULT 'v1.0.0',
  last_online      TIMESTAMPTZ,
  total_sessions   INT DEFAULT 0,
  today_sessions   INT DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Transactions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  txn_id        TEXT UNIQUE NOT NULL,
  payment_id    TEXT DEFAULT '',
  department_id UUID REFERENCES departments(id),
  dept_name     TEXT NOT NULL,
  service       TEXT NOT NULL,
  account       TEXT NOT NULL,
  amount        NUMERIC(10,2) DEFAULT 0,
  method        TEXT DEFAULT '—' CHECK (method IN ('UPI','Card','Net Banking','Wallet','—')),
  status        TEXT DEFAULT 'pending' CHECK (status IN ('success','failed','pending')),
  kiosk_id      TEXT,
  location      TEXT,
  fail_reason   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Complaints ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id  TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id),
  dept_name     TEXT NOT NULL,
  category      TEXT NOT NULL,
  account       TEXT NOT NULL,
  description   TEXT DEFAULT '',
  status        TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','escalated','resolved','closed')),
  priority      TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  assigned_to   TEXT DEFAULT '',
  kiosk_id      TEXT,
  resolution    TEXT DEFAULT '',
  resolved_at   TIMESTAMPTZ,
  escalated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Complaint History ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaint_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id  UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status        TEXT,
  changed_by    TEXT,
  note          TEXT,
  changed_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Settings ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_timeout  INT DEFAULT 5,
  default_language TEXT DEFAULT 'hi',
  audio_guidance   BOOLEAN DEFAULT TRUE,
  logging_level    TEXT DEFAULT 'info',
  ui_theme         TEXT DEFAULT 'light',
  printer_model    TEXT DEFAULT 'Epson TM-T88VI',
  payment_mode     TEXT DEFAULT 'test',
  txn_fee          NUMERIC(5,2) DEFAULT 2.5,
  razorpay_key_id  TEXT DEFAULT '',
  enabled_methods  TEXT[] DEFAULT ARRAY['upi','card','netbanking'],
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Blacklist ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blacklist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone      TEXT UNIQUE NOT NULL,
  reason     TEXT DEFAULT 'Manual blacklist',
  added_by   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CMS Announcements ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type       TEXT DEFAULT 'announcement' CHECK (type IN ('announcement','holiday','outage','alert')),
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Audit Logs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action     TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_role  TEXT DEFAULT '',
  ip         TEXT DEFAULT '',
  detail     TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default settings
INSERT INTO settings (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- Departments
INSERT INTO departments (name, icon, color, description, service_hours) VALUES
  ('Electricity', '⚡', '#f97316', 'Electricity billing and utility services', '24/7'),
  ('Water',       '💧', '#3b82f6', 'Water supply and billing services',        '9 AM – 6 PM'),
  ('Gas',         '🔥', '#ef4444', 'Gas connection and billing services',       '9 AM – 5 PM'),
  ('Municipal',   '🏛️', '#6366f1', 'Municipal corporation and civic services',  '10 AM – 4 PM'),
  ('Transport',   '🚌', '#10b981', 'Vehicle registration and permit services',  '10 AM – 3 PM')
ON CONFLICT (name) DO NOTHING;

-- Services for Electricity
INSERT INTO services (department_id, name, fee, enabled)
SELECT id, 'View Current Bill', 0,   TRUE  FROM departments WHERE name='Electricity'
UNION ALL
SELECT id, 'Pay Bill',          2.5, TRUE  FROM departments WHERE name='Electricity'
UNION ALL
SELECT id, 'Bill History',      0,   TRUE  FROM departments WHERE name='Electricity'
UNION ALL
SELECT id, 'New Connection',    50,  TRUE  FROM departments WHERE name='Electricity'
UNION ALL
SELECT id, 'Raise Complaint',   0,   TRUE  FROM departments WHERE name='Electricity';

-- Services for Water
INSERT INTO services (department_id, name, fee, enabled)
SELECT id, 'View Bill',       0,   TRUE FROM departments WHERE name='Water'
UNION ALL
SELECT id, 'Pay Bill',        2.5, TRUE FROM departments WHERE name='Water'
UNION ALL
SELECT id, 'New Connection',  75,  TRUE FROM departments WHERE name='Water'
UNION ALL
SELECT id, 'Raise Complaint', 0,   TRUE FROM departments WHERE name='Water';

-- Services for Gas
INSERT INTO services (department_id, name, fee, enabled)
SELECT id, 'Pay Bill',        2.5, TRUE FROM departments WHERE name='Gas'
UNION ALL
SELECT id, 'New Connection',  100, TRUE FROM departments WHERE name='Gas'
UNION ALL
SELECT id, 'Raise Complaint', 0,   TRUE FROM departments WHERE name='Gas';

-- Services for Municipal
INSERT INTO services (department_id, name, fee, enabled)
SELECT id, 'Property Tax',      2.5, TRUE FROM departments WHERE name='Municipal'
UNION ALL
SELECT id, 'Trade License',     5,   TRUE FROM departments WHERE name='Municipal'
UNION ALL
SELECT id, 'Birth Certificate', 20,  TRUE FROM departments WHERE name='Municipal'
UNION ALL
SELECT id, 'Raise Complaint',   0,   TRUE FROM departments WHERE name='Municipal';

-- Services for Transport
INSERT INTO services (department_id, name, fee, enabled)
SELECT id, 'RC Status',       0,  TRUE  FROM departments WHERE name='Transport'
UNION ALL
SELECT id, 'Driving License', 0,  TRUE  FROM departments WHERE name='Transport'
UNION ALL
SELECT id, 'Vehicle Permit',  10, FALSE FROM departments WHERE name='Transport';

-- Kiosks
INSERT INTO kiosks (kiosk_id, location, city, state, ip, status, uptime, printer_status, network_status, software_version, last_online, total_sessions, today_sessions) VALUES
  ('KSK-001', 'Delhi Zone-A',   'New Delhi', 'Delhi',       '192.168.1.101', 'online',      99.2, 'ok',    'ok',   'v2.4.1', NOW(),                    1842, 23),
  ('KSK-002', 'Delhi Zone-B',   'New Delhi', 'Delhi',       '192.168.1.102', 'online',      98.7, 'ok',    'ok',   'v2.4.1', NOW(),                    1620, 18),
  ('KSK-007', 'Mumbai Central', 'Mumbai',    'Maharashtra', '192.168.2.107', 'offline',     87.3, 'error', 'down', 'v2.3.8', NOW() - INTERVAL '2 hours',980,  0),
  ('KSK-013', 'Chennai South',  'Chennai',   'Tamil Nadu',  '192.168.3.113', 'maintenance', 94.1, 'ok',    'ok',   'v2.4.0', NOW() - INTERVAL '1 hour', 1340, 0),
  ('KSK-022', 'Pune East',      'Pune',      'Maharashtra', '192.168.4.122', 'online',      99.8, 'ok',    'ok',   'v2.4.1', NOW(),                    2105, 31),
  ('KSK-031', 'Hyderabad West', 'Hyderabad', 'Telangana',   '192.168.5.131', 'online',      97.4, 'ok',    'ok',   'v2.4.1', NOW(),                    1755, 19)
ON CONFLICT (kiosk_id) DO NOTHING;
