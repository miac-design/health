import React, { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { todayStr } from '../utils'
import { Modal, Field, ProductThumb, Ring } from '../ui'

const META = {
  morning: { title: '🌞 Morning Routine', sub: 'Start the day slow and glowing', accent: 'var(--chart-1)' },
  evening: { title: '🌙 Evening Routine', sub: 'Wind down, repair, restore', accent: 'var(--chart-4)' },
  shower: { title: '🛁 Shower Routine', sub: 'Hair · Body · Feet · Hands · Nails', accent: 'var(--chart-2)' },
}
const SHOWER_SECTIONS = ['Hair', 'Body', 'Feet', 'Hands', 'Nails']

function StepForm({ which, initial, maxOrder, onClose }) {
  const products = useLiveQuery(() => db.products.toArray(), []) || []
  const [s, setS] = useState({
    routine: which, title: '', emoji: '✨', productId: '', instructions: '',
    quantity: '', waitTime: '', area: which === 'shower' ? 'Body' : 'Face', why: '',
    section: which === 'shower' ? 'Hair' : undefined,
    order: maxOrder + 1,
    ...initial,
  })
  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }))

  const save = async e => {
    e.preventDefault()
    if (!s.title.trim()) return
    const rec = { ...s, productId: s.productId ? Number(s.productId) : '' }
    if (s.id) await db.routineSteps.update(s.id, rec)
    else { delete rec.id; await db.routineSteps.add(rec) }
    onClose()
  }

  return (
    <Modal title={s.id ? 'Edit step' : 'Add step'} onClose={onClose}>
      <form onSubmit={save}>
        <div className="form-row">
          <Field label="Step name">
            <input className="input" value={s.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Vitamin C serum" required autoFocus />
          </Field>
          <Field label="Emoji">
            <input className="input" value={s.emoji} onChange={e => set('emoji', e.target.value)} maxLength={4} />
          </Field>
        </div>
        <Field label="Link a product from your library (shows its photo)">
          <select className="input" value={s.productId} onChange={e => set('productId', e.target.value)}>
            <option value="">— No product linked —</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        {which === 'shower' && (
          <Field label="Section">
            <select className="input" value={s.section} onChange={e => set('section', e.target.value)}>
              {SHOWER_SECTIONS.map(x => <option key={x}>{x}</option>)}
            </select>
          </Field>
        )}
        <Field label="Instructions">
          <textarea className="input" value={s.instructions} onChange={e => set('instructions', e.target.value)} placeholder="How to apply it" />
        </Field>
        <div className="form-row">
          <Field label="How much">
            <input className="input" value={s.quantity} onChange={e => set('quantity', e.target.value)} placeholder="e.g. 3 drops" />
          </Field>
          <Field label="Wait time (if needed)">
            <input className="input" value={s.waitTime} onChange={e => set('waitTime', e.target.value)} placeholder="e.g. Wait 2 min" />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Face or body">
            <select className="input" value={s.area} onChange={e => set('area', e.target.value)}>
              {['Face', 'Body', 'Hair', 'Feet', 'Hands', 'Nails'].map(a => <option key={a}>{a}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Why I'm using it">
          <input className="input" value={s.why} onChange={e => set('why', e.target.value)} placeholder="The reason this step matters" />
        </Field>
        <div className="row-flex">
          <button className="btn" type="submit" style={{ flex: 1 }}>{s.id ? 'Save step' : 'Add step'}</button>
          {s.id && (
            <button type="button" className="btn danger" onClick={async () => {
              if (confirm('Remove this step?')) { await db.routineSteps.delete(s.id); onClose() }
            }}>Delete</button>
          )}
        </div>
      </form>
    </Modal>
  )
}

function Step({ step, idx, product, done, onToggle, editMode, onEdit, onMove, isFirst, isLast }) {
  return (
    <div className={`flow-step ${done ? 'done' : ''}`}>
      <div className="rail">
        <button className="dot" onClick={onToggle} aria-label={done ? 'Mark not done' : 'Mark done'}>
          {done ? '✓' : idx + 1}
        </button>
        <div className="line" />
      </div>
      <div className="step-card">
        {product
          ? <ProductThumb product={product} size={62} />
          : <div className="step-photo">{step.emoji || '✨'}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="spread">
            <div className="s-name">{product ? product.name : step.title}</div>
            {editMode && (
              <div className="row-flex" style={{ gap: 4 }}>
                <button className="btn ghost icon-only small" disabled={isFirst} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
                <button className="btn ghost icon-only small" disabled={isLast} onClick={() => onMove(1)} aria-label="Move down">↓</button>
                <button className="btn ghost icon-only small" onClick={onEdit} aria-label="Edit">✎</button>
              </div>
            )}
          </div>
          {product && <div className="tiny">{step.title}</div>}
          {step.instructions && <div className="s-instr">{step.instructions}</div>}
          <div className="s-meta">
            {(step.quantity || product?.amount) && <span className="badge neutral">💧 {step.quantity || product.amount}</span>}
            {step.waitTime && <span className="badge warn">⏱ {step.waitTime}</span>}
            {step.area && <span className="badge">{step.area}</span>}
          </div>
          {step.why && <div className="tiny" style={{ marginTop: 7 }}>Why: {step.why}</div>}
        </div>
      </div>
    </div>
  )
}

export default function Routine() {
  const { which } = useParams()
  const nav = useNavigate()
  const meta = META[which] || META.morning
  const today = todayStr()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(null) // null | {} | step

  const steps = useLiveQuery(() => db.routineSteps.where('routine').equals(which).sortBy('order'), [which]) || []
  const checks = useLiveQuery(() => db.routineChecks.where('date').equals(today).toArray(), [today]) || []
  const products = useLiveQuery(() => db.products.toArray(), []) || []

  const isDone = step => checks.some(c => c.stepId === step.id && c.done)
  const doneCount = steps.filter(isDone).length

  const toggle = async step => {
    const existing = checks.find(c => c.stepId === step.id)
    if (existing) await db.routineChecks.update(existing.id, { done: !existing.done })
    else await db.routineChecks.add({ date: today, stepId: step.id, done: true })
  }

  const move = async (step, dir) => {
    const idx = steps.findIndex(s => s.id === step.id)
    const other = steps[idx + dir]
    if (!other) return
    await db.routineSteps.update(step.id, { order: other.order })
    await db.routineSteps.update(other.id, { order: step.order })
  }

  const resetDay = async () => {
    const ids = checks.filter(c => steps.some(s => s.id === c.stepId)).map(c => c.id)
    await db.routineChecks.bulkDelete(ids)
  }

  const sections = useMemo(() => {
    if (which !== 'shower') return [{ name: null, steps }]
    return SHOWER_SECTIONS
      .map(name => ({ name, steps: steps.filter(s => (s.section || 'Body') === name) }))
      .filter(sec => sec.steps.length > 0)
  }, [which, steps])

  let counter = -1

  return (
    <>
      <div className="spread" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">{meta.title}</h1>
          <p className="page-sub">{meta.sub}</p>
        </div>
        <Ring value={doneCount} max={steps.length || 1} size={82} stroke={9} color={meta.accent}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{doneCount}/{steps.length}</div>
        </Ring>
      </div>

      <div className="row-flex" style={{ marginBottom: 22, flexWrap: 'wrap' }}>
        <div className="seg">
          {Object.entries(META).map(([k, m]) => (
            <button key={k} type="button" className={k === which ? 'active' : ''}
              onClick={() => nav(`/routine/${k}`)}>
              {m.title.split(' ')[0]} {k[0].toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <button className={`btn small ${editMode ? '' : 'ghost'}`} onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Done editing' : '✎ Edit routine'}
        </button>
        {doneCount > 0 && <button className="btn small ghost" onClick={resetDay}>Reset today</button>}
      </div>

      {doneCount === steps.length && steps.length > 0 && (
        <div className="banner" style={{ marginBottom: 18 }}>✨ Routine complete — glowing already. See you tomorrow!</div>
      )}

      {sections.map(sec => (
        <div key={sec.name || 'all'}>
          {sec.name && <h2 className="section-title">{{ Hair: '💇‍♀️', Body: '🧴', Feet: '🦶', Hands: '🤲', Nails: '💅' }[sec.name]} {sec.name}</h2>}
          <div className="flow">
            {sec.steps.map(step => {
              counter += 1
              const globalIdx = steps.findIndex(s => s.id === step.id)
              return (
                <Step
                  key={step.id} step={step} idx={counter}
                  product={step.productId ? products.find(p => p.id === step.productId) : null}
                  done={isDone(step)} onToggle={() => toggle(step)}
                  editMode={editMode} onEdit={() => setForm(step)}
                  onMove={dir => move(step, dir)}
                  isFirst={globalIdx === 0} isLast={globalIdx === steps.length - 1}
                />
              )
            })}
          </div>
        </div>
      ))}

      {editMode && (
        <button className="btn secondary" style={{ marginTop: 8 }} onClick={() => setForm({})}>+ Add a step</button>
      )}
      {!editMode && steps.length === 0 && (
        <div className="empty">
          <div className="e-emoji">🫧</div>
          <div className="e-title">No steps yet</div>
          <p>Tap “Edit routine” to build this routine step by step.</p>
        </div>
      )}

      {form && (
        <StepForm which={which} initial={form.id ? form : undefined}
          maxOrder={steps.reduce((m, s) => Math.max(m, s.order || 0), 0)}
          onClose={() => setForm(null)} />
      )}
    </>
  )
}
