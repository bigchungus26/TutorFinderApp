// ============================================================
// Tutr — BookingSheet (C3)
// End-to-end booking bottom sheet: 3-step flow.
//   Step 1: Pick details (slot, course, duration, location)
//   Step 2: Optional message to tutor
//   Step 3: Review & confirm
// ============================================================
import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Video, MapPin, Clock, BadgeCheck } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { useCreateRequest } from "@/hooks/useSupabaseQuery";
import { useAvailability } from "@/hooks/useAvailability";
import type { AvailabilitySlot } from "@/hooks/useAvailability";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { toast } from "@/components/ui/sonner";
import { variants, transitions } from "@/lib/motion";
import type { TutorWithDetails } from "@/types/database";

// ── Types ──────────────────────────────────────────────────────
interface SelectedSlot {
  day: number;        // Mon-based (0=Mon, 6=Sun) from AvailabilitySlot.day_of_week
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
}

interface LocalSlot {
  date: string;       // "YYYY-MM-DD" — the concrete date
  dayOfWeek: number;  // JS convention 0=Sun
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
}

export interface BookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: TutorWithDetails;
  selectedSlot?: SelectedSlot | null;
}

type Duration = 30 | 60 | 90;
type LocationMode = "online" | "in-person";

// ── Helpers ────────────────────────────────────────────────────
const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

function formatTime(t: string): string {
  // "14:30" → "2:30 PM"
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m} ${period}`;
}

function formatPrice(rate: number | null, durationMins: Duration): string {
  if (!rate) return "—";
  const hours = durationMins / 60;
  const total = rate * hours;
  return `$${total.toFixed(2)}`;
}

// ── Step dot indicator ─────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current
              ? "w-5 bg-accent"
              : i === current - 1
              ? "w-5 bg-accent"
              : "w-2 bg-border"
          } ${i === current - 1 ? "opacity-100" : i < current - 1 ? "opacity-60" : "opacity-40"}`}
        />
      ))}
    </div>
  );
}

// ── Selection chip ─────────────────────────────────────────────
interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

function Chip({ label, selected, onClick, icon }: ChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-label transition-colors ${
        selected
          ? "bg-accent text-accent-foreground border-accent"
          : "bg-surface text-foreground border-border"
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

// ── Section label ──────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-caption text-ink-muted uppercase tracking-wider mb-2">{children}</p>
  );
}

