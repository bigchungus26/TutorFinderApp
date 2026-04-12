import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toastError } from "@/components/ui/sonner";
import {
  clearSupabaseResourceMissing,
  isMissingSupabaseResourceError,
  isSupabaseResourceMissing,
  markSupabaseResourceMissing,
} from "@/lib/supabaseResourceFallback";

type Participant = {
  id: string;
  full_name: string;
  avatar_url: string;
};

type LocalMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
  sender?: Participant | null;
};

type LocalConversation = {
  id: string;
  student_id: string;
  tutor_id: string;
  last_message_at: string;
  created_at: string;
  student: Participant | null;
  tutor: Participant | null;
  messages: LocalMessage[];
};

const LOCAL_CONVERSATIONS_KEY = "localConversations";

function readLocalConversations(): LocalConversation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalConversations(conversations: LocalConversation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(conversations));
}

function getLocalConversation(studentId: string, tutorId: string) {
  return readLocalConversations().find(
    (conversation) =>
      conversation.student_id === studentId && conversation.tutor_id === tutorId,
  );
}

function getLocalConversationById(conversationId: string) {
  return readLocalConversations().find((conversation) => conversation.id === conversationId) ?? null;
}

function summarizeConversation(conversation: any, userId: string) {
  const messages = [...(conversation.messages ?? [])].sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const lastMessage = messages[0] ?? null;
  const unreadCount = messages.filter((message: any) => !message.read && message.sender_id !== userId).length;
  return { ...conversation, lastMessage, unreadCount };
}

async function fetchParticipant(id: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { id, full_name: "User", avatar_url: "" };
  }

  return data as Participant;
}

function upsertLocalConversation(conversation: LocalConversation) {
  const conversations = readLocalConversations().filter((entry) => entry.id !== conversation.id);
  conversations.unshift(conversation);
  writeLocalConversations(conversations);
  return conversations;
}

function updateLocalConversation(
  conversationId: string,
  updater: (conversation: LocalConversation) => LocalConversation,
) {
  const next = readLocalConversations().map((conversation) =>
    conversation.id === conversationId ? updater(conversation) : conversation,
  );
  writeLocalConversations(next);
  return next;
}

