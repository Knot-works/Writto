import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
}

const languages = {
  ja: "日本語",
  ko: "한국어",
} as const;

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isKorean = location.pathname.startsWith("/ko");
  const currentLang = isKorean ? "ko" : "ja";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build the alternate language path
  const getAlternatePath = (targetLang: "ja" | "ko") => {
    if (targetLang === currentLang) return location.pathname;

    if (targetLang === "ja") {
      // Remove /ko prefix to get Japanese version
      return location.pathname.replace(/^\/ko/, "") || "/";
    } else {
      // Add /ko prefix for Korean version
      return `/ko${location.pathname === "/" ? "" : location.pathname}`;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        <span>{languages[currentLang]}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-border/50 bg-background shadow-lg">
          {(Object.keys(languages) as Array<"ja" | "ko">).map((lang) => (
            <Link
              key={lang}
              to={getAlternatePath(lang)}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 text-sm transition-colors hover:bg-muted ${
                lang === currentLang
                  ? "bg-muted/50 font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {languages[lang]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
