import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, PenLine, ChevronDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  // サービスについて
  {
    category: "サービスについて",
    question: "Writtoとはどのようなサービスですか？",
    answer: "Writtoは、AIを活用した英語ライティング学習サービスです。あなたの目標や興味に合わせたお題でライティング練習を行い、AIが即座に添削・フィードバックを提供します。文法・語彙・構成・内容の4軸で詳細な評価を受けられます。",
  },
  {
    category: "サービスについて",
    question: "どのようなレベルの学習者に向いていますか？",
    answer: "初級者から上級者まで、幅広いレベルの方にご利用いただけます。初回設定で選択したレベルに応じて、お題の難易度や推奨語数が自動調整されます。",
  },
  {
    category: "サービスについて",
    question: "スマートフォンでも使えますか？",
    answer: "はい、スマートフォンのブラウザからもご利用いただけます。ただし、長文の入力にはパソコンやタブレットの方が快適です。",
  },
  // 料金・プラン
  {
    category: "料金・プラン",
    question: "無料プランと有料プランの違いは何ですか？",
    answer: "無料プランでは20,000トークン（約6セッション分）をお試しいただけます。Proプランでは月間200万トークン、高精度モデル（GPT-4o）による添削、無制限の学習履歴・単語帳、手書き文字認識（OCR）機能をご利用いただけます。",
  },
  {
    category: "料金・プラン",
    question: "トークンとは何ですか？",
    answer: "トークンはAIが処理するテキストの単位です。添削1回で約2,500トークン、お題生成で約1,100トークンを消費します。Proプランのトークンは請求サイクルごとにリセットされます。",
  },
  {
    category: "料金・プラン",
    question: "Proプランの料金はいくらですか？",
    answer: "ローンチ記念価格（2026年5月末まで）として、月額プランは980円、年額プランは9,400円でご提供しています。通常価格は月額1,280円、年額9,800円です。期間中にご契約いただくとお得にご利用いただけます。",
  },
  {
    category: "料金・プラン",
    question: "いつでも解約できますか？",
    answer: "はい、いつでも解約可能です。設定画面の「サブスクリプションを管理」から手続きできます。解約後も、お支払い済みの期間が終了するまではサービスをご利用いただけます。",
  },
  {
    category: "料金・プラン",
    question: "支払い方法は何に対応していますか？",
    answer: "クレジットカード（Visa、Mastercard、American Express、JCB）に対応しています。決済はStripeを通じて安全に処理されます。",
  },
  // 機能について
  {
    category: "機能について",
    question: "どのようなライティングモードがありますか？",
    answer: "7つのモードがあります。「目標特化」はビジネス・試験など目標に直結するお題、「趣味・興味」は楽しく書けるテーマ、「ビジネス」「日常」「社会問題」はシーン別のお題、「表現リクエスト」は特定の英語表現を練習するモード、「カスタムお題」は自由にテーマを設定できるモードです。",
  },
  {
    category: "機能について",
    question: "添削ではどのようなフィードバックがもらえますか？",
    answer: "文法・語彙・構成・内容の4軸で評価され、S〜Dのランクが付きます。具体的な改善ポイント、より良い表現の提案、模範解答も提供されます。添削結果についてAIに追加で質問することもできます。",
  },
  {
    category: "機能について",
    question: "単語帳機能について教えてください",
    answer: "添削結果画面から気になる単語や表現をワンタップで保存できます。保存した単語は「単語帳」ページでいつでも確認・復習できます。無料プランでは50件まで、Proプランでは無制限に保存できます。",
  },
  {
    category: "機能について",
    question: "手書き文字認識（OCR）とは何ですか？",
    answer: "Proプラン限定の機能です。手書きのノートや紙に書いた英文を撮影してアップロードすると、AIがテキストに変換します。紙で下書きしてからデジタルで添削を受けたい方に便利です。",
  },
  // アカウント
  {
    category: "アカウント",
    question: "アカウントを削除するにはどうすればいいですか？",
    answer: "設定画面の最下部にある「アカウント削除」から削除できます。削除すると、すべての学習データが完全に削除され、復元できませんのでご注意ください。",
  },
  {
    category: "アカウント",
    question: "Googleアカウント以外でログインできますか？",
    answer: "現在はGoogleアカウントのみに対応しています。",
  },
  {
    category: "アカウント",
    question: "データはどのように保護されていますか？",
    answer: "データはGoogle Cloud（Firebase）上に安全に保存されています。通信はすべてSSL/TLSで暗号化され、決済情報はStripeが安全に管理します。また、OpenAI APIの規約により、API経由で送信されたデータはOpenAIのモデル学習に使用されません（参照: openai.com/policies/row-terms）。",
  },
];

const CATEGORIES = [...new Set(FAQ_ITEMS.map((item) => item.category))];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-primary"
      >
        <span className="font-medium pr-4">{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl">よくある質問</h1>
          <p className="mt-2 text-muted-foreground">
            Writtoについてのよくあるご質問にお答えします
          </p>
        </div>

        {/* FAQ by Category */}
        <div className="space-y-8">
          {CATEGORIES.map((category) => {
            const categoryItems = FAQ_ITEMS.filter((item) => item.category === category);
            const startIndex = FAQ_ITEMS.findIndex((item) => item.category === category);

            return (
              <div key={category}>
                <h2 className="font-serif text-xl mb-4 flex items-center gap-2">
                  <span className="h-1 w-6 rounded-full bg-primary" />
                  {category}
                </h2>
                <div className="rounded-2xl border border-border/60 bg-card px-6">
                  {categoryItems.map((item, idx) => (
                    <FAQAccordion
                      key={startIndex + idx}
                      item={item}
                      isOpen={openIndex === startIndex + idx}
                      onToggle={() => handleToggle(startIndex + idx)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/[0.02] p-8 text-center">
          <h2 className="font-serif text-xl mb-2">解決しませんでしたか？</h2>
          <p className="text-muted-foreground mb-6">
            お気軽にお問い合わせください
          </p>
          <Button asChild>
            <Link to="/contact" className="gap-2">
              <Mail className="h-4 w-4" />
              お問い合わせ
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
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
