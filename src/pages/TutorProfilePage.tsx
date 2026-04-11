// ============================================================
// TutorProfilePage — Full Redesign (Part E)
// Tutr app
// ============================================================
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Star,
  BadgeCheck,
  Video,
  MapPin,
  Clock,
  Flag,
  ChevronRight,
} from "lucide-react";
import { useTutor, useReviews, useUniversities } from "@/hooks/useSupabaseQuery";
import { useAvailability } from "@/hooks/useAvailability";
import { useIsTutorSaved, useSaveTutor, useUnsaveTutor } from "@/hooks/useSavedTutors";
import { useCreateReport, ReportReason } from "@/hooks/useReports";
import { useGetOrCreateConversation } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { variants, transitions } from "@/lib/motion";
import { ProfileHeaderSkeleton } from "@/components/skeletons/ProfileHeaderSkeleton";
import { Skeleton } from "@/components/skeletons/Skeleton";
import { QueryError } from "@/components/ErrorBoundary";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BookingSheet } from "@/components/BookingSheet";

// ── Constants ──────────────────────────────────────────────────
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "inappropriate", label: "Inappropriate behavior" },
  { value: "no_show", label: "No-show or cancellation" },
  { value: "misrepresented_grades", label: "Misrepresented grades / credentials" },
  { value: "other", label: "Other" },
];

// ── Helpers ────────────────────────────────────────────────────
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
  const days: { date: Date; dayOfWeek: number; label: string; dateLabel: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      dayOfWeek: d.getDay(),
      label: i === 0 ? "Today" : DAY_NAMES[d.getDay()],
      dateLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }
  return days;
}

