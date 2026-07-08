import React, { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db'
import { todayStr, lastNDates } from '../utils'
import { Modal, Field, Ring } from '../ui'

function streakOf(habitId, logsByDate) {
  let streak = 0
  // count back from today; an unchecked today doesn't break the streak yet
  for (let i = 0; ; i++) {
    const d = todayStr(-i)
    const done = logsByDate[d]?.some(x => x.habitId === habitId && x.done)
    if (done) streak++
    else if (i === 0) continue
    else break
  }
  return streak
}

function HabitForm({ initial, onClose }) {
  const [h, setH] = useState({ name: '', emoji: '✅', ...initial })
  const save = async e => {
    e.preventDefault()
    if (!h.name.trim()) return
    if (h.id) await db.habits.update(h.id, { name: h.name.trim(), emoji: h.emoji })
    else {
      const max = (await db.habits.toArray()).reduce((m, x) => Math.max(m, x.order || 0), 0)
      await db.habits.add({ name: h.name.trim(), emoji: h.emoji, order: max + 1 })
    }
    onClose()
  }
  return (
    <Modal title={h.id ? 'Edit habit' : 'New habit'} onClose={onClose}>
      <form onSubmit={save}>
        <div className="form-row">
          <Field label="Habit">
            <input className="input" value={h.name} onChange={e => setH({ ...h, name: e.target.value })} placeholder="e.g. Read 10 pages" autoFocus required />
          </Field>
          <Field label="Emoji">
            <input className="input" value={h.emoji} onChange={e => setH({ ...h, emoji: e.target.value })} maxLength={4} />
          </Field>
        </div>
        <div className="row-flex">
          <button className="btn" type="submit" style={{ flex: 1 }}>{h.id ? 'Save' : 'Add habit'}</button>
          {h.id && (
            <button type="button" className="btn danger" onClick={async () => {
              if (confirm(`Delete “${h.name}” and its history?`)) {
                await db.habitLogs.where('habitId').equals(h.id).delete()
                await db.habits.delete(h.id)
                onClose()
              }
            }}>Delete</button>
          )}
        </div>
      </form>
    </Modal>
  )
}

function TodoistCard() {
  const token = localStorage.getItem('todoistToken') || ''
  const [tasks, setTasks] = useState(null)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setBusy(true); setErr(null)
    try {
      const res = await fetch('https://api.todoist.com/rest/v2/tasks?filter=' + encodeURIComponent('today | overdue'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Todoist said ${res.status}`)
      setTasks(await res.json())
    } catch (e) {
      setErr(e.message)
    } finally { setBusy(false) }
  }

  useEffect(() => { if (token) load() }, [])

  const complete = async id => {
    setTasks(tasks.filter(t => t.id !== id))
    await fetch(`https://api.todoist.com/rest/v2/tasks/${id}/close`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }

  const pushHabits = async () => {
    if (!confirm('Create a recurring daily Todoist task for each of your habits?')) return
    setBusy(true)
    const habits = await db.habits.toArray()
    for (const h of habits) {
      await fetch('https://api.todoist.com/rest/v2/tasks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `${h.emoji} ${h.name}`, due_string: 'every day' }),
      }).catch(() => {})
    }
    setBusy(false)
    load()
  }

  if (!token) {
    return (
      <div className="banner">
        <span>✅</span>
        <span>Want your habits in Todoist too? Add your Todoist API token in <Link to="/settings" style={{ fontWeight: 700, textDecoration: 'underline' }}>Settings</Link> to see and complete today's tasks here.</span>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="spread" style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 650 }}>✅ Todoist · today</div>
        <div className="row-flex" style={{ gap: 6 }}>
          <button className="btn small ghost" onClick={load} disabled={busy}>↻ Refresh</button>
          <button className="btn small secondary" onClick={pushHabits} disabled={busy}>Send habits → Todoist</button>
        </div>
      </div>
      {err && <div className="tiny" style={{ color: 'var(--danger)' }}>Couldn't reach Todoist ({err}). Check your token in Settings.</div>}
      {tasks && tasks.length === 0 && <div className="tiny">Nothing due today — enjoy the calm 🌿</div>}
      {tasks && tasks.map(t => (
        <div key={t.id} className="spread" style={{ padding: '8px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span style={{ fontSize: 14.5 }}>{t.content}</span>
          <button className="habit-check" onClick={() => complete(t.id)} aria-label="Complete">✓</button>
        </div>
      ))}
    </div>
  )
}

export default function Habits() {
  const today = todayStr()
  const week = lastNDates(7)
  const [form, setForm] = useState(null)

  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray(), []) || []
  const logs = useLiveQuery(() => db.habitLogs.where('date').anyOf(lastNDates(60)).toArray(), []) || []

  const logsByDate = {}
  for (const l of logs) (logsByDate[l.date] ||= []).push(l)

  const isDone = (habitId, date) => logsByDate[date]?.some(x => x.habitId === habitId && x.done)
  const doneToday = habits.filter(h => isDone(h.id, today)).length

  const toggle = async h => {
    const existing = logs.find(x => x.habitId === h.id && x.date === today)
    if (existing) await db.habitLogs.update(existing.id, { done: !existing.done })
    else await db.habitLogs.add({ habitId: h.id, date: today, done: true })
  }

  return (
    <>
      <div className="spread" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">📅 Today's Habits</h1>
          <p className="page-sub">Small things, done daily, become who you are</p>
        </div>
        <Ring value={doneToday} max={habits.length || 1} size={82} stroke={9}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{doneToday}/{habits.length}</div>
        </Ring>
      </div>

      <div className="stack">
        {habits.map(h => {
          const streak = streakOf(h.id, logsByDate)
          return (
            <div className="habit-row" key={h.id}>
              <div className="h-emoji">{h.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h-name" onClick={() => setForm(h)} style={{ cursor: 'pointer' }}>{h.name}</div>
                <div className="row-flex" style={{ gap: 8, marginTop: 3 }}>
                  <div className="week-dots">
                    {week.map(d => (
                      <span key={d} className={`wd ${isDone(h.id, d) ? 'on' : ''} ${d === today ? 'today' : ''}`} title={d} />
                    ))}
                  </div>
                  {streak > 1 && <span className="tiny">🔥 {streak} days</span>}
                </div>
              </div>
              <button className={`habit-check ${isDone(h.id, today) ? 'on' : ''}`} onClick={() => toggle(h)}
                aria-label={`${h.name} done`}>✓</button>
            </div>
          )
        })}

        <button className="btn secondary" onClick={() => setForm({})}>+ New habit</button>
        <TodoistCard />
      </div>

      {form && <HabitForm initial={form.id ? form : undefined} onClose={() => setForm(null)} />}
    </>
  )
}
