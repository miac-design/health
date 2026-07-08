import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, SYMPTOMS } from '../db'
import { todayStr, fmtDate, lastNDates } from '../utils'
import { Field, Stepper, Scale, Toggle, Sparkline, Ring } from '../ui'

const WATER_GOAL = 8

// Upsert a single field on the day's log
async function setLogField(date, patch) {
  const existing = await db.healthLogs.where('date').equals(date).first()
  if (existing) await db.healthLogs.update(existing.id, patch)
  else await db.healthLogs.add({ date, ...patch })
}

function TrendCard({ title, value, unit, dates, pick, goal, color }) {
  const logsMap = useLiveQuery(async () => {
    const logs = await db.healthLogs.toArray()
    return Object.fromEntries(logs.map(l => [l.date, l]))
  }, []) || {}
  const points = dates.map(d => {
    const v = logsMap[d] ? pick(logsMap[d]) : null
    return v === '' || v == null ? null : Number(v)
  })
  return (
    <div className="chart-card">
      <div className="c-title">
        <span>{title}</span>
        <span className="c-value">{value ?? '—'}<span className="tiny" style={{ fontWeight: 500 }}> {unit}</span></span>
      </div>
      <Sparkline points={points} labels={dates.map(d => fmtDate(d))} unit={unit ? ` ${unit}` : ''} goal={goal} color={color} />
    </div>
  )
}

export default function Health() {
  const [date, setDate] = useState(todayStr())
  const log = useLiveQuery(() => db.healthLogs.where('date').equals(date).first(), [date])
  const l = log || {}
  const set = patch => setLogField(date, patch)
  const dates14 = lastNDates(14)
  const dates30 = lastNDates(30)

  const toggleSymptom = s => {
    const cur = l.symptoms || []
    set({ symptoms: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] })
  }

  return (
    <>
      <h1 className="page-title">❤️ Health</h1>
      <p className="page-sub">A gentle daily check-in with yourself</p>

      <div className="spread" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          {date === todayStr() ? "Today's check-in" : `Check-in · ${fmtDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}`}
        </h2>
        <input className="input" type="date" max={todayStr()} value={date}
          onChange={e => e.target.value && setDate(e.target.value)} style={{ width: 'auto' }} />
      </div>

      <div className="grid cols-2">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Ring value={l.water || 0} max={WATER_GOAL} size={110} color="var(--chart-2)">
            <div className="big">{l.water || 0}</div>
            <div className="tiny">of {WATER_GOAL} glasses</div>
          </Ring>
          <div className="stack">
            <div style={{ fontWeight: 650 }}>💧 Water</div>
            <Stepper value={l.water || 0} onChange={v => set({ water: v })} max={20} />
          </div>
        </div>

        <div className="card">
          <div className="spread">
            <div style={{ fontWeight: 650 }}>😴 Sleep</div>
            <Stepper value={l.sleepHours ?? 0} onChange={v => set({ sleepHours: v })} max={14} step={0.5} suffix="h" />
          </div>
          <div className="spread" style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 650 }}>🏃‍♀️ Exercise</div>
            <Stepper value={l.exercise || 0} onChange={v => set({ exercise: v })} max={300} step={5} suffix="m" />
          </div>
        </div>

        <div className="card">
          <Field label="🙂 Mood"><Scale value={l.mood} onChange={v => set({ mood: v })} /></Field>
          <Field label="🌊 Stress (1 = calm, 5 = very stressed)">
            <Scale value={l.stress} onChange={v => set({ stress: v })} faces={['🧘‍♀️', '😌', '😬', '😩', '🤯']} />
          </Field>
          <Field label="⚡ Energy">
            <Scale value={l.energy} onChange={v => set({ energy: v })} faces={['🪫', '😪', '😐', '😊', '⚡']} />
          </Field>
        </div>

        <div className="card">
          <div className="spread" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 650 }}>🩸 Period today</div>
            <Toggle on={!!l.period} onChange={v => set({ period: v })} label="Period" />
          </div>
          <Field label="⚖️ Weight (optional)">
            <input className="input" type="number" step="0.1" min="0" placeholder="kg"
              value={l.weight ?? ''} onChange={e => set({ weight: e.target.value === '' ? '' : Number(e.target.value) })} />
          </Field>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <Field label="🌡 Symptoms">
            <div className="chips">
              {SYMPTOMS.map(s => (
                <button key={s} className={`chip ${(l.symptoms || []).includes(s) ? 'active' : ''}`}
                  onClick={() => toggleSymptom(s)}>{s}</button>
              ))}
            </div>
          </Field>
          <Field label="📝 Notes — meals, nutrition, how you feel">
            <textarea className="input" value={l.notes || ''} onChange={e => set({ notes: e.target.value })}
              placeholder="Anything worth remembering about today…" />
          </Field>
        </div>
      </div>

      <h2 className="section-title">Trends · last 2 weeks</h2>
      <div className="grid cols-2">
        <TrendCard title="💧 Water" value={l.water} unit="glasses" dates={dates14} pick={x => x.water} goal={WATER_GOAL} color="var(--chart-2)" />
        <TrendCard title="😴 Sleep" value={l.sleepHours} unit="h" dates={dates14} pick={x => x.sleepHours} goal={8} color="var(--chart-4)" />
        <TrendCard title="⚡ Energy" value={l.energy} unit="/ 5" dates={dates14} pick={x => x.energy} color="var(--chart-1)" />
        <TrendCard title="🙂 Mood" value={l.mood} unit="/ 5" dates={dates14} pick={x => x.mood} color="var(--chart-3)" />
        <TrendCard title="🏃‍♀️ Exercise" value={l.exercise} unit="min" dates={dates14} pick={x => x.exercise} color="var(--chart-1)" />
        <TrendCard title="⚖️ Weight · last 30 days" value={l.weight} unit="kg" dates={dates30} pick={x => x.weight} color="var(--chart-2)" />
      </div>
    </>
  )
}
