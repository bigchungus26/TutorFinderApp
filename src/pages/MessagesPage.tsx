import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useMessages";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonList, MessageSkeleton } from "@/components/skeletons";
import { variants } from "@/lib/motion";

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

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: conversations = [], isLoading } = useConversations(user?.id ?? "");

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <h1 className="font-display text-display-md text-ink mb-6">Messages</h1>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-1">
          <SkeletonList count={3} component={MessageSkeleton} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && conversations.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="No messages yet"
          description={
            profile?.role === "tutor"
              ? "Students who message you will appear here, and you can also start a thread from a request."
              : "Start a conversation by messaging a tutor from their profile."
          }
        />
      )}

      {/* Conversation list */}
      {!isLoading && conversations.length > 0 && (
        <motion.div
          variants={variants.staggerChildren}
          initial="hidden"
          animate="visible"
          className="space-y-0 divide-y divide-hairline"
        >
          {conversations.map((conv: any) => {
            const isStudent = profile?.role === "student";
            const other = isStudent ? conv.tutor : conv.student;
            const otherName: string = other?.full_name ?? "Unknown";
            const otherAvatar: string = other?.avatar_url || "https://i.pravatar.cc/100";
            const lastMsg = conv.lastMessage;
            const unread: number = conv.unreadCount ?? 0;

            return (
              <motion.button
                key={conv.id}
                variants={variants.staggerItem}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(profile?.role === "tutor" ? `/tutor/messages/${conv.id}` : `/messages/${conv.id}`)}
                className="w-full flex items-center gap-3 py-3.5 text-left"
              >
                {/* Avatar with unread dot */}
                <div className="relative flex-shrink-0">
                  <img
                    src={otherAvatar}
                    alt={otherName}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-background" />
                  )}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-body font-medium text-ink truncate">
                      {otherName}
                    </span>
                    {lastMsg && (
                      <span className="text-caption text-ink-muted ml-2 flex-shrink-0">
                        {relativeTime(lastMsg.created_at)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-body-sm truncate block ${
                      unread > 0 ? "text-ink font-medium" : "text-ink-muted"
                    }`}
                  >
                    {lastMsg ? lastMsg.body : "No messages yet"}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default MessagesPage;
