import { useState, useEffect } from 'react'
import { orders } from '../services/api'

const STATUS_COLORS = { PENDING:'badge-yellow', CONFIRMED:'badge-blue', SHIPPED:'badge-purple', DELIVERED:'badge-green', CANCELLED:'badge-red' }
const NEXT_STATUS = { PENDING:'CONFIRMED', CONFIRMED:'SHIPPED', SHIPPED:'DELIVERED' }

export default function MerchantOrders() {
  const [myOrders, setMyOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = () => {
    orders.list().then(res => setMyOrders(res.data.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    try {
      await orders.updateStatus(id, status)
      setMsg(`Order status updated to ${status}`)
      load()
    } catch (e) {
      setMsg(e.response?.data?.error?.message || 'Error')
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="container page">
      <h1 className="page-title">Store Orders</h1>
      {msg && <div className="success">{msg}</div>}
      <div className="card">
        <table>
          <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {myOrders.map(o => (
              <tr key={o.id}>
                <td><strong>#{o.id.slice(0,8).toUpperCase()}</strong></td>
                <td>{o.customer?.email || o.customer?.username}</td>
                <td>${parseFloat(o.totalAmount).toFixed(2)}</td>
                <td><span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  {NEXT_STATUS[o.status] && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(o.id, NEXT_STATUS[o.status])}>
                      → {NEXT_STATUS[o.status]}
                    </button>
                  )}
                  {o.status === 'PENDING' && (
                    <button className="btn btn-danger btn-sm" style={{marginLeft:4}} onClick={() => updateStatus(o.id, 'CANCELLED')}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {myOrders.length === 0 && (
              <tr><td colSpan={6} style={{textAlign:'center',color:'#6b7280'}}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
