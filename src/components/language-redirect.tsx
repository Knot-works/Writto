import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

/**
 * Redirects logged-in users to the correct language URL based on their profile setting.
 *
 * Only redirects on initial page load to avoid conflicts with manual language switching.
 * Public pages use URL-based language (/ko/faq vs /faq), so we need to redirect
 * users to match their profile's uiLanguage setting.
 */
export function LanguageRedirect() {
  const { profile, profileLoaded } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Track if this is the initial load for each path
  const initialLoadRef = useRef(true);
  const lastPathRef = useRef(location.pathname);

  useEffect(() => {
    // Reset initial load flag when path changes (user navigated)
    if (lastPathRef.current !== location.pathname) {
      initialLoadRef.current = false;
      lastPathRef.current = location.pathname;
      return;
    }

    // Only redirect on initial page load
    if (!initialLoadRef.current) return;
    if (!profileLoaded || !profile) return;

    initialLoadRef.current = false;

    const userLang = profile.uiLanguage || "ja";
    const isKoreanUrl = location.pathname.startsWith("/ko");
    const currentUrlLang = isKoreanUrl ? "ko" : "ja";

    // Skip redirect for authenticated routes (they use i18n, not URL)
    const authenticatedPaths = [
      "/dashboard",
      "/write",
      "/vocabulary",
      "/history",
      "/mistakes",
      "/settings",
      "/onboarding",
    ];
    const isAuthenticatedRoute = authenticatedPaths.some((path) =>
      location.pathname.startsWith(path)
    );
    if (isAuthenticatedRoute) return;

    // Redirect if language mismatch
    if (userLang !== currentUrlLang) {
      let newPath: string;
      if (userLang === "ko") {
        // Add /ko prefix
        newPath = `/ko${location.pathname === "/" ? "" : location.pathname}`;
      } else {
        // Remove /ko prefix
        newPath = location.pathname.replace(/^\/ko/, "") || "/";
      }
      navigate(newPath, { replace: true });
    }
  }, [profile, profileLoaded, location.pathname, navigate]);

  return null;
}
