import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { callAskFollowUp, isRateLimitError } from "@/lib/functions";
import { useUpgradeModal } from "@/contexts/upgrade-modal-context";
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
  Crown,
} from "lucide-react";
import type { WritingFeedback, Improvement, ChatMessage } from "@/types";

interface ChatPanelProps {
  writingContext: {
    prompt: string;
    userAnswer: string;
    feedback: WritingFeedback;
  };
  onClose?: () => void;
  lang?: "ja" | "en" | "ko";
}

export function ChatPanel({ writingContext, onClose, lang = "ja" }: ChatPanelProps) {
  const { t } = useTranslation("app");
  const { open: openUpgradeModal } = useUpgradeModal();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingContext, setPendingContext] = useState<{
    index: number;
    improvement: Improvement;
  } | null>(null);
  const [selectedTextContext, setSelectedTextContext] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSendingRef = useRef(false);

  // Scroll to bottom when new messages arrive (within the messages container only)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sending a message
  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || sending || isSendingRef.current) return;
    isSendingRef.current = true;

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
        : selectedTextContext
        ? {
            type: "selection",
            original: selectedTextContext,
            suggested: "",
            improvementIndex: -1,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPendingContext(null);
    setSelectedTextContext(null);
    setSending(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Build the question with selection context if present
      const questionWithContext = selectedTextContext
        ? `${t("chat.questionAboutSelection", { text: selectedTextContext })}\n\n${trimmedInput}`
        : trimmedInput;

      const response = await callAskFollowUp({
        writingContext: {
          prompt: writingContext.prompt,
          userAnswer: writingContext.userAnswer,
          modelAnswer: writingContext.feedback.modelAnswer,
          improvements: writingContext.feedback.improvements,
        },
        question: questionWithContext,
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
      if (isRateLimitError(err)) {
        toast.custom(
          () => (
            <div className="w-[360px] rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-amber-900">
                    {t("chat.rateLimitReached")}
                  </p>
                  <p className="mt-1 text-sm text-amber-700/80">
                    {t("chat.rateLimitUpgrade")}
                  </p>
                </div>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
        openUpgradeModal();
      } else {
        toast.error(t("chat.sendError"));
      }
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      isSendingRef.current = false;
      setSending(false);
    }
  }, [input, sending, messages, writingContext, pendingContext, lang, openUpgradeModal]);

  // Set context for asking about a specific improvement
  const askAboutImprovement = useCallback(
    (index: number, improvement: Improvement) => {
      setPendingContext({ index, improvement });
      setInput(`「${improvement.original}」→「${improvement.suggested}」について、`);
      textareaRef.current?.focus();
    },
    []
  );

  // Ask about selected text (free-form)
  const askAboutSelection = useCallback(
    (selectedText: string) => {
      setSelectedTextContext(selectedText);
      setPendingContext(null); // Clear any pending improvement context
      setInput("");
      textareaRef.current?.focus();
    },
    []
  );

  // Expose methods via a custom attribute
  // This allows the parent component to trigger them
  useEffect(() => {
    const panel = document.getElementById("chat-panel");
    if (panel) {
      const extendedPanel = panel as HTMLElement & {
        askAboutImprovement?: typeof askAboutImprovement;
        askAboutSelection?: typeof askAboutSelection;
      };
      extendedPanel.askAboutImprovement = askAboutImprovement;
      extendedPanel.askAboutSelection = askAboutSelection;
    }
  }, [askAboutImprovement, askAboutSelection]);

  return (
    <div id="chat-panel" className="flex h-full flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-serif text-sm font-medium">{t("chat.title")}</span>
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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {t("chat.emptyTitle")}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                {t("chat.emptyDescription")}
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
                      {message.context.type === "selection" ? (
                        <span>📝 {message.context.original}</span>
                      ) : (
                        <span>{message.context.original} → {message.context.suggested}</span>
                      )}
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
                    {t("chat.thinking")}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Context indicator - Improvement */}
      {pendingContext && (
        <div className="border-t border-border/40 bg-primary/5 px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-primary">
              {t("chat.askingAbout", { text: pendingContext.improvement.original })}
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

      {/* Context indicator - Selected text */}
      {selectedTextContext && !pendingContext && (
        <div className="border-t border-border/40 bg-sky-500/5 px-4 py-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-sky-600 mb-1">{t("chat.selectedText")}</p>
              <p className="text-xs text-foreground/80 line-clamp-2 break-all">
                {selectedTextContext}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 shrink-0"
              onClick={() => {
                setSelectedTextContext(null);
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
            placeholder={t("chat.placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
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
