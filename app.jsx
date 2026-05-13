// Main App — wires login + tabs + state, persists everything to Supabase.

const { useState: uS, useMemo: uM, useEffect: uE } = React;

function App({ theme }) {
  const T = window.THEMES[theme];

  const [user, setUser]         = uS(null);
  const [screen, setScreen]     = uS('pos');   // pos | dashboard | menu | expense | users
  const [cart, setCart]         = uS({});
  const [menu, setMenu]         = uS([]);
  const [expenses, setExpenses] = uS([]);
  const [orders, setOrders]     = uS([]);
  const [sales, setSales]       = uS([]);
  const [users, setUsers]       = uS([]);
  const [ready, setReady]       = uS(false);
  const [err, setErr]           = uS(null);

  // Initial load + realtime subscription
  uE(() => {
    let unsub;
    (async () => {
      try {
        const all = await DB.loadAll();
        window.USERS = all.users;     // LoginScreen reads from window.USERS
        setUsers(all.users);
        setMenu(all.menu);
        setExpenses(all.expenses);
        setOrders(all.orders);
        setSales(all.sales);
        setReady(true);
        unsub = DB.subscribe({
          onMenu:    (m)    => setMenu(m),
          onExpense: (e)    => setExpenses(e),
          onOrder:   (o, s) => { setOrders(o); setSales(s); },
        });
      } catch (e) {
        console.error(e);
        setErr(e.message || String(e));
      }
    })();
    return () => unsub && unsub();
  }, []);

  async function checkout(payMethod) {
    const lines = cartLines(cart, menu);
    const total = lines.reduce((s,l) => s+l.line, 0);
    const items = lines.reduce((s,l) => s+l.qty, 0);
    setCart({});
    try {
      const saved = await DB.addOrder({
        pay: payMethod, cashier: user.name, items, total, lines,
      });
      setOrders(prev => [saved, ...prev]);
      setSales(prev => {
        if (!prev.length) return prev;
        const next = prev.slice();
        const last = { ...next[next.length - 1] };
        last.orders += 1;
        last.revenue += total;
        next[next.length - 1] = last;
        return next;
      });
    } catch (e) {
      alert('บันทึกบิลไม่สำเร็จ: ' + (e.message || e));
    }
  }

  // ── Menu mutations ───────────────────────────────────────────
  async function onAddMenu(item) {
    try {
      const saved = await DB.addMenu(item);
      setMenu(prev => [...prev, saved]);
    } catch (e) { alert('เพิ่มเมนูไม่สำเร็จ: ' + (e.message || e)); }
  }
  async function onUpdateMenu(item) {
    setMenu(prev => prev.map(m => m.id === item.id ? item : m));
    try { await DB.updateMenu(item); }
    catch (e) { alert('แก้เมนูไม่สำเร็จ: ' + (e.message || e)); }
  }
  async function onDeleteMenu(id) {
    setMenu(prev => prev.filter(m => m.id !== id));
    try { await DB.deleteMenu(id); }
    catch (e) { alert('ลบเมนูไม่สำเร็จ: ' + (e.message || e)); }
  }
  async function onToggleMenuStock(id) {
    let updated;
    setMenu(prev => {
      const next = prev.map(m => m.id === id ? { ...m, stock: !m.stock } : m);
      updated = next.find(m => m.id === id);
      return next;
    });
    try { await DB.toggleMenuStock(id, updated.stock); }
    catch (e) { alert('อัปเดตสต๊อกไม่สำเร็จ: ' + (e.message || e)); }
  }

  // ── User mutations ───────────────────────────────────────────
  async function onAddUser(u) {
    try {
      const saved = await DB.addUser(u);
      setUsers(prev => [...prev, saved]);
      window.USERS = [...users, saved];
    } catch (e) { alert('เพิ่มผู้ใช้ไม่สำเร็จ: ' + (e.message || e)); throw e; }
  }
  async function onUpdateUser(oldPin, u) {
    try {
      await DB.updateUser(oldPin, u);
      const next = users.map(x => x.pin === oldPin ? u : x);
      setUsers(next);
      window.USERS = next;
      if (user?.pin === oldPin) setUser(u);  // keep current session in sync
    } catch (e) { alert('แก้ไขผู้ใช้ไม่สำเร็จ: ' + (e.message || e)); throw e; }
  }
  async function onDeleteUser(pin) {
    try {
      await DB.deleteUser(pin);
      const next = users.filter(x => x.pin !== pin);
      setUsers(next);
      window.USERS = next;
    } catch (e) { alert('ลบผู้ใช้ไม่สำเร็จ: ' + (e.message || e)); throw e; }
  }

  // ── Order mutations ──────────────────────────────────────────
  async function onDeleteOrder(billNo) {
    const target = orders.find(o => o.bill_no === billNo);
    setOrders(prev => prev.filter(o => o.bill_no !== billNo));
    if (target) {
      setSales(prev => {
        if (!prev.length) return prev;
        const next = prev.slice();
        const last = { ...next[next.length - 1] };
        last.orders  = Math.max(0, last.orders - 1);
        last.revenue = Math.max(0, last.revenue - target.total);
        next[next.length - 1] = last;
        return next;
      });
    }
    try { await DB.deleteOrder(billNo); }
    catch (e) { alert('ลบบิลไม่สำเร็จ: ' + (e.message || e)); }
  }

  // ── Expense mutations ────────────────────────────────────────
  async function onAddExpense(item) {
    try {
      const saved = await DB.addExpense(item);
      setExpenses(prev => [saved, ...prev]);
    } catch (e) { alert('เพิ่มรายจ่ายไม่สำเร็จ: ' + (e.message || e)); }
  }
  async function onDeleteExpense(displayId) {
    const target = expenses.find(e => e.id === displayId);
    setExpenses(prev => prev.filter(e => e.id !== displayId));
    if (!target) return;
    try { await DB.deleteExpense(target._rawId); }
    catch (e) { alert('ลบรายจ่ายไม่สำเร็จ: ' + (e.message || e)); }
  }

  if (err) return <SetupError T={T} message={err}/>;
  if (!ready) return <Loading T={T}/>;

  if (!user) return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: T.bg, fontFamily: T.ff, color: T.ink }}>
      <LoginScreen T={T} onLogin={setUser}/>
    </div>
  );

  let main;
  if (screen === 'pos') {
    const Comp = { 'grid-bottom': POSGridBottom, 'list-drawer': POSListDrawer, 'cards-sheet': POSCardsSheet }[T.layout];
    main = <Comp T={T} menu={menu} cart={cart} setCart={setCart} onCheckout={checkout} user={user}/>;
  } else if (screen === 'dashboard') {
    main = <DashboardScreen T={T} sales={sales} orders={orders} menu={menu} user={user} onLogout={() => setUser(null)} onDeleteOrder={onDeleteOrder}/>;
  } else if (screen === 'menu') {
    main = <MenuMgmtScreen T={T} menu={menu}
              onAddMenu={onAddMenu} onUpdateMenu={onUpdateMenu}
              onDeleteMenu={onDeleteMenu} onToggleStock={onToggleMenuStock}/>;
  } else if (screen === 'expense') {
    main = <ExpensesScreen T={T} expenses={expenses}
              onAddExpense={onAddExpense} onDeleteExpense={onDeleteExpense}/>;
  } else if (screen === 'users') {
    main = <UsersScreen T={T} users={users} currentUser={user}
              onAddUser={onAddUser} onUpdateUser={onUpdateUser} onDeleteUser={onDeleteUser}/>;
  } else if (screen === 'report') {
    main = <ReportScreen T={T}/>;
  }

  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'hidden',
      background: T.bg, fontFamily: T.ff, color: T.ink,
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      {main}
      <TabBar T={T} current={screen} onChange={setScreen} user={user}/>
    </div>
  );
}

