import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const B = '#1e40af'
const R = '#dc2626'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()

  const navBtn = (label: string, to: string) => (
    <button key={to} onClick={() => navigate(to)}
      style={{ padding:'8px 14px', background: loc.pathname===to ? B : 'transparent', color: loc.pathname===to ? '#fff' : '#374151',
        border:'none', borderRadius:7, cursor:'pointer', fontWeight:600, fontSize:13 }}>
      {label}
    </button>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <nav style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60, position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }} onClick={() => navigate('/')}>
          <span style={{ fontSize:24 }}>🏛️</span>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:B, lineHeight:1 }}>CivicJM</div>
            <div style={{ fontSize:10, color:'#9ca3af', lineHeight:1 }}>Jamaica Community Reporting</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
          {navBtn('🗺️ Map', '/map')}
          {user && navBtn('📋 My Reports', '/my-reports')}
          {user?.role === 'gov_user' && navBtn('🏛️ Gov Dashboard', '/gov')}
          {user?.role === 'admin' && navBtn('⚙️ Admin', '/admin')}
          {user?.role === 'admin' && navBtn('🏛️ Gov Dashboard', '/gov')}

          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:8 }}>
              <button onClick={() => navigate('/report')}
                style={{ padding:'8px 18px', background:R, color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:13 }}>
                + Report Issue
              </button>
              <div style={{ fontSize:13, color:'#374151', fontWeight:600 }}>{user.name.split(' ')[0]}</div>
              <button onClick={logout} style={{ padding:'7px 12px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:7, cursor:'pointer', fontSize:12 }}>Sign out</button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:8, marginLeft:8 }}>
              <button onClick={() => navigate('/login')} style={{ padding:'8px 16px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:7, cursor:'pointer', fontWeight:600, fontSize:13 }}>Sign in</button>
              <button onClick={() => navigate('/report')}
                style={{ padding:'8px 18px', background:R, color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:13 }}>
                + Report Issue
              </button>
            </div>
          )}
        </div>
      </nav>

      <main style={{ flex:1 }}>
        <Outlet />
      </main>

      <footer style={{ background:'#1f2937', color:'#9ca3af', padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
        <div>🏛️ <strong style={{ color:'#fff' }}>CivicJM</strong> — Jamaica Community Reporting Platform</div>
        <div>National Works Agency · KSAC · Parish Councils</div>
      </footer>
    </div>
  )
}
