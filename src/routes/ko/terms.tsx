import { Link } from "react-router-dom";
import { ArrowLeft, FileText, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSEO } from "@/hooks/use-seo";

export default function TermsPageKo() {
  useSEO({
    title: "이용약관",
    description: "Writto 이용약관. 서비스 이용 시 조건을 확인해 주세요.",
    canonical: "/ko/terms",
  });

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
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-3xl">이용약관</h1>
            <p className="text-sm text-muted-foreground">최종 업데이트: 2026년 2월 8일</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="rounded-2xl border border-border/60 bg-card p-8 space-y-8">
            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제1조 (적용)</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 이용약관(이하 "본 약관")은 Writto(이하 "본 서비스")의 이용에 관한 조건을 정하는 것입니다. 사용자는 본 약관에 동의한 후 본 서비스를 이용하는 것으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제2조 (정의)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>"사용자":</strong> 본 서비스를 이용하는 모든 개인</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>"콘텐츠":</strong> 사용자가 본 서비스에 게시·입력하는 텍스트, 데이터 등</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>"유료 플랜":</strong> 월액 또는 연액 요금을 지불하여 이용할 수 있는 Pro 플랜</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제3조 (계정 등록)</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>본 서비스 이용에는 Google 계정을 통한 등록이 필요합니다.</li>
                <li>사용자는 정확하고 최신의 정보를 제공할 책임이 있습니다.</li>
                <li>계정 관리 책임은 사용자에게 있으며, 제3자에게 대여·양도하는 것은 금지됩니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제4조 (서비스 내용)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                본 서비스는 다음의 기능을 제공합니다.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>AI를 활용한 영어 라이팅 주제 생성</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>AI에 의한 영문 첨삭·피드백</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>단어장·학습 기록 관리</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>사전·표현 검색</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제5조 (요금·결제)</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>무료 플랜은 토큰 사용량에 제한이 있습니다.</li>
                <li>유료 플랜(Pro 플랜) 요금은 요금 페이지에 기재된 대로 적용됩니다.</li>
                <li>결제는 신용카드로 이루어지며, 결제 처리는 Stripe, Inc.를 통해 안전하게 진행됩니다.</li>
                <li>유료 플랜은 해지할 때까지 자동 갱신됩니다. 해지는 설정 화면에서 언제든지 가능합니다.</li>
                <li>한번 지불된 요금은 법령에서 정하는 경우를 제외하고 환불되지 않습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제6조 (금지사항)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                사용자는 다음 행위를 해서는 안 됩니다.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>법령 또는 공서양속에 위반되는 행위</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>본 서비스의 운영을 방해하는 행위</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>다른 사용자 또는 제3자의 권리를 침해하는 행위</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>불법 접근, 리버스 엔지니어링 등의 행위</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>본 서비스를 상업 목적으로 이용하는 행위(허가 없이)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  <span>자동화 도구를 통한 대량 접근</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제7조 (지적재산권)</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>본 서비스에 관한 저작권, 상표권 및 기타 지적재산권은 운영자에게 귀속됩니다.</li>
                <li>사용자가 게시한 콘텐츠의 저작권은 사용자에게 귀속되지만, 본 서비스의 운영·개선에 이용하는 것에 동의하는 것으로 합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제8조 (면책사항)</h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>AI에 의한 첨삭·피드백은 참고 정보이며, 그 정확성·완전성을 보장하는 것은 아닙니다.</li>
                <li>본 서비스는 현 상태 그대로 제공되며, 특정 목적에 대한 적합성을 보장하지 않습니다.</li>
                <li>본 서비스 이용으로 발생한 손해에 대해 운영자는 고의 또는 중과실이 없는 한 책임을 지지 않습니다.</li>
                <li>시스템 장애, 유지보수 등으로 인해 서비스가 일시적으로 이용할 수 없는 경우가 있습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제9조 (서비스 변경·종료)</h2>
              <p className="text-muted-foreground leading-relaxed">
                운영자는 사용자에게 사전 통지함으로써 본 서비스의 내용을 변경하거나 제공을 종료할 수 있습니다. 서비스 종료 시 유료 플랜의 미사용 기간분에 대해서는 합리적인 방법으로 환불 대응을 합니다.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제10조 (약관 변경)</h2>
              <p className="text-muted-foreground leading-relaxed">
                운영자는 필요에 따라 본 약관을 변경할 수 있습니다. 변경 후의 약관은 본 서비스에 게시한 시점에서 효력이 발생합니다. 중요한 변경이 있는 경우 사전에 알려드립니다.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제11조 (준거법·관할)</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 약관의 해석 및 적용은 일본법에 준거합니다. 본 서비스에 관한 분쟁에 대해서는 도쿄지방재판소를 제1심의 전속적 합의관할 재판소로 합니다.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">제12조 (문의)</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 약관에 관한 문의는 아래로 연락해 주세요.
              </p>
              <div className="mt-4 rounded-xl bg-muted/50 p-4">
                <p className="text-sm">
                  <strong>이메일:</strong>{" "}
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
