// ============================================================
// ProfilePage — Part 2.15
// Student profile: header, stats, courses, saved tutors, settings.
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  LogOut, ChevronRight, X, Moon, Sun, Monitor,
  BookOpen, PenLine, Check, Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversity } from "@/contexts/UniversityContext";
import { useUniversities, useUpdateProfile } from "@/hooks/useSupabaseQuery";
import { useSavedTutors } from "@/hooks/useSavedTutors";
import { useStudentCourses, useSetStudentCourses } from "@/hooks/useStudentCourses";
import { useSessions } from "@/hooks/useSupabaseQuery";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { springs, variants } from "@/lib/motion";
import { toast, toastError } from "@/components/ui/sonner";
import { CountUp } from "@/components/CountUp";
import { Avatar } from "@/components/Avatar";
import { supabase } from "@/lib/supabase";

// ── Theme toggle ─────────────────────────────────────────────
const THEME_OPTIONS: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: "light", icon: Sun, label: "Light" },
  { mode: "auto", icon: Monitor, label: "Auto" },
  { mode: "dark", icon: Moon, label: "Dark" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex bg-muted rounded-full p-1 gap-0.5">
      {THEME_OPTIONS.map(({ mode, icon: Icon, label }) => (
        <motion.button
          key={mode}
          onClick={() => setTheme(mode)}
          whileTap={{ scale: 0.97 }}
          transition={springs.snappy}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-caption font-medium relative"
        >
          {theme === mode && (
            <motion.div
              layoutId="theme-pill"
              className="absolute inset-0 bg-surface rounded-full shadow-xs"
              transition={springs.smooth}
            />
          )}
          <span className={`relative z-10 flex items-center gap-1 ${theme === mode ? "text-foreground" : "text-ink-muted"}`}>
            <Icon size={12} />
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ── Edit profile sheet ───────────────────────────────────────
function EditProfileSheet({ profile, onClose }: {
  profile: { id: string; full_name: string; major: string; year: string; bio: string };
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.full_name ?? "");
  const [major, setMajor] = useState(profile.major ?? "");
  const [year, setYear] = useState(profile.year ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const updateProfile = useUpdateProfile();

  const handleSave = useCallback(async () => {
    try {
      await updateProfile.mutateAsync({ id: profile.id, full_name: name, major, year, bio });
      toast.success("Profile saved");
      onClose();
    } catch (err) { toastError(err); }
  }, [profile.id, name, major, year, bio, updateProfile, onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-[80]"
        onClick={onClose} aria-hidden="true"
      />
      <motion.div
        variants={variants.sheetIn} initial="hidden" animate="visible"
        exit={{ y: "100%", transition: { duration: 0.2 } }}
        className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
        style={{ maxHeight: "90dvh" }}
        role="dialog" aria-modal="true" aria-label="Edit profile"
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
          <h2 className="text-h2 font-display text-foreground">Edit profile</h2>
          <motion.button whileTap={{ scale: 0.96 }} transition={springs.snappy} onClick={onClose}
            className="p-2 -mr-2 rounded-xl hover:bg-muted" aria-label="Close">
            <X size={20} className="text-ink-muted" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
          {([
            { label: "Full name", value: name, onChange: setName, placeholder: "Your name" },
            { label: "Major", value: major, onChange: setMajor, placeholder: "e.g. Computer Science" },
            { label: "Year", value: year, onChange: setYear, placeholder: "e.g. Junior" },
          ] as const).map(field => (
            <div key={field.label}>
              <label className="text-label text-ink-muted block mb-1.5">{field.label}</label>
              <input
                value={field.value}
                onChange={e => (field.onChange as (v: string) => void)(e.target.value)}
                placeholder={field.placeholder}
                style={{ fontSize: "16px" }}
                className="w-full h-12 rounded-xl border border-border bg-background px-3.5 text-foreground placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-label text-ink-muted block mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 300))}
              placeholder="Tell tutors about yourself…"
              rows={4}
              style={{ fontSize: "16px" }}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-ink-muted resize-none focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pt-3 pb-8 border-t border-border bg-surface">
          <motion.button
            whileTap={{ scale: 0.97 }} transition={springs.snappy}
            onClick={handleSave} disabled={updateProfile.isPending}
            className="w-full h-14 rounded-2xl bg-accent text-white text-label font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {updateProfile.isPending ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Saving…
              </>
            ) : "Save changes"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Courses edit sheet ───────────────────────────────────────
function CoursesEditSheet({ studentId, currentCourseIds, universityId, onClose }: {
  studentId: string; currentCourseIds: string[]; universityId?: string | null; onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentCourseIds));
  const [search, setSearch] = useState("");
  const setStudentCourses = useSetStudentCourses();
  const [courses, setCourses] = useState<{ id: string; code: string; name: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let q = supabase.from("courses").select("id, code, name").order("code");
      if (universityId) q = q.eq("university_id", universityId);
      const { data } = await q;
      if (!cancelled && data) setCourses(data);
    })();
    return () => { cancelled = true; };
  }, [universityId]);

  const filtered = courses.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleSave = useCallback(async () => {
    try {
      await setStudentCourses.mutateAsync({ studentId, courseIds: Array.from(selected), semester: "Current" });
      toast.success("Courses updated");
      onClose();
    } catch (err) { toastError(err); }
  }, [studentId, selected, setStudentCourses, onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-[80]"
        onClick={onClose} aria-hidden="true"
      />
      <motion.div
        variants={variants.sheetIn} initial="hidden" animate="visible"
        exit={{ y: "100%", transition: { duration: 0.2 } }}
        className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-2xl max-w-[440px] mx-auto flex flex-col"
        style={{ maxHeight: "88dvh" }}
        role="dialog" aria-modal="true" aria-label="Edit courses"
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-3 flex-shrink-0">
          <h2 className="text-h2 font-display text-foreground">My courses</h2>
          <motion.button whileTap={{ scale: 0.96 }} transition={springs.snappy} onClick={onClose}
            className="p-2 -mr-2 rounded-xl hover:bg-muted" aria-label="Close">
            <X size={20} className="text-ink-muted" />
          </motion.button>
        </div>
        <div className="px-5 pb-3 flex-shrink-0">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses…" style={{ fontSize: "16px" }}
            className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-foreground placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {filtered.length === 0 ? (
            <p className="text-body-sm text-ink-muted text-center py-8">No courses found.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map(course => {
                const isSel = selected.has(course.id);
                return (
                  <motion.button
                    key={course.id}
                    whileTap={{ scale: 0.98 }} transition={springs.snappy}
                    onClick={() => toggle(course.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isSel ? "bg-accent-light" : "hover:bg-muted"}`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isSel ? "bg-accent border-accent" : "border-border"}`}>
                      {isSel && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-label font-medium ${isSel ? "text-accent" : "text-foreground"}`}>{course.code}</p>
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
            whileTap={{ scale: 0.97 }} transition={springs.snappy}
            onClick={handleSave} disabled={setStudentCourses.isPending}
            className="w-full h-14 rounded-2xl bg-accent text-white text-label font-semibold disabled:opacity-40"
          >
            {setStudentCourses.isPending ? "Saving…" : `Save (${selected.size} selected)`}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Settings row ─────────────────────────────────────────────
function SettingsRow({ icon: Icon, label, sublabel, onClick, destructive, right }: {
  icon: React.ElementType; label: string; sublabel?: string;
  onClick?: () => void; destructive?: boolean; right?: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.99, backgroundColor: destructive ? "rgba(239,68,68,0.05)" : "var(--bg-muted)" }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
    >
      <Icon size={20} className={destructive ? "text-red-500" : "text-ink-muted"} />
      <div className="flex-1 min-w-0">
        <p className={`text-label font-medium ${destructive ? "text-red-500" : "text-foreground"}`}>{label}</p>
        {sublabel && <p className="text-caption text-ink-muted">{sublabel}</p>}
      </div>
      {right ?? <ChevronRight size={16} className="text-ink-muted flex-shrink-0" />}
    </motion.button>
  );
}

// ── Main page ────────────────────────────────────────────────
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { selectedUniversity } = useUniversity();
  const { data: universities = [] } = useUniversities();
  const uni = universities.find(u => u.id === (profile?.university_id || selectedUniversity));

  const { data: savedTutors = [] } = useSavedTutors(user?.id ?? "");
  const { data: studentCourses = [] } = useStudentCourses(user?.id ?? "");
  const { data: sessions = [] } = useSessions(user?.id ?? "", "student");

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editCoursesOpen, setEditCoursesOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    try { await signOut(); navigate("/welcome"); }
    catch (err) { toastError(err); }
  }, [signOut, navigate]);

  const switchToTutor = useCallback(async () => {
    if (!user) return;
    await supabase.from("profiles").update({ role: "tutor" }).eq("id", user.id);
    await refreshProfile();
    // Story 32: route to tutor onboarding if not yet set up as tutor
    if (!profile?.hourly_rate) {
      navigate("/onboarding/tutor");
    } else {
      navigate("/tutor/requests");
    }
  }, [user, profile, refreshProfile, navigate]);

  const completedCount = sessions.filter((s: any) => s.status === "completed").length;
  const courseIds = studentCourses.map((sc: any) => sc.course_id as string);

  return (
    <>
      <div className="px-5 pt-14 pb-28 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col items-center mb-7 text-center">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size={88} className="mb-4 ring-4 ring-accent-light ring-offset-2 ring-offset-background" />
          <h1 className="text-h1 font-display text-foreground mb-1">{profile?.full_name ?? "Student"}</h1>
          <div className="w-8 h-0.5 rounded-full bg-accent mb-2" />
          <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
            {uni && (
              <span className="text-caption px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: uni.color + "18", color: uni.color }}>
                {uni.short_name}
              </span>
            )}
            {(profile?.major || profile?.year) && (
              <span className="text-body-sm text-ink-muted">{[profile.major, profile.year].filter(Boolean).join(" · ")}</span>
            )}
          </div>
          {profile?.created_at && (
            <p className="text-caption text-ink-muted italic mb-3">
              Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          )}
          <motion.button
            whileTap={{ scale: 0.96 }} transition={springs.snappy}
            onClick={() => setEditProfileOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-label text-foreground hover:bg-muted transition-colors"
          >
            <PenLine size={14} className="text-ink-muted" />
            Edit profile
          </motion.button>
        </div>

        {/* Stats */}
        <div className="bg-surface rounded-2xl border border-border p-4 mb-5">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <CountUp value={completedCount} className="text-h2 font-display text-foreground font-semibold" />
              <p className="text-caption text-ink-muted mt-0.5">Sessions</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <motion.button whileTap={{ scale: 0.97 }} transition={springs.snappy} onClick={() => navigate("/saved")} className="text-center">
              <CountUp value={savedTutors.length} className="text-h2 font-display text-foreground font-semibold" />
              <p className="text-caption text-ink-muted mt-0.5">Saved</p>
            </motion.button>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <CountUp value={studentCourses.length} className="text-h2 font-display text-foreground font-semibold" />
              <p className="text-caption text-ink-muted mt-0.5">Courses</p>
            </div>
          </div>
        </div>

        {/* My courses */}
        <div className="bg-surface rounded-2xl border border-border p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-label font-semibold text-foreground flex items-center gap-1.5">
              <BookOpen size={16} className="text-accent" />
              My courses
            </h2>
            <motion.button whileTap={{ scale: 0.96 }} transition={springs.snappy} onClick={() => setEditCoursesOpen(true)} className="text-label text-accent font-medium">
              Edit
            </motion.button>
          </div>
          {studentCourses.length === 0 ? (
            <motion.button
              whileTap={{ scale: 0.97 }} transition={springs.snappy}
              onClick={() => setEditCoursesOpen(true)}
              className="w-full py-3 rounded-xl border border-dashed border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent transition-colors"
            >
              + Add your enrolled courses
            </motion.button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {studentCourses.map((sc: any) => (
                <span key={sc.course_id} className="px-3 py-1 rounded-full bg-accent-light text-accent text-label font-medium">
                  {sc.course?.code ?? sc.course_id}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Saved tutors */}
        {savedTutors.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.98 }} transition={springs.snappy}
            onClick={() => navigate("/saved")}
            className="w-full bg-surface rounded-2xl border border-border p-4 mb-5 flex items-center gap-3"
          >
            <div className="flex -space-x-2 flex-shrink-0">
              {savedTutors.slice(0, 3).map((st: any) => (
                <Avatar key={st.tutor_id} src={st.tutor?.avatar_url} name={st.tutor?.full_name} size={36} className="border-2 border-surface" />
              ))}
            </div>
            <div className="flex-1 text-left">
              <p className="text-label font-medium text-foreground">
                {savedTutors.length} saved tutor{savedTutors.length !== 1 ? "s" : ""}
              </p>
              <p className="text-caption text-ink-muted">View your saved tutors</p>
            </div>
            <Heart size={16} className="text-accent flex-shrink-0" />
          </motion.button>
        )}

        {/* Settings */}
        <div className="bg-surface rounded-2xl border border-border divide-y divide-border mb-5">
          <SettingsRow icon={PenLine} label="Edit profile" onClick={() => setEditProfileOpen(true)} />
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Monitor size={20} className="text-ink-muted flex-shrink-0" />
            <div className="flex-1">
              <p className="text-label font-medium text-foreground">Appearance</p>
            </div>
            <ThemeToggle />
          </div>
          <SettingsRow icon={ChevronRight} label="Switch to tutor mode" onClick={switchToTutor} />
          <SettingsRow icon={LogOut} label="Sign out" destructive onClick={handleSignOut} right={<span />} />
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-6 pb-4">
          <Link to="/privacy" className="text-caption text-ink-muted hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="text-caption text-ink-muted hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>

      <AnimatePresence>
        {editProfileOpen && profile && (
          <EditProfileSheet key="edit-profile" profile={profile} onClose={() => setEditProfileOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editCoursesOpen && user && (
          <CoursesEditSheet key="courses-edit" studentId={user.id} currentCourseIds={courseIds} universityId={profile?.university_id} onClose={() => setEditCoursesOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfilePage;
