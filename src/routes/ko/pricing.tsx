import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { callCreateCheckoutSession } from "@/lib/functions";
import { Analytics } from "@/lib/firebase";
import { useSEO } from "@/hooks/use-seo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Sparkles,
  Crown,
  ArrowLeft,
  Zap,
  Infinity,
  PenLine,
  ScanLine,
  History,
  NotebookText,
  Rocket,
  Loader2,
  Settings,
} from "lucide-react";

const FREE_FEATURES = [
  { icon: Infinity, text: "20,000토큰 (체험용)", included: true },
  { icon: Zap, text: "표준 모델로 첨삭", included: true },
  { icon: History, text: "학습 기록 7일간", included: true },
  { icon: NotebookText, text: "단어장 50개까지", included: true },
  { icon: ScanLine, text: "손글씨 인식(OCR)", included: false },
];

const PRO_FEATURES = [
  { icon: Infinity, text: "월 2,000,000토큰", highlight: true },
  { icon: Zap, text: "고정밀 모델로 첨삭", highlight: true },
  { icon: History, text: "학습 기록 무제한" },
  { icon: NotebookText, text: "단어장 무제한" },
  { icon: ScanLine, text: "손글씨 인식(OCR)", highlight: true },
];

export default function PricingPageKo() {
  useSEO({
    title: "요금 플랜",
    description: "Writto 요금 플랜. 무료 플랜으로 시작하고, Pro 플랜으로 더 풍부한 학습 경험을. 월 980엔부터.",
    canonical: "/ko/pricing",
  });

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const currentPlan = profile?.plan || "free";
  const isFreePlan = currentPlan === "free";

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // 런칭 가격 (~2026년 5월 말)
  const isLaunchPeriod = new Date() < new Date("2026-06-01");
  const launchMonthlyPrice = 980;
  const launchYearlyPrice = 9400;
  // 정가 (2026년 6월~)
  const regularMonthlyPrice = 1280;
  const regularYearlyPrice = 9800;

  const monthlyPrice = isLaunchPeriod ? launchMonthlyPrice : regularMonthlyPrice;
  const yearlyPrice = isLaunchPeriod ? launchYearlyPrice : regularYearlyPrice;
  const yearlyMonthlyEquivalent = Math.floor(yearlyPrice / 12);

  const [loading, setLoading] = useState(false);

  const handleSelectPro = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    Analytics.upgradeClicked("pricing_page");
    setLoading(true);
    try {
      const { url } = await callCreateCheckoutSession(
        billingCycle,
        `${window.location.origin}/dashboard?checkout=success`,
        `${window.location.origin}/ko/pricing?checkout=canceled`
      );
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("결제를 시작하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/ko" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PenLine className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-medium">Writto</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/ko" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                홈으로
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Crown className="h-3.5 w-3.5" />
              심플하고 이해하기 쉬운 요금
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">
              요금 플랜
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              먼저 무료로 체험해 보세요. 마음에 드시면 Pro로.
              <br className="hidden sm:block" />
              자신의 페이스로 영어 라이팅 실력을 키워 보세요.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Launch Pricing Banner */}
        {isLaunchPeriod && (
          <div className="mb-8 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/5 to-orange-500/5 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-accent">
              <Rocket className="h-5 w-5" />
              <span className="font-medium">런칭 기념 가격</span>
              <span className="text-xs text-accent/70">~2026년 5월 말</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              기간 중 구매한 구독에 적용됩니다. 기간 종료 후에는 정가로 갱신됩니다.
            </p>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="mb-10 flex justify-center">
          <div className="relative flex gap-1 rounded-xl bg-muted/60 p-1">
            {(["monthly", "yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`relative z-10 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                  billingCycle === cycle
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {billingCycle === cycle && (
                  <motion.span
                    layoutId="billing-cycle-indicator-ko"
                    className="absolute inset-0 rounded-lg bg-card shadow-sm"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {cycle === "monthly" ? "월간" : "연간"}
                {cycle === "yearly" && (
                  <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch pt-4">
          {/* Free Plan */}
          <Card className={`relative flex flex-col transition-shadow hover:shadow-lg ${!isFreePlan ? "" : "ring-2 ring-primary/20"}`}>
            <CardContent className="flex flex-1 flex-col p-6 sm:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 h-8">
                  <h2 className="font-serif text-2xl">무료 플랜</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  먼저 체험해 보고 싶은 분께
                </p>
              </div>

              <div className="mb-8 min-h-[76px]">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-5xl font-medium">¥0</span>
                  <span className="text-muted-foreground">/ 월</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  신용카드 불필요
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {FREE_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 min-h-[28px]">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        feature.included
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted/50 text-muted-foreground/50"
                      }`}
                    >
                      <feature.icon className="h-3 w-3" />
                    </div>
                    <span className={`text-sm ${!feature.included ? "text-muted-foreground/60 line-through" : ""}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {isFreePlan ? (
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  className="w-full"
                >
                  현재 플랜
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full gap-2"
                >
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    설정에서 플랜 관리
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`relative flex flex-col border-primary/40 shadow-xl shadow-primary/10 transition-shadow hover:shadow-2xl hover:shadow-primary/15 ${currentPlan === "pro" ? "ring-2 ring-primary/20" : ""}`}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/30">
                추천
              </Badge>
            </div>

            <CardContent className="flex flex-1 flex-col p-6 sm:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 h-8">
                  <Crown className="h-6 w-6 text-amber-500" />
                  <h2 className="font-serif text-2xl">Pro</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  본격적으로 영어 실력을 키우고 싶은 분께
                </p>
              </div>

              <div className="mb-8 min-h-[76px]">
                {billingCycle === "yearly" ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-5xl font-medium">
                        ¥{yearlyMonthlyEquivalent.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/ 월</span>
                      {isLaunchPeriod && (
                        <span className="text-lg text-muted-foreground/60 line-through">
                          ¥{Math.floor(regularYearlyPrice / 12).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      ¥{yearlyPrice.toLocaleString()} / 연간 결제
                      {isLaunchPeriod && (
                        <span className="ml-2 text-muted-foreground/60 line-through">
                          ¥{regularYearlyPrice.toLocaleString()}
                        </span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-5xl font-medium">
                        ¥{monthlyPrice.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/ 월</span>
                      {isLaunchPeriod && (
                        <span className="text-lg text-muted-foreground/60 line-through">
                          ¥{regularMonthlyPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      매월 청구
                    </p>
                  </>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {PRO_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 min-h-[28px]">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        feature.highlight
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <feature.icon className="h-3 w-3" />
                    </div>
                    <span className={`text-sm ${feature.highlight ? "font-medium" : ""}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                onClick={handleSelectPro}
                disabled={currentPlan === "pro" || loading}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {currentPlan === "pro" ? (
                  "현재 플랜"
                ) : loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    Pro 플랜 시작하기
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="mb-8 text-center font-serif text-2xl">
            자주 묻는 질문
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-2 font-medium">언제든지 해지할 수 있나요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  네, 언제든지 해지 가능합니다. 해지 후에도 기간 종료까지 이용하실 수 있습니다.
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-2 font-medium">토큰이란 무엇인가요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI가 처리하는 텍스트의 단위입니다. 첨삭 1회에 약 2,500토큰, 주제 생성에 약 1,100토큰이 소비됩니다.
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-2 font-medium">무료 플랜에서도 첨삭 품질은 같나요?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  무료 플랜에서는 표준 모델을 사용합니다. Pro 플랜에서는 고정밀 모델로 더 정확한 피드백을 받을 수 있습니다.
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-2 font-medium">결제 방법은?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  신용카드(Visa, Mastercard, American Express, JCB)를 지원합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Footer */}
        {!user && (
          <div className="mt-16 rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/[0.03] p-8 text-center">
            <h2 className="font-serif text-2xl">
              먼저 무료로 시작해 보시겠어요?
            </h2>
            <p className="mt-2 text-muted-foreground">
              계정 등록은 30초면 완료됩니다
            </p>
            <Link to="/login">
              <Button size="lg" className="mt-6 gap-2">
                <Sparkles className="h-4 w-4" />
                무료로 시작하기
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <Link to="/ko" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <PenLine className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-base font-medium">Writto</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Writto
          </p>
        </div>
      </footer>
    </div>
  );
}
