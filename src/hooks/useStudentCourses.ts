// ── Student Courses Hooks (C6) ────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  isMissingSupabaseResourceError,
  isSupabaseResourceMissing,
  markSupabaseResourceMissing,
} from "@/lib/supabaseResourceFallback";

export function useStudentCourses(studentId: string) {
  return useQuery({
    queryKey: ["student-courses", studentId],
    queryFn: async () => {
      if (isSupabaseResourceMissing("student_courses")) {
        return [];
      }

      const { data, error } = await supabase
        .from("student_courses")
        .select(`*, course:courses(*)`)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("student_courses");
          return [];
        }
        throw error;
      }
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSetStudentCourses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      courseIds,
      semester,
    }: {
      studentId: string;
      courseIds: string[];
      semester: string;
    }) => {
      // Delete existing and re-insert
      const { error: delError } = await supabase
        .from("student_courses")
        .delete()
        .eq("student_id", studentId);
      if (delError) throw delError;

      if (courseIds.length > 0) {
        const rows = courseIds.map(course_id => ({
          student_id: studentId,
          course_id,
          semester,
        }));
        const { error: insError } = await supabase
          .from("student_courses")
          .insert(rows);
        if (insError) throw insError;
      }
    },
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ["student-courses", studentId] });
    },
    // Don't toast here — callers use mutateAsync and handle errors themselves
  });
}

// Get tutors who teach any of the student's enrolled courses
export function useTutorsForStudentCourses(studentId: string, universityId?: string) {
  return useQuery({
    queryKey: ["tutors-for-courses", studentId, universityId],
    queryFn: async () => {
      if (isSupabaseResourceMissing("student_courses")) {
        return [];
      }

      // Get student's course IDs first
      const { data: studentCourseData, error: scError } = await supabase
        .from("student_courses")
        .select("course_id")
        .eq("student_id", studentId);
      if (scError) {
        if (isMissingSupabaseResourceError(scError)) {
          markSupabaseResourceMissing("student_courses");
          return [];
        }
        throw scError;
      }
      if (!studentCourseData?.length) return [];

      const courseIds = studentCourseData.map(sc => sc.course_id);

      // Find tutors who teach any of those courses
      let query = supabase
        .from("tutor_courses")
        .select(`
          tutor:profiles!tutor_courses_tutor_id_fkey (
            *,
            tutor_stats (*),
            tutor_courses (*, course:courses(*))
          )
        `)
        .in("course_id", courseIds);

      const { data, error } = await query;
      if (error) throw error;

      // Deduplicate tutors by ID, filter by university, sort by rating
      const tutorMap = new Map<string, any>();
      data?.forEach(row => {
        if (!row.tutor) return;
        const t = row.tutor as any;
        if (universityId && t.university_id !== universityId) return;
        if (!tutorMap.has(t.id)) tutorMap.set(t.id, t);
      });

      return Array.from(tutorMap.values()).sort(
        (a, b) => (b.tutor_stats?.rating ?? 0) - (a.tutor_stats?.rating ?? 0)
      );
    },
    enabled: !!studentId,
    staleTime: 60 * 1000,
  });
}
