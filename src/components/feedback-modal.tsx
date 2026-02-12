import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { callSubmitFeedback, type FeedbackCategory } from "@/lib/functions";
import { Analytics } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogPortal,
} from "@/components/ui/dialog";
import { Dialog as DialogPrimitive, VisuallyHidden } from "radix-ui";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  MessageCircle,
  Loader2,
  Check,
  Send,
  AlertCircle,
} from "lucide-react";

const MODAL_CONTENT_CLASS =
  "fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border/60 bg-card p-0 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

const MAX_CONTENT_LENGTH = 500;

const CATEGORIES: { key: FeedbackCategory; label: string; icon: typeof Bug }[] = [
  { key: "bug", label: "バグ報告", icon: Bug },
  { key: "feature", label: "機能リクエスト", icon: Lightbulb },
  { key: "other", label: "その他・感想", icon: MessageCircle },
];

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>("feature");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await callSubmitFeedback({ category, content: content.trim() });
      Analytics.feedbackSent(category);
      setSubmitted(true);
      setTimeout(() => {
        onOpenChange(false);
        // Reset state after modal closes
        setTimeout(() => {
          setCategory("feature");
          setContent("");
          setSubmitted(false);
          setError(null);
        }, 300);
      }, 1500);
    } catch (err: unknown) {
      console.error("Failed to submit feedback:", err);
      // Check if rate limit error
      if (
        err != null &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "functions/resource-exhausted"
      ) {
        setError("送信回数の上限に達しました。しばらく経ってからお試しください。");
      } else {
        setError("送信に失敗しました。しばらく経ってからお試しください。");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className={MODAL_CONTENT_CLASS} aria-describedby={undefined}>
          <DialogPrimitive.Title asChild>
            <VisuallyHidden.Root>フィードバック</VisuallyHidden.Root>
          </DialogPrimitive.Title>

          <AnimatePresence mode="wait">
            {submitted ? (
              /* Success State */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-6 py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.2,
                    }}
                  >
                    <Check className="h-8 w-8 text-green-500" />
                  </motion.div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 font-serif text-xl"
                >
                  ありがとうございます
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 text-sm text-muted-foreground"
                >
                  フィードバックを受け付けました
                </motion.p>
              </motion.div>
            ) : error ? (
              /* Error State */
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-6 py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10"
                >
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 font-serif text-xl"
                >
                  送信できませんでした
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-sm text-muted-foreground"
                >
                  {error}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <Button
                    variant="outline"
                    onClick={handleRetry}
                    className="gap-2 rounded-xl"
                  >
                    戻って編集する
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              /* Form State */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <p className="mt-3 font-serif text-xl">フィードバック</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ご意見・ご要望をお聞かせください
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-4">
                  {/* Category Selection */}
                  <div className="flex gap-2">
                    {CATEGORIES.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                          category === key
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/60 hover:border-primary/30"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Content Input */}
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
                    placeholder={
                      category === "bug"
                        ? "どのような問題が発生しましたか？"
                        : category === "feature"
                        ? "どのような機能があると嬉しいですか？"
                        : "ご意見・ご感想をお聞かせください"
                    }
                    className="resize-none min-h-[160px]"
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {content.length}/{MAX_CONTENT_LENGTH}
                  </p>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || submitting}
                    className="w-full gap-2 rounded-xl"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        送信する
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
