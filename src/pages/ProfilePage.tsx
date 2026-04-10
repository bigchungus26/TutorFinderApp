// ============================================================
// Tutr — ProfilePage (Student)
// Sections: header, quick stats, my courses, saved tutors row, settings.
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ChevronRight,
  X,
  Moon,
  Sun,
  Monitor,
  BookOpen,
  PenLine,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversity } from "@/contexts/UniversityContext";
import { useUniversities, useUpdateProfile } from "@/hooks/useSupabaseQuery";
import { useSavedTutors } from "@/hooks/useSavedTutors";
import { useStudentCourses, useSetStudentCourses } from "@/hooks/useStudentCourses";
import { useSessions } from "@/hooks/useSupabaseQuery";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { variants, transitions } from "@/lib/motion";
import { toast, toastError } from "@/components/ui/sonner";
import { CountUp } from "@/components/CountUp";
import { supabase } from "@/lib/supabase";

// ── Helpers ────────────────────────────────────────────────────
function Avatar({ src, name, size = 96 }: { src?: string | null; name?: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const dicebearUrl = name
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=e8f5ee,fbeee3,f5e6d3&fontFamily=serif`
    : null;
  const avatarSrc = src && !src.includes("pravatar.cc") && !imgError ? src : dicebearUrl;

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full flex-shrink-0 ring-4 ring-accent-soft ring-offset-2 ring-offset-background"
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={name ?? "Avatar"}
          style={{ width: size, height: size }}
          className="rounded-full object-cover w-full h-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="rounded-full bg-accent-soft flex items-center justify-center text-accent text-display-sm font-semibold"
        >
          {initials}
        </div>
      )}
    </div>
  );
}

// ── Theme toggle row ───────────────────────────────────────────
const THEME_OPTIONS: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: "light", icon: Sun, label: "Light" },
  { mode: "auto", icon: Monitor, label: "Auto" },
  { mode: "dark", icon: Moon, label: "Dark" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex bg-muted rounded-pill p-1 gap-0.5">
      {THEME_OPTIONS.map(({ mode, icon: Icon, label }) => (
        <motion.button
          key={mode}
          onClick={() => setTheme(mode)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-pill text-caption font-medium relative"
          whileTap={{ scale: 0.97 }}
        >
          {theme === mode && (
            <motion.div
              layoutId="theme-pill"
              className="absolute inset-0 bg-surface rounded-pill shadow-sm"
              transition={transitions.spring}
            />
          )}
          <span className={`relative z-10 flex items-center gap-1 ${theme === mode ? "text-ink" : "text-ink-muted"}`}>
            <Icon size={12} />
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ── Edit Profile Sheet ─────────────────────────────────────────
interface EditProfileSheetProps {
  profile: { id: string; full_name: string; major: string; year: string; bio: string };
  onClose: () => void;
}

function EditProfileSheet({ profile, onClose }: EditProfileSheetProps) {
  const [name, setName] = useState(profile.full_name ?? "");
  const [major, setMajor] = useState(profile.major ?? "");
  const [year, setYear] = useState(profile.year ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const updateProfile = useUpdateProfile();

  const handleSave = useCallback(async () => {
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        full_name: name,
        major,
        year,
        bio,
      });
      toast.success("Profile saved");
      onClose();
    } catch (err) {
      toastError(err);
    }
  }, [profile.id, name, major, year, bio, updateProfile, onClose]);

  return (
    <>
      <motion.div
        key="edit-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitions.standard}
        className="fixed inset-0 bg-foreground/30 z-[80]"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key="edit-sheet"
        variants={variants.sheetIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
        style={{ maxHeight: "90dvh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Edit profile"
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
          {(
            [
              { label: "Full name", value: name, onChange: setName, placeholder: "Your name" },
              { label: "Major", value: major, onChange: setMajor, placeholder: "e.g. Computer Science" },
              { label: "Year", value: year, onChange: setYear, placeholder: "e.g. Junior" },
            ] as const
          ).map((field) => (
            <div key={field.label}>
              <label className="text-caption text-ink-muted uppercase tracking-wider block mb-1.5">
                {field.label}
              </label>
              <input
                value={field.value}
                onChange={(e) => (field.onChange as (v: string) => void)(e.target.value)}
                placeholder={field.placeholder}
                className="w-full h-11 rounded-lg border border-hairline bg-background px-3 text-body text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
              />
            </div>
          ))}
          <div>
            <label className="text-caption text-ink-muted uppercase tracking-wider block mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              placeholder="Tell tutors a bit about yourself…"
              rows={4}
              className="w-full rounded-xl border border-hairline bg-background px-4 py-3 text-body text-ink placeholder:text-ink-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            />
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
interface CoursesSheetProps {
  studentId: string;
  currentCourseIds: string[];
  universityId?: string | null;
  onClose: () => void;
}

function CoursesEditSheet({ studentId, currentCourseIds, universityId, onClose }: CoursesSheetProps) {
  // Load available courses for the student's university
  const [selected, setSelected] = useState<Set<string>>(new Set(currentCourseIds));
  const [search, setSearch] = useState("");
  const setStudentCourses = useSetStudentCourses();
  const [courses, setCourses] = useState<{ id: string; code: string; name: string }[]>([]);

  // Fetch courses on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let query = supabase.from("courses").select("id, code, name").order("code");
      if (universityId) query = query.eq("university_id", universityId);
      const { data } = await query;
      if (!cancelled && data) setCourses(data);
    })();
    return () => { cancelled = true; };
  }, [universityId]);

  const filtered = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSave = useCallback(async () => {
    try {
      await setStudentCourses.mutateAsync({
        studentId,
        courseIds: Array.from(selected),
        semester: "Current",
      });
      toast.success("Courses updated");
      onClose();
    } catch (err) {
      toastError(err);
    }
  }, [studentId, selected, setStudentCourses, onClose]);

  return (
    <>
      <motion.div
        key="courses-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitions.standard}
        className="fixed inset-0 bg-foreground/30 z-[80]"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key="courses-sheet"
        variants={variants.sheetIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
        style={{ maxHeight: "88dvh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Edit courses"
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-hairline" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
          <h2 className="text-display-sm text-ink">My courses</h2>
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
            disabled={setStudentCourses.isPending}
            className="w-full h-14 rounded-lg bg-accent text-accent-foreground text-body font-semibold disabled:opacity-40 flex items-center justify-center"
          >
            {setStudentCourses.isPending ? "Saving…" : `Save (${selected.size} selected)`}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Section row ────────────────────────────────────────────────
interface SettingsRowProps {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  destructive?: boolean;
  highlight?: boolean;
  right?: React.ReactNode;
}

function SettingsRow({ icon: Icon, label, sublabel, onClick, destructive, highlight, right }: SettingsRowProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.99, backgroundColor: highlight ? "hsl(152 50% 93%)" : destructive ? "hsl(0 84% 97%)" : "hsl(40 20% 96%)" }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${highlight ? "bg-accent-soft/50 py-4" : ""} ${destructive ? "text-destructive" : ""}`}
    >
      <Icon
        size={20}
        className={
          destructive ? "text-destructive" : highlight ? "text-accent" : "text-ink-muted"
        }
      />
      <div className="flex-1 min-w-0">
        <p className={`text-label font-medium ${destructive ? "text-destructive" : highlight ? "text-accent" : "text-ink"}`}>
          {label}
        </p>
        {sublabel && (
          <p className="text-caption text-ink-muted">{sublabel}</p>
        )}
      </div>
      {right ?? <ChevronRight size={16} className="text-ink-muted flex-shrink-0" />}
    </motion.button>
  );
}

