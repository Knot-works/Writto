import { Link } from "react-router-dom";
import {
  Target,
  BookOpen,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Layers,
  Zap,
} from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FlipWords } from "@/components/ui/flip-words";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSEO } from "@/hooks/use-seo";

const FLIP_WORDS = ["즐겁게", "꾸준히", "나만의 속도로", "AI와 함께"];

const FEATURES = [
  {
    title: "맞춤형 주제 생성",
    description:
      "비즈니스, 여행, 일상 회화 등 당신의 목표와 관심사에 맞춰 AI가 주제를 생성합니다. 직업, 학교, 취미까지 고려한 '나만의' 주제로 동기 부여가 지속되는 학습을 실현합니다.",
    icon: <Target className="h-8 w-8" />,
    full: true,
  },
  {
    title: "학습 이력 & 성장 기록",
    description:
      "과거의 라이팅과 첨삭 결과를 모두 기록합니다. 랭크 추이로 성장을 실감하고, 연속 학습일로 습관화를 지원합니다.",
    icon: <TrendingUp className="h-8 w-8" />,
    large: true,
  },
  {
    title: "4가지 관점 × S~D 랭크 평가",
    description:
      "문법, 어휘, 구성, 내용의 4가지 관점에서 세밀하게 평가합니다. 개선 포인트를 구체적으로 제시합니다.",
    icon: <BarChart3 className="h-7 w-7" />,
    highlight: true,
  },
  {
    title: "단어장 & 표현 노트",
    description:
      "첨삭에서 배운 단어와 표현을 원탭으로 저장. 실전적인 어휘력을 쌓을 수 있습니다.",
    icon: <BookOpen className="h-7 w-7" />,
  },
  {
    title: "4가지 라이팅 모드",
    description:
      "목표 특화, 취미, 표현 요청, 커스텀 주제 중에서 선택할 수 있습니다.",
    icon: <Layers className="h-7 w-7" />,
    highlight: true,
  },
  {
    title: "즉각적인 피드백",
    description:
      "영문을 제출하면 AI가 즉시 첨삭합니다. 대기 시간 없이 학습을 이어갈 수 있습니다.",
    icon: <Zap className="h-7 w-7" />,
  },
];

export default function LandingPageKo() {
  useSEO({
    title: "AI 영어 라이팅 학습",
    description:
      "AI가 당신에게 맞는 주제를 생성하고 영작문을 즉시 첨삭합니다. 비즈니스, 여행, 시험 대비 등 목표에 맞춰 실용적인 영어 라이팅 실력을 키우세요.",
    canonical: "/ko",
    hreflang: [
      { lang: "ko", url: "/ko" },
      { lang: "ja", url: "/" },
      { lang: "x-default", url: "/" },
    ],
  });

  return (
    <div className="min-h-screen overflow-hidden paper-texture">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Writto" className="h-6 w-auto" />
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg btn-bounce"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI 기반 영어 라이팅 학습
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl leading-tight">
            <TextGenerateEffect
              words="영어로 '쓸 수 있는' 나를 만들다."
              className="font-serif"
              duration={0.4}
            />
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground text-center">
            <span className="inline-flex flex-wrap items-center justify-center gap-1">
              <FlipWords
                words={FLIP_WORDS}
                duration={2500}
                className="font-medium text-primary"
              />
              <span>영어 라이팅 실력을 키우세요.</span>
            </span>
            <br />
            <span>
              토익, 토플 대비부터 비즈니스, 여행까지, 당신의 목표에 맞춰 AI가 서포트합니다.
            </span>
          </p>

          <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 btn-bounce"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <span className="text-sm text-muted-foreground">
              Google 계정으로 간편 가입
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h2 className="font-serif text-3xl sm:text-4xl">Writto의 특징</h2>
            <p className="mt-3 text-muted-foreground">
              영어 라이팅에 특화된 학습 경험
            </p>
          </div>

          <div className="mt-16">
            <HoverEffect items={FEATURES} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="font-serif text-3xl sm:text-4xl">사용법은 간단합니다</h2>
          <p className="mt-3 text-muted-foreground">
            3단계로 영어 라이팅 학습
          </p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-[72px] hidden h-0.5 bg-gradient-to-r from-transparent via-border to-transparent sm:block" />

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="group relative">
              <div className="relative space-y-4 rounded-3xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-serif text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 sm:mx-0">
                  1
                </div>
                <h3 className="font-serif text-xl font-medium text-center sm:text-left">
                  주제 선택
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground text-center sm:text-left">
                  4가지 모드에서 주제를 선택하거나 AI가 자동 생성합니다
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="relative space-y-4 rounded-3xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-accent/30 hover:shadow-xl">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent font-serif text-xl font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-transform duration-300 group-hover:scale-110 sm:mx-0">
                  2
                </div>
                <h3 className="font-serif text-xl font-medium text-center sm:text-left">
                  영어로 작성
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground text-center sm:text-left">
                  주제에 맞게 영문을 작성합니다. 단어 수 카운터로 목표 단어 수를 확인할 수 있습니다
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="relative space-y-4 rounded-3xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-serif text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 sm:mx-0">
                  3
                </div>
                <h3 className="font-serif text-xl font-medium text-center sm:text-left">
                  AI 첨삭
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground text-center sm:text-left">
                  랭크 평가, 개선 포인트, 모범 답안이 즉시 도착합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-border/50 bg-gradient-to-b from-primary/[0.03] to-accent/[0.02]">
        <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl">
            오늘부터 영어 라이팅 실력을 키우세요
          </h2>
          <p className="mt-4 text-muted-foreground">
            무료 플랜으로 먼저 체험해 보세요.
            <br />
            마음에 드시면 Pro 플랜으로 업그레이드하세요.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 text-lg font-medium text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 btn-bounce"
            >
              무료로 시작하기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                가입 무료
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                신용카드 불필요
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Writto" className="h-6 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                AI를 활용한 영어 라이팅 학습 서비스
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4">서비스</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    요금 플랜
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    Writto 소개
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">지원</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    문의하기
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">법적 정보</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Writto. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with passion for language learners
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
