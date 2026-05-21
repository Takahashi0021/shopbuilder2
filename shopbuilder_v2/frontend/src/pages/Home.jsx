import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div style={{textAlign:'center',padding:'80px 20px'}}>
      <h1 style={{fontSize:48,fontWeight:800,color:'#4f46e5',marginBottom:16}}>🛍️ ShopBuilder</h1>
      <p style={{fontSize:20,color:'#6b7280',marginBottom:40,maxWidth:600,margin:'0 auto 40px'}}>
        Multi-tenant e-commerce platform. Create your store, list products, and start selling.
      </p>
      {!user ? (
        <div className="flex gap-8" style={{justifyContent:'center'}}>
          <Link to="/register" className="btn btn-primary" style={{fontSize:16,padding:'14px 32px'}}>Get Started</Link>
          <Link to="/login" className="btn btn-secondary" style={{fontSize:16,padding:'14px 32px'}}>Login</Link>
        </div>
      ) : (
        <div>
          <p style={{fontSize:18,marginBottom:24}}>Welcome back, <strong>{user.username}</strong>! 👋</p>
          {user.role === 'ADMIN' && <Link to="/admin/dashboard" className="btn btn-primary">Go to Dashboard</Link>}
          {user.role === 'MERCHANT' && <Link to="/merchant/stores" className="btn btn-primary">My Stores</Link>}
          {user.role === 'CUSTOMER' && <Link to="/shop" className="btn btn-primary">Browse Shops</Link>}
        </div>
      )}
      <div className="grid-3" style={{maxWidth:900,margin:'60px auto 0',textAlign:'left'}}>
        <div className="card">
          <h3 style={{fontWeight:700,marginBottom:8}}>🏪 For Merchants</h3>
          <p className="text-sm">Create multiple stores, manage products with SKU variants, track orders and revenue.</p>
        </div>
        <div className="card">
          <h3 style={{fontWeight:700,marginBottom:8}}>🛒 For Customers</h3>
          <p className="text-sm">Browse stores, add to cart, and checkout. Get email confirmations for every order.</p>
        </div>
        <div className="card">
          <h3 style={{fontWeight:700,marginBottom:8}}>👑 For Admins</h3>
          <p className="text-sm">Monitor platform health, manage stores and users, view analytics dashboard.</p>
        </div>
      </div>
    </div>
  )
}
