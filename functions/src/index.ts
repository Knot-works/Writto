import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import OpenAI from "openai";

initializeApp();

const openaiApiKey = defineSecret("OPENAI_API_KEY");
const db = getFirestore();

// ============ Types ============

interface UserProfileData {
  goal: string;
  level: string;
  toeicScore?: number;
  interests: string[];
  customInterests?: string[];  // 自由入力の興味（バンド名、作品名など）
  targetExpressions: string[];
  explanationLang: "ja" | "en";
  userType?: string;
  schoolType?: string;
  grade?: number;
  clubActivity?: string;
  major?: string;
  occupation?: string;
  personalContext?: string;
}

interface PromptRequest {
  profile: UserProfileData;
  mode: string;
  customInput?: string;
}

interface GradeRequest {
  profile: UserProfileData;
  prompt: string;
  userAnswer: string;
  lang?: "ja" | "en";
}

interface LookupRequest {
  query: string;
  lang?: "ja" | "en";
}

// ============ Rate Limiting (Token-Based) ============

type RateLimitedOperation = "generatePrompt" | "gradeWriting" | "lookupWord";

// Token limits per month
const TOKEN_LIMITS: Record<string, number> = {
  free: 15_000,      // ~3-4 sessions (体験版)
  pro: 2_000_000,    // ~800 gradings
};

// Estimated tokens per operation (used for pre-check)
const ESTIMATED_TOKENS: Record<RateLimitedOperation, number> = {
  generatePrompt: 800,   // ~300 input + 500 output
  gradeWriting: 2500,    // ~500 input + 2000 output
  lookupWord: 600,       // ~200 input + 400 output
};

// Global limits (system protection)
const GLOBAL_LIMITS: Record<RateLimitedOperation, number> = {
  generatePrompt: 2000,
  gradeWriting: 500,
  lookupWord: 5000,
};

const OPERATION_LABELS: Record<RateLimitedOperation, string> = {
  generatePrompt: "お題生成",
  gradeWriting: "添削",
  lookupWord: "辞書検索",
};

// Input length limits (security)
const INPUT_LIMITS = {
  userAnswer: 5000,      // ~500 words max
  customInput: 500,      // custom topic/expression
  query: 100,            // dictionary lookup query
  prompt: 1000,          // prompt from client (should be trusted, but limit anyway)
};

// Get the monthly billing period (1st of each month in JST)
function getMonthlyPeriod(): { periodStart: Date; periodEnd: Date } {
  const now = new Date(Date.now() + 9 * 3600_000); // JST
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const periodStart = new Date(Date.UTC(year, month, 1));
  const periodEnd = new Date(Date.UTC(year, month + 1, 1));

  return { periodStart, periodEnd };
}

// Check token budget and return remaining tokens
async function checkTokenBudget(
  uid: string,
  operation: RateLimitedOperation
): Promise<{ plan: string; tokensUsed: number; tokenLimit: number; periodEnd: Date }> {
  const profileRef = db.doc(`users/${uid}`);
  const globalRef = db.doc(`globalUsage/${getTodayJST()}`);
  const { periodStart, periodEnd } = getMonthlyPeriod();

  const [profileSnap, globalSnap] = await Promise.all([
    profileRef.get(),
    globalRef.get(),
  ]);

  // Global limit check
  const globalData = globalSnap.exists ? globalSnap.data()! : {};
  const globalCurrent = (globalData[operation] as number) || 0;
  if (globalCurrent >= GLOBAL_LIMITS[operation]) {
    throw new HttpsError(
      "resource-exhausted",
      "現在アクセスが集中しています。しばらくしてからお試しください。"
    );
  }

  // Get user's plan and token usage
  const profileData = profileSnap.exists ? profileSnap.data()! : {};
  const plan: string = profileData.plan || "free";
  const tokenLimit = TOKEN_LIMITS[plan] || TOKEN_LIMITS.free;

  // Get current token usage
  const tokenUsage = profileData.tokenUsage || {};
  const storedPeriodStart = tokenUsage.periodStart?.toDate?.() || new Date(0);

  // Reset if new billing period
  let tokensUsed = 0;
  if (storedPeriodStart >= periodStart) {
    tokensUsed = tokenUsage.tokensUsed || 0;
  }

  // Check if estimated tokens would exceed limit
  const estimatedCost = ESTIMATED_TOKENS[operation];
  if (tokensUsed + estimatedCost > tokenLimit) {
    const daysRemaining = Math.ceil((periodEnd.getTime() - Date.now()) / (24 * 3600_000));
    const upgradeHint = plan === "free"
      ? "Proプランにアップグレードすると月間200万トークンまで利用できます。"
      : `${daysRemaining}日後にリセットされます。`;
    throw new HttpsError(
      "resource-exhausted",
      `今月のトークン上限（${(tokenLimit / 1000).toFixed(0)}Kトークン）に達しました。${upgradeHint}`
    );
  }

  return { plan, tokensUsed, tokenLimit, periodEnd };
}

