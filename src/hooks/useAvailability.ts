// ── Availability Hooks (C2) ───────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast, toastError } from "@/components/ui/sonner";
import {
  isMissingSupabaseResourceError,
  isSupabaseResourceMissing,
  markSupabaseResourceMissing,
} from "@/lib/supabaseResourceFallback";

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
      if (isSupabaseResourceMissing("availability")) {
        return [];
      }

      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("tutor_id", tutorId)
        .order("day_of_week")
        .order("start_time");
      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("availability");
          return [];
        }
        throw error;
      }
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
      if (isSupabaseResourceMissing("availability")) {
        return;
      }

      // Snapshot existing slots so we can roll back on insert failure
      const { data: existing, error: existingError } = await supabase
        .from("availability")
        .select("day_of_week, start_time, end_time")
        .eq("tutor_id", tutorId);

      if (existingError) {
        if (isMissingSupabaseResourceError(existingError)) {
          markSupabaseResourceMissing("availability");
          return;
        }
        throw existingError;
      }

      const { error: delError } = await supabase
        .from("availability")
        .delete()
        .eq("tutor_id", tutorId);
      if (delError) {
        if (isMissingSupabaseResourceError(delError)) {
          markSupabaseResourceMissing("availability");
          return;
        }
        throw delError;
      }

      if (slots.length > 0) {
        const { error: insError } = await supabase
          .from("availability")
          .insert(slots.map(s => ({ ...s, tutor_id: tutorId })));
        if (insError) {
          if (isMissingSupabaseResourceError(insError)) {
            markSupabaseResourceMissing("availability");
            return;
          }
          // Roll back: restore previous slots so the tutor doesn't become unbookable
          if (existing?.length) {
            await supabase.from("availability").insert(
              existing.map(s => ({ ...s, tutor_id: tutorId }))
            );
          }
          throw insError;
        }
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
      if (isSupabaseResourceMissing("availability")) {
        return;
      }

      if (existingId) {
        // Delete (toggle off)
        const { error } = await supabase
          .from("availability")
          .delete()
          .eq("id", existingId);
        if (error) {
          if (isMissingSupabaseResourceError(error)) {
            markSupabaseResourceMissing("availability");
            return;
          }
          throw error;
        }
      } else {
        // Insert (toggle on)
        const { error } = await supabase
          .from("availability")
          .insert({ ...slot, tutor_id: tutorId });
        if (error) {
          if (isMissingSupabaseResourceError(error)) {
            markSupabaseResourceMissing("availability");
            return;
          }
          throw error;
        }
      }
    },
    onSuccess: (_, { tutorId }) => {
      queryClient.invalidateQueries({ queryKey: ["availability", tutorId] });
    },
    onError: (err) => toastError(err),
  });
}
