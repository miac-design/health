import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { todayStr, fmtDateLong, greeting } from '../utils'
import { Ring } from '../ui'
import { IconBox } from '../icons'

export default function Home() {
  const nav = useNavigate()
  const today = todayStr()

  const products = useLiveQuery(() => db.products.toArray(), []) || []
  const habits = useLiveQuery(() => db.habits.toArray(), []) || []
  const habitLogs = useLiveQuery(() => db.habitLogs.where('date').equals(today).toArray(), [today]) || []
  const steps = useLiveQuery(() => db.routineSteps.toArray(), []) || []
  const checks = useLiveQuery(() => db.routineChecks.where('date').equals(today).toArray(), [today]) || []
  const photos = useLiveQuery(() => db.progressPhotos.toArray(), []) || []

  const doneHabits = habitLogs.filter(l => l.done).length
  const byCat = c => products.filter(p => p.category === c).length
  const routineDone = which => {
    const s = steps.filter(st => st.routine === which)
    const done = s.filter(st => checks.some(c => c.stepId === st.id && c.done)).length
    return { done, total: s.length }
  }
  const morning = routineDone('morning')
  const evening = routineDone('evening')
  const shower = routineDone('shower')

  const tiles = [
    { icon: 'sunrise', tint: 'sand', name: 'Morning Routine', to: '/routine/morning', meta: `${morning.done} of ${morning.total} done` },
    { icon: 'moon', tint: 'lav', name: 'Night Routine', to: '/routine/evening', meta: `${evening.done} of ${evening.total} done` },
    { icon: 'shower-head', tint: 'water', name: 'Shower Routine', to: '/routine/shower', meta: `${shower.done} of ${shower.total} done` },
    { icon: 'droplets', tint: 'water', name: 'Skincare', to: '/products?cat=Face', meta: `${byCat('Face')} products` },
    { icon: 'bath', tint: 'blush', name: 'Body Care', to: '/products?cat=Body', meta: `${byCat('Body')} products` },
    { icon: 'brush', tint: 'sand', name: 'Hair Care', to: '/products?cat=Hair', meta: `${byCat('Hair')} products` },
    { icon: 'palette', tint: 'blush', name: 'Makeup', to: '/products?cat=Makeup', meta: `${byCat('Makeup')} products` },
    { icon: 'pill', tint: 'sage', name: 'Supplements', to: '/supplements', meta: `${byCat('Supplement')} supplements` },
    { icon: 'dumbbell', tint: 'sage', name: 'Fitness', to: '/habits', meta: 'Exercise & movement' },
    { icon: 'trending-up', tint: 'sage', name: 'Progress', to: '/progress', meta: `${photos.length} photos` },
    { icon: 'package', tint: 'sand', name: 'Products I Own', to: '/products', meta: `${products.length} in library` },
    { icon: 'calendar-check', tint: 'sage', name: "Today's Habits", to: '/habits', meta: `${doneHabits} of ${habits.length} done` },
  ]

  return (
    <>
      <h1 className="page-title">{greeting()}, Mia</h1>
      <p className="page-sub">{fmtDateLong(today)}</p>

      <div className="grid cols-2">
        <Link to="/habits" className="card" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Ring value={doneHabits} max={habits.length || 1} size={104}>
            <div className="big">{doneHabits}</div>
            <div className="tiny">of {habits.length}</div>
          </Ring>
          <div className="stack" style={{ gap: 4 }}>
            <div style={{ fontWeight: 650 }}>Habits today</div>
            <div className="tiny">{doneHabits === habits.length && habits.length > 0 ? 'All done — beautiful!' : 'Tap to check off'}</div>
          </div>
        </Link>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
          {[
            ['sunrise', 'sand', 'Morning', morning, '/routine/morning'],
            ['moon', 'lav', 'Evening', evening, '/routine/evening'],
            ['shower-head', 'water', 'Shower', shower, '/routine/shower'],
          ].map(([icon, tint, label, r, to]) => (
            <div key={label} className="spread" onClick={() => nav(to)} style={{ cursor: 'pointer' }}>
              <span className="row-flex" style={{ gap: 9, fontWeight: 650 }}>
                <IconBox name={icon} tint={tint} size={30} iconSize={16} />{label}
              </span>
              <span className={`badge ${r.done === r.total && r.total > 0 ? '' : 'neutral'}`}>
                {r.done}/{r.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="section-title">My dashboards</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {tiles.map(t => (
          <Link key={t.name} to={t.to} className="tile">
            <IconBox name={t.icon} tint={t.tint} />
            <div>
              <div className="t-name">{t.name}</div>
              <div className="t-meta">{t.meta}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
