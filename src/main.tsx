import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { TokenProvider } from "@/contexts/token-context";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Toaster } from "@/components/ui/sonner";
import { App } from "./App";
import "./index.css";

const basename = import.meta.env.PROD ? "/Kakeru" : "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <AuthProvider>
        <TokenProvider>
          <App />
          <Toaster />
        </TokenProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
