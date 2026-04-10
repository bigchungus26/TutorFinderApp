import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { Sparkles, Search, Calendar, User } from "lucide-react";
import { ReactNode } from "react";
import { Footer } from "@/components/Footer";

const tabs = [
  { path: "/", icon: Sparkles, label: "Discover" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/sessions", icon: Calendar, label: "Sessions" },
  { path: "/profile", icon: User, label: "Profile" },
];

export const StudentLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background relative pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-[392px]">
        <nav className="bg-surface rounded-xl shadow-float border border-hairline flex items-center justify-around px-2 py-2" aria-label="Main navigation">
          {tabs.map(tab => {
            const active = location.pathname === tab.path;
            return (
              <Link key={tab.path} to={tab.path} aria-label={tab.label}>
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${active ? "text-accent" : "text-muted-ink"}`}
                >
                  <tab.icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-caption font-body font-medium">{tab.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
