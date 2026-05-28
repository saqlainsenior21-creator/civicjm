import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiFetch } from './api'

interface User { id: string; name: string; email: string; role: string; parish?: string; agency?: string }
interface AuthCtx { user: User | null; login: (email: string, password: string) => Promise<void>; logout: () => void; loading: boolean; refreshUser: () => Promise<void> }

const Ctx = createContext<AuthCtx>({ user: null, login: async () => {}, logout: () => {}, loading: true, refreshUser: async () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('civicjm_token')
    if (token) {
      apiFetch('/auth/me').then(setUser).catch(() => localStorage.removeItem('civicjm_token')).finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    localStorage.setItem('civicjm_token', data.token)
    setUser(data.user)
  }

  const logout = () => { localStorage.removeItem('civicjm_token'); setUser(null) }
  const refreshUser = async () => { const u = await apiFetch('/auth/me'); setUser(u) }

  return <Ctx.Provider value={{ user, login, logout, loading, refreshUser }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
