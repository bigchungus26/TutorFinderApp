// ── Notifications Hooks (C4) ──────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toastError } from "@/components/ui/sonner";
import {
  isMissingSupabaseResourceError,
  isSupabaseResourceMissing,
  markSupabaseResourceMissing,
} from "@/lib/supabaseResourceFallback";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (isSupabaseResourceMissing("notifications")) {
        return [];
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("notifications");
          return [];
        }
        throw error;
      }
      return data as Notification[];
    },
    enabled: !!userId,
    staleTime: 10 * 1000,
  });
}

export function useUnreadNotificationCount(userId: string) {
  const { data: notifications } = useNotifications(userId);
  return notifications?.filter(n => !n.read).length ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      if (isSupabaseResourceMissing("notifications")) {
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("notifications");
          return;
        }
        throw error;
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (isSupabaseResourceMissing("notifications")) {
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);
      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("notifications");
          return;
        }
        throw error;
      }
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
    onError: (err) => toastError(err),
  });
}

// Realtime subscription for live notification updates
export function useNotificationsRealtime(userId: string) {
  const queryClient = useQueryClient();

  // Note: this is a side-effect hook called from components with useEffect
  const subscribe = () => {
    if (!userId || isSupabaseResourceMissing("notifications")) return () => {};

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          markSupabaseResourceMissing("notifications");
          supabase.removeChannel(channel);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return { subscribe };
}
