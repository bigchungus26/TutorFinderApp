// ============================================================
// Tutr — TutorRequests (Tutor view)
// Pending session requests from students. Accept / Decline with
// CardSuccessOverlay, stagger animation, pull-to-refresh.
// ============================================================
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useRequests,
  useUpdateRequest,
  useCreateSession,
} from "@/hooks/useSupabaseQuery";
import { SessionCardSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import { CardSuccessOverlay } from "@/components/SuccessOverlay";
import { variants, transitions } from "@/lib/motion";
import { toast, toastError } from "@/components/ui/sonner";

// ── Types ──────────────────────────────────────────────────────
type RequestWithDetails = {
  id: string;
  student_id: string;
  tutor_id: string;
  course_id: string;
  date: string;
  time: string;
  duration: number;
  location: "online" | "in-person";
  message: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  student: { full_name: string; avatar_url: string } | null;
  tutor: { full_name: string; avatar_url: string } | null;
  course: { code: string; name: string } | null;
};

// ── Request Card ───────────────────────────────────────────────
interface RequestCardProps {
  req: RequestWithDetails;
  onAccept: (req: RequestWithDetails) => void;
  onDecline: (id: string) => void;
  actionPending: boolean;
}

function RequestCard({ req, onAccept, onDecline, actionPending }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const dateStr = new Date(req.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handleAccept = useCallback(() => {
    onAccept(req);
    setSuccessVisible(true);
  }, [req, onAccept]);

  const isLongMessage = (req.message?.length ?? 0) > 120;
  const displayMessage = isLongMessage && !expanded
    ? req.message.slice(0, 120) + "…"
    : req.message;

  return (
    <motion.div
      variants={variants.staggerItem}
      layout
      className="relative bg-surface rounded-xl border border-hairline p-4"
    >
      {/* Card success overlay */}
      <CardSuccessOverlay
        visible={successVisible}
        title="Accepted!"
        onDismiss={() => setSuccessVisible(false)}
      />

      {/* Student row */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={req.student?.avatar_url || "https://i.pravatar.cc/100"}
          alt={req.student?.full_name ?? "Student"}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-ink truncate">
            {req.student?.full_name ?? "Student"}
          </p>
          <p className="text-body-sm text-ink-muted truncate">
            {req.course?.code} — {req.course?.name}
          </p>
        </div>
        {/* Relative time */}
        <span className="text-caption text-ink-muted flex-shrink-0">
          {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Message */}
      {req.message?.trim() && (
        <div className="mb-3">
          <p className="text-body-sm text-ink-muted leading-relaxed">
            {displayMessage}
          </p>
          {isLongMessage && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-caption text-accent mt-1"
            >
              {expanded ? (
                <>
                  <ChevronUp size={13} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={13} /> Read more
                </>
              )}
            </motion.button>
          )}
        </div>
      )}

      {/* Detail chips */}
      <div className="flex flex-wrap items-center gap-3 text-body-sm text-ink-muted mb-4">
        <span className="flex items-center gap-1">
          <Calendar size={13} />
          {dateStr}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={13} />
          {req.time}
        </span>
        <span className="flex items-center gap-1">
          {req.location === "online" ? (
            <Video size={13} />
          ) : (
            <MapPin size={13} />
          )}
          {req.location === "online" ? "Online" : "In-person"}
        </span>
        <span className="text-body-sm text-ink-muted">{req.duration} min</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAccept}
          disabled={actionPending}
          className="flex-1 h-11 rounded-lg bg-accent text-accent-foreground text-label font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Check size={15} />
          Accept
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onDecline(req.id)}
          disabled={actionPending}
          className="flex-1 h-11 rounded-lg border border-hairline text-ink-muted text-label font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 hover:bg-muted transition-colors"
        >
          <X size={15} />
          Decline
        </motion.button>
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
const TutorRequests = () => {
  const { user } = useAuth();
  const {
    data: requests = [],
    isLoading,
    refetch,
  } = useRequests(user?.id ?? "", "tutor");

  const updateRequest = useUpdateRequest();
  const createSession = useCreateSession();

  const pending = (requests as RequestWithDetails[]).filter(
    (r) => r.status === "pending"
  );

  const handleAccept = useCallback(
    async (req: RequestWithDetails) => {
      try {
        await updateRequest.mutateAsync({ id: req.id, status: "accepted" });
        // Create a session row when accepted
        await createSession.mutateAsync({
          tutor_id: req.tutor_id,
          student_id: req.student_id,
          course_id: req.course_id,
          date: req.date,
          time: req.time,
          duration: req.duration,
          location: req.location,
          price: 0, // price determined by tutor's rate at booking time
        });
        toast.success("Session accepted");
      } catch (err) {
        toastError(err);
      }
    },
    [updateRequest, createSession]
  );

  const handleDecline = useCallback(
    async (id: string) => {
      try {
        await updateRequest.mutateAsync({ id, status: "declined" });
        toast("Request declined");
      } catch (err) {
        toastError(err);
      }
    },
    [updateRequest]
  );

  const { onTouchStart, onTouchEnd } = usePullToRefresh(() => {
    refetch();
    toast("Refreshed");
  });

  const actionPending = updateRequest.isPending || createSession.isPending;

  return (
    <div
      className="px-5 pt-14 pb-24 overflow-y-auto h-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <h1 className="text-display-md text-ink mb-5">Requests</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No requests yet"
          description="Once students start booking you, their requests will appear here. Make sure your profile is complete."
        />
      ) : (
        <motion.div
          className="space-y-3"
          variants={variants.staggerChildren}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {pending.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                onAccept={handleAccept}
                onDecline={handleDecline}
                actionPending={actionPending}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default TutorRequests;
