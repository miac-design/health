import React, { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db'
import { todayStr, lastNDates } from '../utils'
import { Modal, Field, Ring, IconPicker } from '../ui'
import { Icon, IconBox } from '../icons'

const TD = 'https://api.todoist.com/rest/v2'
const tdHeaders = token => ({ Authorization: `Bearer ${token}` })

// Best-effort mirror of a habit check into Todoist: closing the matching task
// when done, reopening it when unchecked. Never blocks or breaks local state.
async function syncHabitToTodoist(habit, nowDone) {
  const token = localStorage.getItem('todoistToken')
  if (!token) return
  try {
    let id = habit.todoistId
    if (!id && nowDone) {
      const res = await fetch(`${TD}/tasks?filter=${encodeURIComponent('today | overdue')}`, { headers: tdHeaders(token) })
      if (!res.ok) return
      const tasks = await res.json()
      const name = habit.name.trim().toLowerCase()
      const match = tasks.find(t => t.content.trim().toLowerCase() === name)
        || tasks.find(t => t.content.toLowerCase().includes(name))
      if (!match) return
      id = match.id
      await db.habits.update(habit.id, { todoistId: id })
    }
    if (!id) return
    await fetch(`${TD}/tasks/${id}/${nowDone ? 'close' : 'reopen'}`, { method: 'POST', headers: tdHeaders(token) })
  } catch { /* offline or bad token — local state is still the source of truth */ }
}

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
  const [h, setH] = useState({ name: '', icon: 'sparkles', ...initial })
  const save = async e => {
    e.preventDefault()
    if (!h.name.trim()) return
    if (h.id) await db.habits.update(h.id, { name: h.name.trim(), icon: h.icon })
    else {
      const max = (await db.habits.toArray()).reduce((m, x) => Math.max(m, x.order || 0), 0)
      await db.habits.add({ name: h.name.trim(), icon: h.icon, order: max + 1 })
    }
    onClose()
  }
  return (
    <Modal title={h.id ? 'Edit habit' : 'New habit'} onClose={onClose}>
      <form onSubmit={save}>
        <Field label="Habit">
          <input className="input" value={h.name} onChange={e => setH({ ...h, name: e.target.value })} placeholder="e.g. Read 10 pages" autoFocus required />
        </Field>
        <Field label="Icon">
          <IconPicker value={h.icon} onChange={icon => setH({ ...h, icon })} />
        </Field>
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
      const res = await fetch(`${TD}/tasks?filter=${encodeURIComponent('today | overdue')}`, { headers: tdHeaders(token) })
      if (!res.ok) throw new Error(`Todoist said ${res.status}`)
      setTasks(await res.json())
    } catch (e) {
      setErr(e.message)
    } finally { setBusy(false) }
  }

  useEffect(() => { if (token) load() }, [])

  // completing a task here also checks the matching habit locally
  const complete = async task => {
    setTasks(tasks.filter(t => t.id !== task.id))
    await fetch(`${TD}/tasks/${task.id}/close`, { method: 'POST', headers: tdHeaders(token) }).catch(() => {})
    const habits = await db.habits.toArray()
    const habit = habits.find(h => task.content.trim().toLowerCase() === h.name.trim().toLowerCase())
    if (habit) {
      const today = todayStr()
      const existing = await db.habitLogs.where('[date+habitId]').equals([today, habit.id]).first()
      if (existing) await db.habitLogs.update(existing.id, { done: true })
      else await db.habitLogs.add({ habitId: habit.id, date: today, done: true })
      if (!habit.todoistId) await db.habits.update(habit.id, { todoistId: task.id })
    }
  }

  // idempotent: skips habits that already have a matching Todoist task
  const pushHabits = async () => {
    if (!confirm('Create a recurring daily Todoist task for any habit that doesn’t have one yet?')) return
    setBusy(true)
    try {
      const res = await fetch(`${TD}/tasks`, { headers: tdHeaders(token) })
      const existing = res.ok ? await res.json() : []
      const habits = await db.habits.toArray()
      for (const h of habits) {
        const match = existing.find(t => t.content.trim().toLowerCase() === h.name.trim().toLowerCase())
        if (match) {
          if (!h.todoistId) await db.habits.update(h.id, { todoistId: match.id })
          continue
        }
        const created = await fetch(`${TD}/tasks`, {
          method: 'POST',
          headers: { ...tdHeaders(token), 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: h.name, due_string: 'every day' }),
        }).then(r => (r.ok ? r.json() : null)).catch(() => null)
        if (created) await db.habits.update(h.id, { todoistId: created.id })
      }
    } finally {
      setBusy(false)
      load()
    }
  }

  if (!token) {
    return (
      <div className="banner">
        <Icon name="circle-check" size={19} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Your habits already live in Todoist under <b>Wellness Habits</b>. Add your Todoist API token in <Link to="/settings" style={{ fontWeight: 700, textDecoration: 'underline' }}>Settings</Link> and checking a habit here will complete it there too.</span>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="spread" style={{ marginBottom: 10 }}>
        <div className="row-flex" style={{ gap: 8, fontWeight: 650 }}><Icon name="circle-check" size={17} /> Todoist · today</div>
        <div className="row-flex" style={{ gap: 6 }}>
          <button className="btn small ghost" onClick={load} disabled={busy}><Icon name="refresh-cw" size={13} /> Refresh</button>
          <button className="btn small secondary" onClick={pushHabits} disabled={busy}>Send habits</button>
        </div>
      </div>
      {err && <div className="tiny" style={{ color: 'var(--danger)' }}>Couldn't reach Todoist ({err}). Check your token in Settings.</div>}
      {tasks && tasks.length === 0 && <div className="tiny">Nothing due today — enjoy the calm.</div>}
      {tasks && tasks.map(t => (
        <div key={t.id} className="spread" style={{ padding: '8px 0', borderBottom: '1px solid var(--hairline)' }}>
          <span style={{ fontSize: 14.5 }}>{t.content}</span>
          <button className="habit-check" onClick={() => complete(t)} aria-label="Complete"><Icon name="check" size={15} /></button>
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
    const nowDone = existing ? !existing.done : true
    if (existing) await db.habitLogs.update(existing.id, { done: nowDone })
    else await db.habitLogs.add({ habitId: h.id, date: today, done: true })
    syncHabitToTodoist(h, nowDone)
  }

  return (
    <>
      <div className="spread" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Today's Habits</h1>
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
              <IconBox name={h.icon || h.emoji} size={42} iconSize={20} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h-name" onClick={() => setForm(h)} style={{ cursor: 'pointer' }}>{h.name}</div>
                <div className="row-flex" style={{ gap: 8, marginTop: 3 }}>
                  <div className="week-dots">
                    {week.map(d => (
                      <span key={d} className={`wd ${isDone(h.id, d) ? 'on' : ''} ${d === today ? 'today' : ''}`} title={d} />
                    ))}
                  </div>
                  {streak > 1 && (
                    <span className="tiny row-flex" style={{ gap: 3 }}>
                      <Icon name="flame" size={12} style={{ color: 'var(--clay)' }} />{streak} days
                    </span>
                  )}
                </div>
              </div>
              <button className={`habit-check ${isDone(h.id, today) ? 'on' : ''}`} onClick={() => toggle(h)}
                aria-label={`${h.name} done`}><Icon name="check" size={15} /></button>
            </div>
          )
        })}

        <button className="btn secondary" onClick={() => setForm({})}><Icon name="plus" size={15} /> New habit</button>
        <TodoistCard />
      </div>

      {form && <HabitForm initial={form.id ? form : undefined} onClose={() => setForm(null)} />}
    </>
  )
}
