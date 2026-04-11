import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MessageCircle,
  Calendar,
  Star,
  BookOpen,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { variants } from "@/lib/motion";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotificationsRealtime,
  type Notification,
} from "@/hooks/useNotifications";

// ── Notification icon by type ─────────────────────────────────
function NotificationIcon({ type }: { type: string }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0";

  switch (type) {
    case "message":
      return (
        <div className={cn(base, "bg-accent-light")}>
          <MessageCircle size={16} className="text-accent" />
        </div>
      );
    case "session":
    case "booking":
      return (
        <div className={cn(base, "bg-accent-light")}>
          <Calendar size={16} className="text-accent" />
        </div>
      );
    case "review":
      return (
        <div className={cn(base, "bg-accent-light")}>
          <Star size={16} className="text-accent" />
        </div>
      );
    case "course":
      return (
        <div className={cn(base, "bg-accent-light")}>
          <BookOpen size={16} className="text-accent" />
        </div>
      );
    default:
      return (
        <div className={cn(base, "bg-muted")}>
          <Info size={16} className="text-ink-muted" />
        </div>
      );
  }
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Props ──────────────────────────────────────────────────────
interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

// ── Component ──────────────────────────────────────────────────
export function NotificationSheet({ isOpen, onClose, userId }: NotificationSheetProps) {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications(userId);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { subscribe } = useNotificationsRealtime(userId);

  // Subscribe to realtime notification inserts
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribe();
    return unsubscribe;
  }, [userId]);

  const handleNotificationTap = (n: Notification) => {
    if (!n.read) {
      markRead.mutate({ id: n.id, userId });
    }
    onClose();
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(userId);
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            variants={variants.sheetIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-50 max-w-[440px] mx-auto bg-surface rounded-t-2xl border-t border-border shadow-float"
            style={{ maxHeight: "80vh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Title row */}
            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="font-display text-display-sm text-foreground">Notifications</h2>
              <div className="flex items-center gap-2">
                {hasUnread && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={markAllRead.isPending}
                    className="text-label text-accent disabled:opacity-50 transition-opacity"
                  >
                    Mark all read
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  aria-label="Close notifications"
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X size={18} className="text-ink-muted" />
                </motion.button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border mx-5" />

            {/* Notification list */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 100px)" }}>
              {isLoading && (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!isLoading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center mb-4">
                    <Bell size={24} className="text-accent" />
                  </div>
                  <p className="text-body font-medium text-foreground mb-1">All caught up</p>
                  <p className="text-body-sm text-ink-muted">
                    No notifications yet. We'll let you know when something happens.
                  </p>
                </div>
              )}

              {!isLoading && notifications.length > 0 && (
                <motion.ul
                  variants={variants.staggerChildren}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-border"
                >
                  {notifications.map((n) => (
                    <motion.li
                      key={n.id}
                      variants={variants.staggerItem}
                    >
                      <button
                        onClick={() => handleNotificationTap(n)}
                        className={cn(
                          "w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors",
                          !n.read ? "bg-accent-light/30" : "hover:bg-muted/50"
                        )}
                      >
                        <NotificationIcon type={n.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-label text-foreground leading-snug">{n.title}</span>
                            <span className="text-caption text-ink-muted flex-shrink-0 mt-0.5">
                              {relativeTime(n.created_at)}
                            </span>
                          </div>
                          <p className="text-caption text-ink-muted mt-0.5 leading-relaxed line-clamp-2">
                            {n.body}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                        )}
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
