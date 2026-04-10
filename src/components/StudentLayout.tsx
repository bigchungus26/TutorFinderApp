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
    <div className="min-h-[100dvh] bg-background relative overflow-x-hidden flex flex-col md:flex-row">
      {/* ── Mobile bottom nav ────────────────────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-[392px] md:hidden">
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

      {/* ── Desktop sidebar nav ──────────────────────────── */}
      <nav className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-hairline md:bg-surface md:fixed md:h-screen md:left-0 md:top-0 md:pt-6 md:px-4 md:z-40">
        <div className="mb-8">
          <span className="text-lg font-body font-semibold text-accent tracking-wide uppercase">Tutr</span>
        </div>
        <div className="space-y-2 flex-1">
          {tabs.map(tab => {
            const active = activeTab === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="relative"
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-ink-muted hover:bg-accent-soft/50 hover:text-accent"
                  }`}
                >
                  <tab.icon size={20} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Main content area ────────────────────────────── */}
      <div className="flex-1 md:ml-64 w-full md:w-auto">
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
      </div>
    </div>
  );
};
