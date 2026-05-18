import { Droplets, Phone, MapPin } from "lucide-react";
import { BUSINESS } from "../../utils/constants";

const Footer = () => (
  <footer className="bg-navy text-white mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Droplets className="w-8 h-8 text-sky" />
        <span className="font-bold text-lg">{BUSINESS.name}</span>
      </div>
      <div className="flex flex-col items-center gap-2 text-sm text-slate-300">
        <a href={BUSINESS.phoneLink} className="flex items-center gap-2 hover:text-sky transition-colors">
          <Phone className="w-4 h-4" /> {BUSINESS.phone}
        </a>
        <p className="flex items-center gap-2 max-w-md mx-auto">
          <MapPin className="w-4 h-4 shrink-0" /> {BUSINESS.address}
        </p>
      </div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-sm text-slate-400">
      © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
    </div>
  </footer>
);

export default Footer;