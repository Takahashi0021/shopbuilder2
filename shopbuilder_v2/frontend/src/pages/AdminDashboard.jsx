import { useState, useEffect } from 'react'
import { admin } from '../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    admin.dashboard().then(res => {
      setStats(res.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />

  return (
    <div className="container page">
      <h1 className="page-title">Admin Dashboard</h1>
      <div className="grid-3" style={{marginBottom:24}}>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalTenants || 0}</div>
          <div className="stat-label">Total Stores</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalProducts || 0}</div>
          <div className="stat-label">Total Products</div>
        </div>
      </div>
      <div className="card">
        <h3 style={{marginBottom:16,fontWeight:700}}>Recent Orders</h3>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Store</th></tr></thead>
          <tbody>
            {stats?.recentOrders?.map(o => (
              <tr key={o.id}>
                <td>#{o.id.slice(0,8).toUpperCase()}</td>
                <td>{o.customer?.email}</td>
                <td>{o.tenant?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
