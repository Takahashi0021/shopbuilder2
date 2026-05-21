import { useState, useEffect } from 'react'
import { tenants } from '../services/api'

export default function MerchantStores() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const load = () => {
    tenants.getMyTenants().then(res => {
      const data = res.data.data
      setStores(Array.isArray(data.tenants) ? data.tenants : data.tenant ? [data.tenant] : [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await tenants.onboard(form)
      setMsg('Store created successfully!')
      setShowForm(false)
      setForm({ name: '', slug: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error creating store')
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="container page">
      <div className="flex-between mb-16">
        <h1 className="page-title" style={{margin:0}}>My Stores</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + New Store
        </button>
      </div>
      {msg && <div className="success">{msg}</div>}
      {showForm && (
        <div className="card">
          <h3 className="modal-title">Create New Store</h3>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleCreate}>
            <label>Store Name</label>
            <input placeholder="My Awesome Shop" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required />
            <label>Slug (URL identifier)</label>
            <input placeholder="my-awesome-shop" value={form.slug}
              onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/\s+/g,'-')})} required />
            <div className="flex gap-8">
              <button className="btn btn-primary" type="submit">Create Store</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid-2">
        {stores.map(s => (
          <div className="card" key={s.id}>
            <div className="flex-between" style={{marginBottom:12}}>
              <h3 style={{fontWeight:700,fontSize:18}}>{s.name}</h3>
              <span className={`badge ${s.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>{s.status}</span>
            </div>
            <p className="text-sm">Slug: <strong>{s.slug}</strong></p>
            <p className="text-sm" style={{marginTop:4}}>ID: {s.id.slice(0,8)}...</p>
          </div>
        ))}
        {stores.length === 0 && (
          <div className="card" style={{gridColumn:'1/-1',textAlign:'center',color:'#6b7280'}}>
            No stores yet. Create your first store!
          </div>
        )}
      </div>
    </div>
  )
}
