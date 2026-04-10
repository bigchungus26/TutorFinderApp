import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, MapPin, Check, X } from "lucide-react";
import { tutorRequests } from "@/data/requests";
import { getCourse } from "@/data/courses";

const TutorRequests = () => {
  const [requests, setRequests] = useState(tutorRequests);

  const handleAction = (id: string, action: "accepted" | "declined") => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const pending = requests.filter(r => r.status === "pending");

  return (
    <div className="px-5 pt-14 pb-4">
      <h1 className="font-display text-[22px] font-medium mb-5">Requests</h1>
      {pending.length > 0 ? (
        <div className="space-y-3">
          {pending.map(req => {
            const course = getCourse(req.courseId);
            return (
              <motion.div key={req.id} layout className="bg-surface rounded-xl border border-hairline p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img src={req.studentAvatar} alt={req.studentName} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="font-display font-medium text-[15px]">{req.studentName}</div>
                    <div className="text-sm text-muted-ink">{course?.code} — {course?.name}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-ink mb-3 leading-relaxed">{req.message}</p>
                <div className="flex items-center gap-4 text-sm text-muted-ink mb-3">
                  <div className="flex items-center gap-1"><Calendar size={14} />{new Date(req.requestedDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                  <div className="flex items-center gap-1"><Clock size={14} />{req.requestedTime}</div>
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
            );
          })}
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
