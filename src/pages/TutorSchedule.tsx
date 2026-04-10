// ── TutorSchedule — Sessions + Availability Editor ────────────
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Video, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions, useUpdateSession } from "@/hooks/useSupabaseQuery";
import { useAvailability, useUpsertAvailability, useToggleAvailabilitySlot } from "@/hooks/useAvailability";
import type { AvailabilitySlot } from "@/hooks/useAvailability";
import { variants } from "@/lib/motion";

// ── Constants ──────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS_DISPLAY = [
  "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
  "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
  "6 PM", "7 PM", "8 PM", "9 PM",
];
const HOURS_24 = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

const cellKey = (dayIdx: number, hourIdx: number) => `${dayIdx}-${hourIdx}`;

function slotToKey(slot: AvailabilitySlot): string {
  const dayIdx = slot.day_of_week;
  const hourIdx = HOURS_24.indexOf(slot.start_time.slice(0, 5));
  return cellKey(dayIdx, hourIdx);
}

// ── Helpers ────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function statusColor(status: string) {
  if (status === "upcoming") return "bg-accent-soft text-accent";
  if (status === "completed") return "bg-surface text-ink-muted border border-hairline";
  if (status === "cancelled") return "bg-red-50 text-red-500";
  return "bg-surface text-ink-muted";
}

// ── Avatar ─────────────────────────────────────────────────────
function Avatar({ name, url }: { name: string; url?: string | null }) {
  if (url) {
    return <img src={url} alt={name} className="w-11 h-11 rounded-full object-cover" />;
  }
  return (
    <div className="w-11 h-11 rounded-full bg-accent-soft flex items-center justify-center">
      <span className="text-label font-semibold text-accent">{initials(name)}</span>
    </div>
  );
}

