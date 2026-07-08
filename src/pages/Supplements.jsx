import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Empty, ProductThumb } from '../ui'
import { Icon } from '../icons'
import ProductForm from '../ProductForm'
import { ProductDetail } from './Products'

function SuppCard({ p, onClick }) {
  return (
    <div className="card" style={{ cursor: 'pointer', display: 'flex', gap: 14 }} onClick={onClick}>
      <ProductThumb product={p} size={70} icon="pill" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 650, fontSize: 15.5, letterSpacing: '-0.01em' }}>{p.name}</div>
        {p.purpose && <div className="tiny" style={{ marginTop: 2 }}>{p.purpose}</div>}
        <div className="s-meta" style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
          {p.dose && <span className="badge neutral"><Icon name="pill" size={11} /> {p.dose}</span>}
          {p.bestTime && <span className="badge"><Icon name="timer" size={11} /> {p.bestTime}</span>}
          {p.withFood && p.withFood !== 'Either' && <span className="badge warn"><Icon name="utensils" size={11} /> {p.withFood}</span>}
        </div>
        {p.benefits && (
          <div className="tiny" style={{ marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {p.benefits}
          </div>
        )}
        {(p.interactions || p.whenNotToTake) && (
          <div className="tiny" style={{ marginTop: 6, color: 'var(--warn)' }}>
            <Icon name="triangle-alert" size={12} style={{ verticalAlign: '-2px' }} /> {[p.interactions, p.whenNotToTake].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Supplements() {
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)

  const supplements = useLiveQuery(
    () => db.products.where('category').equals('Supplement').toArray(), []) || []
  const live = selected != null ? supplements.find(p => p.id === selected) : null

  const morning = supplements.filter(p => (p.bestTime || '').toLowerCase().match(/morning|am|breakfast/) || p.timeOfDay === 'Morning')
  const evening = supplements.filter(p => (p.bestTime || '').toLowerCase().match(/evening|night|pm|dinner|bed/) || p.timeOfDay === 'Night')
  const anytime = supplements.filter(p => !morning.includes(p) && !evening.includes(p))

  const groups = [
    ['sunrise', 'Morning', morning],
    ['moon', 'Evening', evening],
    ['timer', 'Anytime', anytime],
  ].filter(([, , list]) => list.length > 0)

  return (
    <>
      <h1 className="page-title">Supplements</h1>
      <p className="page-sub">Doses, timing, benefits and interactions — all in one place</p>

      {supplements.length === 0 ? (
        <Empty icon="pill" title="No supplements yet"
          action={<button className="btn" onClick={() => setAdding(true)}>+ Add a supplement</button>}>
          Add each supplement with its photo, dose, best time to take it, and what it does for you.
        </Empty>
      ) : (
        groups.map(([icon, label, list]) => (
          <div key={label}>
            <h2 className="section-title"><Icon name={icon} size={17} /> {label}</h2>
            <div className="grid cols-2">
              {list.map(p => <SuppCard key={p.id} p={p} onClick={() => setSelected(p.id)} />)}
            </div>
          </div>
        ))
      )}

      <button className="fab" onClick={() => setAdding(true)} aria-label="Add supplement"><Icon name="plus" size={26} /></button>

      {adding && <ProductForm forceCategory="Supplement" onClose={() => setAdding(false)} />}
      {live && !editing && <ProductDetail p={live} onClose={() => setSelected(null)} onEdit={() => setEditing(live)} />}
      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  )
}
