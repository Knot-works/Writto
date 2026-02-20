import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createDeck, saveVocabBatch } from "@/lib/firestore";
import { toast } from "sonner";
import {
  callGenerateVocabulary,
  type VocabGenerationType,
  type GeneratedVocabItem,
} from "@/lib/functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Sparkles,
  Check,
  AlertCircle,
  Briefcase,
  Monitor,
  MessageCircle,
  Plane,
  GraduationCap,
  Heart,
  ChevronLeft,
  Wand2,
  Minus,
  Plus,
  FolderPlus,
  Folder,
} from "lucide-react";
import type { Level, VocabDeck } from "@/types";

interface DeckGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (deckId?: string) => void;
  currentVocabCount: number;
  vocabLimit: number;
  isFreePlan: boolean;
  existingDecks: VocabDeck[];
  deckLimit: number;        // Max decks for free plan
  maxVocabPerDeck: number;  // Max vocabulary per deck
}

const CATEGORIES = [
  { id: "business", label: "ビジネス", icon: Briefcase },
  { id: "it", label: "IT・テクノロジー", icon: Monitor },
  { id: "daily", label: "日常会話", icon: MessageCircle },
  { id: "travel", label: "旅行", icon: Plane },
  { id: "academic", label: "学術・論文", icon: GraduationCap },
  { id: "medical", label: "医療・健康", icon: Heart },
];

const VOCAB_TYPES: { id: VocabGenerationType; label: string; desc: string }[] = [
  { id: "both", label: "両方", desc: "単語と熟語をバランスよく" },
  { id: "word", label: "単語のみ", desc: "1語の英単語" },
  { id: "expression", label: "熟語のみ", desc: "フレーズ・表現" },
];

const LEVELS: { id: Level; label: string; desc: string }[] = [
  { id: "beginner", label: "初級", desc: "中学レベル" },
  { id: "intermediate", label: "中級", desc: "高校〜TOEIC600" },
  { id: "advanced", label: "上級", desc: "TOEIC800+" },
  { id: "native", label: "ネイティブ", desc: "TOEIC900+" },
];

const COUNT_MIN = 5;
const COUNT_MAX = 100;
const COUNT_STEP = 5;
const DECK_NAME_MAX_LENGTH = 50;