// ── Session Card ───────────────────────────────────────────────
function SessionCard({ session, onMarkCompleted }: {
  session: any;
  onMarkCompleted: (id: string) => void;
}) {
  const studentName = session.student?.full_name ?? "Student";
  const courseName = session.course?.code ?? "—";
  const isUpcoming = session.status === "upcoming";

  return (
    <motion.div
      variants={variants.staggerItem}
      className="bg-surface border border-hairline rounded-xl p-4 relative overflow-hidden"
    >
      {/* Subtle accent strip for upcoming */}
      {isUpcoming && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-xl" />
      )}

      <div className="flex items-start gap-3 pl-2">
        <Avatar name={studentName} url={session.student?.avatar_url} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-label font-semibold text-ink truncate">{studentName}</span>
            <span
              className={`text-caption px-2 py-0.5 rounded-pill font-medium ${statusColor(session.status)}`}
            >
              {session.status}
            </span>
          </div>
          <p className="text-body-sm text-accent font-medium mb-1">{courseName}</p>
          <div className="flex items-center gap-3 text-caption text-ink-muted flex-wrap">
            <span>{formatDate(session.date)}</span>
            {session.time && <span>{session.time}</span>}
            {session.duration && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {session.duration}h
              </span>
            )}
            {session.location === "online" ? (
              <span className="flex items-center gap-1 bg-accent-soft text-accent px-2 py-0.5 rounded-pill">
                <Video size={11} />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-surface border border-hairline px-2 py-0.5 rounded-pill">
                <MapPin size={11} />
                In-person
              </span>
            )}
          </div>
        </div>
      </div>

      {isUpcoming && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onMarkCompleted(session.id)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-soft text-accent text-label font-semibold border border-accent/20"
        >
          <CheckCircle2 size={15} />
          Mark completed
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Availability Grid ──────────────────────────────────────────
function AvailabilityGrid({ tutorId }: { tutorId: string }) {
  const { data: savedSlots = [] } = useAvailability(tutorId);
  const upsertAvailability = useUpsertAvailability();
  const toggleSlot = useToggleAvailabilitySlot();

  // Local optimistic state: map of "dayIdx-hourIdx" → {active, slotId?}
  const [localGrid, setLocalGrid] = useState<Record<string, { active: boolean; slotId?: string }>>({});
  const [dirty, setDirty] = useState(false);

  // Sync from server on load
  useEffect(() => {
    const grid: Record<string, { active: boolean; slotId?: string }> = {};
    savedSlots.forEach(slot => {
      const key = slotToKey(slot);
      grid[key] = { active: true, slotId: slot.id };
    });
    setLocalGrid(grid);
    setDirty(false);
  }, [savedSlots]);

  const handleToggle = (dayIdx: number, hourIdx: number) => {
    const key = cellKey(dayIdx, hourIdx);
    const current = localGrid[key];
    const nowActive = !current?.active;

    // Optimistic update
    setLocalGrid(prev => ({
      ...prev,
      [key]: { ...current, active: nowActive },
    }));
    setDirty(true);

    // Sync to server
    const slot: Omit<AvailabilitySlot, "id"> = {
      tutor_id: tutorId,
      day_of_week: dayIdx,
      start_time: HOURS_24[hourIdx],
      end_time: HOURS_24[hourIdx + 1] ?? "22:00",
    };

    toggleSlot.mutate({
      tutorId,
      slot,
      existingId: current?.slotId,
    });
  };

  const handleSaveAll = () => {
    const slots = Object.entries(localGrid)
      .filter(([, v]) => v.active)
      .map(([key]) => {
        const [dayStr, hourStr] = key.split("-");
        const dayIdx = parseInt(dayStr, 10);
        const hourIdx = parseInt(hourStr, 10);
        return {
          tutor_id: tutorId,
          day_of_week: dayIdx,
          start_time: HOURS_24[hourIdx],
          end_time: HOURS_24[hourIdx + 1] ?? "22:00",
        };
      });
    upsertAvailability.mutate({ tutorId, slots });
    setDirty(false);
  };

  const activeCount = Object.values(localGrid).filter(v => v.active).length;

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-caption text-ink-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-accent-soft border border-accent" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-surface border border-hairline" />
          <span>Unavailable</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <div className="min-w-[520px]">
          {/* Day headers */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
            <div />
            {DAYS.map(d => (
              <div key={d} className="text-caption font-semibold text-ink-muted text-center py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS_DISPLAY.map((label, hi) => (
            <div
              key={hi}
              className="grid gap-1 mb-1"
              style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}
            >
              <div className="text-caption text-ink-muted flex items-center justify-end pr-2 whitespace-nowrap text-right">
                {label}
              </div>
              {DAYS.map((_, di) => {
                const key = cellKey(di, hi);
                const { active } = localGrid[key] ?? { active: false };
                return (
                  <motion.button
                    key={di}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleToggle(di, hi)}
                    className={`h-8 rounded-md border transition-all duration-150 ${
                      active
                        ? "bg-accent-soft border-accent shadow-sm"
                        : "bg-surface border-hairline hover:bg-accent-soft/40"
                    }`}
                    aria-label={`${DAYS[di]} ${label} — ${active ? "remove" : "add"} slot`}
                    aria-pressed={active}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="text-caption text-ink-muted text-center mt-3 mb-4">
        {activeCount} slot{activeCount !== 1 ? "s" : ""} selected
      </p>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSaveAll}
        disabled={!dirty && !upsertAvailability.isPending}
        className="w-full h-12 rounded-xl bg-accent text-accent-foreground text-label font-semibold disabled:opacity-40 transition-opacity"
      >
        {upsertAvailability.isPending ? "Saving…" : "Save changes"}
      </motion.button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
const TutorSchedule = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"sessions" | "availability">("sessions");

  const { data: sessions = [], isLoading } = useSessions(user?.id ?? "", "tutor");
  const updateSession = useUpdateSession();

  const handleMarkCompleted = (id: string) => {
    updateSession.mutate({ id, status: "completed" });
  };

  const upcomingSessions = sessions.filter(s => s.status === "upcoming");
  const pastSessions = sessions.filter(s => s.status !== "upcoming");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-display-md text-ink">Schedule</h1>
        <p className="text-body-sm text-ink-muted mt-1">Manage your sessions and weekly availability</p>
      </div>

      {/* Tab bar */}
      <div className="px-5 mb-5">
        <div className="flex bg-surface border border-hairline rounded-xl p-1 gap-1">
          {(["sessions", "availability"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-label capitalize font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-ink-muted"
              }`}
            >
              {tab === "sessions" ? "My Sessions" : "Availability"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "sessions" ? (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="px-5"
          >
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-surface border border-hairline rounded-xl p-4 animate-pulse h-24" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-accent-soft mx-auto mb-4 flex items-center justify-center">
                  <Clock size={28} className="text-accent" />
                </div>
                <p className="text-body-sm text-ink-muted">No sessions yet. Students will appear here once they book you.</p>
              </div>
            ) : (
              <>
                {upcomingSessions.length > 0 && (
                  <>
                    <p className="text-label text-ink-muted mb-3 uppercase tracking-wide text-caption">Upcoming</p>
                    <motion.div
                      variants={variants.staggerChildren}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3 mb-6"
                    >
                      {upcomingSessions.map(s => (
                        <SessionCard
                          key={s.id}
                          session={s}
                          onMarkCompleted={handleMarkCompleted}
                        />
                      ))}
                    </motion.div>
                  </>
                )}
                {pastSessions.length > 0 && (
                  <>
                    <p className="text-label text-ink-muted mb-3 uppercase tracking-wide text-caption">Past</p>
                    <motion.div
                      variants={variants.staggerChildren}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3"
                    >
                      {pastSessions.map(s => (
                        <SessionCard
                          key={s.id}
                          session={s}
                          onMarkCompleted={handleMarkCompleted}
                        />
                      ))}
                    </motion.div>
                  </>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="availability"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="px-5"
          >
            {user ? (
              <AvailabilityGrid tutorId={user.id} />
            ) : (
              <p className="text-body-sm text-ink-muted text-center py-10">Please log in to manage availability.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorSchedule;
