import { useNavigate } from "react-router-dom";
import { toast, toastError } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useGetOrCreateConversation } from "@/hooks/useMessages";

type OpenConversationParams = {
  studentId: string;
  tutorId: string;
};

export function useOpenConversation() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const getOrCreateConversation = useGetOrCreateConversation();

  const openConversation = async ({ studentId, tutorId }: OpenConversationParams) => {
    if (!user) {
      navigate("/login");
      return null;
    }

    if (studentId === tutorId) {
      toast("You cannot message your own tutor profile.");
      return null;
    }

    if (profile?.role === "tutor" && user.id !== tutorId) {
      toast("Tutors can start conversations from student requests and messages.");
      return null;
    }

    try {
      const conversationId = await getOrCreateConversation.mutateAsync({ studentId, tutorId });
      navigate(`/messages/${conversationId}`);
      return conversationId;
    } catch (err) {
      toastError(err, "We couldn't open this conversation right now.");
      return null;
    }
  };

  return {
    openConversation,
    isPending: getOrCreateConversation.isPending,
  };
}
