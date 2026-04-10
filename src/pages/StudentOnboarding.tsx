// ── StudentOnboarding — Multi-step Wizard (Part G) ────────────
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { useUniversity } from "@/contexts/UniversityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversities, useCourses, useUpdateProfile } from "@/hooks/useSupabaseQuery";
import { useSetStudentCourses } from "@/hooks/useStudentCourses";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { toast } from "@/components/ui/sonner";
import { variants } from "@/lib/motion";

// ── Constants ──────────────────────────────────────────────────
const STORAGE_KEY = "tutr:onboarding:student";

const MAJORS = [
  "Computer Science", "Business", "Engineering", "Pre-med",
  "Economics", "Architecture", "Biology", "Mathematics",
  "Psychology", "Languages",
];
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const TOTAL_STEPS = 4;

// ── Draft shape ────────────────────────────────────────────────
interface Draft {
  step: number;
  selectedUni: string;
  selectedMajor: string;
  selectedYear: string;
  bio: string;
  mode: "online" | "in-person" | "both";
  selectedCourseIds: string[];
  semester: string;
}

const defaultDraft: Draft = {
  step: 0,
  selectedUni: "",
  selectedMajor: "",
  selectedYear: "",
  bio: "",
  mode: "both",
  selectedCourseIds: [],
  semester: "",
};

// ── Slide variants factory ─────────────────────────────────────
function slideVariants(direction: "forward" | "back") {
  return direction === "forward" ? variants.slideInFromRight : variants.slideInFromLeft;
}

