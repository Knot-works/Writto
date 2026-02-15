import { useEffect, useCallback, useState } from "react";
import { useBlocker } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

export function useUnsavedChanges({
  hasUnsavedChanges,
  message = "入力中の内容が失われます。",
}: UseUnsavedChangesOptions) {
  const [showDialog, setShowDialog] = useState(false);

  // Block navigation with React Router's useBlocker
  const blocker = useBlocker(
    useCallback(() => hasUnsavedChanges, [hasUnsavedChanges])
  );

  // Show dialog when navigation is blocked
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowDialog(true);
    }
  }, [blocker.state]);

  // Handle browser close/refresh (useBlocker doesn't handle this)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleConfirm = useCallback(() => {
    setShowDialog(false);
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  }, [blocker]);

  const handleCancel = useCallback(() => {
    setShowDialog(false);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  }, [blocker]);

  const UnsavedChangesDialog = useCallback(
    () => (
      <AnimatePresence>
        {showDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={handleCancel}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
            >
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
                {/* Header with icon */}
                <div className="flex flex-col items-center px-6 pt-8 pb-4">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
                    <AlertTriangle className="h-7 w-7 text-amber-500" />
                  </div>
                  <h2 className="font-serif text-xl text-center">
                    ページを離れますか？
                  </h2>
                  <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
                    {message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={handleCancel}
                  >
                    続ける
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-11 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={handleConfirm}
                  >
                    離れる
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    ),
    [showDialog, message, handleCancel, handleConfirm]
  );

  return { UnsavedChangesDialog };
}
