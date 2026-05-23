import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Home, Loader2, User, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import PasswordInput from "../../components/ui/PasswordInput";
import { getApiErrorMessage } from "../../utils/apiError";

type LoginMode = "user" | "admin";

const getSafeRedirectPath = (value?: string) =>
  value?.startsWith("/") && !value.startsWith("//") ? value : undefined;

const LoginPage = () => {
  const location = useLocation();
  const locationState = location.state as { email?: string; from?: string } | null;
  const prefillEmail = locationState?.email ?? "";
  const redirectTo = getSafeRedirectPath(locationState?.from);
  const [mode, setMode] = useState<LoginMode>("user");
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password);

      if (mode === "admin" && user.role !== "admin") {
        await logout();
        showToast("This account is not an admin. Use User login instead.", "error");
        return;
      }
      if (mode === "user" && user.role === "admin") {
        await logout();
        showToast("Admin accounts must use the Admin tab to sign in.", "error");
        return;
      }

      showToast(mode === "admin" ? "Welcome, Admin!" : "Welcome back!");
      navigate(mode === "admin" ? "/admin" : redirectTo ?? "/dashboard", { replace: true });
    } catch (err) {
      showToast(
        getApiErrorMessage(err, "Invalid email or password. Check your details or use Forgot password."),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-8 card-shadow border border-border dark:border-slate-700"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 px-3 py-2 text-sm font-semibold text-navy dark:text-sky border border-border dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <Home className="w-4 h-4" /> Home
        </Link>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-hero flex items-center justify-center">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">Welcome Back</h1>
          <p className="text-muted text-sm mt-1">
            {mode === "admin" ? "Staff sign in to manage orders" : "Sign in to your account"}
          </p>
        </div>

        {prefillEmail && (
          <p className="mb-4 text-sm text-center text-sky bg-sky/10 border border-sky/30 rounded-xl px-3 py-2">
            Account found for <strong>{prefillEmail}</strong> — enter your password to sign in.
          </p>
        )}

        <div className="grid grid-cols-2 gap-1 p-1 mb-6 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("user")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
              mode === "user"
                ? "bg-white dark:bg-slate-700 text-navy dark:text-white shadow-sm ring-2 ring-sky/50"
                : "text-muted"
            }`}
          >
            <User className="w-4 h-4" /> User
          </button>
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
              mode === "admin"
                ? "bg-white dark:bg-slate-700 text-navy dark:text-white shadow-sm ring-2 ring-sky/50"
                : "text-muted"
            }`}
          >
            <Shield className="w-4 h-4" /> Admin
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === "admin" ? 12 : -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "admin" ? "Staff email" : "your@email.com"}
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
              className={`w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 ${
                mode === "admin" ? "bg-navy hover:bg-navy-dark" : "bg-sky text-navy hover:bg-sky-light"
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === "admin" ? (
                <>
                  <Shield className="w-5 h-5" /> Admin Sign In
                </>
              ) : (
                <>
                  <User className="w-5 h-5" /> Sign In
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        {mode === "user" && (
          <p className="text-center text-sm text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" state={redirectTo ? { from: redirectTo } : undefined} className="text-sky font-medium hover:underline">
              Register
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
