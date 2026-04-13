import React, { useEffect, useState } from 'react'
import { adminApi } from '../lib/api'
import AlertBox from '../components/AlertBox'
import PageHeader from '../components/PageHeader'

function AvatarBadge({ avatar }) {
  return <span className="avatar-badge">{avatar || '😊'}</span>
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.users()
      const incomingUsers = data.users || []
      setUsers(incomingUsers)
      if (incomingUsers.length && !selectedUser) {
        setSelectedUser(incomingUsers[0])
      }
    } catch (usersError) {
      setError(usersError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <section>
      <PageHeader title="Users" subtitle="Inspect users, avatars, and stats" action={<button className="button ghost" onClick={loadUsers}>Refresh</button>} />
      {error && <AlertBox kind="error" message={error} />}
      {!loading && !error && (
        <div className="stats-grid compact">
          <article className="stat-card compact"><span>Total users</span><strong>{users.length}</strong></article>
          <article className="stat-card compact"><span>Selected user</span><strong>{selectedUser?.username || '-'}</strong></article>
        </div>
      )}
      {loading ? <div className="panel muted">Loading users...</div> : (
        <div className="split-grid">
          <div className="panel">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Avatar</th><th>Username</th><th>Email</th><th>Created</th></tr>
                </thead>
                <tbody>
                  {!users.length && (
                    <tr>
                      <td colSpan={4} className="muted">No users found.</td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={selectedUser?.id === user.id ? 'clickable-row row-active' : 'clickable-row'}
                    >
                      <td><AvatarBadge avatar={user.avatar} /></td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="panel detail-panel">
            {selectedUser ? (
              <>
                <div className="user-detail-hero">
                  <AvatarBadge avatar={selectedUser.avatar} />
                  <div>
                    <h3>{selectedUser.username}</h3>
                    <p>{selectedUser.email}</p>
                  </div>
                </div>
                <div className="detail-list">
                  <div><span>ID</span><strong>{selectedUser.id}</strong></div>
                  <div><span>Level</span><strong>{selectedUser.stats?.level ?? '-'}</strong></div>
                  <div><span>XP</span><strong>{selectedUser.stats?.experience ?? '-'}</strong></div>
                  <div><span>Coins</span><strong>{selectedUser.stats?.coins_earned ?? '-'}</strong></div>
                  <div><span>Health</span><strong>{selectedUser.stats?.health ?? '-'}</strong></div>
                  <div><span>Avatar</span><strong>{selectedUser.avatar || '😊'}</strong></div>
                  <div><span>Avatar Color</span><strong>{selectedUser.avatar_color || '-'}</strong></div>
                  <div><span>Avatar Border</span><strong>{selectedUser.avatar_border || '-'}</strong></div>
                </div>
              </>
            ) : (
              <p className="muted">Select a user to see details.</p>
            )}
          </aside>
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