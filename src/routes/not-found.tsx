import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";

export default function NotFoundPage() {
  useSEO({
    title: "ページが見つかりません",
    description: "お探しのページは見つかりませんでした。",
    noindex: true,
  });

  return (
    <div className="min-h-screen bg-background paper-texture flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Writto" className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-lg">
          {/* 404 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className="font-serif text-[8rem] sm:text-[10rem] font-bold leading-none text-primary/15 select-none">
              404
            </span>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-serif text-2xl sm:text-3xl mb-3">
              ページが見つかりません
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              お探しのページは移動または削除された可能性があります。
              <br className="hidden sm:block" />
              URLをご確認いただくか、トップページからお探しください。
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="gap-2 rounded-xl">
              <Link to="/">
                <Home className="h-4 w-4" />
                トップページへ
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 rounded-xl"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              前のページへ戻る
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Writto. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
