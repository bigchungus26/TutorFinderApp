import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, ReactNode, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Search, Upload, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUniversity } from "@/contexts/UniversityContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses, useSetTutorCourses, useUniversities, useUpdateProfile, useVerificationDocuments } from "@/hooks/useSupabaseQuery";
import { useUpsertAvailability } from "@/hooks/useAvailability";
import {
  deleteVerificationDocument,
  NON_STUDENT_TRACK_DOC_TYPES,
  STUDENT_TRACK_DOC_TYPES,
  uploadVerificationDocument,
  VERIFICATION_DOC_LABELS,
  VerificationUploadError,
} from "@/lib/verification";
import type { VerificationDocument, VerificationDocType } from "@/types/database";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { toast } from "@/components/ui/sonner";
import { springs } from "@/lib/motion";
import { isMissingSupabaseResourceError } from "@/lib/supabaseResourceFallback";

const STORAGE_KEY = "tutr:onboarding:tutor";
const TOTAL_STEPS = 6;
const SUBSCRIPTION_PRICE = 12;

const MAJORS = [
  "Computer Science",
  "Business",
  "Engineering",
  "Pre-med",
  "Economics",
  "Architecture",
  "Biology",
  "Mathematics",
  "Psychology",
  "Languages",
] as const;

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"] as const;
const GRADES = ["A", "A-"] as const;
const ALLOWED_TUTOR_GRADES = new Set<string>(GRADES);
const TEACHING_STYLES = [
  { value: "step-by-step", label: "Step-by-step" },
  { value: "exam-focused", label: "Exam-focused" },
  { value: "conceptual-understanding", label: "Conceptual understanding" },
] as const;
const LANGUAGE_OPTIONS = ["English", "Arabic", "French"] as const;
const AVAILABILITY_OPTIONS = [
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "evenings", label: "Evenings" },
] as const;

type TutorMode = "online" | "in-person" | "both";
type CourseSelection = { courseId: string; grade: string };

type Draft = {
  step: number;
  fullName: string;
  selectedUni: string;
  selectedMajor: string;
  selectedYear: string;
  tutorType: "student" | "non_student" | null;
  nonStudentCredentials: string;
  avatarPreview: string;
  avatarFileName: string;
  selectedCourses: CourseSelection[];
  gpa: string;
  bio: string;
  teachingStyles: string[];
  languages: string[];
  mode: TutorMode;
  rate: string;
  availabilityPreferences: string[];
  maxStudents: string;
  proofPreview: string;
  proofFileName: string;
  previousExperience: boolean;
  yearsExperience: string;
  subscriptionAccepted: boolean;
};

function sanitizeTutorGrade(grade: string) {
  return ALLOWED_TUTOR_GRADES.has(grade) ? grade : "A";
}

const stepContentVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0, transition: springs.smooth },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -32 : 32,
    transition: { duration: 0.18 },
  }),
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

function buildAvailabilitySlots(tutorId: string, preferences: string[]) {
  const slots = new Map<string, { tutor_id: string; day_of_week: number; start_time: string; end_time: string }>();

  const addSlot = (dayOfWeek: number, startTime: string, endTime: string) => {
    const key = `${dayOfWeek}-${startTime}`;
    if (!slots.has(key)) {
      slots.set(key, {
        tutor_id: tutorId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      });
    }
  };

  if (preferences.includes("weekdays")) {
    [1, 2, 3, 4, 5].forEach((day) => addSlot(day, "15:00", "18:00"));
  }
  if (preferences.includes("weekends")) {
    [0, 6].forEach((day) => addSlot(day, "10:00", "13:00"));
  }
  if (preferences.includes("evenings")) {
    [1, 2, 3, 4, 5].forEach((day) => addSlot(day, "18:00", "21:00"));
  }

  return Array.from(slots.values());
}

