// ── Reports Hook (C9) ─────────────────────────────────────────
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast, toastError } from "@/components/ui/sonner";

export type ReportReason = "inappropriate" | "no_show" | "misrepresented_grades" | "other";

export function useCreateReport() {
  return useMutation({
    mutationFn: async ({
      reporterId,
      reportedTutorId,
      reason,
      details,
    }: {
      reporterId: string;
      reportedTutorId: string;
      reason: ReportReason;
      details: string;
    }) => {
      const { error } = await supabase.from("reports").insert({
        reporter_id: reporterId,
        reported_tutor_id: reportedTutorId,
        reason,
        details,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report submitted. We'll review it shortly.", { duration: 5000 });
    },
    onError: (err) => toastError(err),
  });
}
