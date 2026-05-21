import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'ADMIN') navigate('/admin/dashboard')
      else if (user.role === 'MERCHANT') navigate('/merchant/stores')
      else navigate('/shop')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 60px)'}}>
      <div className="card" style={{width:400}}>
        <h2 style={{marginBottom:24,fontSize:24,fontWeight:700}}>Welcome back 👋</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
          <button className="btn btn-primary" style={{width:'100%',marginTop:8}} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{marginTop:16,textAlign:'center',fontSize:14,color:'#6b7280'}}>
          No account? <Link to="/register" style={{color:'#4f46e5'}}>Register</Link>
        </p>
        <p style={{marginTop:8,textAlign:'center',fontSize:14}}>
          <Link to="/forgot-password" style={{color:'#4f46e5'}}>Forgot password?</Link>
        </p>
      </div>
    </div>
  )
}
