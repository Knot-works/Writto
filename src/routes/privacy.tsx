import { Link } from "react-router-dom";
import { ArrowLeft, Shield, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSEO } from "@/hooks/use-seo";

export default function PrivacyPage() {
  useSEO({
    title: "プライバシーポリシー",
    description: "Writtoのプライバシーポリシー。個人情報の取り扱いについてご説明します。",
    canonical: "/privacy",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PenLine className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-medium">Writto</span>
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

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-3xl">プライバシーポリシー</h1>
            <p className="text-sm text-muted-foreground">最終更新日: 2026年2月8日</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="rounded-2xl border border-border/60 bg-card p-8 space-y-8">
            <section>
              <h2 className="font-serif text-xl font-medium mb-4">1. はじめに</h2>
              <p className="text-muted-foreground leading-relaxed">
                Writto（以下「当サービス」）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーは、当サービスにおける個人情報の取り扱いについて説明します。
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">2. 収集する情報</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                当サービスでは、以下の情報を収集することがあります。
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>アカウント情報:</strong> Googleアカウントによる認証時に取得する氏名、メールアドレス、プロフィール画像</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>プロフィール情報:</strong> 学習目標、レベル、興味・関心、職業・学校情報など、ユーザーが任意で入力する情報</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>学習データ:</strong> ライティング履歴、添削結果、単語帳、学習統計</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>利用状況:</strong> サービスの利用履歴、アクセスログ</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">3. 情報の利用目的</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                収集した情報は、以下の目的で利用します。
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>サービスの提供・運営・改善</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>パーソナライズされた学習体験の提供</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>ユーザーサポートの提供</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>サービスに関する重要なお知らせの送信</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">4. 情報の共有</h2>
              <p className="text-muted-foreground leading-relaxed">
                当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
              </p>
              <ul className="space-y-2 text-muted-foreground mt-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>ユーザーの同意がある場合</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>法令に基づく場合</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>サービス提供に必要な業務委託先（Firebase、OpenAI等）への提供</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">5. 外部サービスの利用</h2>
              <p className="text-muted-foreground leading-relaxed">
                当サービスでは、以下の外部サービスを利用しています。各サービスのプライバシーポリシーもご確認ください。
              </p>
              <ul className="space-y-2 text-muted-foreground mt-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Google Firebase:</strong> 認証、データベース、ホスティング</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Google Analytics:</strong> サービスの利用状況分析（匿名化されたデータ）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>OpenAI:</strong> AIによる添削・お題生成機能（APIを使用しており、送信されたデータはOpenAIのモデル学習に使用されません）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Stripe:</strong> 決済処理（クレジットカード情報は当サービスでは保持せず、Stripeが安全に管理します）</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">6. データの保護</h2>
              <p className="text-muted-foreground leading-relaxed">
                当サービスは、ユーザーの個人情報を適切に管理し、不正アクセス、紛失、破壊、改ざん、漏洩などを防止するため、必要かつ適切なセキュリティ対策を実施しています。
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">7. ユーザーの権利</h2>
              <p className="text-muted-foreground leading-relaxed">
                ユーザーは、自身の個人情報について、開示・訂正・削除を請求する権利を有します。アカウント削除は設定画面から行うことができます。その他のご要望は、下記お問い合わせ先までご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">8. ポリシーの変更</h2>
              <p className="text-muted-foreground leading-relaxed">
                本ポリシーは、法令の改正やサービスの変更に伴い、予告なく変更されることがあります。重要な変更がある場合は、サービス内でお知らせします。
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">9. お問い合わせ</h2>
              <p className="text-muted-foreground leading-relaxed">
                本ポリシーに関するお問い合わせは、下記までご連絡ください。
              </p>
              <div className="mt-4 rounded-xl bg-muted/50 p-4">
                <p className="text-sm">
                  <strong>メールアドレス:</strong>{" "}
                  <a href="mailto:support@knotwith.com" className="text-primary hover:underline">
                    support@knotwith.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <PenLine className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-base font-medium">Writto</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Writto
          </p>
        </div>
      </footer>
    </div>
  );
}
