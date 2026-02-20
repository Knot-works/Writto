import { useState } from "react";
import { useTranslation } from "react-i18next";
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

const CATEGORY_ICONS: Record<FeedbackCategory, typeof Bug> = {
  bug: Bug,
  feature: Lightbulb,
  other: MessageCircle,
};

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { t } = useTranslation("app");
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
        setError(t("feedback.rateLimit"));
      } else {
        setError(t("feedback.error.message"));
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
            <VisuallyHidden.Root>{t("feedback.title")}</VisuallyHidden.Root>
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
                  {t("feedback.success.title")}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 text-sm text-muted-foreground"
                >
                  {t("feedback.success.message")}
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
                  {t("feedback.error.title")}
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
                    {t("feedback.error.backToEdit")}
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
                  <p className="mt-3 font-serif text-xl">{t("feedback.title")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("feedback.subtitle")}
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-4">
                  {/* Category Selection */}
                  <div className="flex gap-2">
                    {(["bug", "feature", "other"] as FeedbackCategory[]).map((key) => {
                      const Icon = CATEGORY_ICONS[key];
                      return (
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
                          <span className="text-xs font-medium">{t(`feedback.categories.${key}`)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Content Input */}
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
                    placeholder={t(`feedback.placeholders.${category}`)}
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
                        {t("feedback.submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t("feedback.submit")}
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
