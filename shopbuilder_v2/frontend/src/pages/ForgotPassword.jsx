import { useState } from 'react'
import { auth } from '../services/api'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await auth.forgotPassword(email)
      setMsg('If that email exists, a reset link has been sent to your inbox.')
    } catch {
      setMsg('If that email exists, a reset link has been sent to your inbox.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 60px)'}}>
      <div className="card" style={{width:400}}>
        <h2 style={{marginBottom:24,fontSize:24,fontWeight:700}}>Reset Password 🔐</h2>
        {msg && <div className="success">{msg}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email address</label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <button className="btn btn-primary" style={{width:'100%'}} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p style={{marginTop:16,textAlign:'center',fontSize:14}}>
          <Link to="/login" style={{color:'#4f46e5'}}>Back to login</Link>
        </p>
      </div>
    </div>
  )
}
