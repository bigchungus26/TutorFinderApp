// ============================================================
// SessionsPage — Part 2.14
// Upcoming and past sessions with review modal.
// Tab bar with spring pill indicator, stagger animations.
// ============================================================
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Video, MapPin, X, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions, useCreateReview } from "@/hooks/useSupabaseQuery";
import { SessionCardSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { StarRating } from "@/components/StarRating";
import { Avatar } from "@/components/Avatar";
import { springs, variants } from "@/lib/motion";
import { toast } from "@/components/ui/sonner";

// ── Types ────────────────────────────────────────────────────
type SessionWithDetails = {
  id: string;
  tutor_id: string;
  student_id: string;
  course_id: string;
  date: string;
  time: string;
  duration: number;
  location: "online" | "in-person";
  status: "upcoming" | "completed" | "cancelled";
  price: number;
  created_at: string;
  tutor: { full_name: string; avatar_url: string } | null;
  student: { full_name: string; avatar_url: string } | null;
  course: { code: string; name: string } | null;
};

// ── localStorage helpers ─────────────────────────────────────
const DISMISS_PREFIX = "tutr:dismissed-review-";
const isDismissed = (id: string) => localStorage.getItem(DISMISS_PREFIX + id) === "1";
const setDismissed = (id: string) => localStorage.setItem(DISMISS_PREFIX + id, "1");

// ── Review modal ─────────────────────────────────────────────
function ReviewModal({ session, onClose, onSuccess }: {
  session: SessionWithDetails;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const createReview = useCreateReview();

  const handleSubmit = useCallback(async () => {
    if (!user?.id || rating === 0) return;
    await createReview.mutateAsync({
      tutor_id: session.tutor_id,
      student_id: user.id,
      course_id: session.course_id,
      session_id: session.id,
      rating,
      comment,
    });
    setShowSuccess(true);
  }, [user, rating, comment, session, createReview]);

  return (
    <>
      <SuccessOverlay
        visible={showSuccess}
        title="Review submitted!"
        description="Thank you for your feedback."
        onDismiss={() => { setShowSuccess(false); setDismissed(session.id); onSuccess(); onClose(); }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-[80]"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        variants={variants.sheetIn}
        initial="hidden"
        animate="visible"
        exit={{ y: "100%", transition: { duration: 0.2 } }}
        className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
        style={{ maxHeight: "90dvh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Leave a review"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
          <h2 className="text-h2 font-display text-foreground">Leave a review</h2>
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={springs.snappy}
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl hover:bg-muted"
            aria-label="Close"
          >
            <X size={20} className="text-ink-muted" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
          {/* Tutor info */}
          <div className="flex items-center gap-3 bg-accent-light rounded-xl p-4">
            <Avatar src={session.tutor?.avatar_url} name={session.tutor?.full_name} size={44} />
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-foreground">{session.tutor?.full_name ?? "Tutor"}</p>
              <p className="text-body-sm text-ink-muted">{session.course?.code} — {session.course?.name}</p>
            </div>
          </div>

          {/* Stars */}
          <div>
            <p className="text-overline text-ink-muted mb-3">Your rating</p>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} size={36} />
            </div>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-body-sm text-ink-muted mt-2"
              >
                {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div>
            <p className="text-overline text-ink-muted mb-2">Comment <span className="normal-case text-body-sm">(optional)</span></p>
            <div className="relative">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value.slice(0, 500))}
                placeholder="Share what went well or what could improve…"
                rows={4}
                style={{ fontSize: "16px" }}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-ink-muted resize-none focus:outline-none focus:border-accent transition-colors"
              />
              <span className="absolute bottom-3 right-3 text-caption text-ink-muted">{comment.length}/500</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-border bg-surface">
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            onClick={handleSubmit}
            disabled={rating === 0 || createReview.isPending}
            className="w-full h-14 rounded-xl bg-accent text-white text-label font-semibold disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
          >
            {createReview.isPending ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Submitting…
              </>
            ) : "Submit review"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Review prompt card ───────────────────────────────────────
function ReviewPromptCard({ session, onSubmit, onDismiss }: {
  session: SessionWithDetails;
  onSubmit: (s: SessionWithDetails) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={springs.smooth}
      className="bg-accent-light rounded-xl border border-accent/20 p-4 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-label text-accent font-semibold mb-0.5">How was your session?</p>
          <p className="text-body-sm text-ink-muted">
            With {session.tutor?.full_name ?? "your tutor"} for {session.course?.code ?? "your course"}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          transition={springs.snappy}
          onClick={() => onDismiss(session.id)}
          className="p-1 rounded-lg hover:bg-accent/10 flex-shrink-0"
          aria-label="Skip review"
        >
          <X size={16} className="text-ink-muted" />
        </motion.button>
      </div>

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={springs.snappy}
          onClick={() => onSubmit(session)}
          className="flex-1 h-9 rounded-lg bg-accent text-white text-label font-medium"
        >
          Leave a review
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={springs.snappy}
          onClick={() => onDismiss(session.id)}
          className="px-4 h-9 rounded-lg border border-border text-ink-muted text-label"
        >
          Skip
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Session card ─────────────────────────────────────────────
function SessionCard({ session, showReviewButton, onReview }: {
  session: SessionWithDetails;
  showReviewButton?: boolean;
  onReview?: (s: SessionWithDetails) => void;
}) {
  const dateStr = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const statusStyle: Record<string, string> = {
    upcoming: "bg-accent-light text-accent",
    completed: "bg-muted text-ink-muted",
    cancelled: "bg-muted text-ink-muted opacity-60",
  };

  return (
    <motion.div variants={variants.staggerItem} className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={session.tutor?.avatar_url} name={session.tutor?.full_name} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-foreground truncate">{session.tutor?.full_name ?? "—"}</p>
          <p className="text-body-sm text-ink-muted truncate">{session.course?.code} — {session.course?.name}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium flex-shrink-0 ${statusStyle[session.status] ?? ""}`}>
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-ink-muted mb-3">
        <span className="flex items-center gap-1"><Calendar size={12} />{dateStr}</span>
        <span className="flex items-center gap-1"><Clock size={12} />{session.time}</span>
        <span className="flex items-center gap-1">
          {session.location === "online" ? <Video size={12} /> : <MapPin size={12} />}
          {session.location === "online" ? "Online" : "In-person"}
        </span>
        <span>{session.duration} min</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-body-sm text-ink-muted">${session.price?.toFixed(2) ?? "—"}</span>
        {session.status === "upcoming" && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={springs.snappy}
            className="px-4 py-1.5 rounded-lg bg-accent text-white text-label font-medium"
          >
            {session.location === "online" ? "Join" : "Details"}
          </motion.button>
        )}
        {session.status === "completed" && showReviewButton && onReview && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={springs.snappy}
            onClick={() => onReview(session)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-border text-label text-foreground hover:bg-muted transition-colors"
          >
            <Star size={14} className="text-accent" />
            Review
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────
const SessionsPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [reviewSession, setReviewSession] = useState<SessionWithDetails | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const { data: allSessions = [], isLoading, refetch } = useSessions(user?.id ?? "", "student");

  const completedSessions = (allSessions as SessionWithDetails[]).filter(s => s.status === "completed");
  const reviewPromptSession = completedSessions.find(s => {
    if (isDismissed(s.id) || dismissedIds.has(s.id)) return false;
    const diff = (Date.now() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }) ?? null;

  const upcoming = (allSessions as SessionWithDetails[]).filter(s => s.status === "upcoming");
  const past = (allSessions as SessionWithDetails[]).filter(s => s.status === "completed" || s.status === "cancelled");
  const sessions = tab === "upcoming" ? upcoming : past;

  const handleDismissReview = useCallback((id: string) => {
    setDismissed(id);
    setDismissedIds(prev => new Set([...prev, id]));
  }, []);

  const handleReviewSuccess = useCallback(() => {
    if (reviewSession) setDismissedIds(prev => new Set([...prev, reviewSession.id]));
    refetch();
  }, [reviewSession, refetch]);

  // Pull to refresh
  const startY = useRef(0);
  const pulling = useRef(false);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop === 0) { startY.current = e.touches[0].clientY; pulling.current = true; }
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!pulling.current) return;
    if (e.changedTouches[0].clientY - startY.current > 60) { refetch(); toast("Refreshed"); }
    pulling.current = false;
  }, [refetch]);

  return (
    <>
      <div
        className="px-5 pt-14 pb-24 overflow-y-auto h-full"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <h1 className="text-h1 font-display text-foreground mb-5">Sessions</h1>

        {/* Tab bar */}
        <div className="flex gap-1 mb-5 bg-muted rounded-full p-1">
          {(["upcoming", "past"] as const).map(t => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 h-8 rounded-full text-label font-medium capitalize transition-colors relative"
            >
              {tab === t && (
                <motion.div
                  layoutId="session-tab-pill"
                  className="absolute inset-0 bg-surface rounded-full shadow-xs"
                  transition={springs.smooth}
                />
              )}
              <span className={`relative z-10 ${tab === t ? "text-foreground" : "text-ink-muted"}`}>
                {t}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Review prompt */}
        <AnimatePresence>
          {!isLoading && reviewPromptSession && (
            <ReviewPromptCard
              key={reviewPromptSession.id}
              session={reviewPromptSession}
              onSubmit={s => setReviewSession(s)}
              onDismiss={handleDismissReview}
            />
          )}
        </AnimatePresence>

        {/* Sessions list */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => <SessionCardSkeleton key={i} />)}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={tab === "upcoming" ? "No upcoming sessions" : "No past sessions"}
            description={
              tab === "upcoming"
                ? "Book a tutor to get started."
                : "Your completed sessions will appear here."
            }
          />
        ) : (
          <motion.div
            className="space-y-3"
            variants={variants.staggerChildren}
            initial="hidden"
            animate="visible"
          >
            {sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session as SessionWithDetails}
                showReviewButton={!isDismissed(session.id) && !dismissedIds.has(session.id)}
                onReview={s => setReviewSession(s)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Review modal */}
      <AnimatePresence>
        {reviewSession && (
          <ReviewModal
            key="review-modal"
            session={reviewSession}
            onClose={() => setReviewSession(null)}
            onSuccess={handleReviewSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SessionsPage;
