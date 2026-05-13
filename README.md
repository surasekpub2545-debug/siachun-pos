# ร้านเสี่ยจุ้น POS

แอพลงยอดขายร้านน้ำผลไม้ — host บน **GitHub Pages** + ฐานข้อมูล **Supabase**

PIN เริ่มต้น: `1234` (เสี่ยจุ้น) · `5678` (น้องแอม)

---

## 🚀 ติดตั้ง 4 ขั้นตอน

### 1) สร้างตารางใน Supabase

1. เปิด project ที่ [supabase.com](https://supabase.com) → **SQL Editor** → **New query**
2. เปิดไฟล์ `schema.sql` ใน repo นี้ → copy ทั้งไฟล์ → paste ใน SQL Editor → กด **Run**
3. จะได้ตาราง 4 ตัว + seed เมนู 18 รายการ + ผู้ใช้ 2 คน

### 2) ใส่ Supabase keys ใน `config.js`

หา 2 ค่านี้จาก Supabase Dashboard → **Project Settings → API**:
- **Project URL**
- **anon / public key**

แล้วแก้ `config.js`:

```js
window.APP_CONFIG = {
  SUPABASE_URL:      'https://xxxxxxxxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOi.....',
};
```

> ⚠ **อย่า** ใส่ `service_role` key เด็ดขาด — นั่นคือ admin key ที่ใส่ใน frontend ไม่ได้

### 3) Push ขึ้น GitHub

```bash
git init
git add .
git commit -m "Initial: ร้านเสี่ยจุ้น POS"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 4) เปิด GitHub Pages

1. GitHub repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**, Folder: **/ (root)** → **Save**
4. รอ ~1 นาที จะได้ URL หน้าตา `https://<user>.github.io/<repo>/`
5. เปิดในมือถือ → กดเมนู browser → **Add to Home Screen** จะได้ไอคอนเหมือนแอพ

---

## 📁 โครงสร้างไฟล์

```
├── index.html        ← entry point
├── config.js         ← ⚠ ใส่ Supabase URL + key ตรงนี้
├── db.js             ← data-access layer (เรียก Supabase + realtime)
├── schema.sql        ← รันใน Supabase SQL Editor ครั้งเดียว
├── app.jsx           ← main App + state
├── data.jsx          ← utility (fmtTHB, categories)
├── themes.jsx        ← สี + รูปแบบ
├── screens.jsx       ← Login, Dashboard, Menu, Expenses
├── pos.jsx           ← หน้าขาย (POS)
├── .nojekyll         ← บอก GitHub Pages ว่าอย่า process ผ่าน Jekyll
└── compare.html      ← (เก่า) canvas เปรียบเทียบ 3 variant
```

---

## 🔒 หมายเหตุเรื่องความปลอดภัย

- **PIN login เป็นแค่ UX gate** — ไม่ใช่ระบบล็อกอินจริง (anon key อ่าน app_users ได้)
- ตอนนี้ตั้ง RLS ให้ **anon access ทำ CRUD ได้ทุก table** — เหมาะกับร้านเดียวที่คนทั่วไปไม่รู้ URL
- ถ้าจะทำให้แน่นกว่านี้: ย้ายไปใช้ **Supabase Auth** (email/password ต่อพนักงาน) + RLS เข้มขึ้น

---

## 🛠 ใช้งานต่อ

- **เพิ่ม/แก้/ลบเมนู** → tab "เมนู" — sync ทุกเครื่องอัตโนมัติ
- **บันทึกบิล** → tab "ขาย" → เลือกเงินสด/โอน → บิลเข้า DB ทันที
- **ดูยอด** → tab "สรุป" — กราฟ 14 วันคำนวณจาก DB จริง
- **รายจ่าย** → tab "รายจ่าย"
- **แก้สีเขียว/ขนาด** → แก้ใน `themes.jsx` ตัว `THEME_CLASSIC`
- **เพิ่มพนักงาน** → ใน Supabase Dashboard → Table editor → `app_users` → Insert row

---

## ⚠ ถ้าเปิดแล้วเจอ "เชื่อมต่อ Supabase ไม่ได้"

1. เช็คว่ารัน `schema.sql` แล้ว (Dashboard → Table editor ต้องเห็น 4 ตาราง)
2. เช็คว่า `config.js` ใส่ URL + key ครบ ไม่มี `YOUR-PROJECT` หลงเหลือ
3. ดูใน browser console (F12) จะเห็น error ละเอียดกว่า
