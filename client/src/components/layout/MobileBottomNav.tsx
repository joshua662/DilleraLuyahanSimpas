import { NavLink } from "react-router-dom";
import { Phone, Search, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { to: "/track", label: "Track", icon: Search },
  { to: "/contact", label: "Contact", icon: Phone },
];

const MobileBottomNav = () => {
  const { user, isAdmin } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-[10px] font-medium max-w-[4.5rem] text-center leading-tight ${
      isActive ? "text-sky" : "text-slate-500 dark:text-slate-400"
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-border dark:border-slate-700 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
        {user && isAdmin ? (
          <NavLink to="/admin" className={linkClass}>
            <Shield className="w-5 h-5 shrink-0" />
            Admin
          </NavLink>
        ) : (
          <NavLink to="/login" className={linkClass}>
            <Shield className="w-5 h-5 shrink-0" />
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
