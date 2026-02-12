import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  type UserType,
  type SchoolType,
  GOAL_LABELS,
  LEVEL_LABELS,
  INTEREST_OPTIONS,
  SCHOOL_TYPE_LABELS,
  GRADE_OPTIONS,
  OCCUPATION_OPTIONS,
} from "@/types";

function SubscriptionManagement() {
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
      alert("サブスクリプション管理ページを開けませんでした。");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="pt-4 border-t border-border/50 space-y-4">
      {/* Subscription Status */}
      {loadingDetails ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          サブスクリプション情報を読み込み中...
        </div>
      ) : subscriptionDetails ? (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {subscriptionDetails.billingCycle === "yearly" ? "年額プラン" : "月額プラン"}
            </span>
          </div>

          {subscriptionDetails.cancelAtPeriodEnd ? (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                解約予約済み
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(subscriptionDetails.currentPeriodEnd)}まで引き続きご利用いただけます。
                その後、自動的に無料プランに移行します。
              </p>
            </div>
          ) : (
            <div className="text-sm">
              <span className="text-muted-foreground">次回更新日: </span>
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
          サブスクリプションを管理
          <ExternalLink className="h-3 w-3" />
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          支払い方法の変更・プラン解約はこちらから
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { tokenUsage, loading: loadingTokens } = useToken();
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
  const [userType, setUserType] = useState<UserType | undefined>(
    profile?.userType
  );
  const [schoolType, setSchoolType] = useState<SchoolType | undefined>(
    profile?.schoolType
  );
  const [grade, setGrade] = useState<number | undefined>(profile?.grade);
  const [clubActivity, setClubActivity] = useState(
    profile?.clubActivity || ""
  );
  const [major, setMajor] = useState(profile?.major || "");
  const [occupation, setOccupation] = useState(profile?.occupation || "");
  const [personalContext, setPersonalContext] = useState(
    profile?.personalContext || ""
  );

  // Reset grade when school type changes
  useEffect(() => {
    if (schoolType && grade) {
      const maxGrade = GRADE_OPTIONS[schoolType].length;
      if (grade > maxGrade) setGrade(undefined);
    }
  }, [schoolType, grade]);

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
      setDeleteError("アカウントの削除に失敗しました。再度お試しください。");
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl">設定</h1>
        <p className="text-muted-foreground">
          学習プロフィールと環境設定
        </p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">アカウント</h2>
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
                  {profile?.plan === "pro" ? "Pro" : "無料プラン"}
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
            <h2 className="font-serif text-lg font-medium">トークン使用量</h2>
          </div>
          <Separator />

          {tokenUsage ? (
            <div className="space-y-4">
              {/* Usage Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">今月の使用量</span>
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
                    ? "無料枠（リセットなし）"
                    : tokenUsage.periodEnd
                      ? `次回リセット: ${new Date(tokenUsage.periodEnd).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}`
                      : null
                  }
                </p>
              </div>

              {/* Plan Info */}
              {tokenUsage.plan === "free" && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="text-sm text-muted-foreground">
                    無料枠を使い切ると、<span className="font-medium text-foreground">Proプラン</span>へのアップグレードが必要です。Proプランでは月間200万トークンまで利用でき、請求サイクルごとにリセットされます。
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
              使用量を取得できませんでした
            </p>
          )}
        </CardContent>
      </Card>

      {/* Profile / About You */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">プロフィール</h2>
          </div>
          <Separator />

          {/* User Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">あなたは？</label>
            <div className="flex gap-2">
              <Button
                variant={userType === "student" ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setUserType("student")}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                学生
              </Button>
              <Button
                variant={userType === "working" ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setUserType("working")}
              >
                <Briefcase className="h-3.5 w-3.5" />
                社会人
              </Button>
            </div>
          </div>

          {/* Student Fields */}
          {userType === "student" && (
            <div className="space-y-3 rounded-lg border border-border/40 p-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">学校</label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(SCHOOL_TYPE_LABELS) as SchoolType[]).map(
                    (st) => (
                      <Button
                        key={st}
                        variant={schoolType === st ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSchoolType(st)}
                      >
                        {SCHOOL_TYPE_LABELS[st]}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {schoolType && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">学年</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GRADE_OPTIONS[schoolType].map((opt) => (
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
                  部活・サークル
                </label>
                <Input
                  placeholder="例: サッカー部"
                  value={clubActivity}
                  onChange={(e) => setClubActivity(e.target.value)}
                  className="max-w-[250px]"
                />
              </div>

              {(schoolType === "university" ||
                schoolType === "graduate") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">専攻・学部</label>
                  <Input
                    placeholder="例: 情報工学"
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
                <label className="text-sm font-medium">職種</label>
                <div className="flex flex-wrap gap-1.5">
                  {OCCUPATION_OPTIONS.map((occ) => (
                    <Button
                      key={occ}
                      variant={occupation === occ ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOccupation(occ)}
                    >
                      {occ}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Personal Context */}
          <div className="space-y-2">
            <label className="text-sm font-medium">自由メモ（任意）</label>
            <Textarea
              placeholder="英語学習に関連する状況があれば（例: 来月から海外赴任予定）"
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
            <h2 className="font-serif text-lg font-medium">学習目標</h2>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.entries(GOAL_LABELS) as [Goal, string][]).map(
              ([key, label]) => (
                <Button
                  key={key}
                  variant={goal === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGoal(key)}
                  className="justify-start"
                >
                  {label}
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
            <h2 className="font-serif text-lg font-medium">レベル</h2>
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(LEVEL_LABELS) as [Level, string][]).map(
              ([key, label]) => (
                <Button
                  key={key}
                  variant={level === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLevel(key)}
                >
                  {label}
                </Button>
              )
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              TOEICスコア（任意）
            </label>
            <Input
              type="number"
              value={toeicScore}
              onChange={(e) => setToeicScore(e.target.value)}
              placeholder="例: 650"
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
            <h2 className="font-serif text-lg font-medium">興味・趣味</h2>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                  interests.includes(interest)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/30"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium">好きなもの・詳しいこと（最大5個）</label>
            <TagInput
              tags={customInterests}
              onTagsChange={setCustomInterests}
              placeholder="キーワードを入力 → Enterで追加"
              maxTags={5}
            />
            <p className="text-xs text-muted-foreground">
              お題に反映したいキーワードを追加できます
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-lg font-medium">解説言語</h2>
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button
              variant={explanationLang === "ja" ? "default" : "outline"}
              size="sm"
              onClick={() => setExplanationLang("ja")}
            >
              日本語
            </Button>
            <Button
              variant={explanationLang === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setExplanationLang("en")}
            >
              English
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            添削結果の解説で使用する言語を選択します
          </p>
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
              保存しました
            </>
          ) : saving ? (
            "保存中..."
          ) : (
            <>
              <Save className="h-4 w-4" />
              設定を保存
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
              危険な操作
            </h2>
          </div>
          <Separator className="bg-destructive/20" />

          <div className="space-y-3">
            <div>
              <h3 className="font-medium">アカウントを削除</h3>
              <p className="text-sm text-muted-foreground">
                アカウントを削除すると、すべてのデータ（学習履歴、単語帳、プロフィール）が完全に削除され、復元できなくなります。
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
                  アカウントを削除
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    アカウントを削除しますか？
                  </DialogTitle>
                  <DialogDescription className="space-y-2 pt-2">
                    <p>
                      この操作は取り消せません。以下のデータがすべて削除されます：
                    </p>
                    <ul className="ml-4 list-disc text-left text-sm">
                      <li>ライティング履歴</li>
                      <li>単語帳のすべてのエントリ</li>
                      <li>プロフィール情報</li>
                      <li>トークン使用量の記録</li>
                    </ul>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                  <p className="text-sm">
                    確認のため、下のフィールドに{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-destructive">
                      DELETE
                    </code>{" "}
                    と入力してください。
                  </p>
                  <Input
                    placeholder="DELETEと入力"
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
                    キャンセル
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
                        削除中...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        完全に削除する
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
