import { motion } from "framer-motion";
import { Heart, Target, Award } from "lucide-react";

const AboutPage = () => (
  <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
      <h1 className="text-4xl font-bold text-navy dark:text-white mb-4">About MD & V Laundry</h1>
      <p className="text-muted max-w-2xl mx-auto">Serving Luyahan, Simpas and Dillera with quality laundry care since day one.</p>
    </motion.div>

    <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl font-bold mb-4">Our Story</h2>
        <p className="text-muted leading-relaxed mb-4">
          MD & V Laundry Shop started with a simple mission: make laundry convenient for busy families and professionals in our community. What began as a small neighborhood service has grown into a trusted name for quality wash, dry, and fold.
        </p>
        <p className="text-muted leading-relaxed">
          We believe everyone deserves fresh, clean clothes without the hassle. That&apos;s why we offer pickup and delivery — so you can spend time on what truly matters.
        </p>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
        className="gradient-hero rounded-2xl p-12 text-white text-center">
        <p className="text-5xl font-black mb-2">₱99</p>
        <p className="text-xl font-semibold">per 8KG Package</p>
        <p className="text-white/70 mt-2">Wash • Dry • Fold</p>
      </motion.div>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {[
        { icon: Target, title: "Our Mission", desc: "Deliver spotless laundry with convenience, affordability, and care." },
        { icon: Heart, title: "Our Values", desc: "Honesty, quality, and respect for every customer's garments." },
        { icon: Award, title: "Why Choose Us", desc: "Affordable pricing, reliable pickup, and satisfaction guaranteed." },
      ].map((item, i) => (
        <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 card-shadow text-center">
          <item.icon className="w-10 h-10 text-sky mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">{item.title}</h3>
          <p className="text-muted text-sm">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export default AboutPage;
