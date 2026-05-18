import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      showToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      showToast("Account created successfully!");
      navigate("/");
    } catch {
      showToast("Registration failed. Email may already exist.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface dark:bg-slate-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-8 card-shadow border border-border dark:border-slate-700">
        <div className="text-center mb-8">
          <motion.div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-hero flex items-center justify-center">
            <Droplets className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted text-sm mt-1">Join MD & V Laundry Shop</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "name", label: "Full Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "phone", label: "Phone", type: "tel" },
            { key: "password", label: "Password", type: "password" },
            { key: "password_confirmation", label: "Confirm Password", type: "password" },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              <input type={type} required value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-dark flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-muted mt-6">
          Already have an account? <Link to="/login" className="text-sky font-medium">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
