// ============================================================
// Tutr — Supabase Data Access Hooks
// These hooks wrap Supabase queries with React Query for
// caching, loading states, and error handling.
//
// Usage: Replace mock data imports with these hooks when
// Supabase is connected. Each hook returns { data, isLoading, error }.
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import { toast, toastError } from "@/components/ui/sonner";

// ============================================================
// UNIVERSITIES
// ============================================================
export function useUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("short_name");
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour — rarely changes
  });
}

// ============================================================
// COURSES
// ============================================================
export function useCourses(universityId?: string) {
  return useQuery({
    queryKey: ["courses", universityId],
    queryFn: async () => {
      let query = supabase.from("courses").select("*").order("code");
      if (universityId) query = query.eq("university_id", universityId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

export function useSubjects(universityId: string) {
  return useQuery({
    queryKey: ["subjects", universityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("subject")
        .eq("university_id", universityId);
      if (error) throw error;
      return [...new Set(data.map((c) => c.subject))];
    },
    enabled: !!universityId,
  });
}

// ============================================================
// PROFILES / TUTORS
// ============================================================
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useTutors(universityId?: string) {
  return useQuery({
    queryKey: ["tutors", universityId],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          *,
          tutor_stats (*),
          tutor_courses (*, course:courses(*))
        `)
        .eq("role", "tutor");
      if (universityId) query = query.eq("university_id", universityId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useTutor(tutorId: string) {
  return useQuery({
    queryKey: ["tutor", tutorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          tutor_stats (*),
          tutor_courses (*, course:courses(*))
        `)
        .eq("id", tutorId)
        .eq("role", "tutor")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tutorId,
  });
}

export function useTutorsByCourse(courseId: string) {
  return useQuery({
    queryKey: ["tutors-by-course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutor_courses")
        .select(`
          *,
          tutor:profiles (
            *,
            tutor_stats (*)
          )
        `)
        .eq("course_id", courseId);
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

// ============================================================
// REVIEWS
// ============================================================
export function useReviews(tutorId: string) {
  return useQuery({
    queryKey: ["reviews", tutorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          student:profiles!reviews_student_id_fkey (full_name, avatar_url),
          course:courses (code, name)
        `)
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tutorId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: {
      tutor_id: string;
      student_id: string;
      course_id: string;
      session_id?: string;
      rating: number;
      comment: string;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert(review)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.tutor_id] });
      queryClient.invalidateQueries({ queryKey: ["tutor", variables.tutor_id] });
      toast.success("Review submitted!");
    },
    onError: (err) => toastError(err),
  });
}

// ============================================================
// SESSIONS
// ============================================================
export function useSessions(userId: string, role: "student" | "tutor") {
  return useQuery({
    queryKey: ["sessions", userId, role],
    queryFn: async () => {
      const column = role === "student" ? "student_id" : "tutor_id";
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          tutor:profiles!sessions_tutor_id_fkey (full_name, avatar_url),
          student:profiles!sessions_student_id_fkey (full_name, avatar_url),
          course:courses (code, name)
        `)
        .eq(column, userId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: {
      tutor_id: string;
      student_id: string;
      course_id: string;
      date: string;
      time: string;
      duration: number;
      location: "online" | "in-person";
      price: number;
    }) => {
      const { data, error } = await supabase
        .from("sessions")
        .insert(session)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session booked!");
    },
    onError: (err) => toastError(err),
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "upcoming" | "completed" | "cancelled";
    }) => {
      const { data, error } = await supabase
        .from("sessions")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// ============================================================
// REQUESTS
// ============================================================
export function useRequests(userId: string, role: "student" | "tutor") {
  return useQuery({
    queryKey: ["requests", userId, role],
    queryFn: async () => {
      const column = role === "student" ? "student_id" : "tutor_id";
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          student:profiles!requests_student_id_fkey (full_name, avatar_url),
          tutor:profiles!requests_tutor_id_fkey (full_name, avatar_url),
          course:courses (code, name)
        `)
        .eq(column, userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: {
      student_id: string;
      tutor_id: string;
      course_id: string;
      date: string;
      time: string;
      duration: number;
      location: "online" | "in-person";
      message: string;
    }) => {
      const { data, error } = await supabase
        .from("requests")
        .insert(request)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "accepted" | "declined";
    }) => {
      const { data, error } = await supabase
        .from("requests")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

// ============================================================
// PROFILE UPDATE (for onboarding & settings)
// ============================================================
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id, ...updates }, { onConflict: "id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", data.id] });
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
  });
}

// ============================================================
// TUTOR COURSES (manage during onboarding & settings)
// ============================================================
export function useSetTutorCourses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tutorId,
      courses,
    }: {
      tutorId: string;
      courses: { course_id: string; grade: string }[];
    }) => {
      // Delete existing and re-insert (simpler than diffing)
      const { error: delError } = await supabase
        .from("tutor_courses")
        .delete()
        .eq("tutor_id", tutorId);
      if (delError) throw delError;

      if (courses.length > 0) {
        const rows = courses.map((c) => ({
          tutor_id: tutorId,
          course_id: c.course_id,
          grade: c.grade,
        }));
        const { error: insError } = await supabase
          .from("tutor_courses")
          .insert(rows);
        if (insError) throw insError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
  });
}
