import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, BadgeCheck } from "lucide-react";
import { Tutor } from "@/data/tutors";
import { courses } from "@/data/courses";
import { getUniversity } from "@/data/universities";

export const TutorCard = ({ tutor }: { tutor: Tutor }) => {
  const uni = getUniversity(tutor.universityId);
  const taughtCourses = tutor.coursesTaught.map(ct => courses.find(c => c.id === ct.courseId)).filter(Boolean);
  const visibleCourses = taughtCourses.slice(0, 3);
  const moreCount = taughtCourses.length - 3;

  return (
    <Link to={`/tutor/${tutor.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-surface rounded-xl border border-hairline p-4 flex gap-3.5"
      >
        <img src={tutor.avatarUrl} alt={tutor.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-medium text-[15px]">{tutor.name}</span>
            {tutor.verified && <BadgeCheck size={15} className="text-accent flex-shrink-0" />}
          </div>
          <div className="text-sm text-muted-ink">{tutor.major}, {tutor.year}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {visibleCourses.map(c => c && (
              <span key={c.id} className="text-xs px-2 py-0.5 rounded-pill bg-muted text-foreground font-medium">{c.code}</span>
            ))}
            {moreCount > 0 && <span className="text-xs px-2 py-0.5 rounded-pill bg-muted text-muted-ink">+{moreCount}</span>}
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <Star size={13} className="text-accent fill-accent" />
            <span className="font-medium">{tutor.rating}</span>
            <span className="text-muted-ink">· {tutor.reviewCount} reviews</span>
          </div>
        </div>
        <div className="flex-shrink-0 self-start">
          <span className="font-display font-medium text-[15px]">${tutor.hourlyRate}<span className="text-xs text-muted-ink font-body">/hr</span></span>
        </div>
      </motion.div>
    </Link>
  );
};
