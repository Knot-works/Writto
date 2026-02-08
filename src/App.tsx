import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import LandingPage from "@/routes/landing";
import LoginPage from "@/routes/login";
import OnboardingPage from "@/routes/onboarding";
import PricingPage from "@/routes/pricing";
import DashboardPage from "@/routes/dashboard";
import WriteModePage from "@/routes/write/index";
import WritingPage from "@/routes/write/mode";
import ResultPage from "@/routes/write/result";
import VocabularyPage from "@/routes/vocabulary";
import HistoryPage from "@/routes/history";
import MistakesPage from "@/routes/mistakes";
import SettingsPage from "@/routes/settings";
import PrivacyPage from "@/routes/privacy";
import TermsPage from "@/routes/terms";
import CommercialPage from "@/routes/legal/commercial";
import ContactPage from "@/routes/contact";
import FAQPage from "@/routes/faq";
import AboutPage from "@/routes/about";

export function App() {
  return (
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
    </Routes>
  );
}
