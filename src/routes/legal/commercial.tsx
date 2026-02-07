import { Link } from "react-router-dom";
import { ArrowLeft, Scale, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommercialPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PenLine className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-medium">Kakeru</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              トップへ戻る
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl">特定商取引法に基づく表記</h1>
            <p className="text-sm text-muted-foreground">最終更新日: 2026年2月8日</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-border/60">
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  販売事業者名
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  個人事業（Kakeru運営）
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  運営責任者
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  請求があった場合、遅滞なく開示いたします
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  所在地
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  請求があった場合、遅滞なく開示いたします
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  電話番号
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  請求があった場合、遅滞なく開示いたします
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  メールアドレス
                </th>
                <td className="px-6 py-4">
                  <a href="mailto:support@knotwith.com" className="text-primary hover:underline">
                    support@knotwith.com
                  </a>
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  販売価格
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  <p>Proプラン月額: 980円（税込）</p>
                  <p>Proプラン年額: 9,400円（税込）</p>
                  <p className="mt-2 text-sm">※ 無料プランは0円でご利用いただけます</p>
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  販売価格以外の費用
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  インターネット接続料金、通信料金はお客様のご負担となります
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  支払方法
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  クレジットカード（Visa、Mastercard、American Express、JCB）
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  支払時期
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  月額プラン: 毎月の契約日に自動課金<br />
                  年額プラン: 契約時および1年ごとの契約更新日に自動課金
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  サービス提供時期
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  お支払い確認後、即時
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  返品・キャンセル
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  <p>デジタルコンテンツの性質上、お支払い後の返金は原則としてお受けできません。</p>
                  <p className="mt-2">サービスの解約はいつでも可能です。解約後も契約期間終了までサービスをご利用いただけます。</p>
                </td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <th className="bg-muted/30 px-6 py-4 text-left font-medium sm:w-48">
                  動作環境
                </th>
                <td className="px-6 py-4 text-muted-foreground">
                  <p>推奨ブラウザ: Google Chrome、Safari、Firefox、Microsoft Edge（いずれも最新版）</p>
                  <p className="mt-2 text-sm">※ JavaScript が有効である必要があります</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-lg font-medium mb-3">お問い合わせ</h2>
          <p className="text-sm text-muted-foreground">
            ご不明な点がございましたら、下記メールアドレスまでお問い合わせください。
          </p>
          <p className="mt-3">
            <a href="mailto:support@knotwith.com" className="text-primary hover:underline">
              support@knotwith.com
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <PenLine className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-sm font-medium">Kakeru</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Kakeru
          </p>
        </div>
      </footer>
    </div>
  );
}
