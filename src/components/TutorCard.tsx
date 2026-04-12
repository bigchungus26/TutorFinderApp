// ============================================================
// TutorCard - Part 2.1
// University-tinted left border. Avatar, name, verified badge,
// course chips, star rating, hourly rate, optional save action.
// ============================================================
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import { springs } from "@/lib/motion";
import { useAuth } from "@/contexts/AuthContext";
import { useIsTutorSaved, useSaveTutor, useUnsaveTutor } from "@/hooks/useSavedTutors";
import type { TutorWithDetails } from "@/types/database";

const UNI_COLORS: Record<string, string> = {
  AUB: "#8B0000",
  LAU: "#003DA5",
  NDU: "#0B6E4F",
};

interface TutorCardProps {
  tutor: TutorWithDetails;
  className?: string;
  showSaveButton?: boolean;
}

export function TutorCard({
  tutor,
  className = "",
  showSaveButton = true,
}: TutorCardProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const studentId = profile?.role === "student" ? profile.id : "";
  const { data: isSaved = false } = useIsTutorSaved(studentId, tutor.id);
  const saveTutor = useSaveTutor();
  const unsaveTutor = useUnsaveTutor();

  const uniColor =
    tutor.university?.color ??
    UNI_COLORS[tutor.university?.short_name ?? ""] ??
    "#2ba66a";

  const courses = tutor.tutor_courses ?? [];
  const displayCourses = courses.slice(0, 3);
  const extra = courses.length - displayCourses.length;
  const rating = tutor.stats?.avg_rating ?? (tutor as any).avg_rating ?? 0;
  const reviewCount = tutor.stats?.review_count ?? (tutor as any).review_count ?? 0;
  const canSave = showSaveButton && profile?.role === "student" && !!studentId;

  const handleToggleSave = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }

    if (!studentId) return;

    if (isSaved) {
      unsaveTutor.mutate({ studentId, tutorId: tutor.id });
      return;
    }

    saveTutor.mutate({ studentId, tutorId: tutor.id, tutor });
  };

  return (
    <div className={`relative w-full ${className}`}>
      {canSave && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={springs.snappy}
          onClick={handleToggleSave}
          disabled={saveTutor.isPending || unsaveTutor.isPending}
          aria-label={isSaved ? `Remove ${tutor.full_name} from saved tutors` : `Save ${tutor.full_name} for later`}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/95 shadow-sm backdrop-blur-sm disabled:opacity-60"
        >
          <Heart size={16} className={isSaved ? "text-accent fill-accent" : "text-ink-muted"} />
        </motion.button>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={springs.snappy}
        onClick={() => navigate(`/tutor/${tutor.id}`)}
        className="w-full flex items-stretch overflow-hidden rounded-xl border border-border bg-surface text-left shadow-xs"
        aria-label={`View ${tutor.full_name}'s tutoring profile`}
      >
        <div
          className="w-1.5 flex-shrink-0 rounded-l-xl"
          style={{ background: uniColor }}
          aria-hidden="true"
        />

        <div className={`min-w-0 flex-1 p-4 ${canSave ? "pr-14" : ""}`}>
          <div className="mb-3 flex items-start gap-3">
            <Avatar
              src={tutor.avatar_url}
              name={tutor.full_name}
              size={44}
              className="flex-shrink-0"
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-body font-semibold text-foreground">
                  {tutor.full_name}
                </span>
                {tutor.verification_status === "approved" && (
                  <BadgeCheck size={15} className="flex-shrink-0 text-accent" aria-label="Verified tutor" />
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                {tutor.university && (
                  <span
                    className="rounded px-1.5 py-0.5 text-caption font-medium"
                    style={{
                      backgroundColor: uniColor + "18",
                      color: uniColor,
                    }}
                  >
                    {tutor.university.short_name}
                    {tutor.tutor_status === "student" && " Student"}
                    {tutor.tutor_status === "alumni" && " Alumni"}
                  </span>
                )}
                {(tutor.major || tutor.year) && (
                  <span className="truncate text-caption text-ink-muted">
                    {[tutor.major, tutor.year].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {displayCourses.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {displayCourses.map((tc) => (
                <span
                  key={tc.course_id}
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-label font-medium"
                  style={{
                    backgroundColor: uniColor + "14",
                    color: uniColor,
                  }}
                >
                  {tc.course?.code ?? tc.course_id}
                  {tc.grade && (
                    <span
                      className="rounded px-1 py-px text-[10px] font-bold leading-tight"
                      style={{ backgroundColor: uniColor + "30", color: uniColor }}
                    >
                      {tc.grade}
                    </span>
                  )}
                </span>
              ))}
              {extra > 0 && (
                <span className="rounded bg-muted px-2 py-0.5 text-label text-ink-muted">
                  +{extra}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-accent text-accent" aria-hidden="true" />
              <span className="text-caption font-semibold text-foreground">
                {rating > 0 ? Number(rating).toFixed(1) : "New"}
              </span>
              {reviewCount > 0 && (
                <span className="text-caption text-ink-muted">({reviewCount})</span>
              )}
            </div>

            {tutor.hourly_rate != null && (
              <span
                className="rounded-lg px-2.5 py-1 text-caption font-semibold"
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
    </div>
  );
}
