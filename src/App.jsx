import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'
import AdminRoute from './routes/AdminRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './hooks/useAuth'

// Placeholder sementara
const Home = () => {
  const { profile, signOut } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Beranda</h1>
      <p>Halo, {profile?.full_name ?? 'tamu'}</p>
      {profile && <button onClick={signOut} className="underline">Keluar</button>}
    </div>
  )
}
const Dashboard = () => <div className="p-8">Dashboard (terproteksi)</div>
const AdminHome = () => <div className="p-8">Admin (khusus admin)</div>
const NotFound = () => <div className="p-8">404 - Halaman tidak ditemukan</div>

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminHome />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}