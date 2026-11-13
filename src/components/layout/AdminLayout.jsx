import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { to: "/admin", label: "Verifikasi akun", end: true },
  { to: "/admin/listings", label: "Barang" },
  { to: "/admin/reports", label: "Laporan" },
  { to: "/admin/categories", label: "Kategori" },
];

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      <nav className="flex gap-2 overflow-x-auto border-b border-ink/10 pb-3">
        {TABS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${
                isActive ? "bg-nav-sub text-white" : "bg-white hover:bg-mint/30"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
