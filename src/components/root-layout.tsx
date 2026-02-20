import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { TokenProvider } from "@/contexts/token-context";
import { UpgradeModalProvider } from "@/contexts/upgrade-modal-context";
import { GradingProvider } from "@/contexts/grading-context";
import { ScrollToTop } from "@/components/scroll-to-top";
import { LanguageRedirect } from "@/components/language-redirect";
import { Toaster } from "@/components/ui/sonner";

export function RootLayout() {
  // Signal prerender that rendering is complete
  useEffect(() => {
    const timer = setTimeout(() => {
      document.dispatchEvent(new Event("render-complete"));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <TokenProvider>
        <UpgradeModalProvider>
          <GradingProvider>
            <ScrollToTop />
            <LanguageRedirect />
            <Outlet />
            <Toaster />
          </GradingProvider>
        </UpgradeModalProvider>
      </TokenProvider>
    </AuthProvider>
  );
}
