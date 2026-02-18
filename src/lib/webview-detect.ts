/**
 * WebView detection utility
 * Detects in-app browsers from various social media apps
 */

export type WebViewApp =
  | "instagram"
  | "tiktok"
  | "line"
  | "facebook"
  | "twitter"
  | "linkedin"
  | "slack"
  | "discord"
  | "wechat"
  | "unknown";

export interface WebViewInfo {
  isWebView: boolean;
  app: WebViewApp | null;
  canOpenExternal: boolean; // LINE can use openExternalBrowser param
}

/**
 * Detect if the current browser is an in-app WebView
 */
export function detectWebView(): WebViewInfo {
  const ua = navigator.userAgent || navigator.vendor || "";

  // Instagram
  if (/Instagram/i.test(ua)) {
    return { isWebView: true, app: "instagram", canOpenExternal: false };
  }

  // TikTok
  if (/TikTok|musical_ly|BytedanceWebview|ByteLocale/i.test(ua)) {
    return { isWebView: true, app: "tiktok", canOpenExternal: false };
  }

  // LINE
  if (/Line\//i.test(ua)) {
    return { isWebView: true, app: "line", canOpenExternal: true };
  }

  // Facebook / Messenger
  if (/FBAN|FBAV|FB_IAB|FBIOS|FBSS/i.test(ua)) {
    return { isWebView: true, app: "facebook", canOpenExternal: false };
  }

  // Twitter / X
  if (/Twitter/i.test(ua)) {
    return { isWebView: true, app: "twitter", canOpenExternal: false };
  }

  // LinkedIn
  if (/LinkedInApp/i.test(ua)) {
    return { isWebView: true, app: "linkedin", canOpenExternal: false };
  }

  // Slack
  if (/Slack/i.test(ua)) {
    return { isWebView: true, app: "slack", canOpenExternal: false };
  }

  // Discord
  if (/Discord/i.test(ua)) {
    return { isWebView: true, app: "discord", canOpenExternal: false };
  }

  // WeChat
  if (/MicroMessenger/i.test(ua)) {
    return { isWebView: true, app: "wechat", canOpenExternal: false };
  }

  // Generic WebView detection (fallback)
  if (/wv|WebView/i.test(ua)) {
    return { isWebView: true, app: "unknown", canOpenExternal: false };
  }

  return { isWebView: false, app: null, canOpenExternal: false };
}

/**
 * Redirect LINE WebView to external browser
 * LINE supports openExternalBrowser=1 parameter to force external browser
 */
export function redirectLineToExternalBrowser(): boolean {
  const info = detectWebView();

  if (info.app !== "line") {
    return false;
  }

  // Check if already has the parameter (prevent infinite redirect)
  const url = new URL(window.location.href);
  if (url.searchParams.has("openExternalBrowser")) {
    return false;
  }

  // Add parameter and redirect
  url.searchParams.set("openExternalBrowser", "1");
  window.location.href = url.toString();
  return true;
}

/**
 * Get app display name in Japanese
 */
export function getAppDisplayName(app: WebViewApp): string {
  switch (app) {
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
    case "line":
      return "LINE";
    case "facebook":
      return "Facebook";
    case "twitter":
      return "X (Twitter)";
    case "linkedin":
      return "LinkedIn";
    case "slack":
      return "Slack";
    case "discord":
      return "Discord";
    case "wechat":
      return "WeChat";
    default:
      return "このアプリ";
  }
}

/**
 * Get instructions for opening in external browser
 */
export function getOpenInBrowserInstructions(app: WebViewApp): {
  steps: string[];
  icon: "dots-vertical" | "dots-horizontal" | "share" | "menu";
  position: "top-right" | "bottom-right" | "top-left";
} {
  switch (app) {
    case "instagram":
      return {
        steps: [
          "右下の「…」をタップ",
          "「ブラウザで開く」を選択",
        ],
        icon: "dots-horizontal",
        position: "bottom-right",
      };
    case "tiktok":
      return {
        steps: [
          "右上の「…」をタップ",
          "「ブラウザで開く」を選択",
        ],
        icon: "dots-horizontal",
        position: "top-right",
      };
    case "line":
      return {
        steps: [
          "右上の「︙」をタップ",
          "「他のアプリで開く」を選択",
          "Safari/Chromeを選択",
        ],
        icon: "dots-vertical",
        position: "top-right",
      };
    case "facebook":
      return {
        steps: [
          "右下の「…」をタップ",
          "「ブラウザで開く」を選択",
        ],
        icon: "dots-horizontal",
        position: "bottom-right",
      };
    case "twitter":
      return {
        steps: [
          "右上の共有アイコンをタップ",
          "「Safariで開く」を選択",
        ],
        icon: "share",
        position: "top-right",
      };
    case "linkedin":
      return {
        steps: [
          "右上の「…」をタップ",
          "「ブラウザで開く」を選択",
        ],
        icon: "dots-horizontal",
        position: "top-right",
      };
    case "slack":
      return {
        steps: [
          "右上の「…」をタップ",
          "「ブラウザで開く」を選択",
        ],
        icon: "dots-horizontal",
        position: "top-right",
      };
    case "discord":
      return {
        steps: [
          "右上の「⋮」をタップ",
          "「ブラウザで開く」を選択",
        ],
        icon: "dots-vertical",
        position: "top-right",
      };
    case "wechat":
      return {
        steps: [
          "右上の「…」をタップ",
          "「ブラウザで開く」を選択",
        ],
        icon: "dots-horizontal",
        position: "top-right",
      };
    default:
      return {
        steps: [
          "メニューボタン（…や︙）をタップ",
          "「ブラウザで開く」を選択",
        ],
        icon: "menu",
        position: "top-right",
      };
  }
}
