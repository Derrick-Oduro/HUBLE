import React, { useEffect, useState } from 'react'
import { adminApi } from '../lib/api'
import AlertBox from '../components/AlertBox'
import PageHeader from '../components/PageHeader'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.dashboardStats()
      .then((data) => setStats(data.stats))
      .catch((dashboardError) => setError(dashboardError.message))
  }, [])

  if (error) return <AlertBox kind="error" message={error} />
  if (!stats) return <div className="panel muted">Loading dashboard stats...</div>

  const cards = [
    ['Total Users', stats.totalUsers, 'People in the app', 'Users'],
    ['Active Events', stats.activeEvents, 'Running now', 'Events'],
    ['Total Themes', stats.totalThemes, 'Available themes', 'Themes'],
    ['Recent Signups', stats.recentSignups, 'Last 7 days', 'Growth'],
  ]

  return (
    <section>
      <PageHeader title="Dashboard" subtitle="Live numbers from the HUBLE API" />
      <div className="stats-grid">
        {cards.map(([label, value, hint, kicker]) => (
          <article className="stat-card" key={label}>
            <em>{kicker}</em>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{hint}</small>
          </article>
        ))}
      </div>
    </section>
  )
}