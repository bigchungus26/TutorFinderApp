import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { Sparkles, Search, Calendar, User } from "lucide-react";
import { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { tabVariants } from "@/lib/motion";
import { AmbientBackground } from "@/components/AmbientBackground";

const tabs = [
  { path: "/discover", icon: Sparkles, label: "Discover" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/sessions", icon: Calendar, label: "Sessions" },
  { path: "/profile", icon: User, label: "Profile" },
];

export const StudentLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  // Determine active tab path
  const activeTab = tabs.find(t =>
    t.path === "/discover"
      ? location.pathname === "/discover"
      : location.pathname.startsWith(t.path)
  )?.path ?? "/discover";

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-x-hidden">
      <AmbientBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-[392px]">
        <nav
          className="bg-surface rounded-2xl border border-hairline flex items-center justify-around px-2 py-2"
          style={{ boxShadow: "0 8px 32px rgba(20,20,20,0.10), 0 2px 8px rgba(20,20,20,0.06)" }}
          aria-label="Main navigation"
        >
          {tabs.map(tab => {
            const active = activeTab === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className="relative"
              >
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl"
                >
                  {active && (
                    <motion.div
                      layoutId="student-tab-indicator"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: "hsl(158 72% 36% / 0.12)" }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.7}
                    className={`relative z-10 transition-colors duration-150 ${active ? "text-accent" : "text-ink-subtle"}`}
                  />
                  <span
                    className={`text-caption relative z-10 font-medium transition-colors duration-150 ${active ? "text-accent" : "text-ink-subtle"}`}
                  >
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
