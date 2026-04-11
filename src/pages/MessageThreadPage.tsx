import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useConversation,
  useMessages,
  useSendMessage,
  useMarkMessagesRead,
} from "@/hooks/useMessages";
import { variants } from "@/lib/motion";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

const MessageThreadPage = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: conversation } = useConversation(conversationId ?? "");
  const { data: messages = [], isLoading } = useMessages(conversationId ?? "", true);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();

  const [body, setBody] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Determine the other person in the conversation
  const currentUserId = user?.id ?? "";
  const isStudent = conversation?.student_id === currentUserId;
  const other = isStudent ? conversation?.tutor : conversation?.student;
  const otherName: string = (other as any)?.full_name ?? "User";
  const otherAvatar: string = (other as any)?.avatar_url || "https://i.pravatar.cc/100";

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read on mount and on new incoming messages
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    markRead.mutate({ conversationId, readerId: currentUserId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentUserId, messages.length]);

  // Auto-grow textarea up to 4 lines
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    const lineHeight = 24; // px
    const maxHeight = lineHeight * 4;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  const handleSend = () => {
    const trimmed = body.trim();
    if (!trimmed || !conversationId || !currentUserId) return;
    const messageBody = trimmed;
    setBody("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendMessage.mutate({ conversationId, senderId: currentUserId, body: messageBody });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-border bg-background flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft size={21} className="text-foreground" />
        </motion.button>
        <img
          src={otherAvatar}
          alt={otherName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <span className="text-body font-medium text-foreground truncate">{otherName}</span>
      </div>

      {/* Messages list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-body-sm text-ink-muted">No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg: any) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <motion.div
              key={msg.id}
              variants={variants.fadeSlideUp}
              initial="hidden"
              animate="visible"
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-xl text-body-sm leading-relaxed ${
                  isOwn
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface border border-border text-foreground"
                }`}
              >
                {msg.body}
              </div>
              <span className="text-caption text-ink-muted mt-1 px-1">
                {relativeTime(msg.created_at)}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Compose bar */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-background flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-body-sm text-foreground placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 leading-6"
          style={{ maxHeight: "96px" }}
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSend}
          disabled={!body.trim()}
          aria-label="Send message"
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          <SendHorizonal size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default MessageThreadPage;
