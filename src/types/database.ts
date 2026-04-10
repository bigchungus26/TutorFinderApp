// ============================================================
// Teachme — Supabase Database Types
// These types mirror the SQL schema in supabase/migrations/.
// After connecting to Supabase, regenerate with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
// ============================================================

export type Database = {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          short_name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          color?: string;
          created_at?: string;
        };
      };

      courses: {
        Row: {
          id: string;
          code: string;
          name: string;
          university_id: string;
          subject: string;
          description: string;
          credits: number;
          prerequisites: string[];
          typical_semester: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          university_id: string;
          subject: string;
          description?: string;
          credits?: number;
          prerequisites?: string[];
          typical_semester?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          university_id?: string;
          subject?: string;
          description?: string;
          credits?: number;
          prerequisites?: string[];
          typical_semester?: string;
          created_at?: string;
        };
      };

      profiles: {
        Row: {
          id: string;
          role: "student" | "tutor";
          full_name: string;
          avatar_url: string;
          university_id: string | null;
          major: string;
          year: string;
          bio: string;
          hourly_rate: number | null;
          verified: boolean;
          online: boolean;
          in_person: boolean;
          agreed_terms_at: string | null;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "student" | "tutor";
          full_name?: string;
          avatar_url?: string;
          university_id?: string | null;
          major?: string;
          year?: string;
          bio?: string;
          hourly_rate?: number | null;
          verified?: boolean;
          online?: boolean;
          in_person?: boolean;
          agreed_terms_at?: string | null;
          onboarded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "student" | "tutor";
          full_name?: string;
          avatar_url?: string;
          university_id?: string | null;
          major?: string;
          year?: string;
          bio?: string;
          hourly_rate?: number | null;
          verified?: boolean;
          online?: boolean;
          in_person?: boolean;
          agreed_terms_at?: string | null;
          onboarded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      tutor_courses: {
        Row: {
          id: string;
          tutor_id: string;
          course_id: string;
          grade: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          course_id: string;
          grade?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          course_id?: string;
          grade?: string;
          created_at?: string;
        };
      };

      sessions: {
        Row: {
          id: string;
          tutor_id: string;
          student_id: string;
          course_id: string;
          date: string;
          time: string;
          duration: number;
          location: "online" | "in-person";
          status: "upcoming" | "completed" | "cancelled";
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          student_id: string;
          course_id: string;
          date: string;
          time: string;
          duration?: number;
          location?: "online" | "in-person";
          status?: "upcoming" | "completed" | "cancelled";
          price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          student_id?: string;
          course_id?: string;
          date?: string;
          time?: string;
          duration?: number;
          location?: "online" | "in-person";
          status?: "upcoming" | "completed" | "cancelled";
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      requests: {
        Row: {
          id: string;
          student_id: string;
          tutor_id: string;
          course_id: string;
          date: string;
          time: string;
          duration: number;
          location: "online" | "in-person";
          message: string;
          status: "pending" | "accepted" | "declined";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          tutor_id: string;
          course_id: string;
          date: string;
          time: string;
          duration?: number;
          location?: "online" | "in-person";
          message?: string;
          status?: "pending" | "accepted" | "declined";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          tutor_id?: string;
          course_id?: string;
          date?: string;
          time?: string;
          duration?: number;
          location?: "online" | "in-person";
          message?: string;
          status?: "pending" | "accepted" | "declined";
          created_at?: string;
          updated_at?: string;
        };
      };

      reviews: {
        Row: {
          id: string;
          session_id: string | null;
          tutor_id: string;
          student_id: string;
          course_id: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          tutor_id: string;
          student_id: string;
          course_id: string;
          rating: number;
          comment?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          tutor_id?: string;
          student_id?: string;
          course_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
      };

      tutor_stats: {
        Row: {
          tutor_id: string;
          rating: number;
          review_count: number;
          sessions_completed: number;
          response_time: string;
          updated_at: string;
        };
        Insert: {
          tutor_id: string;
          rating?: number;
          review_count?: number;
          sessions_completed?: number;
          response_time?: string;
          updated_at?: string;
        };
        Update: {
          tutor_id?: string;
          rating?: number;
          review_count?: number;
          sessions_completed?: number;
          response_time?: string;
          updated_at?: string;
        };
      };
    };

    Enums: {
      session_location: "online" | "in-person";
      session_status: "upcoming" | "completed" | "cancelled";
      request_status: "pending" | "accepted" | "declined";
    };
  };
};

// ============================================================
// Convenience type aliases
// ============================================================
export type University   = Database["public"]["Tables"]["universities"]["Row"];
export type Course       = Database["public"]["Tables"]["courses"]["Row"];
export type Profile      = Database["public"]["Tables"]["profiles"]["Row"];
export type TutorCourse  = Database["public"]["Tables"]["tutor_courses"]["Row"];
export type Session      = Database["public"]["Tables"]["sessions"]["Row"];
export type Request      = Database["public"]["Tables"]["requests"]["Row"];
export type Review       = Database["public"]["Tables"]["reviews"]["Row"];
export type TutorStats   = Database["public"]["Tables"]["tutor_stats"]["Row"];

// Tutor profile with joined stats and courses
export type TutorWithDetails = Profile & {
  tutor_stats: TutorStats | null;
  tutor_courses: (TutorCourse & { course: Course })[];
};
