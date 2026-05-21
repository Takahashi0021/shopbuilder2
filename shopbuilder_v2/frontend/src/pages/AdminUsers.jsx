import { useState, useEffect } from 'react'
import { admin } from '../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = () => {
    admin.listUsers().then(res => setUsers(res.data.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const deactivate = async (id, email) => {
    if (!confirm(`Deactivate user "${email}"?`)) return
    try {
      await admin.deactivateUser(id)
      setMsg(`User "${email}" deactivated`)
      load()
    } catch (e) {
      setMsg(e.response?.data?.error?.message || 'Error')
    }
  }

  const roleColor = { ADMIN: 'badge-purple', MERCHANT: 'badge-blue', CUSTOMER: 'badge-green' }

  if (loading) return <div className="spinner" />

  return (
    <div className="container page">
      <h1 className="page-title">All Users</h1>
      {msg && <div className="success">{msg}</div>}
      <div className="card">
        <table>
          <thead>
            <tr><th>Email</th><th>Username</th><th>Role</th><th>Verified</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td><span className={`badge ${roleColor[u.role]}`}>{u.role}</span></td>
                <td><span className={`badge ${u.isEmailVerified ? 'badge-green' : 'badge-red'}`}>{u.isEmailVerified ? 'Yes' : 'No'}</span></td>
                <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  {u.isActive && (
                    <button className="btn btn-danger btn-sm" onClick={() => deactivate(u.id, u.email)}>
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
