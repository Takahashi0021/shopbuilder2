import { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = { PENDING:'#f90', CONFIRMED:'blue', SHIPPED:'purple', DELIVERED:'green', CANCELLED:'red' };

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    orderAPI.list().then(res => setOrders(res.data.data || [])).catch(() => {});
  }, []);

  const updateStatus = async (orderId, status) => {
    setMsg('');
    try {
      await orderAPI.updateStatus(orderId, status);
      setMsg(`Order status updated to ${status}. Email sent to customer.`);
      orderAPI.list().then(res => setOrders(res.data.data || []));
      setSelected(null);
    } catch (err) {
      setMsg(err.response?.data?.error?.message || 'Error');
    }
  };

  return (
    <div>
      <h1>📋 Orders</h1>
      {msg && <div style={msg.includes('Error')?styles.error:styles.success}>{msg}</div>}
      {orders.length === 0 && <p>No orders found.</p>}
      <div style={styles.list}>
        {orders.map(o => (
          <div key={o.id} style={styles.card} onClick={() => setSelected(o)}>
            <div style={styles.row}>
              <span><strong>#{o.id.slice(0,8).toUpperCase()}</strong></span>
              <span style={{color: STATUS_COLORS[o.status], fontWeight:'bold'}}>{o.status}</span>
              <span>${parseFloat(o.totalAmount).toFixed(2)}</span>
              <span style={styles.date}>{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
            {o.customer && <div style={styles.small}>Customer: {o.customer.email}</div>}
          </div>
        ))}
      </div>

      {selected && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button style={styles.close} onClick={() => setSelected(null)}>✕</button>
            <h2>Order #{selected.id.slice(0,8).toUpperCase()}</h2>
            <p>Status: <strong style={{color: STATUS_COLORS[selected.status]}}>{selected.status}</strong></p>
            <p>Total: <strong>${parseFloat(selected.totalAmount).toFixed(2)}</strong></p>
            {selected.notes && <p>Notes: {selected.notes}</p>}
            <h3>Items</h3>
            {selected.items?.map(item => (
              <div key={item.id} style={styles.item}>
                <span><code>{item.variant?.sku}</code></span>
                <span>Qty: {item.quantity}</span>
                <span>${parseFloat(item.unitPrice).toFixed(2)} each</span>
              </div>
            ))}
            {(user?.role === 'MERCHANT' || user?.role === 'ADMIN') && (
              <div style={styles.actions}>
                <h3>Update Status</h3>
                <div style={styles.statusBtns}>
                  {['CONFIRMED','SHIPPED','DELIVERED','CANCELLED'].map(s => (
                    <button key={s} style={{...styles.statusBtn, background: STATUS_COLORS[s]}}
                      onClick={() => updateStatus(selected.id, s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  list: { display:'flex', flexDirection:'column', gap:12 },
  card: { background:'white', padding:20, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', cursor:'pointer' },
  row: { display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 },
  small: { color:'#888', fontSize:13, marginTop:6 },
  date: { color:'#888', fontSize:13 },
  modal: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:100 },
  modalContent: { background:'white', padding:30, borderRadius:12, maxWidth:600, width:'90%', position:'relative', maxHeight:'80vh', overflowY:'auto' },
  close: { position:'absolute', top:10, right:10, background:'none', border:'none', fontSize:20, cursor:'pointer' },
  item: { display:'flex', justifyContent:'space-between', padding:'8px', background:'#f9f9f9', borderRadius:8, marginBottom:8 },
  actions: { marginTop:20 },
  statusBtns: { display:'flex', gap:8, flexWrap:'wrap' },
  statusBtn: { padding:'8px 16px', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:'bold' },
  error: { background:'#ffe0e0', color:'#c00', padding:10, borderRadius:8, marginBottom:12 },
  success: { background:'#e0ffe0', color:'#080', padding:10, borderRadius:8, marginBottom:12 },
};
