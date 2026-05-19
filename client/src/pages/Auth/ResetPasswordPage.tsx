import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, Loader2, ArrowLeft } from "lucide-react";
import AuthService from "../../services/AuthService";
import { useToast } from "../../contexts/ToastContext";
import PasswordInput from "../../components/ui/PasswordInput";
import { getApiErrorMessage } from "../../utils/apiError";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: searchParams.get("email") ?? "",
    token: searchParams.get("token") ?? "",
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      showToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await AuthService.resetPassword(form);
      showToast(res.data.message);
      navigate("/login", { replace: true });
    } catch (err) {
      showToast(getApiErrorMessage(err, "Could not reset password."), "error");
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
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-hero flex items-center justify-center">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">New Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New Password</label>
            <PasswordInput
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
            <PasswordInput
              required
              minLength={6}
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy text-white font-semibold rounded-xl disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Update Password"}
          </button>
          <Link to="/login" className="flex justify-center gap-2 text-sm text-muted hover:text-sky">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
