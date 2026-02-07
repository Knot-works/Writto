import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { TokenProvider } from "@/contexts/token-context";
import { Toaster } from "@/components/ui/sonner";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TokenProvider>
          <App />
          <Toaster />
        </TokenProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
