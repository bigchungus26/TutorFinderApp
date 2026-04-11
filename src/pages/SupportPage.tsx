// ============================================================
// SupportPage — /support
// Static help page with support contact info + report-a-problem form.
// ============================================================
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateSupportTicket } from "@/hooks/useSupabaseQuery";
import { springs, variants } from "@/lib/motion";

function ReportSheet({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const createTicket = useCreateSupportTicket();

  const handleSubmit = useCallback(async () => {
    if (!user?.id || !subject.trim() || !message.trim()) return;
    await createTicket.mutateAsync({ user_id: user.id, subject: subject.trim(), message: message.trim() });
    onClose();
  }, [user, subject, message, createTicket, onClose]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-[80]" onClick={onClose} aria-hidden="true" />
      <motion.div
        variants={variants.sheetIn} initial="hidden" animate="visible"
        exit={{ y: "100%", transition: { duration: 0.2 } }}
        className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
        style={{ maxHeight: "90dvh" }}
        role="dialog" aria-modal="true" aria-label="Report a problem"
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
          <h2 className="text-h2 font-display text-foreground">Report a problem</h2>
          <motion.button whileTap={{ scale: 0.96 }} transition={springs.snappy}
            onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-muted" aria-label="Close">
            <X size={20} className="text-ink-muted" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
          <div>
            <label className="text-overline text-ink-muted block mb-2">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Briefly describe the issue"
              style={{ fontSize: "16px" }}
              className="w-full h-12 rounded-xl border border-border bg-background px-4 text-foreground placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-overline text-ink-muted block mb-2">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 1000))}
              placeholder="Describe what happened in detail…"
              rows={5}
              style={{ fontSize: "16px" }}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-ink-muted resize-none focus:outline-none focus:border-accent transition-colors"
            />
            <span className="text-caption text-ink-muted float-right">{message.length}/1000</span>
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-border bg-surface">
          <motion.button
            whileTap={{ scale: 0.97 }} transition={springs.snappy}
            onClick={handleSubmit}
            disabled={!subject.trim() || !message.trim() || createTicket.isPending}
            className="w-full h-14 rounded-xl bg-accent text-white text-label font-semibold disabled:opacity-40 transition-opacity flex items-center justify-center"
          >
            {createTicket.isPending ? "Sending…" : "Send report"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

const SupportPage = () => {
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <div className="min-h-svh bg-background pb-10">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-14 pb-6">
          <motion.button
            whileTap={{ scale: 0.93 }} transition={springs.snappy}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </motion.button>
          <h1 className="text-h2 font-display text-foreground">Help & support</h1>
        </div>

        <div className="px-5 space-y-6">
          {/* Contact card */}
          <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
                <MessageSquare size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-label font-semibold text-foreground mb-1">Contact us</p>
                <p className="text-body-sm text-ink-muted leading-relaxed">
                  Need help? Send us a message at{" "}
                  <span className="text-accent font-medium">[support email — coming soon]</span>
                  {" "}or DM us on WhatsApp at{" "}
                  <span className="text-accent font-medium">[number — coming soon]</span>.
                  We'll respond within 48 hours.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <p className="text-overline text-ink-muted mb-3">Common questions</p>
            <div className="bg-surface rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {[
                { q: "How do I book a session?", a: "Find a tutor you like, select a time slot from their availability, and tap 'Book a session'." },
                { q: "How does payment work?", a: "Sessions are paid directly between you and the tutor — via OMT, Whish, or cash. TUTR does not handle payments." },
                { q: "What if my tutor doesn't show up?", a: "Report the no-show on the session page within 24 hours. Repeated no-shows may result in tutor suspension." },
                { q: "How do I cancel a session?", a: "Tap 'Cancel' on the session card. Make sure you're within the tutor's cancellation window." },
                { q: "How do I delete my account?", a: "Contact us at the support email above and we'll process your account deletion within 30 days." },
              ].map(({ q, a }) => (
                <div key={q} className="px-4 py-3.5">
                  <p className="text-label font-medium text-foreground mb-1">{q}</p>
                  <p className="text-body-sm text-ink-muted leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report problem */}
          <div>
            <p className="text-overline text-ink-muted mb-3">Something wrong?</p>
            <motion.button
              whileTap={{ scale: 0.98 }} transition={springs.snappy}
              onClick={() => setReportOpen(true)}
              className="w-full flex items-center gap-3 bg-surface rounded-2xl border border-border px-4 py-4 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label font-medium text-foreground">Report a problem</p>
                <p className="text-caption text-ink-muted">Tell us what went wrong</p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {reportOpen && <ReportSheet key="report-sheet" onClose={() => setReportOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default SupportPage;
