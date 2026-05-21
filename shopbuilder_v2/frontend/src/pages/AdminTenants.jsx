import { useState, useEffect } from 'react'
import { admin } from '../services/api'

export default function AdminTenants() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = () => {
    admin.listTenants().then(res => setTenants(res.data.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const suspend = async (id, name) => {
    const reason = prompt(`Reason for suspending "${name}":`)
    if (!reason) return
    try {
      await admin.suspendTenant(id, reason)
      setMsg(`Store "${name}" suspended`)
      load()
    } catch (e) {
      setMsg(e.response?.data?.error?.message || 'Error')
    }
  }

  const activate = async (id, name) => {
    try {
      await admin.activateTenant(id)
      setMsg(`Store "${name}" activated`)
      load()
    } catch (e) {
      setMsg(e.response?.data?.error?.message || 'Error')
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="container page">
      <h1 className="page-title">All Stores</h1>
      {msg && <div className="success">{msg}</div>}
      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Slug</th><th>Owner</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id}>
                <td><strong>{t.name}</strong></td>
                <td>{t.slug}</td>
                <td>{t.owner?.email}</td>
                <td>
                  <span className={`badge ${t.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                    {t.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-8">
                    {t.status === 'ACTIVE'
                      ? <button className="btn btn-danger btn-sm" onClick={() => suspend(t.id, t.name)}>Suspend</button>
                      : <button className="btn btn-success btn-sm" onClick={() => activate(t.id, t.name)}>Activate</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
