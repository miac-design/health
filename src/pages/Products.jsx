import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, CATEGORIES } from '../db'
import { Chips, Empty, Modal, Stars, ProductThumb } from '../ui'
import { Icon, CATEGORY_ICON } from '../icons'
import ProductForm from '../ProductForm'
import { money, fmtDate, daysUntil } from '../utils'

export function ProductCard({ p, onClick }) {
  const exp = daysUntil(p.expirationDate)
  return (
    <div className="product-card" onClick={onClick}>
      {p.photo
        ? <img className="product-photo" src={p.photo} alt={p.name} />
        : <div className="product-photo placeholder"><Icon name={CATEGORY_ICON[p.category] || 'droplets'} size={44} /></div>}
      <div className="p-body">
        <div className="p-name">{p.name}</div>
        <div className="p-tags">
          <span className="badge neutral">{p.category}</span>
          {p.timeOfDay === 'Night' ? <span className="badge night"><Icon name="moon" size={11} /> Night</span>
            : p.timeOfDay === 'Both' ? <span className="badge"><Icon name="sun" size={11} /><Icon name="moon" size={11} /></span>
              : <span className="badge"><Icon name="sun" size={11} /> AM</span>}
          {exp != null && exp <= 30 && (
            <span className={`badge ${exp <= 0 ? 'danger' : 'warn'}`}>{exp <= 0 ? 'Expired' : `${exp}d left`}</span>
          )}
        </div>
        {p.rating > 0 && <Stars value={p.rating} readonly />}
      </div>
    </div>
  )
}

export function ProductDetail({ p, onClose, onEdit }) {
  const rows = [
    ['Category', p.category],
    ['When', p.timeOfDay],
    ['How often', p.frequency],
    ['Purpose', p.purpose],
    ['How much', p.amount],
    ['Application order', p.applicationOrder && `Step ${p.applicationOrder}`],
    ...(p.category === 'Supplement' ? [
      ['Dose', p.dose],
      ['Best time', p.bestTime],
      ['With food?', p.withFood],
      ['Benefits', p.benefits],
      ['Interactions', p.interactions],
      ['When not to take', p.whenNotToTake],
    ] : []),
    ['Date opened', p.dateOpened && fmtDate(p.dateOpened, { year: 'numeric', month: 'short', day: 'numeric' })],
    ['Expires', p.expirationDate && fmtDate(p.expirationDate, { year: 'numeric', month: 'short', day: 'numeric' })],
    ['Price', money(p.price)],
    ['Bought at', p.store],
    ['Repurchase?', p.repurchase ? 'Yes' : 'No'],
  ].filter(([, v]) => v)

  const remove = async () => {
    if (confirm(`Delete “${p.name}” from your library?`)) {
      await db.products.delete(p.id)
      onClose()
    }
  }

  return (
    <Modal title={p.name} onClose={onClose}>
      <div className="row-flex" style={{ gap: 16, alignItems: 'flex-start', marginBottom: 14 }}>
        <ProductThumb product={p} size={110} radius={18} />
        <div className="stack" style={{ gap: 8 }}>
          {p.rating > 0 && <Stars value={p.rating} readonly />}
          {p.purpose && <div className="muted" style={{ fontSize: 14 }}>{p.purpose}</div>}
        </div>
      </div>
      <div className="card flat" style={{ padding: '4px 16px', marginBottom: 14 }}>
        <div className="detail-rows">
          {rows.map(([k, v]) => (
            <div className="row" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
          ))}
        </div>
      </div>
      {p.notes && (
        <div className="card flat" style={{ marginBottom: 14 }}>
          <div className="tiny" style={{ marginBottom: 4 }}>NOTES</div>
          <div style={{ fontSize: 14.5, whiteSpace: 'pre-wrap' }}>{p.notes}</div>
        </div>
      )}
      <div className="row-flex">
        <button className="btn secondary" style={{ flex: 1 }} onClick={onEdit}>Edit</button>
        <button className="btn danger" onClick={remove}>Delete</button>
      </div>
    </Modal>
  )
}

export default function Products() {
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat')
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)

  const products = useLiveQuery(() => db.products.toArray(), []) || []
  const live = selected != null ? products.find(p => p.id === selected) : null

  const filtered = useMemo(() => {
    let list = products
    if (cat) list = list.filter(p => p.category === cat)
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      list = list.filter(p =>
        [p.name, p.purpose, p.notes, p.store, p.category].join(' ').toLowerCase().includes(t))
    }
    return [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [products, cat, q])

  return (
    <>
      <h1 className="page-title">Product Library</h1>
      <p className="page-sub">{products.length} product{products.length === 1 ? '' : 's'} · every bottle, jar and capsule you own</p>

      <div className="stack" style={{ marginBottom: 18 }}>
        <div className="search-bar">
          <Icon name="search" size={17} style={{ color: 'var(--ink-3)' }} />
          <input placeholder="Search products, purposes, notes…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Chips options={CATEGORIES} value={cat} allLabel="All"
          onChange={v => setParams(v ? { cat: v } : {})} />
      </div>

      {filtered.length === 0 ? (
        <Empty icon="droplets" title={products.length === 0 ? 'Your library is empty' : 'Nothing matches'}
          action={<button className="btn" onClick={() => setAdding(true)}>+ Add your first product</button>}>
          {products.length === 0
            ? 'Add each product with its photo — it becomes searchable and can be linked into your routines.'
            : 'Try a different search or category.'}
        </Empty>
      ) : (
        <div className="product-grid">
          {filtered.map(p => <ProductCard key={p.id} p={p} onClick={() => setSelected(p.id)} />)}
        </div>
      )}

      <button className="fab" onClick={() => setAdding(true)} aria-label="Add product"><Icon name="plus" size={26} /></button>

      {adding && <ProductForm forceCategory={cat || undefined} onClose={() => setAdding(false)} />}
      {live && !editing && (
        <ProductDetail p={live} onClose={() => setSelected(null)} onEdit={() => setEditing(live)} />
      )}
      {editing && (
        <ProductForm initial={editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
