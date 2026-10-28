import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Spinner from '../components/ui/Spinner'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner fullPage />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}