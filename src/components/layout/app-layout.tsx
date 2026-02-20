import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useLanguageSync } from "@/hooks/use-language";
import { Header } from "./header";

export function AppLayout() {
  const { user, profile, loading, profileLoaded } = useAuth();
  const navigate = useNavigate();

  // Sync i18n language with user's profile preference
  useLanguageSync();

  useEffect(() => {
    // Wait for both auth and profile to be fully loaded before redirecting
    if (!loading && profileLoaded) {
      if (!user) {
        navigate("/login");
      } else if (!profile) {
        navigate("/onboarding");
      }
    }
  }, [user, profile, loading, profileLoaded, navigate]);

  // Show loading while auth or profile is being loaded
  if (loading || !profileLoaded || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