export function DeckGeneratorDialog({
  open,
  onOpenChange,
  onGenerated,
  currentVocabCount,
  vocabLimit,
  isFreePlan,
  existingDecks,
  deckLimit,
  maxVocabPerDeck,
}: DeckGeneratorDialogProps) {
  const { user, profile } = useAuth();
  const [theme, setTheme] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vocabType, setVocabType] = useState<VocabGenerationType>("both");
  const [level, setLevel] = useState<Level>("intermediate");
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<GeneratedVocabItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "select">("input");

  // Save destination: "new" for new deck, or existing deck ID
  const [saveDestination, setSaveDestination] = useState<"new" | string>("new");
  const [newDeckName, setNewDeckName] = useState("");

  const remainingSlots = isFreePlan ? vocabLimit - currentVocabCount : Infinity;

  // Deck limit check
  const isAtDeckLimit = isFreePlan && existingDecks.length >= deckLimit;
  const canCreateNewDeck = !isAtDeckLimit;

  // Calculate remaining slots for selected deck
  const getSelectedDeckRemainingSlots = () => {
    if (saveDestination === "new") {
      return maxVocabPerDeck;
    }
    const selectedDeck = existingDecks.find((d) => d.id === saveDestination);
    return selectedDeck ? maxVocabPerDeck - selectedDeck.vocabCount : maxVocabPerDeck;
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      const category = CATEGORIES.find((c) => c.id === categoryId);
      if (category && theme === category.label) {
        setTheme("");
      }
      setSelectedCategory(null);
    } else {
      const prevCategory = CATEGORIES.find((c) => c.id === selectedCategory);
      const newCategory = CATEGORIES.find((c) => c.id === categoryId);

      if (newCategory) {
        if (!theme || (prevCategory && theme === prevCategory.label)) {
          setTheme(newCategory.label);
        }
      }
      setSelectedCategory(categoryId);
    }
  };

  const handleGenerate = async () => {
    if (!theme.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const result = await callGenerateVocabulary({
        theme: theme.trim(),
        category: selectedCategory || undefined,
        vocabType,
        count,
        level,
        lang: profile?.uiLanguage,
      });

      setGeneratedItems(result.vocabulary);
      setNewDeckName(theme.trim().slice(0, DECK_NAME_MAX_LENGTH));

      // Auto-select save destination if new deck not available
      if (isAtDeckLimit && existingDecks.length > 0) {
        // Find first deck with available space
        const availableDeck = existingDecks.find((d) => d.vocabCount < maxVocabPerDeck);
        if (availableDeck) {
          setSaveDestination(availableDeck.id);
        }
      }

      // Limit initial selection based on available slots
      const maxSelectable = Math.min(
        result.vocabulary.length,
        isFreePlan ? remainingSlots : result.vocabulary.length,
        maxVocabPerDeck
      );
      setSelectedItems(new Set(Array.from({ length: maxSelectable }, (_, i) => i)));
      setStep("select");
    } catch (err) {
      console.error("Failed to generate vocabulary:", err);
      setError("単語リストの生成に失敗しました。もう一度お試しください。");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      // Check limits: overall vocab limit (free plan) + deck capacity
      const deckSlots = getSelectedDeckRemainingSlots();
      const overallLimit = isFreePlan ? remainingSlots : Infinity;
      const maxItems = Math.min(overallLimit, deckSlots);

      if (newSelected.size >= maxItems) {
        return;
      }
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    const deckSlots = getSelectedDeckRemainingSlots();
    const overallLimit = isFreePlan ? remainingSlots : Infinity;
    const maxSelectable = Math.min(generatedItems.length, overallLimit, deckSlots);
    setSelectedItems(new Set(Array.from({ length: maxSelectable }, (_, i) => i)));
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleSave = async () => {
    if (!user || selectedItems.size === 0) return;

    setSaving(true);
    setError(null);

    try {
      const itemsToSave = generatedItems.filter((_, i) => selectedItems.has(i));
      let targetDeckId: string;

      if (saveDestination === "new") {
        // Create a new deck
        const deckName = newDeckName.trim() || theme.trim();
        targetDeckId = await createDeck(user.uid, {
          name: deckName.slice(0, DECK_NAME_MAX_LENGTH),
          description: selectedCategory
            ? `${CATEGORIES.find((c) => c.id === selectedCategory)?.label || ""} - ${LEVELS.find((l) => l.id === level)?.label || ""}`
            : `${LEVELS.find((l) => l.id === level)?.label || ""} レベル`,
          theme,
          category: selectedCategory || undefined,
          level,
        });
      } else {
        // Use existing deck
        targetDeckId = saveDestination;
      }

      // Save vocabulary to the deck (with duplicate prevention)
      const { savedIds, duplicateCount } = await saveVocabBatch(
        user.uid,
        itemsToSave.map((item) => ({
          type: item.type,
          term: item.term,
          meaning: item.meaning,
          example: item.example,
          source: `AI生成: ${theme}`,
        })),
        targetDeckId
      );

      // Show appropriate message
      if (duplicateCount > 0) {
        if (savedIds.length > 0) {
          toast.success(`${savedIds.length}件を追加（${duplicateCount}件は重複のためスキップ）`);
        } else {
          toast.info(`すべての単語が既に登録されています`);
        }
      } else {
        toast.success(`${savedIds.length}件を追加しました`);
      }

      onGenerated(targetDeckId);
      handleClose();
    } catch (err) {
      console.error("Failed to save vocabulary:", err);
      setError("単語の保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setTheme("");
    setSelectedCategory(null);
    setVocabType("both");
    setLevel("intermediate");
    setCount(10);
    setGeneratedItems([]);
    setSelectedItems(new Set());
    setError(null);
    setStep("input");
    setSaveDestination("new");
    setNewDeckName("");
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep("input");
    setGeneratedItems([]);
    setSelectedItems(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="relative px-8 pt-6 pb-5 border-b border-border/50 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-3 font-serif text-2xl">
              <Wand2 className="h-6 w-6 text-primary" />
              単語デッキを生成
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {step === "input" ? (
            <div className="px-8 py-6 space-y-6">
              {/* Theme input */}
              <div className="space-y-2">
                <label className="text-base font-medium">テーマ・キーワード</label>
                <Input
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="例: プレゼンテーション, 海外旅行, プログラミング..."
                  className="h-12 text-base"
                />
              </div>

              {/* Category selection */}
              <div className="space-y-2">
                <label className="text-base font-medium">
                  カテゴリ
                  <span className="text-sm font-normal text-muted-foreground ml-2">（任意）</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`
                          flex items-center gap-2 px-4 py-2.5 rounded-lg border text-base transition-all
                          ${isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vocab type */}
              <div className="space-y-2">
                <label className="text-base font-medium">種類</label>
                <div className="flex gap-3">
                  {VOCAB_TYPES.map((type) => {
                    const isSelected = vocabType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setVocabType(type.id)}
                        className={`
                          flex-1 py-3 px-4 rounded-xl border-2 text-base font-medium transition-all
                          ${isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                          }
                        `}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <label className="text-base font-medium">難易度</label>
                <div className="grid grid-cols-4 gap-2">
                  {LEVELS.map((lvl) => {
                    const isSelected = level === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => setLevel(lvl.id)}
                        className={`
                          py-3 px-2 rounded-xl border-2 transition-all text-center
                          ${isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/40"
                          }
                        `}
                      >
                        <span className={`block text-base font-medium ${isSelected ? "text-primary" : ""}`}>
                          {lvl.label}
                        </span>
                        <span className="block text-[11px] text-muted-foreground mt-0.5">
                          {lvl.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Count */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-base font-medium">生成数</label>
                  {isFreePlan && remainingSlots < COUNT_MAX && (
                    <span className="text-sm text-muted-foreground">
                      残り{remainingSlots}件
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {/* Stepper control */}
                  <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden">
                    <button
                      onClick={() => setCount(Math.max(COUNT_MIN, count - COUNT_STEP))}
                      disabled={count <= COUNT_MIN}
                      className="flex items-center justify-center w-12 h-12 hover:bg-muted/50 transition-colors disabled:opacity-30"
                      aria-label="減らす"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          const maxAllowed = isFreePlan ? Math.min(COUNT_MAX, remainingSlots) : COUNT_MAX;
                          setCount(Math.max(COUNT_MIN, Math.min(maxAllowed, val)));
                        }
                      }}
                      min={COUNT_MIN}
                      max={isFreePlan ? Math.min(COUNT_MAX, remainingSlots) : COUNT_MAX}
                      className="w-16 h-12 text-center text-xl font-medium bg-transparent border-x border-border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => {
                        const maxAllowed = isFreePlan ? Math.min(COUNT_MAX, remainingSlots) : COUNT_MAX;
                        setCount(Math.min(maxAllowed, count + COUNT_STEP));
                      }}
                      disabled={count >= (isFreePlan ? Math.min(COUNT_MAX, remainingSlots) : COUNT_MAX)}
                      className="flex items-center justify-center w-12 h-12 hover:bg-muted/50 transition-colors disabled:opacity-30"
                      aria-label="増やす"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Quick select buttons */}
                  <div className="flex gap-2">
                    {[10, 30, 50, 100].map((preset) => {
                      const isDisabled = isFreePlan && preset > remainingSlots;
                      return (
                        <button
                          key={preset}
                          onClick={() => !isDisabled && setCount(preset)}
                          disabled={isDisabled}
                          className={`
                            px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                            ${count === preset
                              ? "bg-primary/15 text-primary"
                              : isDisabled
                              ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                              : "bg-muted/50 hover:bg-muted text-muted-foreground"
                            }
                          `}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-base">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="px-8 py-6 space-y-4">
              {/* Selection header */}
              <div className="flex items-center justify-between">
                <p className="text-base">
                  <span className="font-semibold text-primary text-lg">{selectedItems.size}件</span>
                  <span className="text-muted-foreground ml-1">選択中</span>
                  {isFreePlan && (
                    <span className="text-muted-foreground ml-2">（残り{remainingSlots}件）</span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-9 px-3 text-sm">
                    全選択
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDeselectAll} className="h-9 px-3 text-sm">
                    全解除
                  </Button>
                </div>
              </div>

              {/* Generated items */}
              <div className="space-y-2 max-h-[28vh] overflow-y-auto">
                {generatedItems.map((item, index) => {
                  const isSelected = selectedItems.has(index);
                  const isDisabled = !isSelected && isFreePlan && selectedItems.size >= remainingSlots;

                  return (
                    <div
                      key={index}
                      onClick={() => !isDisabled && handleToggleItem(index)}
                      className={`
                        flex items-center gap-4 p-3.5 rounded-lg border transition-all
                        ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}
                        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleItem(index)}
                        disabled={isDisabled}
                        className="h-5 w-5"
                      />
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <span className="font-medium font-mono text-base">{item.term}</span>
                        <span className={`text-xs px-2 py-1 rounded ${item.type === "word" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                          {item.type === "word" ? "単語" : "表現"}
                        </span>
                        <span className="text-sm text-muted-foreground truncate">{item.meaning}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save destination */}
              <div className="space-y-2.5 pt-4 border-t border-border/50">
                <label className="text-base font-medium">保存先</label>
                <div className="flex flex-wrap gap-2.5">
                  {/* New deck option */}
                  <button
                    onClick={() => canCreateNewDeck && setSaveDestination("new")}
                    disabled={!canCreateNewDeck}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg border text-base transition-all
                      ${!canCreateNewDeck
                        ? "opacity-40 cursor-not-allowed"
                        : saveDestination === "new"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <FolderPlus className="h-4 w-4" />
                    新規デッキ
                  </button>

                  {/* Existing decks */}
                  {existingDecks.map((deck) => {
                    const isDeckFull = deck.vocabCount >= maxVocabPerDeck;
                    return (
                      <button
                        key={deck.id}
                        onClick={() => !isDeckFull && setSaveDestination(deck.id)}
                        disabled={isDeckFull}
                        className={`
                          flex items-center gap-2 px-4 py-2.5 rounded-lg border text-base transition-all
                          ${isDeckFull
                            ? "opacity-40 cursor-not-allowed"
                            : saveDestination === deck.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        <Folder className="h-4 w-4" />
                        <span className="truncate max-w-[120px]">{deck.name}</span>
                        <span className="text-sm text-muted-foreground">({deck.vocabCount})</span>
                      </button>
                    );
                  })}
                </div>
                {saveDestination === "new" && canCreateNewDeck && (
                  <Input
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value.slice(0, DECK_NAME_MAX_LENGTH))}
                    placeholder="デッキ名を入力"
                    className="h-11 text-base mt-2"
                    maxLength={DECK_NAME_MAX_LENGTH}
                  />
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-base">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t border-border/50 bg-muted/30 shrink-0">
          {step === "input" ? (
            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="px-6 h-12 text-base"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!theme.trim() || generating}
                className="gap-2 px-8 h-12 text-base"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    生成する
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="gap-2 h-12 text-base"
              >
                <ChevronLeft className="h-5 w-5" />
                戻る
              </Button>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="px-6 h-12 text-base"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={selectedItems.size === 0 || saving || (saveDestination === "new" && !newDeckName.trim())}
                  className="gap-2 px-8 h-12 text-base"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      {selectedItems.size}件を追加
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
