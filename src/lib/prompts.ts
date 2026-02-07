import type { UserProfile, WritingMode, Rank, WritingFeedback } from "@/types";

export function buildPromptGenerationRequest(
  profile: UserProfile,
  mode: WritingMode,
  customInput?: string
): string {
  const levelDesc =
    profile.level === "beginner"
      ? "初級（中学英語レベル）"
      : profile.level === "intermediate"
        ? "中級（高校〜TOEIC600程度）"
        : "上級（TOEIC800以上）";

  const goalMap: Record<string, string> = {
    business: "ビジネス（メール、レポート、会議）",
    travel: "旅行（ホテル、レストラン、交通）",
    study_abroad: "留学（エッセイ、志望動機）",
    daily: "日常（友人との会話、SNS）",
    exam: "試験対策（意見論述、要約）",
  };

  let modeInstruction = "";
  if (mode === "goal") {
    modeInstruction = `ユーザーの目標「${goalMap[profile.goal]}」に合ったお題を出してください。`;
  } else if (mode === "hobby") {
    modeInstruction = `ユーザーの趣味「${profile.interests.join("、")}」に関連するお題を出してください。`;
  } else if (mode === "expression") {
    modeInstruction = `ユーザーが練習したい表現「${customInput || profile.targetExpressions.join("、")}」を使うお題を出してください。`;
  } else if (mode === "custom") {
    modeInstruction = `ユーザーが指定したテーマ「${customInput}」でお題を出してください。`;
  }

  return `あなたは英語ライティングの教師です。以下の条件で英作文のお題を1つ生成してください。

【ユーザー情報】
- レベル: ${levelDesc}
${profile.toeicScore ? `- TOEICスコア: ${profile.toeicScore}` : ""}
- 目標: ${goalMap[profile.goal]}
- 興味: ${profile.interests.join("、")}

【モード】
${modeInstruction}

【出力形式】
以下のJSON形式で出力してください：
{
  "prompt": "お題（日本語で記述）",
  "hint": "ヒントとなる英語表現（1〜2個）",
  "recommendedWords": 推奨語数（数値）
}

お題は具体的なシチュエーションを設定し、レベルに応じた語数を推奨してください。
初級: 30-50語、中級: 60-100語、上級: 100-150語を目安にしてください。`;
}

export function buildGradingRequest(
  profile: UserProfile,
  prompt: string,
  userAnswer: string,
  lang: "ja" | "en" = "ja"
): string {
  const langInstruction =
    lang === "ja"
      ? "日本語で解説してください。"
      : "Please explain in English.";

  return `あなたは英語ライティングの採点官です。以下の英作文を採点・添削してください。

【お題】
${prompt}

【ユーザーの回答】
${userAnswer}

【採点基準】
以下の4つの観点で S, A+, A, A-, B+, B, B-, C+, C, C-, D のランクで評価してください：
1. grammar（文法）: 文法の正確さ
2. vocabulary（語彙）: 語彙の適切さ・豊富さ
3. structure（構成）: 文章の構成・論理展開
4. content（内容）: お題への適切な回答

【出力形式】
以下のJSON形式で出力してください：
{
  "overallRank": "総合ランク",
  "grammarRank": "文法ランク",
  "vocabularyRank": "語彙ランク",
  "structureRank": "構成ランク",
  "contentRank": "内容ランク",
  "improvements": [
    {
      "original": "元の表現",
      "suggested": "改善案",
      "explanation": "解説",
      "type": "grammar|vocabulary|structure|content"
    }
  ],
  "modelAnswer": "模範解答（同じお題に対する理想的な回答）"
}

${langInstruction}
改善点は3〜5個挙げてください。模範解答はユーザーの意図を汲みつつ、より自然な表現で書いてください。`;
}

// MVP: ダミーのお題生成（Firebase未設定時用）
export function generateDummyPrompt(
  profile: UserProfile,
  _mode: WritingMode
): { prompt: string; hint: string; recommendedWords: number } {
  const prompts: Record<string, { prompt: string; hint: string; recommendedWords: number }[]> = {
    business: [
      {
        prompt: "同僚にプロジェクトの進捗を報告するメールを書いてください",
        hint: "I would like to update you on...",
        recommendedWords: 80,
      },
      {
        prompt: "上司に会議の日程変更を依頼するメールを書いてください",
        hint: "Would it be possible to reschedule...",
        recommendedWords: 70,
      },
      {
        prompt: "クライアントに提案書を送付する際の添え書きを書いてください",
        hint: "Please find attached...",
        recommendedWords: 60,
      },
    ],
    travel: [
      {
        prompt: "ホテルにレイトチェックアウトをお願いするメッセージを書いてください",
        hint: "I was wondering if it would be possible...",
        recommendedWords: 50,
      },
      {
        prompt: "レストランで特別なリクエスト（アレルギー対応など）を伝える文章を書いてください",
        hint: "I would appreciate it if...",
        recommendedWords: 60,
      },
    ],
    daily: [
      {
        prompt: "週末の予定について友人に説明するメッセージを書いてください",
        hint: "I'm planning to...",
        recommendedWords: 50,
      },
      {
        prompt: "最近観た映画について友人に感想を伝えるメッセージを書いてください",
        hint: "I recently watched... / It was worth watching because...",
        recommendedWords: 70,
      },
    ],
    study_abroad: [
      {
        prompt: "大学への志望動機を書いてください（100語以内）",
        hint: "I am eager to... / My goal is to...",
        recommendedWords: 100,
      },
    ],
    exam: [
      {
        prompt: "「テクノロジーは教育にプラスの影響を与えるか」について意見を述べてください",
        hint: "In my opinion... / First of all...",
        recommendedWords: 100,
      },
    ],
  };

  const goalPrompts = prompts[profile.goal] || prompts.daily;
  const randomIndex = Math.floor(Math.random() * goalPrompts.length);
  return goalPrompts[randomIndex];
}

// MVP: ダミーの添削結果（Firebase未設定時用）
export function generateDummyFeedback(userAnswer: string): WritingFeedback {
  const wordCount = userAnswer.trim().split(/\s+/).length;

  let overallRank: Rank = "B";
  if (wordCount > 80) overallRank = "A-";
  if (wordCount > 100) overallRank = "A";
  if (wordCount < 30) overallRank = "C+";

  return {
    overallRank,
    grammarRank: "B+" as Rank,
    vocabularyRank: "B" as Rank,
    structureRank: "B+" as Rank,
    contentRank: "A-" as Rank,
    improvements: [
      {
        original: "I want to say",
        suggested: "I would like to mention",
        explanation: "ビジネスシーンではwant toよりwould like toがフォーマルで適切です",
        type: "vocabulary",
      },
      {
        original: "informations",
        suggested: "information",
        explanation: "informationは不可算名詞のため複数形にはなりません",
        type: "grammar",
      },
      {
        original: "Because of this reason",
        suggested: "For this reason",
        explanation: "「Because of this reason」は冗長です。「For this reason」がより自然です",
        type: "structure",
      },
    ],
    modelAnswer:
      "Dear Mr. Tanaka,\n\nI would like to update you on the current status of our project. As of this week, we have completed the initial research phase and are now moving into the development stage.\n\nThe team has made significant progress in identifying key requirements, and we are on track to meet our deadline. However, I would like to discuss a few potential challenges during our next meeting.\n\nPlease let me know if you have any questions.\n\nBest regards",
  };
}
