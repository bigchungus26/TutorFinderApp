import { motion } from "framer-motion";
import { Calendar, Clock, Video, MapPin, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRequests, useUpdateRequest } from "@/hooks/useSupabaseQuery";

const TutorRequests = () => {
  const { user } = useAuth();
  const { data: requests = [], isLoading } = useRequests(user?.id ?? "", "tutor");
  const updateRequest = useUpdateRequest();

  const handleAction = (id: string, action: "accepted" | "declined") => {
    updateRequest.mutate({ id, status: action });
  };

  const pending = requests.filter((r: any) => r.status === "pending");

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="font-display text-display-md mb-5">Requests</h1>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pending.length > 0 ? (
        <div className="space-y-3">
          {pending.map((req: any) => (
            <motion.div key={req.id} layout className="bg-surface rounded-xl border border-hairline p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={req.student?.avatar_url || "https://i.pravatar.cc/100"} alt={req.student?.full_name} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="font-display font-medium text-body">{req.student?.full_name}</div>
                  <div className="text-sm text-muted-ink">{req.course?.code} — {req.course?.name}</div>
                </div>
              </div>
              <p className="text-sm text-muted-ink mb-3 leading-relaxed">{req.message}</p>
              <div className="flex items-center gap-4 text-sm text-muted-ink mb-3">
                <div className="flex items-center gap-1"><Calendar size={14} />{new Date(req.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                <div className="flex items-center gap-1"><Clock size={14} />{req.time}</div>
                <span className="inline-flex items-center gap-1 text-xs">
                  {req.location === "online" ? <Video size={12} /> : <MapPin size={12} />}
                  {req.location === "online" ? "Online" : "In-person"}
                </span>
              </div>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAction(req.id, "accepted")}
                  className="flex-1 h-11 rounded-lg bg-accent text-accent-foreground font-medium text-sm flex items-center justify-center gap-1">
                  <Check size={16} /> Accept
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAction(req.id, "declined")}
                  className="flex-1 h-11 rounded-lg border border-hairline text-muted-ink font-medium text-sm flex items-center justify-center gap-1">
                  <X size={16} /> Decline
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-accent-soft mx-auto mb-4 flex items-center justify-center">
            <Calendar size={28} className="text-accent" />
          </div>
          <p className="font-display text-lg font-medium mb-1">All caught up!</p>
          <p className="text-sm text-muted-ink">No pending requests right now.</p>
        </div>
      )}
    </div>
  );
};

export default TutorRequests;
