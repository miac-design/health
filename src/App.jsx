import React from 'react'
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import Routine from './pages/Routine'
import Supplements from './pages/Supplements'
import Health from './pages/Health'
import Habits from './pages/Habits'
import Wishlist from './pages/Wishlist'
import Progress from './pages/Progress'
import Notes from './pages/Notes'
import Settings from './pages/Settings'

const NAV_GROUPS = [
  { label: null, items: [{ to: '/', emoji: '🏠', name: 'Home' }] },
  {
    label: 'Routines',
    items: [
      { to: '/routine/morning', emoji: '🌞', name: 'Morning' },
      { to: '/routine/evening', emoji: '🌙', name: 'Evening' },
      { to: '/routine/shower', emoji: '🛁', name: 'Shower' },
    ],
  },
  {
    label: 'My things',
    items: [
      { to: '/products', emoji: '📦', name: 'Products' },
      { to: '/supplements', emoji: '💊', name: 'Supplements' },
      { to: '/wishlist', emoji: '🛍️', name: 'Wishlist' },
    ],
  },
  {
    label: 'Track',
    items: [
      { to: '/health', emoji: '❤️', name: 'Health' },
      { to: '/habits', emoji: '📅', name: 'Habits' },
      { to: '/progress', emoji: '📊', name: 'Progress' },
    ],
  },
  {
    label: 'More',
    items: [
      { to: '/notes', emoji: '📝', name: 'Notes' },
      { to: '/settings', emoji: '⚙️', name: 'Settings' },
    ],
  },
]

const TABS = [
  { to: '/', emoji: '🏠', name: 'Home' },
  { to: '/routine/morning', emoji: '✨', name: 'Routines', match: '/routine' },
  { to: '/habits', emoji: '📅', name: 'Habits' },
  { to: '/health', emoji: '❤️', name: 'Health' },
  { to: '/products', emoji: '📦', name: 'Products' },
]

export default function App() {
  const loc = useLocation()
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">🌿 Wellness OS</div>
        {NAV_GROUPS.map((g, i) => (
          <React.Fragment key={i}>
            {g.label && <div className="nav-group-label">{g.label}</div>}
            {g.items.map(it => (
              <NavLink key={it.to} to={it.to} end={it.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="emoji">{it.emoji}</span>{it.name}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/routine/:which" element={<Routine />} />
          <Route path="/supplements" element={<Supplements />} />
          <Route path="/health" element={<Health />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav className="tabbar">
        {TABS.map(t => {
          const active = t.match ? loc.pathname.startsWith(t.match) : loc.pathname === t.to
          return (
            <NavLink key={t.to} to={t.to} className={`tab ${active ? 'active' : ''}`}>
              <span className="emoji">{t.emoji}</span>{t.name}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
