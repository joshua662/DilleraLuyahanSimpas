import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import FloatingButtons from "../components/ui/FloatingButtons";
import MobileBottomNav from "../components/layout/MobileBottomNav";

const PublicLayout = () => (
  <motion.div className="min-h-screen flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <Navbar />
    <main className="flex-1 pb-24 md:pb-0">
      <Outlet />
    </main>
    <Footer />
    <FloatingButtons />
    <MobileBottomNav />
  </motion.div>
);

export default PublicLayout;
