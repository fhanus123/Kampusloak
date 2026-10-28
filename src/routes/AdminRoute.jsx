import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Spinner from '../components/ui/Spinner'

export default function AdminRoute() {
  const { user, profile, isAdmin, loading } = useAuth()

  if (loading || (user && !profile)) return <Spinner fullPage />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}