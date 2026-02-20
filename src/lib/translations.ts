import { useTranslation } from "react-i18next";
import type {
  Goal,
  Level,
  WritingMode,
  SkillAxis,
  StructureRole,
  SRSRating,
  UserType,
  SchoolType,
} from "@/types";

/**
 * Hook to get translated labels for type constants.
 * Use this instead of importing GOAL_LABELS, LEVEL_LABELS etc. directly
 * when you need translated labels.
 */
export function useTypeLabels() {
  const { t } = useTranslation("app");

  return {
    getGoalLabel: (goal: Goal) => t(`types.goals.${goal}`),
    getLevelLabel: (level: Level) => t(`types.levels.${level}`),
    getLevelDescription: (level: Level) => t(`types.levelDescriptions.${level}`),
    getModeLabel: (mode: WritingMode) => t(`types.modes.${mode}`),
    getSkillLabel: (skill: SkillAxis) => t(`types.skills.${skill}`),
    getStructureRoleLabel: (role: StructureRole) => t(`types.structureRoles.${role}`),
    getSRSRatingLabel: (rating: SRSRating) => t(`types.srsRatings.${rating}`),
    getUserTypeLabel: (userType: UserType) => t(`types.userTypes.${userType}`),
    getSchoolTypeLabel: (schoolType: SchoolType) => t(`types.schoolTypes.${schoolType}`),
    getSubtypeLabel: (subtype: string) => t(`types.subtypes.${subtype}`),
    getInterestLabel: (interest: string) => {
      // Map Japanese interest names to translation keys
      const keyMap: Record<string, string> = {
        "テクノロジー": "technology",
        "映画・ドラマ": "movies",
        "音楽": "music",
        "スポーツ": "sports",
        "料理・グルメ": "cooking",
        "旅行": "travel",
        "読書": "reading",
        "ゲーム": "games",
        "アート・デザイン": "art",
        "ビジネス・経済": "business",
        "科学": "science",
        "健康・フィットネス": "health",
        "ファッション": "fashion",
        "環境・SDGs": "environment",
        "教育": "education",
      };
      const key = keyMap[interest];
      return key ? t(`interests.${key}`) : interest;
    },
    getOccupationLabel: (occupation: string) => {
      // Map Japanese occupation names to translation keys
      const keyMap: Record<string, string> = {
        "IT・エンジニア": "it_engineer",
        "営業・マーケティング": "sales_marketing",
        "経理・財務": "accounting",
        "人事・総務": "hr_admin",
        "企画・経営": "planning_management",
        "デザイナー": "designer",
        "医療・看護": "healthcare",
        "教育・研究": "education_research",
        "法務・コンサルティング": "legal_consulting",
        "製造・技術": "manufacturing",
        "接客・サービス": "service",
        "公務員": "government",
        "フリーランス": "freelance",
        "その他": "other",
      };
      const key = keyMap[occupation];
      return key ? t(`occupations.${key}`) : occupation;
    },
  };
}

/**
 * Get translated interest options for use in forms.
 * Returns an array of { value, label } for each interest.
 */
export function useInterestOptions() {
  const { t } = useTranslation("app");

  const interestKeys = [
    "technology", "movies", "music", "sports", "cooking",
    "travel", "reading", "games", "art", "business",
    "science", "health", "fashion", "environment", "education"
  ] as const;

  // Map back to original Japanese values for storage compatibility
  const valueMap: Record<string, string> = {
    technology: "テクノロジー",
    movies: "映画・ドラマ",
    music: "音楽",
    sports: "スポーツ",
    cooking: "料理・グルメ",
    travel: "旅行",
    reading: "読書",
    games: "ゲーム",
    art: "アート・デザイン",
    business: "ビジネス・経済",
    science: "科学",
    health: "健康・フィットネス",
    fashion: "ファッション",
    environment: "環境・SDGs",
    education: "教育",
  };

  return interestKeys.map(key => ({
    value: valueMap[key],
    label: t(`interests.${key}`),
  }));
}

/**
 * Get translated occupation options for use in forms.
 */
export function useOccupationOptions() {
  const { t } = useTranslation("app");

  const occupationKeys = [
    "it_engineer", "sales_marketing", "accounting", "hr_admin",
    "planning_management", "designer", "healthcare", "education_research",
    "legal_consulting", "manufacturing", "service", "government",
    "freelance", "other"
  ] as const;

  // Map back to original Japanese values for storage compatibility
  const valueMap: Record<string, string> = {
    it_engineer: "IT・エンジニア",
    sales_marketing: "営業・マーケティング",
    accounting: "経理・財務",
    hr_admin: "人事・総務",
    planning_management: "企画・経営",
    designer: "デザイナー",
    healthcare: "医療・看護",
    education_research: "教育・研究",
    legal_consulting: "法務・コンサルティング",
    manufacturing: "製造・技術",
    service: "接客・サービス",
    government: "公務員",
    freelance: "フリーランス",
    other: "その他",
  };

  return occupationKeys.map(key => ({
    value: valueMap[key],
    label: t(`occupations.${key}`),
  }));
}

/**
 * Get translated grade options for a given school type.
 */
export function useGradeOptions(schoolType: SchoolType | undefined) {
  const { t } = useTranslation("app");

  if (!schoolType) return [];

  const gradeConfigs: Record<SchoolType, { value: number; key: string }[]> = {
    junior_high: [
      { value: 1, key: "year1" },
      { value: 2, key: "year2" },
      { value: 3, key: "year3" },
    ],
    high_school: [
      { value: 1, key: "year1" },
      { value: 2, key: "year2" },
      { value: 3, key: "year3" },
    ],
    university: [
      { value: 1, key: "year1" },
      { value: 2, key: "year2" },
      { value: 3, key: "year3" },
      { value: 4, key: "year4" },
    ],
    graduate: [
      { value: 1, key: "master1" },
      { value: 2, key: "master2" },
      { value: 3, key: "doctor1" },
      { value: 4, key: "doctor2" },
      { value: 5, key: "doctor3" },
    ],
  };

  return gradeConfigs[schoolType].map(({ value, key }) => ({
    value,
    label: t(`grades.${key}`),
  }));
}
