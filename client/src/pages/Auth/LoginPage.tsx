import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, Loader2, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import PasswordInput from "../../components/ui/PasswordInput";
import { getApiErrorMessage } from "../../utils/apiError";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, login, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);

      if (loggedInUser.role !== "admin") {
        await logout();
        showToast("Admin access only. Customers are managed in the admin panel.", "error");
        return;
      }

      showToast("Welcome, Admin!");
      navigate("/admin", { replace: true });
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "Invalid email or password. Check your details or use Forgot password."),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-sky border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-8 card-shadow border border-border dark:border-slate-700"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-hero flex items-center justify-center">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">Welcome Back</h1>
          <p className="text-muted text-sm mt-1">Staff sign in to manage orders and customers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Staff email"
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-xs text-sky font-medium hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-dark flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Shield className="w-5 h-5" /> Admin Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          <Link to="/track" className="text-sky font-medium hover:underline">
            Track an order
          </Link>
          {" · "}
          <Link to="/contact" className="text-sky font-medium hover:underline">
            Contact us
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
