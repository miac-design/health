import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { todayStr, fmtDateLong, greeting } from '../utils'
import { Ring } from '../ui'

const WATER_GOAL = 8

export default function Home() {
  const nav = useNavigate()
  const today = todayStr()

  const products = useLiveQuery(() => db.products.toArray(), []) || []
  const habits = useLiveQuery(() => db.habits.toArray(), []) || []
  const habitLogs = useLiveQuery(() => db.habitLogs.where('date').equals(today).toArray(), [today]) || []
  const steps = useLiveQuery(() => db.routineSteps.toArray(), []) || []
  const checks = useLiveQuery(() => db.routineChecks.where('date').equals(today).toArray(), [today]) || []
  const log = useLiveQuery(() => db.healthLogs.where('date').equals(today).first(), [today])
  const wishlist = useLiveQuery(() => db.wishlist.toArray(), []) || []
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
  const water = log?.water || 0

  const addWater = async () => {
    if (log) await db.healthLogs.update(log.id, { water: (log.water || 0) + 1 })
    else await db.healthLogs.add({ date: today, water: 1 })
  }

  const tiles = [
    { emoji: '🌞', name: 'Morning Routine', to: '/routine/morning', meta: `${morning.done} of ${morning.total} done` },
    { emoji: '🌙', name: 'Night Routine', to: '/routine/evening', meta: `${evening.done} of ${evening.total} done` },
    { emoji: '🧴', name: 'Skincare', to: '/products?cat=Face', meta: `${byCat('Face')} products` },
    { emoji: '🛁', name: 'Body Care', to: '/products?cat=Body', meta: `${byCat('Body')} products` },
    { emoji: '💇‍♀️', name: 'Hair Care', to: '/products?cat=Hair', meta: `${byCat('Hair')} products` },
    { emoji: '💄', name: 'Makeup', to: '/products?cat=Makeup', meta: `${byCat('Makeup')} products` },
    { emoji: '💊', name: 'Supplements', to: '/supplements', meta: `${byCat('Supplement')} supplements` },
    { emoji: '🏋️', name: 'Fitness', to: '/habits', meta: 'Exercise & movement' },
    { emoji: '🍎', name: 'Nutrition', to: '/health', meta: 'Log in Health' },
    { emoji: '💧', name: 'Hydration', to: '/health', meta: `${water} of ${WATER_GOAL} glasses` },
    { emoji: '❤️', name: 'Health', to: '/health', meta: log ? 'Logged today' : 'Log today' },
    { emoji: '📊', name: 'Progress', to: '/progress', meta: `${photos.length} photos` },
    { emoji: '📦', name: 'Products I Own', to: '/products', meta: `${products.length} in library` },
    { emoji: '🛍️', name: 'Wishlist', to: '/wishlist', meta: `${wishlist.length} saved` },
    { emoji: '📅', name: "Today's Habits", to: '/habits', meta: `${doneHabits} of ${habits.length} done` },
  ]

  return (
    <>
      <h1 className="page-title">{greeting()}, Mia 🌿</h1>
      <p className="page-sub">{fmtDateLong(today)}</p>

      <div className="grid cols-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Ring value={water} max={WATER_GOAL} size={104} color="var(--chart-2)">
            <div className="big">{water}</div>
            <div className="tiny">of {WATER_GOAL}</div>
          </Ring>
          <div className="stack" style={{ gap: 8 }}>
            <div style={{ fontWeight: 650 }}>💧 Water</div>
            <button className="btn small secondary" onClick={addWater}>+ Add glass</button>
          </div>
        </div>

        <Link to="/habits" className="card" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Ring value={doneHabits} max={habits.length || 1} size={104}>
            <div className="big">{doneHabits}</div>
            <div className="tiny">of {habits.length}</div>
          </Ring>
          <div className="stack" style={{ gap: 4 }}>
            <div style={{ fontWeight: 650 }}>📅 Habits today</div>
            <div className="tiny">{doneHabits === habits.length && habits.length > 0 ? 'All done — beautiful! ✨' : 'Tap to check off'}</div>
          </div>
        </Link>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
          <div className="spread" onClick={() => nav('/routine/morning')} style={{ cursor: 'pointer' }}>
            <span style={{ fontWeight: 650 }}>🌞 Morning</span>
            <span className={`badge ${morning.done === morning.total && morning.total > 0 ? '' : 'neutral'}`}>
              {morning.done}/{morning.total}
            </span>
          </div>
          <div className="spread" onClick={() => nav('/routine/evening')} style={{ cursor: 'pointer' }}>
            <span style={{ fontWeight: 650 }}>🌙 Evening</span>
            <span className={`badge ${evening.done === evening.total && evening.total > 0 ? 'night' : 'neutral'}`}>
              {evening.done}/{evening.total}
            </span>
          </div>
        </div>
      </div>

      <h2 className="section-title">My dashboards</h2>
      <div className="grid cols-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {tiles.map(t => (
          <Link key={t.name} to={t.to} className="tile">
            <span className="emoji">{t.emoji}</span>
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
