// Common UI primitives + shared screens (Login, Dashboard, Menu Mgmt, Expenses, TabBar)
// All take a `T` (theme) prop.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────
function FruitDot({ color, size = 44, label, image }) {
  if (image) {
    return (
      <img src={image} alt="" style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        boxShadow: 'inset -3px -4px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        flexShrink: 0, display: 'block',
      }}/>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 32% 28%, ${shade(color, 18)} 0%, ${color} 55%, ${shade(color, -12)} 100%)`,
      boxShadow: 'inset -3px -4px 8px rgba(0,0,0,0.12), inset 2px 3px 6px rgba(255,255,255,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {label && (
        <span style={{
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: size * 0.32, fontWeight: 700,
          color: 'rgba(255,255,255,0.85)',
          textShadow: '0 1px 1px rgba(0,0,0,0.2)',
          letterSpacing: -0.5,
        }}>{label}</span>
      )}
    </div>
  );
}

function toDateInput(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDateThai(yyyymmdd) {
  const d = new Date(yyyymmdd + 'T00:00:00');
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}

function shade(hex, amt) {
  // tiny lighten/darken — amt -100..100
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  const k = (v) => Math.max(0, Math.min(255, Math.round(v + (amt/100)*255)));
  return '#' + [k(r),k(g),k(b)].map(x => x.toString(16).padStart(2,'0')).join('');
}

function Icon({ name, size = 20, color = 'currentColor', stroke = 2 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'cart':     return <svg {...p}><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.5 11h12l2-8H6"/></svg>;
    case 'chart':    return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
    case 'menu':     return <svg {...p}><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>;
    case 'wallet':   return <svg {...p}><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 13h2M2 10h20"/></svg>;
    case 'plus':     return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':    return <svg {...p}><path d="M5 12h14"/></svg>;
    case 'check':    return <svg {...p}><path d="M5 12l5 5L20 6"/></svg>;
    case 'close':    return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'back':     return <svg {...p}><path d="M15 18l-6-6 6-6"/></svg>;
    case 'cash':     return <svg {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v.01M18 15v.01"/></svg>;
    case 'qr':       return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3M20 14v3M14 17v4M17 20h4"/></svg>;
    case 'edit':     return <svg {...p}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
    case 'trash':    return <svg {...p}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"/></svg>;
    case 'search':   return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case 'logout':   return <svg {...p}><path d="M15 17l5-5-5-5M20 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/></svg>;
    case 'user':     return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>;
    case 'dot':      return <svg {...p}><circle cx="12" cy="12" r="3" fill={color} stroke="none"/></svg>;
    case 'up':       return <svg {...p}><path d="M7 14l5-5 5 5"/></svg>;
    case 'down':     return <svg {...p}><path d="M7 10l5 5 5-5"/></svg>;
    case 'leaf':     return <svg {...p}><path d="M11 20A7 7 0 014 13c0-6 6-9 14-9 0 8-3 14-7 16zM4 21l9-9"/></svg>;
    case 'receipt':  return <svg {...p}><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>;
    case 'star':     return <svg {...p}><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>;
    case 'clock':    return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    default: return null;
  }
}

function Pill({ T, children, tone = 'soft', size = 'sm', style }) {
  const palette = {
    soft:   { bg: T.line, fg: T.inkSoft },
    accent: { bg: T.accent, fg: T.accentInk },
    warm:   { bg: T.warm,   fg: '#fff' },
    ghost:  { bg: 'transparent', fg: T.inkSoft, border: `1px solid ${T.line}` },
    danger: { bg: 'rgba(181,72,47,0.1)', fg: T.danger },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size === 'sm' ? '3px 8px' : '6px 12px',
      borderRadius: 999, background: palette.bg, color: palette.fg,
      border: palette.border || 'none',
      fontSize: size === 'sm' ? 11 : 13, fontWeight: 600,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

function Btn({ T, children, onClick, tone = 'accent', size = 'md', icon, disabled, style }) {
  const tones = {
    accent: { bg: T.accent, fg: T.accentInk, hover: shade(T.accent, -8) },
    ghost:  { bg: 'transparent', fg: T.ink, border: `1.5px solid ${T.line}` },
    soft:   { bg: T.surface, fg: T.ink, border: `1px solid ${T.line}` },
    warm:   { bg: T.warm, fg: '#fff' },
    danger: { bg: 'transparent', fg: T.danger, border: `1.5px solid ${T.danger}` },
  };
  const t = tones[tone];
  const sizes = {
    sm: { h: 36, pad: '0 14px', fs: 14 },
    md: { h: 48, pad: '0 20px', fs: 15 },
    lg: { h: 56, pad: '0 24px', fs: 17 },
  }[size];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: sizes.h, padding: sizes.pad, borderRadius: T.r,
      background: t.bg, color: t.fg, border: t.border || 'none',
      fontFamily: T.ff, fontSize: sizes.fs, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'transform .06s, background .15s',
      ...style,
    }}
    onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
    onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
    >
      {icon && <Icon name={icon} size={18}/>}
      {children}
    </button>
  );
}

function ScreenHeader({ T, title, subtitle, right }) {
  return (
    <div style={{
      padding: '18px 20px 12px', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', gap: 12,
    }}>
      <div>
        <h1 style={{
          margin: 0, fontFamily: T.ffDisplay,
          fontSize: 26, fontWeight: 700, letterSpacing: -0.4, color: T.ink,
        }}>{title}</h1>
        {subtitle && (
          <div style={{
            marginTop: 4, fontSize: 13, color: T.inkSoft, fontWeight: 500,
          }}>{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Login (PIN pad)
// ─────────────────────────────────────────────────────────────
function LoginScreen({ T, onLogin }) {
  const [selected, setSelected] = useState(0);
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  function tap(k) {
    if (k === '⌫') return setPin(p => p.slice(0, -1));
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        const user = USERS[selected];
        if (next === user.pin) onLogin(user);
        else { setShake(true); setPin(''); setTimeout(() => setShake(false), 400); }
      }, 150);
    }
  }

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: T.bg,
    }}>
      {/* Brand block */}
      <div style={{ padding: '30px 24px 0', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: T.accent, margin: '0 auto 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: T.shadow,
        }}>
          <Icon name="leaf" size={36} color={T.accentInk} stroke={2}/>
        </div>
        <div style={{
          fontFamily: T.ffDisplay, fontSize: 26, fontWeight: 700, color: T.ink, letterSpacing: -0.3,
        }}>ร้านเสี่ยจุ้น</div>
        <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 4, fontWeight: 500 }}>
          น้ำผลไม้คั้นสด ดั้งเดิม ฿100
        </div>
      </div>

      {/* User picker */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36 }}>
        {USERS.map((u, i) => (
          <button key={u.pin} onClick={() => { setSelected(i); setPin(''); }} style={{
            width: 124, padding: '14px 8px', borderRadius: T.rLg,
            background: selected === i ? T.card : 'transparent',
            border: selected === i ? `1.5px solid ${T.accent}` : `1.5px solid ${T.line}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            cursor: 'pointer', fontFamily: T.ff,
            boxShadow: selected === i ? T.shadow : 'none',
            transition: 'all .15s',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: selected === i ? T.accent : T.line,
              color: selected === i ? T.accentInk : T.inkSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 18,
            }}>{u.initial}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap' }}>{u.name}</div>
            <div style={{ fontSize: 10, color: T.inkMute, fontWeight: 500, whiteSpace: 'nowrap' }}>{u.role}</div>
          </button>
        ))}
      </div>

      {/* PIN dots */}
      <div style={{
        display: 'flex', gap: 14, justifyContent: 'center', marginTop: 36,
        animation: shake ? 'shakeX .35s' : 'none',
      }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: '50%',
            background: pin.length > i ? T.accent : 'transparent',
            border: `1.5px solid ${pin.length > i ? T.accent : T.inkMute}`,
            transition: 'all .12s',
          }}/>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: T.inkMute, marginTop: 10 }}>
        ใส่ PIN 4 หลัก
      </div>

      {/* Keypad */}
      <div style={{
        marginTop: 'auto', padding: '0 30px 50px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
      }}>
        {['1','2','3','4','5','6','7','8','9',' ','0','⌫'].map(k => k === ' ' ? <div key="sp"/> : (
          <button key={k} onClick={() => tap(k)} style={{
            height: 64, borderRadius: T.r,
            background: T.card, border: `1px solid ${T.line}`,
            fontSize: k === '⌫' ? 22 : 26, fontWeight: 500, color: T.ink,
            fontFamily: T.ff, cursor: 'pointer',
          }}>{k}</button>
        ))}
      </div>

      <style>{'@keyframes shakeX{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}'}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
