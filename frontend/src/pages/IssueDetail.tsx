import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../AuthContext'

const B = '#1e40af'
const STATUS_COLOR: Record<string,string> = { submitted:'#6b7280', acknowledged:'#d97706', in_progress:'#2563eb', resolved:'#059669', closed:'#9ca3af' }
const PRIORITY_COLOR: Record<string,string> = { low:'#6b7280', medium:'#d97706', high:'#dc2626', critical:'#7c3aed' }
const CAT_ICONS: Record<string,string> = { broken_road:'🛣️', garbage:'🗑️', water_outage:'💧', streetlight:'💡', illegal_dumping:'⚠️', flooding:'🌊', other:'📌' }
const STATUSES = ['submitted','acknowledged','in_progress','resolved','closed']

export default function IssueDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [issue, setIssue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [updateForm, setUpdateForm] = useState({ status:'', note:'', assigned_agency:'' })
  const [showUpdate, setShowUpdate] = useState(false)

  const load = () => apiFetch(`/issues/${id}`).then(d => { setIssue(d); setUpdateForm(f => ({ ...f, status: d.status })) }).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  async function submitUpdate() {
    setUpdating(true)
    try {
      await apiFetch(`/issues/${id}/status`, { method:'PATCH', body: JSON.stringify(updateForm) })
      setShowUpdate(false); load()
    } catch(e: any) { alert(e.message) }
    finally { setUpdating(false) }
  }

  async function upvote() {
    try { await apiFetch(`/issues/${id}/upvote`, { method:'POST' }); load() }
    catch(e: any) { alert(e.message) }
  }

  const whatsappLink = () => {
    const text = encodeURIComponent(`🏛️ CivicJM Issue Report\n${issue.title}\n📍 ${issue.parish}${issue.address ? ' — '+issue.address : ''}\nStatus: ${issue.status.replace('_',' ')}\nView: ${window.location.href}`)
    return `https://wa.me/?text=${text}`
  }

  if (loading) return <div style={{ padding:48, textAlign:'center', color:'#6b7280' }}>Loading...</div>
  if (!issue) return <div style={{ padding:48, textAlign:'center' }}>Issue not found.</div>

  const inp = { padding:'9px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:13, width:'100%', boxSizing:'border-box' as const }

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'32px 24px' }}>
      <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:B, cursor:'pointer', fontWeight:600, fontSize:13, marginBottom:16, padding:0 }}>← Back</button>

      <div style={{ background:'#fff', borderRadius:16, padding:28, border:'1px solid #e5e7eb', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:36 }}>{CAT_ICONS[issue.category]}</span>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>{issue.title}</h1>
              <div style={{ fontSize:13, color:'#6b7280' }}>📍 {issue.parish}{issue.address ? ` — ${issue.address}` : ''}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexDirection:'column', alignItems:'flex-end' }}>
            <span style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:`${STATUS_COLOR[issue.status]}20`, color:STATUS_COLOR[issue.status], fontWeight:700 }}>{issue.status.replace('_',' ').toUpperCase()}</span>
            <span style={{ fontSize:12, padding:'4px 12px', borderRadius:20, background:`${PRIORITY_COLOR[issue.priority]}20`, color:PRIORITY_COLOR[issue.priority], fontWeight:600 }}>{issue.priority} priority</span>
          </div>
        </div>

        {issue.description && <p style={{ color:'#374151', fontSize:14, lineHeight:1.6, margin:'0 0 16px' }}>{issue.description}</p>}

        {issue.photo_data && <img src={issue.photo_data} alt="Issue photo" style={{ width:'100%', maxHeight:320, objectFit:'cover', borderRadius:10, marginBottom:16, border:'1px solid #e5e7eb' }} />}

        {(issue.lat && issue.lng) && (
          <div style={{ marginBottom:16 }}>
            <a href={`https://maps.google.com/?q=${issue.lat},${issue.lng}`} target="_blank" rel="noreferrer"
              style={{ fontSize:13, color:B, fontWeight:600 }}>🗺️ View on Google Maps ({issue.lat}, {issue.lng})</a>
          </div>
        )}

        <div style={{ display:'flex', gap:12, fontSize:12, color:'#6b7280', marginBottom:20, flexWrap:'wrap' }}>
          <span>Reported by: <strong>{issue.reporter_name}</strong></span>
          <span>·</span>
          <span>{new Date(issue.created_at).toLocaleDateString('en-JM', { year:'numeric', month:'long', day:'numeric' })}</span>
          {issue.assigned_agency && <><span>·</span><span>Assigned to: <strong>{issue.assigned_agency}</strong></span></>}
          <span>·</span>
          <span>👍 {issue.upvotes} upvotes</span>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {user && <button onClick={upvote} style={{ padding:'8px 16px', background:'#f0fdf4', color:'#059669', border:'1.5px solid #bbf7d0', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13 }}>👍 Upvote ({issue.upvotes})</button>}
          <a href={whatsappLink()} target="_blank" rel="noreferrer"
            style={{ padding:'8px 16px', background:'#dcfce7', color:'#15803d', border:'1.5px solid #86efac', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13, textDecoration:'none' }}>
            💬 Share on WhatsApp
          </a>
          {(user?.role === 'gov_user' || user?.role === 'admin') && (
            <button onClick={() => setShowUpdate(v => !v)} style={{ padding:'8px 16px', background:B, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13 }}>
              🔧 Update Status
            </button>
          )}
        </div>

        {/* Gov update form */}
        {showUpdate && (
          <div style={{ marginTop:20, padding:20, background:'#f8faff', borderRadius:10, border:`1px solid ${B}20` }}>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:14, color:B }}>Update Issue Status</h3>
            <div style={{ display:'grid', gap:10 }}>
              <select value={updateForm.status} onChange={e => setUpdateForm(f => ({...f, status:e.target.value}))} style={inp}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ').toUpperCase()}</option>)}
              </select>
              <input placeholder="Assigned agency (e.g. NWA, KSAC)" value={updateForm.assigned_agency} onChange={e => setUpdateForm(f => ({...f, assigned_agency:e.target.value}))} style={inp} />
              <textarea rows={3} placeholder="Update note (visible to citizen)..." value={updateForm.note} onChange={e => setUpdateForm(f => ({...f, note:e.target.value}))} style={{ ...inp, resize:'vertical' }} />
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={submitUpdate} disabled={updating} style={{ flex:1, padding:'9px', background:B, color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontWeight:600, fontSize:13 }}>
                  {updating ? 'Saving...' : 'Save Update'}
                </button>
                <button onClick={() => setShowUpdate(false)} style={{ padding:'9px 16px', background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:7, cursor:'pointer', fontSize:13 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {issue.updates?.length > 0 && (
        <div style={{ background:'#fff', borderRadius:16, padding:24, border:'1px solid #e5e7eb' }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>📋 Status Updates</h3>
          <div style={{ position:'relative', paddingLeft:24 }}>
            <div style={{ position:'absolute', left:7, top:0, bottom:0, width:2, background:'#e5e7eb' }} />
            {issue.updates.map((u: any) => (
              <div key={u.id} style={{ position:'relative', marginBottom:20 }}>
                <div style={{ position:'absolute', left:-21, width:12, height:12, borderRadius:'50%', background:STATUS_COLOR[u.new_status] || B, border:'2px solid #fff' }} />
                <div style={{ fontSize:13, fontWeight:700, color:STATUS_COLOR[u.new_status] || B }}>
                  {(u.old_status || 'submitted').replace('_',' ')} → {u.new_status?.replace('_',' ')}
                </div>
                {u.note && <div style={{ fontSize:13, color:'#374151', marginTop:4 }}>{u.note}</div>}
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>by {u.updated_by_name} · {new Date(u.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
