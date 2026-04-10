import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { Inbox, CalendarDays, DollarSign, User } from "lucide-react";
import { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { tabVariants } from "@/lib/motion";

const tabs = [
  { path: "/tutor/requests", icon: Inbox, label: "Requests" },
  { path: "/tutor/schedule", icon: CalendarDays, label: "Schedule" },
  { path: "/tutor/earnings", icon: DollarSign, label: "Earnings" },
  { path: "/tutor/profile", icon: User, label: "Profile" },
];

export const TutorLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const activeTab = tabs.find(t => location.pathname === t.path)?.path ?? "/tutor/requests";

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-x-hidden">
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
          className="bg-surface rounded-xl shadow-float border border-hairline flex items-center justify-around px-2 py-2"
          aria-label="Tutor navigation"
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
                  {active && (
                    <motion.div
                      layoutId="tutor-tab-indicator"
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
