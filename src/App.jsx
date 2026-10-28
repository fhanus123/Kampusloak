
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'
import AdminRoute from './routes/AdminRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import ListingDetail from './pages/ListingDetail'
import SellListing from './pages/SellListing'

// Placeholder sementara
const Dashboard = () => <div>Dashboard (terproteksi)</div>
const AdminHome = () => <div>Admin (khusus admin)</div>
const NotFound = () => (
  <div className="py-16 text-center text-xl font-bold">
    404 - Halaman tidak ditemukan
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />


        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Rute baru */}
        <Route path="/search" element={<Search />} />
        <Route path="/listings/:id" element={<ListingDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/listings/new" element={<SellListing />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminHome />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
