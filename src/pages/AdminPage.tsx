// ============================================================
// AdminPage — /admin/subscriptions and /admin/boosts
// Gated by VITE_ADMIN_USER_IDS env var.
// Lets admins manually set tutor subscription status + boosts.
// ============================================================
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdminTutors,
  useAdminUpdateSubscription,
  useAdminUpdateBoost,
} from "@/hooks/useSupabaseQuery";
import { Avatar } from "@/components/Avatar";
import { springs } from "@/lib/motion";

const ADMIN_IDS = (import.meta.env.VITE_ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

function isAdmin(userId?: string): boolean {
  return !!userId && ADMIN_IDS.includes(userId);
}

// ── Subscriptions panel ──────────────────────────────────────
function SubscriptionsPanel() {
  const { data: tutors = [] } = useAdminTutors();
  const updateSub = useAdminUpdateSubscription();
  const [periodEnd, setPeriodEnd] = useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      <p className="text-overline text-ink-muted">Tutor subscriptions</p>
      {tutors.length === 0 && (
        <p className="text-body-sm text-ink-muted py-4 text-center">No tutors found.</p>
      )}
      {tutors.map((t: any) => {
        const sub = Array.isArray(t.tutor_subscriptions) ? t.tutor_subscriptions[0] : t.tutor_subscriptions;
        const currentStatus: string = sub?.status ?? "inactive";
        return (
          <div key={t.id} className="bg-surface rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={t.avatar_url} name={t.full_name} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-label font-medium text-foreground truncate">{t.full_name}</p>
                <p className="text-caption text-ink-muted">{t.university_id?.toUpperCase()} · ${t.hourly_rate}/hr</p>
              </div>
              <span className={`text-caption font-semibold px-2 py-0.5 rounded-full ${
                currentStatus === "active" ? "bg-green-100 text-green-700" :
                currentStatus === "grace_period" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-600"
              }`}>
                {currentStatus}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {(["active", "grace_period", "inactive"] as const).map(s => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.96 }} transition={springs.snappy}
                  disabled={updateSub.isPending}
                  onClick={() => updateSub.mutate({
                    tutor_id: t.id,
                    status: s,
                    current_period_end: periodEnd[t.id] || undefined,
                  })}
                  className={`px-3 py-1.5 rounded-lg text-caption font-medium transition-colors ${
                    currentStatus === s
                      ? "bg-accent text-white"
                      : "border border-border bg-surface text-foreground hover:bg-muted"
                  }`}
                >
                  {s.replace("_", " ")}
                </motion.button>
              ))}
              <input
                type="date"
                value={periodEnd[t.id] ?? ""}
                onChange={e => setPeriodEnd(prev => ({ ...prev, [t.id]: e.target.value }))}
                className="flex-1 min-w-[140px] h-8 rounded-lg border border-border bg-surface text-caption text-foreground px-2 focus:outline-none focus:border-accent"
                placeholder="Period end"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Boosts panel ─────────────────────────────────────────────
function BoostsPanel() {
  const { data: tutors = [] } = useAdminTutors();
  const updateBoost = useAdminUpdateBoost();
  const [endsAt, setEndsAt] = useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      <p className="text-overline text-ink-muted">Ad boosts</p>
      {tutors.length === 0 && (
        <p className="text-body-sm text-ink-muted py-4 text-center">No tutors found.</p>
      )}
      {tutors.map((t: any) => {
        const boost = Array.isArray(t.tutor_boosts) ? t.tutor_boosts[0] : t.tutor_boosts;
        const isActive = boost?.active && (!boost?.ends_at || new Date(boost.ends_at) > new Date());
        return (
          <div key={t.id} className="bg-surface rounded-xl border border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={t.avatar_url} name={t.full_name} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-label font-medium text-foreground truncate">{t.full_name}</p>
                <p className="text-caption text-ink-muted">
                  {isActive ? `Boosted until ${boost?.ends_at ? new Date(boost.ends_at).toLocaleDateString() : "—"}` : "Not boosted"}
                </p>
              </div>
              <span className={`text-caption font-semibold px-2 py-0.5 rounded-full ${
                isActive ? "bg-amber-100 text-amber-700" : "bg-muted text-ink-muted"
              }`}>
                {isActive ? "⚡ Boosted" : "Off"}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <motion.button
                whileTap={{ scale: 0.96 }} transition={springs.snappy}
                disabled={updateBoost.isPending}
                onClick={() => updateBoost.mutate({
                  tutor_id: t.id,
                  active: true,
                  ends_at: endsAt[t.id] || new Date(Date.now() + 7 * 86_400_000).toISOString(),
                })}
                className="px-3 py-1.5 rounded-lg text-caption font-medium border border-border bg-surface text-foreground hover:bg-muted transition-colors"
              >
                Activate boost
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }} transition={springs.snappy}
                disabled={updateBoost.isPending}
                onClick={() => updateBoost.mutate({ tutor_id: t.id, active: false })}
                className="px-3 py-1.5 rounded-lg text-caption font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              >
                Remove boost
              </motion.button>
              <input
                type="date"
                value={endsAt[t.id] ?? ""}
                onChange={e => setEndsAt(prev => ({ ...prev, [t.id]: e.target.value }))}
                className="flex-1 min-w-[140px] h-8 rounded-lg border border-border bg-surface text-caption text-foreground px-2 focus:outline-none focus:border-accent"
                placeholder="Ends at (optional)"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();
  const { user } = useAuth();
  const [tab, setTab] = useState<"subscriptions" | "boosts">(
    section === "boosts" ? "boosts" : "subscriptions"
  );

  if (!isAdmin(user?.id)) {
    return (
      <div className="min-h-svh bg-background flex flex-col items-center justify-center px-5 text-center">
        <ShieldAlert size={40} className="text-ink-muted mb-4" />
        <h1 className="text-h2 font-display text-foreground mb-2">Access denied</h1>
        <p className="text-body-sm text-ink-muted mb-6">You don't have admin access.</p>
        <motion.button whileTap={{ scale: 0.97 }} transition={springs.snappy}
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl bg-accent text-white text-label font-medium">
          Go back
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background pb-10">
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <motion.button whileTap={{ scale: 0.93 }} transition={springs.snappy}
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </motion.button>
        <h1 className="text-h2 font-display text-foreground">Admin panel</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mx-5 mb-5 bg-muted rounded-full p-1">
        {(["subscriptions", "boosts"] as const).map(t => (
          <motion.button key={t} onClick={() => setTab(t)}
            className="flex-1 h-8 rounded-full text-label font-medium capitalize relative">
            {tab === t && (
              <motion.div layoutId="admin-tab-pill"
                className="absolute inset-0 bg-surface rounded-full shadow-xs" transition={springs.smooth} />
            )}
            <span className={`relative z-10 ${tab === t ? "text-foreground" : "text-ink-muted"}`}>{t}</span>
          </motion.button>
        ))}
      </div>

      <div className="px-5">
        {tab === "subscriptions" ? <SubscriptionsPanel /> : <BoostsPanel />}
      </div>
    </div>
  );
};

export default AdminPage;
