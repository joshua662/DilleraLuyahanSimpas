import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Wash-Dry-Fold",
    price: "₱99",
    unit: "/ 8kg",
    popular: true,
    features: ["Wash, dry & fold", "Up to 8kg included", "Free pickup", "₱12 per extra kg"],
  },
  {
    name: "Extra Weight",
    price: "₱12",
    unit: "/ kg",
    popular: false,
    features: ["Beyond 8kg base", "Same quality service", "Accurate weighing", "Transparent pricing"],
  },
  {
    name: "Delivery",
    price: "₱50",
    unit: "/ trip",
    popular: false,
    features: ["Door-to-door delivery", "Fast turnaround", "Secure handling", "SMS updates"],
  },
];

const PricingPage = () => (
  <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
      <h1 className="text-4xl font-bold text-navy dark:text-white mb-4">Simple Pricing</h1>
      <p className="text-muted">No hidden fees. Pay only for what you need.</p>
    </motion.div>
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan, i) => (
        <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className={`relative rounded-2xl p-8 card-shadow border-2 ${plan.popular ? "border-sky bg-white dark:bg-slate-800 scale-105" : "border-border dark:border-slate-700 bg-white dark:bg-slate-800"}`}>
          {plan.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-sky text-navy text-xs font-bold rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" /> Most Popular
            </span>
          )}
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="mb-6">
            <span className="text-4xl font-black text-navy dark:text-sky">{plan.price}</span>
            <span className="text-muted">{plan.unit}</span>
          </div>
          <ul className="space-y-3 mb-8">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-sky shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Link to="/contact" className={`block text-center py-3 rounded-xl font-semibold transition ${plan.popular ? "bg-navy text-white hover:bg-navy-dark" : "border border-navy text-navy dark:text-sky dark:border-sky hover:bg-sky-light dark:hover:bg-sky/10"}`}>
            Contact Us
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

export default PricingPage;
