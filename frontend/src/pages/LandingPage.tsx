import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'

const B = '#1e40af'
const R = '#dc2626'

const CAT_ICONS: Record<string,string> = {
  broken_road:'🛣️', garbage:'🗑️', water_outage:'💧', streetlight:'💡',
  illegal_dumping:'⚠️', flooding:'🌊', other:'📌'
}
const CAT_LABELS: Record<string,string> = {
  broken_road:'Broken Road', garbage:'Garbage Buildup', water_outage:'Water Outage',
  streetlight:'Streetlight Issue', illegal_dumping:'Illegal Dumping', flooding:'Flooding', other:'Other'
}
const STATUS_COLOR: Record<string,string> = {
  submitted:'#6b7280', acknowledged:'#d97706', in_progress:'#2563eb', resolved:'#059669', closed:'#9ca3af'
}
const PRIORITY_COLOR: Record<string,string> = { low:'#6b7280', medium:'#d97706', high:'#dc2626', critical:'#7c3aed' }

export default function LandingPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => { apiFetch('/issues/stats').then(setStats).catch(() => {}) }, [])

  return (
    <div>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, #0f172a 0%, ${B} 100%)`, padding:'72px 32px 56px', textAlign:'center', color:'#fff' }}>
        <div style={{ fontSize:56, marginBottom:12 }}>🏛️</div>
        <h1 style={{ fontSize:42, fontWeight:900, margin:'0 0 12px', lineHeight:1.1 }}>CivicJM</h1>
        <p style={{ fontSize:20, color:'#bfdbfe', margin:'0 0 8px' }}>Jamaica Community Reporting Platform</p>
        <p style={{ fontSize:15, color:'#93c5fd', margin:'0 0 36px', maxWidth:560, marginLeft:'auto', marginRight:'auto' }}>
          Report broken roads, garbage buildup, water outages, streetlight failures, and more — directly to the agencies that fix them.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/report')} style={{ padding:'14px 32px', background:R, color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:16, cursor:'pointer' }}>
            📍 Report an Issue
          </button>
          <button onClick={() => navigate('/map')} style={{ padding:'14px 32px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'2px solid rgba(255,255,255,0.3)', borderRadius:10, fontWeight:700, fontSize:16, cursor:'pointer' }}>
            🗺️ View Map
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'20px 32px', display:'flex', justifyContent:'center', gap:40, flexWrap:'wrap' }}>
          {[
            { label:'Total Issues', val: stats.total, color:B },
            { label:'In Progress', val: stats.inProgress, color:'#2563eb' },
            { label:'Resolved', val: stats.resolved, color:'#059669' },
            { label:'Critical Open', val: stats.critical, color:R },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:12, color:'#6b7280' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px' }}>
        {/* Categories */}
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20, color:'#1f2937' }}>What Can You Report?</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:48 }}>
          {Object.entries(CAT_ICONS).map(([cat, icon]) => (
            <button key={cat} onClick={() => navigate(`/report?category=${cat}`)}
              style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:12, padding:'20px 12px', cursor:'pointer', textAlign:'center', transition:'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor=B)}
              onMouseLeave={e => (e.currentTarget.style.borderColor='#e5e7eb')}>
              <div style={{ fontSize:32, marginBottom:8 }}>{icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{CAT_LABELS[cat]}</div>
            </button>
          ))}
        </div>

        {/* Recent issues */}
        {stats?.recent?.length > 0 && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:'#1f2937', margin:0 }}>Recent Reports</h2>
              <button onClick={() => navigate('/map')} style={{ background:'none', border:'none', color:B, fontWeight:600, cursor:'pointer', fontSize:13 }}>View all on map →</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14, marginBottom:48 }}>
              {stats.recent.map((i: any) => (
                <div key={i.id} onClick={() => navigate(`/issues/${i.id}`)}
                  style={{ background:'#fff', borderRadius:12, padding:18, border:'1px solid #e5e7eb', cursor:'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor=B)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor='#e5e7eb')}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:20 }}>{CAT_ICONS[i.category]}</span>
                    <div style={{ display:'flex', gap:6 }}>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:`${PRIORITY_COLOR[i.priority]}20`, color:PRIORITY_COLOR[i.priority], fontWeight:600 }}>{i.priority}</span>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'#f3f4f6', color:STATUS_COLOR[i.status], fontWeight:600 }}>{i.status.replace('_',' ')}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4, color:'#1f2937' }}>{i.title}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>📍 {i.parish} · {new Date(i.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* How it works */}
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20, color:'#1f2937' }}>How It Works</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:48 }}>
          {[
            { step:'1', icon:'📍', title:'Report', desc:'Submit your issue with GPS location and a photo' },
            { step:'2', icon:'🏛️', title:'Assigned', desc:'Issue goes to the responsible agency (NWA, KSAC, Parish Council)' },
            { step:'3', icon:'🔧', title:'Action', desc:'Agency acknowledges and schedules a fix' },
            { step:'4', icon:'✅', title:'Resolved', desc:'You get notified when the issue is resolved' },
          ].map(s => (
            <div key={s.step} style={{ background:'#fff', borderRadius:12, padding:24, border:'1px solid #e5e7eb', textAlign:'center' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:B, color:'#fff', fontWeight:800, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>{s.step}</div>
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{s.title}</div>
              <div style={{ fontSize:13, color:'#6b7280' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Government partners */}
        <div style={{ background:`${B}08`, borderRadius:16, padding:28, border:`1px solid ${B}20`, textAlign:'center' }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:B, marginBottom:16 }}>Government Partners</h3>
          <div style={{ display:'flex', justifyContent:'center', gap:32, flexWrap:'wrap' }}>
            {['🏗️ National Works Agency','🏙️ Kingston & St. Andrew Municipal Corporation','⛪ Parish Councils (All 14 Parishes)'].map(p => (
              <div key={p} style={{ fontSize:14, color:'#374151', fontWeight:600 }}>{p}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
