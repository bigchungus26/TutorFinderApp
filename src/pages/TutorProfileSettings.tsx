// ============================================================
// Teachme — TutorProfileSettings
// Tutor's own profile page: header skeleton on load, courses
// taught, availability link, dark mode toggle, save with toast.
// ============================================================
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  X,
  Check,
  PenLine,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversity } from "@/contexts/UniversityContext";
import {
  useUniversities,
  useUpdateProfile,
  useSetTutorCourses,
  useCourses,
} from "@/hooks/useSupabaseQuery";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { ProfileHeaderSkeleton } from "@/components/skeletons";
import { variants, transitions } from "@/lib/motion";
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
    <div className="flex bg-muted rounded-pill p-1 gap-0.5">
      {THEME_OPTIONS.map(({ mode, label }) => (
        <motion.button
          key={mode}
          onClick={() => setTheme(mode)}
          className="flex-1 py-1.5 rounded-pill text-caption font-medium relative"
          whileTap={{ scale: 0.97 }}
        >
          {theme === mode && (
            <motion.div
              layoutId="tutor-theme-pill"
              className="absolute inset-0 bg-surface rounded-pill shadow-sm"
              transition={transitions.spring}
            />
          )}
          <span
            className={`relative z-10 ${theme === mode ? "text-ink" : "text-ink-muted"}`}
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
      });
      toast.success("Profile saved");
      onClose();
    } catch (err) {
      toastError(err);
    }
  }, [profile.id, name, major, year, bio, rate, online, inPerson, updateProfile, onClose]);

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
          <div className="w-10 h-1 rounded-full bg-hairline" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
          <h2 className="text-display-sm text-ink">Edit profile</h2>
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
                className="w-full h-11 rounded-lg border border-hairline bg-background px-3 text-body text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
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
              className="w-full rounded-xl border border-hairline bg-background px-4 py-3 text-body text-ink placeholder:text-ink-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
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
                    value ? "border-accent bg-accent-soft" : "border-hairline bg-surface"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                      value ? "bg-accent border-accent" : "border-hairline"
                    }`}
                  >
                    {value && <Check size={12} className="text-accent-foreground" />}
                  </div>
                  <span className={`text-label font-medium ${value ? "text-accent" : "text-ink"}`}>
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-hairline bg-surface">
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
          <div className="w-10 h-1 rounded-full bg-hairline" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
          <h2 className="text-display-sm text-ink">Courses I teach</h2>
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
            className="w-full h-10 rounded-lg border border-hairline bg-background px-3 text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
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
                      isSelected ? "bg-accent-soft" : "hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "bg-accent border-accent" : "border-hairline"
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-accent-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-label font-medium ${isSelected ? "text-accent" : "text-ink"}`}>
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
        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-hairline bg-surface">
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
            destructive ? "text-destructive" : highlight ? "text-accent" : "text-ink"
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
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { selectedUniversity } = useUniversity();
  const { data: universities = [] } = useUniversities();
  const uni = universities.find(
    (u) => u.id === (profile?.university_id || selectedUniversity)
  );

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editCoursesOpen, setEditCoursesOpen] = useState(false);

  // Gather tutor's courses from profile (populated by useTutor)
  const tutorCourses: { course_id: string; course?: { code: string; name: string } }[] =
    (profile as any)?.tutor_courses ?? [];
  const tutorStats = (profile as any)?.tutor_stats ?? null;

  const switchToStudent = useCallback(async () => {
    if (!user) return;
    await supabase.from("profiles").update({ role: "student" }).eq("id", user.id);
    await refreshProfile();
    navigate("/");
  }, [user, refreshProfile, navigate]);

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

        {/* ── Profile header ── */}
        {loading ? (
          <ProfileHeaderSkeleton />
        ) : (
          <motion.div
            variants={variants.fadeSlideUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center mb-6"
          >
            <img
              src={profile?.avatar_url || "https://i.pravatar.cc/100?img=11"}
              alt={profile?.full_name ?? "Tutor"}
              className="w-24 h-24 rounded-full object-cover mb-3"
            />
            <div className="flex items-center gap-1.5 mb-1">
              <h1 className="text-display-md text-ink">{profile?.full_name ?? "Tutor"}</h1>
              {profile?.verified && (
                <BadgeCheck size={18} className="text-accent flex-shrink-0" />
              )}
            </div>
            {uni && (
              <span
                className="text-caption px-2.5 py-0.5 rounded-pill font-medium mb-1"
                style={{ backgroundColor: uni.color + "18", color: uni.color }}
              >
                {uni.short_name}
              </span>
            )}
            <p className="text-body-sm text-ink-muted">
              {[profile?.major, profile?.year].filter(Boolean).join(", ")}
            </p>
          </motion.div>
        )}

        {/* ── Stats row ── */}
        {!loading && (
          <div className="flex items-center justify-around bg-surface rounded-xl border border-hairline p-4 mb-5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Star size={14} className="text-accent fill-accent" />
                <span className="text-display-sm text-ink font-semibold">
                  {tutorStats?.rating ? tutorStats.rating.toFixed(1) : "—"}
                </span>
              </div>
              <span className="text-caption text-ink-muted">Rating</span>
            </div>
            <div className="w-px h-8 bg-hairline" />
            <div className="text-center">
              <div className="text-display-sm text-ink font-semibold mb-0.5">
                {tutorStats?.sessions_completed ?? 0}
              </div>
              <span className="text-caption text-ink-muted">Sessions</span>
            </div>
            <div className="w-px h-8 bg-hairline" />
            <div className="text-center">
              <div className="text-display-sm text-ink font-semibold mb-0.5">
                ${profile?.hourly_rate ?? 0}
              </div>
              <span className="text-caption text-ink-muted">Per hour</span>
            </div>
          </div>
        )}

        {/* ── Courses I teach ── */}
        <div className="bg-surface rounded-xl border border-hairline p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-label font-semibold text-ink flex items-center gap-1.5">
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
              className="w-full py-3 rounded-lg border border-dashed border-hairline text-body-sm text-ink-muted hover:border-accent hover:text-accent transition-colors"
            >
              + Add courses you can tutor
            </motion.button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tutorCourses.map((tc) => (
                <span
                  key={tc.course_id}
                  className="px-3 py-1 rounded-pill bg-accent-soft text-accent text-label font-medium"
                >
                  {tc.course?.code ?? tc.course_id}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Settings ── */}
        <div className="bg-surface rounded-xl border border-hairline divide-y divide-hairline mb-5">
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

          {/* Appearance with inline toggle */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Monitor size={20} className="text-ink-muted flex-shrink-0" />
            <div className="flex-1">
              <p className="text-label font-medium text-ink">Appearance</p>
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
          <button className="text-caption text-ink-muted hover:text-ink transition-colors">
            Privacy
          </button>
          <button className="text-caption text-ink-muted hover:text-ink transition-colors">
            Terms
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editProfileOpen && profile && (
          <EditProfileSheet
            key="tutor-edit-profile"
            profile={profile}
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
            universityId={profile?.university_id}
            onClose={() => setEditCoursesOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TutorProfilePage;
