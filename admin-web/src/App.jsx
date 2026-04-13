import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import { adminApi, clearAdminSession, getAdminUser, setAdminSession } from './lib/api'

function useAuth() {
  const [admin, setAdmin] = useState(getAdminUser())

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    adminApi.profile()
      .then((data) => setAdmin(data.admin))
      .catch(() => {
        clearAdminSession()
        setAdmin(null)
      })
  }, [])

  const login = (payload) => {
    setAdminSession(payload)
    setAdmin(payload.admin)
  }

  const logout = () => {
    clearAdminSession()
    setAdmin(null)
  }

  return { admin, login, logout }
}

export default function App() {
  const auth = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={auth.login} admin={auth.admin} />} />
      <Route
        path="/*"
        element={auth.admin ? <AdminLayout admin={auth.admin} onLogout={auth.logout} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

function LoginPage({ onLogin, admin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (admin) {
      window.location.href = '/admin/dashboard'
    }
  }, [admin])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await adminApi.login({ email, password })
      onLogin(data)
      window.location.href = '/admin/dashboard'
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand-mark">H</div>
        <h1>HUBLE Admin</h1>
        <p>Real React app powered by the backend API.</p>

        <form onSubmit={handleSubmit} className="stack">
          <label>
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@huble.com" type="email" />
          </label>
          <label>
            <span>Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
          </label>
          {error && <div className="alert error">{error}</div>}
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}