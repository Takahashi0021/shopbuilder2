import { useState, useEffect } from 'react'
import { orders } from '../services/api'

const STATUS_COLORS = { PENDING:'badge-yellow', CONFIRMED:'badge-blue', SHIPPED:'badge-purple', DELIVERED:'badge-green', CANCELLED:'badge-red' }

export default function CustomerOrders() {
  const [myOrders, setMyOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    orders.list().then(res => setMyOrders(res.data.data || [])).finally(() => setLoading(false))
  }, [])

  const viewOrder = async (id) => {
    const res = await orders.get(id)
    setSelected(res.data.data.order)
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="container page">
      <h1 className="page-title">My Orders</h1>
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Order #{selected.id.slice(0,8).toUpperCase()}</h3>
            <p><strong>Status:</strong> <span className={`badge ${STATUS_COLORS[selected.status]}`}>{selected.status}</span></p>
            <p style={{marginTop:8}}><strong>Total:</strong> ${parseFloat(selected.totalAmount).toFixed(2)}</p>
            <p style={{marginTop:8}}><strong>Store:</strong> {selected.tenant?.name}</p>
            <p style={{marginTop:8}}><strong>Notes:</strong> {selected.notes || 'None'}</p>
            <h4 style={{marginTop:16,marginBottom:8}}>Items:</h4>
            {selected.items?.map(item => (
              <div key={item.id} style={{padding:'8px 0',borderBottom:'1px solid #e5e7eb'}}>
                <p>{item.variant?.sku} × {item.quantity} = ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <button className="btn btn-secondary" style={{marginTop:16,width:'100%'}} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
      <div className="card">
        <table>
          <thead><tr><th>Order ID</th><th>Store</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {myOrders.map(o => (
              <tr key={o.id}>
                <td><strong>#{o.id.slice(0,8).toUpperCase()}</strong></td>
                <td>{o.tenant?.name || '-'}</td>
                <td>${parseFloat(o.totalAmount).toFixed(2)}</td>
                <td><span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => viewOrder(o.id)}>View</button></td>
              </tr>
            ))}
            {myOrders.length === 0 && (
              <tr><td colSpan={6} style={{textAlign:'center',color:'#6b7280'}}>No orders yet. Go shopping!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
