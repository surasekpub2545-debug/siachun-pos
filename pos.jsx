// Three POS layouts, sharing the same state model.
// Each receives: T, menu, cart, setCart, onCheckout, user

const { useState: useS, useRef: useR, useEffect: useE } = React;

// ─────────────────────────────────────────────────────────────
// Shared cart math
// ─────────────────────────────────────────────────────────────
function cartLines(cart, menu) {
  return Object.entries(cart).map(([id, qty]) => {
    const item = menu.find(m => m.id === id);
    return item ? { ...item, qty, line: item.price * qty } : null;
  }).filter(Boolean);
}
function cartTotal(cart, menu) {
  return cartLines(cart, menu).reduce((s, l) => s + l.line, 0);
}
function cartCount(cart) {
  return Object.values(cart).reduce((s, n) => s + n, 0);
}

// ═════════════════════════════════════════════════════════════
// VARIANT A — Cafe Classic: top grid, sticky cart bar
// ═════════════════════════════════════════════════════════════
function POSGridBottom({ T, menu, cart, setCart, onCheckout, user }) {
  const [cat, setCat] = useS('all');
  const [showCart, setShowCart] = useS(false);
  const [pay, setPay] = useS(null);          // null | 'cash' | 'transfer'
  const [received, setReceived] = useS('');

  const items = menu.filter(m => cat === 'all' || m.cat === cat);
  const total = cartTotal(cart, menu);
  const count = cartCount(cart);

  function add(id) { setCart({ ...cart, [id]: (cart[id] || 0) + 1 }); }
  function sub(id) {
    const n = (cart[id] || 0) - 1;
    const next = { ...cart };
    if (n <= 0) delete next[id]; else next[id] = n;
    setCart(next);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <ScreenHeader T={T} title="หน้าขาย" subtitle={`พนักงาน: ${user.name} · ${new Date().toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})}`}/>

      {/* Category tabs */}
      <div style={{ padding: '0 20px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            padding: '8px 16px', borderRadius: 999, whiteSpace: 'nowrap',
            background: cat === c.id ? T.ink : 'transparent',
            color: cat === c.id ? T.bg : T.inkSoft,
            border: cat === c.id ? 'none' : `1px solid ${T.line}`,
            fontFamily: T.ff, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{c.name}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {items.map(it => {
            const q = cart[it.id] || 0;
            return (
              <button key={it.id} disabled={!it.stock} onClick={() => add(it.id)} style={{
                background: T.card, borderRadius: T.r,
                border: q > 0 ? `1.5px solid ${T.accent}` : `1px solid ${T.line}`,
                padding: '14px 12px 12px', textAlign: 'left',
                cursor: it.stock ? 'pointer' : 'not-allowed',
                opacity: it.stock ? 1 : 0.4,
                fontFamily: T.ff, position: 'relative',
                boxShadow: q > 0 ? `0 0 0 3px ${T.accent}20` : T.shadow,
                transition: 'all .15s',
              }}>
                <FruitDot color={it.color} image={it.image_url} size={48}/>
                <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: T.ink, lineHeight: 1.2, minHeight: 32, textWrap: 'pretty' }}>{it.name}</div>
                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.ink, fontFamily: 'ui-monospace, monospace' }}>{fmtTHB(it.price)}</span>
                  {!it.stock && <Pill T={T} tone="danger">หมด</Pill>}
                  {it.fav && it.stock && <Icon name="star" size={12} color={T.warm}/>}
                </div>
                {q > 0 && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    minWidth: 26, height: 26, borderRadius: 13,
                    background: T.accent, color: T.accentInk,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, padding: '0 8px',
                  }}>{q}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky cart bar */}
      {count > 0 && (
        <div style={{
          position: 'absolute', bottom: 76, left: 12, right: 12,
          padding: '10px 14px 10px 14px',
          background: T.accent, borderRadius: T.rLg,
          color: T.accentInk, display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 6px 20px rgba(61,90,64,0.35)', cursor: 'pointer',
          animation: 'cartIn .25s cubic-bezier(.2,.7,.3,1)',
        }} onClick={() => setShowCart(true)}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14,
          }}>{count}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>ตะกร้า ({count} แก้ว)</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'ui-monospace, monospace', letterSpacing: -0.3 }}>{fmtTHB(total)}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>ดู ›</div>
        </div>
      )}

      {/* Cart sheet */}
      {showCart && (
        <CartSheet T={T} cart={cart} menu={menu} onAdd={add} onSub={sub}
          onClose={() => setShowCart(false)}
          onPay={() => { setShowCart(false); setPay('select'); }}
          total={total}/>
      )}

      {/* Payment flow */}
      {pay === 'select' && <PaymentSelect T={T} total={total} onCancel={() => setPay(null)} onPick={(p) => setPay(p)}/>}
      {pay === 'cash'     && <PaymentCash T={T} total={total} received={received} setReceived={setReceived} onBack={() => setPay('select')} onConfirm={() => { onCheckout('cash'); setPay('done'); }}/>}
      {pay === 'transfer' && <PaymentQR T={T} total={total} onBack={() => setPay('select')} onConfirm={() => { onCheckout('transfer'); setPay('done'); }}/>}
      {pay === 'done'     && <PaymentDone T={T} onClose={() => { setPay(null); setReceived(''); }}/>}

      <style>{'@keyframes cartIn{from{transform:translateY(120%);opacity:0}to{transform:translateY(0);opacity:1}}'}</style>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// VARIANT B — Minimal Cream: list, side-drawer cart
