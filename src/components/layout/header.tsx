import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useToken } from "@/contexts/token-context";
import { callTestSwitchPlan } from "@/lib/functions";
import { formatTokens, getUsagePercentage } from "@/lib/rate-limits";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogPortal,
} from "@/components/ui/dialog";
import { Dialog as DialogPrimitive, VisuallyHidden } from "radix-ui";
import {
  PenLine,
  Settings,
  LogOut,
  Sparkles,
  Crown,
  User,
  ChevronRight,
  Zap,
  BookOpen,
  BarChart3,
  Infinity,
  FlaskConical,
  Coins,
} from "lucide-react";
import { toast } from "sonner";

const PLAN_LABELS = {
  free: "無料プラン",
  pro: "Pro",
};

const PRO_FEATURES = [
  { icon: Zap, text: "高精度モデル（GPT-4o）で添削", highlight: true },
  { icon: Infinity, text: "月間2,000,000トークン", highlight: true },
  { icon: BookOpen, text: "学習履歴・単語帳が無制限" },
  { icon: BarChart3, text: "詳細な文法解析" },
  { icon: Sparkles, text: "表現の代替案を提示" },
];

// Shared modal content class
const MODAL_CONTENT_CLASS = "fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border/60 bg-card p-0 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

export function Header() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { tokenUsage, refresh: refreshTokenUsage } = useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const plan = profile?.plan || "free";
  const isFreePlan = plan === "free";

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [priceAnimating, setPriceAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"up" | "down">("up");
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const monthlyRef = useRef<HTMLButtonElement>(null);
  const yearlyRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, transform: "translateX(0)" });
  const modalInitializedRef = useRef(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    setUserModalOpen(false);
    signOut();
  };

  const monthlyPrice = 980;
  const yearlyPrice = 9400;
  const yearlyMonthlyEquivalent = Math.floor(yearlyPrice / 12);

  // Update indicator position
  useEffect(() => {
    if (!upgradeModalOpen) {
      modalInitializedRef.current = false;
      return;
    }

    const updateIndicator = () => {
      const activeRef = billingCycle === "monthly" ? monthlyRef : yearlyRef;
      if (activeRef.current) {
        const rect = activeRef.current.getBoundingClientRect();
        const parentRect = activeRef.current.parentElement?.getBoundingClientRect();
        if (parentRect && rect.width > 0) {
          setIndicatorStyle({
            width: rect.width,
            transform: `translateX(${rect.left - parentRect.left - 5}px)`,
          });
        }
      }
    };

    // For billing cycle changes after modal is initialized, update immediately
    if (modalInitializedRef.current) {
      requestAnimationFrame(updateIndicator);
      return;
    }

    // Wait for modal animation to complete before measuring (initial open)
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(updateIndicator);
      modalInitializedRef.current = true;
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [billingCycle, upgradeModalOpen]);

  const handleBillingChange = (newCycle: "monthly" | "yearly") => {
    if (newCycle === billingCycle) return;

    setAnimationDirection(newCycle === "yearly" ? "down" : "up");
    setPriceAnimating(true);
    setBillingCycle(newCycle);

    setTimeout(() => setPriceAnimating(false), 350);
  };

  // Test function to switch plan (via Cloud Function to bypass Firestore rules)
  const handleTestPlanSwitch = async (newPlan: "free" | "pro") => {
    if (!user) return;
    setIsUpdatingPlan(true);
    try {
      await callTestSwitchPlan(newPlan);
      await refreshProfile();
      // Refresh token usage after plan change
      await refreshTokenUsage();
      toast.success(`プランを${newPlan === "pro" ? "Pro" : "無料"}に変更しました（テスト）`);
      if (newPlan === "pro") {
        setUpgradeModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to update plan:", error);
      toast.error("プランの変更に失敗しました");
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105">
              <PenLine className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-medium tracking-tight">Kakeru</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" active={isActive("/dashboard")}>
              ホーム
            </NavLink>
            <NavLink to="/write" active={isActive("/write") || location.pathname.startsWith("/write/")}>
              ライティング
            </NavLink>
            <NavLink to="/vocabulary" active={isActive("/vocabulary")}>
              単語帳
            </NavLink>
            <NavLink to="/history" active={isActive("/history")}>
              履歴
            </NavLink>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Plan indicator */}
            {user && (
              isFreePlan ? (
                <Button
                  size="sm"
                  onClick={() => setUpgradeModalOpen(true)}
                  className="hidden gap-1.5 rounded-full bg-gradient-to-r from-accent to-orange-500 text-white hover:from-accent/90 hover:to-orange-500/90 sm:flex btn-bounce"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>アップグレード</span>
                </Button>
              ) : (
                <button
                  onClick={() => setUserModalOpen(true)}
                  className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:from-primary/15 hover:to-accent/15 sm:flex"
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>Pro</span>
                </button>
              )
            )}

            {/* User Menu */}
            {user && (
              <button
                onClick={() => setUserModalOpen(true)}
                className="flex items-center gap-2 rounded-full p-0.5 outline-none ring-offset-2 ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className={MODAL_CONTENT_CLASS} aria-describedby={undefined}>
            <DialogPrimitive.Title asChild>
              <VisuallyHidden.Root>プロフィール</VisuallyHidden.Root>
            </DialogPrimitive.Title>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <Avatar className="mx-auto h-20 w-20 border-4 border-background shadow-lg">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-medium">
                  {user?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="mt-4 font-serif text-xl">{user?.displayName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
              <Badge
                variant={isFreePlan ? "secondary" : "default"}
                className="mt-3 rounded-full px-3"
              >
                {isFreePlan ? (
                  PLAN_LABELS[plan as keyof typeof PLAN_LABELS]
                ) : (
                  <span className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {PLAN_LABELS[plan as keyof typeof PLAN_LABELS]}
                  </span>
                )}
              </Badge>
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
              {/* Token Usage */}
              {tokenUsage && (
                <div className="mb-4 rounded-2xl border border-border/60 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">トークン使用量</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {tokenUsage.daysUntilReset}日後リセット
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          getUsagePercentage(tokenUsage.tokensUsed, tokenUsage.tokenLimit) >= 90
                            ? "bg-destructive"
                            : getUsagePercentage(tokenUsage.tokensUsed, tokenUsage.tokenLimit) >= 70
                            ? "bg-yellow-500"
                            : "bg-primary"
                        }`}
                        style={{
                          width: `${getUsagePercentage(tokenUsage.tokensUsed, tokenUsage.tokenLimit)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTokens(tokenUsage.tokensUsed)} 使用</span>
                      <span>{formatTokens(tokenUsage.tokenLimit)} 上限</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upgrade Banner for Free Users */}
              {isFreePlan && (
                <button
                  onClick={() => {
                    setUserModalOpen(false);
                    setUpgradeModalOpen(true);
                  }}
                  className="mb-4 block w-full rounded-2xl border border-border/60 bg-gradient-to-r from-accent/5 to-orange-500/5 p-4 text-left transition-all hover:border-accent/30 hover:from-accent/10 hover:to-orange-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <Sparkles className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Proにアップグレード</p>
                        <p className="text-sm text-muted-foreground">
                          月額¥{yearlyMonthlyEquivalent}〜
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
              )}

              {/* Menu Items */}
              <div className="space-y-2 rounded-2xl border border-border/60 p-2">
                <button
                  onClick={() => {
                    setUserModalOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>プロフィール設定</span>
                </button>
                <button
                  onClick={() => {
                    setUserModalOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span>学習設定</span>
                </button>
                <div className="my-2 border-t border-border/60" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>ログアウト</span>
                </button>
              </div>

              {/* Test Mode: Plan Switch */}
              <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">テストモード</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isFreePlan ? "default" : "outline"}
                    disabled={isFreePlan || isUpdatingPlan}
                    onClick={() => handleTestPlanSwitch("free")}
                    className="flex-1 rounded-xl"
                  >
                    無料に変更
                  </Button>
                  <Button
                    size="sm"
                    variant={!isFreePlan ? "default" : "outline"}
                    disabled={!isFreePlan || isUpdatingPlan}
                    onClick={() => handleTestPlanSwitch("pro")}
                    className="flex-1 rounded-xl"
                  >
                    Proに変更
                  </Button>
                </div>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className={MODAL_CONTENT_CLASS} aria-describedby={undefined}>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <DialogPrimitive.Title className="mt-4 font-serif text-2xl">
                Proにアップグレード
              </DialogPrimitive.Title>
              <p className="mt-1 text-sm text-muted-foreground">
                より快適に英語ライティングを学習
              </p>
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
              {/* Billing Toggle - Pill Style */}
              <div className="mb-6 flex justify-center">
                <div className="billing-toggle">
                  {/* Sliding Indicator */}
                  <div
                    className="billing-toggle-indicator"
                    style={indicatorStyle}
                  />

                  <button
                    ref={monthlyRef}
                    onClick={() => handleBillingChange("monthly")}
                    className={`billing-toggle-option ${billingCycle === "monthly" ? "active" : ""}`}
                  >
                    月ごと
                  </button>
                  <button
                    ref={yearlyRef}
                    onClick={() => handleBillingChange("yearly")}
                    className={`billing-toggle-option ${billingCycle === "yearly" ? "active" : ""}`}
                  >
                    年ごと
                    <span className="discount-badge absolute -right-1 -top-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Card */}
              <div className="rounded-2xl border border-border/60 p-6">
                {/* Price with Animation */}
                <div className="mb-5 overflow-hidden text-center">
                  <div
                    key={billingCycle}
                    className={priceAnimating ? (animationDirection === "down" ? "price-animate-down" : "price-animate-up") : ""}
                  >
                    {billingCycle === "yearly" ? (
                      <>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="font-serif text-5xl font-medium">
                            ¥{yearlyMonthlyEquivalent.toLocaleString()}
                          </span>
                          <span className="text-lg text-muted-foreground">/ 月</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          ¥{yearlyPrice.toLocaleString()} 年払い
                          <span className="ml-2 text-accent/70 line-through">
                            ¥{(monthlyPrice * 12).toLocaleString()}
                          </span>
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="font-serif text-5xl font-medium">
                            ¥{monthlyPrice.toLocaleString()}
                          </span>
                          <span className="text-lg text-muted-foreground">/ 月</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          毎月の請求
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {PRO_FEATURES.map((feature, idx) => (
                    <li
                      key={idx}
                      className="feature-item flex items-center gap-3"
                      style={{ animationDelay: `${0.05 + idx * 0.05}s` }}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          feature.highlight
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <feature.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className={`text-sm ${feature.highlight ? "font-medium" : ""}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="w-full gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 btn-bounce h-12 text-base"
                  size="lg"
                  onClick={() => handleTestPlanSwitch("pro")}
                  disabled={isUpdatingPlan}
                >
                  <Crown className="h-5 w-5" />
                  {isUpdatingPlan ? "処理中..." : "Proプランをはじめる"}
                </Button>
              </div>

              {/* Test Mode Notice */}
              <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 text-center">
                <p className="text-xs text-amber-600 flex items-center justify-center gap-1">
                  <FlaskConical className="h-3 w-3" />
                  テストモード：クリックでProに切り替わります
                </p>
              </div>

              {/* Footer */}
              <p className="mt-4 text-center text-xs text-muted-foreground">
                いつでもキャンセル可能 • 安心の返金保証
              </p>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      {children}
      {active && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}
