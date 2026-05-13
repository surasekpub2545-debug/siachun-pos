-- Migration: add image upload + change categories to sizes
-- รันใน Supabase SQL Editor ครั้งเดียว

-- 1) เพิ่ม column image_url
alter table menu_items add column if not exists image_url text;

-- 2) เปลี่ยน category เก่า (juice/smoothie/veg) ให้เป็น 'medium' (default)
update menu_items set cat = 'medium' where cat in ('juice','smoothie','veg');

-- 3) สร้าง storage bucket สำหรับรูปเมนู (public read)
insert into storage.buckets (id, name, public)
values ('menu-images','menu-images', true)
on conflict (id) do nothing;

-- 4) RLS policies สำหรับ storage.objects (เฉพาะ bucket menu-images)
drop policy if exists "anon select menu-images" on storage.objects;
drop policy if exists "anon insert menu-images" on storage.objects;
drop policy if exists "anon update menu-images" on storage.objects;
drop policy if exists "anon delete menu-images" on storage.objects;

create policy "anon select menu-images" on storage.objects for select to anon using (bucket_id = 'menu-images');
create policy "anon insert menu-images" on storage.objects for insert to anon with check (bucket_id = 'menu-images');
create policy "anon update menu-images" on storage.objects for update to anon using (bucket_id = 'menu-images');
create policy "anon delete menu-images" on storage.objects for delete to anon using (bucket_id = 'menu-images');
