import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Phone, Clock, MapPin, MessageSquare, Send } from "lucide-react";
import { BUSINESS } from "../../utils/constants";
import { useToast } from "../../contexts/ToastContext";
import { sendSmsToShop } from "../../utils/sms";

const ContactPage = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    showToast("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 pb-28 md:pb-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy dark:text-white mb-4">Contact Us</h1>
        <p className="text-muted">We&apos;re here to help with your laundry needs</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[
            { icon: Phone, label: "Phone", value: BUSINESS.phone, href: BUSINESS.phoneLink },
            { icon: Clock, label: "Hours", value: BUSINESS.hours },
            { icon: MapPin, label: "Location", value: BUSINESS.address },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4 bg-white dark:bg-slate-800 rounded-xl p-5 card-shadow">
              <item.icon className="w-6 h-6 text-sky shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="font-semibold hover:text-sky">{item.value}</a>
                ) : (
                  <p className="font-semibold">{item.value}</p>
                )}
              </div>
            </div>
          ))}
          <div className="grid sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => sendSmsToShop()}
              className="flex items-center justify-center gap-2 py-4 bg-sky text-navy rounded-xl font-semibold hover:bg-sky-light">
              <MessageSquare className="w-5 h-5" /> Send SMS
            </button>
            <a href={BUSINESS.phoneLink}
              className="flex items-center justify-center gap-2 py-4 bg-navy text-white rounded-xl font-semibold hover:bg-navy-dark">
              <Phone className="w-5 h-5" /> Call Now
            </a>
          </div>
          <div className="rounded-xl overflow-hidden h-64 card-shadow">
            <iframe src={BUSINESS.mapEmbed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Map" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 card-shadow border border-border dark:border-slate-700 space-y-4">
          <h2 className="text-xl font-bold mb-2">Send a Message</h2>
          {["name", "email"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1.5 capitalize">{field}</label>
              <input type={field === "email" ? "email" : "text"} required value={form[field as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1.5">Message</label>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none" />
          </div>
          <button type="submit" className="w-full py-3 bg-navy text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-navy-dark">
            <Send className="w-5 h-5" /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
