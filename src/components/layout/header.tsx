import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useToken } from "@/contexts/token-context";
import { useUpgradeModal } from "@/contexts/upgrade-modal-context";
import { callCreateCheckoutSession, callDeleteAccount } from "@/lib/functions";
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
  Settings,
  LogOut,
  Sparkles,
  Crown,
  User,
  ChevronRight,
  Zap,
  BookOpen,
  Infinity,
  Coins,
  Trash2,
  Loader2,
  AlertTriangle,
  Camera,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";

const PRO_FEATURE_KEYS = [
  { icon: Infinity, key: "tokens", highlight: true },
  { icon: Zap, key: "highAccuracy", highlight: true },
  { icon: BookOpen, key: "unlimitedHistory", highlight: false },
  { icon: Camera, key: "ocr", highlight: true },
];

// Shared modal content class
const MODAL_CONTENT_CLASS = "fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border/60 bg-card p-0 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

export function Header() {
  const { t } = useTranslation("app");
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { tokenUsage, refresh: refreshTokenUsage } = useToken();
  const { isOpen: upgradeModalOpen, open: openUpgradeModal, close: closeUpgradeModal } = useUpgradeModal();
  const location = useLocation();
  const navigate = useNavigate();
  const plan = profile?.plan || "free";
  const isFreePlan = plan === "free";

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [priceAnimating, setPriceAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"up" | "down">("up");
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const monthlyRef = useRef<HTMLButtonElement>(null);
  const yearlyRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, transform: "translateX(0)" });
  const modalInitializedRef = useRef(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    setUserModalOpen(false);
    signOut();
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await callDeleteAccount();
      toast.success(t("header.accountDeleted"));
      setDeleteModalOpen(false);
      setUserModalOpen(false);
      signOut();
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error(t("header.accountDeleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  // ローンチ価格（〜2026年5月末）
  const isLaunchPeriod = new Date() < new Date("2026-06-01");
  const launchMonthlyPrice = 980;
  const launchYearlyPrice = 9400;
  // 通常価格（2026年6月〜）
  const regularMonthlyPrice = 1280;
  const regularYearlyPrice = 9800;

  const monthlyPrice = isLaunchPeriod ? launchMonthlyPrice : regularMonthlyPrice;
  const yearlyPrice = isLaunchPeriod ? launchYearlyPrice : regularYearlyPrice;
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

  // Start Stripe checkout session
  const handleCheckout = async () => {
    if (!user) return;
    setIsUpdatingPlan(true);
    try {
      const { url } = await callCreateCheckoutSession(
        billingCycle,
        `${window.location.origin}/dashboard?checkout=success`,
        `${window.location.origin}/pricing?checkout=canceled`
      );
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(t("header.checkoutFailed"));
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="Writto"
              className="h-6 w-auto transition-transform group-hover:scale-105"
            />
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              Beta
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" active={isActive("/dashboard")}>
              {t("navigation.home")}
            </NavLink>
            <NavLink to="/write" active={isActive("/write") || location.pathname.startsWith("/write/")}>
              {t("navigation.writing")}
            </NavLink>
            <NavLink to="/vocabulary" active={isActive("/vocabulary")}>
              {t("navigation.vocabulary")}
            </NavLink>
            <NavLink to="/mistakes" active={isActive("/mistakes")}>
              {t("navigation.mistakes")}
            </NavLink>
            <NavLink to="/history" active={isActive("/history")}>
              {t("navigation.history")}
            </NavLink>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Plan indicator */}
            {user && (
              isFreePlan ? (
                <Button
                  size="sm"
                  onClick={() => openUpgradeModal()}
                  className="hidden gap-1.5 rounded-full bg-gradient-to-r from-accent to-orange-500 text-white hover:from-accent/90 hover:to-orange-500/90 sm:flex btn-bounce"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t("navigation.upgrade")}</span>
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
                onClick={() => {
                  setUserModalOpen(true);
                  // Refresh token usage when opening the modal
                  refreshTokenUsage();
                }}
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
              <VisuallyHidden.Root>{t("header.profile")}</VisuallyHidden.Root>
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
                  t("header.freePlan")
                ) : (
                  <span className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {t("navigation.pro")}
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
                      <span className="text-sm font-medium">{t("header.tokenUsage")}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {tokenUsage.plan === "free"
                        ? t("header.freeQuota")
                        : t("header.resetIn", { days: tokenUsage.daysUntilReset })
                      }
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
                      <span>{t("header.used", { tokens: formatTokens(tokenUsage.tokensUsed) })}</span>
                      <span>{t("header.limit", { tokens: formatTokens(tokenUsage.tokenLimit) })}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upgrade Banner for Free Users */}
              {isFreePlan && (
                <button
                  onClick={() => {
                    setUserModalOpen(false);
                    openUpgradeModal();
                  }}
                  className="mb-4 block w-full rounded-2xl border border-border/60 bg-gradient-to-r from-accent/5 to-orange-500/5 p-4 text-left transition-all hover:border-accent/30 hover:from-accent/10 hover:to-orange-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <Sparkles className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{t("header.upgradeToPro")}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("header.fromMonthly", { price: yearlyMonthlyEquivalent })}
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
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span>{t("navigation.settings")}</span>
                </button>
                <div className="my-2 border-t border-border/60" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t("navigation.logout")}</span>
                </button>
                <button
                  onClick={() => {
                    setUserModalOpen(false);
                    setDeleteModalOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>{t("header.deleteAccount")}</span>
                </button>
              </div>

            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={(open) => open ? openUpgradeModal() : closeUpgradeModal()}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className={MODAL_CONTENT_CLASS} aria-describedby={undefined}>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <DialogPrimitive.Title className="mt-4 font-serif text-2xl">
                {t("header.upgradeToPro")}
              </DialogPrimitive.Title>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("header.upgradeSubtitle")}
              </p>
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
              {/* Launch Pricing Banner */}
              {isLaunchPeriod && (
                <div className="mb-6 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/5 to-orange-500/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-accent text-sm">
                    <Rocket className="h-4 w-4" />
                    <span className="font-medium">{t("header.launchPrice")}</span>
                    <span className="text-xs text-accent/70">{t("header.launchPeriod")}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("header.launchPriceNote")}
                  </p>
                </div>
              )}

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
                    {t("header.monthly")}
                  </button>
                  <button
                    ref={yearlyRef}
                    onClick={() => handleBillingChange("yearly")}
                    className={`billing-toggle-option ${billingCycle === "yearly" ? "active" : ""}`}
                  >
                    {t("header.yearly")}
                    <span className="discount-badge absolute -right-1 -top-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plan Card */}
              <div className="rounded-2xl border border-border/60 p-6">
                {/* Price with Animation */}
                <div className="mb-6 overflow-hidden text-center">
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
                          <span className="text-base text-muted-foreground">/ 月</span>
                          {isLaunchPeriod && (
                            <span className="text-lg text-muted-foreground/60 line-through">
                              ¥{Math.floor(regularYearlyPrice / 12).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t("header.yearlyBilling", { price: yearlyPrice.toLocaleString() })}
                          {isLaunchPeriod && (
                            <span className="ml-2 text-muted-foreground/60 line-through">
                              ¥{regularYearlyPrice.toLocaleString()}
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="font-serif text-5xl font-medium">
                            ¥{monthlyPrice.toLocaleString()}
                          </span>
                          <span className="text-base text-muted-foreground">/ 月</span>
                          {isLaunchPeriod && (
                            <span className="text-lg text-muted-foreground/60 line-through">
                              ¥{regularMonthlyPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t("header.monthlyBilling")}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3.5 mb-8">
                  {PRO_FEATURE_KEYS.map((feature, idx) => (
                    <li
                      key={idx}
                      className="feature-item flex items-center gap-3"
                      style={{ animationDelay: `${0.05 + idx * 0.05}s` }}
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${
                          feature.highlight
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <feature.icon className="h-4 w-4" />
                      </div>
                      <span className={feature.highlight ? "font-medium" : ""}>
                        {t(`header.proFeatures.${feature.key}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="w-full gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 btn-bounce h-14 text-base"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isUpdatingPlan}
                >
                  {isUpdatingPlan ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Crown className="h-5 w-5" />
                  )}
                  {isUpdatingPlan ? t("common.processing") : t("header.startProPlan")}
                </Button>
              </div>

              {/* Footer */}
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {t("header.cancelAnytime")}
              </p>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Delete Account Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className={MODAL_CONTENT_CLASS} aria-describedby={undefined}>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <DialogPrimitive.Title className="mt-4 font-serif text-2xl">
                {t("header.deleteAccountConfirm")}
              </DialogPrimitive.Title>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("header.cannotUndo")}
              </p>
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
              <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                <p className="text-sm text-muted-foreground">
                  {t("header.deleteWarning")}
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• {t("header.deleteItems.history")}</li>
                  <li>• {t("header.deleteItems.vocabulary")}</li>
                  <li>• {t("header.deleteItems.profile")}</li>
                  <li>• {t("header.deleteItems.account")}</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2 rounded-xl"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("header.deleting")}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      {t("header.delete")}
                    </>
                  )}
                </Button>
              </div>
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
