import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const B = '#1e40af'
const PARISHES = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine']

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', parish:'', phone:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, role:'citizen' }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('civicjm_token', data.token)
      await login(form.email, form.password)
      navigate('/')
    } catch(err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const inp = { padding:'10px 14px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14, width:'100%', boxSizing:'border-box' as const }

  return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:40, width:440, boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🏛️</div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:'0 0 4px' }}>Join CivicJM</h1>
          <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>Create an account to report issues and track updates</p>
        </div>
        <form onSubmit={handleSubmit}>
          {[['Full Name','text','name',true],['Email','email','email',true],['Password','password','password',true],['Phone (optional)','tel','phone',false]].map(([label,type,key,req]) => (
            <div key={key as string} style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:5 }}>{label as string}</label>
              <input type={type as string} value={(form as any)[key as string]} onChange={e => setForm(f => ({...f, [key as string]:e.target.value}))} required={req as boolean} style={inp} />
            </div>
          ))}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:5 }}>Parish</label>
            <select value={form.parish} onChange={e => setForm(f => ({...f, parish:e.target.value}))} style={inp}>
              <option value=''>Select your parish...</option>
              {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {error && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', color:'#dc2626', fontSize:13, marginBottom:14 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width:'100%', padding:12, background:B, color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:14, fontSize:14, color:'#6b7280' }}>
          Already registered?{' '}
          <button onClick={() => navigate('/login')} style={{ background:'none', border:'none', color:B, fontWeight:600, cursor:'pointer', fontSize:14 }}>Sign in</button>
        </p>
      </div>
    </div>
  )
}
