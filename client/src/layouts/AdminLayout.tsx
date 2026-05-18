import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, CreditCard, Tag, BarChart3,
  LogOut, Menu, X, Droplets, Moon, Sun,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/orders", icon: Package, label: "Orders" },
  { to: "/admin/customers", icon: Users, label: "Customers" },
  { to: "/admin/payments", icon: CreditCard, label: "Payments" },
  { to: "/admin/pricing", icon: Tag, label: "Pricing" },
  { to: "/admin/reports", icon: BarChart3, label: "Reports" },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive ? "bg-sky text-navy" : "text-slate-300 hover:bg-white/10"
    }`;

  return (
    <div className="min-h-screen flex bg-surface dark:bg-slate-900">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy text-white transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <Droplets className="w-7 h-7 text-sky" />
            <span className="font-bold text-sm">MD & V Admin</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setSidebarOpen(false)}>
              <item.icon className="w-5 h-5" /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button onClick={() => void handleLogout()} className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:text-white rounded-xl hover:bg-white/10">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-border dark:border-slate-700 flex items-center justify-between px-4 sm:px-6">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <h1 className="font-semibold text-navy dark:text-white hidden sm:block">Admin Dashboard</h1>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/" className="text-sm text-sky hover:underline">View Site</Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