// ═════════════════════════════════════════════════════════════
function POSListDrawer({ T, menu, cart, setCart, onCheckout, user }) {
  const [cat, setCat] = useS('all');
  const [search, setSearch] = useS('');
  const [showCart, setShowCart] = useS(false);
  const [pay, setPay] = useS(null);
  const [received, setReceived] = useS('');

  const items = menu.filter(m =>
    (cat === 'all' || m.cat === cat) &&
    (!search || m.name.includes(search))
  );
  const total = cartTotal(cart, menu);
  const count = cartCount(cart);

  function add(id) { setCart({ ...cart, [id]: (cart[id] || 0) + 1 }); }
  function sub(id) {
    const n = (cart[id] || 0) - 1;
    const next = { ...cart };
    if (n <= 0) delete next[id]; else next[id] = n;
    setCart(next);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflow: 'hidden', position: 'relative' }}>
      {/* Slim top header */}
      <div style={{
        padding: '18px 20px 6px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ fontSize: 11, color: T.inkMute, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>หน้าขาย</div>
          <div style={{ fontFamily: T.ffDisplay, fontSize: 22, fontWeight: 700, color: T.ink, marginTop: 2 }}>เลือกเมนู</div>
        </div>
        <div style={{ fontSize: 12, color: T.inkSoft }}>กะ {user.name}</div>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 20px 0', position: 'relative' }}>
        <Icon name="search" size={16} color={T.inkMute} style={{ position: 'absolute', left: 34, top: 22 }}/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเมนู..." style={{
          width: '100%', height: 44, padding: '0 14px 0 40px',
          borderRadius: 999, border: `1px solid ${T.line}`,
          background: T.card, color: T.ink,
          fontFamily: T.ff, fontSize: 14, fontWeight: 500,
          outline: 'none', boxSizing: 'border-box',
        }}/>
        <div style={{ position: 'absolute', left: 34, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', height: 44 }}>
          <Icon name="search" size={16} color={T.inkMute}/>
        </div>
      </div>

      {/* Category chips */}
      <div style={{ padding: '10px 20px 0', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            padding: '6px 12px', borderRadius: 8,
            background: 'transparent',
            color: cat === c.id ? T.accent : T.inkMute,
            border: 'none', whiteSpace: 'nowrap',
            borderBottom: cat === c.id ? `2px solid ${T.accent}` : '2px solid transparent',
            fontFamily: T.ff, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            paddingBottom: 8,
          }}>{c.name}</button>
        ))}
      </div>
      <div style={{ height: 1, background: T.line, margin: '0 20px' }}/>

      {/* List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 100px' }}>
        {items.map((it, i) => {
          const q = cart[it.id] || 0;
          return (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 0',
              borderBottom: i === items.length - 1 ? 'none' : `1px solid ${T.line}`,
              opacity: it.stock ? 1 : 0.4,
            }}>
              <FruitDot color={it.color} image={it.image_url} size={44}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {it.name}
                  {it.fav && <Icon name="star" size={11} color={T.warm}/>}
                </div>
                <div style={{ fontSize: 13, color: T.inkSoft, marginTop: 2, fontFamily: 'ui-monospace, monospace' }}>
                  {fmtTHB(it.price)}
                  {!it.stock && <span style={{ marginLeft: 8, color: T.danger, fontFamily: T.ff }}>· หมด</span>}
                </div>
              </div>
              {q > 0 ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: T.accent + '14', borderRadius: 999, padding: 3,
                }}>
                  <button onClick={() => sub(it.id)} style={qBtn(T)}><Icon name="minus" size={14}/></button>
                  <span style={{ minWidth: 22, textAlign: 'center', fontSize: 14, fontWeight: 700, color: T.accent }}>{q}</span>
                  <button onClick={() => add(it.id)} style={qBtn(T, true)}><Icon name="plus" size={14} color={T.accentInk}/></button>
                </div>
              ) : (
                <button onClick={() => it.stock && add(it.id)} disabled={!it.stock} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'transparent', border: `1.5px solid ${it.stock ? T.accent : T.line}`,
                  color: it.stock ? T.accent : T.inkMute, cursor: it.stock ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name="plus" size={18}/></button>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating cart button (right) */}
      {count > 0 && (
        <button onClick={() => setShowCart(true)} style={{
          position: 'absolute', bottom: 88, right: 18,
          height: 54, padding: '0 18px 0 14px', borderRadius: 999,
          background: T.ink, color: T.bg, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontFamily: T.ff,
          animation: 'cartIn .25s cubic-bezier(.2,.7,.3,1)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: T.accent, color: T.accentInk,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
          }}>{count}</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>ตะกร้า</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{fmtTHB(total)}</div>
          </div>
        </button>
      )}

      {showCart && <CartSheet T={T} cart={cart} menu={menu} onAdd={add} onSub={sub}
        onClose={() => setShowCart(false)}
        onPay={() => { setShowCart(false); setPay('select'); }} total={total}/>}
      {pay === 'select' && <PaymentSelect T={T} total={total} onCancel={() => setPay(null)} onPick={(p) => setPay(p)}/>}
      {pay === 'cash'     && <PaymentCash T={T} total={total} received={received} setReceived={setReceived} onBack={() => setPay('select')} onConfirm={() => { onCheckout('cash'); setPay('done'); }}/>}
      {pay === 'transfer' && <PaymentQR T={T} total={total} onBack={() => setPay('select')} onConfirm={() => { onCheckout('transfer'); setPay('done'); }}/>}
      {pay === 'done'     && <PaymentDone T={T} onClose={() => { setPay(null); setReceived(''); }}/>}
    </div>
  );
}
function qBtn(T, primary) {
  return {
    width: 30, height: 30, borderRadius: '50%',
    background: primary ? T.accent : 'transparent',
    border: 'none', cursor: 'pointer',
    color: primary ? T.accentInk : T.accent,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

// ═════════════════════════════════════════════════════════════
// VARIANT C — Bold cards, bottom sheet
// ═════════════════════════════════════════════════════════════
function POSCardsSheet({ T, menu, cart, setCart, onCheckout, user }) {
  const [cat, setCat] = useS('all');
  const [pay, setPay] = useS(null);
  const [received, setReceived] = useS('');

  const items = menu.filter(m => cat === 'all' || m.cat === cat);
  const total = cartTotal(cart, menu);
  const count = cartCount(cart);

  function add(id) { setCart({ ...cart, [id]: (cart[id] || 0) + 1 }); }
  function sub(id) {
    const n = (cart[id] || 0) - 1;
    const next = { ...cart };
    if (n <= 0) delete next[id]; else next[id] = n;
    setCart(next);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: T.bg, overflow: 'hidden', position: 'relative' }}>
      {/* Curved hero header */}
      <div style={{
        background: T.ink, color: '#F0E6D1',
        padding: '18px 22px 28px',
        borderRadius: `0 0 ${T.rLg}px ${T.rLg}px`,
        position: 'relative', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>ร้านเสี่ยจุ้น</div>
            <div style={{ fontFamily: T.ffDisplay, fontSize: 26, fontWeight: 700, marginTop: 2, color: '#F0E6D1' }}>วันนี้รับอะไรดี?</div>
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: T.accent, color: T.accentInk,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
          }}>{user.initial}</div>
        </div>

        {/* Category chips inside hero */}
        <div style={{ marginTop: 14, display: 'flex', gap: 8, overflowX: 'auto' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              padding: '8px 14px', borderRadius: 999,
              background: cat === c.id ? T.accent : 'rgba(240,230,209,0.12)',
              color: cat === c.id ? T.accentInk : '#F0E6D1',
              border: 'none', whiteSpace: 'nowrap',
              fontFamily: T.ff, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>{c.name}</button>
          ))}
        </div>
      </div>

      {/* Big cards */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px 140px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {items.map(it => {
            const q = cart[it.id] || 0;
            return (
              <button key={it.id} disabled={!it.stock} onClick={() => add(it.id)} style={{
                background: T.card, borderRadius: T.rLg,
                border: 'none', padding: 0, overflow: 'hidden',
                cursor: it.stock ? 'pointer' : 'not-allowed',
                opacity: it.stock ? 1 : 0.4, textAlign: 'left',
                fontFamily: T.ff, position: 'relative',
                boxShadow: q > 0 ? `0 0 0 3px ${T.accent}` : T.shadow,
                transition: 'all .15s',
              }}>
                {/* Big color block */}
                <div style={{
                  height: 110, background: `linear-gradient(140deg, ${shade(it.color, 14)} 0%, ${it.color} 60%, ${shade(it.color, -10)} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    width: 64, height: 80, borderRadius: '50% 50% 12px 12px',
                    background: `linear-gradient(180deg, transparent 0%, transparent 30%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.55) 100%)`,
                    boxShadow: 'inset 0 -8px 12px rgba(255,255,255,0.4), inset 2px 2px 6px rgba(255,255,255,0.5), 0 4px 10px rgba(0,0,0,0.15)',
                    position: 'relative',
                  }}>
                    {/* liquid */}
                    <div style={{
                      position: 'absolute', left: 4, right: 4, bottom: 4, top: 32,
                      background: `linear-gradient(180deg, ${shade(it.color, -8)} 0%, ${it.color} 100%)`,
                      borderRadius: '50% 50% 8px 8px / 25% 25% 8px 8px',
                    }}/>
                  </div>
                  {it.fav && (
                    <div style={{ position: 'absolute', top: 8, left: 8 }}>
                      <Pill T={T} tone="warm"><Icon name="star" size={10} color="#fff"/> เด็ด</Pill>
                    </div>
                  )}
                  {!it.stock && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff',
                    }}>หมดวันนี้</div>
                  )}
                </div>
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, lineHeight: 1.2, minHeight: 32, textWrap: 'pretty' }}>{it.name}</div>
                  <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.ink, fontFamily: 'ui-monospace, monospace' }}>{fmtTHB(it.price)}</span>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: q > 0 ? T.accent : T.bg + '14',
                      color: q > 0 ? T.accentInk : T.accent,
                      border: q > 0 ? 'none' : `1.5px solid ${T.accent}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700,
                    }}>{q > 0 ? q : <Icon name="plus" size={14}/>}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permanent bottom sheet */}
      <div style={{
        position: 'absolute', bottom: 76, left: 0, right: 0,
        background: T.ink, color: '#F0E6D1',
        borderRadius: `${T.rLg}px ${T.rLg}px 0 0`,
        padding: count > 0 ? '14px 18px 14px' : '12px 18px',
        boxShadow: '0 -8px 20px rgba(0,0,0,0.12)',
        transition: 'all .25s',
      }}>
        {count > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, overflowX: 'auto' }}>
              {cartLines(cart, menu).slice(0, 4).map(l => (
                <div key={l.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(240,230,209,0.1)', padding: '4px 10px 4px 4px',
                  borderRadius: 999, flexShrink: 0,
                }}>
                  <FruitDot color={l.color} image={l.image_url} size={24}/>
                  <span style={{ fontSize: 12, color: '#F0E6D1', fontWeight: 600 }}>×{l.qty}</span>
                </div>
              ))}
              {cartLines(cart, menu).length > 4 && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>+{cartLines(cart, menu).length - 4} อย่าง</div>
              )}
            </div>
            <button onClick={() => setPay('select')} style={{
              width: '100%', height: 52, borderRadius: T.r,
              background: T.accent, color: T.accentInk, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 18px', fontFamily: T.ff, fontSize: 15, fontWeight: 700,
            }}>
              <span>คิดเงิน · {count} แก้ว</span>
              <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 18 }}>{fmtTHB(total)}</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.55 }}>
            <Icon name="cart" size={18} color="#F0E6D1"/>
            <span style={{ fontSize: 13, fontWeight: 500 }}>แตะเมนูเพื่อเพิ่มลงตะกร้า</span>
          </div>
        )}
      </div>

      {pay === 'select' && <PaymentSelect T={T} total={total} onCancel={() => setPay(null)} onPick={(p) => setPay(p)} cartLines={cartLines(cart, menu)} onSub={sub} onAdd={add}/>}
      {pay === 'cash'     && <PaymentCash T={T} total={total} received={received} setReceived={setReceived} onBack={() => setPay('select')} onConfirm={() => { onCheckout('cash'); setPay('done'); }}/>}
      {pay === 'transfer' && <PaymentQR T={T} total={total} onBack={() => setPay('select')} onConfirm={() => { onCheckout('transfer'); setPay('done'); }}/>}
      {pay === 'done'     && <PaymentDone T={T} onClose={() => { setPay(null); setReceived(''); }}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared: Cart Sheet
// ─────────────────────────────────────────────────────────────
function CartSheet({ T, cart, menu, onAdd, onSub, onClose, onPay, total }) {
  const lines = cartLines(cart, menu);
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: T.bg,
        borderRadius: `${T.rLg}px ${T.rLg}px 0 0`,
        padding: '14px 0 28px', maxHeight: '82%', display: 'flex', flexDirection: 'column',
        animation: 'slideUp .25s cubic-bezier(.2,.7,.3,1)',
      }}>
        <div style={{ width: 36, height: 4, background: T.line, borderRadius: 2, margin: '0 auto 12px' }}/>
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontFamily: T.ffDisplay, fontSize: 20, fontWeight: 700, color: T.ink }}>ตะกร้า ({lines.length} รายการ)</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.inkSoft }}>
            <Icon name="close" size={20}/>
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>
          {lines.map(l => (
            <div key={l.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: `1px solid ${T.line}`,
            }}>
              <FruitDot color={l.color} image={l.image_url} size={40}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{l.name}</div>
                <div style={{ fontSize: 12, color: T.inkMute, fontFamily: 'ui-monospace, monospace' }}>{fmtTHB(l.price)} × {l.qty}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: T.surface, borderRadius: 999, padding: 3, border: `1px solid ${T.line}` }}>
                <button onClick={() => onSub(l.id)} style={qBtn(T)}><Icon name="minus" size={14} color={T.ink}/></button>
                <span style={{ minWidth: 22, textAlign: 'center', fontSize: 14, fontWeight: 700, color: T.ink }}>{l.qty}</span>
                <button onClick={() => onAdd(l.id)} style={qBtn(T, true)}><Icon name="plus" size={14}/></button>
              </div>
              <div style={{ width: 56, textAlign: 'right', fontSize: 14, fontWeight: 700, color: T.ink, fontFamily: 'ui-monospace, monospace' }}>{fmtTHB(l.line)}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.inkSoft }}>รวมทั้งหมด</span>
            <span style={{ fontFamily: T.ffDisplay, fontSize: 32, fontWeight: 700, color: T.ink, letterSpacing: -0.6 }}>{fmtTHB(total)}</span>
          </div>
          <Btn T={T} size="lg" onClick={onPay} style={{ width: '100%' }}>
            ไปคิดเงิน
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Payment flow (shared)
// ─────────────────────────────────────────────────────────────
function PaymentSelect({ T, total, onCancel, onPick }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, zIndex: 110, display: 'flex', flexDirection: 'column', animation: 'fadeIn .2s' }}>
      <div style={{ padding: '20px 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onCancel} style={{ width: 38, height: 38, borderRadius: '50%', background: T.card, border: `1px solid ${T.line}`, color: T.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={18}/>
        </button>
        <div>
          <div style={{ fontSize: 12, color: T.inkMute, fontWeight: 600 }}>ยอดที่ต้องชำระ</div>
          <div style={{ fontFamily: T.ffDisplay, fontSize: 32, fontWeight: 700, color: T.ink, letterSpacing: -0.6 }}>{fmtTHB(total)}</div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.inkSoft, textTransform: 'uppercase', letterSpacing: 0.4 }}>เลือกวิธีรับเงิน</div>
        <button onClick={() => onPick('cash')} style={payOption(T, T.warm)}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: T.warm + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.warm }}>
            <Icon name="cash" size={26}/>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>เงินสด</div>
            <div style={{ fontSize: 12, color: T.inkSoft }}>คำนวณเงินทอนให้อัตโนมัติ</div>
          </div>
          <Icon name="back" size={18} color={T.inkMute} style={{ transform: 'rotate(180deg)' }}/>
        </button>
        <button onClick={() => onPick('transfer')} style={payOption(T, T.accent)}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: T.accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
            <Icon name="qr" size={26}/>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>โอน / QR</div>
            <div style={{ fontSize: 12, color: T.inkSoft }}>แสดง QR PromptPay ให้ลูกค้า</div>
          </div>
          <Icon name="back" size={18} color={T.inkMute} style={{ transform: 'rotate(180deg)' }}/>
        </button>
      </div>
    </div>
  );
}
function payOption(T, accent) {
  return {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 16px', borderRadius: T.r,
    background: T.card, border: `1px solid ${T.line}`, cursor: 'pointer',
    fontFamily: T.ff,
  };
}

