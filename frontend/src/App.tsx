import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ReportIssue from './pages/ReportIssue'
import MyReports from './pages/MyReports'
import PublicMap from './pages/PublicMap'
import IssueDetail from './pages/IssueDetail'
import GovDashboard from './pages/GovDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Partner from './pages/Partner'

function ProtectedRoute({ children, roles }: { children: any, roles?: string[] }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:18, color:'#6b7280' }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/map" element={<PublicMap />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/issues/:id" element={<IssueDetail />} />
            <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
            <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
            <Route path="/gov" element={<ProtectedRoute roles={['gov_user','admin']}><GovDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
