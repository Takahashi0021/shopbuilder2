import { useEffect, useState } from 'react';
import { productAPI, tenantAPI } from '../services/api';

export default function Products() {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', basePrice: '' });
  const [variantForm, setVariantForm] = useState({ sizes: 'S,M,L,XL', colors: 'Red,Blue,Black', materials: 'Cotton,Polyester', basePrice: '', initialStock: 100 });
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('list');

  useEffect(() => {
    tenantAPI.getMyTenants().then(res => {
      const t = res.data.data.tenants || [];
      setTenants(t);
      if (t.length > 0) setSelectedTenant(t[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedTenant) loadProducts();
  }, [selectedTenant]);

  const loadProducts = () => {
    productAPI.list(selectedTenant).then(res => setProducts(res.data.data || [])).catch(() => {});
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await productAPI.create({ ...form, basePrice: parseFloat(form.basePrice) }, selectedTenant);
      setMsg('Product created!');
      setForm({ name: '', description: '', basePrice: '' });
      loadProducts();
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Error');
    }
  };

  const generateVariants = async (productId) => {
    setMsg('');
    try {
      const data = {
        sizes: variantForm.sizes.split(',').map(s => s.trim()),
        colors: variantForm.colors.split(',').map(s => s.trim()),
        materials: variantForm.materials.split(',').map(s => s.trim()),
        basePrice: parseFloat(variantForm.basePrice),
        initialStock: parseInt(variantForm.initialStock),
      };
      const res = await productAPI.generateVariants(productId, data, selectedTenant);
      setMsg(`Generated ${res.data.data.count} SKU variants!`);
      loadProducts();
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Error generating variants');
    }
  };

  const updateStock = async (variantId, delta) => {
    try {
      await productAPI.updateStock(variantId, delta, selectedTenant);
      setMsg('Stock updated!');
      if (selectedProduct) {
        const res = await productAPI.getOne(selectedProduct.id, selectedTenant);
        setSelectedProduct(res.data.data.product);
      }
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Error');
    }
  };

  return (
    <div>
      <h1>📦 Products</h1>
      <div style={styles.tenantSelect}>
        <label>Select Store: </label>
        <select style={styles.select} value={selectedTenant} onChange={e => setSelectedTenant(e.target.value)}>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div style={styles.tabs}>
        {['list', 'create', 'variants'].map(t => (
          <button key={t} style={{...styles.tab, ...(tab===t?styles.activeTab:{})}} onClick={() => setTab(t)}>
            {t === 'list' ? '📋 Products' : t === 'create' ? '➕ Create' : '🎨 Variants'}
          </button>
        ))}
      </div>

      {msg && <div style={msg.includes('Error')||msg.includes('error') ? styles.error : styles.success}>{msg}</div>}

      {tab === 'create' && (
        <div style={styles.card}>
          <h2>Create Product</h2>
          <form onSubmit={createProduct}>
            <input style={styles.input} placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input style={styles.input} placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <input style={styles.input} type="number" step="0.01" placeholder="Base Price" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} required />
            <button style={styles.btn}>Create Product</button>
          </form>
        </div>
      )}

      {tab === 'variants' && (
        <div style={styles.card}>
          <h2>Generate SKU Matrix</h2>
          <p style={styles.hint}>Format: comma-separated values. 4×3×2 = 24 SKUs automatically</p>
          <input style={styles.input} placeholder="Sizes (e.g. S,M,L,XL)" value={variantForm.sizes} onChange={e => setVariantForm({...variantForm, sizes: e.target.value})} />
          <input style={styles.input} placeholder="Colors (e.g. Red,Blue,Black)" value={variantForm.colors} onChange={e => setVariantForm({...variantForm, colors: e.target.value})} />
          <input style={styles.input} placeholder="Materials (e.g. Cotton,Polyester)" value={variantForm.materials} onChange={e => setVariantForm({...variantForm, materials: e.target.value})} />
          <input style={styles.input} type="number" step="0.01" placeholder="Price" value={variantForm.basePrice} onChange={e => setVariantForm({...variantForm, basePrice: e.target.value})} />
          <input style={styles.input} type="number" placeholder="Initial Stock" value={variantForm.initialStock} onChange={e => setVariantForm({...variantForm, initialStock: e.target.value})} />
          <p>Select product to generate variants:</p>
          {products.map(p => (
            <button key={p.id} style={styles.btnSecondary} onClick={() => generateVariants(p.id)}>
              Generate for: {p.name}
            </button>
          ))}
        </div>
      )}

      {tab === 'list' && (
        <div>
          {products.length === 0 ? <p>No products yet. Create one first.</p> : null}
          <div style={styles.grid}>
            {products.map(p => (
              <div key={p.id} style={styles.productCard} onClick={() => {
                productAPI.getOne(p.id, selectedTenant).then(res => setSelectedProduct(res.data.data.product));
              }}>
                <h3>{p.name}</h3>
                <p style={styles.price}>${parseFloat(p.basePrice).toFixed(2)}</p>
                <p style={styles.small}>{p.description}</p>
                <p style={styles.small}>Variants: {p._count?.variants || 0}</p>
              </div>
            ))}
          </div>
          {selectedProduct && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <button style={styles.close} onClick={() => setSelectedProduct(null)}>✕</button>
                <h2>{selectedProduct.name}</h2>
                <p>Price: ${parseFloat(selectedProduct.basePrice).toFixed(2)}</p>
                <h3>Variants ({selectedProduct.variants?.length || 0})</h3>
                <div style={styles.variantList}>
                  {selectedProduct.variants?.map(v => (
                    <div key={v.id} style={styles.variantItem}>
                      <span><code>{v.sku}</code></span>
                      <span>Stock: {v.stock}</span>
                      <span>${parseFloat(v.price).toFixed(2)}</span>
                      <div style={styles.stockBtns}>
                        <button onClick={() => updateStock(v.id, 10)} style={styles.btnGreen}>+10</button>
                        <button onClick={() => updateStock(v.id, -5)} style={styles.btnRed}>-5</button>
                        <button onClick={() => updateStock(v.id, -99999)} style={styles.btnRed}>Test Oversell</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  tenantSelect: { marginBottom: 20, fontSize: 16 },
  select: { padding: '8px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, marginLeft: 8 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: { padding: '8px 20px', background: '#eee', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 },
  activeTab: { background: '#e94560', color: 'white' },
  card: { background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 },
  input: { display: 'block', width: '100%', padding: '10px', marginBottom: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' },
  btn: { padding: '10px 24px', background: '#e94560', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 },
  btnSecondary: { padding: '8px 16px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', marginRight: 8, marginBottom: 8 },
  btnGreen: { padding: '4px 8px', background: 'green', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 4 },
  btnRed: { padding: '4px 8px', background: 'red', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 },
  productCard: { background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' },
  price: { color: '#e94560', fontWeight: 'bold', fontSize: 20 },
  small: { color: '#888', fontSize: 13 },
  hint: { color: '#888', fontSize: 13, marginBottom: 12 },
  error: { background: '#ffe0e0', color: '#c00', padding: 10, borderRadius: 8, marginBottom: 12 },
  success: { background: '#e0ffe0', color: '#080', padding: 10, borderRadius: 8, marginBottom: 12 },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalContent: { background: 'white', padding: 30, borderRadius: 12, maxWidth: 700, width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative' },
  close: { position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' },
  variantList: { display: 'flex', flexDirection: 'column', gap: 8 },
  variantItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#f9f9f9', borderRadius: 8, flexWrap: 'wrap', gap: 8 },
  stockBtns: { display: 'flex', gap: 4 },
};