function ProgressBar({ step }: { step: number }) {
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="px-5 pt-8 sm:px-6">
      <div className="rounded-full bg-border/70 p-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={springs.smooth}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ink-muted">
        <span>Tutor setup</span>
        <span>
          Step {step + 1} of {TOTAL_STEPS}
        </span>
      </div>
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden px-5 pb-4 pt-8 sm:px-6">
      <div className="mb-6 shrink-0">
        <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h1
          className="text-[2rem] font-semibold tracking-[-0.04em] text-foreground sm:text-[2.35rem]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.05 }}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted sm:text-[0.96rem]">{description}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  helper,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        style={{ fontSize: "16px" }}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 read-only:cursor-default read-only:bg-muted/40"
      />
      {helper ? <span className="mt-2 block text-xs text-ink-muted">{helper}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-ink-muted">{value.length}/{maxLength}</span>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        style={{ fontSize: "16px" }}
        className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3.5 text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
      />
    </label>
  );
}

function SelectableChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? "border-accent bg-accent text-white shadow-[0_10px_24px_rgba(31,122,99,0.18)]"
          : "border-border bg-surface text-foreground hover:border-accent/30 hover:bg-accent/5"
      }`}
    >
      {label}
    </button>
  );
}

function FilePicker({
  label,
  helper,
  preview,
  fileName,
  accept,
  onChange,
}: {
  label: string;
  helper: string;
  preview: string;
  fileName: string;
  accept: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <div className="rounded-[1.5rem] border border-dashed border-border bg-surface p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-accent/10">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <Upload className="h-5 w-5 text-accent" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{fileName || "Upload an optional file"}</p>
            <p className="mt-1 text-xs leading-5 text-ink-muted">{helper}</p>
          </div>
        </div>
        <input
          type="file"
          accept={accept}
          className="mt-4 block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:font-medium file:text-accent"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </div>
    </label>
  );
}

function TutorOnboarding() {
  const navigate = useNavigate();
  const { setSelectedUniversity } = useUniversity();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { data: universities = [] } = useUniversities();
  const updateProfile = useUpdateProfile();
  const setTutorCourses = useSetTutorCourses();
  const upsertAvailability = useUpsertAvailability();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);

  const [fullName, setFullName] = useState("");
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<CourseSelection[]>([]);
  const [gpa, setGpa] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [bio, setBio] = useState("");
  const [tutorType, setTutorType] = useState<"student" | "non_student" | null>(null);
  const [nonStudentCredentials, setNonStudentCredentials] = useState("");
  const [teachingStyles, setTeachingStyles] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [mode, setMode] = useState<TutorMode>("both");
  const [rate, setRate] = useState("20");
  const [availabilityPreferences, setAvailabilityPreferences] = useState<string[]>([]);
  const [maxStudents, setMaxStudents] = useState("");
  const [proofPreview, setProofPreview] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [previousExperience, setPreviousExperience] = useState(false);
  const [yearsExperience, setYearsExperience] = useState("");
  const [subscriptionAccepted, setSubscriptionAccepted] = useState(false);

  const [selectedDocType, setSelectedDocType] = useState<VerificationDocType | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: verificationDocs = [], refetch: refetchDocs } = useVerificationDocuments(user?.id ?? "");

  const { data: allCourses = [] } = useCourses(selectedUni || profile?.university_id || undefined);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = courseSearch.trim().toLowerCase();
    if (!normalizedQuery) return allCourses;
    return allCourses.filter(
      (course) =>
        course.code.toLowerCase().includes(normalizedQuery) ||
        course.name.toLowerCase().includes(normalizedQuery),
    );
  }, [allCourses, courseSearch]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft: Draft = JSON.parse(raw);
      setStep(Math.min(draft.step ?? 0, TOTAL_STEPS - 1));
      setFullName(draft.fullName ?? "");
      setSelectedUni(draft.selectedUni ?? "");
      setSelectedMajor(draft.selectedMajor ?? "");
      setSelectedYear(draft.selectedYear ?? "");
      setAvatarPreview(draft.avatarPreview ?? "");
      setAvatarFileName(draft.avatarFileName ?? "");
      setSelectedCourses(
        (draft.selectedCourses ?? []).map((course) => ({
          ...course,
          grade: sanitizeTutorGrade(course.grade),
        })),
      );
      setGpa(draft.gpa ?? "");
      setBio(draft.bio ?? "");
      setTutorType(draft.tutorType ?? null);
      setNonStudentCredentials(draft.nonStudentCredentials ?? "");
      setTeachingStyles(draft.teachingStyles ?? []);
      setLanguages(draft.languages ?? []);
      setMode(draft.mode ?? "both");
      setRate(draft.rate ?? "20");
      setAvailabilityPreferences(draft.availabilityPreferences ?? []);
      setMaxStudents(draft.maxStudents ?? "");
      setProofPreview(draft.proofPreview ?? "");
      setProofFileName(draft.proofFileName ?? "");
      setPreviousExperience(draft.previousExperience ?? false);
      setYearsExperience(draft.yearsExperience ?? "");
      setSubscriptionAccepted(draft.subscriptionAccepted ?? false);
      setRestoredDraft(true);
      toast("Restored your tutor setup draft.");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (restoredDraft) return;
    setFullName((current) => current || profile?.full_name || user?.user_metadata?.full_name || "");
    setSelectedUni((current) => current || profile?.university_id || "");
    setSelectedMajor((current) => current || profile?.major || "");
    setSelectedYear((current) => current || profile?.year || "");
    setAvatarPreview((current) => current || profile?.avatar_url || "");
    setProofPreview((current) => current || profile?.proof_asset_url || "");
    setProofFileName((current) => current || profile?.proof_asset_name || "");
    setGpa((current) => current || (profile?.gpa ? String(profile.gpa) : ""));
    setBio((current) => current || profile?.bio || "");
    setTeachingStyles((current) => (current.length ? current : profile?.teaching_styles ?? []));
    setLanguages((current) => (current.length ? current : profile?.languages ?? []));
    setAvailabilityPreferences((current) =>
      current.length ? current : profile?.availability_preferences ?? [],
    );
    setRate((current) => current || (profile?.hourly_rate ? String(profile.hourly_rate) : "20"));
    setMaxStudents((current) =>
      current || (profile?.max_students_per_session ? String(profile.max_students_per_session) : ""),
    );
    setPreviousExperience(profile?.previous_tutoring_experience ?? false);
    setYearsExperience((current) =>
      current || (profile?.years_of_experience ? String(profile.years_of_experience) : ""),
    );
    setMode(profile?.online && profile?.in_person ? "both" : profile?.online ? "online" : profile?.in_person ? "in-person" : "both");
  }, [profile, restoredDraft, user]);

  const persistDraft = useCallback(
    (nextStep: number) => {
      const draft: Draft = {
        step: nextStep,
        fullName,
        selectedUni,
        selectedMajor,
        selectedYear,
        tutorType,
        nonStudentCredentials,
        avatarPreview,
        avatarFileName,
        selectedCourses,
        gpa,
        bio,
        teachingStyles,
        languages,
        mode,
        rate,
        availabilityPreferences,
        maxStudents,
        proofPreview,
        proofFileName,
        previousExperience,
        yearsExperience,
        subscriptionAccepted,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    },
    [
      availabilityPreferences,
      avatarFileName,
      avatarPreview,
      bio,
      fullName,
      gpa,
      languages,
      maxStudents,
      mode,
      nonStudentCredentials,
      previousExperience,
      proofFileName,
      proofPreview,
      rate,
      selectedCourses,
      selectedMajor,
      selectedUni,
      selectedYear,
      subscriptionAccepted,
      teachingStyles,
      tutorType,
      yearsExperience,
    ],
  );

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return;
    try {
      const result = await readFileAsDataUrl(file);
      setAvatarPreview(result);
      setAvatarFileName(file.name);
    } catch (error) {
      toast((error as Error).message);
    }
  };

  const handleProofChange = async (file: File | null) => {
    if (!file) return;
    try {
      const result = await readFileAsDataUrl(file);
      setProofPreview(result);
      setProofFileName(file.name);
    } catch (error) {
      toast((error as Error).message);
    }
  };

  const handleDocUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDocType || !user) return;
    setUploadingDoc(true);
    try {
      await uploadVerificationDocument({ userId: user.id, file, docType: selectedDocType });
      await refetchDocs();
      toast("Document uploaded.");
    } catch (error) {
      toast(error instanceof VerificationUploadError ? error.message : "Upload failed. Please try again.");
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDocDelete = async (doc: VerificationDocument) => {
    try {
      await deleteVerificationDocument(doc);
      await refetchDocs();
      toast("Document removed.");
    } catch {
      toast("Couldn't remove that document.");
    }
  };

  const toggleSelection = (value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((current) =>
      current.some((course) => course.courseId === courseId)
        ? current.filter((course) => course.courseId !== courseId)
        : [...current, { courseId, grade: "A" }],
    );
  };

  const updateCourseGrade = (courseId: string, grade: string) => {
    setSelectedCourses((current) =>
      current.map((course) =>
        course.courseId === courseId ? { ...course, grade: sanitizeTutorGrade(grade) } : course,
      ),
    );
  };

  const goForward = () => {
    const next = Math.min(step + 1, TOTAL_STEPS - 1);
    setDirection(1);
    persistDraft(next);
    setStep(next);
  };

  const goBack = () => {
    const next = Math.max(step - 1, 0);
    setDirection(-1);
    persistDraft(next);
    setStep(next);
  };

  const handleBackAction = async () => {
    if (step === 0) {
      persistDraft(0);
      try { await signOut(); } catch { /* ignore */ }
      navigate("/welcome?switch=1", { replace: true });
      return;
    }

    goBack();
  };

  const canContinue = [
    Boolean(fullName.trim() && selectedUni && selectedMajor),
    tutorType === "non_student"
      ? nonStudentCredentials.trim().length >= 20
      : Boolean(selectedCourses.length > 0 && selectedYear),
    Boolean(bio.trim().length >= 20 && teachingStyles.length > 0 && languages.length > 0),
    Boolean(Number(rate) > 0 && availabilityPreferences.length > 0),
    true,
    subscriptionAccepted,
  ][step];

  const finish = async () => {
    if (!user) {
      toast("Please sign in again to finish your tutor profile.");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        id: user.id,
        role: "tutor",
        full_name: fullName.trim(),
        avatar_url: avatarPreview || undefined,
        university_id: selectedUni || null,
        major: selectedMajor,
        year: selectedYear,
        bio: bio.trim(),
        hourly_rate: Number(rate),
        online: mode !== "in-person",
        in_person: mode !== "online",
        onboarded_at: new Date().toISOString(),
      });

      try {
        await updateProfile.mutateAsync({
          id: user.id,
          tutor_type: tutorType,
          gpa: gpa ? Number(gpa) : null,
          teaching_styles: teachingStyles,
          languages,
          availability_preferences: availabilityPreferences,
          max_students_per_session: maxStudents ? Number(maxStudents) : null,
          previous_tutoring_experience: previousExperience,
          years_of_experience: previousExperience && yearsExperience ? Number(yearsExperience) : null,
          proof_asset_url: proofPreview || "",
          proof_asset_name: proofFileName || "",
          subscription_plan: "tutor_monthly",
          subscription_status: "pending",
        });
      } catch (error) {
        console.warn("Tutor optional profile fields could not be saved yet:", error);
      }

      await setTutorCourses.mutateAsync({
        tutorId: user.id,
        courses: selectedCourses.map((course) => ({
          course_id: course.courseId,
          grade: sanitizeTutorGrade(course.grade),
        })),
      });

      const availabilitySlots = buildAvailabilitySlots(user.id, availabilityPreferences);
      try {
        await upsertAvailability.mutateAsync({
          tutorId: user.id,
          slots: availabilitySlots,
        });
      } catch (error) {
        if (!isMissingSupabaseResourceError(error)) {
          throw error;
        }
        console.warn("Tutor availability table is not available yet:", error);
      }

      setSelectedUniversity(selectedUni || "aub");
      await refreshProfile();
      localStorage.removeItem(STORAGE_KEY);
      setShowSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn't finish setup. Please try again.";
      toast(message);
    }
  };

  const currentCourses = selectedCourses
    .map((selection) => ({
      selection,
      course: allCourses.find((course) => course.id === selection.courseId),
    }))
    .filter((item): item is { selection: CourseSelection; course: (typeof allCourses)[number] } => Boolean(item.course));

  const availableCourseResults = filteredCourses.filter(
    (course) => !selectedCourses.some((selection) => selection.courseId === course.id),
  );

  const saving = updateProfile.isPending || setTutorCourses.isPending || upsertAvailability.isPending;
  const userEmail = user?.email ?? "";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SuccessOverlay
        visible={showSuccess}
        title="Tutor profile ready"
        description="You are now set up to get discovered by students, and you can refine everything from your profile next."
        onDismiss={() => navigate("/tutor/profile?edit=1")}
      />

      <ProgressBar step={step} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex h-full flex-col"
          >
            {step === 0 ? (
              <StepShell
                eyebrow="Basic info"
                title="Set up the essentials."
                description="Keep this first step quick. Students should immediately understand who you are, what you study, and where you teach."
              >
                <div className="space-y-5">
                  <Input
                    label="Full name"
                    value={fullName}
                    onChange={setFullName}
                    placeholder="Your full name"
                  />
                  <Input
                    label="Email"
                    value={userEmail}
                    readOnly
                    helper="This comes from your account and stays synced automatically."
                  />
                  <div className="rounded-2xl border border-border bg-surface px-4 py-3.5">
                    <p className="text-sm font-medium text-foreground">Password</p>
                    <p className="mt-1 text-sm text-ink-muted">Already secured on your account.</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">University</p>
                    <div className="space-y-2.5">
                      {universities.map((university) => (
                        <button
                          key={university.id}
                          type="button"
                          onClick={() => setSelectedUni(university.id)}
                          className={`flex w-full items-center gap-4 rounded-[1.35rem] border px-4 py-4 text-left transition-all ${
                            selectedUni === university.id
                              ? "border-accent bg-accent/8 shadow-[0_16px_40px_rgba(31,122,99,0.12)]"
                              : "border-border bg-surface hover:border-accent/30 hover:bg-accent/5"
                          }`}
                        >
                          <div
                            className="h-11 w-1.5 rounded-full"
                            style={{ backgroundColor: university.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">{university.short_name}</p>
                            <p className="truncate text-sm text-ink-muted">{university.name}</p>
                          </div>
                          {selectedUni === university.id ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Major / Field of study</p>
                    <div className="flex flex-wrap gap-2.5">
                      {MAJORS.map((major) => (
                        <SelectableChip
                          key={major}
                          active={selectedMajor === major}
                          label={major}
                          onClick={() => setSelectedMajor(major)}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-ink-muted/80">More fields below</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Your tutor type</p>
                    <div className="flex flex-wrap gap-2.5">
                      {([
                        { value: "student" as const, label: "Current student" },
                        { value: "non_student" as const, label: "Non-student / Professional" },
                      ]).map(({ value, label }) => (
                        <SelectableChip
                          key={value}
                          active={tutorType === value}
                          label={label}
                          onClick={() => setTutorType((prev) => (prev === value ? null : value))}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">Determines what credentials we ask you to share.</p>
                  </div>
                  <FilePicker
                    label="Profile photo"
                    helper="Optional, but tutors with a face get more trust and more messages."
                    preview={avatarPreview}
                    fileName={avatarFileName}
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
              </StepShell>
            ) : null}

            {step === 1 && tutorType !== "non_student" ? (
              <StepShell
                eyebrow="Academic credibility"
                title="Show what you can actually teach."
                description="This is where the platform feels different. Keep it course-specific so students can find someone who has really taken the class."
              >
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Courses you can teach</p>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                      <input
                        value={courseSearch}
                        onChange={(event) => setCourseSearch(event.target.value)}
                        placeholder={selectedUni ? "Search MATH101, BIO201, ECON..." : "Choose a university first"}
                        style={{ fontSize: "16px" }}
                        className="w-full rounded-2xl border border-border bg-surface py-3.5 pl-11 pr-4 text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
                      />
                    </div>
                  </div>

                  {currentCourses.length > 0 ? (
                    <div className="max-h-56 space-y-3 overflow-y-auto rounded-[1.6rem] border border-border bg-surface p-3">
                      {currentCourses.map(({ selection, course }) => (
                        <div key={selection.courseId} className="rounded-[1.35rem] border border-accent/15 bg-accent/5 p-3.5">
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground">{course.code}</p>
                              <p className="truncate text-sm text-ink-muted">{course.name}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleCourse(selection.courseId)}
                              className="rounded-full p-1 text-ink-muted transition-colors hover:bg-surface hover:text-foreground"
                              aria-label={`Remove ${course.code}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {GRADES.map((grade) => (
                              <SelectableChip
                                key={grade}
                                active={selection.grade === grade}
                                label={grade}
                                onClick={() => updateCourseGrade(selection.courseId, grade)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="rounded-[1.6rem] border border-border bg-surface">
                    <div className="max-h-64 overflow-y-auto p-2">
                      {availableCourseResults.length > 0 ? (
                        availableCourseResults.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => toggleCourse(course.id)}
                            className="flex w-full items-center justify-between rounded-[1.2rem] px-3 py-3 text-left transition-colors hover:bg-accent/5"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{course.code}</p>
                              <p className="truncate text-sm text-ink-muted">{course.name}</p>
                            </div>
                            <span className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Add</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-8 text-center text-sm text-ink-muted">
                          {selectedUni ? "No matching courses right now." : "Pick your university to load courses."}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="GPA"
                      value={gpa}
                      onChange={setGpa}
                      placeholder="Optional"
                      type="number"
                      helper="Optional, but recommended if you want extra trust."
                    />
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-foreground">Year</span>
                      <select
                        value={selectedYear}
                        onChange={(event) => setSelectedYear(event.target.value)}
                        style={{ fontSize: "16px" }}
                        className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
                      >
                        <option value="">Select your year</option>
                        {YEARS.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </StepShell>
            ) : null}

            {step === 1 && tutorType === "non_student" ? (
              <StepShell
                eyebrow="Your background"
                title="Tell us about your expertise."
                description="Share your professional background, certifications, or relevant experience so students understand why you're qualified to teach."
              >
                <div className="space-y-5">
                  <TextArea
                    label="Credentials & background"
                    value={nonStudentCredentials}
                    onChange={setNonStudentCredentials}
                    placeholder="Share your degrees, certifications, years of industry experience, or anything that shows why you're the right person to teach this subject..."
                    maxLength={600}
                  />

                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Previous tutoring experience</p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {[
                        { label: "No, just starting", value: false },
                        { label: "Yes, I have taught before", value: true },
                      ].map((option) => (
                        <button
                          key={String(option.value)}
                          type="button"
                          onClick={() => setPreviousExperience(option.value)}
                          className={`rounded-[1.35rem] border px-4 py-3 text-left text-sm font-medium transition-all ${
                            previousExperience === option.value
                              ? "border-accent bg-accent/8 text-accent shadow-[0_14px_32px_rgba(31,122,99,0.12)]"
                              : "border-border bg-surface text-foreground hover:border-accent/30 hover:bg-accent/5"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {previousExperience ? (
                    <Input
                      label="Years of experience"
                      value={yearsExperience}
                      onChange={setYearsExperience}
                      placeholder="0"
                      type="number"
                    />
                  ) : null}
                </div>
              </StepShell>
            ) : null}

            {step === 2 ? (
              <StepShell
                eyebrow="Tutor profile"
                title="Shape how students see you."
                description="This is the part that sells the fit. Keep it warm, specific, and easy to scan."
              >
                <div className="space-y-5">
                  <TextArea
                    label="Short bio"
                    value={bio}
                    onChange={setBio}
                    placeholder="Mechanical engineering student at AUB. I help with statics, dynamics, and exam prep in a calm, structured way."
                    maxLength={240}
                  />

                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Teaching style</p>
                    <div className="flex flex-wrap gap-2.5">
                      {TEACHING_STYLES.map((style) => (
                        <SelectableChip
                          key={style.value}
                          active={teachingStyles.includes(style.value)}
                          label={style.label}
                          onClick={() => toggleSelection(style.value, setTeachingStyles)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Languages spoken</p>
                    <div className="flex flex-wrap gap-2.5">
                      {LANGUAGE_OPTIONS.map((language) => (
                        <SelectableChip
                          key={language}
                          active={languages.includes(language)}
                          label={language}
                          onClick={() => toggleSelection(language, setLanguages)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Session format</p>
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {(["online", "in-person", "both"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setMode(option)}
                          className={`rounded-[1.35rem] border px-4 py-3 text-sm font-medium capitalize transition-all ${
                            mode === option
                              ? "border-accent bg-accent/8 text-accent shadow-[0_14px_32px_rgba(31,122,99,0.12)]"
                              : "border-border bg-surface text-foreground hover:border-accent/30 hover:bg-accent/5"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </StepShell>
            ) : null}

            {step === 3 ? (
              <StepShell
                eyebrow="Pricing & availability"
                title="Set clear expectations."
                description="A simple rate and a few availability signals are enough to start receiving relevant inquiries."
              >
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Price per hour"
                      value={rate}
                      onChange={setRate}
                      placeholder="20"
                      type="number"
                    />
                    <Input
                      label="Max students per session"
                      value={maxStudents}
                      onChange={setMaxStudents}
                      placeholder="Optional"
                      type="number"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Availability</p>
                    <div className="flex flex-wrap gap-2.5">
                      {AVAILABILITY_OPTIONS.map((option) => (
                        <SelectableChip
                          key={option.value}
                          active={availabilityPreferences.includes(option.value)}
                          label={option.label}
                          onClick={() => toggleSelection(option.value, setAvailabilityPreferences)}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-ink-muted">
                      We will prefill a simple weekly schedule for you, and you can fine-tune it from your profile later.
                    </p>
                  </div>
                </div>
              </StepShell>
            ) : null}

            {step === 4 ? (
              <StepShell
                eyebrow="Verification"
                title="Upload your documents."
                description="Upload at least one document so we can verify your identity and credibility."
              >
                <div className="space-y-6">
                  <p className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-ink-muted">
                    Uploading is optional — you can add documents later from your dashboard.
                  </p>

                  <div>
                    <p className="mb-3 text-sm font-medium text-foreground">Document type</p>
                    <div className="flex flex-wrap gap-2.5">
                      {(tutorType === "non_student" ? NON_STUDENT_TRACK_DOC_TYPES : STUDENT_TRACK_DOC_TYPES).map(
                        (docType) => (
                          <SelectableChip
                            key={docType}
                            active={selectedDocType === docType}
                            label={VERIFICATION_DOC_LABELS[docType]}
                            onClick={() => setSelectedDocType(docType)}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">
                      {selectedDocType
                        ? `Upload ${VERIFICATION_DOC_LABELS[selectedDocType]}`
                        : "Select a document type above"}
                    </p>
                    <div className="rounded-[1.5rem] border border-dashed border-border bg-surface p-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        disabled={!selectedDocType || uploadingDoc}
                        onChange={handleDocUpload}
                        className="block w-full text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:font-medium file:text-accent disabled:pointer-events-none disabled:opacity-50"
                      />
                      <p className="mt-2 text-xs text-ink-muted">PNG, JPEG or PDF · max 10 MB</p>
                    </div>
                    {uploadingDoc ? (
                      <div className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
                        <motion.span
                          className="h-3.5 w-3.5 rounded-full border-2 border-accent/30 border-t-accent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                        />
                        Uploading…
                      </div>
                    ) : null}
                  </div>

                  {verificationDocs.length > 0 ? (
                    <div>
                      <p className="mb-3 text-sm font-medium text-foreground">Uploaded documents</p>
                      <div className="space-y-2.5">
                        {verificationDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{doc.file_name}</p>
                              <p className="text-xs text-ink-muted">
                                {VERIFICATION_DOC_LABELS[doc.doc_type as VerificationDocType]}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDocDelete(doc as VerificationDocument)}
                              className="ml-3 shrink-0 rounded-full p-1.5 text-ink-muted transition-colors hover:text-red-500"
                              aria-label="Remove document"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </StepShell>
            ) : null}

            {step === 5 ? (
              <StepShell
                eyebrow="Subscription"
                title="Join the platform as a tutor."
                description="Keep this simple and clear. Your listing goes live, students can discover you, and you receive inquiries from your campus community."
              >
                <div className="space-y-5">
                  <div className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_24px_60px_rgba(17,24,39,0.06)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Tutor membership</p>
                        <h2
                          className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-foreground"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.08 }}
                        >
                          ${SUBSCRIPTION_PRICE}/month
                        </h2>
                      </div>
                      <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                        Clean start
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 text-sm text-ink-muted">
                      <p>You get listed on the platform and appear in course-specific searches.</p>
                      <p>Students can view your profile, compare your pricing, and message you directly.</p>
                      <p>You can keep refining your listing, schedule, and profile after setup.</p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 rounded-[1.4rem] border border-border bg-surface px-4 py-4">
                    <input
                      type="checkbox"
                      checked={subscriptionAccepted}
                      onChange={(event) => setSubscriptionAccepted(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-sm leading-6 text-foreground">
                      I&apos;m ready to join as a tutor and publish my listing under the monthly tutor plan.
                    </span>
                  </label>
                </div>
              </StepShell>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 border-t border-border/80 bg-background px-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackAction}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <Link to="/terms" target="_blank" className="text-xs text-ink-muted transition-colors hover:text-accent">
            Terms & privacy
          </Link>
        </div>

        {step < TOTAL_STEPS - 1 ? (
          <motion.button
            whileTap={{ scale: canContinue ? 0.98 : 1 }}
            transition={springs.snappy}
            type="button"
            onClick={goForward}
            disabled={!canContinue}
            className="h-14 w-full rounded-2xl bg-accent text-sm font-semibold text-white shadow-[0_18px_34px_rgba(31,122,99,0.22)] transition-all disabled:cursor-not-allowed disabled:opacity-45"
          >
            Continue
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: saving ? 1 : 0.98 }}
            transition={springs.snappy}
            type="button"
            onClick={finish}
            disabled={!canContinue || saving}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-semibold text-white shadow-[0_18px_34px_rgba(31,122,99,0.22)] transition-all disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saving ? (
              <>
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                />
                Finishing setup
              </>
            ) : (
              "Finish tutor setup"
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default TutorOnboarding;
