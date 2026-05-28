import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const B = '#1e40af'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    try { await login(email, password); navigate('/') }
    catch(err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const inp = { padding:'10px 14px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14, width:'100%', boxSizing:'border-box' as const }

  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:40, width:420, boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🏛️</div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:'0 0 4px' }}>Sign in to CivicJM</h1>
          <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>Report issues and track your submissions</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:5 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inp} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:5 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inp} />
          </div>
          {error && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', color:'#dc2626', fontSize:13, marginBottom:14 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width:'100%', padding:12, background:B, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:16, fontSize:14, color:'#6b7280' }}>
          No account?{' '}
          <button onClick={() => navigate('/register')} style={{ background:'none', border:'none', color:B, fontWeight:600, cursor:'pointer', fontSize:14 }}>Register</button>
        </p>
      </div>
    </div>
  )
}
