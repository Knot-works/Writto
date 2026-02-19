// Korean topic data for Programmatic SEO
// These pages target Korean keywords for English writing exam preparation

export interface TopicKo {
  slug: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  category: "exam" | "business" | "daily";
  keywords: string[];
  content: {
    heading: string;
    intro: string;
    features: string[];
    samplePrompts: string[];
    tips: string[];
  };
  // Japanese equivalent slug for hreflang (if exists)
  jaSlug?: string;
}

export const topicsKo: TopicKo[] = [
  // TOEIC
  {
    slug: "toeic-writing",
    title: "토익 라이팅 대비",
    description: "TOEIC Writing 시험을 위한 연습을 할 수 있습니다",
    metaTitle: "토익 라이팅 대비 · 연습 | Writto",
    metaDescription:
      "TOEIC S&W Writing 섹션 대비를 위한 AI 영작문 첨삭 서비스. 비즈니스 이메일과 의견 서술 연습으로 고득점을 목표로 하세요.",
    category: "exam",
    keywords: ["토익", "라이팅", "대비", "연습", "TOEIC Writing"],
    jaSlug: "toeic-writing",
    content: {
      heading: "토익 라이팅 시험 대비",
      intro:
        "TOEIC S&W의 Writing 섹션에서는 사진 묘사, 이메일 작성, 의견 서술의 3가지 유형이 출제됩니다. 비즈니스 상황을 가정한 실전적인 영문 라이팅 능력을 기릅니다.",
      features: [
        "비즈니스 이메일 형식의 주제로 연습",
        "의견 서술 문제 연습",
        "비즈니스 영어 어휘 및 표현 학습",
        "적절한 격식 수준 체크",
      ],
      samplePrompts: [
        "회의 일정 변경을 클라이언트에게 알리는 이메일을 작성하세요",
        "재택근무 제도 도입에 대한 당신의 의견을 서술하세요",
        "신제품 출시 연기에 대해 사과하는 이메일을 작성하세요",
      ],
      tips: [
        "비즈니스 이메일의 기본 포맷을 익히세요",
        "의견 서술은 이유와 구체적인 예시를 명확히",
        "시간 배분을 의식하며 연습하세요",
      ],
    },
  },
  // TOEFL
  {
    slug: "toefl-writing",
    title: "토플 라이팅 대비",
    description: "TOEFL iBT Writing 섹션을 위한 연습을 할 수 있습니다",
    metaTitle: "토플 라이팅 대비 · 연습 | Writto",
    metaDescription:
      "TOEFL iBT Writing 섹션 대비를 위한 AI 영작문 첨삭 서비스. Integrated Task와 Independent Task 연습으로 고득점을 달성하세요.",
    category: "exam",
    keywords: ["토플", "라이팅", "대비", "연습", "TOEFL Writing"],
    jaSlug: "toefl-writing",
    content: {
      heading: "토플 라이팅 섹션 대비",
      intro:
        "TOEFL iBT의 Writing 섹션에서는 학술적인 주제에 대해 논리적으로 의견을 서술하는 능력이 요구됩니다. Independent Task에서는 약 300단어 정도의 에세이를 작성합니다.",
      features: [
        "학술적인 주제로 토픽 생성",
        "300단어 정도의 긴 에세이 연습",
        "논리적인 구성(서론·본론·결론) 체크",
        "아카데믹 영어 어휘 및 표현 제안",
      ],
      samplePrompts: [
        "대학 교육에서 폭넓은 교양과 전문성 중 어느 것이 더 중요한가",
        "성공하기 위해 가장 중요한 요소는 무엇인가",
        "기술이 교육을 어떻게 변화시켰는가",
      ],
      tips: [
        "명확한 thesis statement를 서두에 작성하세요",
        "각 단락에서 하나의 포인트를 전개하세요",
        "구체적인 예시나 경험을 효과적으로 활용하세요",
      ],
    },
  },
  // IELTS
  {
    slug: "ielts-writing",
    title: "아이엘츠 라이팅 대비",
    description: "IELTS Writing 섹션을 위한 연습을 할 수 있습니다",
    metaTitle: "아이엘츠 라이팅 대비 · 연습 | Writto",
    metaDescription:
      "IELTS Writing 섹션 대비를 위한 AI 영작문 첨삭 서비스. Task 1과 Task 2 연습으로 밴드 스코어 향상을 목표로 하세요.",
    category: "exam",
    keywords: ["아이엘츠", "라이팅", "대비", "연습", "IELTS Writing", "밴드스코어"],
    jaSlug: "ielts-writing",
    content: {
      heading: "아이엘츠 라이팅 섹션 대비",
      intro:
        "IELTS Writing의 Task 2에서는 사회적인 주제에 대해 250단어 이상으로 에세이를 작성합니다. Task Response, Coherence, Lexical Resource, Grammatical Range의 4가지 관점에서 평가됩니다.",
      features: [
        "IELTS 형식의 주제로 토픽 생성",
        "250단어 이상의 에세이 연습",
        "4가지 평가 관점에 기반한 피드백",
        "밴드 스코어 향상을 위한 구체적인 조언",
      ],
      samplePrompts: [
        "정부가 대중교통을 무료로 해야 하는지 논의하세요",
        "아이 교육에서 학교와 부모 중 어느 쪽이 더 중요한 역할을 하는가",
        "세계화의 장점과 단점을 논하세요",
      ],
      tips: [
        "문제를 잘 읽고 모든 부분에 답하세요",
        "단락마다 명확한 토픽 문장을 작성하세요",
        "다양한 문장 구조와 어휘를 사용하세요",
      ],
    },
  },
  // Business Email
  {
    slug: "business-email",
    title: "비즈니스 영어 이메일 연습",
    description: "비즈니스 상황에서 사용하는 영문 이메일 연습을 할 수 있습니다",
    metaTitle: "비즈니스 영어 이메일 연습 · 첨삭 | Writto",
    metaDescription:
      "비즈니스 영어 이메일 연습을 위한 AI 첨삭 서비스. 문의, 요청, 감사, 사과 등 다양한 상황에 대응합니다.",
    category: "business",
    keywords: ["비즈니스 영어", "이메일", "연습", "첨삭", "영문 이메일"],
    jaSlug: "business-email",
    content: {
      heading: "비즈니스 영어 이메일 연습",
      intro:
        "글로벌 비즈니스 환경에서는 적절한 영문 이메일을 작성하는 능력이 필수입니다. Writto에서는 다양한 비즈니스 상황을 가정한 이메일 연습을 할 수 있습니다.",
      features: [
        "다양한 비즈니스 상황의 주제 생성",
        "격식 수준의 적절성 체크",
        "비즈니스 영어 특유의 표현 학습",
        "문화적으로 적절한 표현 조언",
      ],
      samplePrompts: [
        "신규 거래처에 인사 이메일을 작성하세요",
        "납기 연장을 요청하는 이메일을 작성하세요",
        "회의 의사록을 송부하는 이메일을 작성하세요",
      ],
      tips: [
        "제목은 간결하고 구체적으로",
        "목적을 먼저 명확히 서술하세요",
        "적절한 격식 수준을 유지하세요",
      ],
    },
  },
  // English Diary
  {
    slug: "english-diary",
    title: "영어 일기 쓰기 연습",
    description: "영어로 일기를 쓰는 연습을 할 수 있습니다",
    metaTitle: "영어 일기 쓰기 · 연습 | Writto",
    metaDescription:
      "영어 일기 연습을 위한 AI 첨삭 서비스. 매일의 일상을 영어로 써서 자연스러운 영어 표현을 익히세요.",
    category: "daily",
    keywords: ["영어 일기", "연습", "쓰기", "영작문", "일기"],
    jaSlug: "english-diary",
    content: {
      heading: "영어 일기로 매일 라이팅",
      intro:
        "영어 일기는 영어 실력을 향상시키는 가장 효과적인 방법 중 하나입니다. 일상의 일들을 영어로 표현하면서 자연스러운 영어 실력을 기릅니다.",
      features: [
        "일기의 계기가 되는 주제 생성",
        "자연스러운 영어 표현 제안",
        "일상 회화에서 사용하는 어휘 학습",
        "짧은 문장부터 연습 시작",
      ],
      samplePrompts: [
        "오늘 있었던 기쁜 일을 써보세요",
        "최근 본 영화나 읽은 책에 대해 써보세요",
        "주말 계획에 대해 써보세요",
      ],
      tips: [
        "완벽을 추구하지 말고 일단 써보세요",
        "같은 표현의 반복을 피하세요",
        "감정이나 생각도 영어로 표현해 보세요",
      ],
    },
  },
  // TOEIC Speaking & Writing (additional for Korea)
  {
    slug: "toeic-sw",
    title: "토익 스피킹 라이팅 대비",
    description: "TOEIC Speaking & Writing 시험 대비를 할 수 있습니다",
    metaTitle: "토익 스피킹 라이팅 (S&W) 대비 | Writto",
    metaDescription:
      "토익 S&W 시험의 라이팅 파트 대비를 위한 AI 첨삭 서비스. 실전 문제 유형으로 연습하고 고득점을 노리세요.",
    category: "exam",
    keywords: ["토익", "스피킹", "라이팅", "S&W", "대비", "연습"],
    content: {
      heading: "토익 S&W 라이팅 대비",
      intro:
        "토익 S&W는 취업 및 승진에 중요한 영어 시험입니다. 라이팅 파트에서는 사진 묘사, 이메일 답장, 의견 제시의 3가지 유형이 출제됩니다. Writto로 각 유형별 집중 연습이 가능합니다.",
      features: [
        "Q1-5 사진 묘사 연습",
        "Q6-7 이메일 답장 작성 연습",
        "Q8 의견 제시 에세이 연습",
        "실제 시험과 유사한 시간 제한 연습",
      ],
      samplePrompts: [
        "다음 사진을 보고 상황을 자세히 묘사하세요",
        "고객의 불만 이메일에 적절히 응대하는 답장을 작성하세요",
        "원격 근무의 장단점에 대한 당신의 의견을 제시하세요",
      ],
      tips: [
        "사진 묘사는 육하원칙으로 체계적으로",
        "이메일은 요청 사항을 모두 포함하세요",
        "의견 제시는 서론-본론-결론 구조를 지키세요",
      ],
    },
  },
];

// Helper function to get Korean topic by slug
export function getTopicKoBySlug(slug: string): TopicKo | undefined {
  return topicsKo.find((topic) => topic.slug === slug);
}

// Get all Korean topic slugs for prerendering
export function getAllTopicKoSlugs(): string[] {
  return topicsKo.map((topic) => topic.slug);
}
