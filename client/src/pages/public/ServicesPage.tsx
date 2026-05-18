import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Wind, Shirt, Truck, Package, type LucideIcon } from "lucide-react";
import PublicService from "../../services/PublicService";
import type { Service } from "../../interfaces/types";
import Skeleton from "../../components/ui/Skeleton";

const iconMap: Record<string, LucideIcon> = {
  droplets: Droplets, wind: Wind, shirt: Shirt, truck: Truck, package: Package,
};

const defaultServices = [
  { name: "Wash", description: "Professional washing with premium detergent", icon: "droplets" },
  { name: "Dry", description: "Gentle tumble dry for all fabric types", icon: "wind" },
  { name: "Fold", description: "Neatly folded and ready to wear", icon: "shirt" },
  { name: "Pickup", description: "Free pickup from your doorstep", icon: "truck" },
  { name: "Delivery", description: "Fast delivery back to your home", icon: "package" },
];

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PublicService.getServices()
      .then((res) => setServices(res.data.services))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const display = services.length ? services : defaultServices.map((s, i) => ({ ...s, id: i, price: 0, is_active: true }));

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy dark:text-white mb-4">Our Services</h1>
        <p className="text-muted max-w-lg mx-auto">Complete laundry care from pickup to delivery</p>
      </motion.div>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map((s, i) => {
            const Icon = iconMap[s.icon] || Droplets;
            return (
              <motion.div key={s.id ?? i} whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 card-shadow border border-border dark:border-slate-700 group cursor-default">
                <div className="w-16 h-16 rounded-2xl bg-sky-light dark:bg-sky/20 flex items-center justify-center mb-6 group-hover:bg-sky group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-8 h-8 text-navy dark:text-sky group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{s.name}</h3>
                <p className="text-muted text-sm">{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