// ── Main component ─────────────────────────────────────────────
export function BookingSheet({ isOpen, onClose, tutor, selectedSlot }: BookingSheetProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createRequest = useCreateRequest();

  // ── Step state ─────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Step 1 form state ──────────────────────────────────────
  const taughtCourses = tutor.tutor_courses ?? [];
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    taughtCourses[0]?.course_id ?? ""
  );
  const [duration, setDuration] = useState<Duration>(60);
  const [locationMode, setLocationMode] = useState<LocationMode>(
    tutor.online ? "online" : "in-person"
  );

  // ── Step 2 form state ──────────────────────────────────────
  const [message, setMessage] = useState("");
  const MAX_MESSAGE = 500;

  // ── Success overlay ────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Availability ───────────────────────────────────────────
  const { data: availability = [] } = useAvailability(tutor.id);
  const [localSlot, setLocalSlot] = useState<LocalSlot | null>(null);

  // ── Derived values ─────────────────────────────────────────
  const selectedCourse = taughtCourses.find(
    (tc) => tc.course_id === selectedCourseId
  );
  const price = formatPrice(tutor.hourly_rate, duration);

  // ── Calendar data ──────────────────────────────────────────
  const next7Days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const jsDay = d.getDay(); // 0=Sun
      return {
        date: d,
        dateStr: d.toISOString().split("T")[0],
        jsDay,
        monDay: jsDay === 0 ? 6 : jsDay - 1, // Mon-based 0=Mon
        label: i === 0 ? "Today" : i === 1 ? "Tmrw" : d.toLocaleDateString("en-US", { weekday: "short" }),
        dateLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    });
  }, []);

  const slotsByMonDay = useMemo(() => {
    const map: Record<number, AvailabilitySlot[]> = {};
    for (const slot of availability) {
      if (!map[slot.day_of_week]) map[slot.day_of_week] = [];
      map[slot.day_of_week].push(slot);
    }
    return map;
  }, [availability]);


  // ── Handlers ───────────────────────────────────────────────
  const handleClose = useCallback(() => {
    // Reset state on close
    setStep(1);
    setMessage("");
    setShowSuccess(false);
    setLocalSlot(null);
    onClose();
  }, [onClose]);

  // Sync localSlot from selectedSlot when sheet opens
  useEffect(() => {
    if (!isOpen) return;
    if (!selectedSlot) return;
    // selectedSlot.day is Mon-based (from AvailabilitySlot.day_of_week)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const monDay = d.getDay() === 0 ? 6 : d.getDay() - 1;
      if (monDay === selectedSlot.day) {
        setLocalSlot({
          date: d.toISOString().split("T")[0],
          dayOfWeek: d.getDay(),
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
        });
        return;
      }
    }
  }, [isOpen, selectedSlot]);

  const handleConfirm = useCallback(async () => {
    if (!user?.id) return;

    // Use the locally selected slot date/time, or fall back to today/09:00
    const date = localSlot?.date ?? new Date().toISOString().split("T")[0];
    const time = localSlot?.start_time ?? "09:00";

    try {
      await createRequest.mutateAsync({
        student_id: user.id,
        tutor_id: tutor.id,
        course_id: selectedCourseId,
        date,
        time,
        duration,
        location: locationMode,
        message,
      });
      setShowSuccess(true);
    } catch (err: any) {
      toast(err?.message || "Failed to send request. Please try again.");
    }
  }, [user, tutor, selectedCourseId, duration, locationMode, message, localSlot, createRequest]);

  const handleSuccessDismiss = useCallback(() => {
    setShowSuccess(false);
    handleClose();
    navigate("/sessions");
  }, [handleClose, navigate]);

  // ── Render nothing if closed ───────────────────────────────
  return (
    <>
      {/* Success overlay — rendered outside sheet so it covers everything */}
      <SuccessOverlay
        visible={showSuccess}
        title="Request sent!"
        description={`${tutor.full_name} will respond shortly.`}
        onDismiss={handleSuccessDismiss}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="booking-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitions.standard}
              className="fixed inset-0 bg-foreground/30 z-[80]"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Bottom sheet */}
            <motion.div
              key="booking-sheet"
              variants={variants.sheetIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
              style={{ maxHeight: "92dvh" }}
              role="dialog"
              aria-modal="true"
              aria-label="Book a session"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              {/* Header row: back + close */}
              <div className="flex items-center justify-between px-5 pt-2 pb-1 flex-shrink-0">
                {step > 1 ? (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                    className="p-2 -ml-2 rounded-xl hover:bg-muted"
                    aria-label="Back"
                  >
                    <ArrowLeft size={20} className="text-foreground" />
                  </motion.button>
                ) : (
                  <div className="w-9" />
                )}
                <h2 className="text-display-sm">
                  {step === 1 && "Book a session"}
                  {step === 2 && "Add a message"}
                  {step === 3 && "Confirm booking"}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleClose}
                  className="p-2 -mr-2 rounded-xl hover:bg-muted"
                  aria-label="Close"
                >
                  <X size={20} className="text-ink-muted" />
                </motion.button>
              </div>

              {/* Step dots */}
              <div className="flex-shrink-0 px-5">
                <StepDots current={step} total={3} />
              </div>

              {/* Scrollable step content */}
              <div className="flex-1 overflow-y-auto px-5 pb-4">
                <AnimatePresence mode="wait">

                  {/* ── Step 1: Pick details ─────────────────────── */}
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      variants={variants.fadeSlideUp}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      {/* Full availability calendar */}
                      <div>
                        <FieldLabel>Select a time</FieldLabel>
                        {availability.length === 0 ? (
                          <p className="text-body-sm text-ink-muted py-1">
                            No availability set — you can still send a request.
                          </p>
                        ) : (
                          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                            {next7Days.map(({ date: dayDate, dateStr, monDay, label, dateLabel }) => {
                              const daySlots = slotsByMonDay[monDay] ?? [];
                              const hasSlots = daySlots.length > 0;
                              return (
                                <div
                                  key={dateStr}
                                  className={`flex-shrink-0 w-[96px] rounded-xl border p-2.5 ${
                                    hasSlots
                                      ? "bg-surface border-border"
                                      : "bg-muted/30 border-border/40 opacity-40"
                                  }`}
                                >
                                  <p className={`text-label font-semibold mb-0.5 ${hasSlots ? "text-foreground" : "text-ink-muted"}`}>
                                    {label}
                                  </p>
                                  <p className="text-caption text-ink-muted mb-2">{dateLabel}</p>
                                  {hasSlots ? (
                                    <div className="space-y-1.5">
                                      {daySlots.map(slot => {
                                        const isSelected =
                                          localSlot?.date === dateStr &&
                                          localSlot?.start_time === slot.start_time;
                                        return (
                                          <motion.button
                                            key={slot.id ?? `${slot.day_of_week}-${slot.start_time}`}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setLocalSlot({
                                              date: dateStr,
                                              dayOfWeek: dayDate.getDay(),
                                              start_time: slot.start_time,
                                              end_time: slot.end_time,
                                            })}
                                            className={`w-full text-center px-1.5 py-1.5 rounded-lg text-caption font-medium transition-colors cursor-pointer ${
                                              isSelected
                                                ? "bg-accent text-white"
                                                : "bg-accent/10 text-accent hover:bg-accent hover:text-white"
                                            }`}
                                          >
                                            {formatTime(slot.start_time)}
                                          </motion.button>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-caption text-ink-muted text-center py-1">—</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {localSlot && (
                          <div className="mt-2 flex items-center gap-2 bg-accent-light rounded-lg px-3 py-2">
                            <Clock size={13} className="text-accent flex-shrink-0" />
                            <p className="text-body-sm text-accent font-medium">
                              {new Date(localSlot.date + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short", month: "short", day: "numeric",
                              })} · {formatTime(localSlot.start_time)}–{formatTime(localSlot.end_time)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Course picker */}
                      <div>
                        <FieldLabel>Course</FieldLabel>
                        {taughtCourses.length === 0 ? (
                          <p className="text-body-sm text-ink-muted">No courses available.</p>
                        ) : (
                          <div className="relative">
                            <select
                              value={selectedCourseId}
                              onChange={(e) => setSelectedCourseId(e.target.value)}
                              className="w-full h-11 rounded-lg border border-border bg-surface px-3 pr-9 text-body text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                            >
                              {taughtCourses.map((tc) => (
                                <option key={tc.course_id} value={tc.course_id}>
                                  {tc.course.code} — {tc.course.name}
                                </option>
                              ))}
                            </select>
                            {/* Chevron */}
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Duration picker */}
                      <div>
                        <FieldLabel>Duration</FieldLabel>
                        <div className="flex gap-2">
                          {([30, 60, 90] as Duration[]).map((d) => (
                            <Chip
                              key={d}
                              label={`${d} min`}
                              selected={duration === d}
                              onClick={() => setDuration(d)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Location picker */}
                      <div>
                        <FieldLabel>Location</FieldLabel>
                        <div className="flex gap-2">
                          {tutor.online && (
                            <Chip
                              label="Online"
                              selected={locationMode === "online"}
                              onClick={() => setLocationMode("online")}
                              icon={<Video size={14} />}
                            />
                          )}
                          {tutor.in_person && (
                            <Chip
                              label="In-person"
                              selected={locationMode === "in-person"}
                              onClick={() => setLocationMode("in-person")}
                              icon={<MapPin size={14} />}
                            />
                          )}
                          {!tutor.online && !tutor.in_person && (
                            <p className="text-body-sm text-ink-muted">
                              Contact tutor to arrange location.
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Step 2: Message ──────────────────────────── */}
                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      variants={variants.fadeSlideUp}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-3"
                    >
                      <p className="text-body-sm text-ink-muted">
                        Let {tutor.full_name.split(" ")[0]} know a bit about yourself or what you need help with.
                      </p>
                      <div className="relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                          placeholder="Introduce yourself or ask a question…"
                          rows={5}
                          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-body text-foreground placeholder:text-ink-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                        />
                        <span className="absolute bottom-3 right-3 text-caption text-ink-muted">
                          {message.length}/{MAX_MESSAGE}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Step 3: Review & confirm ─────────────────── */}
                  {step === 3 && (
                    <motion.div
                      key="step-3"
                      variants={variants.fadeSlideUp}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-4"
                    >
                      {/* Tutor summary row */}
                      <div className="flex items-center gap-3 bg-accent-light rounded-xl p-4">
                        <Avatar
                          src={tutor.avatar_url}
                          name={tutor.full_name}
                          size={48}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-body font-medium text-foreground">{tutor.full_name}</span>
                            {tutor.verified && (
                              <BadgeCheck size={14} className="text-accent flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-body-sm text-ink-muted">{tutor.major}, {tutor.year}</span>
                        </div>
                      </div>

                      {/* Booking details */}
                      <div className="bg-surface rounded-xl border border-border divide-y divide-border">
                        {/* Course */}
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-body-sm text-ink-muted">Course</span>
                          <span className="text-body-sm text-foreground font-medium">
                            {selectedCourse
                              ? `${selectedCourse.course.code}`
                              : "—"}
                          </span>
                        </div>

                        {/* Date & time */}
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-body-sm text-ink-muted">Date & time</span>
                          <span className="text-body-sm text-foreground font-medium text-right">
                            {localSlot
                              ? `${new Date(localSlot.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}, ${formatTime(localSlot.start_time)}`
                              : "Flexible"}
                          </span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-body-sm text-ink-muted">Duration</span>
                          <span className="text-body-sm text-foreground font-medium">{duration} min</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-body-sm text-ink-muted">Location</span>
                          <span className="text-body-sm text-foreground font-medium capitalize">
                            {locationMode}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-body-sm text-ink-muted">Total</span>
                          <span className="text-body font-semibold text-foreground">{price}</span>
                        </div>
                      </div>

                      {/* Message preview */}
                      {message.trim().length > 0 && (
                        <div className="bg-surface rounded-xl border border-border px-4 py-3">
                          <p className="text-caption text-ink-muted uppercase tracking-wider mb-1.5">
                            Your message
                          </p>
                          <p className="text-body-sm text-ink-muted leading-relaxed line-clamp-3">
                            {message}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* ── Footer: action buttons ──────────────────────── */}
              <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-border bg-surface space-y-3">
                {step === 1 && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    disabled={!selectedCourseId || (availability.length > 0 && !localSlot)}
                    className="w-full h-14 rounded-lg bg-accent text-accent-foreground text-body font-semibold disabled:opacity-40 transition-opacity"
                  >
                    Next
                  </motion.button>
                )}

                {step === 2 && (
                  <div className="space-y-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)}
                      className="w-full h-14 rounded-lg bg-accent text-accent-foreground text-body font-semibold"
                    >
                      Next
                    </motion.button>
                    <button
                      onClick={() => setStep(3)}
                      className="w-full h-10 text-body-sm text-ink-muted hover:text-foreground transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    disabled={createRequest.isPending}
                    className="w-full h-14 rounded-lg bg-accent text-accent-foreground text-body font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-opacity"
                  >
                    {createRequest.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full"
                        />
                        Sending…
                      </>
                    ) : (
                      "Confirm booking"
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
