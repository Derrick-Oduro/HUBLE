import React, { useEffect, useState } from 'react'
import { adminApi } from '../lib/api'
import AlertBox from '../components/AlertBox'
import PageHeader from '../components/PageHeader'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.events()
      .then((data) => setEvents(data.events || []))
      .catch((eventsError) => setError(eventsError.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <PageHeader title="Events" subtitle="Manage event and challenge data" />
      {error && <AlertBox kind="error" message={error} />}
      {loading ? <div className="panel muted">Loading events...</div> : (
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Status</th><th>Start</th><th>End</th></tr>
              </thead>
              <tbody>
                {!events.length && (
                  <tr>
                    <td colSpan={4} className="muted">No events available.</td>
                  </tr>
                )}
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>
                      <span className={event.is_active ? 'status-badge good' : 'status-badge bad'}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(event.start_date)}</td>
                    <td>{formatDate(event.end_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}