import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, BadgeCheck } from "lucide-react";
import { useUniversities } from "@/hooks/useSupabaseQuery";

interface TutorCardProps {
  tutor: {
    id: string;
    full_name: string;
    avatar_url: string;
    university_id: string | null;
    major: string;
    year: string;
    hourly_rate: number | null;
    verified: boolean;
    tutor_stats?: { rating: number; review_count: number } | null;
    tutor_courses?: { course: { id: string; code: string } }[];
  };
}

export const TutorCard = ({ tutor }: TutorCardProps) => {
  const { data: universities = [] } = useUniversities();
  const uni = universities.find(u => u.id === tutor.university_id);
  const taughtCourses = tutor.tutor_courses ?? [];
  const visibleCourses = taughtCourses.slice(0, 3);
  const moreCount = taughtCourses.length - 3;
  const rating = tutor.tutor_stats?.rating ?? 0;
  const reviewCount = tutor.tutor_stats?.review_count ?? 0;

  return (
    <Link to={`/tutor/${tutor.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-surface rounded-xl border border-hairline p-4 flex gap-3.5"
      >
        <img src={tutor.avatar_url || "https://i.pravatar.cc/100"} alt={tutor.full_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-medium text-body">{tutor.full_name}</span>
            {tutor.verified && <BadgeCheck size={15} className="text-accent flex-shrink-0" />}
          </div>
          <div className="text-sm text-muted-ink">{tutor.major}, {tutor.year}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {visibleCourses.map(ct => (
              <span key={ct.course.id} className="text-xs px-2 py-0.5 rounded-pill bg-muted text-foreground font-medium">{ct.course.code}</span>
            ))}
            {moreCount > 0 && <span className="text-xs px-2 py-0.5 rounded-pill bg-muted text-muted-ink">+{moreCount}</span>}
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              <Star size={13} className="text-accent fill-accent" />
              <span className="font-medium">{rating}</span>
              <span className="text-muted-ink">· {reviewCount} reviews</span>
            </div>
          )}
        </div>
        {tutor.hourly_rate && (
          <div className="flex-shrink-0 self-start">
            <span className="font-display font-medium text-body">${tutor.hourly_rate}<span className="text-xs text-muted-ink font-body">/hr</span></span>
          </div>
        )}
      </motion.div>
    </Link>
  );
};
