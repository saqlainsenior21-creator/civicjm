import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'

const B = '#1e40af'
const STATUS_COLOR: Record<string,string> = { submitted:'#6b7280', acknowledged:'#d97706', in_progress:'#2563eb', resolved:'#059669', closed:'#9ca3af' }
const PRIORITY_COLOR: Record<string,string> = { low:'#6b7280', medium:'#d97706', high:'#dc2626', critical:'#7c3aed' }
const CAT_ICONS: Record<string,string> = { broken_road:'🛣️', garbage:'🗑️', water_outage:'💧', streetlight:'💡', illegal_dumping:'⚠️', flooding:'🌊', other:'📌' }

export default function MyReports() {
  const navigate = useNavigate()
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { apiFetch('/issues/my').then(setIssues).finally(() => setLoading(false)) }, [])

  if (loading) return <div style={{ padding:48, textAlign:'center', color:'#6b7280' }}>Loading...</div>

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, margin:'0 0 4px' }}>📋 My Reports</h1>
          <p style={{ color:'#6b7280', margin:0 }}>{issues.length} issue{issues.length!==1?'s':''} submitted</p>
        </div>
        <button onClick={() => navigate('/report')} style={{ padding:'10px 20px', background:'#dc2626', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:13 }}>
          + New Report
        </button>
      </div>

      {issues.length === 0 ? (
        <div style={{ textAlign:'center', padding:64, color:'#9ca3af' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>No reports yet</div>
          <div style={{ fontSize:13, marginBottom:24 }}>Spot a problem in your community? Report it!</div>
          <button onClick={() => navigate('/report')} style={{ padding:'10px 24px', background:B, color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer' }}>Report an Issue</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {issues.map(i => (
            <div key={i.id} onClick={() => navigate(`/issues/${i.id}`)}
              style={{ background:'#fff', borderRadius:12, padding:'18px 20px', border:'1px solid #e5e7eb', cursor:'pointer', display:'flex', gap:16, alignItems:'flex-start' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor=B)}
              onMouseLeave={e => (e.currentTarget.style.borderColor='#e5e7eb')}>
              <span style={{ fontSize:28, flexShrink:0 }}>{CAT_ICONS[i.category]}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:4, color:'#1f2937' }}>{i.title}</div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>📍 {i.parish}{i.address ? ` — ${i.address}` : ''} · {new Date(i.created_at).toLocaleDateString()}</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:`${STATUS_COLOR[i.status]}15`, color:STATUS_COLOR[i.status], fontWeight:700 }}>{i.status.replace('_',' ')}</span>
                  <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:`${PRIORITY_COLOR[i.priority]}15`, color:PRIORITY_COLOR[i.priority], fontWeight:600 }}>{i.priority}</span>
                  {i.update_count > 0 && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'#eff6ff', color:B, fontWeight:600 }}>📝 {i.update_count} update{i.update_count!==1?'s':''}</span>}
                  {i.upvotes > 0 && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'#f0fdf4', color:'#059669', fontWeight:600 }}>👍 {i.upvotes}</span>}
                </div>
              </div>
              <span style={{ fontSize:18, color:'#d1d5db', flexShrink:0 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
