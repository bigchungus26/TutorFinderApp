// ── Student Courses Hooks (C6) ────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  isMissingSupabaseResourceError,
  isSupabaseResourceMissing,
  markSupabaseResourceMissing,
  clearSupabaseResourceMissing,
} from "@/lib/supabaseResourceFallback";

type LocalStudentCourse = {
  course_id: string;
  semester: string;
  created_at: string;
};

function getStudentCoursesStorageKey(studentId: string) {
  return `studentCourses:${studentId}`;
}

function readLocalStudentCourses(studentId: string): LocalStudentCourse[] {
  if (typeof window === "undefined" || !studentId) return [];

  try {
    const raw = window.localStorage.getItem(getStudentCoursesStorageKey(studentId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalStudentCourses(studentId: string, entries: LocalStudentCourse[]) {
  if (typeof window === "undefined" || !studentId) return;
  window.localStorage.setItem(getStudentCoursesStorageKey(studentId), JSON.stringify(entries));
}

export function useStudentCourses(studentId: string) {
  return useQuery({
    queryKey: ["student-courses", studentId],
    queryFn: async () => {
      if (isSupabaseResourceMissing("student_courses")) {
        return readLocalStudentCourses(studentId);
      }

      const { data, error } = await supabase
        .from("student_courses")
        .select(`*, course:courses(*)`)
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("student_courses");
          return readLocalStudentCourses(studentId);
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
      const localEntries = courseIds.map((course_id) => ({
        course_id,
        semester,
        created_at: new Date().toISOString(),
      }));

      if (isSupabaseResourceMissing("student_courses")) {
        writeLocalStudentCourses(studentId, localEntries);
        return;
      }

      // Snapshot existing rows so we can roll back on insert failure
      const { data: existing, error: existingError } = await supabase
        .from("student_courses")
        .select("course_id, semester")
        .eq("student_id", studentId);

      if (existingError) {
        if (isMissingSupabaseResourceError(existingError)) {
          markSupabaseResourceMissing("student_courses");
          writeLocalStudentCourses(studentId, localEntries);
          return;
        }
        throw existingError;
      }

      const { error: delError } = await supabase
        .from("student_courses")
        .delete()
        .eq("student_id", studentId);
      if (delError) {
        if (isMissingSupabaseResourceError(delError)) {
          markSupabaseResourceMissing("student_courses");
          writeLocalStudentCourses(studentId, localEntries);
          return;
        }
        throw delError;
      }

      if (courseIds.length > 0) {
        const rows = courseIds.map(course_id => ({
          student_id: studentId,
          course_id,
          semester,
        }));
        const { error: insError } = await supabase
          .from("student_courses")
          .insert(rows);
        if (insError) {
          if (isMissingSupabaseResourceError(insError)) {
            markSupabaseResourceMissing("student_courses");
            writeLocalStudentCourses(studentId, localEntries);
            return;
          }
          // Roll back: restore previous courses so the student doesn't lose data
          if (existing?.length) {
            await supabase.from("student_courses").insert(
              existing.map(r => ({ student_id: studentId, course_id: r.course_id, semester: r.semester }))
            );
          }
          throw insError;
        }
      }
    },
    onSuccess: (_, { studentId }) => {
      // If the mutation succeeded, the table clearly exists — clear any stale missing flag
      // so the subsequent invalidated re-fetch actually hits the DB instead of short-circuiting.
      clearSupabaseResourceMissing("student_courses");
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
        const localCourseIds = readLocalStudentCourses(studentId).map((course) => course.course_id);
        if (!localCourseIds.length) return [];

        const { data, error } = await supabase
          .from("tutor_courses")
          .select(`
            tutor:profiles!tutor_courses_tutor_id_fkey (
              *,
              tutor_stats (*),
              tutor_courses (*, course:courses(*))
            )
          `)
          .in("course_id", localCourseIds);

        if (error) throw error;

        const tutorMap = new Map<string, any>();
        data?.forEach((row) => {
          if (!row.tutor) return;
          const tutor = row.tutor as any;
          if (universityId && tutor.university_id !== universityId) return;
          if (!tutorMap.has(tutor.id)) tutorMap.set(tutor.id, tutor);
        });

        return Array.from(tutorMap.values()).sort(
          (a, b) => (b.tutor_stats?.rating ?? 0) - (a.tutor_stats?.rating ?? 0),
        );
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
