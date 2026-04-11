// ============================================================
// TutorProfilePage — Part 2.12
// Emotional centerpiece: avatar, stats bar, availability grid,
// reviews, pricing, sticky CTA. Spring animations throughout.
// ============================================================
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Heart, Star, BadgeCheck, Video, MapPin,
  Clock, Flag, ChevronRight, MessageCircle,
} from "lucide-react";
import { useTutor, useReviews, useUniversities } from "@/hooks/useSupabaseQuery";
import { useAvailability } from "@/hooks/useAvailability";
import { useIsTutorSaved, useSaveTutor, useUnsaveTutor } from "@/hooks/useSavedTutors";
import { useCreateReport, ReportReason } from "@/hooks/useReports";
import { useGetOrCreateConversation } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { springs, variants } from "@/lib/motion";
import { Avatar } from "@/components/Avatar";
import { Skeleton } from "@/components/skeletons/Skeleton";
import { QueryError } from "@/components/ErrorBoundary";
import { BookingSheet } from "@/components/BookingSheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ── Constants ────────────────────────────────────────────────
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "inappropriate", label: "Inappropriate behavior" },
  { value: "no_show", label: "No-show or cancellation" },
  { value: "misrepresented_grades", label: "Misrepresented grades or credentials" },
  { value: "other", label: "Other" },
];

// ── Helpers ──────────────────────────────────────────────────
function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

function getNext7Days() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d,
      dayOfWeek: d.getDay(),
      label: i === 0 ? "Today" : DAY_NAMES[d.getDay()],
      dateLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
}

// ── StarRow ──────────────────────────────────────────────────
function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} className={i < Math.round(rating) ? "text-accent fill-accent" : "text-border"} />
      ))}
    </div>
  );
}

// ── ReviewCard ───────────────────────────────────────────────
function ReviewCard({ review }: { review: any }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <Avatar src={review.student?.avatar_url} name={review.student?.full_name} size={32} />
        <div className="flex-1 min-w-0">
          <div className="text-label text-foreground font-medium truncate">
            {review.student?.full_name || "Anonymous"}
          </div>
          {review.course?.code && (
            <div className="text-caption text-ink-muted">{review.course.code}</div>
          )}
        </div>
        <StarRow rating={review.rating} />
      </div>
      {review.comment && (
        <p className="text-body-sm text-ink-muted leading-relaxed">{review.comment}</p>
      )}
      <div className="text-caption text-ink-muted mt-2">{relativeDate(review.created_at)}</div>
    </div>
  );
}

// ── Page skeleton ────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-svh bg-background pb-28 px-5 pt-14">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
      <div className="flex flex-col items-center mb-7">
        <Skeleton className="w-24 h-24 rounded-full mb-3" />
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-20 rounded-xl mb-7" />
      {[120, 80, 180, 72].map((h, i) => (
        <div key={i} className="mb-7">
          <Skeleton className="h-5 w-28 mb-3" />
          <Skeleton className="rounded-xl" style={{ height: h }} />
        </div>
      ))}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
const TutorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.id ?? "";
  const tutorId = id ?? "";

  const { data: tutor, isLoading, error, refetch } = useTutor(tutorId);
  const { data: universities = [] } = useUniversities();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(tutorId);
  const { data: availability = [], isLoading: availLoading } = useAvailability(tutorId);
  const { data: isSaved = false } = useIsTutorSaved(studentId, tutorId);

  const saveTutor = useSaveTutor();
  const unsaveTutor = useUnsaveTutor();
  const createReport = useCreateReport();
  const getOrCreate = useGetOrCreateConversation();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; start: string; end: string } | null>(null);
  const [reviewsSheetOpen, setReviewsSheetOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("inappropriate");
  const [reportDetails, setReportDetails] = useState("");

  const uni = universities.find(u => u.id === tutor?.university_id);
  const uniColor = uni?.color ?? "#2ba66a";
  const taughtCourses = tutor?.tutor_courses ?? [];
  const stats = tutor?.stats ?? (tutor as any)?.tutor_stats;

  const coursesBySubject = useMemo(() => {
    const map: Record<string, typeof taughtCourses> = {};
    for (const tc of taughtCourses) {
      const subject = tc.course?.subject ?? "Other";
      if (!map[subject]) map[subject] = [];
      map[subject].push(tc);
    }
    return map;
  }, [taughtCourses]);

  const filteredReviews = useMemo(() =>
    selectedCourseId ? reviews.filter((r: any) => r.course_id === selectedCourseId) : reviews,
    [reviews, selectedCourseId]
  );

  const next7Days = useMemo(() => getNext7Days(), []);
  const slotsByDay = useMemo(() => {
    const map: Record<number, typeof availability> = {};
    for (const slot of availability) {
      if (!map[slot.day_of_week]) map[slot.day_of_week] = [];
      map[slot.day_of_week].push(slot);
    }
    return map;
  }, [availability]);

  const rate = tutor?.hourly_rate ?? 0;

  const handleToggleSave = () => {
    if (!studentId) return;
    if (isSaved) unsaveTutor.mutate({ studentId, tutorId });
    else saveTutor.mutate({ studentId, tutorId });
  };

  const handleMessage = async () => {
    if (!studentId) return;
    const convId = await getOrCreate.mutateAsync({ studentId, tutorId });
    navigate(`/messages/${convId}`);
  };

  const handleReport = () => {
    if (!studentId) return;
    createReport.mutate(
      { reporterId: studentId, reportedTutorId: tutorId, reason: reportReason, details: reportDetails },
      { onSuccess: () => { setReportSheetOpen(false); setReportDetails(""); setReportReason("inappropriate"); } }
    );
  };

  if (isLoading) return <PageSkeleton />;

  if (error || !tutor) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center px-5">
        <QueryError message="Failed to load tutor profile." onRetry={() => refetch()} />
      </div>
    );
  }

  const rating = stats?.avg_rating ?? stats?.rating ?? 0;
  const reviewCount = stats?.review_count ?? reviews.length;

  return (
    <>
      <div className="min-h-svh bg-background pb-40">
        {/* University accent bar at very top */}
        <div className="h-1 w-full" style={{ backgroundColor: uniColor }} />

        <div className="px-5 pt-10">
          {/* Nav row */}
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileTap={{ scale: 0.93 }}
              transition={springs.snappy}
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.88 }}
              transition={springs.bouncy}
              onClick={handleToggleSave}
              className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center"
              aria-label={isSaved ? "Remove from saved" : "Save tutor"}
            >
              <Heart size={18} className={isSaved ? "text-accent fill-accent" : "text-ink-muted"} />
            </motion.button>
          </div>

          {/* Avatar + identity */}
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar
              src={tutor.avatar_url}
              name={tutor.full_name}
              size={88}
              className="mb-4 ring-4 ring-offset-2 ring-offset-background"
              style={{ "--tw-ring-color": uniColor + "40" } as any}
            />

            <div className="flex items-center gap-1.5 mb-1.5">
              <h1 className="text-h1 font-display text-foreground">{tutor.full_name}</h1>
              {tutor.verified && (
                <BadgeCheck size={22} className="text-accent flex-shrink-0" aria-label="Verified tutor" />
              )}
            </div>

            {uni && (
              <span
                className="inline-block px-3 py-0.5 rounded-full text-label mb-1.5"
                style={{ backgroundColor: uniColor + "20", color: uniColor }}
              >
                {uni.short_name}
              </span>
            )}

            <p className="text-body-sm text-ink-muted">
              {[tutor.major, tutor.year].filter(Boolean).join(" · ")}
            </p>

            {(tutor.online || tutor.in_person) && (
              <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                {tutor.online && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-light text-accent text-label">
                    <Video size={12} />
                    Online
                  </span>
                )}
                {tutor.in_person && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-light text-accent text-label">
                    <MapPin size={12} />
                    In-person
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex items-stretch bg-surface rounded-2xl border border-border mb-8 overflow-hidden shadow-xs">
            {[
              {
                value: rating > 0 ? rating.toFixed(1) : "—",
                label: `${reviewCount} reviews`,
                icon: <Star size={13} className="text-accent fill-accent" />,
              },
              {
                value: String(stats?.sessions_completed ?? 0),
                label: "sessions",
                icon: null,
              },
              {
                value: stats?.response_time ?? "—",
                label: "response",
                icon: <Clock size={11} className="text-ink-muted" />,
              },
              {
                value: `$${tutor.hourly_rate ?? "—"}`,
                label: "per hour",
                icon: null,
              },
            ].map((stat, i) => (
              <div key={i} className={`flex-1 flex flex-col items-center justify-center py-4 px-2 ${i < 3 ? "border-r border-border" : ""}`}>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {stat.icon}
                  <span className="text-h3 text-foreground font-semibold">{stat.value}</span>
                </div>
                <span className="text-caption text-ink-muted text-center">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="px-5 space-y-8">

          {/* About */}
          {tutor.bio && (
            <section>
              <h2 className="text-h3 text-foreground mb-3">About</h2>
              <p className="text-body text-ink-muted leading-relaxed">{tutor.bio}</p>
            </section>
          )}

          {/* Courses I teach */}
          {taughtCourses.length > 0 && (
            <section>
              <h2 className="text-h3 text-foreground mb-3">Courses I teach</h2>
              <div className="space-y-3">
                {Object.entries(coursesBySubject).map(([subject, courses]) => (
                  <div key={subject}>
                    <p className="text-overline text-ink-muted mb-1.5">{subject}</p>
                    <div className="flex flex-wrap gap-2">
                      {courses.map((tc: any) => {
                        const isSelected = selectedCourseId === tc.course_id;
                        return (
                          <motion.button
                            key={tc.course_id}
                            whileTap={{ scale: 0.95 }}
                            transition={springs.snappy}
                            onClick={() => setSelectedCourseId(isSelected ? null : tc.course_id)}
                            className={`px-3 py-1.5 rounded-full text-label transition-colors ${
                              isSelected ? "bg-accent text-white" : "bg-accent-light text-accent"
                            }`}
                          >
                            {tc.course?.code}
                            {tc.grade ? ` · ${tc.grade}` : ""}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Availability */}
          <section>
            <h2 className="text-h3 text-foreground mb-3">Availability</h2>
            {availLoading ? (
              <Skeleton className="h-24 rounded-xl" />
            ) : availability.length === 0 ? (
              <p className="text-body-sm text-ink-muted">No availability set</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
                {next7Days.map(({ dayOfWeek, label, dateLabel }) => {
                  const daySlots = slotsByDay[dayOfWeek] ?? [];
                  if (daySlots.length === 0) return null;
                  return (
                    <div key={dayOfWeek} className="flex-shrink-0 w-28 bg-surface rounded-xl border border-border p-3">
                      <p className="text-label text-foreground font-semibold mb-0.5">{label}</p>
                      <p className="text-caption text-ink-muted mb-2">{dateLabel}</p>
                      <div className="space-y-1.5">
                        {daySlots.map(slot => (
                          <motion.button
                            key={slot.id ?? `${slot.day_of_week}-${slot.start_time}`}
                            whileTap={{ scale: 0.97 }}
                            transition={springs.snappy}
                            onClick={() => {
                              setSelectedSlot({ day: slot.day_of_week, start: slot.start_time, end: slot.end_time });
                              setBookingOpen(true);
                            }}
                            className="w-full text-center px-2 py-1 rounded-lg bg-accent-light text-accent text-caption font-medium"
                          >
                            {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-h3 text-foreground">
                Reviews
                {selectedCourseId && ` · ${taughtCourses.find((tc: any) => tc.course_id === selectedCourseId)?.course?.code ?? ""}`}
              </h2>
              {reviews.length > 3 && (
                <button
                  onClick={() => setReviewsSheetOpen(true)}
                  className="flex items-center gap-1 text-accent text-label"
                >
                  See all {reviews.length}
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            {reviewsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : filteredReviews.length === 0 ? (
              <p className="text-body-sm text-ink-muted">
                {selectedCourseId ? "No reviews for this course yet." : "No reviews yet."}
              </p>
            ) : (
              <motion.div variants={variants.staggerChildren} initial="hidden" animate="visible" className="space-y-3">
                {filteredReviews.slice(0, 3).map((review: any) => (
                  <motion.div key={review.id} variants={variants.staggerItem}>
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* Pricing */}
          {rate > 0 && (
            <section>
              <h2 className="text-h3 text-foreground mb-3">Pricing</h2>
              <div className="bg-surface rounded-2xl border border-border divide-y divide-border overflow-hidden">
                {[
                  { label: "30 min", price: Math.round(rate * 0.5) },
                  { label: "60 min", price: rate },
                  { label: "90 min", price: Math.round(rate * 1.5) },
                ].map(({ label, price }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3.5">
                    <span className="text-body text-foreground">{label}</span>
                    <span className="text-h3 font-semibold text-foreground">${price}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Report */}
          <section className="pb-4">
            <button
              onClick={() => setReportSheetOpen(true)}
              className="flex items-center gap-2 text-ink-muted text-body-sm hover:text-foreground transition-colors"
            >
              <Flag size={14} />
              Report this tutor
            </button>
          </section>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-[440px] mx-auto bg-surface/95 backdrop-blur-sm border-t border-border px-4 py-3 shadow-lg"
        style={{ paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom, 0px))` }}>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            onClick={handleMessage}
            disabled={getOrCreate.isPending}
            className="flex items-center justify-center gap-2 w-12 h-12 rounded-xl border border-border bg-surface text-foreground disabled:opacity-60 flex-shrink-0"
            aria-label="Message tutor"
          >
            <MessageCircle size={18} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            onClick={() => { setSelectedSlot(null); setBookingOpen(true); }}
            className="flex-1 h-12 rounded-xl bg-accent text-white text-label font-semibold"
          >
            Book a session
          </motion.button>
        </div>
      </div>

      {/* BookingSheet */}
      {tutor && (
        <BookingSheet
          open={bookingOpen}
          onClose={() => { setBookingOpen(false); setSelectedSlot(null); }}
          tutor={tutor as any}
          selectedSlot={selectedSlot ?? undefined}
        />
      )}

      {/* All reviews sheet */}
      <Sheet open={reviewsSheetOpen} onOpenChange={setReviewsSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-8">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-h2 font-display">All reviews ({reviews.length})</SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            {reviews.map((review: any) => <ReviewCard key={review.id} review={review} />)}
          </div>
        </SheetContent>
      </Sheet>

      {/* Report sheet */}
      <Sheet open={reportSheetOpen} onOpenChange={setReportSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-h2 font-display">Report tutor</SheetTitle>
          </SheetHeader>
          <div className="space-y-2.5 mb-5">
            {REPORT_REASONS.map(r => (
              <label
                key={r.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  reportReason === r.value ? "border-accent bg-accent-light" : "border-border bg-surface"
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={reportReason === r.value}
                  onChange={() => setReportReason(r.value)}
                  className="accent-accent"
                />
                <span className="text-body-sm text-foreground">{r.label}</span>
              </label>
            ))}
          </div>
          <textarea
            value={reportDetails}
            onChange={e => setReportDetails(e.target.value)}
            placeholder="Additional details (optional)"
            rows={3}
            style={{ fontSize: "16px" }}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground placeholder:text-ink-muted resize-none focus:outline-none focus:border-accent transition-colors mb-5"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            onClick={handleReport}
            disabled={createReport.isPending}
            className="w-full h-12 rounded-xl bg-accent text-white text-label font-semibold disabled:opacity-60"
          >
            {createReport.isPending ? "Submitting…" : "Submit report"}
          </motion.button>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TutorProfilePage;
