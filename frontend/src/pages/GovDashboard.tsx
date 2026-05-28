import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../AuthContext'

const B = '#1e40af'
const STATUS_COLOR: Record<string,string> = { submitted:'#6b7280', acknowledged:'#d97706', in_progress:'#2563eb', resolved:'#059669', closed:'#9ca3af' }
const PRIORITY_COLOR: Record<string,string> = { low:'#6b7280', medium:'#d97706', high:'#dc2626', critical:'#7c3aed' }
const CAT_ICONS: Record<string,string> = { broken_road:'🛣️', garbage:'🗑️', water_outage:'💧', streetlight:'💡', illegal_dumping:'⚠️', flooding:'🌊', other:'📌' }
const STATUSES = ['submitted','acknowledged','in_progress','resolved','closed']

export default function GovDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [updatingId, setUpdatingId] = useState<string|null>(null)
  const [updateForm, setUpdateForm] = useState({ status:'', note:'', assigned_agency:'' })

  const load = () => apiFetch('/gov/dashboard').then(setData).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  async function submitUpdate(issueId: string) {
    try {
      await apiFetch(`/issues/${issueId}/status`, { method:'PATCH', body: JSON.stringify(updateForm) })
      setUpdatingId(null); load()
    } catch(e: any) { alert(e.message) }
  }

  if (loading) return <div style={{ padding:48, textAlign:'center', color:'#6b7280' }}>Loading dashboard...</div>
  if (!data) return null

  const filtered = (data.issues || []).filter((i: any) => {
    if (filterStatus && i.status !== filterStatus) return false
    if (filterPriority && i.priority !== filterPriority) return false
    return true
  })

  const stats = data.stats
  const sel = { padding:'8px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:13, background:'#fff' }
  const inp = { padding:'8px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:13, width:'100%', boxSizing:'border-box' as const }

  return (
    <div style={{ padding:32 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:26, fontWeight:800, margin:'0 0 2px' }}>🏛️ Government Dashboard</h1>
        <p style={{ color:'#6b7280', margin:0 }}>
          {user?.name} · {data.agency || 'All Agencies'}
          {data.parish && <span style={{ marginLeft:8, fontSize:12, background:'#eff6ff', color:B, padding:'2px 8px', borderRadius:20, fontWeight:600 }}>📍 {data.parish}</span>}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:28 }}>
        {[
          { label:'Total Issues', val:stats.total, color:'#1f2937' },
          { label:'🔴 Submitted', val:stats.submitted, color:'#6b7280' },
          { label:'🟡 Acknowledged', val:stats.acknowledged, color:'#d97706' },
          { label:'🔵 In Progress', val:stats.inProgress, color:'#2563eb' },
          { label:'✅ Resolved', val:stats.resolved, color:'#059669' },
          { label:'🚨 Critical', val:stats.critical, color:'#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', borderRadius:10, padding:'16px', border:'1px solid #e5e7eb', textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12, color:'#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={sel}>
          <option value=''>All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={sel}>
          <option value=''>All Priorities</option>
          {['low','medium','high','critical'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div style={{ marginLeft:'auto', fontSize:13, color:'#6b7280', display:'flex', alignItems:'center' }}>{filtered.length} issues</div>
      </div>

      {/* Issues table */}
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#f9fafb' }}>
              {['','Issue','Parish','Priority','Status','Updated','Action'].map(h => (
                <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:'#374151', borderBottom:'1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((i: any) => (
              <>
                <tr key={i.id} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ padding:'12px 14px', fontSize:20 }}>{CAT_ICONS[i.category]}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'#1f2937', cursor:'pointer' }} onClick={() => navigate(`/issues/${i.id}`)}>{i.title}</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{i.reporter_name}</div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#374151' }}>{i.parish}</td>
                  <td style={{ padding:'12px 14px' }}><span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, background:`${PRIORITY_COLOR[i.priority]}15`, color:PRIORITY_COLOR[i.priority], fontWeight:700 }}>{i.priority}</span></td>
                  <td style={{ padding:'12px 14px' }}><span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, background:`${STATUS_COLOR[i.status]}15`, color:STATUS_COLOR[i.status], fontWeight:700 }}>{i.status.replace('_',' ')}</span></td>
                  <td style={{ padding:'12px 14px', fontSize:11, color:'#9ca3af' }}>{new Date(i.updated_at).toLocaleDateString()}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <button onClick={() => { setUpdatingId(updatingId===i.id?null:i.id); setUpdateForm({ status:i.status, note:'', assigned_agency:i.assigned_agency||'' }) }}
                      style={{ padding:'5px 12px', background: updatingId===i.id?'#f3f4f6':B, color:updatingId===i.id?'#374151':'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                      {updatingId===i.id ? 'Cancel' : 'Update'}
                    </button>
                  </td>
                </tr>
                {updatingId === i.id && (
                  <tr key={`${i.id}-update`}>
                    <td colSpan={7} style={{ padding:'0 14px 14px' }}>
                      <div style={{ background:'#f8faff', borderRadius:8, padding:16, border:`1px solid ${B}20`, display:'grid', gridTemplateColumns:'1fr 1fr 2fr auto', gap:8 }}>
                        <select value={updateForm.status} onChange={e => setUpdateForm(f => ({...f, status:e.target.value}))} style={inp}>
                          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                        </select>
                        <input placeholder="Assign agency" value={updateForm.assigned_agency} onChange={e => setUpdateForm(f => ({...f, assigned_agency:e.target.value}))} style={inp} />
                        <input placeholder="Update note..." value={updateForm.note} onChange={e => setUpdateForm(f => ({...f, note:e.target.value}))} style={inp} />
                        <button onClick={() => submitUpdate(i.id)} style={{ padding:'8px 16px', background:B, color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontWeight:600, fontSize:12, whiteSpace:'nowrap' }}>Save</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>No issues match the current filters.</div>}
      </div>
    </div>
  )
}
