import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { TokenProvider } from "@/contexts/token-context";
import { UpgradeModalProvider } from "@/contexts/upgrade-modal-context";
import { GradingProvider } from "@/contexts/grading-context";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Toaster } from "@/components/ui/sonner";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <TokenProvider>
          <UpgradeModalProvider>
            <GradingProvider>
              <App />
              <Toaster />
            </GradingProvider>
          </UpgradeModalProvider>
        </TokenProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
