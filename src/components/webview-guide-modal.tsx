import { useEffect, useState } from "react";
import {
  detectWebView,
  getAppDisplayName,
  getOpenInBrowserInstructions,
  redirectLineToExternalBrowser,
  type WebViewInfo,
} from "@/lib/webview-detect";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check, MoreHorizontal, MoreVertical, Share2, Menu, Globe } from "lucide-react";
import { toast } from "sonner";

interface WebViewGuideModalProps {
  /** Called when user dismisses the modal */
  onDismiss?: () => void;
}

export function WebViewGuideModal({ onDismiss }: WebViewGuideModalProps) {
  const [webViewInfo, setWebViewInfo] = useState<WebViewInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // LINE: Automatically redirect to external browser
    if (redirectLineToExternalBrowser()) {
      // Redirect is happening, don't show modal
      return;
    }

    const info = detectWebView();
    setWebViewInfo(info);

    // Check if user has already dismissed this session
    const hasDismissed = sessionStorage.getItem("webview-guide-dismissed");
    if (hasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Don't show if not in WebView or already dismissed
  if (!webViewInfo?.isWebView || dismissed) {
    return null;
  }

  const appName = webViewInfo.app ? getAppDisplayName(webViewInfo.app) : "このアプリ";
  const instructions = webViewInfo.app
    ? getOpenInBrowserInstructions(webViewInfo.app)
    : getOpenInBrowserInstructions("unknown");

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("URLをコピーしました");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("webview-guide-dismissed", "true");
    setDismissed(true);
    onDismiss?.();
  };

  const IconComponent = {
    "dots-horizontal": MoreHorizontal,
    "dots-vertical": MoreVertical,
    "share": Share2,
    "menu": Menu,
    "globe": Globe,
  }[instructions.icon];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ExternalLink className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-serif text-xl font-bold">
              ブラウザで開いてください
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {appName}のアプリ内ブラウザでは
              <br />
              Googleログインが利用できません
            </p>
          </div>

          {/* Instructions */}
          <div className="px-6 py-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <IconComponent className="h-4 w-4" />
              <span>ブラウザで開く手順</span>
            </div>

            <ol className="space-y-3">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>

            {/* Visual hint for menu position */}
            <div className="mt-6 rounded-lg border border-dashed border-border/60 bg-muted/30 p-4">
              <div className="relative h-12 w-full rounded bg-muted/50">
                {/* Simulated browser header */}
                <div
                  className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground animate-pulse ${
                    instructions.position === "top-right"
                      ? "right-2 top-1"
                      : instructions.position === "bottom-right"
                      ? "right-2 bottom-1"
                      : "left-2 top-1"
                  }`}
                >
                  <IconComponent className="h-3.5 w-3.5" />
                </div>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs text-muted-foreground">
                  ここをタップ →
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border/60 px-6 py-4 space-y-3">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  コピーしました
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  URLをコピーして開く
                </>
              )}
            </Button>

            <button
              onClick={handleDismiss}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              このまま続ける（一部機能が制限されます）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
