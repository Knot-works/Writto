import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import jaCommon from "./locales/ja/common.json";
import koCommon from "./locales/ko/common.json";

const resources = {
  ja: {
    common: jaCommon,
  },
  ko: {
    common: koCommon,
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ja",
    defaultNS: "common",
    ns: ["common"],
    detection: {
      order: ["path", "navigator"],
      lookupFromPathIndex: 0,
    },
    supportedLngs: ["ja", "ko"],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

// Helper to get language from URL path
export function getLanguageFromPath(pathname: string): "ja" | "ko" {
  if (pathname.startsWith("/ko")) {
    return "ko";
  }
  return "ja";
}

// Helper to build localized path
export function getLocalizedPath(path: string, lang: "ja" | "ko"): string {
  // Remove any existing language prefix
  const cleanPath = path.replace(/^\/(ja|ko)/, "");

  if (lang === "ko") {
    return `/ko${cleanPath}`;
  }
  return cleanPath || "/";
}
