import React from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import ThemesPage from '../pages/ThemesPage'
import UsersPage from '../pages/UsersPage'
import EventsPage from '../pages/EventsPage'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/themes', label: 'Themes' },
  { to: '/users', label: 'Users' },
  { to: '/events', label: 'Events' },
]

export default function AdminLayout({ admin, onLogout }) {
  const location = useLocation()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="kicker">Operations</p>
          <div className="brand-row">
            <div className="brand-mark">H</div>
            <div>
              <strong>HUBLE</strong>
              <p>Admin console</p>
            </div>
          </div>
          <nav className="nav-list">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={location.pathname.startsWith(item.to) ? 'nav-item active' : 'nav-item'}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div>
            <strong>{admin.username}</strong>
            <p>{admin.email}</p>
          </div>
          <button className="button ghost" onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </main>
    </div>
  )
}