function Loading({ T }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: T.bg, color: T.inkSoft, fontFamily: T.ff, fontSize: 14, gap: 10, flexDirection: 'column',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `3px solid ${T.line}`, borderTopColor: T.accent,
        animation: 'spin 0.7s linear infinite',
      }}/>
      <div>กำลังโหลดข้อมูล…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function SetupError({ T, message }) {
  return (
    <div style={{
      padding: 24, height: '100%', background: T.bg, color: T.ink, fontFamily: T.ff,
      lineHeight: 1.6, overflow: 'auto',
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>⚠ เชื่อมต่อ Supabase ไม่ได้</div>
      <div style={{ background: T.card, padding: 12, borderRadius: T.rSm, fontSize: 13, fontFamily: 'monospace', color: T.danger, marginBottom: 16, wordBreak: 'break-word' }}>{message}</div>
      <div style={{ fontSize: 14, color: T.inkSoft }}>
        ตรวจสอบ:
        <ol style={{ paddingLeft: 18, marginTop: 6 }}>
          <li>ใส่ค่า URL + anon key ใน <code>config.js</code> ครบไหม</li>
          <li>รัน <code>schema.sql</code> ใน Supabase แล้วหรือยัง</li>
          <li>ตาราง menu_items, orders, expenses, app_users มีอยู่ในฐานข้อมูลไหม</li>
        </ol>
      </div>
    </div>
  );
}

window.App = App;
