// ============================================================
// TutorCard — Part 2.1
// University-tinted left border. Avatar, name, verified badge,
// course chips, star rating, hourly rate.
// ============================================================
import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import { springs } from "@/lib/motion";
import type { TutorWithDetails } from "@/types/database";

// University hex colors (fallback if not in DB)
const UNI_COLORS: Record<string, string> = {
  AUB: "#8B0000",
  LAU: "#003DA5",
  NDU: "#0B6E4F",
};

interface TutorCardProps {
  tutor: TutorWithDetails;
  className?: string;
}

export function TutorCard({ tutor, className = "" }: TutorCardProps) {
  const navigate = useNavigate();
  const uniColor =
    tutor.university?.color ??
    UNI_COLORS[tutor.university?.short_name ?? ""] ??
    "#2ba66a";

  const courses = tutor.tutor_courses ?? [];
  const displayCourses = courses.slice(0, 3);
  const extra = courses.length - displayCourses.length;

  const rating = tutor.stats?.avg_rating ?? (tutor as any).avg_rating ?? 0;
  const reviewCount = tutor.stats?.review_count ?? (tutor as any).review_count ?? 0;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={springs.snappy}
      onClick={() => navigate(`/tutor/${tutor.id}`)}
      className={`w-full flex items-stretch bg-surface border border-border rounded-xl overflow-hidden text-left shadow-xs ${className}`}
      aria-label={`View ${tutor.full_name}'s tutoring profile`}
    >
      {/* University color accent bar */}
      <div
        className="w-1.5 flex-shrink-0 rounded-l-xl"
        style={{ background: uniColor }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex-1 p-4 min-w-0">
        {/* Top row: avatar + name + badge */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar
            src={tutor.avatar_url}
            name={tutor.full_name}
            size={44}
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-body font-semibold text-foreground truncate">
                {tutor.full_name}
              </span>
              {tutor.verified && (
                <BadgeCheck size={15} className="text-accent flex-shrink-0" aria-label="Verified tutor" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {tutor.university && (
                <span
                  className="text-caption px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: uniColor + "18",
                    color: uniColor,
                  }}
                >
                  {tutor.university.short_name}
                </span>
              )}
              {(tutor.major || tutor.year) && (
                <span className="text-caption text-ink-muted truncate">
                  {[tutor.major, tutor.year].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Course chips */}
        {displayCourses.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {displayCourses.map((tc) => (
              <span
                key={tc.course_id}
                className="text-label px-2 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: uniColor + "14",
                  color: uniColor,
                }}
              >
                {tc.course?.code ?? tc.course_id}
              </span>
            ))}
            {extra > 0 && (
              <span className="text-label px-2 py-0.5 rounded text-ink-muted bg-muted">
                +{extra}
              </span>
            )}
          </div>
        )}

        {/* Footer: rating + rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-accent fill-accent" aria-hidden="true" />
            <span className="text-caption font-semibold text-foreground">
              {rating > 0 ? Number(rating).toFixed(1) : "New"}
            </span>
            {reviewCount > 0 && (
              <span className="text-caption text-ink-muted">({reviewCount})</span>
            )}
          </div>

          {tutor.hourly_rate != null && (
            <span
              className="text-caption font-semibold px-2.5 py-1 rounded-lg"
              style={{
                backgroundColor: uniColor + "14",
                color: uniColor,
              }}
            >
              ${tutor.hourly_rate}/hr
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
