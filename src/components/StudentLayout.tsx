import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { Sparkles, Search, Calendar, User, Bell } from "lucide-react";
import { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { tabVariants } from "@/lib/motion";

const tabs = [
  { path: "/", icon: Sparkles, label: "Discover" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/sessions", icon: Calendar, label: "Sessions" },
  { path: "/profile", icon: User, label: "Profile" },
];

export const StudentLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  // Determine active tab path
  const activeTab = tabs.find(t =>
    t.path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(t.path)
  )?.path ?? "/";

  return (
    <div className="min-h-screen bg-background relative pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <Footer />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-[392px]">
        <nav
          className="bg-surface rounded-xl shadow-float border border-hairline flex items-center justify-around px-2 py-2"
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
                  whileTap={{ scale: 0.92 }}
                  className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl"
                >
                  {/* Active indicator pill */}
                  {active && (
                    <motion.div
                      layoutId="student-tab-indicator"
                      className="absolute inset-0 rounded-xl bg-accent-soft"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    size={22}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={`relative z-10 transition-colors ${active ? "text-accent" : "text-ink-subtle"}`}
                  />
                  <span
                    className={`text-caption relative z-10 transition-colors ${active ? "text-accent" : "text-ink-subtle"}`}
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
