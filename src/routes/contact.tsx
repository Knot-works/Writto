import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, PenLine, Copy, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";

  // Detect browser
  if (ua.includes("Firefox/")) {
    browser = "Firefox";
  } else if (ua.includes("Edg/")) {
    browser = "Edge";
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    browser = "Safari";
  }

  // Detect OS
  if (ua.includes("Windows")) {
    os = "Windows";
  } else if (ua.includes("Mac OS X")) {
    os = "macOS";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("Android")) {
    os = "Android";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
  }

  return `${browser} / ${os}`;
}

const DEFAULT_SUBJECT = "Kakeruに関するお問い合わせ";

export default function ContactPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const browserInfo = useMemo(() => getBrowserInfo(), []);
  const uid = user?.uid ?? "未ログイン";

  const template = useMemo(() => {
    const lines = [
      "## Description of the issue",
      "(問題の詳細を記載してください)",
      "",
      "## Steps to reproduce the issue",
      "1. ",
      "2. ",
      "3. ",
      "",
      "## Detailed data (Do not edit)",
      `WebApp: ${browserInfo}`,
      `UID: ${uid}`,
    ];
    return lines.join("\n");
  }, [browserInfo, uid]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = template;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mailtoLink = useMemo(() => {
    return `mailto:support@knotwith.com?subject=${encodeURIComponent(DEFAULT_SUBJECT)}&body=${encodeURIComponent(template)}`;
  }, [template]);

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
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl">お問い合わせ</h1>
          <p className="mt-2 text-muted-foreground">
            ご質問やご意見がございましたら、お気軽にご連絡ください
          </p>
        </div>

        {/* Template Section */}
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-serif text-xl mb-4">お問い合わせテンプレート</h2>
            <p className="text-sm text-muted-foreground mb-6">
              以下のテンプレートをコピーしてメールに貼り付けてください
            </p>

            {/* Template Preview */}
            <div className="relative">
              <pre className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                {template}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-3 right-3 gap-1.5"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    コピーしました
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    コピー
                  </>
                )}
              </Button>
            </div>

            {/* Send Email Button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <a href={mailtoLink} className="gap-2">
                  <Mail className="h-4 w-4" />
                  メールアプリで開く
                </a>
              </Button>
              <Button variant="outline" onClick={handleCopy} className="flex-1 gap-2">
                <Copy className="h-4 w-4" />
                テンプレートをコピー
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Direct Email */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-card to-primary/[0.02]">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              または、直接メールを送信
            </p>
            <a
              href="mailto:support@knotwith.com"
              className="inline-flex items-center gap-2 text-xl font-medium text-primary hover:underline"
            >
              <Mail className="h-5 w-5" />
              support@knotwith.com
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              通常、2〜3営業日以内にご返信いたします
            </p>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-lg font-medium mb-4">お問い合わせの際のお願い</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>できるだけ具体的な状況をお知らせください（エラーが発生した場合は、エラーメッセージも含めてください）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>テンプレートの「Detailed data」はサポートに役立つ情報です。削除せずにお送りください</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>再現手順がある場合は、できるだけ詳しくお書きください</span>
            </li>
          </ul>
        </div>

        {/* FAQ Link */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-3">
            お問い合わせの前に、よくある質問もご確認ください
          </p>
          <Button variant="outline" asChild>
            <Link to="/faq" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              よくある質問を見る
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
