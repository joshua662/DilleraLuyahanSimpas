import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Phone, Sparkles, Truck, Shield } from "lucide-react";
import BubbleBackground from "../../components/ui/BubbleBackground";
import { BUSINESS } from "../../utils/constants";
import { sendSmsToShop } from "../../utils/sms";

const features = [
  { icon: Truck, title: "Free Pickup", desc: "We collect from your doorstep" },
  { icon: Sparkles, title: "Premium Clean", desc: "Professional wash & fold" },
  { icon: Shield, title: "Trusted Service", desc: "Satisfaction guaranteed" },
];

const HomePage = () => (
  <>
    <section className="relative gradient-hero text-white overflow-hidden min-h-[85vh] flex items-center">
      <BubbleBackground />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur">
            Roxas City&apos;s Trusted Laundry
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Fresh & Clean<br />
            <span className="text-sky-light">Laundry Delivered</span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mb-8">
            Book pickup online. We wash, dry, fold, and deliver — with SMS updates every step.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/booking" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy font-semibold rounded-xl hover:bg-sky-light transition">
              Book Pickup <ArrowRight className="w-5 h-5" />
            </Link>
            <a href={BUSINESS.phoneLink} className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 rounded-xl hover:bg-white/10 transition">
              <Phone className="w-5 h-5" /> Contact Now
            </a>
            <button type="button" onClick={() => sendSmsToShop()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky text-navy font-semibold rounded-xl hover:bg-sky-light transition">
              <MessageSquare className="w-5 h-5" /> Send SMS
            </button>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="bg-sky text-navy py-4">
      <motion.div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
        <span className="text-2xl font-black">₱99</span>
        <span className="font-semibold">per 8KG — Wash, Dry & Fold Package</span>
        <Link to="/pricing" className="underline font-medium hover:no-underline">View pricing →</Link>
      </motion.div>
    </section>

    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            viewport={{ once: true }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 card-shadow text-center">
            <motion.div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sky-light dark:bg-sky/20 flex items-center justify-center">
              <f.icon className="w-7 h-7 text-navy dark:text-sky" />
            </motion.div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-muted text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    <section className="py-16 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready for Fresh Laundry?</h2>
        <p className="text-white/70 mb-8 max-w-md mx-auto">Schedule your pickup in under 2 minutes.</p>
        <Link to="/booking" className="inline-flex items-center gap-2 px-8 py-4 bg-sky text-navy font-bold rounded-xl hover:bg-sky-light transition">
          Book Now <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  </>
);

export default HomePage;
