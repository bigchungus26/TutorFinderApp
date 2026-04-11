import { useNavigate } from "react-router-dom";
import { toastError } from "@/components/ui/sonner";
import { useGetOrCreateConversation } from "@/hooks/useMessages";

type OpenConversationParams = {
  studentId: string;
  tutorId: string;
};

export function useOpenConversation() {
  const navigate = useNavigate();
  const getOrCreateConversation = useGetOrCreateConversation();

  const openConversation = async ({ studentId, tutorId }: OpenConversationParams) => {
    try {
      const conversationId = await getOrCreateConversation.mutateAsync({ studentId, tutorId });
      navigate(`/messages/${conversationId}`);
      return conversationId;
    } catch (err) {
      toastError(err);
      return null;
    }
  };

  return {
    openConversation,
    isPending: getOrCreateConversation.isPending,
  };
}
