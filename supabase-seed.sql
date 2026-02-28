-- Seed data for SUVIDHA (public schema)
-- Run in Supabase SQL editor AFTER supabase-schema.sql

-- Departments
insert into public.departments (name, icon, color, description, "serviceHours", enabled, services)
values
  ('Electricity', '⚡', '#f97316', 'Electricity billing and utility services', '24/7', true,
   '[{"_id":"svc-elec-1","name":"View Current Bill","fee":0,"enabled":true},{"_id":"svc-elec-2","name":"Pay Bill","fee":2.5,"enabled":true},{"_id":"svc-elec-3","name":"Bill History","fee":0,"enabled":true},{"_id":"svc-elec-4","name":"New Connection","fee":50,"enabled":true},{"_id":"svc-elec-5","name":"Raise Complaint","fee":0,"enabled":true}]'::jsonb),
  ('Water', '💧', '#3b82f6', 'Water supply, billing and connection services', '9 AM - 6 PM', true,
   '[{"_id":"svc-water-1","name":"View Bill","fee":0,"enabled":true},{"_id":"svc-water-2","name":"Pay Bill","fee":2.5,"enabled":true},{"_id":"svc-water-3","name":"New Connection","fee":75,"enabled":true},{"_id":"svc-water-4","name":"Raise Complaint","fee":0,"enabled":true}]'::jsonb),
  ('Gas', '🔥', '#ef4444', 'Gas connection, billing and safety services', '9 AM - 5 PM', true,
   '[{"_id":"svc-gas-1","name":"Pay Bill","fee":2.5,"enabled":true},{"_id":"svc-gas-2","name":"New Connection","fee":100,"enabled":true},{"_id":"svc-gas-3","name":"Raise Complaint","fee":0,"enabled":true}]'::jsonb),
  ('Municipal', '🏛️', '#6366f1', 'Municipal corporation tax and civic services', '10 AM - 4 PM', true,
   '[{"_id":"svc-mun-1","name":"Property Tax","fee":2.5,"enabled":true},{"_id":"svc-mun-2","name":"Trade License","fee":5,"enabled":true},{"_id":"svc-mun-3","name":"Birth Certificate","fee":20,"enabled":true},{"_id":"svc-mun-4","name":"Raise Complaint","fee":0,"enabled":true}]'::jsonb)
on conflict (name) do nothing;

-- Kiosks
insert into public.kiosks ("kioskId", location, city, state, ip, status, uptime, "currentSession", "printerStatus", "networkStatus", "softwareVersion", "lastOnline", "totalSessions", "todaySessions")
values
  ('KSK-001','Delhi Zone-A','New Delhi','Delhi','192.168.1.101','online',99.2,'Active','ok','ok','v2.4.1',now(),1842,23),
  ('KSK-002','Delhi Zone-B','New Delhi','Delhi','192.168.1.102','online',98.7,'Idle','ok','ok','v2.4.1',now(),1620,18),
  ('KSK-007','Mumbai Central','Mumbai','Maharashtra','192.168.2.107','offline',87.3,'None','error','down','v2.3.8',now() - interval '12 minutes',980,0),
  ('KSK-013','Chennai South','Chennai','Tamil Nadu','192.168.3.113','maintenance',94.1,'None','ok','ok','v2.4.0',now() - interval '60 minutes',1340,0),
  ('KSK-022','Pune East','Pune','Maharashtra','192.168.4.122','online',99.8,'Active','ok','ok','v2.4.1',now(),2105,31)
on conflict ("kioskId") do nothing;

-- Transactions
insert into public.transactions ("txnId", "paymentId", "deptName", service, account, amount, method, status, "kioskId", location, "failReason", created_at)
values
  ('TXN-8821','PAY-RZP-001','Electricity','Pay Bill','EL123456789',250,'UPI','success','KSK-001','Delhi Zone-A',null,now() - interval '1 day'),
  ('TXN-8820','PAY-RZP-002','Water','Pay Bill','WA987654321',180,'Card','success','KSK-002','Delhi Zone-B',null,now() - interval '2 days'),
  ('TXN-8819','PAY-RZP-003','Gas','Pay Bill','GA556677889',300,'UPI','failed','KSK-007','Mumbai Central','Network timeout',now() - interval '3 days')
on conflict ("txnId") do nothing;

-- Complaints
insert into public.complaints ("complaintId", "deptName", category, account, status, priority, "assignedTo", "kioskId", resolution, created_at)
values
  ('CMP-441','Electricity','Bill amount mismatch','EL123456789','open','high','', 'KSK-001','',now() - interval '10 minutes'),
  ('CMP-440','Water','Payment not reflected','WA987654321','resolved','medium','Priya Singh','KSK-002','Payment manually confirmed',now() - interval '1 hour'),
  ('CMP-439','Gas','Receipt not printed','GA556677889','in_progress','low','Amit Jha','KSK-007','',now() - interval '2 hours')
on conflict ("complaintId") do nothing;

-- CMS
insert into public.cms (type, title, message, active)
values
  ('announcement','Scheduled Maintenance','SUVIDHA kiosks will be offline on 2 Mar 2026 from 2–4 AM.',true),
  ('holiday','Holi Holiday Notice','Services unavailable on 14 March. Happy Holi!',false)
on conflict do nothing;

-- Blacklist
insert into public.blacklist (phone, reason, "addedBy")
values
  ('9876500000','Suspicious activity','system'),
  ('9876500001','Spam complaints','system')
on conflict (phone) do nothing;

-- Settings (single row)
insert into public.settings ("sessionTimeout", "defaultLanguage", "audioGuidance", "loggingLevel", "uiTheme", "printerModel", "printerBaudRate", "paymentMode", "txnFee", "razorpayKeyId", "enabledMethods")
values (5,'hi',true,'info','light','Epson TM-T88VI',9600,'test',2.5,'', '["upi","card","netbanking"]'::jsonb)
on conflict do nothing;
