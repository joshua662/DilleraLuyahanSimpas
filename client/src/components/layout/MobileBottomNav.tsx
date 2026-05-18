import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, LayoutGrid, Calendar, Search, User, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import LogoutConfirmModal from "../ui/LogoutConfirmModal";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/services", label: "Services", icon: LayoutGrid },
  { to: "/booking", label: "Book", icon: Calendar },
  { to: "/track", label: "Track", icon: Search },
];

const MobileBottomNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-[10px] font-medium ${isActive ? "text-sky" : "text-slate-500 dark:text-slate-400"}`;

  const handleLogout = async () => {
    await logout();
    setLogoutOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-border dark:border-slate-700 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                <User className="w-5 h-5" />
                Dashboard
              </NavLink>
              <button type="button" onClick={() => setLogoutOpen(true)} className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-red-500">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass}>
              <User className="w-5 h-5" />
              Login
            </NavLink>
          )}
        </div>
      </nav>
      <LogoutConfirmModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={() => void handleLogout()} />
    </>
  );
};

export default MobileBottomNav;
