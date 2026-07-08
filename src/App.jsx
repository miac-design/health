import React from 'react'
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { Icon } from './icons'
import Home from './pages/Home'
import Products from './pages/Products'
import Routine from './pages/Routine'
import Supplements from './pages/Supplements'
import Habits from './pages/Habits'
import Progress from './pages/Progress'
import Notes from './pages/Notes'
import Settings from './pages/Settings'

const NAV_GROUPS = [
  { label: null, items: [{ to: '/', icon: 'house', name: 'Home' }] },
  {
    label: 'Routines',
    items: [
      { to: '/routine/morning', icon: 'sunrise', name: 'Morning' },
      { to: '/routine/evening', icon: 'moon', name: 'Evening' },
      { to: '/routine/shower', icon: 'shower-head', name: 'Shower' },
    ],
  },
  {
    label: 'My things',
    items: [
      { to: '/products', icon: 'package', name: 'Products' },
      { to: '/supplements', icon: 'pill', name: 'Supplements' },
    ],
  },
  {
    label: 'Track',
    items: [
      { to: '/habits', icon: 'calendar-check', name: 'Habits' },
      { to: '/progress', icon: 'trending-up', name: 'Progress' },
    ],
  },
  {
    label: 'More',
    items: [
      { to: '/notes', icon: 'notebook-pen', name: 'Notes' },
      { to: '/settings', icon: 'settings', name: 'Settings' },
    ],
  },
]

const TABS = [
  { to: '/', icon: 'house', name: 'Home' },
  { to: '/routine/morning', icon: 'sparkles', name: 'Routines', match: '/routine' },
  { to: '/habits', icon: 'calendar-check', name: 'Habits' },
  { to: '/products', icon: 'package', name: 'Products' },
  { to: '/supplements', icon: 'pill', name: 'Supplements' },
]

export default function App() {
  const loc = useLocation()
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><Icon name="leaf" size={22} style={{ color: 'var(--sage-600)' }} /> Wellness OS</div>
        {NAV_GROUPS.map((g, i) => (
          <React.Fragment key={i}>
            {g.label && <div className="nav-group-label">{g.label}</div>}
            {g.items.map(it => (
              <NavLink key={it.to} to={it.to} end={it.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icon name={it.icon} />{it.name}
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
          <Route path="/habits" element={<Habits />} />
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
              <Icon name={t.icon} />{t.name}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