// ── Main Page ──────────────────────────────────────────────────
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { selectedUniversity } = useUniversity();
  const { data: universities = [] } = useUniversities();
  const uni = universities.find(
    (u) => u.id === (profile?.university_id || selectedUniversity)
  );

  const { data: savedTutors = [] } = useSavedTutors(user?.id ?? "");
  const { data: studentCourses = [] } = useStudentCourses(user?.id ?? "");
  const { data: sessions = [] } = useSessions(user?.id ?? "", "student");

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editCoursesOpen, setEditCoursesOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/welcome");
    } catch (err) {
      toastError(err);
    }
  }, [signOut, navigate]);

  const switchToTutor = useCallback(async () => {
    if (!user) return;
    await supabase.from("profiles").update({ role: "tutor" }).eq("id", user.id);
    await refreshProfile();
    navigate("/tutor/requests");
  }, [user, refreshProfile, navigate]);

  const completedCount = sessions.filter((s: any) => s.status === "completed").length;
  const courseIds = studentCourses.map((sc: any) => sc.course_id as string);

  return (
    <>
      <div className="px-5 pt-14 pb-28 overflow-y-auto">

        {/* ── Profile header ── */}
        <div className="flex flex-col items-center mb-7">
          <Avatar
            src={profile?.avatar_url}
            name={profile?.full_name}
            size={96}
          />
          <h1 className="text-display-md text-ink mt-4 mb-1">
            {profile?.full_name ?? "Student"}
          </h1>
          {/* Accent divider punctuation */}
          <div className="w-6 h-0.5 rounded-full bg-accent mb-2" />
          <div className="flex items-center gap-2 mb-1.5">
            {uni && (
              <span
                className="text-caption px-2.5 py-0.5 rounded-pill font-medium"
                style={{ backgroundColor: uni.color + "18", color: uni.color }}
              >
                {uni.short_name}
              </span>
            )}
            {(profile?.major || profile?.year) && (
              <span className="text-body-sm text-ink-muted">
                {[profile.major, profile.year].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
          {/* Italic micro-stat */}
          {profile?.created_at && (
            <p className="text-caption text-ink-muted italic mb-3">
              Member since{" "}
              {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              {uni ? ` · ${uni.short_name}` : ""}
            </p>
          )}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setEditProfileOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-hairline text-label text-ink hover:bg-muted transition-colors"
          >
            <PenLine size={14} className="text-ink-muted" />
            Edit profile
          </motion.button>
        </div>

        {/* ── Quick stats ── */}
        <div className="bg-surface rounded-xl border border-hairline p-4 mb-5">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <CountUp value={completedCount} className="text-display-sm text-ink font-semibold font-tabular" />
              <p className="text-caption text-ink-muted mt-0.5">Sessions</p>
            </div>
            <div className="w-px h-8 bg-hairline" />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/saved")}
              className="text-center"
            >
              <CountUp value={savedTutors.length} className="text-display-sm text-ink font-semibold font-tabular" />
              <p className="text-caption text-ink-muted mt-0.5">Saved</p>
            </motion.button>
            <div className="w-px h-8 bg-hairline" />
            <div className="text-center">
              <CountUp value={studentCourses.length} className="text-display-sm text-ink font-semibold font-tabular" />
              <p className="text-caption text-ink-muted mt-0.5">Courses</p>
            </div>
          </div>
        </div>

        {/* ── My courses ── */}
        <div className="bg-surface rounded-xl border border-hairline p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-label font-semibold text-ink flex items-center gap-1.5">
              <BookOpen size={16} className="text-accent" />
              My courses
            </h2>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setEditCoursesOpen(true)}
              className="text-label text-accent font-medium"
            >
              Edit
            </motion.button>
          </div>
          {studentCourses.length === 0 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setEditCoursesOpen(true)}
              className="w-full py-3 rounded-lg border border-dashed border-hairline text-body-sm text-ink-muted hover:border-accent hover:text-accent transition-colors"
            >
              + Add your enrolled courses
            </motion.button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {studentCourses.map((sc: any) => (
                <span
                  key={sc.course_id}
                  className="px-3 py-1 rounded-pill bg-accent-soft text-accent text-label font-medium"
                >
                  {sc.course?.code ?? sc.course_id}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Saved tutors row ── */}
        {savedTutors.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/saved")}
            className="w-full bg-surface rounded-xl border border-hairline p-4 mb-5 flex items-center gap-3"
          >
            {/* Stacked avatars */}
            <div className="flex -space-x-2 flex-shrink-0">
              {savedTutors.slice(0, 3).map((st: any) => (
                <img
                  key={st.tutor_id}
                  src={st.tutor?.avatar_url || "https://i.pravatar.cc/100"}
                  alt={st.tutor?.full_name}
                  className="w-9 h-9 rounded-full border-2 border-surface object-cover"
                />
              ))}
            </div>
            <div className="flex-1 text-left">
              <p className="text-label font-medium text-ink">
                {savedTutors.length} saved tutor{savedTutors.length !== 1 ? "s" : ""}
              </p>
              <p className="text-caption text-ink-muted">View your saved tutors</p>
            </div>
            <ChevronRight size={16} className="text-ink-muted" />
          </motion.button>
        )}

        {/* ── Settings ── */}
        <div className="bg-surface rounded-xl border border-hairline divide-y divide-hairline mb-5">
          <SettingsRow
            icon={PenLine}
            label="Edit profile"
            onClick={() => setEditProfileOpen(true)}
          />

          {/* Appearance row with inline toggle */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Monitor size={20} className="text-ink-muted flex-shrink-0" />
            <div className="flex-1">
              <p className="text-label font-medium text-ink">Appearance</p>
            </div>
            <ThemeToggle />
          </div>

          <SettingsRow
            icon={ChevronRight}
            label="Switch to tutor mode"
            highlight
            onClick={switchToTutor}
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
            key="edit-profile-sheet"
            profile={profile}
            onClose={() => setEditProfileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editCoursesOpen && user && (
          <CoursesEditSheet
            key="courses-sheet"
            studentId={user.id}
            currentCourseIds={courseIds}
            universityId={profile?.university_id}
            onClose={() => setEditCoursesOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfilePage;
