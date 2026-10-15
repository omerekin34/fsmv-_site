import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from './useSession.js'

export default function RequireAuth() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="adm-loading-page">
        <div className="adm-spinner" />
        <span>Yükleniyor…</span>
      </div>
    )
  }
  if (!session) return <Navigate to="/yonetim/giris" replace />
  return <Outlet />
}
