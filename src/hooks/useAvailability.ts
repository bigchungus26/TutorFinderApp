// ── Availability Hooks (C2) ───────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast, toastError } from "@/components/ui/sonner";

export interface AvailabilitySlot {
  id?: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export function useAvailability(tutorId: string) {
  return useQuery({
    queryKey: ["availability", tutorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("tutor_id", tutorId)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data as AvailabilitySlot[];
    },
    enabled: !!tutorId,
    staleTime: 60 * 1000,
  });
}

export function useUpsertAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tutorId,
      slots,
    }: {
      tutorId: string;
      slots: Omit<AvailabilitySlot, "id">[];
    }) => {
      // Delete all existing slots and re-insert
      const { error: delError } = await supabase
        .from("availability")
        .delete()
        .eq("tutor_id", tutorId);
      if (delError) throw delError;

      if (slots.length > 0) {
        const { error: insError } = await supabase
          .from("availability")
          .insert(slots.map(s => ({ ...s, tutor_id: tutorId })));
        if (insError) throw insError;
      }
    },
    onSuccess: (_, { tutorId }) => {
      queryClient.invalidateQueries({ queryKey: ["availability", tutorId] });
      toast.success("Availability saved");
    },
    onError: (err) => toastError(err),
  });
}

// Toggle a single slot (for the weekly grid editor)
export function useToggleAvailabilitySlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tutorId,
      slot,
      existingId,
    }: {
      tutorId: string;
      slot: Omit<AvailabilitySlot, "id">;
      existingId?: string;
    }) => {
      if (existingId) {
        // Delete (toggle off)
        const { error } = await supabase
          .from("availability")
          .delete()
          .eq("id", existingId);
        if (error) throw error;
      } else {
        // Insert (toggle on)
        const { error } = await supabase
          .from("availability")
          .insert({ ...slot, tutor_id: tutorId });
        if (error) throw error;
      }
    },
    onSuccess: (_, { tutorId }) => {
      queryClient.invalidateQueries({ queryKey: ["availability", tutorId] });
    },
    onError: (err) => toastError(err),
  });
}
