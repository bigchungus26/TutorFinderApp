// ============================================================
// Tutr — TutorProfileSettings
// Tutor's own profile page: header skeleton on load, courses
// taught, availability link, dark mode toggle, save with toast.
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BadgeCheck,
  Star,
  Settings,
  ArrowRightLeft,
  HelpCircle,
  LogOut,
  ChevronRight,
  CalendarDays,
  BookOpen,
  Monitor,
  MessageCircle,
  X,
  Check,
  PenLine,
  PauseCircle,
  Zap,
  CreditCard,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversity } from "@/contexts/UniversityContext";
import {
  useUniversities,
  useTutor,
  useUpdateProfile,
  useSetTutorCourses,
  useCourses,
  useTutorSubscription,
} from "@/hooks/useSupabaseQuery";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { ProfileHeaderSkeleton } from "@/components/skeletons";
import { variants, springs, transitions } from "@/lib/motion";
import { toast, toastError } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";

// ── Theme Toggle ───────────────────────────────────────────────
const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Monitor }[] = [
  { mode: "light", label: "Light", icon: Monitor },
  { mode: "auto", label: "Auto", icon: Monitor },
  { mode: "dark", label: "Dark", icon: Monitor },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex bg-muted rounded-full p-1 gap-0.5">
      {THEME_OPTIONS.map(({ mode, label }) => (
        <motion.button
          key={mode}
          onClick={() => setTheme(mode)}
          className="flex-1 py-1.5 rounded-full text-caption font-medium relative"
          whileTap={{ scale: 0.97 }}
        >
          {theme === mode && (
            <motion.div
              layoutId="tutor-theme-pill"
              className="absolute inset-0 bg-surface rounded-full shadow-sm"
              transition={springs.smooth}
            />
          )}
          <span
            className={`relative z-10 ${theme === mode ? "text-foreground" : "text-ink-muted"}`}
          >
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ── Edit Profile Sheet ─────────────────────────────────────────
interface EditProfileSheetProps {
  profile: {
    id: string;
    full_name: string;
    major: string;
    year: string;
    bio: string;
    hourly_rate: number | null;
    online: boolean;
    in_person: boolean;
    tutor_status: "student" | "alumni" | null;
    cancellation_hours: number;
  };
  onClose: () => void;
}

function EditProfileSheet({ profile, onClose }: EditProfileSheetProps) {
  const [name, setName] = useState(profile.full_name ?? "");
  const [major, setMajor] = useState(profile.major ?? "");
  const [year, setYear] = useState(profile.year ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [rate, setRate] = useState(String(profile.hourly_rate ?? ""));
  const [online, setOnline] = useState(profile.online ?? false);
  const [inPerson, setInPerson] = useState(profile.in_person ?? false);
  const [tutorStatus, setTutorStatus] = useState<"student" | "alumni" | null>(profile.tutor_status ?? null);
  const [cancellationHours, setCancellationHours] = useState(profile.cancellation_hours ?? 4);
  const updateProfile = useUpdateProfile();

  const handleSave = useCallback(async () => {
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        full_name: name,
        major,
        year,
        bio,
        hourly_rate: rate ? parseFloat(rate) : null,
        online,
        in_person: inPerson,
        tutor_status: tutorStatus,
        cancellation_hours: cancellationHours,
      });
      toast.success("Profile saved");
      onClose();
    } catch (err) {
      toastError(err);
    }
  }, [profile.id, name, major, year, bio, rate, online, inPerson, tutorStatus, cancellationHours, updateProfile, onClose]);

  return (
    <>
      <motion.div
        key="tutor-edit-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitions.standard}
        className="fixed inset-0 bg-foreground/30 z-[80]"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key="tutor-edit-sheet"
        variants={variants.sheetIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
        style={{ maxHeight: "92dvh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Edit tutor profile"
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
          <h2 className="text-h2 font-display text-foreground">Edit profile</h2>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onClose}
            className="p-2 -mr-2 rounded-xl hover:bg-muted" aria-label="Close">
            <X size={20} className="text-ink-muted" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
          {[
            { label: "Full name", value: name, onChange: setName, placeholder: "Your name" },
            { label: "Major", value: major, onChange: setMajor, placeholder: "e.g. Computer Science" },
            { label: "Year", value: year, onChange: setYear, placeholder: "e.g. Junior" },
            { label: "Hourly rate ($)", value: rate, onChange: setRate, placeholder: "e.g. 25" },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-caption text-ink-muted uppercase tracking-wider block mb-1.5">
                {field.label}
              </label>
              <input
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
              />
            </div>
          ))}

          <div>
            <label className="text-caption text-ink-muted uppercase tracking-wider block mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              placeholder="Tell students about your teaching style and experience…"
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-body text-foreground placeholder:text-ink-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            />
          </div>

          {/* Location modes */}
          <div>
            <p className="text-caption text-ink-muted uppercase tracking-wider mb-2">
              Session modes
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Online", value: online, onChange: setOnline },
                { label: "In-person", value: inPerson, onChange: setInPerson },
              ].map(({ label, value, onChange }) => (
                <motion.button
                  key={label}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChange(!value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                    value ? "border-accent bg-accent-light" : "border-border bg-surface"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                      value ? "bg-accent border-accent" : "border-border"
                    }`}
                  >
                    {value && <Check size={12} className="text-accent-foreground" />}
                  </div>
                  <span className={`text-label font-medium ${value ? "text-accent" : "text-foreground"}`}>
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* University status */}
          <div>
            <p className="text-caption text-ink-muted uppercase tracking-wider mb-2">
              University status
            </p>
            <div className="flex gap-2">
              {([
                { value: "student" as const, label: "Current student" },
                { value: "alumni" as const, label: "Alumni" },
              ]).map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTutorStatus((prev) => (prev === value ? null : value))}
                  className={`flex-1 py-2.5 rounded-xl border text-label font-medium transition-colors ${
                    tutorStatus === value
                      ? "border-accent bg-accent-light text-accent"
                      : "border-border bg-surface text-foreground"
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
            <p className="mt-1.5 text-caption text-ink-muted">Tap again to clear.</p>
          </div>

          {/* Cancellation policy — Story 11 */}
          <div>
            <p className="text-caption text-ink-muted uppercase tracking-wider mb-2">
              Cancellation policy
            </p>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-body-sm text-foreground">
                {cancellationHours === 0
                  ? "Flexible — cancel any time"
                  : `${cancellationHours}h notice required`}
              </span>
              <span className="text-caption text-ink-muted">{cancellationHours}h</span>
            </div>
            <input
              type="range"
              min={0}
              max={48}
              step={1}
              value={cancellationHours}
              onChange={e => setCancellationHours(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-caption text-ink-muted mt-1">
              <span>Flexible</span>
              <span>48h</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-border bg-surface">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground text-body font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {updateProfile.isPending ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full"
                />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Courses Edit Sheet ─────────────────────────────────────────
interface TutorCoursesSheetProps {
  tutorId: string;
  currentCourseIds: string[];
  universityId?: string | null;
  onClose: () => void;
}

function TutorCoursesSheet({
  tutorId,
  currentCourseIds,
  universityId,
  onClose,
}: TutorCoursesSheetProps) {
  const [selected, setSelected] = useState<Map<string, string>>(
    new Map(currentCourseIds.map((id) => [id, "A"]))
  );
  const [search, setSearch] = useState("");
  const setTutorCourses = useSetTutorCourses();
  const { data: allCourses = [] } = useCourses(universityId ?? undefined);

  const filtered = allCourses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      next.has(id) ? next.delete(id) : next.set(id, "A");
      return next;
    });
  };

  const handleSave = useCallback(async () => {
    try {
      await setTutorCourses.mutateAsync({
        tutorId,
        courses: Array.from(selected.entries()).map(([course_id, grade]) => ({
          course_id,
          grade,
        })),
      });
      toast.success("Courses updated");
      onClose();
    } catch (err) {
      toastError(err);
    }
  }, [tutorId, selected, setTutorCourses, onClose]);

  return (
    <>
      <motion.div
        key="tutor-courses-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitions.standard}
        className="fixed inset-0 bg-foreground/30 z-[80]"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key="tutor-courses-sheet"
        variants={variants.sheetIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
        style={{ maxHeight: "88dvh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Edit courses taught"
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
          <h2 className="text-h2 font-display text-foreground">Courses I teach</h2>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onClose}
            className="p-2 -mr-2 rounded-xl hover:bg-muted" aria-label="Close">
            <X size={20} className="text-ink-muted" />
          </motion.button>
        </div>
        <div className="px-5 pb-3 flex-shrink-0">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full h-10 rounded-lg border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {filtered.length === 0 ? (
            <p className="text-body-sm text-ink-muted text-center py-8">No courses found.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((course) => {
                const isSelected = selected.has(course.id);
                return (
                  <motion.button
                    key={course.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggle(course.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                      isSelected ? "bg-accent-light" : "hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "bg-accent border-accent" : "border-border"
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-accent-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-label font-medium ${isSelected ? "text-accent" : "text-foreground"}`}>
                        {course.code}
                      </p>
                      <p className="text-caption text-ink-muted truncate">{course.name}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-border bg-surface">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={setTutorCourses.isPending}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground text-body font-semibold disabled:opacity-40 flex items-center justify-center"
          >
            {setTutorCourses.isPending ? "Saving…" : `Save (${selected.size} selected)`}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Settings row helper ────────────────────────────────────────
interface SettingsRowProps {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  destructive?: boolean;
  highlight?: boolean;
  right?: React.ReactNode;
}

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  onClick,
  destructive,
  highlight,
  right,
}: SettingsRowProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${destructive ? "text-destructive" : ""}`}
    >
      <Icon
        size={20}
        className={
          destructive ? "text-destructive" : highlight ? "text-accent" : "text-ink-muted"
        }
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-label font-medium ${
            destructive ? "text-destructive" : highlight ? "text-accent" : "text-foreground"
          }`}
        >
          {label}
        </p>
        {sublabel && <p className="text-caption text-ink-muted">{sublabel}</p>}
      </div>
      {right !== undefined ? right : <ChevronRight size={16} className="text-ink-muted flex-shrink-0" />}
    </motion.button>
  );
}

// ── Main Page ──────────────────────────────────────────────────
const TutorProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { data: tutorProfile } = useTutor(user?.id ?? "");
  const { selectedUniversity } = useUniversity();
  const { data: universities = [] } = useUniversities();
  const activeProfile = (tutorProfile as typeof profile) ?? profile;
  const uni = universities.find(
    (u) => u.id === (activeProfile?.university_id || selectedUniversity)
  );

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editCoursesOpen, setEditCoursesOpen] = useState(false);
  const isPaused = !!(profile as any)?.paused_until && new Date((profile as any).paused_until) > new Date();

  // Subscription state from tutor_subscriptions table
  const { data: subscription } = useTutorSubscription(user?.id ?? "");
  const subStatus = subscription?.status ?? "inactive";
  const isGrace = subStatus === "grace_period";
  const isInactive = subStatus === "inactive";

  useEffect(() => {
    if (searchParams.get("edit") !== "1") return;
    setEditProfileOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Story 27: Real-time subscription for new booking requests
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`tutor-requests-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sessions", filter: `tutor_id=eq.${user.id}` },
        (payload) => {
          toast.success("New session request!", {
            description: "A student wants to book a session with you.",
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const handleTogglePause = useCallback(async () => {
    if (!user?.id) return;
    const newPausedUntil = isPaused ? null : new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    await supabase.from("profiles").update({ paused_until: newPausedUntil }).eq("id", user.id);
    await refreshProfile();
    toast.success(isPaused ? "Bookings resumed" : "Bookings paused for 24 hours");
  }, [user?.id, isPaused, refreshProfile]);

  const handleBoost = useCallback(async () => {
    if (!user?.id) return;
    const endsAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    await supabase
      .from("tutor_boosts")
      .upsert({ tutor_id: user.id, active: true, started_at: new Date().toISOString(), ends_at: endsAt }, { onConflict: "tutor_id" });
    toast.success("Profile boosted for 7 days!");
  }, [user?.id]);

  // Gather tutor's courses from profile (populated by useTutor)
  const tutorCourses: { course_id: string; course?: { code: string; name: string } }[] =
    (tutorProfile as any)?.tutor_courses ?? [];
  const tutorStats = (tutorProfile as any)?.tutor_stats ?? null;

  const switchToStudent = useCallback(async () => {
    if (!user) return;
    await supabase.from("profiles").update({ role: "student" }).eq("id", user.id);
    await refreshProfile();
    // Story 32: route to student onboarding if student profile not yet set up
    if (!activeProfile?.major) {
      navigate("/onboarding/student");
    } else {
      navigate("/");
    }
  }, [user, activeProfile, refreshProfile, navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/welcome");
    } catch (err) {
      toastError(err);
    }
  }, [signOut, navigate]);

  const currentCourseIds = tutorCourses.map((tc) => tc.course_id);

  return (
    <>
      <div className="px-5 pt-14 pb-28 overflow-y-auto">

        {/* ── Subscription banners ── */}
        {isInactive && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-label font-semibold text-red-700 mb-1">Membership inactive</p>
            <p className="text-body-sm text-red-600">
              Your TUTR membership is inactive. Your profile is hidden from search.
              Renew your $50/month subscription — payment instructions will be sent separately.
            </p>
          </div>
        )}
        {isGrace && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-label font-semibold text-amber-700 mb-1">Renewal needed</p>
            <p className="text-body-sm text-amber-600">
              Your subscription is in its grace period. Renew within 7 days to stay visible in search.
            </p>
          </div>
        )}

        {/* ── Profile header ── */}
        {loading && !activeProfile ? (
          <ProfileHeaderSkeleton />
        ) : (
          <motion.div
            variants={variants.fadeSlideUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center mb-6"
          >
            <img
              src={activeProfile?.avatar_url || "https://i.pravatar.cc/100?img=11"}
              alt={activeProfile?.full_name ?? "Tutor"}
              className="w-24 h-24 rounded-full object-cover mb-3"
            />
            <div className="flex items-center gap-1.5 mb-1">
              <h1 className="text-h1 font-display text-foreground">{activeProfile?.full_name ?? "Tutor"}</h1>
              {activeProfile?.verified && (
                <BadgeCheck size={18} className="text-accent flex-shrink-0" />
              )}
            </div>
            {uni && (
              <span
                className="text-caption px-2.5 py-0.5 rounded-full font-medium mb-1"
                style={{ backgroundColor: uni.color + "18", color: uni.color }}
              >
                {uni.short_name}
              </span>
            )}
            <p className="text-body-sm text-ink-muted">
              {[activeProfile?.major, activeProfile?.year].filter(Boolean).join(", ")}
            </p>
          </motion.div>
        )}

        {/* ── Stats row ── */}
        {!loading && (
          <div className="flex items-center justify-around bg-surface rounded-xl border border-border p-4 mb-5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Star size={14} className="text-accent fill-accent" />
                <span className="text-h2 font-display text-foreground font-semibold">
                  {tutorStats?.rating ? tutorStats.rating.toFixed(1) : "—"}
                </span>
              </div>
              <span className="text-caption text-ink-muted">Rating</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-h2 font-display text-foreground font-semibold mb-0.5">
                {tutorStats?.sessions_completed ?? 0}
              </div>
              <span className="text-caption text-ink-muted">Sessions</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-h2 font-display text-foreground font-semibold mb-0.5">
                ${activeProfile?.hourly_rate ?? 0}
              </div>
              <span className="text-caption text-ink-muted">Per hour</span>
            </div>
          </div>
        )}

        {/* ── Courses I teach ── */}
        <div className="bg-surface rounded-xl border border-border p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-label font-semibold text-foreground flex items-center gap-1.5">
              <BookOpen size={16} className="text-accent" />
              Courses I teach
            </h2>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setEditCoursesOpen(true)}
              className="text-label text-accent font-medium"
            >
              Edit
            </motion.button>
          </div>
          {tutorCourses.length === 0 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setEditCoursesOpen(true)}
              className="w-full py-3 rounded-lg border border-dashed border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent transition-colors"
            >
              + Add courses you can tutor
            </motion.button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tutorCourses.map((tc) => (
                <span
                  key={tc.course_id}
                  className="px-3 py-1 rounded-full bg-accent-light text-accent text-label font-medium"
                >
                  {tc.course?.code ?? tc.course_id}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Settings ── */}
        <div className="bg-surface rounded-xl border border-border divide-y divide-border mb-5">
          <SettingsRow
            icon={PenLine}
            label="Edit profile"
            onClick={() => setEditProfileOpen(true)}
          />

          {/* Availability link */}
          <SettingsRow
            icon={CalendarDays}
            label="Availability"
            sublabel="Set your weekly available slots"
            onClick={() => navigate("/tutor/schedule#availability")}
          />
          <SettingsRow
            icon={MessageCircle}
            label="Messages"
            sublabel="Open conversations with students"
            onClick={() => navigate("/tutor/messages")}
          />

          {/* Story 28: Pause bookings */}
          <SettingsRow
            icon={PauseCircle}
            label={isPaused ? "Resume bookings" : "Pause bookings"}
            sublabel={isPaused ? "Bookings are currently paused" : "Pause new bookings for 24 hours"}
            onClick={handleTogglePause}
            right={
              <span className={`text-caption font-medium px-2 py-0.5 rounded-full ${isPaused ? "bg-amber-100 text-amber-700" : "bg-muted text-ink-muted"}`}>
                {isPaused ? "Paused" : "Active"}
              </span>
            }
          />

          {/* Story 31: Boost profile */}
          <SettingsRow
            icon={Zap}
            label="Boost profile"
            sublabel="Featured in search for 7 days"
            onClick={handleBoost}
            highlight
          />

          {/* Story 30: Subscription */}
          <SettingsRow
            icon={CreditCard}
            label="Subscription"
            sublabel={`Plan: ${profile?.subscription_plan ?? "Free"} · ${profile?.subscription_status ?? "—"}`}
            right={<ChevronRight size={16} className="text-ink-muted flex-shrink-0" />}
          />

          {/* Appearance with inline toggle */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Monitor size={20} className="text-ink-muted flex-shrink-0" />
            <div className="flex-1">
              <p className="text-label font-medium text-foreground">Appearance</p>
            </div>
            <ThemeToggle />
          </div>

          <SettingsRow
            icon={Settings}
            label="Account settings"
          />
          <SettingsRow
            icon={ArrowRightLeft}
            label="Switch to student mode"
            highlight
            onClick={switchToStudent}
          />
          <SettingsRow
            icon={HelpCircle}
            label="Help & support"
            sublabel="Get help or report an issue"
            onClick={() => navigate("/support")}
          />
          <SettingsRow
            icon={LogOut}
            label="Sign out"
            destructive
            onClick={handleSignOut}
            right={<span />}
          />
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-center gap-6 pb-4">
          <button className="text-caption text-ink-muted hover:text-foreground transition-colors">
            Privacy
          </button>
          <button className="text-caption text-ink-muted hover:text-foreground transition-colors">
            Terms
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editProfileOpen && (activeProfile ?? profile) && (
          <EditProfileSheet
            key="tutor-edit-profile"
            profile={{
              ...(activeProfile ?? profile),
              tutor_status: ((activeProfile ?? profile) as any)?.tutor_status ?? null,
              cancellation_hours: (activeProfile ?? profile)?.cancellation_hours ?? 4,
            }}
            onClose={() => setEditProfileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editCoursesOpen && user && (
          <TutorCoursesSheet
            key="tutor-courses-sheet"
            tutorId={user.id}
            currentCourseIds={currentCourseIds}
            universityId={activeProfile?.university_id}
            onClose={() => setEditCoursesOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TutorProfilePage;
