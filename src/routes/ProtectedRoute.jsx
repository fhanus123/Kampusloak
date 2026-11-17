import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Spinner from '../components/ui/Spinner'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const outletContext = useOutletContext()

  if (loading) return <Spinner fullPage />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet context={outletContext} />
}