import { Link } from "react-router-dom";
import { ArrowLeft, Target, Heart, Sparkles, Users } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VALUES = [
  {
    icon: Target,
    title: "개인화",
    description: "개인의 목표와 관심사에 맞춘 학습 경험을 제공합니다",
  },
  {
    icon: Sparkles,
    title: "AI × 인간미",
    description: "최신 AI 기술을 활용하면서도 따뜻한 피드백을 중요시합니다",
  },
  {
    icon: Heart,
    title: "지속 가능성",
    description: "무리 없이 계속할 수 있는 시스템으로 꾸준한 실력 향상을 지원합니다",
  },
];

export default function AboutPageKo() {
  useSEO({
    title: "Writto 소개",
    description: "Writto는 '쓸 수 있는' 자신이 되기 위한 AI 영어 라이팅 학습 서비스. 개인의 목표와 관심사에 맞춘 학습 경험을 제공합니다.",
    canonical: "/ko/about",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/ko" className="flex items-center">
            <img src="/logo.png" alt="Writto" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/ko" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                홈으로
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Writto" className="h-14 sm:h-16 w-auto" />
          </div>
          <p className="mt-4 text-center text-lg text-muted-foreground max-w-2xl mx-auto">
            "쓸 수 있는" 자신이 되기 위한 AI 영어 라이팅 학습 서비스
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Mission */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            미션
          </h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                영어로 "쓰는" 능력은 글로벌 사회에서 활약하기 위한 중요한 스킬입니다.
                하지만 많은 사람들이 "무엇을 써야 할지 모르겠다", "첨삭해 줄 사람이 없다"는 벽에 부딪히고 있습니다.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Writto는 AI의 힘을 빌려 개인에게 최적화된 학습 경험을 제공함으로써,
                누구나 영어로 자신의 생각을 표현할 수 있게 되는 것을 목표로 합니다.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Why Writto */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            Writto가 지향하는 것
          </h2>
          <Card>
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">학습의 허들을 낮추기</h3>
                <p className="text-muted-foreground leading-relaxed">
                  어학 학습에서 동기 부여 유지는 가장 중요한 과제 중 하나입니다.
                  관심 없는 주제로 학습을 계속하기는 어렵고, 많은 사람들이 중간에 포기하게 됩니다.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">AI를 통한 개인화</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Writto는 AI를 활용하여 개인의 취미·관심사·상황에 맞는 주제를 생성합니다.
                  자신과 관련된 주제이기 때문에 "쓰고 싶다"는 마음이 생기고, 학습을 계속할 수 있습니다.
                  그런 경험을 제공하고 싶습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            소중히 여기는 것
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map((value, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-medium mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Name Origin */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            이름의 유래
          </h2>
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <p className="text-2xl font-serif mb-2">Writto (릿토)</p>
                <p className="text-muted-foreground">
                  <span className="text-primary font-medium">Write</span> +{" "}
                  <span className="text-primary font-medium">Jot down</span>(간단히 적어두다)의 조어
                </p>
              </div>
              <p className="text-muted-foreground">
                틈새 시간에 "잠깐 써볼까"라고 생각할 수 있는 가벼움을 소중히 여기고 있습니다.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Service Info */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            서비스 개요
          </h2>
          <Card>
            <CardContent className="p-8">
              <dl className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:gap-8">
                  <dt className="font-medium text-muted-foreground sm:w-32 shrink-0 mb-1 sm:mb-0">
                    서비스명
                  </dt>
                  <dd>Writto (릿토)</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-8">
                  <dt className="font-medium text-muted-foreground sm:w-32 shrink-0 mb-1 sm:mb-0">
                    서비스 시작
                  </dt>
                  <dd>2026년 2월</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-8">
                  <dt className="font-medium text-muted-foreground sm:w-32 shrink-0 mb-1 sm:mb-0">
                    운영
                  </dt>
                  <dd>
                    <a
                      href="https://knotwith.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      knot
                    </a>
                  </dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-8">
                  <dt className="font-medium text-muted-foreground sm:w-32 shrink-0 mb-1 sm:mb-0">
                    문의
                  </dt>
                  <dd>
                    <a href="mailto:support@knotwith.com" className="text-primary hover:underline">
                      support@knotwith.com
                    </a>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/[0.02] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-serif text-xl mb-2">Writto를 시작해 보시겠어요?</h2>
          <p className="text-muted-foreground mb-6">
            무료로 시작할 수 있습니다. 먼저 체험해 보세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/login" className="gap-2">
                <Sparkles className="h-4 w-4" />
                무료로 시작하기
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/ko/pricing">요금 플랜 보기</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link to="/ko" className="flex items-center">
            <img src="/logo.png" alt="Writto" className="h-7 w-auto" />
          </Link>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Writto
          </p>
        </div>
      </footer>
    </div>
  );
}
