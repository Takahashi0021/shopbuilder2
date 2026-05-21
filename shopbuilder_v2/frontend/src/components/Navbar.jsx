import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link'

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">🛍️ ShopBuilder</Link>
      <div className="nav-links">
        {!user ? (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        ) : (
          <>
            {user.role === 'ADMIN' && (
              <>
                <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>Dashboard</Link>
                <Link to="/admin/tenants" className={isActive('/admin/tenants')}>Stores</Link>
                <Link to="/admin/users" className={isActive('/admin/users')}>Users</Link>
              </>
            )}
            {user.role === 'MERCHANT' && (
              <>
                <Link to="/merchant/stores" className={isActive('/merchant/stores')}>My Stores</Link>
                <Link to="/merchant/products" className={isActive('/merchant/products')}>Products</Link>
                <Link to="/merchant/orders" className={isActive('/merchant/orders')}>Orders</Link>
              </>
            )}
            {user.role === 'CUSTOMER' && (
              <>
                <Link to="/shop" className={isActive('/shop')}>Shop</Link>
                <Link to="/customer/orders" className={isActive('/customer/orders')}>My Orders</Link>
              </>
            )}
            <span style={{color:'rgba(255,255,255,0.7)',fontSize:13}}>
              👤 {user.username} ({user.role})
            </span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}
