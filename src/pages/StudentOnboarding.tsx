// ============================================================
// StudentOnboarding — Part 2.7
// 3-step wizard: university → major/year → courses
// Filling pill progress bar, horizontal slide, spring CTA
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search, X, Check } from "lucide-react";
import { useUniversity } from "@/contexts/UniversityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversities, useCourses, useUpdateProfile } from "@/hooks/useSupabaseQuery";
import { useSetStudentCourses } from "@/hooks/useStudentCourses";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { toast } from "@/components/ui/sonner";
import { springs } from "@/lib/motion";

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY = "tutr:onboarding:student";
const TOTAL_STEPS = 3;

const MAJORS = [
  "Computer Science", "Business", "Engineering", "Pre-med",
  "Economics", "Architecture", "Biology", "Mathematics",
  "Psychology", "Languages",
];
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

interface Draft {
  step: number;
  selectedUni: string;
  selectedMajor: string;
  selectedYear: string;
  mode: "online" | "in-person" | "both";
  selectedCourseIds: string[];
  semester: string;
}

const defaultDraft: Draft = {
  step: 0,
  selectedUni: "",
  selectedMajor: "",
  selectedYear: "",
  mode: "both",
  selectedCourseIds: [],
  semester: "",
};

// ── Progress bar ─────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="px-5 pt-14 pb-0">
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={springs.smooth}
        />
      </div>
      <p className="text-caption text-ink-muted mt-1.5 text-right">
        Step {step + 1} of {total}
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
const StudentOnboarding = () => {
  const navigate = useNavigate();
  const { setSelectedUniversity } = useUniversity();
  const { user, refreshProfile } = useAuth();
  const { data: universities = [] } = useUniversities();
  const updateProfile = useUpdateProfile();
  const setStudentCourses = useSetStudentCourses();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const [selectedUni, setSelectedUni] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [mode, setMode] = useState<"online" | "in-person" | "both">("both");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [semester, setSemester] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const { data: allCourses = [] } = useCourses(selectedUni || undefined);
  const filteredCourses = allCourses.filter(c =>
    c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // Restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved: Draft = JSON.parse(raw);
      setStep(Math.min(saved.step ?? 0, TOTAL_STEPS - 1));
      setSelectedUni(saved.selectedUni ?? "");
      setSelectedMajor(saved.selectedMajor ?? "");
      setSelectedYear(saved.selectedYear ?? "");
      setMode(saved.mode ?? "both");
      setSelectedCourseIds(saved.selectedCourseIds ?? []);
      setSemester(saved.semester ?? "");
      if (saved.step > 0) toast("Picking up where you left off");
    } catch { /* ignore */ }
  }, []);

  const persistDraft = useCallback((nextStep: number) => {
    const draft: Draft = {
      step: nextStep,
      selectedUni, selectedMajor, selectedYear,
      mode, selectedCourseIds, semester,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [selectedUni, selectedMajor, selectedYear, mode, selectedCourseIds, semester]);

  const goForward = () => {
    const next = step + 1;
    setDirection(1);
    persistDraft(next);
    setStep(next);
  };

  const goBack = () => {
    const prev = step - 1;
    setDirection(-1);
    persistDraft(prev);
    setStep(prev);
  };

  const handleBackAction = () => {
    if (step === 0) {
      persistDraft(0);
      navigate("/?switch=1");
      return;
    }

    goBack();
  };

  const toggleCourse = (id: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const finish = async () => {
    if (!user) return;

    // Profile update is required — fail fast
    try {
      await updateProfile.mutateAsync({
        id: user.id,
        role: "student",
        university_id: selectedUni || "aub",
        major: selectedMajor,
        year: selectedYear,
        onboarded_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Failed to save student profile:", err);
      toast(err?.message || "Failed to save profile. Please try again.");
      return;
    }

    // Course saving is optional — don't block completion if it fails
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

  const canContinue = [
    !!selectedUni,
    !!selectedMajor && !!selectedYear,
    true,
  ][step] ?? true;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: springs.smooth },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.15 } }),
  };

  return (
    <div className="min-h-svh bg-background flex flex-col overflow-x-hidden">
      <SuccessOverlay
        visible={showSuccess}
        title="You're all set!"
        description="Welcome to TUTR. You can review and edit your profile next."
        onDismiss={() => navigate("/profile?edit=1")}
      />

      <ProgressBar step={step} total={TOTAL_STEPS} />

      {/* Step slides */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col"
          >
            {step === 0 && (
              <Step0
                universities={universities}
                selectedUni={selectedUni}
                onSelect={setSelectedUni}
              />
            )}
            {step === 1 && (
              <Step1
                selectedMajor={selectedMajor}
                selectedYear={selectedYear}
                mode={mode}
                onMajor={setSelectedMajor}
                onYear={setSelectedYear}
                onMode={setMode}
              />
            )}
            {step === 2 && (
              <Step2
                allCourses={allCourses}
                filteredCourses={filteredCourses}
                selectedCourseIds={selectedCourseIds}
                semester={semester}
                courseSearch={courseSearch}
                selectedUni={selectedUni}
                onSearch={setCourseSearch}
                onToggle={toggleCourse}
                onSemester={setSemester}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="px-5 pb-10 pt-4 space-y-3 bg-background z-10">
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={springs.snappy}
          onClick={handleBackAction}
          className="flex items-center gap-1.5 text-ink-muted text-body-sm"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {step < TOTAL_STEPS - 1 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            onClick={goForward}
            disabled={!canContinue}
            className="w-full h-14 rounded-2xl bg-accent text-white text-label font-semibold disabled:opacity-40 transition-opacity"
          >
            Continue
          </motion.button>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={springs.snappy}
              onClick={finish}
              disabled={saving}
              className="w-full h-14 rounded-2xl bg-accent text-white text-label font-semibold disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Saving…
                </>
              ) : "Get started"}
            </motion.button>
            <p className="text-caption text-ink-muted text-center">
              By continuing you agree to our{" "}
              <Link to="/terms" className="text-accent" target="_blank">Terms</Link>
              {" & "}
              <Link to="/privacy" className="text-accent" target="_blank">Privacy Policy</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ── Step 0: University ───────────────────────────────────────
function Step0({
  universities, selectedUni, onSelect,
}: {
  universities: any[];
  selectedUni: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="px-5 pt-8 pb-4 flex-1 overflow-y-auto">
      <p className="text-overline text-accent mb-2">Step 1</p>
      <h1 className="text-h1 font-display mb-1">
        Pick your <em>university</em>
      </h1>
      <p className="text-body-sm text-ink-muted mb-7">
        We'll show you tutors and courses from your school.
      </p>
      <div className="space-y-3">
        {universities.map(uni => (
          <motion.button
            key={uni.id}
            whileTap={{ scale: 0.98 }}
            transition={springs.snappy}
            onClick={() => onSelect(uni.id)}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-colors ${
              selectedUni === uni.id
                ? "border-accent bg-accent-light"
                : "border-border bg-surface"
            }`}
          >
            <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: uni.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-label font-semibold text-foreground">{uni.short_name}</div>
              <div className="text-body-sm text-ink-muted truncate">{uni.name}</div>
            </div>
            {selectedUni === uni.id && (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Check size={10} color="white" strokeWidth={2.5} />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Step 1: Major + Year + Mode ──────────────────────────────
function Step1({
  selectedMajor, selectedYear, mode, onMajor, onYear, onMode,
}: {
  selectedMajor: string;
  selectedYear: string;
  mode: "online" | "in-person" | "both";
  onMajor: (v: string) => void;
  onYear: (v: string) => void;
  onMode: (v: "online" | "in-person" | "both") => void;
}) {
  return (
    <div className="px-5 pt-8 pb-4 flex-1 overflow-y-auto">
      <p className="text-overline text-accent mb-2">Step 2</p>
      <h1 className="text-h1 font-display mb-1">
        What are you <em>studying?</em>
      </h1>
      <p className="text-body-sm text-ink-muted mb-6">
        Pick your major and year. You can update these later.
      </p>

      <p className="text-label text-ink-muted mb-2">Major</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {MAJORS.map(m => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.95 }}
            transition={springs.snappy}
            onClick={() => onMajor(m)}
            className={`px-4 py-2 rounded-full text-label transition-colors ${
              selectedMajor === m
                ? "bg-accent text-white"
                : "bg-surface border border-border text-foreground"
            }`}
          >
            {m}
          </motion.button>
        ))}
      </div>

      <p className="text-label text-ink-muted mb-2">Year</p>
      <select
        value={selectedYear}
        onChange={e => onYear(e.target.value)}
        style={{ fontSize: "16px" }}
        className="w-full p-3.5 rounded-xl border border-border bg-surface text-foreground mb-6 focus:outline-none focus:border-accent transition-colors"
      >
        <option value="">Select your year</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      <p className="text-label text-ink-muted mb-2">Learning preference</p>
      <div className="flex gap-2">
        {(["online", "in-person", "both"] as const).map(m => (
          <button
            key={m}
            onClick={() => onMode(m)}
            className={`flex-1 py-3 rounded-xl text-label capitalize transition-colors border ${
              mode === m
                ? "bg-accent-light border-accent text-accent font-medium"
                : "bg-surface border-border text-ink-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step 2: Courses ──────────────────────────────────────────
function Step2({
  allCourses, filteredCourses, selectedCourseIds, semester,
  courseSearch, selectedUni, onSearch, onToggle, onSemester,
}: {
  allCourses: any[];
  filteredCourses: any[];
  selectedCourseIds: string[];
  semester: string;
  courseSearch: string;
  selectedUni: string;
  onSearch: (v: string) => void;
  onToggle: (id: string) => void;
  onSemester: (v: string) => void;
}) {
  return (
    <div className="px-5 pt-8 pb-32 flex-1 min-h-0 overflow-y-auto">
      <p className="text-overline text-accent mb-2">Step 3</p>
      <h1 className="text-h1 font-display mb-1">
        Your <em>courses</em>
      </h1>
      <p className="text-body-sm text-ink-muted mb-4">
        Add the courses you're taking so tutors can find you.
      </p>

      <input
        value={semester}
        onChange={e => onSemester(e.target.value)}
        placeholder="Semester (e.g. Spring 2026)"
        style={{ fontSize: "16px" }}
        className="w-full mb-3 px-4 py-3.5 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent transition-colors"
      />

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
        <input
          value={courseSearch}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search courses…"
          style={{ fontSize: "16px" }}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {selectedCourseIds.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
          {selectedCourseIds.map(id => {
            const c = allCourses.find(x => x.id === id);
            if (!c) return null;
            return (
              <div key={id} className="flex items-center gap-1.5 bg-accent-light border border-accent/20 rounded-full px-3 py-1.5">
                <span className="text-label text-accent">{c.code}</span>
                <button onClick={() => onToggle(id)} className="text-accent/70 hover:text-accent" aria-label={`Remove ${c.code}`}>
                  <X size={12} />
                </button>
              </div>
            );
          })}
          </div>
        </div>
      )}

      <div className="space-y-0.5">
        {filteredCourses
          .filter(c => !selectedCourseIds.includes(c.id))
          .map(c => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.98 }}
              transition={springs.snappy}
              onClick={() => onToggle(c.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent-light transition-colors flex items-center gap-3"
            >
              <span className="text-label text-foreground font-medium w-20 flex-shrink-0">{c.code}</span>
              <span className="text-body-sm text-ink-muted truncate">{c.name}</span>
            </motion.button>
          ))}
        {filteredCourses.filter(c => !selectedCourseIds.includes(c.id)).length === 0 && (
          <p className="text-body-sm text-ink-muted text-center py-8">
            {selectedUni ? "No courses found." : "Select a university first."}
          </p>
        )}
      </div>
    </div>
  );
}

export default StudentOnboarding;
