import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";

// Page loading fallback
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// Lazy load all route components for code splitting
// Public pages (often first load, so prioritized)
const LandingPage = lazy(() => import("@/routes/landing"));
const LoginPage = lazy(() => import("@/routes/login"));
const PricingPage = lazy(() => import("@/routes/pricing"));

// Legal/Info pages (rarely accessed)
const PrivacyPage = lazy(() => import("@/routes/privacy"));
const TermsPage = lazy(() => import("@/routes/terms"));
const CommercialPage = lazy(() => import("@/routes/legal/commercial"));
const ContactPage = lazy(() => import("@/routes/contact"));
const FAQPage = lazy(() => import("@/routes/faq"));
const AboutPage = lazy(() => import("@/routes/about"));
const NotFoundPage = lazy(() => import("@/routes/not-found"));

// Onboarding (only for new users)
const OnboardingPage = lazy(() => import("@/routes/onboarding"));

// Authenticated pages
const DashboardPage = lazy(() => import("@/routes/dashboard"));
const WriteModePage = lazy(() => import("@/routes/write/index"));
const WritingPage = lazy(() => import("@/routes/write/mode"));
const ResultPage = lazy(() => import("@/routes/write/result"));
const VocabularyPage = lazy(() => import("@/routes/vocabulary"));
const HistoryPage = lazy(() => import("@/routes/history"));
const MistakesPage = lazy(() => import("@/routes/mistakes"));
const SettingsPage = lazy(() => import("@/routes/settings"));

export function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/legal/commercial" element={<CommercialPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Authenticated routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/write" element={<WriteModePage />} />
          <Route path="/write/:mode" element={<WritingPage />} />
          <Route path="/write/result/:id" element={<ResultPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/mistakes" element={<MistakesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
