// ── Messaging Hooks (C8) ──────────────────────────────────────
// Polling-based messaging: polls every 3s when thread is open,
// pauses when tab is hidden.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toastError } from "@/components/ui/sonner";

// ── Conversations list ────────────────────────────────────────
export function useConversations(userId: string) {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          student:profiles!conversations_student_id_fkey (full_name, avatar_url),
          tutor:profiles!conversations_tutor_id_fkey (full_name, avatar_url),
          messages (id, body, sender_id, read, created_at)
        `)
        .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;

      // Attach last message info
      return (data ?? []).map((conv: any) => {
        const msgs = (conv.messages ?? []).sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastMessage = msgs[0] ?? null;
        const unreadCount = msgs.filter((m: any) => !m.read && m.sender_id !== userId).length;
        const { messages: _, ...rest } = conv;
        return { ...rest, lastMessage, unreadCount };
      });
    },
    enabled: !!userId,
    staleTime: 10 * 1000,
  });
}

// ── Single conversation ───────────────────────────────────────
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          student:profiles!conversations_student_id_fkey (id, full_name, avatar_url),
          tutor:profiles!conversations_tutor_id_fkey (id, full_name, avatar_url)
        `)
        .eq("id", conversationId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });
}

// ── Messages in a conversation (polled) ──────────────────────
export function useMessages(conversationId: string, poll = true) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`*, sender:profiles!messages_sender_id_fkey (full_name, avatar_url)`)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
    refetchInterval: poll ? 3000 : false,
    refetchIntervalInBackground: false, // pause when tab hidden
    staleTime: 0,
  });
}

// ── Send a message ────────────────────────────────────────────
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      senderId,
      body,
    }: {
      conversationId: string;
      senderId: string;
      body: string;
    }) => {
      const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: senderId, body })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { conversationId, senderId }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) => toastError(err),
  });
}

// ── Get or create a conversation ─────────────────────────────
export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      tutorId,
    }: {
      studentId: string;
      tutorId: string;
    }) => {
      if (!studentId || !tutorId) {
        throw new Error("Missing conversation details.");
      }

      const findExistingConversation = async () => {
        const { data, error } = await supabase
          .from("conversations")
          .select("id")
          .eq("student_id", studentId)
          .eq("tutor_id", tutorId)
          .maybeSingle();

        if (error) throw error;
        return data?.id ?? null;
      };

      const existingConversationId = await findExistingConversation();
      if (existingConversationId) return existingConversationId;

      const { data: created, error: createError } = await supabase
        .from("conversations")
        .insert({ student_id: studentId, tutor_id: tutorId })
        .select("id")
        .single();

      if (!createError && created?.id) {
        return created.id;
      }

      const conversationId = await findExistingConversation();
      if (conversationId) {
        return conversationId;
      }

      // If another tap/device created it first, fetch the existing row instead of failing.
      if ((createError as any)?.code === "23505" || (createError as any)?.details?.includes("already exists")) {
        const conversationId = await findExistingConversation();
        if (conversationId) return conversationId;
      }

      if (createError) throw createError;
      throw new Error("Unable to open this conversation right now.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ── Mark messages as read ────────────────────────────────────
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      readerId,
    }: {
      conversationId: string;
      readerId: string;
    }) => {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", readerId)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
