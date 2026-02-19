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
import { LanguageSwitcher } from "@/components/language-switcher";
import { getTopicKoBySlug } from "@/data/topics-ko";
import { getTopicBySlug } from "@/data/topics";

export default function TopicPageKo() {
  const { slug } = useParams<{ slug: string }>();
  const topic = slug ? getTopicKoBySlug(slug) : undefined;

  // Redirect to 404 if topic not found
  if (!topic) {
    return <Navigate to="/404" replace />;
  }

  // Get Japanese equivalent for hreflang
  const jaTopic = topic.jaSlug ? getTopicBySlug(topic.jaSlug) : undefined;

  useSEO({
    title: topic.metaTitle.replace(" | Writto", ""),
    description: topic.metaDescription,
    canonical: `/ko/topics/${topic.slug}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: topic.metaTitle,
      description: topic.metaDescription,
      url: `https://writto.knotwith.com/ko/topics/${topic.slug}`,
      inLanguage: "ko",
      provider: {
        "@type": "Organization",
        name: "Writto",
        url: "https://writto.knotwith.com",
      },
    },
    hreflang: jaTopic
      ? [
          { lang: "ko", url: `/ko/topics/${topic.slug}` },
          { lang: "ja", url: `/topics/${jaTopic.slug}` },
          { lang: "x-default", url: `/topics/${jaTopic.slug}` },
        ]
      : [{ lang: "ko", url: `/ko/topics/${topic.slug}` }],
  });

  return (
    <div className="min-h-screen bg-background paper-texture">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/ko" className="flex items-center gap-2">
            <img src="/logo.png" alt="Writto" className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-4xl px-6 pb-16 pt-16 sm:pt-20">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Target className="h-3.5 w-3.5" />
            {topic.category === "exam"
              ? "시험 대비"
              : topic.category === "business"
                ? "비즈니스 영어"
                : "일상 영어"}
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
            Writto로 연습 시작하기
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
            <h2 className="text-2xl font-semibold">Writto로 할 수 있는 것</h2>
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
            <h2 className="text-2xl font-semibold">연습할 수 있는 주제 예시</h2>
          </div>

          <div className="space-y-4">
            {topic.content.samplePrompts.map((prompt, index) => (
              <div
                key={index}
                className="rounded-xl border border-border/50 bg-muted/30 p-5"
              >
                <p className="text-foreground">"{prompt}"</p>
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
            <h2 className="text-2xl font-semibold">학습 포인트</h2>
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
              지금 바로 라이팅 연습을 시작하세요
            </h2>
            <p className="mb-8 text-muted-foreground">
              AI가 당신의 영작문을 즉시 첨삭해 드립니다.
              <br className="hidden sm:block" />
              약점을 파악하고 효율적으로 레벨업하세요.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with Trademark Notice */}
      <footer className="border-t border-border/50 bg-muted/30 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-6 flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/ko" className="text-muted-foreground hover:text-foreground">
              홈
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
              요금
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground">
              Writto 소개
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground">
              자주 묻는 질문
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground">
              이용약관
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
              개인정보처리방침
            </Link>
          </div>

          {/* Trademark Disclaimer */}
          <div className="mb-6 text-center text-xs text-muted-foreground/70 leading-relaxed">
            <p>※ 본 서비스는 각 시험 운영 기관과 관련이 없습니다.</p>
            <p className="mt-1">
              TOEIC® 및 TOEFL®은 ETS의 등록 상표입니다. IELTS는 British Council,
              IDP, Cambridge Assessment English의 공동 소유입니다.
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
