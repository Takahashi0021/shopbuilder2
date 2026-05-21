import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tenantAPI, adminAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState(null);
  const [newTenant, setNewTenant] = useState({ name: '', slug: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user?.role === 'MERCHANT') {
      tenantAPI.getMyTenants().then(res => setTenants(res.data.data.tenants || [])).catch(() => {});
    }
    if (user?.role === 'ADMIN') {
      adminAPI.dashboard().then(res => setStats(res.data.data)).catch(() => {});
    }
  }, [user]);

  const createTenant = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await tenantAPI.onboard(newTenant);
      setMsg('Store created! Please login again to update your token.');
      setNewTenant({ name: '', slug: '' });
      tenantAPI.getMyTenants().then(res => setTenants(res.data.data.tenants || []));
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Error creating store');
    }
  };

  return (
    <div>
      <h1>Welcome, {user?.email} 👋</h1>
      <div style={styles.roleTag}>Role: {user?.role}</div>

      {user?.role === 'CUSTOMER' && (
        <div style={styles.section}>
          <h2>🛒 Customer Dashboard</h2>
          <p>Browse stores and place orders.</p>
          <Link to="/stores" style={styles.link}>Browse Stores →</Link>
          <br/><br/>
          <Link to="/orders" style={styles.link}>My Orders →</Link>
        </div>
      )}

      {user?.role === 'MERCHANT' && (
        <div style={styles.section}>
          <h2>🏪 My Stores</h2>
          {msg && <div style={msg.includes('created') ? styles.success : styles.error}>{msg}</div>}
          <form onSubmit={createTenant} style={styles.form}>
            <input style={styles.input} placeholder="Store Name" value={newTenant.name}
              onChange={e => setNewTenant({...newTenant, name: e.target.value})} required />
            <input style={styles.input} placeholder="Slug (e.g. my-shop)" value={newTenant.slug}
              onChange={e => setNewTenant({...newTenant, slug: e.target.value.toLowerCase().replace(/\s+/g,'-')})} required />
            <button style={styles.btn}>+ Create Store</button>
          </form>
          <div style={styles.grid}>
            {tenants.map(t => (
              <div key={t.id} style={styles.card}>
                <h3>{t.name}</h3>
                <p>Slug: <code>{t.slug}</code></p>
                <p>Status: <span style={{color: t.status==='ACTIVE'?'green':'red'}}>{t.status}</span></p>
                <p style={{fontSize:12, color:'#888'}}>ID: {t.id}</p>
              </div>
            ))}
          </div>
          <br/>
          <Link to="/products" style={styles.link}>Manage Products →</Link>
          <br/><br/>
          <Link to="/orders" style={styles.link}>View Orders →</Link>
        </div>
      )}

      {user?.role === 'ADMIN' && stats && (
        <div style={styles.section}>
          <h2>📊 Platform Statistics</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}><div style={styles.statNum}>{stats.totalUsers}</div><div>Users</div></div>
            <div style={styles.statCard}><div style={styles.statNum}>{stats.totalTenants}</div><div>Stores</div></div>
            <div style={styles.statCard}><div style={styles.statNum}>{stats.totalOrders}</div><div>Orders</div></div>
            <div style={styles.statCard}><div style={styles.statNum}>{stats.totalProducts}</div><div>Products</div></div>
          </div>
          <br/>
          <Link to="/admin" style={styles.link}>Admin Panel →</Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  section: { marginTop: 24 },
  roleTag: { display:'inline-block', background:'#1a1a2e', color:'white', padding:'4px 12px', borderRadius:20, marginBottom:16 },
  form: { display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' },
  input: { padding:'10px', border:'1px solid #ddd', borderRadius:8, fontSize:15, flex:1, minWidth:150 },
  btn: { padding:'10px 20px', background:'#e94560', color:'white', border:'none', borderRadius:8, cursor:'pointer' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:16 },
  card: { background:'white', padding:20, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 },
  statCard: { background:'#1a1a2e', color:'white', padding:20, borderRadius:12, textAlign:'center' },
  statNum: { fontSize:36, fontWeight:'bold', color:'#e94560' },
  link: { color:'#e94560', fontWeight:'bold', textDecoration:'none', fontSize:16 },
  error: { background:'#ffe0e0', color:'#c00', padding:10, borderRadius:8, marginBottom:12 },
  success: { background:'#e0ffe0', color:'#080', padding:10, borderRadius:8, marginBottom:12 },
};
