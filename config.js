// ─────────────────────────────────────────────────────────────────
// Supabase config — แก้ 2 ค่านี้ให้ตรงกับ project ของคุณ
// หาได้ที่: Supabase Dashboard → Project Settings → API
//   - Project URL                 → SUPABASE_URL
//   - Project API keys → anon/public → SUPABASE_ANON_KEY
// (ไม่ต้องใส่ service_role key เด็ดขาด — ห้ามใส่ใน frontend)
// ─────────────────────────────────────────────────────────────────
window.APP_CONFIG = {
  SUPABASE_URL:      'https://bdtnjvbpilfbdgvqmxrm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkdG5qdmJwaWxmYmRndnFteHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzUyMjEsImV4cCI6MjA5NDIxMTIyMX0.d7yqtHNpaJc1BJI4Zi1TpvccyV1cv-lql4BRl5Uatyo',
  PROMPTPAY_NUMBER:  '0981784647',   // เบอร์รับเงิน PromptPay (10 หลัก เริ่มด้วย 0) หรือเลขบัตรประชาชน 13 หลัก
  SHOP_NAME:         'เสี่ยจุ้น',
};
