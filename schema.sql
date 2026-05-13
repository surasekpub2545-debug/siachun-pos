-- ─────────────────────────────────────────────────────────────────
-- ร้านเสี่ยจุ้น POS — Supabase schema
-- เปิด Supabase Dashboard → SQL Editor → paste ทั้งไฟล์นี้ → Run
-- ─────────────────────────────────────────────────────────────────

-- 1) เมนู
create table if not exists menu_items (
  id          text primary key,
  cat         text not null,
  name        text not null,
  price       numeric not null default 0,
  color       text,
  cost        numeric not null default 0,
  stock       boolean not null default true,
  fav         boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- 2) บิล/ออเดอร์
create table if not exists orders (
  bill_no     bigserial primary key,
  pay         text not null check (pay in ('cash','transfer')),
  cashier     text not null,
  items_count int  not null,
  total       numeric not null,
  lines       jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists orders_created_at_idx on orders(created_at desc);

-- 3) รายจ่าย
create table if not exists expenses (
  id          bigserial primary key,
  label       text not null,
  amount      numeric not null,
  cat         text not null,
  created_at  timestamptz not null default now()
);
create index if not exists expenses_created_at_idx on expenses(created_at desc);

-- 4) ผู้ใช้ (PIN ของพนักงาน — แค่ UX gate, ไม่ใช่ security จริง)
create table if not exists app_users (
  pin     text primary key,
  name    text not null,
  role    text not null,
  initial text not null
);

-- ─────────────────────────────────────────────────────────────────
-- Row-Level Security
-- แอพใช้ anon key เปิดจาก browser ใครๆ ก็ใช้ได้
-- ถ้าจะล็อกให้แน่นกว่านี้ ค่อยเปลี่ยนเป็น require auth ทีหลัง
-- ─────────────────────────────────────────────────────────────────
alter table menu_items enable row level security;
alter table orders     enable row level security;
alter table expenses   enable row level security;
alter table app_users  enable row level security;

drop policy if exists "anon all" on menu_items;
drop policy if exists "anon all" on orders;
drop policy if exists "anon all" on expenses;
drop policy if exists "anon read" on app_users;

create policy "anon all"  on menu_items for all to anon using (true) with check (true);
create policy "anon all"  on orders     for all to anon using (true) with check (true);
create policy "anon all"  on expenses   for all to anon using (true) with check (true);
create policy "anon read" on app_users  for select to anon using (true);

-- ─────────────────────────────────────────────────────────────────
-- เปิด Realtime (ให้หลายเครื่อง sync อัตโนมัติ)
-- ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table menu_items;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table expenses;

-- ─────────────────────────────────────────────────────────────────
-- Seed: ผู้ใช้ + เมนู 18 รายการ (ตามต้นแบบ)
-- ─────────────────────────────────────────────────────────────────
insert into app_users (pin, name, role, initial) values
  ('1234', 'เสี่ยจุ้น', 'เจ้าของร้าน', 'จ'),
  ('5678', 'น้องแอม',    'พนักงาน',     'A')
on conflict (pin) do nothing;

insert into menu_items (id, cat, name, price, color, cost, stock, fav, sort_order) values
  ('m01','juice','น้ำส้มคั้นสด',       100,'#F4A540',38,true, true,  1),
  ('m02','juice','น้ำแตงโม',            100,'#E26B6B',32,true, true,  2),
  ('m03','juice','น้ำสับปะรด',          100,'#E8C547',35,true, false, 3),
  ('m04','juice','น้ำฝรั่ง',             100,'#B5D17A',30,true, false, 4),
  ('m05','juice','น้ำมะนาว',            100,'#D5E07A',22,true, true,  5),
  ('m06','juice','น้ำมะม่วง',           100,'#F2B743',40,true, true,  6),
  ('m07','juice','น้ำแครอท',            100,'#E0823A',28,true, false, 7),
  ('m08','juice','น้ำเสาวรส',           100,'#E5A33D',36,false,false, 8),
  ('m09','juice','น้ำมะพร้าวสด',        100,'#EFE7C8',45,true, false, 9),
  ('m10','juice','น้ำอัญชันมะนาว',      100,'#6B7DB8',25,true, false, 10),
  ('m11','smoothie','ปั่นรวมมิตร',       100,'#D88FAE',42,true, true,  11),
  ('m12','smoothie','ปั่นมะม่วง',        100,'#F2B743',44,true, false, 12),
  ('m13','smoothie','ปั่นสตรอว์เบอร์รี', 100,'#D85767',50,true, true,  13),
  ('m14','smoothie','ปั่นบลูเบอร์รี',    100,'#5E5F9E',55,true, false, 14),
  ('m15','smoothie','ปั่นอะโวคาโด',      100,'#9CB279',48,true, false, 15),
  ('m16','veg','น้ำคะน้า-แอปเปิล',      100,'#7FA86A',36,true, false, 16),
  ('m17','veg','น้ำบีทรูท',              100,'#A03658',38,true, false, 17),
  ('m18','veg','น้ำขึ้นฉ่าย-แอปเปิล',   100,'#88AC68',34,false,false, 18)
on conflict (id) do nothing;
