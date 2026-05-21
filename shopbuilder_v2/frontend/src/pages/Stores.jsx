import { useState } from 'react';
import { orderAPI, productAPI } from '../services/api';

export default function Stores() {
  const [slug, setSlug] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [msg, setMsg] = useState('');
  const [notes, setNotes] = useState('');
  const [searched, setSearched] = useState(false);

  const browseStore = async () => {
    setMsg('');
    if (!slug || !tenantId) { setMsg('Please enter both store slug and tenant ID'); return; }
    try {
      const res = await productAPI.list(tenantId);
      setProducts(res.data.data || []);
      setSearched(true);
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Store not found');
    }
  };

  const addToCart = (variant, product) => {
    const existing = cart.find(c => c.variantId === variant.id);
    if (existing) {
      setCart(cart.map(c => c.variantId === variant.id ? {...c, quantity: c.quantity+1} : c));
    } else {
      setCart([...cart, { variantId: variant.id, quantity: 1, sku: variant.sku, price: variant.price, productName: product.name }]);
    }
    setMsg(`Added ${variant.sku} to cart`);
  };

  const placeOrder = async () => {
    setMsg('');
    if (cart.length === 0) { setMsg('Cart is empty'); return; }
    try {
      await orderAPI.create(slug, { items: cart.map(c => ({variantId: c.variantId, quantity: c.quantity})), notes });
      setMsg('Order placed! Confirmation email sent to your inbox.');
      setCart([]);
      setNotes('');
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Error placing order');
    }
  };

  const total = cart.reduce((sum, c) => sum + parseFloat(c.price) * c.quantity, 0);

  return (
    <div>
      <h1>🏪 Browse Stores</h1>
      <div style={styles.searchBox}>
        <input style={styles.input} placeholder="Store slug (e.g. fashion-store)" value={slug}
          onChange={e => setSlug(e.target.value)} />
        <input style={styles.input} placeholder="Tenant ID (from merchant)" value={tenantId}
          onChange={e => setTenantId(e.target.value)} />
        <button style={styles.btn} onClick={browseStore}>Browse Store</button>
      </div>

      {msg && <div style={msg.includes('Error')||msg.includes('not found')||msg.includes('empty')?styles.error:styles.success}>{msg}</div>}

      {cart.length > 0 && (
        <div style={styles.cart}>
          <h3>🛒 Cart ({cart.length} items)</h3>
          {cart.map(c => (
            <div key={c.variantId} style={styles.cartItem}>
              <span>{c.productName} - <code>{c.sku}</code></span>
              <span>x{c.quantity}</span>
              <span>${(parseFloat(c.price)*c.quantity).toFixed(2)}</span>
              <button style={styles.btnRed} onClick={() => setCart(cart.filter(i => i.variantId !== c.variantId))}>Remove</button>
            </div>
          ))}
          <div style={styles.cartTotal}>Total: <strong>${total.toFixed(2)}</strong></div>
          <input style={styles.input} placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
          <button style={styles.btnPlace} onClick={placeOrder}>Place Order 🎉</button>
        </div>
      )}

      {searched && (
        <div style={styles.productsGrid}>
          {products.length === 0 && <p>No products in this store.</p>}
          {products.map(p => (
            <div key={p.id} style={styles.productCard}>
              <h3>{p.name}</h3>
              <p style={styles.price}>${parseFloat(p.basePrice).toFixed(2)}</p>
              <p style={styles.small}>{p.description}</p>
              <button style={styles.btn} onClick={async () => {
                const res = await productAPI.getOne(p.id, tenantId);
                const variants = res.data.data.product.variants || [];
                if (variants.length > 0) addToCart(variants[0], p);
                else setMsg('No variants available');
              }}>Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  searchBox: { display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' },
  input: { padding:'10px', border:'1px solid #ddd', borderRadius:8, fontSize:15, flex:1, minWidth:200 },
  btn: { padding:'10px 20px', background:'#e94560', color:'white', border:'none', borderRadius:8, cursor:'pointer' },
  btnRed: { padding:'4px 8px', background:'red', color:'white', border:'none', borderRadius:4, cursor:'pointer' },
  btnPlace: { width:'100%', padding:14, background:'green', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontSize:16, fontWeight:'bold', marginTop:8 },
  cart: { background:'white', padding:20, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', marginBottom:20 },
  cartItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px', background:'#f9f9f9', borderRadius:8, marginBottom:8 },
  cartTotal: { fontSize:18, fontWeight:'bold', margin:'12px 0' },
  productsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 },
  productCard: { background:'white', padding:20, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  price: { color:'#e94560', fontWeight:'bold', fontSize:20 },
  small: { color:'#888', fontSize:13 },
  error: { background:'#ffe0e0', color:'#c00', padding:10, borderRadius:8, marginBottom:12 },
  success: { background:'#e0ffe0', color:'#080', padding:10, borderRadius:8, marginBottom:12 },
};
