// Topic data for Programmatic SEO
// These pages target long-tail keywords for English writing exam preparation

export interface Topic {
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
}

export const topics: Topic[] = [
  // 英検シリーズ
  {
    slug: "eiken-grade1",
    title: "英検1級ライティング対策",
    description: "英検1級のライティング試験に向けた練習ができます",
    metaTitle: "英検1級ライティング対策・練習 | Writto",
    metaDescription:
      "英検1級のライティング試験対策ができるAI英作文添削サービス。社会問題や時事トピックの意見論述を練習し、AIが即座にフィードバック。",
    category: "exam",
    keywords: ["英検1級", "ライティング", "対策", "練習", "英作文"],
    content: {
      heading: "英検1級ライティング試験の対策",
      intro:
        "英検1級のライティングでは、社会性の高いトピックについて200〜240語程度で自分の意見を論述する力が求められます。Writtoでは、時事問題や社会課題をテーマにしたお題で実践的な練習ができます。",
      features: [
        "社会問題・時事トピックに関するお題を生成",
        "論理的な構成（序論・本論・結論）をAIがチェック",
        "語彙の適切さ・多様性を評価",
        "文法・語法の誤りを詳細に指摘",
      ],
      samplePrompts: [
        "AIの発展が雇用に与える影響について、あなたの意見を述べてください",
        "グローバル化のメリットとデメリットについて論じてください",
        "環境保護と経済発展の両立は可能か、あなたの考えを述べてください",
      ],
      tips: [
        "POINTSを効果的に使い、論理的な構成を心がける",
        "抽象的な主張には具体例を添える",
        "多様な語彙と文構造を意識する",
      ],
    },
  },
  {
    slug: "eiken-grade-pre1",
    title: "英検準1級ライティング対策",
    description: "英検準1級のライティング試験に向けた練習ができます",
    metaTitle: "英検準1級ライティング対策・練習 | Writto",
    metaDescription:
      "英検準1級のライティング試験対策ができるAI英作文添削サービス。120〜150語のエッセイ練習で、構成力と表現力を向上。",
    category: "exam",
    keywords: ["英検準1級", "ライティング", "対策", "練習", "英作文"],
    content: {
      heading: "英検準1級ライティング試験の対策",
      intro:
        "英検準1級のライティングでは、与えられたトピックについて120〜150語で意見を述べます。社会的なテーマが多く、論理的に自分の考えを伝える力が問われます。",
      features: [
        "準1級レベルのトピックでお題を生成",
        "120〜150語の適切な分量で練習",
        "POINTSを活用した論述をサポート",
        "文法・表現の改善点を具体的にフィードバック",
      ],
      samplePrompts: [
        "リモートワークの普及は社会にとって良いことか",
        "大学教育は無償化されるべきか",
        "SNSは人々のコミュニケーションを改善したか",
      ],
      tips: [
        "序論・本論・結論の3段構成を守る",
        "POINTSから2つ選び、それぞれ具体的に展開",
        "時間配分を意識して練習する",
      ],
    },
  },
  {
    slug: "eiken-grade2",
    title: "英検2級ライティング対策",
    description: "英検2級のライティング試験に向けた練習ができます",
    metaTitle: "英検2級ライティング対策・練習 | Writto",
    metaDescription:
      "英検2級のライティング試験対策ができるAI英作文添削サービス。80〜100語のエッセイ練習で合格を目指そう。",
    category: "exam",
    keywords: ["英検2級", "ライティング", "対策", "練習", "英作文"],
    content: {
      heading: "英検2級ライティング試験の対策",
      intro:
        "英検2級のライティングでは、日常的・社会的なトピックについて80〜100語で自分の意見を述べます。明確な主張と2つの理由を論理的に展開する力が求められます。",
      features: [
        "2級レベルの身近なトピックでお題を生成",
        "80〜100語の適切な分量で練習",
        "意見＋理由2つの構成をチェック",
        "中級レベルの語彙・表現を提案",
      ],
      samplePrompts: [
        "学生はアルバイトをするべきか",
        "紙の本と電子書籍、どちらが良いか",
        "制服は学校に必要か",
      ],
      tips: [
        "最初に自分の意見を明確に述べる",
        "理由は2つ、それぞれ具体例を添える",
        "結論で意見を再度まとめる",
      ],
    },
  },
  {
    slug: "eiken-grade-pre2",
    title: "英検準2級ライティング対策",
    description: "英検準2級のライティング試験に向けた練習ができます",
    metaTitle: "英検準2級ライティング対策・練習 | Writto",
    metaDescription:
      "英検準2級のライティング試験対策ができるAI英作文添削サービス。50〜60語のエッセイ練習で基礎を固めよう。",
    category: "exam",
    keywords: ["英検準2級", "ライティング", "対策", "練習", "英作文"],
    content: {
      heading: "英検準2級ライティング試験の対策",
      intro:
        "英検準2級のライティングでは、身近なトピックについて50〜60語で自分の意見を述べます。シンプルながらも論理的な文章を書く基礎力を養います。",
      features: [
        "準2級レベルの日常的なトピックでお題を生成",
        "50〜60語の短めの文章で練習",
        "基本的な文法・語彙の正確さをチェック",
        "わかりやすい表現を提案",
      ],
      samplePrompts: [
        "朝食を毎日食べることは大切か",
        "スマートフォンは学生に必要か",
        "休日は家で過ごすのと外出するのとどちらが良いか",
      ],
      tips: [
        "質問に対して明確にYes/Noを述べる",
        "理由を2つ挙げてサポートする",
        "シンプルな文構造で正確に書く",
      ],
    },
  },
  {
    slug: "eiken-grade3",
    title: "英検3級ライティング対策",
    description: "英検3級のライティング試験に向けた練習ができます",
    metaTitle: "英検3級ライティング対策・練習 | Writto",
    metaDescription:
      "英検3級のライティング試験対策ができるAI英作文添削サービス。25〜35語の短い英作文で、ライティングの基礎を身につけよう。",
    category: "exam",
    keywords: ["英検3級", "ライティング", "対策", "練習", "英作文"],
    content: {
      heading: "英検3級ライティング試験の対策",
      intro:
        "英検3級のライティングでは、質問に対して25〜35語で答えます。自分の考えとその理由を2つ書く形式で、英作文の基礎を学ぶのに最適です。",
      features: [
        "3級レベルのシンプルな質問でお題を生成",
        "25〜35語の短い文章で練習",
        "基本的な文法の正しさを確認",
        "中学英語レベルの表現でフィードバック",
      ],
      samplePrompts: [
        "好きな季節は何ですか？理由も教えてください",
        "週末は何をして過ごすのが好きですか？",
        "将来どんな仕事がしたいですか？",
      ],
      tips: [
        "質問に対する答えを最初に書く",
        "理由を2つ、短い文で書く",
        "I think... / I like... などの基本表現を使う",
      ],
    },
  },
  // TOEIC
  {
    slug: "toeic-writing",
    title: "TOEIC Writing対策",
    description: "TOEIC Writingテストに向けた練習ができます",
    metaTitle: "TOEIC Writing対策・練習 | Writto",
    metaDescription:
      "TOEIC S&WのWritingセクション対策ができるAI英作文添削サービス。ビジネスメールや意見論述の練習に。",
    category: "exam",
    keywords: ["TOEIC", "Writing", "対策", "練習", "ライティング"],
    content: {
      heading: "TOEIC Writingテストの対策",
      intro:
        "TOEIC S&WのWritingセクションでは、写真描写・Eメール作成・意見論述の3種類の問題が出題されます。ビジネスシーンを想定した実践的な英文ライティング力を養います。",
      features: [
        "ビジネスメール形式のお題で練習",
        "意見論述問題の練習",
        "ビジネス英語の語彙・表現を学習",
        "適切なフォーマルさをチェック",
      ],
      samplePrompts: [
        "会議の日程変更をクライアントに伝えるメールを書いてください",
        "在宅勤務制度の導入について、あなたの意見を述べてください",
        "新製品の発売延期をお詫びするメールを書いてください",
      ],
      tips: [
        "ビジネスメールの基本フォーマットを覚える",
        "意見論述は理由と具体例を明確に",
        "時間配分を意識して練習する",
      ],
    },
  },
  // TOEFL
  {
    slug: "toefl-writing",
    title: "TOEFL iBT Writing対策",
    description: "TOEFL iBT Writingセクションに向けた練習ができます",
    metaTitle: "TOEFL iBT Writing対策・練習 | Writto",
    metaDescription:
      "TOEFL iBTのWritingセクション対策ができるAI英作文添削サービス。Integrated TaskとIndependent Taskの練習に。",
    category: "exam",
    keywords: ["TOEFL", "iBT", "Writing", "対策", "練習"],
    content: {
      heading: "TOEFL iBT Writingセクションの対策",
      intro:
        "TOEFL iBTのWritingセクションでは、学術的なトピックについて論理的に意見を述べる力が求められます。Independent Taskでは300語程度のエッセイを書きます。",
      features: [
        "アカデミックなトピックでお題を生成",
        "300語程度の長めのエッセイ練習",
        "論理的な構成（導入・本論・結論）をチェック",
        "アカデミック英語の語彙・表現を提案",
      ],
      samplePrompts: [
        "大学教育において、幅広い教養と専門性のどちらが重要か",
        "成功するために最も重要な要素は何か",
        "テクノロジーは教育をどのように変えたか",
      ],
      tips: [
        "明確なthesis statementを冒頭に書く",
        "各段落で1つのポイントを展開",
        "具体例や経験を効果的に使う",
      ],
    },
  },
  // IELTS
  {
    slug: "ielts-writing",
    title: "IELTS Writing対策",
    description: "IELTS Writingセクションに向けた練習ができます",
    metaTitle: "IELTS Writing対策・練習 | Writto",
    metaDescription:
      "IELTS Writingセクション対策ができるAI英作文添削サービス。Task 1とTask 2の練習で、バンドスコアアップを目指そう。",
    category: "exam",
    keywords: ["IELTS", "Writing", "対策", "練習", "バンドスコア"],
    content: {
      heading: "IELTS Writingセクションの対策",
      intro:
        "IELTS WritingのTask 2では、社会的なトピックについて250語以上でエッセイを書きます。Task Response、Coherence、Lexical Resource、Grammatical Rangeの4つの観点で評価されます。",
      features: [
        "IELTS形式のトピックでお題を生成",
        "250語以上のエッセイ練習",
        "4つの評価観点に基づくフィードバック",
        "バンドスコア向上のための具体的アドバイス",
      ],
      samplePrompts: [
        "政府は公共交通機関を無料にすべきか、議論してください",
        "子供の教育において、学校と親のどちらがより重要な役割を果たすか",
        "グローバリゼーションの利点と欠点を論じてください",
      ],
      tips: [
        "問題文をよく読み、すべての部分に答える",
        "段落ごとに明確なトピックセンテンスを書く",
        "多様な文構造と語彙を使用する",
      ],
    },
  },
  // ビジネス系
  {
    slug: "business-email",
    title: "ビジネス英語メール練習",
    description: "ビジネスシーンで使える英文メールの練習ができます",
    metaTitle: "ビジネス英語メール練習・添削 | Writto",
    metaDescription:
      "ビジネス英語メールの練習ができるAI添削サービス。お問い合わせ、依頼、お礼、謝罪など様々なシーンに対応。",
    category: "business",
    keywords: ["ビジネス英語", "メール", "練習", "添削", "英文メール"],
    content: {
      heading: "ビジネス英語メールの練習",
      intro:
        "グローバルなビジネス環境では、適切な英文メールを書くスキルが必須です。Writtoでは、様々なビジネスシーンを想定したメール練習ができます。",
      features: [
        "様々なビジネスシーンのお題を生成",
        "フォーマル度の適切さをチェック",
        "ビジネス英語特有の表現を学習",
        "文化的に適切な表現をアドバイス",
      ],
      samplePrompts: [
        "新規取引先への挨拶メールを書いてください",
        "納期の延長をお願いするメールを書いてください",
        "会議の議事録を送付するメールを書いてください",
      ],
      tips: [
        "件名は簡潔かつ具体的に",
        "目的を最初に明確に述べる",
        "適切なフォーマルさを維持する",
      ],
    },
  },
  // 日常・その他
  {
    slug: "english-diary",
    title: "英語日記の書き方練習",
    description: "英語で日記を書く練習ができます",
    metaTitle: "英語日記の書き方・練習 | Writto",
    metaDescription:
      "英語日記の練習ができるAI添削サービス。毎日の出来事を英語で書いて、自然な英語表現を身につけよう。",
    category: "daily",
    keywords: ["英語日記", "練習", "書き方", "英作文", "日記"],
    content: {
      heading: "英語日記で毎日ライティング",
      intro:
        "英語日記は、英語力を向上させる最も効果的な方法の一つです。日常の出来事を英語で表現することで、自然な英語力が身につきます。",
      features: [
        "日記のきっかけになるお題を生成",
        "自然な英語表現を提案",
        "日常会話で使える語彙を学習",
        "継続しやすい短めの文章から練習",
      ],
      samplePrompts: [
        "今日あった嬉しかったことを書いてください",
        "最近観た映画や読んだ本について書いてください",
        "週末の予定について書いてください",
      ],
      tips: [
        "完璧を求めず、まず書いてみる",
        "同じ表現の繰り返しを避ける",
        "感情や考えも英語で表現してみる",
      ],
    },
  },
];

// Helper function to get topic by slug
export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug);
}

// Get all topic slugs for prerendering
export function getAllTopicSlugs(): string[] {
  return topics.map((topic) => topic.slug);
}
