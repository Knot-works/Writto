import { Link } from "react-router-dom";
import { ArrowLeft, Target, Heart, Sparkles, Users } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VALUES = [
  {
    icon: Target,
    title: "パーソナライズ",
    description: "一人ひとりの目標と興味に合わせた学習体験を提供します",
  },
  {
    icon: Sparkles,
    title: "AI × 人間らしさ",
    description: "最新のAI技術を活用しながら、温かみのあるフィードバックを大切にします",
  },
  {
    icon: Heart,
    title: "継続しやすさ",
    description: "無理なく続けられる仕組みで、着実なスキルアップをサポートします",
  },
];

export default function AboutPage() {
  useSEO({
    title: "Writtoについて",
    description: "Writtoは「書ける」自分になるためのAI英語ライティング学習サービス。一人ひとりの目標と興味に合わせた学習体験を提供します。",
    canonical: "/about",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Writto" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                トップへ戻る
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
            「書ける」自分になるための、AI英語ライティング学習サービス
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Mission */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            ミッション
          </h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                英語で「書く」力は、グローバル社会で活躍するための重要なスキルです。
                しかし、多くの人が「何を書けばいいかわからない」「添削してくれる人がいない」という壁に直面しています。
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Writtoは、AIの力を借りて、一人ひとりに最適な学習体験を提供することで、
                誰もが英語で自分の考えを表現できるようになることを目指しています。
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Why Writto */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            Writtoが目指すこと
          </h2>
          <Card>
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">学習のハードルを下げる</h3>
                <p className="text-muted-foreground leading-relaxed">
                  語学学習において、モチベーションの維持は最も重要な課題の一つです。
                  興味のないトピックで学習を続けることは難しく、多くの人が途中で挫折してしまいます。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">AIによるパーソナライズ</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Writtoは、AIを活用して一人ひとりの趣味・興味・状況に合わせたお題を生成します。
                  自分に関係のあるトピックだからこそ「書きたい」と思え、学習が続けられる。
                  そんな体験を提供したいと考えています。
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            大切にしていること
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
            名前の由来
          </h2>
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <p className="text-2xl font-serif mb-2">Writto（リット）</p>
                <p className="text-muted-foreground">
                  <span className="text-primary font-medium">Write</span> +{" "}
                  <span className="text-primary font-medium">Jot down</span>（さっと書き留める）の造語
                </p>
              </div>
              <p className="text-muted-foreground">
                隙間時間に「ちょっと書こう」と思えるような、気軽さを大切にしています。
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Service Info */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl mb-6 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            サービス概要
          </h2>
          <Card>
            <CardContent className="p-8">
              <dl className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:gap-8">
                  <dt className="font-medium text-muted-foreground sm:w-32 shrink-0 mb-1 sm:mb-0">
                    サービス名
                  </dt>
                  <dd>Writto（リット）</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-8">
                  <dt className="font-medium text-muted-foreground sm:w-32 shrink-0 mb-1 sm:mb-0">
                    サービス開始
                  </dt>
                  <dd>2026年2月</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-8">
                  <dt className="font-medium text-muted-foreground sm:w-32 shrink-0 mb-1 sm:mb-0">
                    運営
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
                    お問い合わせ
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
          <h2 className="font-serif text-xl mb-2">Writtoを始めてみませんか？</h2>
          <p className="text-muted-foreground mb-6">
            無料で始められます。まずはお試しください。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/login" className="gap-2">
                <Sparkles className="h-4 w-4" />
                無料で始める
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/pricing">料金プランを見る</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center">
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
