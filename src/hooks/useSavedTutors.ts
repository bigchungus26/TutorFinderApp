import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TutorWithDetails } from "@/types/database";
import { toast } from "@/components/ui/sonner";

type SavedTutorEntry = {
  id: string;
  student_id: string;
  tutor_id: string;
  created_at: string;
  tutor: TutorWithDetails;
};

function getLocalStorageKey(studentId: string) {
  return `savedTutors:${studentId}`;
}

function readLocalSavedTutors(studentId: string): SavedTutorEntry[] {
  if (typeof window === "undefined" || !studentId) return [];

  try {
    const raw = window.localStorage.getItem(getLocalStorageKey(studentId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalSavedTutors(studentId: string, entries: SavedTutorEntry[]) {
  if (typeof window === "undefined" || !studentId) return;
  window.localStorage.setItem(getLocalStorageKey(studentId), JSON.stringify(entries));
}

function upsertLocalSavedTutor(studentId: string, tutor: TutorWithDetails) {
  const current = readLocalSavedTutors(studentId);
  const next = current.filter((entry) => entry.tutor_id !== tutor.id);
  next.unshift({
    id: `local-${tutor.id}`,
    student_id: studentId,
    tutor_id: tutor.id,
    created_at: new Date().toISOString(),
    tutor,
  });
  writeLocalSavedTutors(studentId, next);
  return next;
}

function removeLocalSavedTutor(studentId: string, tutorId: string) {
  const next = readLocalSavedTutors(studentId).filter((entry) => entry.tutor_id !== tutorId);
  writeLocalSavedTutors(studentId, next);
  return next;
}

function mergeSavedEntries(remote: SavedTutorEntry[], local: SavedTutorEntry[]) {
  const merged = new Map<string, SavedTutorEntry>();

  for (const entry of local) {
    merged.set(entry.tutor_id, entry);
  }

  for (const entry of remote) {
    merged.set(entry.tutor_id, entry);
  }

  return Array.from(merged.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function useSavedTutors(studentId: string) {
  return useQuery({
    queryKey: ["saved-tutors", studentId],
    queryFn: async () => {
      const localEntries = readLocalSavedTutors(studentId);

      const { data, error } = await supabase
        .from("saved_tutors")
        .select(`
          *,
          tutor:profiles!saved_tutors_tutor_id_fkey (
            *,
            tutor_stats (*),
            tutor_courses (*, course:courses(*))
          )
        `)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (error) {
        return localEntries;
      }

      return mergeSavedEntries((data ?? []) as SavedTutorEntry[], localEntries);
    },
    enabled: !!studentId,
    staleTime: 60 * 1000,
  });
}

export function useIsTutorSaved(studentId: string, tutorId: string) {
  return useQuery({
    queryKey: ["is-saved", studentId, tutorId],
    queryFn: async () => {
      const localMatch = readLocalSavedTutors(studentId).some((entry) => entry.tutor_id === tutorId);
      if (localMatch) return true;

      const { data, error } = await supabase
        .from("saved_tutors")
        .select("id")
        .eq("student_id", studentId)
        .eq("tutor_id", tutorId)
        .maybeSingle();

      if (error) return false;
      return !!data;
    },
    enabled: !!studentId && !!tutorId,
    staleTime: 30 * 1000,
  });
}

export function useSaveTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      tutorId,
      tutor,
    }: {
      studentId: string;
      tutorId: string;
      tutor: TutorWithDetails;
    }) => {
      const localEntries = upsertLocalSavedTutor(studentId, tutor);

      const { error } = await supabase
        .from("saved_tutors")
        .insert({ student_id: studentId, tutor_id: tutorId });

      if (error && error.code !== "23505") {
        console.warn("Saved tutor sync failed, kept locally:", error);
      }

      return { localEntries };
    },
    onSuccess: ({ localEntries }, { studentId, tutorId }) => {
      queryClient.setQueryData(["saved-tutors", studentId], localEntries);
      queryClient.setQueryData(["is-saved", studentId, tutorId], true);
      toast.success("Tutor saved");
    },
  });
}

export function useUnsaveTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, tutorId }: { studentId: string; tutorId: string }) => {
      const localEntries = removeLocalSavedTutor(studentId, tutorId);

      const { error } = await supabase
        .from("saved_tutors")
        .delete()
        .eq("student_id", studentId)
        .eq("tutor_id", tutorId);

      if (error) {
        console.warn("Saved tutor removal sync failed, removed locally:", error);
      }

      return { localEntries };
    },
    onSuccess: ({ localEntries }, { studentId, tutorId }) => {
      queryClient.setQueryData(["saved-tutors", studentId], localEntries);
      queryClient.setQueryData(["is-saved", studentId, tutorId], false);
      toast("Tutor removed from saved");
    },
  });
}