// Record actual token usage after operation
async function recordTokenUsage(
  uid: string,
  tokensUsed: number,
  operation: RateLimitedOperation
): Promise<void> {
  const profileRef = db.doc(`users/${uid}`);
  const globalRef = db.doc(`globalUsage/${getTodayJST()}`);
  const { periodStart, periodEnd } = getMonthlyPeriod();

  await db.runTransaction(async (tx) => {
    const profileSnap = await tx.get(profileRef);
    const profileData = profileSnap.exists ? profileSnap.data()! : {};
    const existingUsage = profileData.tokenUsage || {};
    const storedPeriodStart = existingUsage.periodStart?.toDate?.() || new Date(0);

    // Check if we need to reset for new period
    let currentTokens = 0;
    if (storedPeriodStart >= periodStart) {
      currentTokens = existingUsage.tokensUsed || 0;
    }

    // Update token usage in profile
    tx.set(
      profileRef,
      {
        tokenUsage: {
          tokensUsed: currentTokens + tokensUsed,
          periodStart: periodStart,
          periodEnd: periodEnd,
          lastUpdated: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    // Increment global operation count
    tx.set(
      globalRef,
      { [operation]: FieldValue.increment(1) },
      { merge: true }
    );
  });
}

// ============ Helpers ============

const GOAL_MAP: Record<string, string> = {
  business: "ビジネス（メール、レポート、会議）",
  travel: "旅行（ホテル、レストラン、交通）",
  study_abroad: "留学（エッセイ、志望動機）",
  daily: "日常（友人との会話、SNS）",
  exam: "試験対策（意見論述、要約）",
};

function getLevelDesc(level: string): string {
  switch (level) {
    case "beginner":
      return "初級（中学英語レベル）";
    case "intermediate":
      return "中級（高校〜TOEIC600程度）";
    case "advanced":
      return "上級（TOEIC800以上）";
    default:
      return "中級";
  }
}

const SCHOOL_TYPE_MAP: Record<string, string> = {
  junior_high: "中学校",
  high_school: "高校",
  university: "大学",
  graduate: "大学院",
};

function buildPersonaDescription(profile: UserProfileData): string {
  const parts: string[] = [];

  if (profile.userType === "student") {
    const school = SCHOOL_TYPE_MAP[profile.schoolType || ""] || "";
    const gradeStr = profile.grade ? `${profile.grade}年生` : "";
    if (school || gradeStr) {
      parts.push(`${school}${gradeStr}`);
    }
    if (profile.major) {
      parts.push(`専攻: ${profile.major}`);
    }
    if (profile.clubActivity) {
      parts.push(`部活: ${profile.clubActivity}`);
    }
  } else if (profile.userType === "working") {
    if (profile.occupation) {
      parts.push(`職業: ${profile.occupation}`);
    }
  }

  if (profile.personalContext) {
    parts.push(`補足: ${(profile.personalContext).slice(0, 200)}`);
  }

  return parts.join("、");
}

function buildPromptSystemMessage(
  profile: UserProfileData,
  mode: string,
  customInput?: string
): string {
  const levelDesc = getLevelDesc(profile.level);
  const persona = buildPersonaDescription(profile);

  // Combine interests with customInterests
  const allInterestsList = [
    ...profile.interests,
    ...(profile.customInterests || []),
  ];
  const allInterests = allInterestsList.join("、");

  // Randomly select one interest for variety
  const randomInterest = allInterestsList.length > 0
    ? allInterestsList[Math.floor(Math.random() * allInterestsList.length)]
    : "";

  let modeInstruction = "";
  if (mode === "goal") {
    const goalName = GOAL_MAP[profile.goal] || profile.goal;
    modeInstruction = `【目標特化モード】
ユーザーの目標「${goalName}」に直結するお題を出してください。

目標に応じた具体的なシチュエーション：
- ビジネス: 会議、メール、プレゼン、交渉、報告書など
- 旅行: ホテル予約、道案内、レストラン、トラブル対応など
- 留学: 授業、友人との会話、ホストファミリー、課題提出など
- 日常会話: 自己紹介、趣味の話、予定の相談など
- 試験対策: エッセイ、意見論述、要約、グラフ説明など

ユーザーの興味「${allInterests}」も考慮して、より関連性の高いお題にしてください。`;
  } else if (mode === "hobby") {
    if (customInput) {
      modeInstruction = `【趣味・興味モード】
ユーザーが指定したテーマ「${customInput}」に関連するお題を出してください。`;
    } else {
      // Use randomly selected interest for variety
      modeInstruction = `【趣味・興味モード】
今回のテーマ: 「${randomInterest}」

このテーマに関連するお題を出してください。

お題のバリエーション：
- 好きなものを友人に紹介・おすすめする
- 体験を共有する（最近見た映画、行った場所など）
- 趣味について質問に答える
- SNSやブログに投稿する内容

楽しく書けて、実際に使いそうなシチュエーションにしてください。`;
    }
  } else if (mode === "expression") {
    modeInstruction = `【表現リクエストモード】
ユーザーが練習したい表現「${customInput || profile.targetExpressions.join("、")}」を自然に使えるお題を出してください。

その表現が最も自然に使われるシチュエーションを設定し、ユーザーの目標「${GOAL_MAP[profile.goal] || profile.goal}」にも関連させてください。`;
  } else if (mode === "custom") {
    modeInstruction = `【カスタムモード】キーワード: 「${customInput}」

このキーワードについて英作文のお題を作成してください。

⚠️ 絶対に守るルール:
1. 入力が固有名詞（バンド、映画、ゲーム、ブランド、人名等）の場合、その固有名詞として扱う
2. 「Oasis」→ イギリスのロックバンドOasis（砂漠のオアシスではない）
3. 「Apple」→ Apple社（果物のりんごではない）
4. 「Minecraft」→ ゲームのマインクラフト
5. 旅行やレジャーの目的地として解釈しない

お題の例:
- 「Oasis」→ 「好きなOasisの曲とその魅力を友人に紹介してください」
- 「Python」→ 「Pythonを学び始めた理由と、どんなプログラムを作りたいか書いてください」
- 「進撃の巨人」→ 「進撃の巨人の魅力を海外の友人に説明してください」

キーワード「${customInput}」について、そのトピック自体を語るお題を作成してください。`;
  }

  const personaInstruction = persona
    ? `\n\n【パーソナライズ指示】
ユーザー属性: ${persona}

この属性を最大限活用してお題を作成してください：
- IT・エンジニア → 技術ドキュメント、チームへの報告、バグ報告、コードレビューコメント
- 営業・マーケティング → クライアントへの提案、商品説明、営業メール
- 学生（部活あり）→ 部活の試合報告、留学生への説明、学校行事の紹介
- 学生（専攻あり）→ 研究内容の説明、学会発表、レポート
- その他 → その職種・立場で実際に英語が必要になるシーン

ユーザーが「あ、これ実際に使うかも」と思える具体的なシチュエーションにしてください。`
    : "";

  return `あなたは英語ライティングの教師です。以下の条件で英作文のお題を1つ生成してください。

【ユーザー情報】
- レベル: ${levelDesc}
${profile.toeicScore ? `- TOEICスコア: ${profile.toeicScore}` : ""}
- 目標: ${GOAL_MAP[profile.goal] || profile.goal}
- 興味: ${allInterests}
${persona ? `- 属性: ${persona}` : ""}

【モード】
${modeInstruction}${personaInstruction}

【出力形式】
以下のJSON形式のみを出力してください。余分なテキストは不要です：
{
  "prompt": "お題（日本語で記述）",
  "hint": "ヒントとなる英語表現（1〜2個）",
  "recommendedWords": 推奨語数（数値）,
  "exampleJa": "このお題に対する日本語の例文（ユーザーが参考にできる具体的な内容）"
}

お題は具体的なシチュエーションを設定し、レベルに応じた語数を推奨してください。
初級: 30-50語、中級: 60-100語、上級: 100-150語を目安にしてください。

exampleJaは、お題に対して「何を書けばよいか」の参考となる日本語の例文です。
メールならメール形式で、エッセイならエッセイ形式で、具体的な内容を含めて書いてください。
ユーザーはこれを参考に英語で書きます。`;
}

function buildGradingSystemMessage(
  prompt: string,
  userAnswer: string,
  lang: "ja" | "en" = "ja"
): string {
  const langInstruction =
    lang === "ja"
      ? "日本語で解説してください。"
      : "Please explain in English.";

  const vocabInstruction =
    lang === "ja"
      ? "意味は日本語で簡潔に（例: 「〜に影響を与える」）"
      : "Meaning in English, concise (e.g., 'to have an effect on')";

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
以下のJSON形式のみを出力してください。余分なテキストは不要です：
{
  "overallRank": "総合ランク",
  "grammarRank": "文法ランク",
  "vocabularyRank": "語彙ランク",
  "structureRank": "構成ランク",
  "contentRank": "内容ランク",
  "summary": "総評（2〜3文で、良かった点と改善点を簡潔にまとめる）",
  "improvements": [
    {
      "original": "元の表現",
      "suggested": "改善案",
      "explanation": "解説",
      "type": "grammar|vocabulary|structure|content"
    }
  ],
  "vocabularyItems": [
    {
      "term": "学ぶべき単語・表現",
      "meaning": "その意味",
      "type": "word|expression"
    }
  ],
  "modelAnswer": "模範解答（同じお題に対する理想的な回答）"
}

${langInstruction}

【vocabularyItemsについて】
ユーザーが使えていなかった、または間違えていた重要な単語・表現を抽出してください。

抽出すべきもの（優先度順）：
1. 動詞パターン（例: be eager to, lead to, result in）
2. コロケーション（例: significant impact, take initiative）
3. 定型表現（例: I would argue that, It is worth noting that）
4. 重要な単語（例: facilitate, enhance, derive）

【typeの分類ルール - 厳守】
- type: "word" → 1単語のみ（facilitate, enhance, derive, crucial）
- type: "expression" → 2単語以上のフレーズ（be eager to, development of skills, take into account）

※ 単語が1つなら必ず "word"、2つ以上なら必ず "expression" にしてください。

以下は含めないでください：
- 基本的な冠詞・前置詞・接続詞（a, the, on, in, but, so）
- ユーザーが書いた間違った表現そのもの

${vocabInstruction}

改善点は3〜5個、vocabularyItemsは2〜5個挙げてください。模範解答はユーザーの意図を汲みつつ、より自然な表現で書いてください。`;
}

function parseJsonResponse(text: string): unknown {
  // Try to extract JSON from the response (handle markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}

// ============ Cloud Functions ============

export const generatePrompt = onCall(
  {
    secrets: [openaiApiKey],
    region: "asia-northeast1",
    maxInstances: 10,
    memory: "128MiB",
    cors: true,
    invoker: "public",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    // Check token budget before operation
    await checkTokenBudget(request.auth.uid, "generatePrompt");

    const { profile, mode, customInput } = request.data as PromptRequest;

    if (!profile || !mode) {
      throw new HttpsError(
        "invalid-argument",
        "プロフィールとモードが必要です"
      );
    }

    // Validate input length
    if (customInput && customInput.length > INPUT_LIMITS.customInput) {
      throw new HttpsError(
        "invalid-argument",
        `入力が長すぎます（最大${INPUT_LIMITS.customInput}文字）`
      );
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey.value(),
    });

    try {
      const systemMessage = buildPromptSystemMessage(
        profile,
        mode,
        customInput
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: systemMessage }],
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new HttpsError("internal", "AIからの応答が空です");
      }

      // Record actual token usage
      const tokensUsed = completion.usage?.total_tokens || ESTIMATED_TOKENS.generatePrompt;
      await recordTokenUsage(request.auth.uid, tokensUsed, "generatePrompt");

      const result = parseJsonResponse(content) as {
        prompt: string;
        hint: string;
        recommendedWords: number;
      };

      return {
        prompt: result.prompt,
        hint: result.hint,
        recommendedWords: result.recommendedWords,
      };
    } catch (error: unknown) {
      if (error instanceof HttpsError) throw error;
      console.error("generatePrompt error:", error);
      throw new HttpsError(
        "internal",
        "お題の生成に失敗しました。しばらく待ってからお試しください。"
      );
    }
  }
);

// Dictionary cache helpers
const DICTIONARY_CACHE_DAYS = 30;

async function getDictionaryCache(query: string, lang: string): Promise<unknown | null> {
  const cacheKey = `${query.toLowerCase().trim()}_${lang}`;
  const cacheRef = db.doc(`dictionaryCache/${cacheKey}`);
  const cached = await cacheRef.get();

  if (cached.exists) {
    const data = cached.data()!;
    const cachedAt = data.cachedAt?.toMillis?.() || 0;
    const ageInDays = (Date.now() - cachedAt) / (24 * 3600_000);

    if (ageInDays < DICTIONARY_CACHE_DAYS) {
      return data.results;
    }
  }
  return null;
}

async function saveDictionaryCache(query: string, lang: string, results: unknown): Promise<void> {
  const cacheKey = `${query.toLowerCase().trim()}_${lang}`;
  await db.doc(`dictionaryCache/${cacheKey}`).set({
    query: query.trim(),
    lang,
    results,
    cachedAt: FieldValue.serverTimestamp(),
  });
}

export const lookupWord = onCall(
  {
    secrets: [openaiApiKey],
    region: "asia-northeast1",
    maxInstances: 10,
    memory: "128MiB",
    cors: true,
    invoker: "public",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    const { query, lang } = request.data as LookupRequest;
    const effectiveLang = lang || "ja";

    if (!query || query.trim().length === 0) {
      throw new HttpsError("invalid-argument", "検索語を入力してください");
    }

    // Validate input length
    if (query.length > INPUT_LIMITS.query) {
      throw new HttpsError(
        "invalid-argument",
        `検索語が長すぎます（最大${INPUT_LIMITS.query}文字）`
      );
    }

    // Check cache first (no token cost)
    const cachedResult = await getDictionaryCache(query, effectiveLang);
    if (cachedResult) {
      return cachedResult;
    }

    // Check token budget only if we need to call API
    await checkTokenBudget(request.auth.uid, "lookupWord");

    const openai = new OpenAI({
      apiKey: openaiApiKey.value(),
    });

    const langInstruction =
      effectiveLang === "ja"
        ? "意味と解説は日本語で記述してください。"
        : "Write meanings and explanations in English.";

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `あなたは英語学習者向けの英語辞書・表現集アシスタントです。

【重要なルール】
- 検索語が日本語の場合：その意味に対応する**英語の単語・表現**を検索結果として返してください。termは必ず英語にしてください。
- 検索語が英語の場合：その英語の単語・表現について情報を提供してください。
- **termフィールドは必ず英語**で記述してください。日本語のtermは絶対に返さないでください。

【検索語】
${query}

${langInstruction}

【出力形式】
以下のJSON形式のみを出力してください：
{
  "results": [
    {
      "term": "英語の単語/表現（必ず英語）",
      "pronunciation": "発音記号",
      "partOfSpeech": "品詞（noun, verb, adjective, adverb, phrase, idiomなど）",
      "meaning": "意味の説明",
      "examples": ["英語の例文1", "英語の例文2"],
      "related": ["関連する英語表現1", "関連する英語表現2"]
    }
  ]
}

もし複数の対応する英語表現がある場合は、主要なもの（最大3つ）をresults配列に入れてください。
例文は実用的で自然な英語文にしてください。
関連表現は2〜3個、類義語や同じ文脈で使える英語表現を挙げてください。`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new HttpsError("internal", "AIからの応答が空です");
      }

      // Record actual token usage
      const tokensUsed = completion.usage?.total_tokens || ESTIMATED_TOKENS.lookupWord;
      await recordTokenUsage(request.auth.uid, tokensUsed, "lookupWord");

      const result = parseJsonResponse(content);

      // Save to cache (fire-and-forget, don't wait)
      saveDictionaryCache(query, effectiveLang, result).catch((err) => {
        console.warn("Failed to save dictionary cache:", err);
      });

      return result;
    } catch (error: unknown) {
      if (error instanceof HttpsError) throw error;
      console.error("lookupWord error:", error);
      throw new HttpsError(
        "internal",
        "検索に失敗しました。しばらく待ってからお試しください。"
      );
    }
  }
);

export const gradeWriting = onCall(
  {
    secrets: [openaiApiKey],
    region: "asia-northeast1",
    maxInstances: 10,
    cors: true,
    invoker: "public",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    // Check token budget and get user's plan
    const { plan } = await checkTokenBudget(request.auth.uid, "gradeWriting");

    const { prompt, userAnswer, lang } = request.data as GradeRequest;

    if (!prompt || !userAnswer) {
      throw new HttpsError(
        "invalid-argument",
        "お題と回答が必要です"
      );
    }

    // Validate input lengths
    if (userAnswer.length > INPUT_LIMITS.userAnswer) {
      throw new HttpsError(
        "invalid-argument",
        `回答が長すぎます（最大${INPUT_LIMITS.userAnswer}文字）`
      );
    }

    if (prompt.length > INPUT_LIMITS.prompt) {
      throw new HttpsError(
        "invalid-argument",
        "お題のデータが不正です"
      );
    }

    if (userAnswer.trim().split(/\s+/).length < 3) {
      throw new HttpsError(
        "invalid-argument",
        "回答が短すぎます。もう少し書いてみてください。"
      );
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey.value(),
    });

    // Use GPT-4o for Pro users, GPT-4o-mini for free users
    const model = plan === "pro" ? "gpt-4o" : "gpt-4o-mini";

    try {
      const systemMessage = buildGradingSystemMessage(
        prompt,
        userAnswer,
        lang || "ja"
      );

      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: systemMessage }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new HttpsError("internal", "AIからの応答が空です");
      }

      // Record actual token usage
      const tokensUsed = completion.usage?.total_tokens || ESTIMATED_TOKENS.gradeWriting;
      await recordTokenUsage(request.auth.uid, tokensUsed, "gradeWriting");

      const result = parseJsonResponse(content) as {
        overallRank: string;
        grammarRank: string;
        vocabularyRank: string;
        structureRank: string;
        contentRank: string;
        summary?: string;
        improvements: Array<{
          original: string;
          suggested: string;
          explanation: string;
          type: string;
        }>;
        vocabularyItems?: Array<{
          term: string;
          meaning: string;
          type: "word" | "expression";
        }>;
        modelAnswer: string;
      };

      return result;
    } catch (error: unknown) {
      if (error instanceof HttpsError) throw error;
      console.error("gradeWriting error:", error);
      throw new HttpsError(
        "internal",
        "添削に失敗しました。しばらく待ってからお試しください。"
      );
    }
  }
);

// ============ Daily Prompts (Cached) ============

function getTodayJST(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

interface DailyPromptEntry {
  prompt: string;
  hint: string;
  recommendedWords: number;
}

interface DailyPromptsData {
  goal: DailyPromptEntry;
  hobby: DailyPromptEntry;
  news: DailyPromptEntry;
  generatedAt: FirebaseFirestore.FieldValue;
}

export const getDailyPrompts = onCall(
  {
    secrets: [openaiApiKey],
    region: "asia-northeast1",
    maxInstances: 5,
    memory: "128MiB",
    cors: true,
    invoker: "public",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    const dateStr = getTodayJST();
    const docRef = db.collection("dailyPrompts").doc(dateStr);

    // Check cache first
    const cached = await docRef.get();
    if (cached.exists) {
      const data = cached.data()!;
      return {
        goal: data.goal,
        hobby: data.hobby,
        news: data.news,
      };
    }

    // Generate all 3 mode prompts in a single API call
    const openai = new OpenAI({
      apiKey: openaiApiKey.value(),
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `あなたは英語ライティング学習サービスの出題者です。今日（${dateStr}）の日替わりお題を3つ生成してください。
全ユーザー共通のお題なので、特定のレベルに偏らず、幅広い学習者が取り組めるテーマにしてください。

【3つのモード】
1. goal（目標特化）: ビジネスメール、レポート、プレゼンなど実務的なシチュエーション
2. hobby（趣味・興味）: 趣味、日常生活、文化、エンタメなど楽しいテーマ
3. news（ニュース英作文）: 社会問題、テクノロジー、環境など意見を述べるテーマ

【出力形式】
以下のJSON形式のみを出力してください：
{
  "goal": {
    "prompt": "お題（日本語で、具体的なシチュエーション設定）",
    "hint": "役立つ英語表現のヒント（英語で1〜2個）",
    "recommendedWords": 80
  },
  "hobby": {
    "prompt": "お題（日本語で、具体的な質問やシチュエーション）",
    "hint": "役立つ英語表現のヒント（英語で1〜2個）",
    "recommendedWords": 60
  },
  "news": {
    "prompt": "お題（日本語で、意見を求める形式）",
    "hint": "役立つ英語表現のヒント（英語で1〜2個）",
    "recommendedWords": 100
  }
}

お題は毎日異なる内容にし、具体的で取り組みやすいものにしてください。
推奨語数は goal=70〜100, hobby=50〜80, news=80〜120 の範囲で設定してください。`,
          },
        ],
        temperature: 0.9,
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new HttpsError("internal", "AIからの応答が空です");
      }

      const result = parseJsonResponse(content) as {
        goal: DailyPromptEntry;
        hobby: DailyPromptEntry;
        news: DailyPromptEntry;
      };

      // Cache in Firestore
      const toSave: DailyPromptsData = {
        goal: result.goal,
        hobby: result.hobby,
        news: result.news,
        generatedAt: FieldValue.serverTimestamp(),
      };
      await docRef.set(toSave);

      return {
        goal: result.goal,
        hobby: result.hobby,
        news: result.news,
      };
    } catch (error: unknown) {
      if (error instanceof HttpsError) throw error;
      console.error("getDailyPrompts error:", error);
      throw new HttpsError(
        "internal",
        "日替わりお題の生成に失敗しました。しばらく待ってからお試しください。"
      );
    }
  }
);

// ============ Test: Plan Switch (Development Only) ============

interface TestPlanSwitchRequest {
  plan: "free" | "pro";
}

export const testSwitchPlan = onCall(
  {
    region: "asia-northeast1",
    memory: "128MiB",
    cors: true,
    invoker: "public",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    const { plan } = request.data as TestPlanSwitchRequest;

    if (plan !== "free" && plan !== "pro") {
      throw new HttpsError("invalid-argument", "無効なプランです");
    }

    const uid = request.auth.uid;
    const userRef = db.doc(`users/${uid}`);
    const { periodStart, periodEnd } = getMonthlyPeriod();

    try {
      // Update plan and reset token usage for testing
      await userRef.update({
        plan,
        tokenUsage: {
          tokensUsed: 0,
          periodStart: periodStart,
          periodEnd: periodEnd,
          lastUpdated: FieldValue.serverTimestamp(),
        },
      });
      return { success: true, plan };
    } catch (error) {
      console.error("testSwitchPlan error:", error);
      throw new HttpsError("internal", "プランの変更に失敗しました");
    }
  }
);

// ============ Ask Follow-up Question (Chat) ============

interface AskFollowUpRequest {
  writingContext: {
    prompt: string;
    userAnswer: string;
    modelAnswer: string;
    improvements: Array<{
      original: string;
      suggested: string;
      explanation: string;
      type: string;
    }>;
  };
  question: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  improvementContext?: {
    index: number;
    original: string;
    suggested: string;
    explanation: string;
  };
  lang?: "ja" | "en";
}

// Estimated tokens for follow-up questions
const FOLLOWUP_ESTIMATED_TOKENS = 800;

export const askFollowUp = onCall(
  {
    secrets: [openaiApiKey],
    region: "asia-northeast1",
    maxInstances: 10,
    memory: "128MiB",
    cors: true,
    invoker: "public",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    const { writingContext, question, conversationHistory, improvementContext, lang } =
      request.data as AskFollowUpRequest;

    if (!writingContext || !question) {
      throw new HttpsError("invalid-argument", "必要なパラメータが不足しています");
    }

    // Validate question length
    if (question.length > 500) {
      throw new HttpsError("invalid-argument", "質問が長すぎます（最大500文字）");
    }

    // Limit conversation history to prevent token abuse
    const limitedHistory = (conversationHistory || []).slice(-6); // Last 3 exchanges

    // Check token budget
    await checkTokenBudget(request.auth.uid, "lookupWord"); // Reuse lookupWord budget for chat

    const openai = new OpenAI({
      apiKey: openaiApiKey.value(),
    });

    const effectiveLang = lang || "ja";
    const langInstruction =
      effectiveLang === "ja"
        ? "回答は日本語で、分かりやすく説明してください。"
        : "Please respond in English with clear explanations.";

    // Build context-aware system message
    let contextSection = `【添削の文脈】
お題: ${writingContext.prompt}

ユーザーの回答:
${writingContext.userAnswer}

模範解答:
${writingContext.modelAnswer}

改善ポイント:
${writingContext.improvements.map((imp, i) => `${i + 1}. "${imp.original}" → "${imp.suggested}" (${imp.explanation})`).join("\n")}`;

    // If asking about a specific improvement, highlight it
    if (improvementContext) {
      contextSection += `

【質問対象の改善ポイント】
- 元の表現: "${improvementContext.original}"
- 改善案: "${improvementContext.suggested}"
- 解説: "${improvementContext.explanation}"`;
    }

    const systemMessage = `あなたは英語ライティングの先生です。ユーザーが添削結果について質問しています。
${langInstruction}

${contextSection}

【回答のガイドライン】
- 質問に直接的かつ簡潔に答えてください
- 必要に応じて追加の例文や類似表現を示してください
- 難しい文法用語は避け、分かりやすく説明してください
- 回答は100〜200文字程度を目安にしてください`;

    try {
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemMessage },
        ...limitedHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content: question },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new HttpsError("internal", "AIからの応答が空です");
      }

      // Record token usage
      const tokensUsed = completion.usage?.total_tokens || FOLLOWUP_ESTIMATED_TOKENS;
      await recordTokenUsage(request.auth.uid, tokensUsed, "lookupWord");

      return {
        answer: content,
        tokensUsed,
      };
    } catch (error: unknown) {
      if (error instanceof HttpsError) throw error;
      console.error("askFollowUp error:", error);
      throw new HttpsError(
        "internal",
        "回答の生成に失敗しました。しばらく待ってからお試しください。"
      );
    }
  }
);

// ============ Get Token Usage ============

export const getTokenUsage = onCall(
  {
    region: "asia-northeast1",
    memory: "128MiB",
    cors: true,
    invoker: "public",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    const uid = request.auth.uid;
    const profileRef = db.doc(`users/${uid}`);
    const { periodStart, periodEnd } = getMonthlyPeriod();

    const profileSnap = await profileRef.get();
    if (!profileSnap.exists) {
      throw new HttpsError("not-found", "ユーザーが見つかりません");
    }

    const profileData = profileSnap.data()!;
    const plan: string = profileData.plan || "free";
    const tokenLimit = TOKEN_LIMITS[plan] || TOKEN_LIMITS.free;
    const tokenUsage = profileData.tokenUsage || {};

    // Check if usage is from current period
    const storedPeriodStart = tokenUsage.periodStart?.toDate?.() || new Date(0);
    let tokensUsed = 0;
    if (storedPeriodStart >= periodStart) {
      tokensUsed = tokenUsage.tokensUsed || 0;
    }

    // Calculate days until reset
    const daysUntilReset = Math.ceil((periodEnd.getTime() - Date.now()) / (24 * 3600_000));

    return {
      tokensUsed,
      tokenLimit,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      daysUntilReset,
      plan,
    };
  }
);

// ============ Delete Account ============

async function deleteCollection(
  collectionRef: FirebaseFirestore.CollectionReference,
  batchSize = 100
): Promise<number> {
  let totalDeleted = 0;

  while (true) {
    const snapshot = await collectionRef.limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    totalDeleted += snapshot.size;

    if (snapshot.size < batchSize) break;
  }

  return totalDeleted;
}

export const deleteAccount = onCall(
  {
    region: "asia-northeast1",
    memory: "256MiB",
    timeoutSeconds: 120,
    cors: true,
    invoker: "public",
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "ログインが必要です");
    }

    const uid = request.auth.uid;
    const auth = getAuth();

    try {
      // Delete user's writings
      const writingsRef = db.collection(`users/${uid}/writings`);
      const writingsDeleted = await deleteCollection(writingsRef);

      // Delete user's vocab entries
      const vocabRef = db.collection(`users/${uid}/vocab`);
      const vocabDeleted = await deleteCollection(vocabRef);

      // Delete user profile document
      await db.doc(`users/${uid}`).delete();

      // Delete Firebase Auth user
      await auth.deleteUser(uid);

      console.log(`Account deleted: ${uid}, writings: ${writingsDeleted}, vocab: ${vocabDeleted}`);

      return {
        success: true,
        deleted: {
          writings: writingsDeleted,
          vocab: vocabDeleted,
        },
      };
    } catch (error: unknown) {
      console.error("deleteAccount error:", error);
      throw new HttpsError(
        "internal",
        "アカウントの削除に失敗しました。サポートまでお問い合わせください。"
      );
    }
  }
);
