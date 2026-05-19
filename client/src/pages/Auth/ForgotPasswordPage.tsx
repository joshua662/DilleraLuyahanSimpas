import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, Loader2, ArrowLeft } from "lucide-react";
import AuthService from "../../services/AuthService";
import { useToast } from "../../contexts/ToastContext";
import { getApiErrorMessage } from "../../utils/apiError";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword({ email: email.trim() });
      setSent(true);
      showToast(res.data.message, "info");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Could not send reset email."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-8 card-shadow border border-border dark:border-slate-700"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-hero flex items-center justify-center">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-navy dark:text-white">Recover Account</h1>
        </div>
        {sent ? (
          <div className="space-y-4 text-center text-sm">
            <p className="text-muted">If registered, check your email for a reset link.</p>
            <Link to="/login" className="inline-flex items-center gap-2 text-sky font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky text-navy font-semibold rounded-xl disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Reset Link"}
            </button>
            <Link to="/login" className="flex justify-center gap-2 text-sm text-muted hover:text-sky">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
