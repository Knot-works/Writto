import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { saveUserProfile, saveWriting, updateStreak } from "@/lib/firestore";
import { callGradeWriting } from "@/lib/functions";
import {
  useTypeLabels,
  useInterestOptions,
  useOccupationOptions,
  useGradeOptions,
} from "@/lib/translations";
import { getDetectedLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { TagInput } from "@/components/ui/tag-input";
import { Badge } from "@/components/ui/badge";
import { RankBadge } from "@/components/writing/rank-badge";
import { GradingInProgress } from "@/components/writing/grading-in-progress";
import {
  Briefcase,
  Plane,
  GraduationCap,
  MessageCircle,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  PenLine,
  Sparkles,
  Loader2,
  Send,
  Trophy,
} from "lucide-react";
import type { WritingFeedback, Rank } from "@/types";
import {
  type Goal,
  type Level,
  type UserType,
  type SchoolType,
  GOAL_LABELS,
  LEVEL_LABELS,
} from "@/types";

const GOAL_ICONS: Record<Goal, React.ReactNode> = {
  business: <Briefcase className="h-6 w-6" />,
  travel: <Plane className="h-6 w-6" />,
  study_abroad: <GraduationCap className="h-6 w-6" />,
  daily: <MessageCircle className="h-6 w-6" />,
  exam: <FileText className="h-6 w-6" />,
};

const PRACTICE_RECOMMENDED_WORDS = 50;

export default function OnboardingPage() {
  const { t, i18n } = useTranslation("app");
  const { user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const {
    getGoalLabel,
    getLevelLabel,
    getLevelDescription,
    getUserTypeLabel,
    getSchoolTypeLabel,
  } = useTypeLabels();
  const interestOptions = useInterestOptions();
  const occupationOptions = useOccupationOptions();

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [toeicScore, setToeicScore] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  // Step 2: About You
  const [userType, setUserType] = useState<UserType | null>(null);
  const [schoolType, setSchoolType] = useState<SchoolType | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [clubActivity, setClubActivity] = useState("");
  const [major, setMajor] = useState("");
  const [occupation, setOccupation] = useState("");
  const [occupationCustom, setOccupationCustom] = useState("");
  const [personalContext, setPersonalContext] = useState("");
  // Step 5: Practice
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [gradingError, setGradingError] = useState<string | null>(null);

  // Get grade options for current school type
  const gradeOptions = useGradeOptions(schoolType ?? undefined);

  // Practice prompt
  const practicePrompt = t("onboarding.practice.practicePrompt");
  const practiceHint = t("onboarding.practice.practiceHint");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Reset grade if schoolType changes and grade is out of range
  useEffect(() => {
    if (schoolType && grade) {
      const maxGrade = gradeOptions.length;
      if (grade > maxGrade) setGrade(null);
    }
  }, [schoolType, grade, gradeOptions]);

  const handleComplete = async () => {
    if (!user || !goal || !level) return;
    setSaving(true);
    try {
      // Check if occupation is "other" (stored value is still Japanese for backward compatibility)
      const resolvedOccupation =
        userType === "working"
          ? (occupation === "その他" ? occupationCustom : occupation)
          : null;

      // Build profile object, excluding undefined/null values
      // Set language based on browser language detection
      const detectedLang = getDetectedLanguage();
      const profile: Record<string, unknown> = {
        displayName: user.displayName || "",
        email: user.email || "",
        goal,
        level,
        interests,
        targetExpressions: [],
        explanationLang: detectedLang === "ko" ? "ko" : "ja",
        uiLanguage: detectedLang,
        plan: "free",
      };

      // Add optional fields only if they have values
      if (user.photoURL) profile.photoURL = user.photoURL;
      if (toeicScore) profile.toeicScore = parseInt(toeicScore);
      if (userType) profile.userType = userType;
      if (userType === "student") {
        if (schoolType) profile.schoolType = schoolType;
        if (grade) profile.grade = grade;
        if (clubActivity) profile.clubActivity = clubActivity;
        if (major) profile.major = major;
      }
      if (resolvedOccupation) profile.occupation = resolvedOccupation;
      if (personalContext) profile.personalContext = personalContext;
      if (customInterests.length > 0) profile.customInterests = customInterests;

      await saveUserProfile(user.uid, profile as Parameters<typeof saveUserProfile>[1]);

      // Save the practice writing if we have feedback
      const hasCompletedWriting = feedback && practiceAnswer.trim();
      if (hasCompletedWriting) {
        await saveWriting(user.uid, {
          mode: "goal",
          prompt: practicePrompt,
          promptHint: practiceHint,
          recommendedWords: PRACTICE_RECOMMENDED_WORDS,
          userAnswer: practiceAnswer,
          feedback,
          wordCount,
        });
        await updateStreak(user.uid);
      }

      await refreshProfile();
      // Pass flag to show tooltip if user completed writing
      navigate(hasCompletedWriting ? "/dashboard?firstWriting=true" : "/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;
  const wordCount = practiceAnswer.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmitPractice = async () => {
    if (!user || !goal || !level || wordCount < 3) return;
    setGrading(true);
    setGradingError(null);

    try {
      // Create a temporary profile for grading
      const detectedLang = getDetectedLanguage();
      const tempProfile = {
        displayName: user.displayName || "",
        email: user.email || "",
        goal,
        level,
        interests,
        targetExpressions: [],
        explanationLang: detectedLang === "ko" ? ("ko" as const) : ("ja" as const),
        plan: "free" as const,
        createdAt: new Date(),
      };

      const result = await callGradeWriting(
        tempProfile,
        practicePrompt,
        practiceAnswer,
        "ja"
      );

      setFeedback(result);
    } catch (error) {
      console.error("Grading failed:", error);
      setGradingError(t("onboarding.practice.gradingError"));
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // When feedback is shown, use a scrollable layout instead of centered
  const showFeedbackLayout = step === 5 && feedback;

  return (
    <div className={`min-h-screen p-6 paper-texture ${showFeedbackLayout ? "py-8" : "flex flex-col items-center justify-center"}`}>
      <div className={`w-full mx-auto space-y-8 ${showFeedbackLayout ? "max-w-xl" : "max-w-lg"}`}>
        {!showFeedbackLayout && (
          <div className="space-y-2 text-center">
            <h1 className="font-serif text-3xl">{t("onboarding.pageTitle")}</h1>
            <p className="text-muted-foreground">
              {t("onboarding.pageSubtitle")}
            </p>
          </div>
        )}

        {!showFeedbackLayout && <Progress value={progress} className="h-1.5" />}

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl">
              {t("onboarding.goal.title")}
            </h2>
            <div className="grid gap-3">
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                <Card
                  key={g}
                  className={`cursor-pointer p-4 transition-all hover:shadow-md ${
                    goal === g
                      ? "border-primary bg-primary/5 shadow-md"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setGoal(g)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        goal === g
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {GOAL_ICONS[g]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getGoalLabel(g)}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`onboarding.goalDescriptions.${g}`)}
                      </p>
                    </div>
                    {goal === g && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!goal}
              className="w-full gap-2"
            >
              {t("onboarding.navigation.next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: About You */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-serif text-xl">
                {t("onboarding.profile.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("onboarding.profile.subtitle")}
              </p>
            </div>

            {/* User Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer p-4 transition-all hover:shadow-md ${
                  userType === "student"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "hover:border-primary/30"
                }`}
                onClick={() => setUserType("student")}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      userType === "student"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <span className="font-medium">{getUserTypeLabel("student")}</span>
                </div>
              </Card>
              <Card
                className={`cursor-pointer p-4 transition-all hover:shadow-md ${
                  userType === "working"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "hover:border-primary/30"
                }`}
                onClick={() => setUserType("working")}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      userType === "working"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <span className="font-medium">{getUserTypeLabel("working")}</span>
                </div>
              </Card>
            </div>

            {/* Student Fields */}
            {userType === "student" && (
              <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("onboarding.student.school")}</label>
                  <div className="flex flex-wrap gap-2">
                    {(["junior_high", "high_school", "university", "graduate"] as SchoolType[]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => setSchoolType(st)}
                          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                            schoolType === st
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {getSchoolTypeLabel(st)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {schoolType && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("onboarding.student.grade")}</label>
                    <div className="flex flex-wrap gap-2">
                      {gradeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setGrade(opt.value)}
                          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                            grade === opt.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("onboarding.student.club")}
                  </label>
                  <Input
                    placeholder={t("onboarding.student.clubPlaceholder")}
                    value={clubActivity}
                    onChange={(e) => setClubActivity(e.target.value)}
                  />
                </div>

                {(schoolType === "university" ||
                  schoolType === "graduate") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("onboarding.student.major")}
                    </label>
                    <Input
                      placeholder={t("onboarding.student.majorPlaceholder")}
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Working Fields */}
            {userType === "working" && (
              <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("onboarding.working.occupation")}</label>
                  <div className="flex flex-wrap gap-2">
                    {occupationOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setOccupation(opt.value)}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                          occupation === opt.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {occupation === "その他" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("onboarding.working.occupationCustomLabel")}
                    </label>
                    <Input
                      placeholder={t("onboarding.working.occupationCustomPlaceholder")}
                      value={occupationCustom}
                      onChange={(e) => setOccupationCustom(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Personal Context */}
            {userType && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("onboarding.working.personalContext")}
                </label>
                <Textarea
                  placeholder={t("onboarding.working.personalContextPlaceholder")}
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
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("onboarding.navigation.back")}
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!userType}
                className="flex-1 gap-2"
              >
                {t("onboarding.navigation.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Level */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl">{t("onboarding.level.title")}</h2>

            <div className="grid gap-3">
              {(Object.keys(LEVEL_LABELS) as Level[]).map((l) => (
                <Card
                  key={l}
                  className={`cursor-pointer p-4 transition-all hover:shadow-md ${
                    level === l
                      ? "border-primary bg-primary/5 shadow-md"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setLevel(l)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${
                        level === l
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {t(`onboarding.levelAbbreviations.${l}`)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getLevelLabel(l)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getLevelDescription(l)}
                      </p>
                    </div>
                    {level === l && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                {t("onboarding.level.toeicScore")}
              </label>
              <Input
                type="number"
                placeholder={t("onboarding.level.toeicPlaceholder")}
                value={toeicScore}
                onChange={(e) => setToeicScore(e.target.value)}
                min={10}
                max={990}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("onboarding.navigation.back")}
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!level}
                className="flex-1 gap-2"
              >
                {t("onboarding.navigation.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl">{t("onboarding.interests.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("onboarding.interests.subtitle")}
            </p>

            <div className="flex flex-wrap gap-2">
              {interestOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleInterest(opt.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    interests.includes(opt.value)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("onboarding.interests.customInterests.label")}
              </label>
              <TagInput
                tags={customInterests}
                onTagsChange={setCustomInterests}
                placeholder={t("onboarding.interests.customInterests.placeholder")}
                maxTags={5}
              />
              <p className="text-xs text-muted-foreground">
                {t("onboarding.interests.customInterests.hint")}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("onboarding.navigation.back")}
              </Button>
              <Button
                onClick={() => setStep(5)}
                disabled={interests.length === 0}
                className="flex-1 gap-2"
              >
                {t("onboarding.navigation.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Practice Writing */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <PenLine className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-xl">{t("onboarding.practice.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("onboarding.practice.subtitle")}
              </p>
            </div>

            {grading ? (
              <GradingInProgress compact />
            ) : !feedback ? (
              <>
                {/* Prompt Card */}
                <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/[0.03]">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-serif text-lg leading-relaxed">
                          {practicePrompt}
                        </p>
                        <p className="text-sm italic text-muted-foreground">
                          {practiceHint}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("onboarding.practice.recommendedWords", { count: PRACTICE_RECOMMENDED_WORDS })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Writing Area */}
                <div className="space-y-2">
                  <Textarea
                    placeholder={t("onboarding.practice.answerPlaceholder")}
                    value={practiceAnswer}
                    onChange={(e) => setPracticeAnswer(e.target.value)}
                    rows={5}
                    className="resize-none text-base leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("common.wordCount", { count: wordCount })}</span>
                    {gradingError && (
                      <span className="text-destructive">{gradingError}</span>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("onboarding.navigation.back")}
                  </Button>
                  <Button
                    onClick={handleSubmitPractice}
                    disabled={wordCount < 3}
                    className="flex-1 gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {t("onboarding.practice.submit")}
                  </Button>
                </div>

                {/* Skip Option - always visible */}
                <Button
                  variant={gradingError ? "outline" : "ghost"}
                  onClick={handleComplete}
                  disabled={saving}
                  className={`w-full ${gradingError ? "" : "text-muted-foreground"}`}
                >
                  {gradingError ? t("onboarding.practice.skipWithError") : t("onboarding.practice.skipPractice")}
                </Button>
              </>
            ) : (
              /* Feedback Display - Full page view */
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Celebration Header */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl"
                    >
                      <Trophy className="h-10 w-10" />
                    </motion.div>
                    <h3 className="font-serif text-2xl">{t("onboarding.success.title")}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {t("onboarding.success.message")}
                    </p>
                  </div>

                  {/* Score Summary - Compact horizontal */}
                  <Card className="overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10">
                      <div className="flex items-center gap-4">
                        <RankBadge rank={feedback.overallRank as Rank} size="lg" />
                        <div className="flex gap-4">
                          {[
                            { label: t("types.skills.grammar"), rank: feedback.grammarRank },
                            { label: t("types.skills.vocabulary"), rank: feedback.vocabularyRank },
                            { label: t("types.skills.structure"), rank: feedback.structureRank },
                            { label: t("types.skills.content"), rank: feedback.contentRank },
                          ].map((item) => (
                            <div key={item.label} className="text-center">
                              <p className="text-xs text-muted-foreground">{item.label}</p>
                              <p className="font-serif text-lg font-bold">{item.rank}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {feedback.summary && (
                      <div className="px-4 py-2 border-t">
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {feedback.summary}
                        </p>
                      </div>
                    )}
                  </Card>

                  {/* Corrections - Full width, no scroll limit */}
                  {feedback.improvements && feedback.improvements.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">
                          {t("onboarding.success.corrections")}
                          <span className="ml-2 text-sm text-muted-foreground font-normal">
                            {t("onboarding.success.correctionsCount", { count: feedback.improvements.length })}
                          </span>
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {feedback.improvements.map((imp, index) => {
                          const typeStyles: Record<string, { bg: string; border: string; text: string; labelKey: string }> = {
                            grammar: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-600 dark:text-rose-400", labelKey: "grammar" },
                            vocabulary: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400", labelKey: "vocabulary" },
                            structure: { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-600 dark:text-sky-400", labelKey: "structure" },
                            content: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-600 dark:text-violet-400", labelKey: "content" },
                          };
                          const style = typeStyles[imp.type] || typeStyles.grammar;
                          return (
                            <Card
                              key={index}
                              className={`border ${style.border} ${style.bg}`}
                            >
                              <CardContent className="p-3">
                                <Badge
                                  variant="secondary"
                                  className={`${style.bg} ${style.text} border-0 text-xs font-medium mb-2`}
                                >
                                  {t(`types.skills.${style.labelKey}`)}
                                </Badge>
                                <div className="rounded-lg bg-background/80 px-3 py-2 mb-2">
                                  <p className="text-sm text-muted-foreground line-through decoration-1">
                                    {imp.original}
                                  </p>
                                  <p className={`text-sm font-semibold ${style.text} mt-0.5`}>
                                    → {imp.suggested}
                                  </p>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                  {imp.explanation}
                                </p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Continue Button - Sticky at bottom on mobile */}
                  <div className="sticky bottom-4 pt-4">
                    <Button
                      onClick={handleComplete}
                      disabled={saving}
                      className="w-full gap-2 shadow-lg"
                      size="lg"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("common.processing")}
                        </>
                      ) : (
                        <>
                          {t("onboarding.navigation.complete")}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
