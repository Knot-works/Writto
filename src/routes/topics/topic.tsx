import { Link, useParams, Navigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  BookOpen,
  Lightbulb,
  PenLine,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { getTopicBySlug } from "@/data/topics";

export default function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const topic = slug ? getTopicBySlug(slug) : undefined;

  // Redirect to 404 if topic not found
  if (!topic) {
    return <Navigate to="/404" replace />;
  }

  useSEO({
    title: topic.metaTitle.replace(" | Writto", ""),
    description: topic.metaDescription,
    canonical: `/topics/${topic.slug}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: topic.metaTitle,
      description: topic.metaDescription,
      url: `https://writto.knotwith.com/topics/${topic.slug}`,
      provider: {
        "@type": "Organization",
        name: "Writto",
        url: "https://writto.knotwith.com",
      },
    },
  });

  return (
    <div className="min-h-screen bg-background paper-texture">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Writto" className="h-6 w-auto" />
          </Link>
          <Link
            to="/login"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
          >
            無料ではじめる
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-4xl px-6 pb-16 pt-16 sm:pt-20">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Target className="h-3.5 w-3.5" />
            {topic.category === "exam"
              ? "試験対策"
              : topic.category === "business"
                ? "ビジネス英語"
                : "日常英語"}
          </div>

          <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {topic.content.heading}
          </h1>

          <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
            {topic.content.intro}
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
          >
            Writtoで練習をはじめる
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/50 bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Writtoでできること</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {topic.content.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-background p-5"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Prompts Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <PenLine className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">練習できるお題の例</h2>
          </div>

          <div className="space-y-4">
            {topic.content.samplePrompts.map((prompt, index) => (
              <div
                key={index}
                className="rounded-xl border border-border/50 bg-muted/30 p-5"
              >
                <p className="text-foreground">「{prompt}」</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="border-t border-border/50 bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">学習のポイント</h2>
          </div>

          <div className="space-y-4">
            {topic.content.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {index + 1}
                </span>
                <p className="text-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-primary/5 to-transparent p-10">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-4 text-2xl font-semibold">
              今すぐライティング練習をはじめよう
            </h2>
            <p className="mb-8 text-muted-foreground">
              AIがあなたの英作文を即座に添削。
              <br className="hidden sm:block" />
              弱点を把握して効率的にレベルアップできます。
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              無料ではじめる
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with Trademark Notice */}
      <footer className="border-t border-border/50 bg-muted/30 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-6 flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              トップ
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
              料金
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground">
              Writtoについて
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground">
              よくある質問
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground">
              利用規約
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
              プライバシー
            </Link>
          </div>

          {/* Trademark Disclaimer */}
          <div className="mb-6 text-center text-xs text-muted-foreground/70 leading-relaxed">
            <p>
              ※ 本サービスは各試験の運営団体とは一切関係ありません。
            </p>
            <p className="mt-1">
              TOEIC®およびTOEFL®はETSの登録商標です。
              英検®は公益財団法人日本英語検定協会の登録商標です。
              IELTSはBritish Council、IDP、Cambridge Assessment Englishの共同所有です。
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Writto. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
