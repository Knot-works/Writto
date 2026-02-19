import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "@/components/root-layout";
import { AppLayout } from "@/components/layout/app-layout";
import { ChunkErrorBoundary } from "@/components/chunk-error-boundary";
import "./index.css";

// Page loading fallback
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// Lazy load all route components for code splitting
const LandingPage = lazy(() => import("@/routes/landing"));
const LoginPage = lazy(() => import("@/routes/login"));
const PricingPage = lazy(() => import("@/routes/pricing"));
const PrivacyPage = lazy(() => import("@/routes/privacy"));
const TermsPage = lazy(() => import("@/routes/terms"));
const CommercialPage = lazy(() => import("@/routes/legal/commercial"));
const ContactPage = lazy(() => import("@/routes/contact"));
const FAQPage = lazy(() => import("@/routes/faq"));
const AboutPage = lazy(() => import("@/routes/about"));
const NotFoundPage = lazy(() => import("@/routes/not-found"));
const TopicPage = lazy(() => import("@/routes/topics/topic"));
const TopicPageKo = lazy(() => import("@/routes/ko/topics/topic"));
const LandingPageKo = lazy(() => import("@/routes/ko/landing"));
const OnboardingPage = lazy(() => import("@/routes/onboarding"));
const DashboardPage = lazy(() => import("@/routes/dashboard"));
const WriteModePage = lazy(() => import("@/routes/write/index"));
const WritingPage = lazy(() => import("@/routes/write/mode"));
const ResultPage = lazy(() => import("@/routes/write/result"));
const VocabularyPage = lazy(() => import("@/routes/vocabulary"));
const VocabularyQuizPage = lazy(() => import("@/routes/vocabulary/quiz"));
const HistoryPage = lazy(() => import("@/routes/history"));
const MistakesPage = lazy(() => import("@/routes/mistakes"));
const SettingsPage = lazy(() => import("@/routes/settings"));

// Wrapper for lazy loaded components
function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ChunkErrorBoundary />,
    children: [
      // Public routes
      { path: "/", element: <LazyPage Component={LandingPage} /> },
      { path: "/login", element: <LazyPage Component={LoginPage} /> },
      { path: "/onboarding", element: <LazyPage Component={OnboardingPage} /> },
      { path: "/pricing", element: <LazyPage Component={PricingPage} /> },
      { path: "/privacy", element: <LazyPage Component={PrivacyPage} /> },
      { path: "/terms", element: <LazyPage Component={TermsPage} /> },
      { path: "/legal/commercial", element: <LazyPage Component={CommercialPage} /> },
      { path: "/contact", element: <LazyPage Component={ContactPage} /> },
      { path: "/faq", element: <LazyPage Component={FAQPage} /> },
      { path: "/about", element: <LazyPage Component={AboutPage} /> },
      { path: "/topics/:slug", element: <LazyPage Component={TopicPage} /> },

      // Korean routes
      { path: "/ko", element: <LazyPage Component={LandingPageKo} /> },
      { path: "/ko/topics/:slug", element: <LazyPage Component={TopicPageKo} /> },

      // Authenticated routes
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <LazyPage Component={DashboardPage} /> },
          { path: "/write", element: <LazyPage Component={WriteModePage} /> },
          { path: "/write/:mode", element: <LazyPage Component={WritingPage} /> },
          { path: "/write/result/:id", element: <LazyPage Component={ResultPage} /> },
          { path: "/vocabulary", element: <LazyPage Component={VocabularyPage} /> },
          { path: "/vocabulary/quiz", element: <LazyPage Component={VocabularyQuizPage} /> },
          { path: "/history", element: <LazyPage Component={HistoryPage} /> },
          { path: "/mistakes", element: <LazyPage Component={MistakesPage} /> },
          { path: "/settings", element: <LazyPage Component={SettingsPage} /> },
        ],
      },

      // 404
      { path: "*", element: <LazyPage Component={NotFoundPage} /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
