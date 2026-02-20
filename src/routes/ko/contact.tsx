import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, PenLine, Copy, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/contexts/auth-context";
import { useSEO } from "@/hooks/use-seo";

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

const DEFAULT_SUBJECT = "Writto 문의";

export default function ContactPageKo() {
  useSEO({
    title: "문의하기",
    description: "Writto 문의. 질문, 요청, 버그 신고 등 편하게 연락해 주세요.",
    canonical: "/ko/contact",
  });

  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const browserInfo = useMemo(() => getBrowserInfo(), []);
  const uid = user?.uid ?? "로그인하지 않음";

  const template = useMemo(() => {
    const lines = [
      "## 문제 설명",
      "(문제의 상세 내용을 작성해 주세요)",
      "",
      "## 재현 절차",
      "1. ",
      "2. ",
      "3. ",
      "",
      "## 상세 정보 (수정하지 마세요)",
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
          <Link to="/ko" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <PenLine className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-medium">Writto</span>
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

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl">문의하기</h1>
          <p className="mt-2 text-muted-foreground">
            질문이나 의견이 있으시면 편하게 연락해 주세요
          </p>
        </div>

        {/* Template Section */}
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-serif text-xl mb-4">문의 템플릿</h2>
            <p className="text-sm text-muted-foreground mb-6">
              아래 템플릿을 복사하여 이메일에 붙여넣어 주세요
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
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    복사
                  </>
                )}
              </Button>
            </div>

            {/* Send Email Button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <a href={mailtoLink} className="gap-2">
                  <Mail className="h-4 w-4" />
                  이메일 앱으로 열기
                </a>
              </Button>
              <Button variant="outline" onClick={handleCopy} className="flex-1 gap-2">
                <Copy className="h-4 w-4" />
                템플릿 복사
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Direct Email */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-card to-primary/[0.02]">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              또는 직접 이메일 보내기
            </p>
            <a
              href="mailto:support@knotwith.com"
              className="inline-flex items-center gap-2 text-xl font-medium text-primary hover:underline"
            >
              <Mail className="h-5 w-5" />
              support@knotwith.com
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              보통 2~3영업일 이내에 답변드립니다
            </p>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-lg font-medium mb-4">문의 시 부탁드리는 사항</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>가능한 한 구체적인 상황을 알려주세요 (오류가 발생한 경우 오류 메시지도 포함해 주세요)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>템플릿의 "상세 정보"는 지원에 도움이 되는 정보입니다. 삭제하지 않고 보내주세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>재현 절차가 있는 경우 가능한 한 상세히 작성해 주세요</span>
            </li>
          </ul>
        </div>

        {/* FAQ Link */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-3">
            문의하기 전에 자주 묻는 질문도 확인해 주세요
          </p>
          <Button variant="outline" asChild>
            <Link to="/ko/faq" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              자주 묻는 질문 보기
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link to="/ko" className="flex items-center gap-2">
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
