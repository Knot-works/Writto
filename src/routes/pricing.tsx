import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Sparkles,
  Crown,
  ArrowLeft,
  Zap,
  BookOpen,
  BarChart3,
  Infinity,
  X,
  PenLine,
} from "lucide-react";

const FREE_FEATURES = [
  { text: "月間10,000トークン", included: true },
  { text: "添削 約3回/月（体験版）", included: true },
  { text: "標準モデルで添削", included: true },
  { text: "学習履歴 7日間", included: true },
  { text: "単語帳 50件まで", included: true },
  { text: "詳細な文法解析", included: false },
  { text: "表現の代替案提示", included: false },
];

const PRO_FEATURES = [
  { icon: Infinity, text: "月間2,000,000トークン", highlight: true },
  { icon: Zap, text: "高精度モデル（GPT-4o）で添削", highlight: true },
  { icon: BookOpen, text: "学習履歴 無制限" },
  { icon: BookOpen, text: "単語帳 無制限" },
  { icon: BarChart3, text: "詳細な文法解析", highlight: true },
  { icon: Sparkles, text: "表現の代替案を提示", highlight: true },
];

export default function PricingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const currentPlan = profile?.plan || "free";
  const isFreePlan = currentPlan === "free";

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const monthlyPrice = 980;
  const yearlyPrice = 9400;
  const yearlyMonthlyEquivalent = Math.floor(yearlyPrice / 12);

  const handleSelectPro = () => {
    // TODO: Implement Stripe checkout
    console.log("Selected Pro plan with billing:", billingCycle);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PenLine className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-medium">Kakeru</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              トップへ戻る
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/[0.03] to-transparent">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Crown className="h-3.5 w-3.5" />
              シンプルで分かりやすい料金
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl">
              料金プラン
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              無料で始めて、必要に応じてアップグレード。
              <br className="hidden sm:block" />
              あなたのペースで英語ライティング力を伸ばしましょう。
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
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
                    layoutId="billing-cycle-indicator"
                    className="absolute inset-0 rounded-lg bg-card shadow-sm"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {cycle === "monthly" ? "月ごと" : "年ごと"}
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <Card className={`relative flex flex-col transition-shadow hover:shadow-lg ${!isFreePlan ? "" : "ring-2 ring-primary/20"}`}>
            <CardContent className="flex flex-1 flex-col p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="font-serif text-2xl">無料プラン</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  まずは気軽に始めたい方へ
                </p>
              </div>

              <div className="mb-8">
                <span className="font-serif text-5xl font-medium">¥0</span>
                <span className="ml-2 text-muted-foreground">/ 月</span>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {FREE_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/50">
                        <X className="h-3 w-3" />
                      </div>
                    )}
                    <span className={`text-sm ${!feature.included ? "text-muted-foreground/60" : ""}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                size="lg"
                disabled={isFreePlan}
                className="w-full"
              >
                {isFreePlan ? "現在のプラン" : "無料プランに変更"}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`relative flex flex-col border-primary/40 shadow-xl shadow-primary/10 transition-shadow hover:shadow-2xl hover:shadow-primary/15 ${currentPlan === "pro" ? "ring-2 ring-primary/20" : ""}`}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/30">
                おすすめ
              </Badge>
            </div>

            <CardContent className="flex flex-1 flex-col p-6 pt-10 sm:p-8 sm:pt-12">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-amber-500" />
                  <h2 className="font-serif text-2xl">Pro</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  本格的に英語力を伸ばしたい方へ
                </p>
              </div>

              <div className="mb-8">
                {billingCycle === "yearly" ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-5xl font-medium">
                        ¥{yearlyMonthlyEquivalent.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/ 月</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      ¥{yearlyPrice.toLocaleString()} / 年払い
                      <span className="ml-2 text-accent line-through">
                        ¥{(monthlyPrice * 12).toLocaleString()}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-5xl font-medium">
                        ¥{monthlyPrice.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">/ 月</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      毎月の請求
                    </p>
                  </>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {PRO_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
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
                disabled={currentPlan === "pro"}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {currentPlan === "pro" ? (
                  "現在のプラン"
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    Proプランをはじめる
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="mb-8 text-center font-serif text-2xl">
            よくある質問
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-2 font-medium">いつでも解約できますか？</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  はい、いつでも解約可能です。解約後も期間終了まではご利用いただけます。
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-2 font-medium">トークンとは何ですか？</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AIが処理するテキストの単位です。添削1回で約2,500トークン、お題生成で約1,100トークンを消費します。
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-2 font-medium">無料プランでも添削の品質は同じですか？</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  無料プランでは標準モデルを使用しています。Proプランでは最新のGPT-4oモデルによる、より精度の高いフィードバックを受けられます。
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h3 className="mb-2 font-medium">支払い方法は？</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  クレジットカード（Visa、Mastercard、American Express、JCB）に対応しています。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Footer */}
        {!user && (
          <div className="mt-16 rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/[0.03] p-8 text-center">
            <h2 className="font-serif text-2xl">
              まずは無料で始めてみませんか？
            </h2>
            <p className="mt-2 text-muted-foreground">
              アカウント登録は30秒で完了します
            </p>
            <Link to="/login">
              <Button size="lg" className="mt-6 gap-2">
                <Sparkles className="h-4 w-4" />
                無料で始める
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <PenLine className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-sm font-medium">Kakeru</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Kakeru
          </p>
        </div>
      </footer>
    </div>
  );
}
