// Tutr — TutorEarnings
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSupabaseQuery";
import { CountUp } from "@/components/CountUp";
import { EmptyState } from "@/components/EmptyState";
import { variants } from "@/lib/motion";

const TutorEarnings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: allSessions = [], isLoading } = useSessions(user?.id ?? "", "tutor");

  const completed = allSessions.filter((s: any) => s.status === "completed");
  const now = new Date();
  const thisMonth = completed.filter((s: any) => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalThisMonth = thisMonth.reduce((sum: number, s: any) => sum + Number(s.price), 0);
  const totalAllTime = completed.reduce((sum: number, s: any) => sum + Number(s.price), 0);

  return (
    <div className="px-5 pt-14 pb-8 relative z-10">
      {/* Header */}
      <p className="text-overline text-ink-muted mb-1">OVERVIEW</p>
      <h1 className="text-h1 font-display text-foreground mb-6">Earnings</h1>

      {/* Hero stat */}
      <div className="bg-surface rounded-xl border border-border p-6 text-center mb-4 relative overflow-hidden">
        {/* Accent gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-soft/30 to-transparent pointer-events-none" />
        <p className="text-caption text-ink-muted mb-2 relative">This month</p>
        <div className="flex items-baseline justify-center gap-1 relative">
          <span className="text-h2 text-ink-muted font-display">$</span>
          <CountUp
            value={totalThisMonth}
            decimals={0}
            duration={800}
            className="text-display text-foreground font-tabular"
          />
        </div>
        {totalAllTime > 0 && (
          <p className="text-caption text-ink-muted mt-2 relative">
            ${totalAllTime} total all time
          </p>
        )}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <CountUp value={completed.length} className="text-h2 font-display text-foreground font-semibold font-tabular" />
          <p className="text-caption text-ink-muted mt-0.5">Sessions done</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <CountUp value={thisMonth.length} className="text-h2 font-display text-foreground font-semibold font-tabular" />
          <p className="text-caption text-ink-muted mt-0.5">This month</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
          />
        </div>
      ) : completed.length > 0 ? (
        <>
          <p className="text-overline text-ink-muted mb-2">RECENT</p>
          <motion.div
            variants={variants.staggerChildren}
            initial="hidden"
            animate="visible"
            className="bg-surface rounded-xl border border-border divide-y divide-border"
          >
            {completed.slice(0, 10).map((s: any) => (
              <motion.div
                key={s.id}
                variants={variants.staggerItem}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div>
                  <p className="text-label font-medium text-foreground">
                    {s.student?.full_name || "Student"}
                  </p>
                  <p className="text-caption text-ink-muted mt-0.5">
                    {s.course?.code} ·{" "}
                    {new Date(s.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="font-display font-medium text-success text-body font-tabular">
                  +${Number(s.price)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="Your earnings start here."
          description="Accept your first request to begin building your income."
          action={{ label: "View requests", onClick: () => navigate("/tutor/requests") }}
        />
      )}
    </div>
  );
};

export default TutorEarnings;