export function useConversations(userId: string) {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (isSupabaseResourceMissing("conversations")) {
        return readLocalConversations()
          .filter((conversation) => conversation.student_id === userId || conversation.tutor_id === userId)
          .map((conversation) => summarizeConversation(conversation, userId));
      }

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          student:profiles!conversations_student_id_fkey (full_name, avatar_url, id),
          tutor:profiles!conversations_tutor_id_fkey (full_name, avatar_url, id),
          messages (id, body, sender_id, read, created_at)
        `)
        .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
        .order("last_message_at", { ascending: false });

      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("conversations");
          return readLocalConversations()
            .filter((conversation) => conversation.student_id === userId || conversation.tutor_id === userId)
            .map((conversation) => summarizeConversation(conversation, userId));
        }
        throw error;
      }

      clearSupabaseResourceMissing("conversations");
      return (data ?? []).map((conversation: any) => summarizeConversation(conversation, userId));
    },
    enabled: !!userId,
    refetchInterval: !isSupabaseResourceMissing("conversations") ? 3000 : false,
    refetchIntervalInBackground: true,
    staleTime: 10 * 1000,
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (isSupabaseResourceMissing("conversations")) {
        return getLocalConversationById(conversationId);
      }

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          student:profiles!conversations_student_id_fkey (id, full_name, avatar_url),
          tutor:profiles!conversations_tutor_id_fkey (id, full_name, avatar_url)
        `)
        .eq("id", conversationId)
        .single();

      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("conversations");
          return getLocalConversationById(conversationId);
        }
        throw error;
      }

      clearSupabaseResourceMissing("conversations");
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useMessages(conversationId: string, poll = true) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (isSupabaseResourceMissing("messages")) {
        return getLocalConversationById(conversationId)?.messages ?? [];
      }

      const { data, error } = await supabase
        .from("messages")
        .select(`*, sender:profiles!messages_sender_id_fkey (full_name, avatar_url, id)`)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        if (isMissingSupabaseResourceError(error)) {
          markSupabaseResourceMissing("messages");
          return getLocalConversationById(conversationId)?.messages ?? [];
        }
        throw error;
      }

      clearSupabaseResourceMissing("messages");
      return data;
    },
    enabled: !!conversationId,
    refetchInterval: poll && !isSupabaseResourceMissing("messages") ? 3000 : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}

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
      // Try Supabase first — this is the real path
      const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: senderId, body })
        .select(`*, sender:profiles!messages_sender_id_fkey (full_name, avatar_url, id)`)
        .single();

      if (!error && data) {
        clearSupabaseResourceMissing("messages");
        return { message: data, usedLocal: false };
      }

      // Real error (not a missing-table fallback) — surface it
      if (error && !isMissingSupabaseResourceError(error)) {
        throw error;
      }

      // Fallback: messages table doesn't exist — write to localStorage
      markSupabaseResourceMissing("messages");

      const localConversation = getLocalConversationById(conversationId);
      const sender =
        localConversation?.student?.id === senderId
          ? localConversation.student
          : localConversation?.tutor?.id === senderId
            ? localConversation.tutor
            : await fetchParticipant(senderId);

      const localMessage: LocalMessage = {
        id: `local-message-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: senderId,
        body,
        read: false,
        created_at: new Date().toISOString(),
        sender,
      };

      updateLocalConversation(conversationId, (conversation) => ({
        ...conversation,
        last_message_at: localMessage.created_at,
        messages: [...conversation.messages, localMessage],
      }));

      return { message: localMessage, usedLocal: true };
    },
    onSuccess: ({ message, usedLocal }, { conversationId }) => {
      // Append the new message to the messages cache so it shows instantly
      queryClient.setQueryData(["messages", conversationId], (current: any[] | undefined) => {
        const existing = current ?? [];
        if (existing.some((entry) => entry.id === message.id)) return existing;
        return [...existing, message];
      });

      // Only overwrite conversation cache from localStorage when we're in fallback mode
      if (usedLocal) {
        const local = getLocalConversationById(conversationId);
        if (local) queryClient.setQueryData(["conversation", conversationId], local);
      }

      // Invalidate conversations list so sidebar reorders (real refetch, not a replace)
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) => toastError(err),
  });
}

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
        const localConversation = getLocalConversation(studentId, tutorId);
        if (localConversation) return localConversation.id;

        const { data, error } = await supabase
          .from("conversations")
          .select("id")
          .eq("student_id", studentId)
          .eq("tutor_id", tutorId)
          .maybeSingle();

        if (error) {
          if (isMissingSupabaseResourceError(error)) {
            markSupabaseResourceMissing("conversations");
            return null;
          }
          throw error;
        }

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
        clearSupabaseResourceMissing("conversations");
        return created.id;
      }

      if (!createError || isMissingSupabaseResourceError(createError)) {
        if (createError) {
          markSupabaseResourceMissing("conversations");
        }
        const student = await fetchParticipant(studentId);
        const tutor = await fetchParticipant(tutorId);
        const localConversation: LocalConversation = {
          id: `local-conversation-${studentId}-${tutorId}`,
          student_id: studentId,
          tutor_id: tutorId,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          student,
          tutor,
          messages: [],
        };
        upsertLocalConversation(localConversation);
        return localConversation.id;
      }

      const conversationId = await findExistingConversation();
      if (conversationId) return conversationId;

      throw createError;
    },
    onSuccess: (_, { studentId, tutorId }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      const localConversation = getLocalConversation(studentId, tutorId);
      if (localConversation) {
        queryClient.setQueryData(["conversation", localConversation.id], localConversation);
        queryClient.setQueryData(["messages", localConversation.id], localConversation.messages);
      }
    },
  });
}

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
      // Try real Supabase first
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", readerId)
        .eq("read", false);

      if (!error) {
        clearSupabaseResourceMissing("messages");
        return { usedLocal: false };
      }

      if (!isMissingSupabaseResourceError(error)) {
        throw error;
      }

      // Fallback: mark as read in localStorage only
      markSupabaseResourceMissing("messages");
      updateLocalConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.sender_id !== readerId ? { ...message, read: true } : message,
        ),
      }));
      return { usedLocal: true };
    },
    onSuccess: ({ usedLocal }, { conversationId }) => {
      if (usedLocal) {
        const local = getLocalConversationById(conversationId);
        if (local) {
          queryClient.setQueryData(["conversation", conversationId], local);
          queryClient.setQueryData(["messages", conversationId], local.messages);
        }
      } else {
        // Real path: just invalidate so the next poll picks up the read state
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) => toastError(err),
  });
}
