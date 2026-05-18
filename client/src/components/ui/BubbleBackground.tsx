import { motion } from "framer-motion";

const bubbles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 20 + Math.random() * 60,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  duration: 8 + Math.random() * 8,
}));

const BubbleBackground = () => (
  <motion.div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    {bubbles.map((b) => (
      <motion.span
        key={b.id}
        className="absolute rounded-full bg-white/10 backdrop-blur-sm"
        style={{ width: b.size, height: b.size, left: b.left, bottom: -b.size }}
        animate={{ y: [0, -window.innerHeight - b.size], opacity: [0.3, 0.6, 0] }}
        transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "linear" }}
      />
    ))}
  </motion.div>
);

export default BubbleBackground;
