// ── Saved Tutors Hooks (C1) ───────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast, toastError } from "@/components/ui/sonner";

// Fetch all saved tutors for a student
export function useSavedTutors(studentId: string) {
  return useQuery({
    queryKey: ["saved-tutors", studentId],
    queryFn: async () => {
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
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
    staleTime: 60 * 1000,
  });
}

// Check if a specific tutor is saved
export function useIsTutorSaved(studentId: string, tutorId: string) {
  return useQuery({
    queryKey: ["is-saved", studentId, tutorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_tutors")
        .select("id")
        .eq("student_id", studentId)
        .eq("tutor_id", tutorId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!studentId && !!tutorId,
    staleTime: 30 * 1000,
  });
}

// Save a tutor
export function useSaveTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, tutorId }: { studentId: string; tutorId: string }) => {
      const { error } = await supabase
        .from("saved_tutors")
        .upsert(
          { student_id: studentId, tutor_id: tutorId },
          { onConflict: "student_id,tutor_id", ignoreDuplicates: true }
        );
      if (error) throw error;
    },
    onSuccess: (_, { studentId, tutorId }) => {
      queryClient.invalidateQueries({ queryKey: ["saved-tutors"] });
      queryClient.setQueryData(["is-saved", studentId, tutorId], true);
      toast.success("Tutor saved");
    },
    onError: (err) => toastError(err),
  });
}

// Unsave a tutor
export function useUnsaveTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, tutorId }: { studentId: string; tutorId: string }) => {
      const { error } = await supabase
        .from("saved_tutors")
        .delete()
        .eq("student_id", studentId)
        .eq("tutor_id", tutorId);
      if (error) throw error;
    },
    onSuccess: (_, { studentId, tutorId }) => {
      queryClient.invalidateQueries({ queryKey: ["saved-tutors"] });
      queryClient.setQueryData(["is-saved", studentId, tutorId], false);
      toast("Tutor removed from saved");
    },
    onError: (err) => toastError(err),
  });
}
