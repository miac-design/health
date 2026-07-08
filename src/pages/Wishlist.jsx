import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, CATEGORIES } from '../db'
import { Modal, Field, PhotoInput, Empty, ProductThumb, Stars, Chips } from '../ui'
import { money } from '../utils'

function WishForm({ initial, onClose }) {
  const [w, setW] = useState({ name: '', category: 'Face', price: '', url: '', why: '', photo: '', ...initial })
  const set = (k, v) => setW(prev => ({ ...prev, [k]: v }))
  const save = async e => {
    e.preventDefault()
    if (!w.name.trim()) return
    if (w.id) await db.wishlist.update(w.id, w)
    else { const rec = { ...w }; delete rec.id; await db.wishlist.add(rec) }
    onClose()
  }
  return (
    <Modal title={w.id ? 'Edit wish' : 'Add to wishlist'} onClose={onClose}>
      <form onSubmit={save}>
        <div className="row-flex" style={{ alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <PhotoInput value={w.photo} onChange={v => set('photo', v)} />
          <div style={{ flex: 1 }}>
            <Field label="Product name">
              <input className="input" value={w.name} onChange={e => set('name', e.target.value)} autoFocus required placeholder="What caught your eye?" />
            </Field>
            <Field label="Category">
              <select className="input" value={w.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <div className="form-row">
          <Field label="Price">
            <input className="input" type="number" step="0.01" min="0" value={w.price} onChange={e => set('price', e.target.value)} />
          </Field>
          <Field label="Link">
            <input className="input" type="url" value={w.url} onChange={e => set('url', e.target.value)} placeholder="https://…" />
          </Field>
        </div>
        <Field label="Why I want it / what would it replace?">
          <textarea className="input" value={w.why} onChange={e => set('why', e.target.value)} />
        </Field>
        <div className="row-flex">
          <button className="btn" type="submit" style={{ flex: 1 }}>{w.id ? 'Save' : 'Add to wishlist'}</button>
          {w.id && (
            <button type="button" className="btn danger" onClick={async () => {
              if (confirm('Remove from wishlist?')) { await db.wishlist.delete(w.id); onClose() }
            }}>Delete</button>
          )}
        </div>
      </form>
    </Modal>
  )
}

function CompareSheet({ wish, onClose }) {
  const owned = useLiveQuery(
    () => db.products.where('category').equals(wish.category).toArray(), [wish.category]) || []
  return (
    <Modal title={`Compare with what I own`} onClose={onClose}>
      <div className="banner" style={{ marginBottom: 16 }}>
        <span>🛍️</span>
        <span><b>{wish.name}</b>{wish.price ? ` · ${money(wish.price)}` : ''} — here's everything you already own in <b>{wish.category}</b> before you buy.</span>
      </div>
      {owned.length === 0 ? (
        <div className="empty"><div className="e-emoji">✨</div>
          <div className="e-title">Nothing similar owned</div>
          <p>You don't own any {wish.category.toLowerCase()} products yet — no duplicates to worry about.</p>
        </div>
      ) : (
        <div className="stack">
          {owned.map(p => (
            <div key={p.id} className="card flat" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12 }}>
              <ProductThumb product={p} size={54} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 650, fontSize: 14.5 }}>{p.name}</div>
                <div className="tiny">{[p.purpose, money(p.price)].filter(Boolean).join(' · ')}</div>
              </div>
              {p.rating > 0 && <Stars value={p.rating} readonly />}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

export default function Wishlist() {
  const [form, setForm] = useState(null)
  const [compare, setCompare] = useState(null)
  const [cat, setCat] = useState(null)
  const items = useLiveQuery(() => db.wishlist.toArray(), []) || []
  const filtered = cat ? items.filter(i => i.category === cat) : items

  const buyNow = async w => {
    if (!confirm(`Bought it? Move “${w.name}” into your product library.`)) return
    await db.products.add({
      name: w.name, category: w.category, photo: w.photo, price: w.price,
      purpose: w.why, timeOfDay: 'Morning', frequency: 'Daily', rating: 0,
      repurchase: true, createdAt: new Date().toISOString(),
      amount: '', applicationOrder: '', notes: '', dateOpened: '', expirationDate: '', store: '',
    })
    await db.wishlist.delete(w.id)
  }

  return (
    <>
      <h1 className="page-title">🛍️ Wishlist</h1>
      <p className="page-sub">Compare with what you own before you buy</p>

      <div style={{ marginBottom: 18 }}>
        <Chips options={CATEGORIES} value={cat} onChange={setCat} allLabel="All" />
      </div>

      {filtered.length === 0 ? (
        <Empty emoji="🛍️" title="Wishlist is empty"
          action={<button className="btn" onClick={() => setForm({})}>+ Add something</button>}>
          When you're tempted by a product, save it here first and compare it with your library.
        </Empty>
      ) : (
        <div className="grid cols-2">
          {filtered.map(w => (
            <div key={w.id} className="card" style={{ display: 'flex', gap: 14 }}>
              <ProductThumb product={w} size={70} emoji="🛍️" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="spread">
                  <div style={{ fontWeight: 650, fontSize: 15 }}>{w.name}</div>
                  <button className="btn ghost icon-only small" onClick={() => setForm(w)} aria-label="Edit">✎</button>
                </div>
                <div className="tiny">{[w.category, money(w.price)].filter(Boolean).join(' · ')}</div>
                {w.why && <div className="tiny" style={{ marginTop: 4 }}>{w.why}</div>}
                <div className="row-flex" style={{ marginTop: 10, flexWrap: 'wrap', gap: 6 }}>
                  <button className="btn small secondary" onClick={() => setCompare(w)}>⚖️ Compare with owned</button>
                  <button className="btn small ghost" onClick={() => buyNow(w)}>Bought it →</button>
                  {w.url && <a className="btn small ghost" href={w.url} target="_blank" rel="noreferrer">Open link ↗</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setForm({})} aria-label="Add wish">+</button>
      {form && <WishForm initial={form.id ? form : undefined} onClose={() => setForm(null)} />}
      {compare && <CompareSheet wish={compare} onClose={() => setCompare(null)} />}
    </>
  )
}
