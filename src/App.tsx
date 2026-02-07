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
import SettingsPage from "@/routes/settings";

export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Authenticated routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/write" element={<WriteModePage />} />
        <Route path="/write/:mode" element={<WritingPage />} />
        <Route path="/write/result/:id" element={<ResultPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
