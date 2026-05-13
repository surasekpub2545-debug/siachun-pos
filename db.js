// ─────────────────────────────────────────────────────────────────
// Data-access layer ที่ห่อ Supabase ไว้
// แอพเรียกผ่าน window.DB.* ทั้งหมด — ถ้าจะเปลี่ยน backend ทีหลัง
// แก้แค่ไฟล์นี้ที่เดียวพอ
// ─────────────────────────────────────────────────────────────────

(function () {
  const cfg = window.APP_CONFIG || {};
  const ok = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('YOUR-PROJECT')
          && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY');

  if (!ok) {
    document.body.innerHTML = `
      <div style="padding:24px;font-family:system-ui;line-height:1.6;color:#27241D;background:#F2EBDB;height:100vh">
        <h2 style="margin:0 0 12px">⚠ ยังไม่ได้ตั้งค่า Supabase</h2>
        <p>เปิดไฟล์ <code style="background:#fff;padding:2px 6px;border-radius:4px">config.js</code> แล้วใส่ค่า:</p>
        <ul>
          <li><b>SUPABASE_URL</b> — จาก Dashboard → Settings → API</li>
          <li><b>SUPABASE_ANON_KEY</b> — anon/public key ตัวเดียวกัน</li>
        </ul>
        <p>แล้วอย่าลืม run <code>schema.sql</code> ใน SQL Editor ก่อนนะครับ</p>
      </div>`;
    throw new Error('Supabase not configured');
  }

  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 5 } },
  });

  // ─── Loaders ────────────────────────────────────────────────────
  async function loadUsers() {
    const { data, error } = await sb.from('app_users').select('*');
    if (error) throw error;
    return data;
  }

  async function loadMenu() {
    const { data, error } = await sb.from('menu_items')
      .select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  }

  async function loadExpenses() {
    const { data, error } = await sb.from('expenses')
      .select('*').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return data.map(rowToExpense);
  }

  async function loadTodayOrders() {
    const since = startOfTodayISO();
    const { data, error } = await sb.from('orders')
      .select('*').gte('created_at', since).order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(rowToOrder);
  }

  async function loadSales30d() {
    const since = startOfDaysAgoISO(29);
    const { data, error } = await sb.from('orders')
      .select('created_at,total').gte('created_at', since);
    if (error) throw error;
    return aggregateSales(data, 30);
  }

  async function loadAll() {
    const [menu, expenses, orders, sales, users] = await Promise.all([
      loadMenu(), loadExpenses(), loadTodayOrders(), loadSales30d(), loadUsers(),
    ]);
    return { menu, expenses, orders, sales, users };
  }

  // ─── Mutations ──────────────────────────────────────────────────
  async function addMenu(item) {
    const ts = Date.now();
    const id = 'm' + String(ts).slice(-6);
    // sort_order must fit int32 — use seconds-since-epoch (good until 2038)
    const row = { ...item, id, sort_order: Math.floor(ts / 1000) };
    const { data, error } = await sb.from('menu_items').insert(row).select().single();
    if (error) throw error;
    return data;
  }
  async function updateMenu(item) {
    const { id, ...rest } = item;
    const { error } = await sb.from('menu_items').update(rest).eq('id', id);
    if (error) throw error;
  }
  async function deleteMenu(id) {
    const { error } = await sb.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  }
  async function toggleMenuStock(id, stock) {
    const { error } = await sb.from('menu_items').update({ stock }).eq('id', id);
    if (error) throw error;
  }

  async function addExpense(item) {
    const row = { label: item.label, amount: item.amount, cat: item.cat };
    const { data, error } = await sb.from('expenses').insert(row).select().single();
    if (error) throw error;
    return rowToExpense(data);
  }
  async function deleteExpense(id) {
    const { error } = await sb.from('expenses').delete().eq('id', id);
    if (error) throw error;
  }

  async function addOrder({ pay, cashier, items, total, lines }) {
    const row = { pay, cashier, items_count: items, total, lines };
    const { data, error } = await sb.from('orders').insert(row).select().single();
    if (error) throw error;
    return rowToOrder(data);
  }

  async function deleteOrder(billNo) {
    const { error } = await sb.from('orders').delete().eq('bill_no', billNo);
    if (error) throw error;
  }

  async function loadOrdersByDate(dateStr) {
    const start = new Date(dateStr + 'T00:00:00');
    const end   = new Date(start.getTime() + 86400000);
    const { data, error } = await sb.from('orders').select('*')
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(rowToOrder);
  }

  async function uploadMenuImage(file) {
    const rawExt = (file.name.split('.').pop() || 'png').toLowerCase();
    const ext = rawExt.replace(/[^a-z0-9]/g, '') || 'png';
    const path = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await sb.storage.from('menu-images').upload(path, file, {
      cacheControl: '3600', upsert: false, contentType: file.type || 'image/png',
    });
    if (error) throw error;
    const { data } = sb.storage.from('menu-images').getPublicUrl(path);
    return data.publicUrl;
  }

  // ─── Realtime ───────────────────────────────────────────────────
  function subscribe({ onMenu, onExpense, onOrder }) {
    const ch = sb.channel('siachun-pos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, async () => onMenu && onMenu(await loadMenu()))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses'   }, async () => onExpense && onExpense(await loadExpenses()))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders'     }, async () => {
         if (!onOrder) return;
         const [orders, sales] = await Promise.all([loadTodayOrders(), loadSales30d()]);
         onOrder(orders, sales);
      })
      .subscribe();
    return () => sb.removeChannel(ch);
  }

  // ─── Mappers / utils ────────────────────────────────────────────
  function rowToOrder(r) {
    const d = new Date(r.created_at);
    return {
      bill_no: r.bill_no,
      id:      '#' + String(r.bill_no).padStart(4, '0'),
      time:    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      created_at: r.created_at,
      items:   r.items_count,
      total:   Number(r.total),
      pay:     r.pay,
      cashier: r.cashier,
      lines:   r.lines || [],
    };
  }

  function rowToExpense(r) {
    return {
      id:     'e' + r.id,
      _rawId: r.id,
      date:   relDate(new Date(r.created_at)),
      label:  r.label,
      amount: Number(r.amount),
      cat:    r.cat,
    };
  }

  function relDate(d) {
    const today = new Date(); today.setHours(0,0,0,0);
    const that  = new Date(d); that.setHours(0,0,0,0);
    const diff  = Math.round((today - that) / 86400000);
    if (diff <= 0) return 'วันนี้';
    if (diff === 1) return 'เมื่อวาน';
    if (diff < 7)  return diff + ' วันก่อน';
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  }

  function startOfTodayISO() {
    const d = new Date(); d.setHours(0,0,0,0); return d.toISOString();
  }
  function startOfDaysAgoISO(n) {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - n); return d.toISOString();
  }

  function aggregateSales(rows, days) {
    const buckets = Array.from({ length: days }, () => ({ orders: 0, revenue: 0 }));
    const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - (days - 1));
    for (const r of rows) {
      const d = new Date(r.created_at); d.setHours(0,0,0,0);
      const idx = Math.round((d - start) / 86400000);
      if (idx >= 0 && idx < days) {
        buckets[idx].orders += 1;
        buckets[idx].revenue += Number(r.total);
      }
    }
    return buckets.map((b, i) => ({ day: i, orders: b.orders, revenue: b.revenue }));
  }

  window.DB = {
    loadAll, loadMenu, loadExpenses, loadTodayOrders, loadSales30d, loadUsers,
    addMenu, updateMenu, deleteMenu, toggleMenuStock, uploadMenuImage,
    addExpense, deleteExpense,
    addOrder, deleteOrder, loadOrdersByDate,
    subscribe,
  };
})();
