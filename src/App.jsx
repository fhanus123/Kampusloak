import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import AdminRoute from "./routes/AdminRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import ListingDetail from "./pages/ListingDetail";
import SellListing from "./pages/SellListing";
import Dashboard from "./pages/Dashboard";
import EditListing from "./pages/EditListing";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Verification from "./pages/Verification";
import Verifications from "./components/admin/Verifications";
import Chat from "./pages/Chat";
import ChatThread from "./components/chat/ChatThread";
import EmptyState from "./components/ui/EmptyState";
import AdminLayout from "./components/layout/AdminLayout";
import AdminListings from "./pages/admin/AdminListings";
import AdminReports from "./pages/admin/AdminReports";
import AdminCategories from "./pages/admin/AdminCategories";
import Saved from "./pages/Saved";

const NotFound = () => (
  <div className="py-16 text-center text-xl font-bold">
    404 - Halaman tidak ditemukan
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rute baru */}
        <Route path="/search" element={<Search />} />
        <Route path="/listings/:id" element={<ListingDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/listings/new" element={<SellListing />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/chat" element={<Chat />}>
            <Route
              index
              element={
                <EmptyState
                  title="Pilih percakapan"
                  description="Pilih salah satu percakapan di sebelah kiri."
                />
              }
            />
            <Route path=":conversationId" element={<ChatThread />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Verifications />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
