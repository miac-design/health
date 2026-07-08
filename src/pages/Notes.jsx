import React, { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, NOTE_CATEGORIES } from '../db'
import { Modal, Field, Chips, Empty } from '../ui'
import { todayStr, fmtDate } from '../utils'

const CAT_EMOJI = {
  'Routine changes': '🔄', 'Product reviews': '⭐', 'Questions': '❓',
  'Doctor recommendations': '🩺', 'Lab results': '🧪', 'Health notes': '❤️',
}

function NoteForm({ initial, onClose }) {
  const [n, setN] = useState({ category: 'Health notes', title: '', content: '', date: todayStr(), ...initial })
  const set = (k, v) => setN(prev => ({ ...prev, [k]: v }))
  const save = async e => {
    e.preventDefault()
    if (!n.title.trim() && !n.content.trim()) return
    if (n.id) await db.notes.update(n.id, n)
    else { const rec = { ...n }; delete rec.id; await db.notes.add(rec) }
    onClose()
  }
  return (
    <Modal title={n.id ? 'Edit note' : 'New note'} onClose={onClose}>
      <form onSubmit={save}>
        <Field label="Category">
          <select className="input" value={n.category} onChange={e => set('category', e.target.value)}>
            {NOTE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <div className="form-row">
          <Field label="Title">
            <input className="input" value={n.title} onChange={e => set('title', e.target.value)} autoFocus placeholder="e.g. Started retinol 2x/week" />
          </Field>
          <Field label="Date">
            <input className="input" type="date" value={n.date} onChange={e => set('date', e.target.value)} />
          </Field>
        </div>
        <Field label="Note">
          <textarea className="input" style={{ minHeight: 140 }} value={n.content} onChange={e => set('content', e.target.value)}
            placeholder="Everything you want to remember — reactions, advice, results…" />
        </Field>
        <div className="row-flex">
          <button className="btn" type="submit" style={{ flex: 1 }}>{n.id ? 'Save' : 'Save note'}</button>
          {n.id && (
            <button type="button" className="btn danger" onClick={async () => {
              if (confirm('Delete this note?')) { await db.notes.delete(n.id); onClose() }
            }}>Delete</button>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default function Notes() {
  const [cat, setCat] = useState(null)
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null)
  const notes = useLiveQuery(() => db.notes.toArray(), []) || []

  const filtered = useMemo(() => {
    let list = notes
    if (cat) list = list.filter(n => n.category === cat)
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      list = list.filter(n => (n.title + ' ' + n.content).toLowerCase().includes(t))
    }
    return [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [notes, cat, q])

  return (
    <>
      <h1 className="page-title">📝 Notes & Records</h1>
      <p className="page-sub">Routine changes, reviews, questions for the doctor, lab results</p>

      <div className="stack" style={{ marginBottom: 18 }}>
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search notes…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Chips options={NOTE_CATEGORIES} value={cat} onChange={setCat} allLabel="All" />
      </div>

      {filtered.length === 0 ? (
        <Empty emoji="📝" title={notes.length === 0 ? 'No notes yet' : 'Nothing matches'}
          action={<button className="btn" onClick={() => setForm({})}>+ Write a note</button>}>
          {notes.length === 0
            ? 'Keep everything here — what your doctor said, how a product felt, lab numbers to remember.'
            : 'Try a different search or category.'}
        </Empty>
      ) : (
        <div className="grid cols-2">
          {filtered.map(n => (
            <div key={n.id} className="note-card" onClick={() => setForm(n)}>
              <div className="spread">
                <span className="badge neutral">{CAT_EMOJI[n.category]} {n.category}</span>
                <span className="tiny">{fmtDate(n.date, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              {n.title && <h4>{n.title}</h4>}
              <p>{n.content}</p>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setForm({})} aria-label="New note">+</button>
      {form && <NoteForm initial={form.id ? form : undefined} onClose={() => setForm(null)} />}
    </>
  )
}
