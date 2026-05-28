import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

const B = '#1e40af'
const CAT_ICONS: Record<string,string> = { broken_road:'🛣️', garbage:'🗑️', water_outage:'💧', streetlight:'💡', illegal_dumping:'⚠️', flooding:'🌊', other:'📌' }
const STATUS_COLOR: Record<string,string> = { submitted:'#6b7280', acknowledged:'#d97706', in_progress:'#2563eb', resolved:'#059669', closed:'#9ca3af' }

export default function AdminDashboard() {
  const [tab, setTab] = useState<'analytics'|'issues'|'users'|'create_user'>('analytics')
  const [stats, setStats] = useState<any>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userForm, setUserForm] = useState({ name:'', email:'', password:'GovUser2026!', role:'gov_user', parish:'', agency:'', phone:'' })

  const PARISHES = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine']

  useEffect(() => {
    Promise.all([apiFetch('/admin/stats'), apiFetch('/admin/issues'), apiFetch('/admin/users')])
      .then(([s, i, u]) => { setStats(s); setIssues(i); setUsers(u) })
      .finally(() => setLoading(false))
  }, [])

  async function createUser() {
    try {
      await apiFetch('/admin/users', { method:'POST', body: JSON.stringify(userForm) })
      alert('✅ User created!'); apiFetch('/admin/users').then(setUsers); setTab('users')
    } catch(e: any) { alert(e.message) }
  }

  async function toggleUser(id: string) {
    await apiFetch(`/admin/users/${id}/toggle`, { method:'PATCH' })
    apiFetch('/admin/users').then(setUsers)
  }

  if (loading) return <div style={{ padding:48, textAlign:'center', color:'#6b7280' }}>Loading...</div>

  const inp = { padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:13, width:'100%', boxSizing:'border-box' as const }
  const tabBtn = (t: string, label: string) => (
    <button onClick={() => setTab(t as any)} style={{ padding:'9px 18px', background:tab===t?B:'#fff', color:tab===t?'#fff':'#374151', border:`1.5px solid ${tab===t?B:'#d1d5db'}`, borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:13 }}>{label}</button>
  )

  return (
    <div style={{ padding:32 }}>
      <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>⚙️ Admin Dashboard</h1>
      <p style={{ color:'#6b7280', marginBottom:24 }}>CivicJM Platform Administration</p>

      <div style={{ display:'flex', gap:8, marginBottom:28, flexWrap:'wrap' }}>
        {tabBtn('analytics','📊 Analytics')}
        {tabBtn('issues','📋 All Issues')}
        {tabBtn('users','👥 Users')}
        {tabBtn('create_user','+ Add Gov User')}
      </div>

      {/* Analytics */}
      {tab === 'analytics' && stats && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:28 }}>
            {[
              { label:'Total Issues', val:stats.total, color:'#1f2937' },
              { label:'Resolved', val:stats.resolved, color:'#059669' },
              { label:'In Progress', val:stats.inProgress, color:'#2563eb' },
              { label:'Critical Open', val:stats.critical, color:'#dc2626' },
              { label:'Citizens', val:stats.citizens, color:B },
              { label:'Gov Users', val:stats.govUsers, color:'#7c3aed' },
            ].map(s => (
              <div key={s.label} style={{ background:'#fff', borderRadius:10, padding:18, border:'1px solid #e5e7eb', textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* By Category */}
            <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #e5e7eb' }}>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Issues by Category</h3>
              {stats.byCategory.map((c: any) => (
                <div key={c.category} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:18, width:24 }}>{CAT_ICONS[c.category]}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}>
                      <span style={{ color:'#374151', textTransform:'capitalize' }}>{c.category.replace('_',' ')}</span>
                      <span style={{ fontWeight:700 }}>{c.count}</span>
                    </div>
                    <div style={{ height:6, background:'#f3f4f6', borderRadius:3 }}>
                      <div style={{ height:6, background:B, borderRadius:3, width:`${Math.round(c.count/stats.total*100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* By Parish */}
            <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #e5e7eb' }}>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Issues by Parish</h3>
              {stats.byParish.map((p: any) => (
                <div key={p.parish} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}>
                      <span style={{ color:'#374151' }}>📍 {p.parish}</span>
                      <span style={{ fontWeight:700 }}>{p.count}</span>
                    </div>
                    <div style={{ height:6, background:'#f3f4f6', borderRadius:3 }}>
                      <div style={{ height:6, background:'#7c3aed', borderRadius:3, width:`${Math.round(p.count/stats.total*100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* By Status */}
            <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #e5e7eb' }}>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Issues by Status</h3>
              {stats.byStatus.map((s: any) => (
                <div key={s.status} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f3f4f6' }}>
                  <span style={{ fontSize:13, color:STATUS_COLOR[s.status], fontWeight:600 }}>{s.status.replace('_',' ')}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ height:8, background:`${STATUS_COLOR[s.status]}30`, borderRadius:4, width:80, overflow:'hidden' }}>
                      <div style={{ height:8, background:STATUS_COLOR[s.status], borderRadius:4, width:`${Math.round(s.count/stats.total*100)}%` }} />
                    </div>
                    <span style={{ fontWeight:700, fontSize:13, minWidth:24, textAlign:'right' }}>{s.count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent 7 days */}
            <div style={{ background:'#fff', borderRadius:12, padding:20, border:'1px solid #e5e7eb' }}>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Reports — Last 7 Days</h3>
              {stats.recent7.length === 0 ? <p style={{ color:'#9ca3af', fontSize:13 }}>No data yet</p>
              : stats.recent7.map((d: any) => (
                <div key={d.day} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #f3f4f6' }}>
                  <span style={{ fontSize:13, color:'#374151' }}>{d.day}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ height:8, background:'#dbeafe', borderRadius:4, width:80, overflow:'hidden' }}>
                      <div style={{ height:8, background:B, borderRadius:4, width:`${Math.min(d.count*20,100)}%` }} />
                    </div>
                    <span style={{ fontWeight:700, fontSize:13 }}>{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Issues */}
      {tab === 'issues' && (
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#f9fafb' }}>
              {['Cat','Title','Parish','Priority','Status','Reporter','Date'].map(h => (
                <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:12, fontWeight:700, borderBottom:'1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {issues.map(i => (
                <tr key={i.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ padding:'10px 14px', fontSize:18 }}>{CAT_ICONS[i.category]}</td>
                  <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:'#1f2937', maxWidth:240 }}>{i.title}</td>
                  <td style={{ padding:'10px 14px', fontSize:13 }}>{i.parish}</td>
                  <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:`${'#dc2626'}15`, color:'#dc2626', fontWeight:700 }}>{i.priority}</span></td>
                  <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:`${STATUS_COLOR[i.status]}15`, color:STATUS_COLOR[i.status], fontWeight:700 }}>{i.status.replace('_',' ')}</span></td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#6b7280' }}>{i.reporter_name}</td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#9ca3af' }}>{new Date(i.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#f9fafb' }}>
              {['Name','Email','Role','Parish','Agency','Joined','Status','Action'].map(h => (
                <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:12, fontWeight:700, borderBottom:'1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} style={{ borderBottom:'1px solid #f3f4f6', opacity:u.active?1:0.5 }}>
                  <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600 }}>{u.name}</td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#6b7280' }}>{u.email}</td>
                  <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background: u.role==='admin'?'#fef3c7':u.role==='gov_user'?'#dbeafe':'#f3f4f6', color: u.role==='admin'?'#92400e':u.role==='gov_user'?B:'#374151', fontWeight:600 }}>{u.role}</span></td>
                  <td style={{ padding:'10px 14px', fontSize:12 }}>{u.parish||'—'}</td>
                  <td style={{ padding:'10px 14px', fontSize:12, color:'#6b7280' }}>{u.agency||'—'}</td>
                  <td style={{ padding:'10px 14px', fontSize:11, color:'#9ca3af' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:u.active?'#dcfce7':'#fef2f2', color:u.active?'#059669':'#dc2626', fontWeight:600 }}>{u.active?'Active':'Inactive'}</span></td>
                  <td style={{ padding:'10px 14px' }}>
                    {u.role !== 'admin' && <button onClick={() => toggleUser(u.id)} style={{ padding:'4px 10px', background:'#f3f4f6', border:'none', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600 }}>{u.active?'Deactivate':'Activate'}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Gov User */}
      {tab === 'create_user' && (
        <div style={{ background:'#fff', borderRadius:12, padding:28, border:'1px solid #e5e7eb', maxWidth:560 }}>
          <h3 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>Add Government User</h3>
          <div style={{ display:'grid', gap:12 }}>
            <input placeholder="Full Name" value={userForm.name} onChange={e => setUserForm(f => ({...f, name:e.target.value}))} style={inp} />
            <input placeholder="Email" value={userForm.email} onChange={e => setUserForm(f => ({...f, email:e.target.value}))} style={inp} />
            <input placeholder="Password" value={userForm.password} onChange={e => setUserForm(f => ({...f, password:e.target.value}))} style={inp} />
            <select value={userForm.role} onChange={e => setUserForm(f => ({...f, role:e.target.value}))} style={inp}>
              <option value='gov_user'>Gov User (Parish/Agency)</option>
              <option value='admin'>Admin</option>
            </select>
            <select value={userForm.parish} onChange={e => setUserForm(f => ({...f, parish:e.target.value}))} style={inp}>
              <option value=''>Select Parish...</option>
              {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input placeholder="Agency (e.g. National Works Agency)" value={userForm.agency} onChange={e => setUserForm(f => ({...f, agency:e.target.value}))} style={inp} />
            <input placeholder="Phone (optional)" value={userForm.phone} onChange={e => setUserForm(f => ({...f, phone:e.target.value}))} style={inp} />
            <button onClick={createUser} style={{ padding:12, background:B, color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:14 }}>
              Create Gov User →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
