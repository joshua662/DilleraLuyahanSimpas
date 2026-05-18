import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, Droplets, User, LogOut } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import LogoutConfirmModal from "../ui/LogoutConfirmModal";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/booking", label: "Booking" },
  { to: "/track", label: "Tracker" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-sky" : "text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-sky"}`;

  const handleLogout = async () => {
    await logout();
    setLogoutOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-border dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-navy dark:text-white text-sm sm:text-base leading-tight">
                MD & V<br className="sm:hidden" />
                <span className="text-sky font-semibold"> Laundry</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-5">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={navClass}>{l.label}</NavLink>
              ))}
              {user && !isAdmin && (
                <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {user && <NotificationBell />}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin" className="px-3 py-1.5 text-sm font-medium bg-navy text-white rounded-lg hover:bg-navy-dark">
                      Admin
                    </Link>
                  )}
                  <button onClick={() => setLogoutOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-navy dark:text-sky border border-navy/20 rounded-lg">
                  <User className="w-4 h-4" /> Login
                </Link>
              )}
              <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-border dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                    className={`py-2 font-medium ${location.pathname === l.to ? "text-sky" : ""}`}>
                    {l.label}
                  </Link>
                ))}
                {user && !isAdmin && (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="py-2 font-medium text-sky">
                    Dashboard
                  </Link>
                )}
                <Link to="/booking" onClick={() => setOpen(false)} className="mt-2 text-center py-3 bg-navy text-white rounded-xl font-semibold">
                  Book Pickup
                </Link>
                {!user && (
                  <Link to="/login" onClick={() => setOpen(false)} className="text-center py-2 border rounded-xl">Login</Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <LogoutConfirmModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={() => void handleLogout()} />
    </>
  );
};

export default Navbar;
