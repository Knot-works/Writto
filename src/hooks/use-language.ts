import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import type { UILanguage } from "@/types";

/**
 * Hook to sync i18n language with user's profile preference.
 * Should be used in the app's root component to ensure language is set
 * based on the authenticated user's preference.
 */
export function useLanguageSync() {
  const { profile, profileLoaded } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!profileLoaded) return;

    const targetLang = profile?.uiLanguage || "ja";

    // Only change language if it's different from current
    if (i18n.language !== targetLang) {
      void i18n.changeLanguage(targetLang);
    }
  }, [profile?.uiLanguage, profileLoaded, i18n]);
}

/**
 * Get the current UI language from the user's profile.
 * Returns "ja" as default if not set.
 */
export function useUILanguage(): UILanguage {
  const { profile } = useAuth();
  return profile?.uiLanguage || "ja";
}

/**
 * Get the detected browser language, useful for onboarding
 * when user hasn't set a preference yet.
 */
export function getDetectedLanguage(): UILanguage {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("ko")) {
    return "ko";
  }
  return "ja";
}
