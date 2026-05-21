import { useState, useEffect } from 'react'
import { products, tenants } from '../services/api'

export default function MerchantProducts() {
  const [myProducts, setMyProducts] = useState([])
  const [myTenants, setMyTenants] = useState([])
  const [selectedTenant, setSelectedTenant] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showVariantForm, setShowVariantForm] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', basePrice: '' })
  const [variantForm, setVariantForm] = useState({ sizes: 'S,M,L,XL', colors: 'Red,Blue,Black', materials: 'Cotton', basePrice: '', initialStock: 100 })
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    tenants.getMyTenants().then(res => {
      const data = res.data.data
      const list = Array.isArray(data.tenants) ? data.tenants : data.tenant ? [data.tenant] : []
      setMyTenants(list)
      if (list.length > 0) setSelectedTenant(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedTenant) return
    setLoading(true)
    products.list(selectedTenant).then(res => {
      setMyProducts(res.data.data || [])
    }).finally(() => setLoading(false))
  }, [selectedTenant])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await products.create({ ...form, basePrice: parseFloat(form.basePrice) }, selectedTenant)
      setMsg('Product created!')
      setShowForm(false)
      setForm({ name: '', description: '', basePrice: '' })
      products.list(selectedTenant).then(res => setMyProducts(res.data.data || []))
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error')
    }
  }

  const handleGenerateVariants = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await products.generateVariants(showVariantForm, {
        sizes: variantForm.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: variantForm.colors.split(',').map(s => s.trim()).filter(Boolean),
        materials: variantForm.materials.split(',').map(s => s.trim()).filter(Boolean),
        basePrice: parseFloat(variantForm.basePrice),
        initialStock: parseInt(variantForm.initialStock),
      }, selectedTenant)
      setMsg('Variants generated successfully!')
      setShowVariantForm(null)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error')
    }
  }

  return (
    <div className="container page">
      <div className="flex-between mb-16">
        <h1 className="page-title" style={{margin:0}}>Products</h1>
        <div className="flex gap-8">
          {myTenants.length > 1 && (
            <select style={{width:'auto',marginBottom:0}} value={selectedTenant} onChange={e => setSelectedTenant(e.target.value)}>
              {myTenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Product</button>
        </div>
      </div>
      {msg && <div className="success">{msg}</div>}
      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="card">
          <h3 className="modal-title">New Product</h3>
          <form onSubmit={handleCreate}>
            <label>Product Name</label>
            <input placeholder="Classic T-Shirt" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <label>Description</label>
            <textarea placeholder="Product description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{height:80}} />
            <label>Base Price ($)</label>
            <input type="number" step="0.01" placeholder="29.99" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} required />
            <div className="flex gap-8">
              <button className="btn btn-primary" type="submit">Create</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showVariantForm && (
        <div className="modal-overlay" onClick={() => setShowVariantForm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">🎨 Generate SKU Matrix</h3>
            <p className="text-sm" style={{marginBottom:16}}>Enter comma-separated values for each dimension</p>
            <form onSubmit={handleGenerateVariants}>
              <label>Sizes (comma separated)</label>
              <input placeholder="S,M,L,XL" value={variantForm.sizes} onChange={e => setVariantForm({...variantForm, sizes: e.target.value})} />
              <label>Colors (comma separated)</label>
              <input placeholder="Red,Blue,Black" value={variantForm.colors} onChange={e => setVariantForm({...variantForm, colors: e.target.value})} />
              <label>Materials (comma separated)</label>
              <input placeholder="Cotton,Polyester" value={variantForm.materials} onChange={e => setVariantForm({...variantForm, materials: e.target.value})} />
              <label>Price ($)</label>
              <input type="number" step="0.01" placeholder="29.99" value={variantForm.basePrice} onChange={e => setVariantForm({...variantForm, basePrice: e.target.value})} required />
              <label>Initial Stock per variant</label>
              <input type="number" placeholder="100" value={variantForm.initialStock} onChange={e => setVariantForm({...variantForm, initialStock: e.target.value})} />
              <div className="flex gap-8">
                <button className="btn btn-primary" type="submit">Generate Variants</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowVariantForm(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="spinner" /> : (
        <div className="card">
          <table>
            <thead><tr><th>Name</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {myProducts.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br/><span className="text-sm">{p.description}</span></td>
                  <td>${parseFloat(p.basePrice).toFixed(2)}</td>
                  <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowVariantForm(p.id)}>
                      Generate SKUs
                    </button>
                  </td>
                </tr>
              ))}
              {myProducts.length === 0 && (
                <tr><td colSpan={4} style={{textAlign:'center',color:'#6b7280'}}>No products yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
