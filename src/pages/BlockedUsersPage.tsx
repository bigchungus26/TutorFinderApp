// ============================================================
// BlockedUsersPage — /profile/blocked
// List of users the current user has blocked, with unblock button.
// ============================================================
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBlocks, useDeleteBlock } from "@/hooks/useSupabaseQuery";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { springs, variants } from "@/lib/motion";

const BlockedUsersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: blocks = [], isLoading } = useMyBlocks(user?.id ?? "");
  const deleteBlock = useDeleteBlock();

  return (
    <div className="min-h-svh bg-background pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <motion.button
          whileTap={{ scale: 0.93 }} transition={springs.snappy}
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </motion.button>
        <h1 className="text-h2 font-display text-foreground">Blocked users</h1>
      </div>

      <div className="px-5">
        {isLoading ? (
          <div className="space-y-3 mt-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : blocks.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="No blocked users"
            description="Users you block will appear here."
          />
        ) : (
          <motion.div
            className="space-y-2 mt-2"
            variants={variants.staggerChildren}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {blocks.map(block => (
                <motion.div
                  key={block.id}
                  variants={variants.staggerItem}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="flex items-center gap-3 bg-surface rounded-xl border border-border p-4"
                >
                  <Avatar
                    src={block.blocked?.avatar_url}
                    name={block.blocked?.full_name}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-label font-medium text-foreground truncate">
                      {block.blocked?.full_name ?? "Unknown user"}
                    </p>
                    <p className="text-caption text-ink-muted">
                      Blocked {new Date(block.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }} transition={springs.snappy}
                    onClick={() => deleteBlock.mutate({ blocker_id: user!.id, blocked_id: block.blocked_id })}
                    disabled={deleteBlock.isPending}
                    className="px-3 py-1.5 rounded-lg border border-border text-label text-ink-muted hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    Unblock
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsersPage;
