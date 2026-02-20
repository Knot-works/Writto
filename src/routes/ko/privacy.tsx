import { Link } from "react-router-dom";
import { ArrowLeft, Shield, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSEO } from "@/hooks/use-seo";

export default function PrivacyPageKo() {
  useSEO({
    title: "개인정보 처리방침",
    description: "Writto 개인정보 처리방침. 개인정보 취급에 대해 설명합니다.",
    canonical: "/ko/privacy",
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
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-3xl">개인정보 처리방침</h1>
            <p className="text-sm text-muted-foreground">최종 업데이트: 2026년 2월 8일</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="rounded-2xl border border-border/60 bg-card p-8 space-y-8">
            <section>
              <h2 className="font-serif text-xl font-medium mb-4">1. 서문</h2>
              <p className="text-muted-foreground leading-relaxed">
                Writto(이하 "본 서비스")는 사용자 여러분의 프라이버시를 존중하고 개인정보 보호에 노력하고 있습니다. 본 개인정보 처리방침은 본 서비스에서의 개인정보 취급에 대해 설명합니다.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">2. 수집하는 정보</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                본 서비스에서는 다음의 정보를 수집할 수 있습니다.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>계정 정보:</strong> Google 계정 인증 시 취득하는 이름, 이메일 주소, 프로필 사진</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>프로필 정보:</strong> 학습 목표, 레벨, 관심사, 직업·학교 정보 등 사용자가 임의로 입력하는 정보</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>학습 데이터:</strong> 라이팅 기록, 첨삭 결과, 단어장, 학습 통계</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>이용 현황:</strong> 서비스 이용 이력, 접속 로그</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">3. 정보 이용 목적</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                수집한 정보는 다음의 목적으로 이용합니다.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>서비스 제공·운영·개선</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>개인화된 학습 경험 제공</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>사용자 지원 제공</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>서비스 관련 중요 안내 발송</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">4. 정보 공유</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 서비스는 다음의 경우를 제외하고 사용자의 개인정보를 제3자에게 제공하지 않습니다.
              </p>
              <ul className="space-y-2 text-muted-foreground mt-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>사용자의 동의가 있는 경우</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>법령에 근거한 경우</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>서비스 제공에 필요한 업무 위탁처(Firebase, OpenAI 등)에 대한 제공</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">5. 외부 서비스 이용</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 서비스에서는 다음의 외부 서비스를 이용하고 있습니다. 각 서비스의 개인정보 처리방침도 확인해 주세요.
              </p>
              <ul className="space-y-2 text-muted-foreground mt-4">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Google Firebase:</strong> 인증, 데이터베이스, 호스팅</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Google Analytics:</strong> 서비스 이용 현황 분석(익명화된 데이터)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>OpenAI:</strong> AI에 의한 첨삭·주제 생성 기능(API를 사용하며, 전송된 데이터는 OpenAI의 모델 학습에 사용되지 않습니다)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Stripe:</strong> 결제 처리(신용카드 정보는 본 서비스에서 보관하지 않으며, Stripe가 안전하게 관리합니다)</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">6. 데이터 보호</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 서비스는 사용자의 개인정보를 적절히 관리하고, 불법 접근, 분실, 파괴, 변조, 유출 등을 방지하기 위해 필요하고 적절한 보안 조치를 실시하고 있습니다.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">7. 사용자의 권리</h2>
              <p className="text-muted-foreground leading-relaxed">
                사용자는 자신의 개인정보에 대해 열람·정정·삭제를 요청할 권리가 있습니다. 계정 삭제는 설정 화면에서 진행할 수 있습니다. 기타 요청 사항은 아래 문의처로 연락해 주세요.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">8. 방침 변경</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 방침은 법령 개정이나 서비스 변경에 따라 예고 없이 변경될 수 있습니다. 중요한 변경이 있는 경우 서비스 내에서 안내드립니다.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium mb-4">9. 문의</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 방침에 관한 문의는 아래로 연락해 주세요.
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
