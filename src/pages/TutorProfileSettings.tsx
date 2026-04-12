import { type ChangeEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useBlocker, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Globe,
  GraduationCap,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Save,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  useCourses,
  useDeleteOwnAccount,
  useTutor,
  useUniversities,
  useUpdateProfile,
  useSetTutorCourses,
} from "@/hooks/useSupabaseQuery";
import { useAvailability, useUpsertAvailability } from "@/hooks/useAvailability";
import { toast, toastError } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileHeaderSkeleton } from "@/components/skeletons";
import { TutorAvailabilityEditor, type AvailabilityEditorSlot } from "@/components/tutor-settings/TutorAvailabilityEditor";
import { TutorCourseSelector } from "@/components/tutor-settings/TutorCourseSelector";
import {
  deleteProfileAvatarByUrl,
  uploadProfileAvatar,
} from "@/lib/profileAvatar";

const genderOptions = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "other", label: "Other" },
] as const;

const unspecifiedGender = "unspecified";

const teachingModeOptions = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In person" },
  { value: "both", label: "Both" },
] as const;

const phonePattern = /^[0-9+\-()\s]{7,20}$/;

const tutorSettingsSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone_number: z
    .string()
    .trim()
    .refine((value) => !value || phonePattern.test(value), "Enter a valid phone number."),
  gender: z.enum([unspecifiedGender, ...genderOptions.map((option) => option.value)] as [string, ...string[]]),
  date_of_birth: z.string().trim(),
  city: z.string().trim().max(80, "City is too long."),
  country: z.string().trim().max(80, "Country is too long."),
  university_id: z.string().trim().min(1, "Select your university."),
  major: z.string().trim().min(2, "Enter your major or field of study."),
  year: z.string().trim().min(1, "Enter your year of study."),
  hourly_rate: z.coerce
    .number({ invalid_type_error: "Enter your hourly rate." })
    .min(1, "Hourly rate must be at least $1.")
    .max(500, "Hourly rate looks too high."),
  bio: z
    .string()
    .trim()
    .min(20, "Add a short bio so students know what to expect.")
    .max(500, "Keep your bio under 500 characters."),
  languages_text: z
    .string()
    .trim()
    .refine((value) => parseLanguages(value).length > 0, "Add at least one language."),
  teaching_mode: z.enum(["online", "in_person", "both"]),
  accepting_students: z.boolean(),
  deactivate_profile: z.boolean(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password."),
    new_password: z.string().min(6, "Minimum 6 characters."),
    confirm_password: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

type TutorSettingsValues = z.infer<typeof tutorSettingsSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

type SettingsSnapshot = {
  values: TutorSettingsValues;
  avatarPreview: string;
  selectedCourseIds: string[];
  availability: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
};

function parseLanguages(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(/[\n,]/)
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function teachingModeFromProfile(profile: {
  online?: boolean | null;
  in_person?: boolean | null;
}) {
  if (profile.online && profile.in_person) return "both" as const;
  if (profile.in_person) return "in_person" as const;
  return "online" as const;
}

function normalizeAvailability(slots: Array<{
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}>): AvailabilityEditorSlot[] {
  return [...slots]
    .sort((a, b) =>
      a.day_of_week === b.day_of_week
        ? a.start_time.localeCompare(b.start_time)
        : a.day_of_week - b.day_of_week,
    )
    .map((slot, index) => ({
      key: slot.id ?? `${slot.day_of_week}-${slot.start_time}-${slot.end_time}-${index}`,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
    }));
}

function snapshotFromState(
  values: TutorSettingsValues,
  avatarPreview: string,
  selectedCourseIds: string[],
  availability: AvailabilityEditorSlot[],
): SettingsSnapshot {
  return {
    values: {
      ...values,
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      phone_number: values.phone_number.trim(),
      city: values.city.trim(),
      country: values.country.trim(),
      major: values.major.trim(),
      year: values.year.trim(),
      bio: values.bio.trim(),
      languages_text: parseLanguages(values.languages_text).join(", "),
    },
    avatarPreview,
    selectedCourseIds: [...selectedCourseIds].sort(),
    availability: [...availability]
      .map((slot) => ({
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }))
      .sort((a, b) =>
        a.day_of_week === b.day_of_week
          ? a.start_time.localeCompare(b.start_time)
          : a.day_of_week - b.day_of_week,
      ),
  };
}

function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const blocker = useBlocker(hasUnsavedChanges);

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    const shouldLeave = window.confirm(
      "You have unsaved changes. Leave this page and lose them?",
    );

    if (shouldLeave) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-3xl border-border/80 shadow-sm">
      <CardHeader className="space-y-3 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
          <CardDescription className="text-sm leading-6 text-muted-foreground">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm font-medium text-destructive">{message}</p>;
}

export default function TutorProfileSettingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const { data: tutorProfile, isLoading: tutorProfileLoading } = useTutor(user?.id ?? "");
  const { data: universities = [] } = useUniversities();
  const activeProfile = (tutorProfile as typeof profile) ?? profile;
  const currentUniversityId = activeProfile?.university_id ?? undefined;
  const { data: allCourses = [] } = useCourses();
  const { data: availability = [], isLoading: availabilityLoading } = useAvailability(user?.id ?? "");
  const updateProfile = useUpdateProfile();
  const setTutorCourses = useSetTutorCourses();
  const upsertAvailability = useUpsertAvailability();
  const deleteOwnAccount = useDeleteOwnAccount();

  const tutorCourses: Array<{ course_id: string; grade?: string }> =
    ((tutorProfile as any)?.tutor_courses as Array<{ course_id: string; grade?: string }>) ?? [];

  const initialCourseGrades = useMemo(
    () => new Map(tutorCourses.map((course) => [course.course_id, course.grade ?? "A"])),
    [tutorCourses],
  );

  const form = useForm<TutorSettingsValues>({
    resolver: zodResolver(tutorSettingsSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      gender: unspecifiedGender,
      date_of_birth: "",
      city: "",
      country: "",
      university_id: "",
      major: "",
      year: "",
      hourly_rate: 20,
      bio: "",
      languages_text: "",
      teaching_mode: "online",
      accepting_students: true,
      deactivate_profile: false,
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [availabilityDraft, setAvailabilityDraft] = useState<AvailabilityEditorSlot[]>([]);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [deleteAvatar, setDeleteAvatar] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<SettingsSnapshot | null>(null);
  const [didHydrate, setDidHydrate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!activeProfile || !user || availabilityLoading || didHydrate) return;

    const nextValues: TutorSettingsValues = {
      full_name: activeProfile.full_name ?? "",
      email: user.email ?? "",
      phone_number: activeProfile.phone_number ?? "",
      gender: activeProfile.gender ?? unspecifiedGender,
      date_of_birth: activeProfile.date_of_birth ?? "",
      city: activeProfile.city ?? "",
      country: activeProfile.country ?? "",
      university_id: activeProfile.university_id ?? "",
      major: activeProfile.major ?? "",
      year: activeProfile.year ?? "",
      hourly_rate: Number(activeProfile.hourly_rate ?? 20),
      bio: activeProfile.bio ?? "",
      languages_text: (activeProfile.languages ?? []).join(", "),
      teaching_mode: teachingModeFromProfile(activeProfile),
      accepting_students: activeProfile.accepting_students ?? true,
      deactivate_profile: Boolean(activeProfile.deactivated_at),
    };

    const nextCourseIds = tutorCourses.map((course) => course.course_id);
    const nextAvailability = normalizeAvailability(availability);
    const nextAvatarPreview = activeProfile.avatar_url ?? "";

    form.reset(nextValues);
    setSelectedCourseIds(nextCourseIds);
    setAvailabilityDraft(nextAvailability);
    setAvatarPreview(nextAvatarPreview);
    setAvatarFile(null);
    setDeleteAvatar(false);
    setInitialSnapshot(
      snapshotFromState(nextValues, nextAvatarPreview, nextCourseIds, nextAvailability),
    );
    setDidHydrate(true);
  }, [activeProfile, availability, availabilityLoading, didHydrate, form, tutorCourses, user]);

  const watchedValues = form.watch();

  const currentSnapshot = useMemo(
    () =>
      snapshotFromState(
        watchedValues,
        deleteAvatar ? "" : avatarPreview,
        selectedCourseIds,
        availabilityDraft,
      ),
    [watchedValues, deleteAvatar, avatarPreview, selectedCourseIds, availabilityDraft],
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!initialSnapshot) return false;
    return JSON.stringify(initialSnapshot) !== JSON.stringify(currentSnapshot);
  }, [currentSnapshot, initialSnapshot]);

  useUnsavedChangesGuard(hasUnsavedChanges);

  useEffect(() => {
    if (searchParams.get("edit") !== "1") return;
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const validateAvailability = useCallback(() => {
    for (const slot of availabilityDraft) {
      if (!slot.start_time || !slot.end_time) {
        toast.error("Fill in both start and end times for every availability slot.");
        return false;
      }

      if (slot.start_time >= slot.end_time) {
        toast.error("Each availability slot must end after it starts.");
        return false;
      }
    }

    return true;
  }, [availabilityDraft]);

  const selectedUniversityId = watchedValues.university_id || currentUniversityId;

  const courses = useMemo(
    () =>
      selectedUniversityId
        ? allCourses.filter((course) => course.university_id === selectedUniversityId)
        : allCourses,
    [allCourses, selectedUniversityId],
  );

  useEffect(() => {
    if (!didHydrate || !courses.length) return;
    setSelectedCourseIds((current) =>
      current.filter((courseId) => courses.some((course) => course.id === courseId)),
    );
  }, [courses, didHydrate, watchedValues.university_id]);

  const handleAvatarInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    setAvatarFile(file);
    setDeleteAvatar(false);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const resetToInitial = useCallback(() => {
    if (!initialSnapshot) return;
    form.reset(initialSnapshot.values);
    setSelectedCourseIds(initialSnapshot.selectedCourseIds);
    setAvailabilityDraft(
      initialSnapshot.availability.map((slot, index) => ({
        key: `${slot.day_of_week}-${slot.start_time}-${slot.end_time}-${index}`,
        ...slot,
      })),
    );
    setAvatarPreview(initialSnapshot.avatarPreview);
    setAvatarFile(null);
    setDeleteAvatar(false);
    passwordForm.reset();
  }, [form, initialSnapshot, passwordForm]);

  const handleSave = form.handleSubmit(async (values) => {
    if (!user || !activeProfile) return;
    if (selectedCourseIds.length === 0) {
      toast.error("Select at least one course you can teach.");
      return;
    }
    if (!validateAvailability()) return;

    setIsSaving(true);

    const previousAvatarUrl = activeProfile.avatar_url ?? "";
    let nextAvatarUrl = deleteAvatar ? "" : previousAvatarUrl;
    let uploadedNewAvatar = false;
    let updatedEmail = false;

    try {
      if (avatarFile) {
        const uploaded = await uploadProfileAvatar(user.id, avatarFile);
        nextAvatarUrl = uploaded.publicUrl;
        uploadedNewAvatar = true;
      }

      if (values.email.trim() !== (user.email ?? "")) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email.trim(),
        });
        if (emailError) throw emailError;
        updatedEmail = true;
      }

      const teachingMode = values.teaching_mode;
      const shouldDeactivate = values.deactivate_profile;

      await updateProfile.mutateAsync({
        id: user.id,
        full_name: values.full_name.trim(),
        avatar_url: nextAvatarUrl,
        phone_number: values.phone_number.trim(),
        gender: values.gender === unspecifiedGender ? null : values.gender,
        date_of_birth: values.date_of_birth || null,
        city: values.city.trim(),
        country: values.country.trim(),
        university_id: values.university_id,
        major: values.major.trim(),
        year: values.year.trim(),
        hourly_rate: values.hourly_rate,
        bio: values.bio.trim(),
        languages: parseLanguages(values.languages_text),
        online: teachingMode === "online" || teachingMode === "both",
        in_person: teachingMode === "in_person" || teachingMode === "both",
        accepting_students: shouldDeactivate ? false : values.accepting_students,
        deactivated_at: shouldDeactivate
          ? activeProfile.deactivated_at || new Date().toISOString()
          : null,
        availability_preferences: Array.from(
          new Set(availabilityDraft.map((slot) => String(slot.day_of_week))),
        ),
      });

      await setTutorCourses.mutateAsync({
        tutorId: user.id,
        courses: selectedCourseIds.map((courseId) => ({
          course_id: courseId,
          grade: initialCourseGrades.get(courseId) ?? "A",
        })),
      });

      await upsertAvailability.mutateAsync({
        tutorId: user.id,
        slots: availabilityDraft.map((slot) => ({
          tutor_id: user.id,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
        })),
      });

      if ((deleteAvatar || uploadedNewAvatar) && previousAvatarUrl) {
        await deleteProfileAvatarByUrl(previousAvatarUrl);
      }

      await refreshProfile();

      const nextSnapshot = snapshotFromState(
        {
          ...values,
          accepting_students: shouldDeactivate ? false : values.accepting_students,
        },
        nextAvatarUrl,
        selectedCourseIds,
        availabilityDraft,
      );

      form.reset(nextSnapshot.values);
      setInitialSnapshot(nextSnapshot);
      setAvatarPreview(nextAvatarUrl);
      setAvatarFile(null);
      setDeleteAvatar(false);

      toast.success(
        updatedEmail
          ? "Settings saved. Check your inbox to confirm the new email address."
          : "Tutor settings saved.",
      );
    } catch (error) {
      if (uploadedNewAvatar && nextAvatarUrl) {
        await deleteProfileAvatarByUrl(nextAvatarUrl);
      }
      toastError(error);
    } finally {
      setIsSaving(false);
    }
  });

  const handlePasswordChange = passwordForm.handleSubmit(async (values) => {
    if (!user?.email) {
      toast.error("We couldn't verify your account email. Please sign in again.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.current_password,
      });
      if (verifyError) {
        passwordForm.setError("current_password", {
          type: "manual",
          message: "Current password is incorrect.",
        });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.new_password,
      });

      if (updateError) throw updateError;

      passwordForm.reset();
      toast.success("Password updated.");
    } catch (error) {
      toastError(error);
    } finally {
      setIsChangingPassword(false);
    }
  });

  const handleDeleteAccount = async () => {
    try {
      await deleteOwnAccount.mutateAsync();
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore — session can already be invalid after deletion
      }
      navigate("/welcome?switch=1", { replace: true });
    } catch (error) {
      toastError(error);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate("/welcome?switch=1", { replace: true });
    } catch (error) {
      toastError(error);
    }
  }, [navigate, signOut]);

  if (loading || tutorProfileLoading || !activeProfile || !user) {
    return (
      <div className="px-5 pb-24 pt-12">
        <ProfileHeaderSkeleton />
      </div>
    );
  }

  const isBusy =
    isSaving ||
    updateProfile.isPending ||
    setTutorCourses.isPending ||
    upsertAvailability.isPending;

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigate("/tutor/requests")}
              aria-label="Go back"
              className="mt-1 rounded-2xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Avatar
                  src={deleteAvatar ? "" : avatarPreview || activeProfile.avatar_url}
                  name={form.watch("full_name") || activeProfile.full_name || "Tutor"}
                  size={84}
                />
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
                    Tutor account settings
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                    Manage your profile
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Keep your tutor profile accurate, update your security settings, and control
                    how students see you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
            {hasUnsavedChanges ? "You have unsaved changes." : "All changes saved."}
          </div>
        </div>

        <div className="grid gap-6">
          <SectionCard
            icon={UserRound}
            title="Personal Info"
            description="Basic identity and contact details students may use to recognize and reach you."
          >
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar
                  src={deleteAvatar ? "" : avatarPreview || activeProfile.avatar_url}
                  name={form.watch("full_name") || activeProfile.full_name || "Tutor"}
                  size={72}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">Profile photo</p>
                  <p className="text-sm text-muted-foreground">
                    Upload a clear profile picture. If you skip it, we’ll show your initial.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" asChild>
                  <label className="cursor-pointer">
                    <Camera className="h-4 w-4" />
                    Upload photo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={handleAvatarInput}
                    />
                  </label>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview("");
                    setDeleteAvatar(true);
                  }}
                  disabled={!avatarPreview && !activeProfile.avatar_url}
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" {...form.register("full_name")} />
                <FieldError message={form.formState.errors.full_name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                <FieldError message={form.formState.errors.email?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone number</Label>
                <Input id="phone_number" autoComplete="tel" {...form.register("phone_number")} />
                <FieldError message={form.formState.errors.phone_number?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={form.watch("gender")}
                  onValueChange={(value) =>
                    form.setValue("gender", value as TutorSettingsValues["gender"], {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={unspecifiedGender}>Prefer not to say</SelectItem>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={form.formState.errors.gender?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of birth</Label>
                <Input id="date_of_birth" type="date" {...form.register("date_of_birth")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" autoComplete="address-level2" {...form.register("city")} />
                <FieldError message={form.formState.errors.city?.message} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" autoComplete="country-name" {...form.register("country")} />
                <FieldError message={form.formState.errors.country?.message} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={GraduationCap}
            title="Tutor Info"
            description="Everything students need in order to discover you, trust you, and decide to message you."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="university_id">University</Label>
                <Select
                  value={form.watch("university_id")}
                  onValueChange={(value) =>
                    form.setValue("university_id", value, { shouldDirty: true })
                  }
                >
                  <SelectTrigger id="university_id">
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.short_name} — {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={form.formState.errors.university_id?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major / field of study</Label>
                <Input id="major" {...form.register("major")} />
                <FieldError message={form.formState.errors.major?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year of study</Label>
                <Input id="year" placeholder="e.g. Junior, Senior, Graduate" {...form.register("year")} />
                <FieldError message={form.formState.errors.year?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly rate (USD)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="decimal"
                  {...form.register("hourly_rate", { valueAsNumber: true })}
                />
                <FieldError message={form.formState.errors.hourly_rate?.message} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">About me</Label>
                <Textarea
                  id="bio"
                  rows={5}
                  placeholder="Share your strengths, teaching style, and what students can expect from you."
                  {...form.register("bio")}
                />
                <div className="flex items-center justify-between">
                  <FieldError message={form.formState.errors.bio?.message} />
                  <span className="text-xs text-muted-foreground">
                    {form.watch("bio").length}/500
                  </span>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="languages_text">Languages spoken</Label>
                <Input
                  id="languages_text"
                  placeholder="English, Arabic, French"
                  {...form.register("languages_text")}
                />
                <FieldError message={form.formState.errors.languages_text?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teaching_mode">Teaching mode</Label>
                <Select
                  value={form.watch("teaching_mode")}
                  onValueChange={(value) =>
                    form.setValue("teaching_mode", value as TutorSettingsValues["teaching_mode"], {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="teaching_mode">
                    <SelectValue placeholder="Select a teaching mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachingModeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={form.formState.errors.teaching_mode?.message} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3">
                  <div>
                    <Label htmlFor="accepting_students" className="text-sm font-semibold text-foreground">
                      Currently accepting students
                    </Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Turn this off if you want to pause new inquiries without hiding your profile.
                    </p>
                  </div>
                  <Switch
                    id="accepting_students"
                    checked={form.watch("accepting_students")}
                    onCheckedChange={(checked) =>
                      form.setValue("accepting_students", checked, { shouldDirty: true })
                    }
                    disabled={form.watch("deactivate_profile")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <h3 className="text-base font-semibold text-foreground">Courses you can teach</h3>
              </div>
              <TutorCourseSelector
                courses={courses}
                selectedCourseIds={selectedCourseIds}
                onChange={setSelectedCourseIds}
                disabled={isBusy}
              />
              {selectedCourseIds.length === 0 && (
                <FieldError message="Select at least one course you can teach." />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-accent" />
                <h3 className="text-base font-semibold text-foreground">Availability / schedule</h3>
              </div>
              <TutorAvailabilityEditor
                value={availabilityDraft}
                onChange={setAvailabilityDraft}
                disabled={isBusy}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Shield}
            title="Security"
            description="Change your password safely and keep control of your active session."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current password</Label>
                <Input
                  id="current_password"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register("current_password")}
                />
                <FieldError message={passwordForm.formState.errors.current_password?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New password</Label>
                <Input
                  id="new_password"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("new_password")}
                />
                <FieldError message={passwordForm.formState.errors.new_password?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm new password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  {...passwordForm.register("confirm_password")}
                />
                <FieldError message={passwordForm.formState.errors.confirm_password?.message} />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                We verify your current password before saving a new one.
              </p>
              <Button type="button" variant="outline" onClick={handlePasswordChange} disabled={isChangingPassword}>
                {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Change password
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            icon={MapPin}
            title="Account Actions"
            description="Profile visibility and high-impact account controls live here."
          >
            <div className="rounded-2xl border border-border bg-background/70 px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="deactivate_profile" className="text-sm font-semibold text-foreground">
                    Deactivate profile
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Hide your tutor profile from students while keeping your account and settings intact.
                  </p>
                </div>
                <Switch
                  id="deactivate_profile"
                  checked={form.watch("deactivate_profile")}
                  onCheckedChange={(checked) => {
                    form.setValue("deactivate_profile", checked, { shouldDirty: true });
                    if (checked) {
                      form.setValue("accepting_students", false, { shouldDirty: true });
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Log out
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleteOwnAccount.isPending}
              >
                {deleteOwnAccount.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete account
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {hasUnsavedChanges
              ? "You have unsaved changes."
              : "Your tutor settings are up to date."}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={resetToInitial}
              disabled={!hasUnsavedChanges || isBusy}
            >
              Reset changes
            </Button>
            <Button type="button" onClick={handleSave} disabled={!hasUnsavedChanges || isBusy}>
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your tutor account, profile, and connected tutoring data. This action can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
