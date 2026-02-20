import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { useTypeLabels } from "@/lib/translations";
import {
  Target,
  Heart,
  MessageSquareText,
  PencilRuler,
  Briefcase,
  Coffee,
  Globe,
  Sparkles,
  User,
  BookOpen,
} from "lucide-react";
import type { WritingMode } from "@/types";

interface ModeOption {
  mode: WritingMode;
  icon: React.ReactNode;
  color: string;
}

interface ModeCategory {
  key: "personalized" | "topicBased" | "custom";
  icon: React.ReactNode;
  modes: ModeOption[];
}

const MODE_ICONS: Record<WritingMode, React.ReactNode> = {
  goal: <Target className="h-6 w-6" />,
  hobby: <Heart className="h-6 w-6" />,
  business: <Briefcase className="h-6 w-6" />,
  daily: <Coffee className="h-6 w-6" />,
  social: <Globe className="h-6 w-6" />,
  expression: <MessageSquareText className="h-6 w-6" />,
  custom: <PencilRuler className="h-6 w-6" />,
};

const MODE_COLORS: Record<WritingMode, string> = {
  goal: "from-blue-500 to-cyan-500",
  hobby: "from-pink-500 to-rose-500",
  business: "from-slate-600 to-slate-800",
  daily: "from-amber-500 to-orange-500",
  social: "from-emerald-500 to-teal-500",
  expression: "from-violet-500 to-purple-500",
  custom: "from-gray-500 to-gray-700",
};

const categoryData: ModeCategory[] = [
  {
    key: "personalized",
    icon: <User className="h-4 w-4" />,
    modes: [
      { mode: "goal", icon: MODE_ICONS.goal, color: MODE_COLORS.goal },
      { mode: "hobby", icon: MODE_ICONS.hobby, color: MODE_COLORS.hobby },
    ],
  },
  {
    key: "topicBased",
    icon: <BookOpen className="h-4 w-4" />,
    modes: [
      { mode: "business", icon: MODE_ICONS.business, color: MODE_COLORS.business },
      { mode: "daily", icon: MODE_ICONS.daily, color: MODE_COLORS.daily },
      { mode: "social", icon: MODE_ICONS.social, color: MODE_COLORS.social },
    ],
  },
  {
    key: "custom",
    icon: <Sparkles className="h-4 w-4" />,
    modes: [
      { mode: "expression", icon: MODE_ICONS.expression, color: MODE_COLORS.expression },
      { mode: "custom", icon: MODE_ICONS.custom, color: MODE_COLORS.custom },
    ],
  },
];

function ModeCard({ mode, icon, color, t, getModeLabel }: ModeOption & { t: (key: string) => string; getModeLabel: (mode: WritingMode) => string }) {
  return (
    <Link to={`/write/${mode}`}>
      <Card className="group relative h-full overflow-hidden cursor-pointer border-border/50 hover:border-primary/30 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="relative p-5 space-y-3">
          {/* Icon */}
          <div
            className={`
              flex h-12 w-12 items-center justify-center rounded-xl
              bg-gradient-to-br ${color} text-white
              transition-transform duration-300 ease-out
              group-hover:scale-105
            `}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium">
                {getModeLabel(mode)}
              </h3>
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full">
                {t(`writing.modeSelection.modes.${mode}.wordCount`)}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(`writing.modeSelection.modes.${mode}.description`)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function WriteModePage() {
  const { t } = useTranslation("app");
  const { getModeLabel } = useTypeLabels();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-medium">{t("writing.modeSelection.title")}</h1>
        <p className="text-muted-foreground">
          {t("writing.modeSelection.subtitle")}
        </p>
      </div>

      {/* Categories */}
      {categoryData.map((category) => (
        <section key={category.key} className="space-y-4">
          {/* Category Header */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {category.icon}
            </div>
            <div>
              <h2 className="font-medium text-base">{t(`writing.modeSelection.categories.${category.key}`)}</h2>
              <p className="text-xs text-muted-foreground">
                {t(`writing.modeSelection.categories.${category.key}Description`)}
              </p>
            </div>
          </div>

          {/* Mode Cards */}
          <div className={`grid gap-4 ${
            category.modes.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}>
            {category.modes.map((m) => (
              <ModeCard key={m.mode} {...m} t={t} getModeLabel={getModeLabel} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