function PaymentCash({ T, total, received, setReceived, onBack, onConfirm }) {
  const r = +received || 0;
  const change = Math.max(0, r - total);
  const quick = [100, 500, 1000].filter(v => v !== total);

  function tap(k) {
    if (k === '⌫') return setReceived(received.slice(0, -1));
    if (k === 'C') return setReceived('');
    setReceived(received + k);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, zIndex: 110, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: '50%', background: T.card, border: `1px solid ${T.line}`, color: T.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={18}/>
        </button>
        <h3 style={{ margin: 0, fontFamily: T.ffDisplay, fontSize: 20, fontWeight: 700, color: T.ink }}>เงินสด</h3>
      </div>

      <div style={{ padding: '14px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: T.inkMute, fontWeight: 600 }}>ยอดต้องชำระ</div>
        <div style={{ fontFamily: T.ffDisplay, fontSize: 28, fontWeight: 700, color: T.ink, letterSpacing: -0.4 }}>{fmtTHB(total)}</div>
      </div>

      <div style={{ margin: '0 20px', padding: '14px 16px', background: T.card, borderRadius: T.r, border: `1px solid ${T.line}` }}>
        <div style={{ fontSize: 12, color: T.inkSoft, fontWeight: 600 }}>รับมา</div>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 36, fontWeight: 700, color: r >= total ? T.accent : T.ink, letterSpacing: -0.5 }}>
          ฿{(r || 0).toLocaleString('th-TH')}
        </div>
        <div style={{ marginTop: 6, padding: '8px 12px', borderRadius: T.rSm, background: r >= total ? T.accent + '14' : T.surface, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: T.inkSoft, fontWeight: 600 }}>เงินทอน</span>
          <b style={{ fontSize: 16, color: r >= total ? T.accent : T.inkMute, fontFamily: 'ui-monospace, monospace' }}>{fmtTHB(change)}</b>
        </div>
      </div>

      {/* Quick amounts */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6 }}>
        <button key="exact" onClick={() => setReceived(String(total))} style={{
          flex: 1.4, height: 38, borderRadius: T.rSm,
          background: T.accent, border: 'none',
          color: T.accentInk, fontFamily: T.ff, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>พอดี · {fmtTHB(total)}</button>
        {quick.map(v => (
          <button key={v} onClick={() => setReceived(String(v))} style={{
            flex: 1, height: 38, borderRadius: T.rSm,
            background: T.surface, border: `1px solid ${T.line}`,
            color: T.ink, fontFamily: T.ff, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{fmtTHB(v)}</button>
        ))}
      </div>

      <div style={{ flex: 1 }}/>

      {/* Keypad */}
      <div style={{
        padding: '0 20px 12px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
      }}>
        {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(k => (
          <button key={k} onClick={() => tap(k)} style={{
            height: 50, borderRadius: T.rSm,
            background: T.card, border: `1px solid ${T.line}`,
            fontSize: k === '⌫' || k === 'C' ? 18 : 22, fontWeight: 500,
            color: k === 'C' ? T.danger : T.ink,
            fontFamily: T.ff, cursor: 'pointer',
          }}>{k}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <Btn T={T} size="lg" disabled={r < total} onClick={onConfirm} style={{ width: '100%' }}>
          ยืนยันรับเงิน · ทอน {fmtTHB(change)}
        </Btn>
      </div>
    </div>
  );
}

function PaymentQR({ T, total, onBack, onConfirm }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, zIndex: 110, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: '50%', background: T.card, border: `1px solid ${T.line}`, color: T.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={18}/>
        </button>
        <h3 style={{ margin: 0, fontFamily: T.ffDisplay, fontSize: 20, fontWeight: 700, color: T.ink }}>โอนผ่าน QR</h3>
      </div>

      <div style={{ padding: '14px 20px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: T.inkMute, fontWeight: 600 }}>แสดง QR ให้ลูกค้าสแกน</div>
        <div style={{ fontFamily: T.ffDisplay, fontSize: 32, fontWeight: 700, color: T.ink, letterSpacing: -0.5 }}>{fmtTHB(total)}</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{
          padding: 16, background: T.card,
          borderRadius: T.r, border: `1px solid ${T.line}`,
          boxShadow: T.shadow,
        }}>
          <div style={{ textAlign: 'center', fontSize: 11, color: T.inkSoft, marginBottom: 8, fontWeight: 600 }}>
            PromptPay · เสี่ยจุ้น
          </div>
          <QRPlaceholder T={T} size={200}/>
          <div style={{ textAlign: 'center', fontSize: 11, color: T.inkMute, marginTop: 8, fontFamily: 'ui-monospace, monospace' }}>
            089-XXX-XX78
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <Btn T={T} size="lg" onClick={onConfirm} style={{ width: '100%' }} icon="check">
          ลูกค้าโอนแล้ว
        </Btn>
      </div>
    </div>
  );
}

function QRPlaceholder({ T, size = 200 }) {
  // simple deterministic QR-ish square grid
  const n = 21;
  const cell = size / n;
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const corner = (x < 7 && y < 7) || (x >= n-7 && y < 7) || (x < 7 && y >= n-7);
    const innerCorner = corner && ((x >= 2 && x < 5 && y >= 2 && y < 5) || (x >= n-5 && x < n-2 && y >= 2 && y < 5) || (x >= 2 && x < 5 && y >= n-5 && y < n-2));
    const cornerFrame = corner && !innerCorner && (x === 0 || x === 6 || y === 0 || y === 6 || x === n-1 || x === n-7 || y === n-1 || y === n-7);
    let fill = false;
    if (corner) fill = innerCorner || cornerFrame;
    else fill = ((x * 31 + y * 17 + x*y) % 7) < 3;
    if (fill) cells.push(<rect key={`${x}-${y}`} x={x*cell} y={y*cell} width={cell} height={cell} fill="#1F2A22"/>);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill="#fff"/>
      {cells}
    </svg>
  );
}

function PaymentDone({ T, onClose }) {
  useE(() => {
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.accent, zIndex: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.accentInk, animation: 'fadeIn .25s' }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        animation: 'pop .35s cubic-bezier(.2,.7,.3,1.5)',
      }}>
        <Icon name="check" size={50} color={T.accentInk} stroke={3}/>
      </div>
      <div style={{ fontFamily: T.ffDisplay, fontSize: 28, fontWeight: 700, marginTop: 18, letterSpacing: -0.4 }}>รับเงินสำเร็จ</div>
      <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>บันทึกบิลเรียบร้อย</div>
      <style>{'@keyframes pop{from{transform:scale(0)}to{transform:scale(1)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}'}</style>
    </div>
  );
}

Object.assign(window, {
  POSGridBottom, POSListDrawer, POSCardsSheet,
  cartLines, cartTotal, cartCount,
});
