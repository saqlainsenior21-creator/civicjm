import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../AuthContext'

const B = '#1e40af'
const PARISHES = ['Kingston','St. Andrew','St. Thomas','Portland','St. Mary','St. Ann','Trelawny','St. James','Hanover','Westmoreland','St. Elizabeth','Manchester','Clarendon','St. Catherine']
const CATEGORIES = [
  { value:'broken_road', label:'🛣️ Broken Road / Pothole', desc:'Damaged road surface, potholes, collapsed sections' },
  { value:'garbage', label:'🗑️ Garbage Buildup', desc:'Uncollected garbage, overflowing bins' },
  { value:'water_outage', label:'💧 Water Outage', desc:'No water supply, pipe burst, contamination' },
  { value:'streetlight', label:'💡 Streetlight Issue', desc:'Broken or non-functioning streetlights' },
  { value:'illegal_dumping', label:'⚠️ Illegal Dumping', desc:'Waste illegally disposed on public land' },
  { value:'flooding', label:'🌊 Flooding', desc:'Blocked drains, road flooding, landslides' },
  { value:'other', label:'📌 Other', desc:'Any other public infrastructure issue' },
]

export default function ReportIssue() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    title: '', category: params.get('category') || '', description: '',
    parish: (user as any)?.parish || '', address: '', priority: 'medium',
    lat: '', lng: '', photo_data: ''
  })
  const [gpsLoading, setGpsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const mapRef = useRef<HTMLDivElement>(null)
  const mapObj = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return
    const L = (window as any).L || require('leaflet')
    const map = L.map(mapRef.current).setView([18.0, -76.8], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng
      setForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }))
      if (markerRef.current) markerRef.current.remove()
      markerRef.current = L.marker([lat, lng]).addTo(map)
        .bindPopup('📍 Issue location').openPopup()
    })
    mapObj.current = map
  }, [])

  function getGPS() {
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setForm(f => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }))
        setGpsLoading(false)
        if (mapObj.current) {
          mapObj.current.setView([lat, lng], 15)
          const L = (window as any).L || require('leaflet')
          if (markerRef.current) markerRef.current.remove()
          markerRef.current = L.marker([lat, lng]).addTo(mapObj.current)
            .bindPopup('📍 Your location').openPopup()
        }
      },
      () => { setGpsLoading(false); setError('Could not get GPS. Please click the map or enter address.') }
    )
  }

  function handlePhoto(e: any) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) { setError('Photo must be under 4MB'); return }
    const reader = new FileReader()
    reader.onload = ev => {
      const data = ev.target?.result as string
      setForm(f => ({ ...f, photo_data: data }))
      setPhotoPreview(data)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!form.title || !form.category || !form.parish) { setError('Title, category, and parish are required'); return }
    setSubmitting(true); setError('')
    try {
      const { id } = await apiFetch('/issues', { method:'POST', body: JSON.stringify({
        ...form, lat: form.lat ? Number(form.lat) : null, lng: form.lng ? Number(form.lng) : null
      })})
      navigate(`/issues/${id}`)
    } catch(e: any) { setError(e.message) }
    finally { setSubmitting(false) }
  }

  const inp = { padding:'10px 14px', border:'1.5px solid #d1d5db', borderRadius:8, fontSize:14, width:'100%', boxSizing:'border-box' as const }

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'32px 24px' }}>
      <h1 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>📍 Report an Issue</h1>
      <p style={{ color:'#6b7280', marginBottom:28 }}>Submit a community issue to the relevant government agency</p>

      {/* Category selector */}
      <div style={{ marginBottom:24 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:10, color:'#374151' }}>Issue Category *</label>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
          {CATEGORIES.map(c => (
            <button key={c.value} type="button" onClick={() => setForm(f => ({...f, category:c.value}))}
              style={{ padding:'12px 14px', textAlign:'left', border:`2px solid ${form.category===c.value?B:'#e5e7eb'}`, borderRadius:10,
                background:form.category===c.value?`${B}10`:'#fff', cursor:'pointer' }}>
              <div style={{ fontWeight:600, fontSize:13, color:form.category===c.value?B:'#374151' }}>{c.label}</div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom:14 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:6 }}>Title *</label>
        <input placeholder="Brief description, e.g. Large pothole on Constant Spring Road" value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} style={inp} />
      </div>

      {/* Parish + priority */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:6 }}>Parish *</label>
          <select value={form.parish} onChange={e => setForm(f => ({...f, parish:e.target.value}))} style={inp}>
            <option value=''>Select parish...</option>
            {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:6 }}>Priority</label>
          <select value={form.priority} onChange={e => setForm(f => ({...f, priority:e.target.value}))} style={inp}>
            <option value='low'>Low</option>
            <option value='medium'>Medium</option>
            <option value='high'>High</option>
            <option value='critical'>🚨 Critical</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div style={{ marginBottom:14 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:6 }}>Street Address</label>
        <input placeholder="e.g. 45 Constant Spring Road, Kingston 10" value={form.address} onChange={e => setForm(f => ({...f, address:e.target.value}))} style={inp} />
      </div>

      {/* Description */}
      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:6 }}>Description</label>
        <textarea rows={4} placeholder="Describe the issue in detail — how long has it been there, how severe it is, who it affects..." value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} style={{ ...inp, resize:'vertical' }} />
      </div>

      {/* GPS + Map */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <label style={{ fontSize:13, fontWeight:700, color:'#374151' }}>📍 GPS Location (click map or use button)</label>
          <button onClick={getGPS} disabled={gpsLoading}
            style={{ padding:'7px 16px', background:B, color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:600, opacity:gpsLoading?0.6:1 }}>
            {gpsLoading ? 'Getting location...' : '📡 Use My Location'}
          </button>
        </div>
        {(form.lat && form.lng) && <div style={{ fontSize:12, color:'#059669', marginBottom:8, fontWeight:600 }}>✅ Location set: {form.lat}, {form.lng}</div>}
        <div ref={mapRef} style={{ height:260, borderRadius:12, border:'1.5px solid #e5e7eb', overflow:'hidden' }} />
        <div style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>Click on the map to pin the exact issue location</div>
      </div>

      {/* Photo upload */}
      <div style={{ marginBottom:24 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:700, marginBottom:6 }}>📸 Photo (optional, max 4MB)</label>
        <input type="file" accept="image/*" onChange={handlePhoto} style={{ fontSize:13 }} />
        {photoPreview && <img src={photoPreview} alt="preview" style={{ marginTop:10, maxWidth:'100%', maxHeight:200, borderRadius:8, border:'1px solid #e5e7eb' }} />}
      </div>

      {/* WhatsApp tip */}
      <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 16px', marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#065f46', marginBottom:4 }}>💬 Share via WhatsApp</div>
        <div style={{ fontSize:12, color:'#374151' }}>After submitting, you can share the issue link directly via WhatsApp to alert your community or your local councillor.</div>
      </div>

      {error && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'10px 14px', color:'#dc2626', fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}

      <button onClick={handleSubmit} disabled={submitting}
        style={{ width:'100%', padding:14, background:'#dc2626', color:'#fff', border:'none', borderRadius:10, fontSize:16, fontWeight:700, cursor:'pointer', opacity:submitting?0.6:1 }}>
        {submitting ? 'Submitting...' : '📤 Submit Report'}
      </button>
    </div>
  )
}
