import React, { useState } from 'react'
import { db, CATEGORIES } from './db'
import { Modal, Field, Seg, PhotoInput, Stars, Toggle } from './ui'
import { Icon } from './icons'

const BLANK = {
  name: '', category: 'Face', timeOfDay: 'Morning', frequency: 'Daily',
  purpose: '', amount: '', applicationOrder: '', notes: '',
  rating: 0, repurchase: true, dateOpened: '', expirationDate: '',
  price: '', store: '', photo: '',
  dose: '', bestTime: '', withFood: 'Either', benefits: '', interactions: '', whenNotToTake: '',
}

export default function ProductForm({ initial, onClose, onSaved, forceCategory }) {
  const [p, setP] = useState({ ...BLANK, ...(forceCategory ? { category: forceCategory } : {}), ...initial })
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }))
  const isSupp = p.category === 'Supplement'

  const save = async e => {
    e.preventDefault()
    if (!p.name.trim()) return
    const record = { ...p, name: p.name.trim() }
    let id = p.id
    if (p.id) await db.products.update(p.id, record)
    else {
      delete record.id
      record.createdAt = new Date().toISOString()
      id = await db.products.add(record)
    }
    onSaved?.(id)
    onClose()
  }

  return (
    <Modal title={p.id ? 'Edit product' : 'Add product'} onClose={onClose}>
      <form onSubmit={save}>
        <div className="row-flex" style={{ alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <PhotoInput value={p.photo} onChange={v => set('photo', v)} />
          <div style={{ flex: 1 }}>
            <Field label="Product name">
              <input className="input" value={p.name} onChange={e => set('name', e.target.value)} placeholder="e.g. CeraVe Hydrating Cleanser" autoFocus required />
            </Field>
            <Field label="Category">
              <select className="input" value={p.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="form-row">
          <Field label="When">
            <Seg options={['Morning', 'Night', 'Both']} value={p.timeOfDay} onChange={v => set('timeOfDay', v)} />
          </Field>
          <Field label="How often">
            <Seg options={['Daily', 'Weekly', 'As needed']} value={p.frequency} onChange={v => set('frequency', v)} />
          </Field>
        </div>

        <Field label="Purpose — why I use it">
          <input className="input" value={p.purpose} onChange={e => set('purpose', e.target.value)} placeholder="e.g. Barrier repair, hydration" />
        </Field>

        <div className="form-row">
          <Field label="How much to use">
            <input className="input" value={p.amount} onChange={e => set('amount', e.target.value)} placeholder="e.g. Pea-sized, 2 pumps" />
          </Field>
          <Field label="Application order (1 = first)">
            <input className="input" type="number" min="1" value={p.applicationOrder} onChange={e => set('applicationOrder', e.target.value)} placeholder="e.g. 3" />
          </Field>
        </div>

        {isSupp && (
          <div className="card tinted" style={{ padding: 16, marginBottom: 16 }}>
            <div className="row-flex" style={{ gap: 7, fontWeight: 650, marginBottom: 12 }}><Icon name="pill" size={16} /> Supplement details</div>
            <div className="form-row">
              <Field label="Dose">
                <input className="input" value={p.dose} onChange={e => set('dose', e.target.value)} placeholder="e.g. 400 mg" />
              </Field>
              <Field label="Best time to take">
                <input className="input" value={p.bestTime} onChange={e => set('bestTime', e.target.value)} placeholder="e.g. Evening, with dinner" />
              </Field>
            </div>
            <Field label="Take with food?">
              <Seg options={['With food', 'Empty stomach', 'Either']} value={p.withFood} onChange={v => set('withFood', v)} />
            </Field>
            <Field label="Health benefits">
              <textarea className="input" value={p.benefits} onChange={e => set('benefits', e.target.value)} placeholder="What it does for you" />
            </Field>
            <Field label="Interactions">
              <input className="input" value={p.interactions} onChange={e => set('interactions', e.target.value)} placeholder="e.g. Don't combine with iron" />
            </Field>
            <Field label="When NOT to take it">
              <input className="input" value={p.whenNotToTake} onChange={e => set('whenNotToTake', e.target.value)} placeholder="e.g. Skip before blood tests" />
            </Field>
          </div>
        )}

        <div className="form-row">
          <Field label="Date opened">
            <input className="input" type="date" value={p.dateOpened} onChange={e => set('dateOpened', e.target.value)} />
          </Field>
          <Field label="Expiration date">
            <input className="input" type="date" value={p.expirationDate} onChange={e => set('expirationDate', e.target.value)} />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Price">
            <input className="input" type="number" step="0.01" min="0" value={p.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
          </Field>
          <Field label="Where I bought it">
            <input className="input" value={p.store} onChange={e => set('store', e.target.value)} placeholder="e.g. Sephora" />
          </Field>
        </div>

        <div className="form-row" style={{ alignItems: 'center' }}>
          <Field label="My rating">
            <Stars value={p.rating} onChange={v => set('rating', v)} />
          </Field>
          <Field label="Would repurchase?">
            <div className="row-flex">
              <Toggle on={p.repurchase} onChange={v => set('repurchase', v)} label="Repurchase" />
              <span className="muted" style={{ fontSize: 14 }}>{p.repurchase ? 'Yes' : 'No'}</span>
            </div>
          </Field>
        </div>

        <Field label="Notes">
          <textarea className="input" value={p.notes} onChange={e => set('notes', e.target.value)} placeholder="Texture, how my skin reacts, tips…" />
        </Field>

        <div className="row-flex" style={{ marginTop: 8 }}>
          <button className="btn" type="submit" style={{ flex: 1 }}>{p.id ? 'Save changes' : 'Add to my library'}</button>
        </div>
      </form>
    </Modal>
  )
}
