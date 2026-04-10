import { useState } from "react";
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

function TutorAvatar({ avatarUrl, fullName }: { avatarUrl: string; fullName: string }) {
  const [imgError, setImgError] = useState(false);

  const isPravatar = avatarUrl?.includes("pravatar.cc");
  const hasRealAvatar = avatarUrl && !isPravatar;

  const dicebearUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=e8f5ee,fbeee3,f5e6d3&fontFamily=serif`;

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (imgError) {
    return (
      <div className="w-12 h-12 rounded-full flex-shrink-0 bg-accent-soft flex items-center justify-center ring-2 ring-surface ring-offset-0">
        <span className="text-accent text-sm font-medium leading-none">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={hasRealAvatar ? avatarUrl : dicebearUrl}
      alt={fullName}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-surface ring-offset-0"
      onError={() => setImgError(true)}
    />
  );
}

export const TutorCard = ({ tutor }: TutorCardProps) => {
  const { data: universities = [] } = useUniversities();
  const uni = universities.find((u) => u.id === tutor.university_id);
  const taughtCourses = tutor.tutor_courses ?? [];
  const visibleCourses = taughtCourses.slice(0, 3);
  const moreCount = taughtCourses.length - 3;
  const rating = tutor.tutor_stats?.rating ?? 0;
  const reviewCount = tutor.tutor_stats?.review_count ?? 0;

  return (
    <Link to={`/tutor/${tutor.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-surface rounded-xl border border-hairline overflow-hidden hover:shadow-float transition-shadow"
      >
        <motion.div
          whileTap={{ y: 1 }}
          className="p-4 flex gap-3.5"
        >
          <TutorAvatar avatarUrl={tutor.avatar_url} fullName={tutor.full_name} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-medium text-body">{tutor.full_name}</span>
              {tutor.verified && <BadgeCheck size={15} className="text-accent flex-shrink-0" />}
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: uni?.color ?? "#2fa86e" }}
              />
            </div>
            <div className="text-sm text-muted-ink">{tutor.major}, {tutor.year}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {visibleCourses.map((ct) => (
                <span key={ct.course.id} className="text-xs px-2 py-0.5 rounded-pill bg-muted text-foreground font-medium">
                  {ct.course.code}
                </span>
              ))}
              {moreCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-pill bg-muted text-muted-ink">+{moreCount}</span>
              )}
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
              <span className="font-display font-medium text-body font-tabular">
                ${tutor.hourly_rate}
                <span className="text-xs text-muted-ink font-body">/hr</span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Micro-gradient bottom divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-hairline to-transparent" />
      </motion.div>
    </Link>
  );
};
