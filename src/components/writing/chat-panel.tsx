import { useState, useCallback, useRef, useEffect } from "react";
import { callAskFollowUp, isRateLimitError, getRateLimitMessage } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  Loader2,
  X,
  User,
  Bot,
  Sparkles,
} from "lucide-react";
import type { WritingFeedback, Improvement, ChatMessage } from "@/types";

interface ChatPanelProps {
  writingContext: {
    prompt: string;
    userAnswer: string;
    feedback: WritingFeedback;
  };
  onClose?: () => void;
  lang?: "ja" | "en";
}

export function ChatPanel({ writingContext, onClose, lang = "ja" }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingContext, setPendingContext] = useState<{
    index: number;
    improvement: Improvement;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || sending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
      context: pendingContext
        ? {
            type: "improvement",
            improvementIndex: pendingContext.index,
            original: pendingContext.improvement.original,
            suggested: pendingContext.improvement.suggested,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPendingContext(null);
    setSending(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await callAskFollowUp({
        writingContext: {
          prompt: writingContext.prompt,
          userAnswer: writingContext.userAnswer,
          modelAnswer: writingContext.feedback.modelAnswer,
          improvements: writingContext.feedback.improvements,
        },
        question: trimmedInput,
        conversationHistory,
        improvementContext: pendingContext
          ? {
              index: pendingContext.index,
              original: pendingContext.improvement.original,
              suggested: pendingContext.improvement.suggested,
              explanation: pendingContext.improvement.explanation,
            }
          : undefined,
        lang,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      if (isRateLimitError(err)) {
        toast.error(getRateLimitMessage(err), { duration: 8000 });
      } else {
        toast.error("回答の取得に失敗しました");
      }
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, writingContext, pendingContext, lang]);

  // Set context for asking about a specific improvement
  const askAboutImprovement = useCallback(
    (index: number, improvement: Improvement) => {
      setPendingContext({ index, improvement });
      setInput(`「${improvement.original}」→「${improvement.suggested}」について、`);
      textareaRef.current?.focus();
    },
    []
  );

  // Expose the askAboutImprovement method via a custom attribute
  // This allows the parent component to trigger it
  useEffect(() => {
    const panel = document.getElementById("chat-panel");
    if (panel) {
      (panel as HTMLElement & { askAboutImprovement?: typeof askAboutImprovement }).askAboutImprovement =
        askAboutImprovement;
    }
  }, [askAboutImprovement]);

  return (
    <div id="chat-panel" className="flex h-full flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-serif text-sm font-medium">質問する</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                添削について質問しよう
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                「なぜこの表現じゃダメなの？」
                <br />
                「他の言い方はある？」
                <br />
                など、気軽に聞いてみてください
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60"
                  }`}
                >
                  {message.context && (
                    <div
                      className={`mb-2 rounded-lg px-2 py-1 text-[10px] ${
                        message.role === "user"
                          ? "bg-primary-foreground/10 text-primary-foreground/80"
                          : "bg-background/50 text-muted-foreground"
                      }`}
                    >
                      {message.context.original} → {message.context.suggested}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-muted/60 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    考え中...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Context indicator */}
      {pendingContext && (
        <div className="border-t border-border/40 bg-primary/5 px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-primary">
              「{pendingContext.improvement.original}」について質問中
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                setPendingContext(null);
                setInput("");
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border/60 p-3">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="質問を入力..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            maxLength={500}
            rows={2}
            className="min-h-[60px] resize-none text-sm"
          />
          <Button
            size="icon"
            className="h-[60px] w-10 shrink-0"
            onClick={handleSend}
            disabled={sending || !input.trim()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-right text-[10px] text-muted-foreground">
          {input.length}/500
        </p>
      </div>
    </div>
  );
}

// Export a method to allow parent to trigger asking about an improvement
export type ChatPanelRef = {
  askAboutImprovement: (index: number, improvement: Improvement) => void;
};
