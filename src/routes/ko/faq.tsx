import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, PenLine, ChevronDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  // 서비스 소개
  {
    category: "서비스 소개",
    question: "Writto는 어떤 서비스인가요?",
    answer: "Writto는 AI를 활용한 영어 라이팅 학습 서비스입니다. 목표와 관심사에 맞춘 주제로 라이팅 연습을 하고, AI가 즉시 첨삭과 피드백을 제공합니다. 문법·어휘·구성·내용의 4가지 축으로 상세한 평가를 받을 수 있습니다.",
  },
  {
    category: "서비스 소개",
    question: "어떤 레벨의 학습자에게 적합한가요?",
    answer: "초급자부터 상급자까지 폭넓은 레벨의 분들이 이용하실 수 있습니다. 초기 설정에서 선택한 레벨에 따라 주제 난이도와 권장 단어 수가 자동으로 조정됩니다.",
  },
  {
    category: "서비스 소개",
    question: "스마트폰에서도 사용할 수 있나요?",
    answer: "네, 스마트폰 브라우저에서도 이용하실 수 있습니다. 다만 긴 글 입력에는 PC나 태블릿이 더 편리합니다.",
  },
  // 요금·플랜
  {
    category: "요금·플랜",
    question: "무료 플랜과 유료 플랜의 차이점은 무엇인가요?",
    answer: "무료 플랜에서는 20,000토큰(약 6세션 분량)을 체험하실 수 있습니다. Pro 플랜에서는 월 200만 토큰, 고정밀 모델(GPT-4o)에 의한 첨삭, 무제한 학습 기록·단어장, 손글씨 인식(OCR) 기능을 이용하실 수 있습니다.",
  },
  {
    category: "요금·플랜",
    question: "토큰이란 무엇인가요?",
    answer: "토큰은 AI가 처리하는 텍스트의 단위입니다. 첨삭 1회에 약 2,500토큰, 주제 생성에 약 1,100토큰이 소비됩니다. Pro 플랜의 토큰은 청구 주기마다 리셋됩니다.",
  },
  {
    category: "요금·플랜",
    question: "Pro 플랜 요금은 얼마인가요?",
    answer: "런칭 기념 가격(2026년 5월 말까지)으로 월간 플랜은 980엔, 연간 플랜은 9,400엔에 제공됩니다. 정가는 월 1,280엔, 연간 9,800엔입니다. 기간 중 계약하시면 할인된 가격으로 이용하실 수 있습니다.",
  },
  {
    category: "요금·플랜",
    question: "언제든지 해지할 수 있나요?",
    answer: "네, 언제든지 해지 가능합니다. 설정 화면의 '구독 관리'에서 절차를 진행하실 수 있습니다. 해지 후에도 결제 완료된 기간이 끝날 때까지 서비스를 이용하실 수 있습니다.",
  },
  {
    category: "요금·플랜",
    question: "어떤 결제 수단을 지원하나요?",
    answer: "신용카드(Visa, Mastercard, American Express, JCB)를 지원합니다. 결제는 Stripe를 통해 안전하게 처리됩니다.",
  },
  // 기능 소개
  {
    category: "기능 소개",
    question: "어떤 라이팅 모드가 있나요?",
    answer: "7가지 모드가 있습니다. '목표 특화'는 비즈니스·시험 등 목표에 직결되는 주제, '취미·관심사'는 즐겁게 쓸 수 있는 테마, '비즈니스' '일상' '사회 문제'는 상황별 주제, '표현 요청'은 특정 영어 표현을 연습하는 모드, '커스텀 주제'는 자유롭게 테마를 설정할 수 있는 모드입니다.",
  },
  {
    category: "기능 소개",
    question: "첨삭에서 어떤 피드백을 받을 수 있나요?",
    answer: "문법·어휘·구성·내용의 4가지 축으로 평가되어 S~D 등급이 매겨집니다. 구체적인 개선점, 더 나은 표현 제안, 모범 답안도 제공됩니다. 첨삭 결과에 대해 AI에게 추가로 질문할 수도 있습니다.",
  },
  {
    category: "기능 소개",
    question: "단어장 기능에 대해 알려주세요",
    answer: "첨삭 결과 화면에서 원하는 단어나 표현을 탭 한 번으로 저장할 수 있습니다. 저장한 단어는 '단어장' 페이지에서 언제든지 확인·복습할 수 있습니다. 무료 플랜은 50개까지, Pro 플랜은 무제한으로 저장할 수 있습니다.",
  },
  {
    category: "기능 소개",
    question: "손글씨 인식(OCR)이란 무엇인가요?",
    answer: "Pro 플랜 전용 기능입니다. 손으로 쓴 노트나 종이에 쓴 영문을 촬영해서 업로드하면 AI가 텍스트로 변환합니다. 종이에 초안을 작성한 후 디지털로 첨삭을 받고 싶은 분들에게 편리합니다.",
  },
  // 계정
  {
    category: "계정",
    question: "계정을 삭제하려면 어떻게 해야 하나요?",
    answer: "설정 화면 하단의 '계정 삭제'에서 삭제할 수 있습니다. 삭제하면 모든 학습 데이터가 완전히 삭제되며 복원할 수 없으니 주의해 주세요.",
  },
  {
    category: "계정",
    question: "Google 계정 외에 다른 방법으로 로그인할 수 있나요?",
    answer: "현재는 Google 계정만 지원하고 있습니다.",
  },
  {
    category: "계정",
    question: "데이터는 어떻게 보호되나요?",
    answer: "데이터는 Google Cloud(Firebase)에 안전하게 저장됩니다. 모든 통신은 SSL/TLS로 암호화되며, 결제 정보는 Stripe가 안전하게 관리합니다. 또한 OpenAI API 규약에 따라 API를 통해 전송된 데이터는 OpenAI의 모델 학습에 사용되지 않습니다([상세정보](https://platform.openai.com/docs/models#how-we-use-your-data)).",
  },
];

const CATEGORIES = [...new Set(FAQ_ITEMS.map((item) => item.category))];

// Generate FAQ structured data for SEO
const FAQ_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"), // Strip markdown links
    },
  })),
};

// Render answer text with clickable links
function renderAnswerWithLinks(text: string) {
  // Match URLs in the format [label](url) or plain https:// URLs
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // [label](url) format
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      // Plain URL format
      parts.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {match[3]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

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
              {renderAnswerWithLinks(item.answer)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPageKo() {
  useSEO({
    title: "자주 묻는 질문",
    description: "Writto에 관한 자주 묻는 질문과 답변. 서비스 내용, 요금 플랜, 기능, 계정에 대해 답변합니다.",
    canonical: "/ko/faq",
    structuredData: FAQ_STRUCTURED_DATA,
  });

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl">자주 묻는 질문</h1>
          <p className="mt-2 text-muted-foreground">
            Writto에 관해 자주 묻는 질문에 답변합니다
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
          <h2 className="font-serif text-xl mb-2">해결되지 않으셨나요?</h2>
          <p className="text-muted-foreground mb-6">
            편하게 문의해 주세요
          </p>
          <Button asChild>
            <Link to="/ko/contact" className="gap-2">
              <Mail className="h-4 w-4" />
              문의하기
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
