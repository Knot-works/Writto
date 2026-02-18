import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

const BASE_TITLE = "Writto";
const BASE_URL = "https://writto.knotwith.com";
const DEFAULT_DESCRIPTION =
  "AIがあなたに合ったお題を生成し、英作文を即座に添削。ビジネス・旅行・試験対策など、目標に合わせて実用的な英語ライティング力を身につけよう。";

export function useSEO({ title, description, canonical, noindex, structuredData }: SEOProps = {}) {
  useEffect(() => {
    // Title
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} - AI英語ライティング学習`;
    document.title = fullTitle;

    // Description
    const desc = description || DEFAULT_DESCRIPTION;
    updateMetaTag("name", "description", desc);
    updateMetaTag("property", "og:description", desc);
    updateMetaTag("name", "twitter:description", desc);

    // Title meta tags
    updateMetaTag("property", "og:title", fullTitle);
    updateMetaTag("name", "twitter:title", fullTitle);

    // Canonical
    if (canonical) {
      const fullCanonical = canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical}`;
      updateLinkTag("canonical", fullCanonical);
      updateMetaTag("property", "og:url", fullCanonical);
      updateMetaTag("name", "twitter:url", fullCanonical);
    }

    // Robots
    if (noindex) {
      updateMetaTag("name", "robots", "noindex, nofollow");
    } else {
      updateMetaTag("name", "robots", "index, follow");
    }

    // Structured Data (JSON-LD)
    let scriptElement: HTMLScriptElement | null = null;
    if (structuredData) {
      scriptElement = document.createElement("script");
      scriptElement.type = "application/ld+json";
      scriptElement.id = "page-structured-data";
      scriptElement.textContent = JSON.stringify(structuredData);
      // Remove existing one if any
      const existing = document.getElementById("page-structured-data");
      if (existing) existing.remove();
      document.head.appendChild(scriptElement);
    }

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = `${BASE_TITLE} - AI英語ライティング学習`;
      if (scriptElement) scriptElement.remove();
    };
  }, [title, description, canonical, noindex, structuredData]);
}

function updateMetaTag(attr: "name" | "property", key: string, content: string) {
  let meta = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (meta) {
    meta.content = content;
  } else {
    meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    meta.content = content;
    document.head.appendChild(meta);
  }
}

function updateLinkTag(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (link) {
    link.href = href;
  } else {
    link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  }
}