function DashboardScreen({ T, sales, orders, menu, user, onLogout, onDeleteOrder }) {
  const [range, setRange] = useState('day');  // day | week | month
  const [viewDate, setViewDate] = useState(toDateInput(new Date()));
  const [historicOrders, setHistoricOrders] = useState(null);
  const isToday = viewDate === toDateInput(new Date());

  useEffect(() => {
    if (isToday) { setHistoricOrders(null); return; }
    let alive = true;
    window.DB.loadOrdersByDate(viewDate)
      .then(o => { if (alive) setHistoricOrders(o); })
      .catch(e => alert('โหลดประวัติไม่สำเร็จ: ' + (e.message || e)));
    return () => { alive = false; };
  }, [viewDate, isToday]);

  const displayOrders = isToday ? orders : (historicOrders || []);
  const dayRevenue    = displayOrders.reduce((s,o) => s + o.total, 0);
  const dayOrderCount = displayOrders.length;
  const cashTotal     = displayOrders.filter(o => o.pay === 'cash').reduce((s,o)=>s+o.total,0);
  const transferTotal = displayOrders.filter(o => o.pay === 'transfer').reduce((s,o)=>s+o.total,0);

  // range totals from per-day sales buckets (DB-backed, no fake multipliers)
  const sumBuckets = (arr) => arr.reduce(
    (a, b) => ({ orders: a.orders + b.orders, revenue: a.revenue + b.revenue }),
    { orders: 0, revenue: 0 }
  );
  const week  = sumBuckets(sales.slice(-7));
  const month = sumBuckets(sales);
  const cur = !isToday
    ? { orders: dayOrderCount, revenue: dayRevenue }
    : range === 'day'  ? { orders: dayOrderCount, revenue: dayRevenue }
    : range === 'week' ? week : month;
  const rangeLabel = !isToday
    ? `ยอดขาย ${formatDateThai(viewDate)}`
    : range === 'day' ? 'ยอดขายวันนี้' : range === 'week' ? 'ยอดขาย 7 วัน' : 'ยอดขาย 30 วัน';

  async function handleDeleteOrder(o) {
    if (!confirm(`ลบบิล ${o.id} (${fmtTHB(o.total)}) ? ยอดในสรุปจะลดลงด้วย`)) return;
    if (isToday) {
      onDeleteOrder(o.bill_no);
    } else {
      try {
        await window.DB.deleteOrder(o.bill_no);
        setHistoricOrders(prev => (prev || []).filter(x => x.bill_no !== o.bill_no));
      } catch (e) { alert('ลบบิลไม่สำเร็จ: ' + (e.message || e)); }
    }
  }

  // top items: tally from displayed orders' line items
  const topItems = useMemo(() => {
    const tally = {};
    displayOrders.forEach(o => (o.lines || []).forEach(l => {
      tally[l.id] = (tally[l.id] || 0) + l.qty;
    }));
    return Object.entries(tally)
      .map(([id, qty]) => ({ ...menu.find(m => m.id === id), qty }))
      .filter(x => x.id)
      .sort((a,b) => b.qty - a.qty)
      .slice(0, 5);
  }, [displayOrders, menu]);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: T.bg, paddingBottom: 100 }}>
      <ScreenHeader T={T} title="สรุปยอด" subtitle={`สวัสดี ${user.name} · ${new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })}`}
        right={
          <button onClick={onLogout} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: T.card, border: `1px solid ${T.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.inkSoft, cursor: 'pointer',
          }}><Icon name="logout" size={18}/></button>
        }
      />

      {/* Date picker */}
      <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: T.inkSoft, fontWeight: 600 }}>📅</span>
        <input type="date" value={viewDate} max={toDateInput(new Date())}
          onChange={e => setViewDate(e.target.value || toDateInput(new Date()))}
          style={{
            flex: 1, padding: '8px 10px', border: `1px solid ${T.line}`,
            borderRadius: T.rSm, background: T.card, color: T.ink,
            fontFamily: T.ff, fontSize: 13,
          }}/>
        {!isToday && (
          <button onClick={() => setViewDate(toDateInput(new Date()))} style={{
            padding: '8px 12px', borderRadius: T.rSm,
            background: T.accent, color: T.accentInk, border: 'none',
            fontFamily: T.ff, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>วันนี้</button>
        )}
      </div>

      {/* Range tabs — only when viewing today */}
      {isToday && (
        <div style={{ padding: '0 20px', display: 'flex', gap: 6 }}>
          {[
            { id: 'day',   label: 'วันนี้' },
            { id: 'week',  label: '7 วัน' },
            { id: 'month', label: '30 วัน' },
          ].map(r => (
            <button key={r.id} onClick={() => setRange(r.id)} style={{
              flex: 1, height: 38, borderRadius: T.r,
              background: range === r.id ? T.ink : 'transparent',
              color: range === r.id ? T.bg : T.inkSoft,
              border: range === r.id ? 'none' : `1px solid ${T.line}`,
              fontFamily: T.ff, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>{r.label}</button>
          ))}
        </div>
      )}

      {/* Big revenue card */}
      <div style={{
        margin: '14px 20px 0', padding: '20px 22px',
        background: T.accent, borderRadius: T.rLg, color: T.accentInk,
        boxShadow: T.shadow, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.75, letterSpacing: 0.3 }}>
          {rangeLabel}
        </div>
        <div style={{
          fontFamily: T.ffDisplay, fontSize: 42, fontWeight: 700,
          letterSpacing: -1, marginTop: 4,
        }}>{fmtTHB(cur.revenue)}</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 12, opacity: 0.9 }}>
          <span><b style={{ fontSize: 15 }}>{cur.orders}</b> ออเดอร์</span>
          <span>เฉลี่ย <b style={{ fontSize: 15 }}>{fmtTHB(cur.orders ? Math.round(cur.revenue/cur.orders) : 0)}</b>/ออเดอร์</span>
        </div>
        {/* decorative leaf */}
        <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.15 }}>
          <Icon name="leaf" size={120} color={T.accentInk} stroke={1.2}/>
        </div>
      </div>

      {/* Chart */}
      <div style={{
        margin: '12px 20px 0', padding: '16px 18px 14px',
        background: T.card, borderRadius: T.r, border: `1px solid ${T.line}`,
        boxShadow: T.shadow,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>กราฟ 14 วันย้อนหลัง</div>
          <div style={{ fontSize: 11, color: T.inkMute }}>หน่วย: บาท</div>
        </div>
        <BarChart T={T} data={sales.slice(-14)}/>
      </div>

      {/* Payment split */}
      <div style={{ margin: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatCard T={T} icon="cash" label="เงินสด" value={fmtTHB(cashTotal)} sub={`${displayOrders.filter(o=>o.pay==='cash').length} ออเดอร์`} tone="warm"/>
        <StatCard T={T} icon="qr" label="โอน/QR" value={fmtTHB(transferTotal)} sub={`${displayOrders.filter(o=>o.pay==='transfer').length} ออเดอร์`} tone="accent"/>
      </div>

      {/* Top sellers */}
      <div style={{
        margin: '12px 20px 0', padding: '14px 16px',
        background: T.card, borderRadius: T.r, border: `1px solid ${T.line}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>ขายดีวันนี้</div>
          <Pill T={T} tone="ghost">Top 5</Pill>
        </div>
        <div style={{ marginTop: 10 }}>
          {topItems.map((it, i) => (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
            }}>
              <div style={{
                width: 22, fontSize: 13, fontWeight: 700,
                color: i === 0 ? T.warm : T.inkMute, fontFamily: 'ui-monospace, monospace',
              }}>{i+1}</div>
              <FruitDot color={it.color} image={it.image_url} size={32}/>
              <div style={{ flex: 1, fontSize: 14, color: T.ink, fontWeight: 500 }}>{it.name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{it.qty} แก้ว</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ margin: '12px 20px 0', padding: '14px 16px', background: T.card, borderRadius: T.r, border: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>
            {isToday ? 'บิลล่าสุด' : `บิลของ ${formatDateThai(viewDate)} (${displayOrders.length})`}
          </div>
        </div>
        {(isToday ? displayOrders.slice(0, 5) : displayOrders).map((o, i) => (
          <div key={o.id} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
          }}>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: T.inkSoft, width: 48 }}>{o.id}</div>
            <div style={{ fontSize: 12, color: T.inkMute, width: 44 }}>{o.time}</div>
            <Pill T={T} tone={o.pay === 'cash' ? 'soft' : 'ghost'}>{o.pay === 'cash' ? 'เงินสด' : 'โอน'}</Pill>
            <div style={{ flex: 1 }}/>
            <div style={{ fontSize: 13, color: T.inkSoft }}>{o.items} แก้ว</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, fontFamily: 'ui-monospace, monospace' }}>{fmtTHB(o.total)}</div>
            <button onClick={() => handleDeleteOrder(o)} title="ลบบิล" style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'transparent', border: `1px solid ${T.line}`,
              color: T.danger, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, flexShrink: 0,
            }}><Icon name="trash" size={13}/></button>
          </div>
        ))}
        {displayOrders.length === 0 && (
          <div style={{ fontSize: 13, color: T.inkMute, textAlign: 'center', padding: '16px 0' }}>
            ไม่มีบิลในวันนี้
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ T, icon, label, value, sub, tone }) {
  const colors = {
    accent: { dot: T.accent, ring: T.accent + '22' },
    warm:   { dot: T.warm,   ring: T.warm + '22' },
  }[tone] || { dot: T.inkSoft, ring: T.line };
  return (
    <div style={{
      padding: '12px 14px', background: T.card,
      borderRadius: T.r, border: `1px solid ${T.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: colors.ring, color: colors.dot,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={15}/>
        </div>
        <div style={{ fontSize: 12, color: T.inkSoft, fontWeight: 600 }}>{label}</div>
      </div>
      <div style={{ marginTop: 6, fontSize: 19, fontWeight: 700, color: T.ink, fontFamily: T.ffDisplay, letterSpacing: -0.3 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function BarChart({ T, data }) {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 110, marginTop: 12, paddingBottom: 2 }}>
      {data.map((d, i) => {
        const h = (d.revenue / max) * 100;
        const isToday = i === data.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', height: `${h}%`,
              background: isToday ? T.accent : T.accentSoft,
              borderRadius: `${T.rSm/2}px ${T.rSm/2}px 2px 2px`,
              minHeight: 4,
              transition: 'height .4s',
            }}/>
            {(i === 0 || i === 6 || i === 13) && (
              <div style={{ fontSize: 9, color: T.inkMute, fontFamily: 'ui-monospace, monospace' }}>
                {i === 13 ? 'นี้' : i === 6 ? '7วัน' : '14วัน'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Menu Management
// ─────────────────────────────────────────────────────────────
function MenuMgmtScreen({ T, menu, onAddMenu, onUpdateMenu, onDeleteMenu, onToggleStock }) {
  const [editing, setEditing] = useState(null);   // item id or 'new'
  const [filter, setFilter] = useState('all');

  const items = menu.filter(m => filter === 'all' || m.cat === filter);

  function save(item) {
    if (item.id === '__new') {
      const { id, ...rest } = item;
      onAddMenu(rest);
    } else {
      onUpdateMenu(item);
    }
    setEditing(null);
  }
  function del(id) {
    onDeleteMenu(id);
    setEditing(null);
  }
  function toggleStock(id) {
    onToggleStock(id);
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', background: T.bg, paddingBottom: 100, position: 'relative' }}>
      <ScreenHeader T={T} title="จัดการเมนู" subtitle={`${menu.length} รายการ · ${menu.filter(m=>!m.stock).length} หมดสต๊อก`}
        right={
          <Btn T={T} size="sm" icon="plus" onClick={() => setEditing('__new')}>เพิ่ม</Btn>
        }
      />

      {/* Category filter */}
      <div style={{ padding: '0 20px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)} style={{
            padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap',
            background: filter === c.id ? T.ink : T.card,
            color: filter === c.id ? T.bg : T.inkSoft,
            border: filter === c.id ? 'none' : `1px solid ${T.line}`,
            fontFamily: T.ff, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{c.name}</button>
        ))}
      </div>

      <div style={{ padding: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(it => (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', background: T.card,
            borderRadius: T.r, border: `1px solid ${T.line}`,
            opacity: it.stock ? 1 : 0.55,
          }}>
            <FruitDot color={it.color} image={it.image_url} size={42}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                {it.name}
                {it.fav && <Icon name="star" size={12} color={T.warm}/>}
              </div>
              <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2 }}>
                ต้นทุน {fmtTHB(it.cost)} · กำไร {fmtTHB(it.price - it.cost)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, fontFamily: 'ui-monospace, monospace' }}>{fmtTHB(it.price)}</div>
              <button onClick={() => toggleStock(it.id)} style={{
                marginTop: 4, fontSize: 11, fontWeight: 600,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: it.stock ? T.accent : T.danger,
              }}>{it.stock ? '● มี' : '○ หมด'}</button>
            </div>
            <button onClick={() => setEditing(it.id)} style={{
              width: 32, height: 32, borderRadius: 10,
              background: T.surface, border: `1px solid ${T.line}`,
              color: T.inkSoft, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="edit" size={15}/></button>
          </div>
        ))}
      </div>

      {editing && (
        <MenuEditSheet T={T}
          item={editing === '__new' ? { id: '__new', cat: 'none', name: '', price: 100, cost: 30, color: '#F4A540', image_url: null, stock: true, fav: false } : menu.find(m => m.id === editing)}
          onSave={save} onDelete={del} onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function MenuEditSheet({ T, item, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(item);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const colors = ['#F4A540','#E26B6B','#E8C547','#B5D17A','#D5E07A','#F2B743','#E0823A','#EFE7C8','#6B7DB8','#D88FAE','#D85767','#5E5F9E','#9CB279','#7FA86A','#A03658'];

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await window.DB.uploadMenuImage(file);
      setDraft(d => ({ ...d, image_url: url }));
    } catch (err) {
      alert('อัปโหลดรูปไม่สำเร็จ: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  }
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: T.bg, borderRadius: `${T.rLg}px ${T.rLg}px 0 0`,
        padding: '14px 20px 28px', maxHeight: '88%', overflowY: 'auto',
        animation: 'slideUp .25s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{ width: 36, height: 4, background: T.line, borderRadius: 2, margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontFamily: T.ffDisplay, fontSize: 20, fontWeight: 700, color: T.ink }}>
            {item.id === '__new' ? 'เพิ่มเมนูใหม่' : 'แก้ไขเมนู'}
          </h3>
          {item.id !== '__new' && (
            <button onClick={() => onDelete(item.id)} style={{
              background: 'transparent', border: 'none', color: T.danger,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}><Icon name="trash" size={14}/> ลบ</button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <FruitDot color={draft.color} image={draft.image_url} size={68}/>
            {uploading && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 10, fontWeight: 600,
              }}>กำลังอัปโหลด…</div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                padding: '6px 12px', borderRadius: T.rSm,
                background: T.accent, color: T.accentInk, border: 'none',
                fontFamily: T.ff, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                opacity: uploading ? 0.5 : 1,
              }}>{draft.image_url ? 'เปลี่ยนรูป' : '+ อัปโหลดรูป'}</button>
              {draft.image_url && (
                <button onClick={() => setDraft({ ...draft, image_url: null })} style={{
                  padding: '6px 10px', borderRadius: T.rSm,
                  background: 'transparent', border: `1px solid ${T.line}`,
                  color: T.danger, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: T.ff,
                }}>ลบรูป</button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }}/>
            </div>
            <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 6, fontWeight: 600 }}>หรือเลือกสีตัวแทน</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {colors.map(c => (
                <button key={c} onClick={() => setDraft({ ...draft, color: c })} style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: c, cursor: 'pointer',
                  border: draft.color === c ? `2px solid ${T.ink}` : '1px solid rgba(0,0,0,0.1)',
                  padding: 0, opacity: draft.image_url ? 0.4 : 1,
                }}/>
              ))}
            </div>
          </div>
        </div>

        <Field T={T} label="ชื่อเมนู">
          <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="เช่น น้ำส้มคั้นสด" style={inputStyle(T)}/>
        </Field>

        <Field T={T} label="ขนาด (ไม่ระบุก็ได้)">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'small',  name: 'เล็ก' },
              { id: 'medium', name: 'กลาง' },
              { id: 'large',  name: 'ใหญ่' },
              { id: 'none',   name: 'ไม่ระบุ' },
            ].map(c => (
              <button key={c.id} onClick={() => setDraft({ ...draft, cat: c.id })} style={{
                flex: '1 1 60px', height: 40, borderRadius: T.rSm,
                background: draft.cat === c.id ? T.accent : T.card,
                color: draft.cat === c.id ? T.accentInk : T.inkSoft,
                border: draft.cat === c.id ? 'none' : `1px solid ${T.line}`,
                fontFamily: T.ff, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>{c.name}</button>
            ))}
          </div>
        </Field>

        <div style={{ display: 'flex', gap: 10 }}>
          <Field T={T} label="ราคาขาย (บาท)" style={{ flex: 1 }}>
            <input type="number" value={draft.price} onChange={e => setDraft({ ...draft, price: +e.target.value })} style={inputStyle(T)}/>
          </Field>
          <Field T={T} label="ต้นทุน (บาท)" style={{ flex: 1 }}>
            <input type="number" value={draft.cost} onChange={e => setDraft({ ...draft, cost: +e.target.value })} style={inputStyle(T)}/>
          </Field>
        </div>

        <div style={{
          padding: '10px 14px', background: T.surface, borderRadius: T.rSm,
          fontSize: 12, color: T.inkSoft, marginBottom: 16,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>กำไรต่อแก้ว</span>
          <b style={{ color: T.accent, fontSize: 15 }}>{fmtTHB(Math.max(0, draft.price - draft.cost))}</b>
        </div>

        <Btn T={T} size="lg" onClick={() => onSave(draft)} style={{ width: '100%' }} disabled={!draft.name}>
          {item.id === '__new' ? 'เพิ่มเมนู' : 'บันทึก'}
        </Btn>

        <style>{'@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}'}</style>
      </div>
    </div>
  );
}

function Field({ T, label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 6, fontWeight: 600, letterSpacing: 0.2 }}>{label}</div>
      {children}
    </div>
  );
}
function inputStyle(T) {
  return {
    width: '100%', height: 44, padding: '0 14px',
    borderRadius: T.rSm, border: `1px solid ${T.line}`,
    background: T.card, color: T.ink,
    fontFamily: T.ff, fontSize: 15, fontWeight: 500,
    outline: 'none', boxSizing: 'border-box',
  };
}

// ─────────────────────────────────────────────────────────────
// Expenses
// ─────────────────────────────────────────────────────────────
function ExpensesScreen({ T, expenses, onAddExpense, onDeleteExpense }) {
  const [adding, setAdding] = useState(false);
  const today = expenses.filter(e => e.date === 'วันนี้').reduce((s,e) => s+e.amount, 0);
  const month = expenses.reduce((s,e) => s+e.amount, 0);

  function add(item) {
    onAddExpense(item);
    setAdding(false);
  }
  function del(id) {
    onDeleteExpense(id);
  }

  // group by date
  const groups = expenses.reduce((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e); return acc;
  }, {});

  const catColors = {
    'วัตถุดิบ':    T.warm,
    'บรรจุภัณฑ์':  T.accent,
    'ค่าน้ำ-ไฟ':   '#6B7DB8',
    'พนักงาน':    '#A03658',
    'อื่นๆ':       T.inkMute,
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: T.bg, paddingBottom: 100, position: 'relative' }}>
      <ScreenHeader T={T} title="รายจ่าย" subtitle="ติดตามต้นทุน + ค่าใช้จ่าย"
        right={<Btn T={T} size="sm" icon="plus" onClick={() => setAdding(true)}>เพิ่ม</Btn>}
      />

      <div style={{ padding: '0 20px', display: 'flex', gap: 10 }}>
        <div style={{
          flex: 1, padding: '14px 16px', background: T.card,
          borderRadius: T.r, border: `1px solid ${T.line}`,
        }}>
          <div style={{ fontSize: 11, color: T.inkSoft, fontWeight: 600 }}>วันนี้</div>
          <div style={{ marginTop: 4, fontSize: 22, fontWeight: 700, color: T.ink, fontFamily: T.ffDisplay, letterSpacing: -0.3 }}>{fmtTHB(today)}</div>
        </div>
        <div style={{
          flex: 1, padding: '14px 16px', background: T.ink,
          borderRadius: T.r, color: T.bg,
        }}>
          <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>เดือนนี้</div>
          <div style={{ marginTop: 4, fontSize: 22, fontWeight: 700, fontFamily: T.ffDisplay, letterSpacing: -0.3 }}>{fmtTHB(month)}</div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        {Object.entries(groups).map(([date, list]) => (
          <div key={date} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.4 }}>{date}</div>
              <div style={{ flex: 1, height: 1, background: T.line }}/>
              <div style={{ fontSize: 12, color: T.inkMute, fontFamily: 'ui-monospace, monospace' }}>
                {fmtTHB(list.reduce((s,e)=>s+e.amount,0))}
              </div>
            </div>
            <div style={{ background: T.card, borderRadius: T.r, border: `1px solid ${T.line}`, overflow: 'hidden' }}>
              {list.map((e, i) => (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                }}>
                  <div style={{
                    width: 6, height: 36, borderRadius: 3,
                    background: catColors[e.cat] || T.inkMute,
                  }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{e.label}</div>
                    <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2 }}>{e.cat}</div>
                  </div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 700, color: T.ink }}>
                    −{fmtTHB(e.amount)}
                  </div>
                  <button onClick={() => del(e.id)} style={{
                    width: 28, height: 28, border: 'none', background: 'transparent',
                    color: T.inkMute, cursor: 'pointer',
                  }}><Icon name="close" size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {adding && <ExpenseAddSheet T={T} onSave={add} onClose={() => setAdding(false)} catColors={catColors}/>}
    </div>
  );
}

function ExpenseAddSheet({ T, onSave, onClose, catColors }) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('วัตถุดิบ');
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: T.bg, borderRadius: `${T.rLg}px ${T.rLg}px 0 0`,
        padding: '14px 20px 28px',
        animation: 'slideUp .25s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{ width: 36, height: 4, background: T.line, borderRadius: 2, margin: '0 auto 14px' }}/>
        <h3 style={{ margin: '0 0 14px', fontFamily: T.ffDisplay, fontSize: 20, fontWeight: 700, color: T.ink }}>บันทึกรายจ่าย</h3>

        <Field T={T} label="รายการ">
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="เช่น ผลไม้ตลาด" style={inputStyle(T)}/>
        </Field>
        <Field T={T} label="จำนวนเงิน (บาท)">
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" style={{ ...inputStyle(T), fontSize: 22, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}/>
        </Field>
        <Field T={T} label="หมวด">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.keys(catColors).map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: '10px 14px', borderRadius: 999,
                background: cat === c ? catColors[c] : T.card,
                color: cat === c ? '#fff' : T.inkSoft,
                border: cat === c ? 'none' : `1px solid ${T.line}`,
                fontFamily: T.ff, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>{c}</button>
            ))}
          </div>
        </Field>

        <Btn T={T} size="lg" onClick={() => onSave({ label, amount: +amount, cat })} disabled={!label || !amount} style={{ width: '100%' }}>
          บันทึกรายจ่าย
        </Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom Tab Bar
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// User Management (owner only)
// ─────────────────────────────────────────────────────────────
function UsersScreen({ T, users, currentUser, onAddUser, onUpdateUser, onDeleteUser }) {
  const [editing, setEditing] = useState(null);  // pin | '__new' | null

  function startEdit(u) { setEditing(u.pin); }
  function startNew()   { setEditing('__new'); }

  async function save(draft, oldPin) {
    if (oldPin === '__new') await onAddUser(draft);
    else await onUpdateUser(oldPin, draft);
    setEditing(null);
  }
  async function del(pin) {
    if (pin === currentUser.pin) {
      alert('ลบบัญชีตัวเองไม่ได้ — ออกจากระบบก่อน แล้วเข้าด้วยบัญชีอื่นก่อนค่อยลบ');
      return;
    }
    const owners = users.filter(u => u.role === 'เจ้าของร้าน');
    if (owners.length === 1 && owners[0].pin === pin) {
      alert('ลบเจ้าของคนสุดท้ายไม่ได้ — ต้องมีเจ้าของอย่างน้อย 1 คน');
      return;
    }
    if (!confirm(`ลบผู้ใช้ "${users.find(u => u.pin === pin)?.name}" ?`)) return;
    await onDeleteUser(pin);
    setEditing(null);
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', background: T.bg, paddingBottom: 100, position: 'relative' }}>
      <ScreenHeader T={T} title="ผู้ใช้" subtitle={`${users.length} คน · จัดการ PIN และตำแหน่ง`}
        right={<Btn T={T} size="sm" icon="plus" onClick={startNew}>เพิ่ม</Btn>}
      />
      <div style={{ padding: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {users.map(u => (
          <div key={u.pin} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', background: T.card,
            borderRadius: T.r, border: `1px solid ${T.line}`,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: u.role === 'เจ้าของร้าน' ? T.accent : T.line,
              color: u.role === 'เจ้าของร้าน' ? T.accentInk : T.inkSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 18, fontFamily: T.ffDisplay,
            }}>{u.initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                {u.name}
                {u.pin === currentUser.pin && <Pill T={T} tone="soft">คุณ</Pill>}
              </div>
              <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2 }}>
                {u.role} · PIN •••• {u.pin.slice(-1)}
              </div>
            </div>
            <button onClick={() => startEdit(u)} style={{
              width: 32, height: 32, borderRadius: 10,
              background: T.surface, border: `1px solid ${T.line}`,
              color: T.inkSoft, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="edit" size={15}/></button>
          </div>
        ))}
      </div>
      {editing && (
        <UserEditSheet T={T}
          user={editing === '__new' ? { pin: '', name: '', role: 'พนักงาน', initial: '' } : users.find(u => u.pin === editing)}
          isNew={editing === '__new'}
          existingPins={users.map(u => u.pin)}
          onSave={(draft) => save(draft, editing)}
          onDelete={() => del(editing)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function UserEditSheet({ T, user, isNew, existingPins, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState(user);
  const [err, setErr] = useState('');

  function autoInitial(name) {
    return (name?.trim()?.[0] || '').toUpperCase();
  }

  function handleSave() {
    if (!draft.name?.trim()) { setErr('ใส่ชื่อด้วย'); return; }
    if (!/^\d{4}$/.test(draft.pin || '')) { setErr('PIN ต้องเป็นตัวเลข 4 หลัก'); return; }
    if ((isNew || draft.pin !== user.pin) && existingPins.includes(draft.pin)) {
      setErr('PIN นี้มีอยู่แล้ว — เลือกใหม่');
      return;
    }
    const finalDraft = {
      ...draft,
      name: draft.name.trim(),
      initial: (draft.initial?.trim() || autoInitial(draft.name)).slice(0, 2),
    };
    onSave(finalDraft);
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: T.bg, borderRadius: `${T.rLg}px ${T.rLg}px 0 0`,
        padding: '14px 20px 28px', maxHeight: '88%', overflowY: 'auto',
        animation: 'slideUp .25s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{ width: 36, height: 4, background: T.line, borderRadius: 2, margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontFamily: T.ffDisplay, fontSize: 20, fontWeight: 700, color: T.ink }}>
            {isNew ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขผู้ใช้'}
          </h3>
          {!isNew && (
            <button onClick={onDelete} style={{
              background: 'transparent', border: 'none', color: T.danger,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}><Icon name="trash" size={14}/> ลบ</button>
          )}
        </div>

        <Field T={T} label="ชื่อ">
          <input value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value, initial: draft.initial || autoInitial(e.target.value) })}
            placeholder="เช่น น้องบี" style={inputStyle(T)}/>
        </Field>

        <div style={{ display: 'flex', gap: 10 }}>
          <Field T={T} label="PIN (4 หลัก)" style={{ flex: 2 }}>
            <input value={draft.pin} maxLength={4} inputMode="numeric"
              onChange={e => setDraft({ ...draft, pin: e.target.value.replace(/\D/g,'').slice(0,4) })}
              placeholder="0000" style={{ ...inputStyle(T), fontFamily: 'ui-monospace, monospace', letterSpacing: 4 }}/>
          </Field>
          <Field T={T} label="ตัวอักษร" style={{ flex: 1 }}>
            <input value={draft.initial} maxLength={2}
              onChange={e => setDraft({ ...draft, initial: e.target.value })}
              placeholder="ก" style={{ ...inputStyle(T), textAlign: 'center', fontWeight: 700 }}/>
          </Field>
        </div>

        <Field T={T} label="ตำแหน่ง">
          <div style={{ display: 'flex', gap: 6 }}>
            {['เจ้าของร้าน','พนักงาน'].map(r => (
              <button key={r} onClick={() => setDraft({ ...draft, role: r })} style={{
                flex: 1, height: 40, borderRadius: T.rSm,
                background: draft.role === r ? T.accent : T.card,
                color: draft.role === r ? T.accentInk : T.inkSoft,
                border: draft.role === r ? 'none' : `1px solid ${T.line}`,
                fontFamily: T.ff, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>{r}</button>
            ))}
          </div>
        </Field>

        {err && <div style={{ color: T.danger, fontSize: 12, marginBottom: 10 }}>{err}</div>}

        <Btn T={T} size="lg" onClick={handleSave} style={{ width: '100%' }}>
          {isNew ? 'เพิ่มผู้ใช้' : 'บันทึก'}
        </Btn>
      </div>
    </div>
  );
}

function TabBar({ T, current, onChange, user }) {
  const isOwner = user?.role === 'เจ้าของร้าน';
  const tabs = [
    { id: 'pos',       label: 'ขาย',     icon: 'cart' },
    { id: 'dashboard', label: 'สรุปยอด', icon: 'chart' },
    { id: 'menu',      label: 'เมนู',     icon: 'menu' },
    { id: 'expense',   label: 'รายจ่าย', icon: 'wallet' },
    ...(isOwner ? [{ id: 'users', label: 'ผู้ใช้', icon: 'user' }] : []),
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 26, background: T.card,
      borderTop: `1px solid ${T.line}`, zIndex: 50,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 6px 4px' }}>
        {tabs.map(tab => {
          const active = current === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)} style={{
              flex: 1, padding: '6px 4px', background: 'transparent', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? T.accent : T.inkMute, cursor: 'pointer',
              fontFamily: T.ff,
            }}>
              <Icon name={tab.icon} size={22} stroke={active ? 2.2 : 1.8}/>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, {
  FruitDot, Icon, Pill, Btn, ScreenHeader, Field, inputStyle, shade,
  LoginScreen, DashboardScreen, MenuMgmtScreen, ExpensesScreen, UsersScreen, TabBar,
});
