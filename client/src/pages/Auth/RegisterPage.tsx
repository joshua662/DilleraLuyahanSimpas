import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, Loader2, LogIn } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import PasswordInput from "../../components/ui/PasswordInput";
import { getApiErrorMessage, isEmailAlreadyRegistered } from "../../utils/apiError";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAccountExists(false);

    if (form.password !== form.password_confirmation) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (form.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      await register({
        ...form,
        email: form.email.trim(),
        name: form.name.trim(),
      });
      showToast("Account created successfully!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (isEmailAlreadyRegistered(err)) {
        setAccountExists(true);
        showToast("This email is already registered. Sign in with your password.", "info");
      } else {
        showToast(getApiErrorMessage(err, "Registration failed. Please try again."), "error");
      }
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
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-hero flex items-center justify-center">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">Create Account</h1>
          <p className="text-muted text-sm mt-1">Join MD &amp; V Laundry Shop</p>
        </div>

        {accountExists && (
          <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 space-y-3">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>{form.email}</strong> already has an account. You cannot register twice — sign in instead.
            </p>
            <Link
              to="/login"
              state={{ email: form.email.trim() }}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy-dark"
            >
              <LogIn className="w-4 h-4" /> Go to Sign In
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "name", label: "Full Name", type: "text" as const },
            { key: "email", label: "Email", type: "email" as const },
            { key: "phone", label: "Phone (optional)", type: "tel" as const },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              <input
                type={type}
                required={key !== "phone"}
                value={form[key as keyof typeof form]}
                onChange={(e) => {
                  setForm({ ...form, [key]: e.target.value });
                  if (key === "email") setAccountExists(false);
                }}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading || accountExists}
            className="w-full py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-dark flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            state={form.email ? { email: form.email.trim() } : undefined}
            className="text-sky font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
