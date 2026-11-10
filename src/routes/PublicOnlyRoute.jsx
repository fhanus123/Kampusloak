import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/ui/Spinner";

export default function PublicOnlyRoute() {
  const { user, profile, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Tunggu profil termuat supaya role diketahui sebelum mengalihkan
  if (loading || (user && !profile)) return <Spinner fullPage />;

  if (user) {
    const target = isAdmin ? "/admin" : (location.state?.from?.pathname ?? "/");
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
