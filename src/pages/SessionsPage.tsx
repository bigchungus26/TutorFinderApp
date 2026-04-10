// ============================================================
// Teachme — SessionsPage (Student)
// Shows upcoming and past sessions with a review prompt (C5).
// Pull-to-refresh, skeleton loading, empty states.
// ============================================================
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Video, MapPin, X, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSessions,
  useReviews,
  useCreateReview,
} from "@/hooks/useSupabaseQuery";
import { SessionCardSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { StarRating } from "@/components/StarRating";
import { variants, transitions } from "@/lib/motion";
import { toast } from "@/components/ui/sonner";

// ── Types ──────────────────────────────────────────────────────
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

// ── localStorage helpers ───────────────────────────────────────
const DISMISS_PREFIX = "teachme:dismissed-review-";

function isDismissed(sessionId: string): boolean {
  return localStorage.getItem(DISMISS_PREFIX + sessionId) === "1";
}

function setDismissed(sessionId: string): void {
  localStorage.setItem(DISMISS_PREFIX + sessionId, "1");
}

// ── Review Modal ───────────────────────────────────────────────
interface ReviewModalProps {
  session: SessionWithDetails;
  onClose: () => void;
  onSuccess: () => void;
}

function ReviewModal({ session, onClose, onSuccess }: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const createReview = useCreateReview();

  const handleSubmit = useCallback(async () => {
    if (!user?.id || rating === 0 || !session.tutor_id || !session.course_id) return;
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

  const handleSuccessDismiss = useCallback(() => {
    setShowSuccess(false);
    setDismissed(session.id);
    onSuccess();
    onClose();
  }, [session.id, onSuccess, onClose]);

  return (
    <>
      <SuccessOverlay
        visible={showSuccess}
        title="Review submitted!"
        description="Thank you for your feedback."
        onDismiss={handleSuccessDismiss}
      />

      {/* Backdrop */}
      <motion.div
        key="review-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitions.standard}
        className="fixed inset-0 bg-foreground/30 z-[80]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <motion.div
        key="review-sheet"
        variants={variants.sheetIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
        style={{ maxHeight: "90dvh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Leave a review"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-hairline" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
          <h2 className="text-display-sm text-ink">Leave a review</h2>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl hover:bg-muted"
            aria-label="Close"
          >
            <X size={20} className="text-ink-muted" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-6">
          {/* Tutor info */}
          <div className="flex items-center gap-3 bg-accent-soft rounded-xl p-4">
            <img
              src={session.tutor?.avatar_url || "https://i.pravatar.cc/100"}
              alt={session.tutor?.full_name ?? "Tutor"}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-ink">
                {session.tutor?.full_name ?? "Tutor"}
              </p>
              <p className="text-body-sm text-ink-muted">
                {session.course?.code} — {session.course?.name}
              </p>
            </div>
          </div>

          {/* Star picker */}
          <div>
            <p className="text-caption text-ink-muted uppercase tracking-wider mb-3">
              Your rating
            </p>
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

          {/* Comment textarea */}
          <div>
            <p className="text-caption text-ink-muted uppercase tracking-wider mb-2">
              Comments <span className="normal-case">(optional)</span>
            </p>
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Share what went well or what could improve…"
                rows={4}
                className="w-full rounded-xl border border-hairline bg-background px-4 py-3 text-body text-ink placeholder:text-ink-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
              />
              <span className="absolute bottom-3 right-3 text-caption text-ink-muted">
                {comment.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-hairline bg-surface">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={rating === 0 || createReview.isPending}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground text-body font-semibold disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
          >
            {createReview.isPending ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full"
                />
                Submitting…
              </>
            ) : (
              "Submit review"
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Review Prompt Card ─────────────────────────────────────────
interface ReviewPromptProps {
  session: SessionWithDetails;
  onSubmit: (session: SessionWithDetails) => void;
  onDismiss: (sessionId: string) => void;
}

function ReviewPromptCard({ session, onSubmit, onDismiss }: ReviewPromptProps) {
  const [inlineRating, setInlineRating] = useState(0);

  const handleInlineRatingChange = (r: number) => {
    setInlineRating(r);
    onSubmit(session);
  };

  return (
    <motion.div
      variants={variants.fadeSlideDown}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-accent-soft rounded-xl border border-accent/20 p-4 mb-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-label text-accent font-semibold mb-0.5">
            How was your session?
          </p>
          <p className="text-body-sm text-ink-muted">
            With {session.tutor?.full_name ?? "your tutor"} for{" "}
            {session.course?.code ?? "your course"}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => onDismiss(session.id)}
          className="p-1 rounded-lg hover:bg-accent/10 flex-shrink-0"
          aria-label="Skip review"
        >
          <X size={16} className="text-ink-muted" />
        </motion.button>
      </div>

      {/* Inline star rating */}
      <div className="flex items-center gap-3 mb-3">
        <StarRating
          value={inlineRating}
          onChange={handleInlineRatingChange}
          size={28}
        />
        <span className="text-body-sm text-ink-muted">
          {inlineRating > 0 ? ["", "Poor", "Fair", "Good", "Great", "Excellent"][inlineRating] : "Tap to rate"}
        </span>
      </div>

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onSubmit(session)}
          className="flex-1 h-9 rounded-lg bg-accent text-accent-foreground text-label font-medium"
        >
          Leave a review
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onDismiss(session.id)}
          className="px-4 h-9 rounded-lg border border-hairline text-ink-muted text-label"
        >
          Skip
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Session Card ───────────────────────────────────────────────
interface SessionCardProps {
  session: SessionWithDetails;
  showReviewButton?: boolean;
  onReview?: (session: SessionWithDetails) => void;
}

function SessionCard({ session, showReviewButton, onReview }: SessionCardProps) {
  const dateStr = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const statusColors: Record<string, string> = {
    upcoming: "bg-accent-soft text-accent",
    completed: "bg-muted text-ink-muted",
    cancelled: "bg-muted text-ink-muted line-through",
  };

  return (
    <motion.div
      variants={variants.staggerItem}
      className="bg-surface rounded-xl border border-hairline p-4"
    >
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={session.tutor?.avatar_url || "https://i.pravatar.cc/100"}
          alt={session.tutor?.full_name ?? "Tutor"}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-ink truncate">
            {session.tutor?.full_name ?? "—"}
          </p>
          <p className="text-body-sm text-ink-muted truncate">
            {session.course?.code} — {session.course?.name}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-pill text-caption font-medium ${statusColors[session.status] ?? ""}`}
        >
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </span>
      </div>

      {/* Detail row */}
      <div className="flex flex-wrap items-center gap-3 text-body-sm text-ink-muted mb-3">
        <span className="flex items-center gap-1">
          <Calendar size={13} />
          {dateStr}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={13} />
          {session.time}
        </span>
        <span className="flex items-center gap-1">
          {session.location === "online" ? (
            <Video size={13} />
          ) : (
            <MapPin size={13} />
          )}
          {session.location === "online" ? "Online" : "In-person"}
        </span>
        <span className="text-body-sm text-ink-muted">
          {session.duration} min
        </span>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-ink-muted">
          ${session.price?.toFixed(2) ?? "—"}
        </span>
        {session.status === "upcoming" && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-label font-medium"
          >
            {session.location === "online" ? "Join" : "Details"}
          </motion.button>
        )}
        {session.status === "completed" && showReviewButton && onReview && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onReview(session)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-hairline text-label text-ink hover:bg-muted transition-colors"
          >
            <Star size={14} className="text-accent" />
            Review
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ── Pull-to-refresh hook ───────────────────────────────────────
function usePullToRefresh(onRefresh: () => void) {
  const startY = useRef(0);
  const pulling = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current) return;
      const delta = e.changedTouches[0].clientY - startY.current;
      if (delta > 60) onRefresh();
      pulling.current = false;
    },
    [onRefresh]
  );

  return { onTouchStart, onTouchEnd };
}

// ── Main Page ──────────────────────────────────────────────────
const SessionsPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [reviewSession, setReviewSession] = useState<SessionWithDetails | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const {
    data: allSessions = [],
    isLoading,
    refetch,
  } = useSessions(user?.id ?? "", "student");

  // Fetch reviews for this user's tutors to determine which sessions have been reviewed.
  // Since useReviews accepts tutorId we can't directly batch — we use a heuristic:
  // show prompt for most recent completed session < 7 days old that isn't dismissed.
  const completedSessions = (allSessions as SessionWithDetails[]).filter(
    (s) => s.status === "completed"
  );

  const reviewPromptSession = completedSessions.find((s) => {
    if (isDismissed(s.id) || dismissedIds.has(s.id)) return false;
    const sessionDate = new Date(s.date);
    const now = new Date();
    const diffDays = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }) ?? null;

  const upcoming = (allSessions as SessionWithDetails[]).filter(
    (s) => s.status === "upcoming"
  );
  const past = (allSessions as SessionWithDetails[]).filter(
    (s) => s.status === "completed" || s.status === "cancelled"
  );
  const sessions = tab === "upcoming" ? upcoming : past;

  const handleDismissReview = useCallback((sessionId: string) => {
    setDismissed(sessionId);
    setDismissedIds((prev) => new Set([...prev, sessionId]));
  }, []);

  const handleOpenReviewModal = useCallback((session: SessionWithDetails) => {
    setReviewSession(session);
  }, []);

  const handleCloseReviewModal = useCallback(() => {
    setReviewSession(null);
  }, []);

  const handleReviewSuccess = useCallback(() => {
    if (reviewSession) {
      setDismissedIds((prev) => new Set([...prev, reviewSession.id]));
    }
    refetch();
  }, [reviewSession, refetch]);

  const { onTouchStart, onTouchEnd } = usePullToRefresh(() => {
    refetch();
    toast("Refreshed");
  });

  return (
    <>
      <div
        className="px-5 pt-14 pb-24 overflow-y-auto h-full"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <h1 className="text-display-md text-ink mb-5">Sessions</h1>

        {/* Tab bar */}
        <div className="flex gap-1 mb-5 bg-muted rounded-pill p-1">
          {(["upcoming", "past"] as const).map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 h-8 rounded-pill text-label font-medium capitalize transition-colors relative`}
            >
              {tab === t && (
                <motion.div
                  layoutId="session-tab-pill"
                  className="absolute inset-0 bg-surface rounded-pill shadow-sm"
                  transition={transitions.spring}
                />
              )}
              <span
                className={`relative z-10 ${tab === t ? "text-ink" : "text-ink-muted"}`}
              >
                {t}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Review prompt — shown at top of either tab */}
        <AnimatePresence>
          {!isLoading && reviewPromptSession && (
            <ReviewPromptCard
              key={reviewPromptSession.id}
              session={reviewPromptSession}
              onSubmit={handleOpenReviewModal}
              onDismiss={handleDismissReview}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={tab === "upcoming" ? "No upcoming sessions" : "No past sessions"}
            description={
              tab === "upcoming"
                ? "Book a tutor to get started. Your upcoming sessions will appear here."
                : "Your completed and cancelled sessions will appear here."
            }
          />
        ) : (
          <motion.div
            className="space-y-3"
            variants={variants.staggerChildren}
            initial="hidden"
            animate="visible"
          >
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session as SessionWithDetails}
                showReviewButton={
                  !isDismissed(session.id) && !dismissedIds.has(session.id)
                }
                onReview={handleOpenReviewModal}
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
            onClose={handleCloseReviewModal}
            onSuccess={handleReviewSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SessionsPage;