// ── Sub-components ─────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-display-sm text-ink mb-3">{children}</h2>;
}

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? "text-accent fill-accent" : "text-ink-subtle"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  return (
    <div className="bg-surface rounded-xl border border-hairline p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <img
          src={review.student?.avatar_url || "https://i.pravatar.cc/100"}
          alt={review.student?.full_name || "Student"}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-label text-ink font-medium truncate">
            {review.student?.full_name || "Anonymous"}
          </div>
          {review.course?.code && (
            <div className="text-caption text-ink-muted">{review.course.code}</div>
          )}
        </div>
        <StarRow rating={review.rating} />
      </div>
      {review.comment ? (
        <p className="text-body-sm text-ink-muted leading-relaxed">{review.comment}</p>
      ) : null}
      <div className="text-caption text-ink-subtle mt-2">{relativeDate(review.created_at)}</div>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen pb-28 px-5 pt-14">
      {/* Nav row */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>

      {/* Header */}
      <ProfileHeaderSkeleton />

      {/* Location pills */}
      <div className="flex gap-2 justify-center mb-5">
        <Skeleton className="h-8 w-24 rounded-pill" />
        <Skeleton className="h-8 w-28 rounded-pill" />
      </div>

      {/* Stats bar */}
      <Skeleton className="h-20 rounded-xl mb-7" />

      {/* Sections */}
      {[120, 80, 140, 180, 72].map((h, i) => (
        <div key={i} className="mb-7">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="rounded-xl" style={{ height: h }} />
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
const TutorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.id ?? "";
  const tutorId = id ?? "";

  // ── Data fetching ──────────────────────────────────────────
  const { data: tutor, isLoading, error, refetch } = useTutor(tutorId);
  const { data: universities = [] } = useUniversities();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(tutorId);
  const { data: availability = [], isLoading: availLoading } = useAvailability(tutorId);
  const { data: isSaved = false } = useIsTutorSaved(studentId, tutorId);

  // ── Mutations ──────────────────────────────────────────────
  const saveTutor = useSaveTutor();
  const unsaveTutor = useUnsaveTutor();
  const createReport = useCreateReport();
  const getOrCreate = useGetOrCreateConversation();

  // ── UI state ───────────────────────────────────────────────
  const [showActionBar, setShowActionBar] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; start: string; end: string } | null>(null);
  const [reviewsSheetOpen, setReviewsSheetOpen] = useState(false);
  const [reportSheetOpen, setReportSheetOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("inappropriate");
  const [reportDetails, setReportDetails] = useState("");

  // ── Show action bar after mount ────────────────────────────
  useEffect(() => {
    setShowActionBar(true);
  }, []);

  // ── Derived data ───────────────────────────────────────────
  const uni = universities.find((u) => u.id === tutor?.university_id);
  const taughtCourses = tutor?.tutor_courses ?? [];
  const stats = tutor?.tutor_stats;

  // Group courses by subject
  const coursesBySubject = useMemo(() => {
    const map: Record<string, typeof taughtCourses> = {};
    for (const tc of taughtCourses) {
      const subject = tc.course?.subject ?? "Other";
      if (!map[subject]) map[subject] = [];
      map[subject].push(tc);
    }
    return map;
  }, [taughtCourses]);

  // Filter reviews by selected course
  const filteredReviews = useMemo(() => {
    if (!selectedCourseId) return reviews;
    return reviews.filter((r: any) => r.course_id === selectedCourseId);
  }, [reviews, selectedCourseId]);

  // Next 7 days with availability slots
  const next7Days = useMemo(() => getNext7Days(), []);
  const slotsByDay = useMemo(() => {
    const map: Record<number, typeof availability> = {};
    for (const slot of availability) {
      if (!map[slot.day_of_week]) map[slot.day_of_week] = [];
      map[slot.day_of_week].push(slot);
    }
    return map;
  }, [availability]);

  // ── Pricing ────────────────────────────────────────────────
  const rate = tutor?.hourly_rate ?? 0;
  const price30 = Math.round(rate * 0.5);
  const price60 = rate;
  const price90 = Math.round(rate * 1.5);

  // ── Handlers ───────────────────────────────────────────────
  const handleToggleSave = () => {
    if (!studentId) return;
    if (isSaved) {
      unsaveTutor.mutate({ studentId, tutorId });
    } else {
      saveTutor.mutate({ studentId, tutorId });
    }
  };

  const handleMessage = async () => {
    if (!studentId) return;
    const convId = await getOrCreate.mutateAsync({ studentId, tutorId });
    navigate(`/messages/${convId}`);
  };

  const handleReport = () => {
    if (!studentId) return;
    createReport.mutate(
      {
        reporterId: studentId,
        reportedTutorId: tutorId,
        reason: reportReason,
        details: reportDetails,
      },
      {
        onSuccess: () => {
          setReportSheetOpen(false);
          setReportDetails("");
          setReportReason("inappropriate");
        },
      }
    );
  };

  // ── Loading / Error states ─────────────────────────────────
  if (isLoading) return <PageSkeleton />;

  if (error || !tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <QueryError
          message="Failed to load tutor profile."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen pb-36" style={{ background: "linear-gradient(145deg, hsl(152 58% 90%) 0%, hsl(150 30% 96%) 55%, hsl(35 60% 93%) 100%)" }}>

        {/* ── Header zone (not sticky) ──────────────────────── */}
        <div className="px-5 pt-14">

          {/* Nav row: back + heart */}
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-surface border border-hairline flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft size={18} className="text-ink" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.88 }}
              transition={transitions.springBouncy}
              onClick={handleToggleSave}
              className="w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center"
              aria-label={isSaved ? "Remove from saved" : "Save tutor"}
            >
              <Heart
                size={18}
                className={
                  isSaved ? "text-accent fill-accent" : "text-ink-muted"
                }
              />
            </motion.button>
          </div>

          {/* Avatar + identity */}
          <div className="flex flex-col items-center text-center mb-5">
            {/* 96px avatar */}
            <img
              src={tutor.avatar_url || "https://i.pravatar.cc/150"}
              alt={tutor.full_name}
              className="w-24 h-24 rounded-full object-cover mb-3 ring-2 ring-hairline"
            />

            {/* Name + verified badge */}
            <div className="flex items-center gap-1.5 mb-2">
              <h1 className="text-display-xl text-ink">{tutor.full_name}</h1>
              {tutor.verified && (
                <BadgeCheck size={22} className="text-accent flex-shrink-0" />
              )}
            </div>

            {/* University chip */}
            {uni && (
              <span
                className="inline-block px-3 py-0.5 rounded-pill text-label mb-2"
                style={{
                  backgroundColor: uni.color + "26",
                  color: uni.color,
                }}
              >
                {uni.short_name}
              </span>
            )}

            {/* Major + year */}
            <p className="text-body-sm text-ink-muted">
              {tutor.major}
              {tutor.year ? ` · ${tutor.year}` : ""}
            </p>

            {/* Location pills */}
            {(tutor.online || tutor.in_person) && (
              <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                {tutor.online && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent-soft text-accent text-label">
                    <Video size={13} />
                    Online
                  </span>
                )}
                {tutor.in_person && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent-soft text-accent text-label">
                    <MapPin size={13} />
                    In-person
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Stats bar: 4-block row ─────────────────────── */}
          <div className="flex items-stretch bg-surface rounded-xl border border-hairline mb-7 overflow-hidden">
            {/* Rating */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Star size={14} className="text-accent fill-accent" />
                <span className="text-display-sm text-ink">
                  {stats?.rating ? stats.rating.toFixed(1) : "—"}
                </span>
              </div>
              <span className="text-caption text-ink-muted">
                {stats?.review_count ?? 0} reviews
              </span>
            </div>

            <div className="w-px bg-hairline self-stretch" />

            {/* Sessions completed */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">
              <span className="text-display-sm text-ink mb-0.5">
                {stats?.sessions_completed ?? 0}
              </span>
              <span className="text-caption text-ink-muted">sessions</span>
            </div>

            <div className="w-px bg-hairline self-stretch" />

            {/* Response time */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">
              <div className="flex items-center gap-0.5 mb-0.5">
                <Clock size={12} className="text-ink-muted" />
                <span className="text-display-sm text-ink">
                  {stats?.response_time ?? "—"}
                </span>
              </div>
              <span className="text-caption text-ink-muted">response</span>
            </div>

            <div className="w-px bg-hairline self-stretch" />

            {/* Hourly rate */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">
              <span className="text-display-sm text-ink mb-0.5">
                ${tutor.hourly_rate ?? "—"}
              </span>
              <span className="text-caption text-ink-muted">per hour</span>
            </div>
          </div>
        </div>

        {/* ── Sections ────────────────────────────────────────── */}
        <div className="px-5 space-y-8">

          {/* 1. About */}
          {tutor.bio ? (
            <section>
              <SectionTitle>About</SectionTitle>
              <p className="text-body-sm text-ink-muted leading-relaxed">{tutor.bio}</p>
            </section>
          ) : null}

          {/* 2. Courses I teach */}
          {taughtCourses.length > 0 && (
            <section>
              <SectionTitle>Courses I teach</SectionTitle>
              <div className="space-y-3">
                {Object.entries(coursesBySubject).map(([subject, courses]) => (
                  <div key={subject}>
                    <p className="text-caption text-ink-subtle mb-1.5 uppercase tracking-wider">
                      {subject}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {courses.map((tc: any) => {
                        const isSelected = selectedCourseId === tc.course_id;
                        return (
                          <motion.button
                            key={tc.course_id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setSelectedCourseId(isSelected ? null : tc.course_id)
                            }
                            className={`px-3 py-1.5 rounded-pill text-label transition-colors ${
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "bg-accent-soft text-accent"
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

          {/* 3. Availability */}
          <section>
            <SectionTitle>Availability</SectionTitle>
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
                    <div
                      key={dayOfWeek}
                      className="flex-shrink-0 w-[120px] bg-surface rounded-xl border border-hairline p-3"
                    >
                      <p className="text-label text-ink font-medium mb-0.5">{label}</p>
                      <p className="text-caption text-ink-muted mb-2">{dateLabel}</p>
                      <div className="space-y-1.5">
                        {daySlots.map((slot) => (
                          <motion.button
                            key={slot.id ?? `${slot.day_of_week}-${slot.start_time}`}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setSelectedSlot({
                                day: slot.day_of_week,
                                start: slot.start_time,
                                end: slot.end_time,
                              });
                              setBookingOpen(true);
                            }}
                            className="w-full text-center px-2 py-1 rounded-lg bg-accent-soft text-accent text-caption font-medium"
                          >
                            {formatTime(slot.start_time)}
                            {" – "}
                            {formatTime(slot.end_time)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 4. Reviews */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>
                Reviews
                {selectedCourseId
                  ? ` · ${
                      taughtCourses.find((tc: any) => tc.course_id === selectedCourseId)
                        ?.course?.code ?? ""
                    }`
                  : ""}
              </SectionTitle>
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
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : filteredReviews.length === 0 ? (
              <p className="text-body-sm text-ink-muted">
                {selectedCourseId
                  ? "No reviews for this course yet."
                  : "No reviews yet."}
              </p>
            ) : (
              <motion.div
                variants={variants.staggerChildren}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredReviews.slice(0, 3).map((review: any) => (
                  <motion.div key={review.id} variants={variants.staggerItem}>
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* 5. Pricing */}
          <section>
            <SectionTitle>Pricing</SectionTitle>
            <div className="bg-surface rounded-xl border border-hairline divide-y divide-hairline">
              {[
                { label: "30 min", price: price30 },
                { label: "60 min", price: price60 },
                { label: "90 min", price: price90 },
              ].map(({ label, price }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-3.5"
                >
                  <span className="text-body text-ink">{label}</span>
                  <span className="text-display-sm text-ink">${price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Report this tutor */}
          <section className="pb-4">
            <button
              onClick={() => setReportSheetOpen(true)}
              className="flex items-center gap-2 text-ink-subtle text-body-sm hover:text-ink-muted transition-colors"
            >
              <Flag size={14} />
              Report this tutor
            </button>
          </section>
        </div>
      </div>

      {/* ── Sticky bottom action bar ─────────────────────────── */}
      <AnimatePresence>
        {showActionBar && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={transitions.spring}
            className="fixed bottom-0 left-0 right-0 z-40 max-w-[440px] mx-auto bg-surface border-t border-hairline px-4 py-3 shadow-float"
          >
            <div className="flex gap-3">
              {/* Message button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleMessage}
                disabled={getOrCreate.isPending}
                className="flex-1 h-12 rounded-lg border border-hairline bg-surface text-ink text-label font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {getOrCreate.isPending ? "Opening…" : "Message"}
              </motion.button>

              {/* Book a session button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelectedSlot(null);
                  setBookingOpen(true);
                }}
                className="flex-1 h-12 rounded-lg bg-accent text-accent-foreground text-label font-medium flex items-center justify-center"
              >
                Book a session
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BookingSheet ──────────────────────────────────────── */}
      {tutor && (
        <BookingSheet
          isOpen={bookingOpen}
          onClose={() => {
            setBookingOpen(false);
            setSelectedSlot(null);
          }}
          tutor={tutor as any}
          selectedSlot={selectedSlot ?? undefined}
        />
      )}

      {/* ── All reviews sheet ─────────────────────────────────── */}
      <Sheet open={reviewsSheetOpen} onOpenChange={setReviewsSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-8"
        >
          <SheetHeader className="mb-5">
            <SheetTitle className="text-display-sm text-ink">
              All reviews ({reviews.length})
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-3">
            {reviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Report sheet ─────────────────────────────────────── */}
      <Sheet open={reportSheetOpen} onOpenChange={setReportSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="mb-5">
            <SheetTitle className="text-display-sm text-ink">
              Report tutor
            </SheetTitle>
          </SheetHeader>

          {/* Reason picker */}
          <div className="space-y-2.5 mb-5">
            {REPORT_REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  reportReason === r.value
                    ? "border-accent bg-accent-soft"
                    : "border-hairline bg-surface"
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
                <span className="text-body-sm text-ink">{r.label}</span>
              </label>
            ))}
          </div>

          {/* Details textarea */}
          <textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="Additional details (optional)"
            rows={3}
            className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-body-sm text-ink placeholder:text-ink-subtle resize-none focus:outline-none focus:ring-2 focus:ring-accent mb-5"
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleReport}
            disabled={createReport.isPending}
            className="w-full h-12 rounded-lg bg-accent text-accent-foreground text-label font-medium disabled:opacity-60"
          >
            {createReport.isPending ? "Submitting…" : "Submit report"}
          </motion.button>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TutorProfilePage;
