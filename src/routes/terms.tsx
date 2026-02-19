import { Link } from "react-router-dom";
import { ArrowLeft, FileText, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSEO } from "@/hooks/use-seo";

export default function TermsPage() {
  useSEO({
    title: "利用規約",
    description: "Writtoの利用規約。サービスをご利用いただく際の条件をご確認ください。",
    canonical: "/terms",
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
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-3xl">利用規約</h1>
            <p className="text-sm text-muted-foreground">最終更新日: 2026年2月8日</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="rounded-2xl border border-border/60 bg-card p-8 space-y-8">
            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第1条（適用）</h2>
              <p className="text-muted-foreground leading-relaxed">
                本利用規約（以下「本規約」）は、Writto（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーは、本規約に同意の上、当サービスを利用するものとします。
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第2条（定義）</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                本規約において使用する用語の定義は、以下のとおりとします。
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>「ユーザー」:</strong> 当サービスを利用するすべての個人</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>「コンテンツ」:</strong> ユーザーが当サービスに投稿・入力するテキスト、データ等</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>「有料プラン」:</strong> 月額または年額の料金を支払うことで利用できるProプラン</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第3条（アカウント登録）</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>当サービスの利用には、Googleアカウントによる登録が必要です。</li>
                <li>ユーザーは、正確かつ最新の情報を提供する責任を負います。</li>
                <li>アカウントの管理責任はユーザーにあり、第三者への貸与・譲渡は禁止します。</li>
              </ol>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第4条（サービスの内容）</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                当サービスは、以下の機能を提供します。
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>AIを活用した英語ライティングのお題生成</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>AIによる英文添削・フィードバック</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>単語帳・学習履歴の管理</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>辞書・表現検索</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第5条（料金・支払い）</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>無料プランは、トークン使用量に制限があります。</li>
                <li>有料プラン（Proプラン）の料金は、料金ページに記載のとおりとします。</li>
                <li>支払いはクレジットカードにより行い、決済処理はStripe, Inc.を通じて安全に行われます。</li>
                <li>有料プランは解約するまで自動更新されます。解約は設定画面からいつでも可能です。</li>
                <li>いったん支払われた料金は、法令に定める場合を除き、返金いたしません。</li>
              </ol>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第6条（禁止事項）</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ユーザーは、以下の行為を行ってはなりません。
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>法令または公序良俗に違反する行為</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>当サービスの運営を妨害する行為</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>他のユーザーまたは第三者の権利を侵害する行為</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>不正アクセス、リバースエンジニアリング等の行為</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>当サービスを商業目的で利用する行為（許可なく）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>自動化ツールによる大量アクセス</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第7条（知的財産権）</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>当サービスに関する著作権、商標権その他の知的財産権は、運営者に帰属します。</li>
                <li>ユーザーが投稿したコンテンツの著作権はユーザーに帰属しますが、当サービスの運営・改善に利用することに同意するものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第8条（免責事項）</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>AIによる添削・フィードバックは参考情報であり、その正確性・完全性を保証するものではありません。</li>
                <li>当サービスは現状有姿で提供され、特定目的への適合性を保証しません。</li>
                <li>当サービスの利用により生じた損害について、運営者は故意または重過失がない限り責任を負いません。</li>
                <li>システム障害、メンテナンス等により、サービスが一時的に利用できない場合があります。</li>
              </ol>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第9条（サービスの変更・終了）</h2>
              <p className="text-muted-foreground leading-relaxed">
                運営者は、ユーザーへの事前通知により、当サービスの内容を変更し、または提供を終了することができます。サービス終了の場合、有料プランの未使用期間分については、合理的な方法により返金対応を行います。
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第10条（規約の変更）</h2>
              <p className="text-muted-foreground leading-relaxed">
                運営者は、必要に応じて本規約を変更することができます。変更後の規約は、当サービス上に掲載した時点で効力を生じます。重要な変更がある場合は、事前にお知らせします。
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第11条（準拠法・管轄）</h2>
              <p className="text-muted-foreground leading-relaxed">
                本規約の解釈および適用は日本法に準拠します。当サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">第12条（お問い合わせ）</h2>
              <p className="text-muted-foreground leading-relaxed">
                本規約に関するお問い合わせは、下記までご連絡ください。
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
