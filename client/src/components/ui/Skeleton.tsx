import { motion } from "framer-motion";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <motion.div className="bg-white dark:bg-slate-800 rounded-2xl p-6 card-shadow">
    <Skeleton className="h-4 w-1/3 mb-4" />
    <Skeleton className="h-8 w-1/2 mb-2" />
    <Skeleton className="h-3 w-full" />
  </motion.div>
);

export default Skeleton;
