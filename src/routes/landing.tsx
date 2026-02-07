import { Link } from "react-router-dom";
import {
  PenLine,
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

// Animate benefits/outcomes instead of specific goals to be more inclusive
const FLIP_WORDS = ["楽しく", "着実に", "あなたのペースで", "AIと一緒に"];

const FEATURES = [
  {
    title: "パーソナライズされたお題",
    description:
      "ビジネス・旅行・日常会話など、あなたの目標と興味に合わせてAIがお題を生成。職業や学校、趣味まで考慮した「自分ごと」のお題で、モチベーションが続く学習を実現します。",
    icon: <Target className="h-8 w-8" />,
    full: true,
  },
  {
    title: "学習履歴 & 成長記録",
    description:
      "過去のライティングと添削結果をすべて記録。ランクの推移で成長を実感し、連続学習日数で習慣化をサポート。弱点を把握して効率的にレベルアップできます。",
    icon: <TrendingUp className="h-8 w-8" />,
    large: true,
  },
  {
    title: "4観点 × S〜Dランク評価",
    description:
      "文法・語彙・構成・内容の4つの観点で細かく評価。改善ポイントを具体的に提示します。",
    icon: <BarChart3 className="h-7 w-7" />,
    highlight: true,
  },
  {
    title: "単語帳 & 表現ノート",
    description:
      "添削で学んだ単語や表現をワンタップで保存。実践的な語彙力を蓄積できます。",
    icon: <BookOpen className="h-7 w-7" />,
  },
  {
    title: "4つのライティングモード",
    description:
      "目標特化・趣味・表現リクエスト・カスタムお題から選択。",
    icon: <Layers className="h-7 w-7" />,
    highlight: true,
  },
  {
    title: "すぐにフィードバック",
    description:
      "英文を送信するとAIが即座に添削。待ち時間なく学習を続けられます。",
    icon: <Zap className="h-7 w-7" />,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden paper-texture">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <PenLine className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">
              Kakeru
            </span>
          </div>
          <Link
            to="/login"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg btn-bounce"
          >
            はじめる
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI搭載の英語ライティング学習
          </div>

          {/* Text Generate Effect for main headline */}
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
            <TextGenerateEffect
              words="英語で「書ける」自分になる。"
              className="font-serif"
              duration={0.4}
            />
          </h1>

          {/* Description with Flip Words */}
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            <span className="inline-flex flex-wrap items-center justify-center gap-1">
              <FlipWords
                words={FLIP_WORDS}
                duration={2500}
                className="font-medium text-primary"
              />
              <span>英語ライティング力を伸ばす。</span>
            </span>
            <br />
            <span className="mt-2 block">
              ビジネス、旅行、試験対策など、あなたの目標に合わせてAIがサポートします。
            </span>
          </p>

          <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 btn-bounce"
            >
              無料で始める
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <span className="text-sm text-muted-foreground">
              Googleアカウントで簡単登録
            </span>
          </div>
        </div>
      </section>

      {/* Features - Bento Grid with Hover Effect */}
      <section className="border-t border-border/50 bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h2 className="font-serif text-3xl sm:text-4xl">Kakeruの特徴</h2>
            <p className="mt-3 text-muted-foreground">
              英語ライティングに特化した学習体験
            </p>
          </div>

          {/* Bento Grid with HoverEffect */}
          <div className="mt-16">
            <HoverEffect items={FEATURES} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="font-serif text-3xl sm:text-4xl">使い方はシンプル</h2>
          <p className="mt-3 text-muted-foreground">
            3ステップで英語ライティング学習
          </p>
        </div>

        <div className="relative mt-16">
          {/* Connection line (desktop) */}
          <div className="absolute left-0 right-0 top-[72px] hidden h-0.5 bg-gradient-to-r from-transparent via-border to-transparent sm:block" />

          <div className="grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="group relative">
              <div className="relative space-y-4 rounded-3xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-serif text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 sm:mx-0">
                  1
                </div>
                <h3 className="font-serif text-xl font-medium text-center sm:text-left">
                  お題を選ぶ
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground text-center sm:text-left">
                  4つのモードからお題を選択、またはAIに自動生成してもらいます
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative">
              <div className="relative space-y-4 rounded-3xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-accent/30 hover:shadow-xl">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent font-serif text-xl font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-transform duration-300 group-hover:scale-110 sm:mx-0">
                  2
                </div>
                <h3 className="font-serif text-xl font-medium text-center sm:text-left">
                  英語で書く
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground text-center sm:text-left">
                  お題に沿って英文を書きます。語数カウンターで目標語数を確認できます
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative">
              <div className="relative space-y-4 rounded-3xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-serif text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 sm:mx-0">
                  3
                </div>
                <h3 className="font-serif text-xl font-medium text-center sm:text-left">
                  AIが添削
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground text-center sm:text-left">
                  ランク評価・改善ポイント・模範解答がすぐに届きます
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-border/50 bg-gradient-to-b from-primary/[0.03] to-accent/[0.02]">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl">
            今日から、英語で書く力を伸ばそう
          </h2>
          <p className="mt-4 text-muted-foreground">
            無料プランで1日3回まで利用可能。
            <br />
            まずは気軽にお試しください。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 text-lg font-medium text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/30 btn-bounce"
            >
              無料で始める
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                登録無料
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                クレジットカード不要
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <PenLine className="h-4 w-4" />
                </div>
                <span className="font-serif font-medium">Kakeru</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AIを活用した英語ライティング学習サービス
              </p>
            </div>

            {/* Service Links */}
            <div>
              <h3 className="font-medium mb-4">サービス</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    料金プラン
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    Kakeruについて
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-medium mb-4">サポート</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    よくある質問
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    お問い合わせ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-medium mb-4">法的情報</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link to="/legal/commercial" className="text-muted-foreground hover:text-foreground transition-colors">
                    特定商取引法に基づく表記
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Kakeru. All rights reserved.
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
