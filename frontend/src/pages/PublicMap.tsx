import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'

const B = '#1e40af'
const PRIORITY_COLOR: Record<string,string> = { low:'#6b7280', medium:'#d97706', high:'#dc2626', critical:'#7c3aed' }
const STATUS_COLOR: Record<string,string> = { submitted:'#6b7280', acknowledged:'#d97706', in_progress:'#2563eb', resolved:'#059669', closed:'#9ca3af' }
const CAT_ICONS: Record<string,string> = { broken_road:'🛣️', garbage:'🗑️', water_outage:'💧', streetlight:'💡', illegal_dumping:'⚠️', flooding:'🌊', other:'📌' }
const PARISHES = ['','Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine']
const CATEGORIES = ['','broken_road','garbage','water_outage','streetlight','illegal_dumping','flooding','other']
const STATUSES = ['','submitted','acknowledged','in_progress','resolved','closed']

export default function PublicMap() {
  const navigate = useNavigate()
  const [issues, setIssues] = useState<any[]>([])
  const [filters, setFilters] = useState({ parish:'', category:'', status:'' })
  const [selected, setSelected] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapObj = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const load = () => {
    const q = new URLSearchParams()
    if (filters.parish) q.set('parish', filters.parish)
    if (filters.category) q.set('category', filters.category)
    if (filters.status) q.set('status', filters.status)
    apiFetch(`/issues?${q.toString()}&limit=200`).then(setIssues)
  }

  useEffect(() => { load() }, [filters])

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return
    const L = (window as any).L
    if (!L) return
    const map = L.map(mapRef.current).setView([18.0, -76.8], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
    mapObj.current = map
  }, [])

  useEffect(() => {
    const map = mapObj.current
    if (!map) return
    const L = (window as any).L
    if (!L) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    issues.filter(i => i.lat && i.lng).forEach(issue => {
      const color = PRIORITY_COLOR[issue.priority] || '#6b7280'
      const icon = L.divIcon({
        html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px">${CAT_ICONS[issue.category]||'📌'}</div>`,
        className:'', iconSize:[28,28], iconAnchor:[14,14]
      })
      const marker = L.marker([issue.lat, issue.lng], { icon })
        .addTo(map)
        .on('click', () => setSelected(issue))
      markersRef.current.push(marker)
    })
  }, [issues])

  const filt = (k: string) => (e: any) => setFilters(f => ({ ...f, [k]: e.target.value }))
  const sel = { padding:'8px 12px', border:'1.5px solid #d1d5db', borderRadius:7, fontSize:13, background:'#fff' }

  return (
    <div style={{ display:'flex', height:'calc(100vh - 60px)' }}>
      {/* Sidebar */}
      <div style={{ width:360, background:'#fff', borderRight:'1px solid #e5e7eb', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid #e5e7eb' }}>
          <h2 style={{ fontSize:16, fontWeight:800, margin:'0 0 12px', color:'#1f2937' }}>🗺️ Issue Map</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <select value={filters.parish} onChange={filt('parish')} style={sel}>
              <option value=''>All Parishes</option>
              {PARISHES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <select value={filters.category} onChange={filt('category')} style={sel}>
                <option value=''>All Categories</option>
                {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.replace('_',' ')}</option>)}
              </select>
              <select value={filters.status} onChange={filt('status')} style={sel}>
                <option value=''>All Statuses</option>
                {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop:8, fontSize:12, color:'#6b7280' }}>{issues.length} issues</div>
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {issues.map(i => (
            <div key={i.id}
              onClick={() => { setSelected(i); if (i.lat && i.lng && mapObj.current) mapObj.current.setView([i.lat, i.lng], 16) }}
              style={{ padding:'12px 16px', borderBottom:'1px solid #f3f4f6', cursor:'pointer', background: selected?.id===i.id ? '#eff6ff' : '#fff' }}
              onMouseEnter={e => { if (selected?.id!==i.id) e.currentTarget.style.background='#f9fafb' }}
              onMouseLeave={e => { if (selected?.id!==i.id) e.currentTarget.style.background='#fff' }}>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{CAT_ICONS[i.category]}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:'#1f2937', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{i.title}</div>
                  <div style={{ fontSize:11, color:'#6b7280' }}>📍 {i.parish}</div>
                  <div style={{ display:'flex', gap:4, marginTop:4 }}>
                    <span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background:`${STATUS_COLOR[i.status]}15`, color:STATUS_COLOR[i.status], fontWeight:600 }}>{i.status.replace('_',' ')}</span>
                    <span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background:`${PRIORITY_COLOR[i.priority]}15`, color:PRIORITY_COLOR[i.priority], fontWeight:600 }}>{i.priority}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex:1, position:'relative' }}>
        <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
        {selected && (
          <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', background:'#fff', borderRadius:14, padding:20, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', width:340, zIndex:1000 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ fontSize:24 }}>{CAT_ICONS[selected.category]}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:'#1f2937' }}>{selected.title}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>📍 {selected.parish}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:18 }}>✕</button>
            </div>
            <div style={{ display:'flex', gap:6, marginBottom:12 }}>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:`${STATUS_COLOR[selected.status]}15`, color:STATUS_COLOR[selected.status], fontWeight:700 }}>{selected.status.replace('_',' ')}</span>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:`${PRIORITY_COLOR[selected.priority]}15`, color:PRIORITY_COLOR[selected.priority], fontWeight:600 }}>{selected.priority}</span>
            </div>
            <button onClick={() => navigate(`/issues/${selected.id}`)}
              style={{ width:'100%', padding:'9px', background:B, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13 }}>
              View Full Details →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
