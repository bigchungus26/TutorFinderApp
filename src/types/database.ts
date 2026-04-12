// ============================================================
// Tutr — Supabase Database Types
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
          gpa: number | null;
          bio: string;
          teaching_styles: string[];
          languages: string[];
          availability_preferences: string[];
          hourly_rate: number | null;
          max_students_per_session: number | null;
          verified: boolean;
          online: boolean;
          in_person: boolean;
          previous_tutoring_experience: boolean;
          years_of_experience: number | null;
          proof_asset_url: string;
          proof_asset_name: string;
          subscription_plan: string;
          subscription_status: string;
          agreed_terms_at: string | null;
          tutor_status: "student" | "alumni" | null;
          tutor_type: "student" | "non_student" | null;
          verification_status: "pending" | "approved" | "rejected" | null;
          verification_submitted_at: string | null;
          verification_reviewed_at: string | null;
          verification_notes: string;
          non_student_credentials: string;
          cancellation_hours: number;
          paused_until: string | null;
          suspended_until: string | null;
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
          gpa?: number | null;
          bio?: string;
          teaching_styles?: string[];
          languages?: string[];
          availability_preferences?: string[];
          hourly_rate?: number | null;
          max_students_per_session?: number | null;
          verified?: boolean;
          online?: boolean;
          in_person?: boolean;
          previous_tutoring_experience?: boolean;
          years_of_experience?: number | null;
          proof_asset_url?: string;
          proof_asset_name?: string;
          subscription_plan?: string;
          subscription_status?: string;
          tutor_status?: "student" | "alumni" | null;
          tutor_type?: "student" | "non_student" | null;
          verification_status?: "pending" | "approved" | "rejected" | null;
          verification_submitted_at?: string | null;
          verification_reviewed_at?: string | null;
          verification_notes?: string;
          non_student_credentials?: string;
          cancellation_hours?: number;
          paused_until?: string | null;
          suspended_until?: string | null;
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
          gpa?: number | null;
          bio?: string;
          teaching_styles?: string[];
          languages?: string[];
          availability_preferences?: string[];
          hourly_rate?: number | null;
          max_students_per_session?: number | null;
          verified?: boolean;
          online?: boolean;
          in_person?: boolean;
          previous_tutoring_experience?: boolean;
          years_of_experience?: number | null;
          proof_asset_url?: string;
          proof_asset_name?: string;
          subscription_plan?: string;
          subscription_status?: string;
          tutor_status?: "student" | "alumni" | null;
          tutor_type?: "student" | "non_student" | null;
          verification_status?: "pending" | "approved" | "rejected" | null;
          verification_submitted_at?: string | null;
          verification_reviewed_at?: string | null;
          verification_notes?: string;
          non_student_credentials?: string;
          cancellation_hours?: number;
          paused_until?: string | null;
          suspended_until?: string | null;
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
          cancelled_by: string | null;
          cancelled_at: string | null;
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
          cancelled_by?: string | null;
          cancelled_at?: string | null;
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
          cancelled_by?: string | null;
          cancelled_at?: string | null;
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

      profile_views: {
        Row: {
          id: string;
          tutor_id: string;
          viewer_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          viewer_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          viewer_id?: string | null;
          viewed_at?: string;
        };
      };

      tutor_subscriptions: {
        Row: {
          id: string;
          tutor_id: string;
          status: "active" | "grace_period" | "inactive";
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          status?: "active" | "grace_period" | "inactive";
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          status?: "active" | "grace_period" | "inactive";
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      tutor_boosts: {
        Row: {
          id: string;
          tutor_id: string;
          active: boolean;
          started_at: string | null;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          active?: boolean;
          started_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          active?: boolean;
          started_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
        };
      };

      verification_documents: {
        Row: {
          id: string;
          tutor_id: string;
          doc_type:
            | "student_id"
            | "transcript"
            | "enrollment_proof"
            | "diploma"
            | "employer_letter"
            | "license"
            | "other";
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          tutor_id: string;
          doc_type?:
            | "student_id"
            | "transcript"
            | "enrollment_proof"
            | "diploma"
            | "employer_letter"
            | "license"
            | "other";
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          tutor_id?: string;
          doc_type?:
            | "student_id"
            | "transcript"
            | "enrollment_proof"
            | "diploma"
            | "employer_letter"
            | "license"
            | "other";
          storage_path?: string;
          file_name?: string;
          mime_type?: string;
          size_bytes?: number;
          uploaded_at?: string;
        };
      };
    };

    Enums: {
      session_location: "online" | "in-person";
      session_status: "upcoming" | "completed" | "cancelled";
      request_status: "pending" | "accepted" | "declined";
      notification_type:
        | "request_received"
        | "request_accepted"
        | "request_declined"
        | "session_reminder"
        | "new_review"
        | "saved_by_student"
        | "new_message"
        | "session_cancelled"
        | "review_prompt"
        | "subscription_inactive"
        | "no_show_reported"
        | "semester_ended"
        | "account_suspended"
        | "verification_approved"
        | "verification_rejected"
        | "verification_resubmission_requested"
        | "verification_submitted";
      subscription_tier_status: "active" | "grace_period" | "inactive";
      tutor_type: "student" | "non_student";
      verification_status: "pending" | "approved" | "rejected";
      verification_doc_type:
        | "student_id"
        | "transcript"
        | "enrollment_proof"
        | "diploma"
        | "employer_letter"
        | "license"
        | "other";
    };
  };
};

// ============================================================
// Convenience type aliases
// ============================================================
export type University         = Database["public"]["Tables"]["universities"]["Row"];
export type Course             = Database["public"]["Tables"]["courses"]["Row"];
export type Profile            = Database["public"]["Tables"]["profiles"]["Row"];
export type TutorCourse        = Database["public"]["Tables"]["tutor_courses"]["Row"];
export type Session            = Database["public"]["Tables"]["sessions"]["Row"];
export type Request            = Database["public"]["Tables"]["requests"]["Row"];
export type Review             = Database["public"]["Tables"]["reviews"]["Row"];
export type TutorStats         = Database["public"]["Tables"]["tutor_stats"]["Row"];
export type ProfileView        = Database["public"]["Tables"]["profile_views"]["Row"];
export type TutorSubscription  = Database["public"]["Tables"]["tutor_subscriptions"]["Row"];
export type TutorBoost         = Database["public"]["Tables"]["tutor_boosts"]["Row"];
export type VerificationDocument = Database["public"]["Tables"]["verification_documents"]["Row"];
export type TutorType            = Database["public"]["Enums"]["tutor_type"];
export type VerificationStatus   = Database["public"]["Enums"]["verification_status"];
export type VerificationDocType  = Database["public"]["Enums"]["verification_doc_type"];

// Tutor profile with joined stats and courses
export type TutorWithDetails = Profile & {
  tutor_stats: TutorStats | null;
  tutor_courses: (TutorCourse & { course: Course })[];
  tutor_boosts?: TutorBoost | null;
  tutor_subscriptions?: TutorSubscription | null;
};
