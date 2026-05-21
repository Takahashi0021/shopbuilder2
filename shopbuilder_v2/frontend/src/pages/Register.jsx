import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '', role: 'CUSTOMER' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await auth.register(form)
      setSuccess('Registration successful! Please check your email to verify your account.')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 60px)'}}>
      <div className="card" style={{width:400}}>
        <h2 style={{marginBottom:24,fontSize:24,fontWeight:700}}>Create account 🚀</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
          <label>Username</label>
          <input type="text" placeholder="john_doe" value={form.username}
            onChange={e => setForm({...form, username: e.target.value})} required />
          <label>Password</label>
          <input type="password" placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
          <label>Role</label>
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="MERCHANT">MERCHANT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button className="btn btn-primary" style={{width:'100%',marginTop:8}} disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={{marginTop:16,textAlign:'center',fontSize:14,color:'#6b7280'}}>
          Already have an account? <Link to="/login" style={{color:'#4f46e5'}}>Login</Link>
        </p>
      </div>
    </div>
  )
}