// ── Step Indicator ─────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 pt-6 pb-2 px-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
              i < current
                ? "bg-accent border-accent"
                : i === current
                ? "bg-accent border-accent"
                : "bg-surface border-hairline"
            }`}
          >
            {i < current ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span
                className={`text-caption font-semibold ${
                  i === current ? "text-accent-foreground" : "text-ink-muted"
                }`}
              >
                {i + 1}
              </span>
            )}
          </div>
          {i < total - 1 && (
            <div
              className={`h-px flex-1 mx-1 transition-all duration-300 ${
                i < current ? "bg-accent" : "bg-hairline"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Decorative SVG shapes per step ────────────────────────────
function StepDecoration({ step }: { step: number }) {
  const shapes = [
    // Step 0: university — large circle + small circle
    <svg key={0} className="absolute -top-8 -right-8 pointer-events-none" width="160" height="160" viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <circle cx="120" cy="40" r="60" fill="hsl(152 50% 93%)" fillOpacity="0.7" />
      <circle cx="60" cy="110" r="28" fill="hsl(152 50% 93%)" fillOpacity="0.4" />
    </svg>,
    // Step 1: major/year — triangle-ish polygon
    <svg key={1} className="absolute -top-6 -right-6 pointer-events-none" width="140" height="140" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <ellipse cx="110" cy="30" rx="55" ry="45" fill="hsl(152 50% 93%)" fillOpacity="0.6" />
      <rect x="20" y="90" width="50" height="50" rx="16" fill="hsl(152 50% 93%)" fillOpacity="0.35" />
    </svg>,
    // Step 2: bio — soft hexagon-like shape
    <svg key={2} className="absolute -top-4 -right-4 pointer-events-none" width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M90 10 L120 55 L100 105 L50 115 L10 75 L20 20 Z" fill="hsl(152 50% 93%)" fillOpacity="0.5" />
    </svg>,
    // Step 3: courses — overlapping circles
    <svg key={3} className="absolute -top-6 -right-6 pointer-events-none" width="150" height="150" viewBox="0 0 150 150" fill="none" aria-hidden="true">
      <circle cx="100" cy="50" r="50" fill="hsl(152 50% 93%)" fillOpacity="0.55" />
      <circle cx="130" cy="110" r="30" fill="hsl(152 50% 93%)" fillOpacity="0.3" />
    </svg>,
  ];
  return <>{shapes[step] ?? null}</>;
}

// ── Main Component ─────────────────────────────────────────────
const StudentOnboarding = () => {
  const navigate = useNavigate();
  const { setSelectedUniversity } = useUniversity();
  const { user, refreshProfile } = useAuth();
  const { data: universities = [] } = useUniversities();
  const updateProfile = useUpdateProfile();
  const setStudentCourses = useSetStudentCourses();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [bio, setBio] = useState("");
  const [mode, setMode] = useState<"online" | "in-person" | "both">("both");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [semester, setSemester] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // Hooks for courses (step 3)
  const { data: allCourses = [] } = useCourses(selectedUni || undefined);
  const filteredCourses = allCourses.filter(c =>
    c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // ── localStorage persistence ──────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved: Draft = JSON.parse(raw);
      setStep(saved.step ?? 0);
      setSelectedUni(saved.selectedUni ?? "");
      setSelectedMajor(saved.selectedMajor ?? "");
      setSelectedYear(saved.selectedYear ?? "");
      setBio(saved.bio ?? "");
      setMode(saved.mode ?? "both");
      setSelectedCourseIds(saved.selectedCourseIds ?? []);
      setSemester(saved.semester ?? "");
      if (saved.step > 0) {
        toast("Picking up where you left off", { duration: 3000 });
      }
    } catch {
      /* ignore parse errors */
    }
  }, []);

  const persistDraft = useCallback((patch: Partial<Draft> & { step: number }) => {
    const draft: Draft = {
      step: patch.step,
      selectedUni,
      selectedMajor,
      selectedYear,
      bio,
      mode,
      selectedCourseIds,
      semester,
      ...patch,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [selectedUni, selectedMajor, selectedYear, bio, mode, selectedCourseIds, semester]);

  const goForward = () => {
    const next = step + 1;
    setDirection("forward");
    persistDraft({ step: next });
    setStep(next);
  };

  const goBack = () => {
    const prev = step - 1;
    setDirection("back");
    persistDraft({ step: prev });
    setStep(prev);
  };

  const toggleCourse = (id: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // ── Save & finish ─────────────────────────────────────────
  const finish = async () => {
    if (!user) return;

    // Profile update is required — block on failure
    try {
      await updateProfile.mutateAsync({
        id: user.id,
        role: "student",
        university_id: selectedUni || "aub",
        major: selectedMajor,
        year: selectedYear,
        bio,
        onboarded_at: new Date().toISOString(),
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save profile. Please try again.");
      return;
    }

    // Courses are optional — don't block if this fails
    if (selectedCourseIds.length > 0) {
      try {
        await setStudentCourses.mutateAsync({
          studentId: user.id,
          courseIds: selectedCourseIds,
          semester: semester || "Spring 2026",
        });
      } catch (err) {
        console.warn("Could not save courses (non-blocking):", err);
      }
    }

    setSelectedUniversity(selectedUni || "aub");
    await refreshProfile();
    localStorage.removeItem(STORAGE_KEY);
    setShowSuccess(true);
  };

  const saving = updateProfile.isPending || setStudentCourses.isPending;
  const currentVariant = slideVariants(direction);

  // ── Step content ───────────────────────────────────────────
  const canContinue = [
    !!selectedUni,                   // step 0
    !!selectedMajor && !!selectedYear, // step 1
    true,                            // step 2 bio optional
    true,                            // step 3 courses optional
  ][step] ?? true;

  const stepContent = [
    // ── Step 0: University ──────────────────────────────────
    <div key="s0" className="px-5 pt-10 pb-6 flex-1">
      <h1 className="text-display-md mb-2 text-ink">Pick your university</h1>
      <p className="text-body-sm text-ink-muted mb-7">
        We'll show you tutors and courses from your school.
      </p>
      <div className="space-y-3">
        {universities.map(uni => (
          <motion.button
            key={uni.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedUni(uni.id)}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-colors ${
              selectedUni === uni.id
                ? "border-accent bg-accent-soft"
                : "border-hairline bg-surface"
            }`}
          >
            <div className="w-1 h-10 rounded-full" style={{ backgroundColor: uni.color }} />
            <div className="flex-1">
              <div className="text-label font-semibold text-ink">{uni.short_name}</div>
              <div className="text-body-sm text-ink-muted">{uni.name}</div>
            </div>
            {selectedUni === uni.id && (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>,

    // ── Step 1: Major & Year ────────────────────────────────
    <div key="s1" className="px-5 pt-10 pb-6 flex-1">
      <h1 className="text-display-md mb-2 text-ink">What are you studying?</h1>
      <p className="text-body-sm text-ink-muted mb-6">
        Pick your major and year. You can update these later.
      </p>
      <div className="flex flex-wrap gap-2 mb-7">
        {MAJORS.map(m => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedMajor(m)}
            className={`px-4 py-2 rounded-pill text-label transition-colors ${
              selectedMajor === m
                ? "bg-accent text-accent-foreground"
                : "bg-surface border border-hairline text-ink"
            }`}
          >
            {m}
          </motion.button>
        ))}
      </div>
      <label className="text-label text-ink-muted mb-2 block">Year</label>
      <select
        value={selectedYear}
        onChange={e => setSelectedYear(e.target.value)}
        className="w-full p-3.5 rounded-lg border border-hairline bg-surface text-body text-ink"
      >
        <option value="">Select your year</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <div className="mt-6">
        <label className="text-label text-ink-muted mb-3 block">Learning preference</label>
        <div className="flex gap-2">
          {(["online", "in-person", "both"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-lg text-label capitalize transition-colors border ${
                mode === m
                  ? "bg-accent-soft border-accent text-accent"
                  : "bg-surface border-hairline text-ink-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // ── Step 2: Bio ─────────────────────────────────────────
    <div key="s2" className="px-5 pt-10 pb-6 flex-1">
      <h1 className="text-display-md mb-2 text-ink">Tell us about yourself</h1>
      <p className="text-body-sm text-ink-muted mb-6">
        Optional — tutors will see this on your profile.
      </p>
      <textarea
        value={bio}
        onChange={e => setBio(e.target.value)}
        rows={5}
        placeholder="e.g. Second-year CS major at AUB. Love math and always down to study in groups."
        className="w-full p-4 rounded-xl border border-hairline bg-surface text-body text-ink resize-none focus:outline-none focus:border-accent transition-colors"
        maxLength={300}
      />
      <div className="flex justify-end mt-1.5">
        <span className="text-caption text-ink-muted">{bio.length}/300</span>
      </div>
    </div>,

    // ── Step 3: My Courses ──────────────────────────────────
    <div key="s3" className="px-5 pt-10 pb-6 flex-1 flex flex-col">
      <h1 className="text-display-md mb-2 text-ink">My courses</h1>
      <p className="text-body-sm text-ink-muted mb-4">
        Add the courses you're taking so tutors can find you.
      </p>

      {/* Semester input */}
      <input
        value={semester}
        onChange={e => setSemester(e.target.value)}
        placeholder="Semester (e.g. Spring 2026)"
        className="w-full mb-4 p-3.5 rounded-lg border border-hairline bg-surface text-body text-ink focus:outline-none focus:border-accent transition-colors"
      />

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={courseSearch}
          onChange={e => setCourseSearch(e.target.value)}
          placeholder="Search courses…"
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-hairline bg-surface text-body text-ink focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Selected courses */}
      {selectedCourseIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedCourseIds.map(id => {
            const c = allCourses.find(x => x.id === id);
            if (!c) return null;
            return (
              <div key={id} className="flex items-center gap-1.5 bg-accent-soft border border-accent/30 rounded-pill px-3 py-1.5">
                <span className="text-label text-accent">{c.code}</span>
                <button onClick={() => toggleCourse(id)} className="text-accent/70 hover:text-accent">
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Course list */}
      <div className="flex-1 overflow-auto space-y-1 max-h-52">
        {filteredCourses
          .filter(c => !selectedCourseIds.includes(c.id))
          .map(c => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCourse(c.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent-soft transition-colors flex items-center gap-3"
            >
              <span className="text-label text-ink font-medium">{c.code}</span>
              <span className="text-body-sm text-ink-muted truncate">{c.name}</span>
            </motion.button>
          ))}
        {filteredCourses.filter(c => !selectedCourseIds.includes(c.id)).length === 0 && (
          <p className="text-body-sm text-ink-muted text-center py-6">
            {selectedUni ? "No courses found." : "Select a university first."}
          </p>
        )}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Success Overlay */}
      <SuccessOverlay
        visible={showSuccess}
        title="You're all set!"
        description="Welcome to Tutr. Let's find you a tutor."
        onDismiss={() => navigate("/")}
      />

      {/* Step indicator */}
      <StepIndicator current={step} total={TOTAL_STEPS} />

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={currentVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex-1 flex flex-col relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <StepDecoration step={step} />
          </div>
          <div className="relative z-10 flex-1 flex flex-col">
            {stepContent[step]}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom action zone */}
      <div className="px-5 pb-10 pt-2">
        {/* Back button */}
        {step > 0 && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={goBack}
            className="flex items-center gap-1.5 text-ink-muted mb-4 text-body-sm"
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
        )}

        {/* Continue / Finish */}
        {step < TOTAL_STEPS - 1 ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={goForward}
            disabled={!canContinue}
            className="w-full h-14 rounded-xl bg-accent text-accent-foreground text-label font-semibold disabled:opacity-40 transition-opacity"
          >
            Continue
          </motion.button>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={finish}
              disabled={saving}
              className="w-full h-14 rounded-xl bg-accent text-accent-foreground text-label font-semibold disabled:opacity-40 transition-opacity"
            >
              {saving ? "Saving…" : "Get started"}
            </motion.button>
            <div className="mt-3 text-center">
              <span className="text-body-sm text-ink-muted">
                I agree to the{" "}
                <Link to="/terms" className="text-accent" target="_blank">Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-accent" target="_blank">Privacy Policy</Link>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentOnboarding;
