import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import { useToken } from "@/contexts/token-context";
import { updateUserProfile } from "@/lib/firestore";
import { Analytics } from "@/lib/firebase";
import { callDeleteAccount, callCreatePortalSession, callGetSubscriptionDetails, type SubscriptionDetails } from "@/lib/functions";
import { formatTokens, getUsagePercentage } from "@/lib/rate-limits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Target,
  BookOpen,
  Globe,
  Save,
  Check,
  GraduationCap,
  Briefcase,
  Coins,
  Crown,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Loader2,
  CreditCard,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import {
  type Goal,
  type Level,
  type ExplanationLang,
  type UILanguage,
  type UserType,
  type SchoolType,
  UI_LANGUAGE_LABELS,
} from "@/types";
import {
  useTypeLabels,
  useInterestOptions,
  useOccupationOptions,
  useGradeOptions,
} from "@/lib/translations";

function SubscriptionManagement() {
  const { t, i18n } = useTranslation("app");
  const [loading, setLoading] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await callGetSubscriptionDetails();
        setSubscriptionDetails(details);
      } catch (error) {
        console.error("Failed to fetch subscription details:", error);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, []);

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { url } = await callCreatePortalSession(window.location.href);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert(t("settings.subscription.portalError"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const locale = i18n.language === "ko" ? "ko-KR" : "ja-JP";
    return date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="pt-4 border-t border-border/50 space-y-4">
      {/* Subscription Status */}
      {loadingDetails ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("settings.subscription.loading")}
        </div>
      ) : subscriptionDetails ? (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {subscriptionDetails.billingCycle === "yearly" ? t("settings.subscription.yearly") : t("settings.subscription.monthly")}
            </span>
          </div>

          {subscriptionDetails.cancelAtPeriodEnd ? (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {t("settings.subscription.cancelScheduled")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("settings.subscription.cancelNote", { date: formatDate(subscriptionDetails.currentPeriodEnd) })}
              </p>
            </div>
          ) : (
            <div className="text-sm">
              <span className="text-muted-foreground">{t("settings.subscription.nextRenewal")} </span>
              <span className="font-medium">{formatDate(subscriptionDetails.currentPeriodEnd)}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Manage Button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManageSubscription}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          {t("settings.subscription.manage")}
          <ExternalLink className="h-3 w-3" />
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("settings.subscription.manageLink")}
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("app");
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { tokenUsage, loading: loadingTokens } = useToken();
  const { getGoalLabel, getLevelLabel, getSchoolTypeLabel } = useTypeLabels();
  const interestOptions = useInterestOptions();
  const occupationOptions = useOccupationOptions();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [goal, setGoal] = useState<Goal>(profile?.goal || "daily");
  const [level, setLevel] = useState<Level>(profile?.level || "intermediate");
  const [toeicScore, setToeicScore] = useState<string>(
    profile?.toeicScore?.toString() || ""
  );
  const [interests, setInterests] = useState<string[]>(
    profile?.interests || []
  );
  const [customInterests, setCustomInterests] = useState<string[]>(
    profile?.customInterests || []
  );
  const [explanationLang, setExplanationLang] = useState<ExplanationLang>(
    profile?.explanationLang || "ja"
  );
  const [uiLanguage, setUiLanguage] = useState<UILanguage>(
    profile?.uiLanguage || "ja"
  );
  const [userType, setUserType] = useState<UserType | undefined>(
    profile?.userType
  );
  const [schoolType, setSchoolType] = useState<SchoolType | undefined>(
    profile?.schoolType
  );
  const gradeOptions = useGradeOptions(schoolType);
  const [grade, setGrade] = useState<number | undefined>(profile?.grade);
  const [clubActivity, setClubActivity] = useState(
    profile?.clubActivity || ""
  );
  const [major, setMajor] = useState(profile?.major || "");
  const [occupation, setOccupation] = useState(profile?.occupation || "");
  const [personalContext, setPersonalContext] = useState(
    profile?.personalContext || ""
  );

  // Handle UI language change - sync explanation language if it was native
  const handleUiLanguageChange = (newUiLang: UILanguage) => {
    // If explanation language was the native language, switch to new native language
    // If it was English, keep it as English
    if (explanationLang !== "en") {
      setExplanationLang(newUiLang);
    }
    setUiLanguage(newUiLang);
  };

  // Reset grade when school type changes
  useEffect(() => {
    if (schoolType && grade && gradeOptions.length > 0) {
      const maxGrade = gradeOptions.length;
      if (grade > maxGrade) setGrade(undefined);
    }
  }, [schoolType, grade, gradeOptions]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        goal,
        level,
        toeicScore: toeicScore ? parseInt(toeicScore) : undefined,
        interests,
        explanationLang,
        uiLanguage,
        userType: userType || undefined,
        schoolType: userType === "student" ? schoolType : undefined,
        grade: userType === "student" ? grade : undefined,
        clubActivity:
          userType === "student" && clubActivity ? clubActivity : undefined,
        major: userType === "student" && major ? major : undefined,
        occupation: userType === "working" && occupation ? occupation : undefined,
        personalContext: personalContext || undefined,
        customInterests: customInterests.length > 0 ? customInterests : undefined,
      });
      // Update i18n language if changed
      if (i18n.language !== uiLanguage) {
        void i18n.changeLanguage(uiLanguage);
      }
      await refreshProfile();
      Analytics.profileSetup({ userType, goal, level });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent fail for MVP
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await callDeleteAccount();
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Delete account error:", error);
      setDeleteError(t("settings.danger.deleteFailed"));
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl">{t("settings.title")}</h1>
        <p className="text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">{t("settings.account")}</h2>
          </div>
          <Separator />
          <div className="flex items-center gap-4">
            {profile?.photoURL && (
              <img
                src={profile.photoURL}
                alt=""
                className="h-12 w-12 rounded-full"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{profile?.displayName}</p>
                <Badge
                  variant={profile?.plan === "pro" ? "default" : "secondary"}
                  className="gap-1"
                >
                  {profile?.plan === "pro" && <Crown className="h-3 w-3" />}
                  {profile?.plan === "pro" ? "Pro" : t("header.freePlan")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {profile?.email}
              </p>
            </div>
          </div>
          {profile?.plan === "pro" && (
            <SubscriptionManagement />
          )}
        </CardContent>
      </Card>

      {/* Token Usage */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">{t("settings.tokenUsage.title")}</h2>
          </div>
          <Separator />

          {tokenUsage ? (
            <div className="space-y-4">
              {/* Usage Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("settings.tokenUsage.monthlyUsage")}</span>
                  <span className="font-medium tabular-nums">
                    {formatTokens(tokenUsage.tokensUsed)} / {formatTokens(tokenUsage.tokenLimit)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
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
                <p className="text-xs text-muted-foreground">
                  {tokenUsage.plan === "free"
                    ? t("settings.tokenUsage.freeQuota")
                    : tokenUsage.periodEnd
                      ? `${t("settings.tokenUsage.nextReset")} ${new Date(tokenUsage.periodEnd).toLocaleDateString(i18n.language === "ko" ? "ko-KR" : "ja-JP", { month: "long", day: "numeric" })}`
                      : null
                  }
                </p>
              </div>

              {/* Plan Info */}
              {tokenUsage.plan === "free" && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="text-sm text-muted-foreground">
                    {t("settings.freePlanNotice")}
                  </p>
                </div>
              )}
            </div>
          ) : loadingTokens ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("settings.tokenUsage.fetchError")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Profile / About You */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">{t("settings.profile")}</h2>
          </div>
          <Separator />

          {/* User Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("settings.userType.title")}</label>
            <div className="flex gap-2">
              <Button
                variant={userType === "student" ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setUserType("student")}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                {t("settings.userType.student")}
              </Button>
              <Button
                variant={userType === "working" ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setUserType("working")}
              >
                <Briefcase className="h-3.5 w-3.5" />
                {t("settings.userType.working")}
              </Button>
            </div>
          </div>

          {/* Student Fields */}
          {userType === "student" && (
            <div className="space-y-3 rounded-lg border border-border/40 p-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("settings.school.type")}</label>
                <div className="flex flex-wrap gap-1.5">
                  {(["junior_high", "high_school", "university", "graduate"] as SchoolType[]).map(
                    (st) => (
                      <Button
                        key={st}
                        variant={schoolType === st ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSchoolType(st)}
                      >
                        {getSchoolTypeLabel(st)}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {schoolType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.school.grade")}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {gradeOptions.map((opt) => (
                      <Button
                        key={opt.value}
                        variant={grade === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGrade(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("settings.school.club")}
                </label>
                <Input
                  placeholder={t("settings.school.clubPlaceholder")}
                  value={clubActivity}
                  onChange={(e) => setClubActivity(e.target.value)}
                  className="max-w-[250px]"
                />
              </div>

              {(schoolType === "university" ||
                schoolType === "graduate") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.school.major")}</label>
                  <Input
                    placeholder={t("settings.school.majorPlaceholder")}
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="max-w-[250px]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Working Fields */}
          {userType === "working" && (
            <div className="space-y-3 rounded-lg border border-border/40 p-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("settings.work.occupation")}</label>
                <div className="flex flex-wrap gap-1.5">
                  {occupationOptions.map((occ) => (
                    <Button
                      key={occ.value}
                      variant={occupation === occ.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOccupation(occ.value)}
                    >
                      {occ.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Personal Context */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("settings.work.personalContext")}</label>
            <Textarea
              placeholder={t("settings.work.personalContextPlaceholder")}
              value={personalContext}
              onChange={(e) =>
                setPersonalContext(e.target.value.slice(0, 200))
              }
              rows={2}
              className="resize-none text-sm"
            />
            <p className="text-right text-xs text-muted-foreground">
              {personalContext.length}/200
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Goal */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">{t("settings.learning.goal")}</h2>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(["business", "travel", "study_abroad", "daily", "exam"] as Goal[]).map(
              (key) => (
                <Button
                  key={key}
                  variant={goal === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGoal(key)}
                  className="justify-start"
                >
                  {getGoalLabel(key)}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Level */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">{t("settings.learning.level")}</h2>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-2">
            {(["beginner", "intermediate", "advanced", "native"] as Level[]).map(
              (key) => (
                <Button
                  key={key}
                  variant={level === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLevel(key)}
                >
                  {getLevelLabel(key)}
                </Button>
              )
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("onboarding.level.toeicScore")}
            </label>
            <Input
              type="number"
              value={toeicScore}
              onChange={(e) => setToeicScore(e.target.value)}
              placeholder={t("onboarding.level.toeicPlaceholder")}
              className="max-w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">{t("settings.learning.interests")}</h2>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest.value}
                onClick={() => toggleInterest(interest.value)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                  interests.includes(interest.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/30"
                }`}
              >
                {interest.label}
              </button>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">{t("settings.learning.customInterests")}</label>
            <TagInput
              tags={customInterests}
              onTagsChange={setCustomInterests}
              placeholder={t("settings.learning.customInterestsPlaceholder")}
              maxTags={5}
            />
            <p className="text-xs text-muted-foreground">
              {t("settings.learning.customInterestsHint")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">{t("settings.language.title")}</h2>
          </div>
          <Separator />

          {/* UI Language */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("settings.language.uiLanguage")}</label>
            <div className="flex gap-2">
              {(Object.entries(UI_LANGUAGE_LABELS) as [UILanguage, string][]).map(
                ([key, label]) => (
                  <Button
                    key={key}
                    variant={uiLanguage === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUiLanguageChange(key)}
                  >
                    {label}
                  </Button>
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("settings.language.uiLanguageDescription")}
            </p>
          </div>

          {/* Explanation Language - options depend on UI language */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">{t("settings.language.explanationLanguage")}</label>
            <div className="flex gap-2">
              {/* Native language option (ja for Japanese UI, ko for Korean UI) */}
              <Button
                variant={explanationLang === uiLanguage ? "default" : "outline"}
                size="sm"
                onClick={() => setExplanationLang(uiLanguage)}
              >
                {uiLanguage === "ja" ? "日本語" : "한국어"}
              </Button>
              <Button
                variant={explanationLang === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setExplanationLang("en")}
              >
                English
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("settings.language.explanationLanguageDescription")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 px-8"
          size="lg"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              {t("settings.save.saved")}
            </>
          ) : saving ? (
            t("settings.save.saving")
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t("settings.save.button")}
            </>
          )}
        </Button>
      </div>

      {/* Danger Zone - Delete Account */}
      <Card className="border-destructive/30 bg-destructive/[0.02]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h2 className="font-serif text-lg font-medium text-destructive">
              {t("settings.danger.title")}
            </h2>
          </div>
          <Separator className="bg-destructive/20" />

          <div className="space-y-3">
            <div>
              <h3 className="font-medium">{t("settings.danger.deleteAccount")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("settings.danger.deleteAccountDescription")}
              </p>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) {
                setDeleteConfirmation("");
                setDeleteError(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("settings.danger.deleteAccount")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    {t("settings.danger.deleteConfirmTitle")}
                  </DialogTitle>
                  <DialogDescription className="space-y-2 pt-2">
                    <p>
                      {t("settings.danger.deleteConfirmDescription")}
                    </p>
                    <ul className="ml-4 list-disc text-left text-sm">
                      <li>{t("settings.danger.deleteItems.history")}</li>
                      <li>{t("settings.danger.deleteItems.vocabulary")}</li>
                      <li>{t("settings.danger.deleteItems.profile")}</li>
                      <li>{t("settings.danger.deleteItems.tokens")}</li>
                    </ul>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                  <p className="text-sm">
                    {t("settings.danger.deleteInputLabel")}{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-destructive">
                      DELETE
                    </code>{" "}
                    {t("settings.danger.deleteInputHint")}
                  </p>
                  <Input
                    placeholder={t("settings.danger.deleteInputPlaceholder")}
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="font-mono"
                  />
                  {deleteError && (
                    <p className="text-sm text-destructive">{deleteError}</p>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleting}
                  >
                    {t("settings.danger.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== "DELETE" || deleting}
                    className="gap-2"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("settings.danger.deleting")}
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        {t("settings.danger.deleteButton")}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="pb-8" />
    </div>
  );
}
