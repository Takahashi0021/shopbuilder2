import { useState, useEffect } from 'react'
import { products, orders, tenants } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Shop() {
  const [allTenants, setAllTenants] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [storeProducts, setStoreProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetch('/api/v1/admin/tenants', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    }).then(r => r.json()).then(data => {
      if (data.data) setAllTenants(data.data)
    }).catch(() => {
      tenants.getMyTenants().then(res => {
        const data = res.data.data
        setAllTenants(Array.isArray(data.tenants) ? data.tenants : data.tenant ? [data.tenant] : [])
      })
    })
  }, [])

  const selectStore = async (store) => {
    setSelectedStore(store)
    setLoading(true)
    setCart([])
    try {
      const res = await products.list(store.id)
      const prods = res.data.data || []
      const withVariants = await Promise.all(prods.map(async p => {
        try {
          const r = await products.get(p.id, store.id)
          return r.data.data.product
        } catch { return p }
      }))
      setStoreProducts(withVariants)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (variant, product) => {
    setCart(prev => {
      const existing = prev.find(c => c.variantId === variant.id)
      if (existing) return prev.map(c => c.variantId === variant.id ? {...c, quantity: c.quantity + 1} : c)
      return [...prev, { variantId: variant.id, quantity: 1, sku: variant.sku, price: variant.price, productName: product.name }]
    })
    setMsg(`Added ${variant.sku} to cart`)
    setTimeout(() => setMsg(''), 2000)
  }

  const checkout = async () => {
    if (!cart.length) return
    setError('')
    try {
      await orders.create(selectedStore.slug, {
        items: cart.map(c => ({ variantId: c.variantId, quantity: c.quantity })),
        notes: 'Order from ShopBuilder frontend'
      })
      setMsg('🎉 Order placed successfully! Check your email for confirmation.')
      setCart([])
      setTimeout(() => setMsg(''), 5000)
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Order failed')
    }
  }

  const total = cart.reduce((sum, c) => sum + parseFloat(c.price) * c.quantity, 0)

  return (
    <div className="container page">
      <h1 className="page-title">🛍️ Shop</h1>
      {msg && <div className="success">{msg}</div>}
      {error && <div className="error">{error}</div>}

      {!selectedStore ? (
        <>
          <p style={{color:'#6b7280',marginBottom:16}}>Choose a store to browse products:</p>
          <div className="grid-3">
            {allTenants.filter(t => t.status === 'ACTIVE').map(t => (
              <div className="card" key={t.id} style={{cursor:'pointer',transition:'transform 0.2s'}}
                onClick={() => selectStore(t)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <h3 style={{fontWeight:700,fontSize:18,marginBottom:8}}>{t.name}</h3>
                <p className="text-sm">/{t.slug}</p>
                <p style={{marginTop:12,color:'#4f46e5',fontSize:14,fontWeight:600}}>Browse →</p>
              </div>
            ))}
            {allTenants.length === 0 && <p style={{color:'#6b7280'}}>No stores available</p>}
          </div>
        </>
      ) : (
        <>
          <div className="flex-between mb-16">
            <div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedStore(null)}>← Back</button>
              <h2 style={{display:'inline',marginLeft:12,fontWeight:700}}>{selectedStore.name}</h2>
            </div>
            {cart.length > 0 && (
              <div className="card" style={{padding:'12px 20px',display:'flex',alignItems:'center',gap:16,margin:0}}>
                <span>🛒 {cart.length} items — <strong>${total.toFixed(2)}</strong></span>
                <button className="btn btn-success btn-sm" onClick={checkout}>Checkout</button>
              </div>
            )}
          </div>

          {loading ? <div className="spinner" /> : (
            <div className="grid-2">
              {storeProducts.map(p => (
                <div className="card" key={p.id}>
                  <h3 style={{fontWeight:700,marginBottom:4}}>{p.name}</h3>
                  <p className="text-sm" style={{marginBottom:12}}>{p.description}</p>
                  {p.variants?.length > 0 ? (
                    <div>
                      <p style={{fontSize:13,fontWeight:600,marginBottom:8,color:'#374151'}}>Available variants:</p>
                      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                        {p.variants.slice(0,6).map(v => (
                          <button key={v.id} className="btn btn-secondary btn-sm"
                            onClick={() => addToCart(v, p)}
                            disabled={v.stock === 0}
                            style={{opacity: v.stock === 0 ? 0.5 : 1}}>
                            {v.sku.split('-').slice(1).join('-')} ${parseFloat(v.price).toFixed(2)}
                            {v.stock === 0 && ' (Out)'}
                          </button>
                        ))}
                        {p.variants.length > 6 && <span className="text-sm">+{p.variants.length - 6} more</span>}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">No variants available</p>
                  )}
                </div>
              ))}
              {storeProducts.length === 0 && <p style={{color:'#6b7280'}}>No products in this store</p>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
