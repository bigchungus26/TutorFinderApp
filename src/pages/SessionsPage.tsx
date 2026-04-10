import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessions } from "@/hooks/useSupabaseQuery";

const SessionsPage = () => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const { data: allSessions = [], isLoading } = useSessions(user?.id ?? "", profile?.role ?? "student");

  const upcoming = allSessions.filter(s => s.status === "upcoming");
  const past = allSessions.filter(s => s.status === "completed");
  const sessions = tab === "upcoming" ? upcoming : past;

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="font-display text-[22px] font-medium mb-5">Sessions</h1>

      <div className="flex gap-1 mb-5">
        {(["upcoming", "past"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-pill text-sm font-medium capitalize transition-colors ${tab === t ? "bg-foreground text-background" : "text-muted-ink"}`}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session: any) => (
            <motion.div key={session.id} whileTap={{ scale: 0.98 }} className="bg-surface rounded-xl border border-hairline p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={session.tutor?.avatar_url || "https://i.pravatar.cc/100"} alt={session.tutor?.full_name} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="font-display font-medium text-[15px]">{session.tutor?.full_name}</div>
                  <div className="text-sm text-muted-ink">{session.course?.code} — {session.course?.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-ink mb-3">
                <div className="flex items-center gap-1"><Calendar size={14} />{new Date(session.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                <div className="flex items-center gap-1"><Clock size={14} />{session.time}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-pill font-medium ${session.location === "online" ? "bg-accent-soft text-accent" : "bg-muted text-foreground"}`}>
                  {session.location === "online" ? <Video size={12} /> : <MapPin size={12} />}
                  {session.location === "online" ? "Online" : "In-person"}
                </span>
                {tab === "upcoming" && (
                  <motion.button whileTap={{ scale: 0.96 }} className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium">
                    {session.location === "online" ? "Join" : "Details"}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-accent-soft mx-auto mb-4 flex items-center justify-center">
            <Calendar size={28} className="text-accent" />
          </div>
          <p className="font-display text-lg font-medium mb-1">No sessions yet</p>
          <p className="text-sm text-muted-ink">{tab === "upcoming" ? "Book a tutor to get started." : "Your session history will appear here."}</p>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
