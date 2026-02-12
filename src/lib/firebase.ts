import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics, logEvent, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "auth.writto.knotwith.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence for better UX and reduced read costs
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.warn("Firestore persistence failed: multiple tabs open");
  } else if (err.code === "unimplemented") {
    // Browser doesn't support persistence
    console.warn("Firestore persistence not supported in this browser");
  }
});

// ============ Analytics ============

let analytics: Analytics | null = null;

// Initialize analytics only in browser environment
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Track custom events
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

// Predefined event helpers for type safety
export const Analytics = {
  // User acquisition
  signupCompleted: (method: "google" | "email") =>
    trackEvent("signup_completed", { method }),

  profileSetup: (params: { userType?: string; goal: string; level: string }) =>
    trackEvent("profile_setup", params),

  // Engagement
  writingStarted: (mode: string) =>
    trackEvent("writing_started", { mode }),

  writingSubmitted: (params: { mode: string; wordCount: number; timeTakenSec: number }) =>
    trackEvent("writing_submitted", params),

  writingGraded: (params: { mode: string; rank: string }) =>
    trackEvent("writing_graded", params),

  promptGenerated: (mode: string) =>
    trackEvent("prompt_generated", { mode }),

  followUpAsked: () =>
    trackEvent("followup_asked"),

  vocabSaved: () =>
    trackEvent("vocab_saved"),

  feedbackSent: (category: string) =>
    trackEvent("feedback_sent", { category }),

  // Revenue
  upgradeClicked: (source: string) =>
    trackEvent("upgrade_clicked", { source }),

  subscriptionStarted: (billingCycle: "monthly" | "yearly") =>
    trackEvent("subscription_started", { billing_cycle: billingCycle }),

  subscriptionCanceled: () =>
    trackEvent("subscription_canceled"),

  // Errors (client-side)
  errorOccurred: (params: { type: string; message: string; location?: string }) =>
    trackEvent("error_occurred", params),
};

export default app;
