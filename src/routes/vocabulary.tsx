import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useUpgradeModal } from "@/contexts/upgrade-modal-context";
import {
  getVocabulary,
  deleteVocab,
  saveVocab,
  getDecks,
  deleteDeck,
  updateDeck,
} from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DictionaryPanel } from "@/components/writing/dictionary-panel";
import { DeckGeneratorDialog } from "@/components/vocabulary/deck-generator-dialog";
import { DeckSelector } from "@/components/vocabulary/deck-selector";
import {
  BookOpen,
  MessageSquareText,
  Search,
  Plus,
  Trash2,
  X,
  Crown,
  Info,
  Sparkles,
  Languages,
  Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { VocabEntry, VocabType, VocabDeck } from "@/types";

// 無料プランの単語帳上限
const FREE_PLAN_VOCAB_LIMIT = 50;
// デッキ関連の上限
const FREE_PLAN_DECK_LIMIT = 3;  // 無料プランのデッキ数上限
const MAX_VOCAB_PER_DECK = 200;  // 1デッキあたりの単語数上限

export default function VocabularyPage() {
  const { user, profile } = useAuth();
  const { open: openUpgradeModal } = useUpgradeModal();
  const isFreePlan = profile?.plan !== "pro";
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [allEntries, setAllEntries] = useState<VocabEntry[]>([]); // All entries for counting
  const [decks, setDecks] = useState<VocabDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null); // null = "My Vocabulary"
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "word" | "expression">(
    "all"
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [deckGeneratorOpen, setDeckGeneratorOpen] = useState(false);
  const [vocabType, setVocabType] = useState<VocabType>("word");
  const [vocabTerm, setVocabTerm] = useState("");
  const [vocabMeaning, setVocabMeaning] = useState("");
  const [vocabExample, setVocabExample] = useState("");
  const [saving, setSaving] = useState(false);

  // Load vocabulary for selected deck
  const loadVocabulary = useCallback(async (deckId: string | null) => {
    if (!user) return;
    try {
      const data = await getVocabulary(user.uid, 500, deckId);
      setEntries(data);
    } catch {
      // Silent fail
    }
  }, [user]);

  // Reload everything (vocabulary + decks)
  const reloadAll = useCallback(async () => {
    if (!user) return;
    try {
      const [vocabData, decksData, allVocabData] = await Promise.all([
        getVocabulary(user.uid, 500, selectedDeckId),
        getDecks(user.uid),
        getVocabulary(user.uid, 1000), // Get all for total count
      ]);
      setEntries(vocabData);
      setDecks(decksData);
      setAllEntries(allVocabData);
    } catch {
      // Silent fail
    }
  }, [user, selectedDeckId]);

  // Reload vocabulary when dictionary panel adds new words
  const reloadVocabulary = useCallback(async () => {
    if (!user) return;
    try {
      const [vocabData, allVocabData] = await Promise.all([
        getVocabulary(user.uid, 500, selectedDeckId),
        getVocabulary(user.uid, 1000),
      ]);
      setEntries(vocabData);
      setAllEntries(allVocabData);
    } catch {
      // Silent fail - dictionary panel shows its own toast
    }
  }, [user, selectedDeckId]);

  // Initial load
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [vocabData, decksData, allVocabData] = await Promise.all([
          getVocabulary(user.uid, 500, null), // Default to "My Vocabulary"
          getDecks(user.uid),
          getVocabulary(user.uid, 1000),
        ]);
        setEntries(vocabData);
        setDecks(decksData);
        setAllEntries(allVocabData);
      } catch {
        const stored = localStorage.getItem("writto-vocab");
        if (stored) {
          const parsed = JSON.parse(stored);
          const entries = parsed.map((e: Record<string, unknown>) => ({
            ...e,
            createdAt: new Date(e.createdAt as string),
          }));
          setEntries(entries);
          setAllEntries(entries);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  // Reload vocabulary when selected deck changes
  useEffect(() => {
    if (!loading) {
      loadVocabulary(selectedDeckId);
    }
  }, [selectedDeckId, loadVocabulary, loading]);

  // Handle deck deletion
  const handleDeleteDeck = async (deckId: string) => {
    if (!user) return;
    try {
      await deleteDeck(user.uid, deckId);
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      if (selectedDeckId === deckId) {
        setSelectedDeckId(null);
      }
      // Reload all entries count
      const allVocabData = await getVocabulary(user.uid, 1000);
      setAllEntries(allVocabData);
    } catch {
      // Silent fail
    }
  };

  // Handle deck rename
  const handleRenameDeck = async (deckId: string, newName: string) => {
    if (!user) return;
    try {
      await updateDeck(user.uid, deckId, { name: newName });
      setDecks((prev) =>
        prev.map((d) => (d.id === deckId ? { ...d, name: newName } : d))
      );
    } catch {
      // Silent fail
    }
  };

  // Default vocabulary count (entries without deckId)
  const defaultVocabCount = allEntries.filter((e) => !e.deckId).length;

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    try {
      await deleteVocab(user.uid, entryId);
    } catch {
      // Fallback: remove from localStorage
      const stored = JSON.parse(
        localStorage.getItem("writto-vocab") || "[]"
      );
      const filtered = stored.filter(
        (e: { id: string }) => e.id !== entryId
      );
      localStorage.setItem("writto-vocab", JSON.stringify(filtered));
    }
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  // 無料プランの上限チェック（全単語で計算）
  const totalVocabCount = allEntries.length;
  const isAtLimit = isFreePlan && totalVocabCount >= FREE_PLAN_VOCAB_LIMIT;
  const remainingSlots = isFreePlan ? Math.max(0, FREE_PLAN_VOCAB_LIMIT - totalVocabCount) : Infinity;

  const handleAdd = async () => {
    if (!user || !vocabTerm.trim()) return;
    // 無料プランで上限に達している場合は追加不可
    if (isAtLimit) return;
    setSaving(true);
    try {
      const id = await saveVocab(user.uid, {
        type: vocabType,
        term: vocabTerm,
        meaning: vocabMeaning,
        example: vocabExample,
      }, selectedDeckId || undefined);

      const newEntry: VocabEntry = {
        id,
        type: vocabType,
        term: vocabTerm,
        meaning: vocabMeaning,
        example: vocabExample,
        reviewCount: 0,
        createdAt: new Date(),
        ...(selectedDeckId && { deckId: selectedDeckId }),
      };

      setEntries((prev) => [newEntry, ...prev]);
      setAllEntries((prev) => [newEntry, ...prev]);

      // Update deck vocab count in local state
      if (selectedDeckId) {
        setDecks((prev) =>
          prev.map((d) =>
            d.id === selectedDeckId
              ? { ...d, vocabCount: d.vocabCount + 1 }
              : d
          )
        );
      }
    } catch {
      // Fallback to localStorage
      const newEntry = {
        id: `local-${Date.now()}`,
        type: vocabType,
        term: vocabTerm,
        meaning: vocabMeaning,
        example: vocabExample,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
      const stored = JSON.parse(
        localStorage.getItem("writto-vocab") || "[]"
      );
      stored.unshift(newEntry);
      localStorage.setItem("writto-vocab", JSON.stringify(stored));
      setEntries((prev) => [
        { ...newEntry, createdAt: new Date() } as VocabEntry,
        ...prev,
      ]);
    } finally {
      setSaving(false);
      setDialogOpen(false);
      setVocabTerm("");
      setVocabMeaning("");
      setVocabExample("");
    }
  };

  const handleCloseDictionary = useCallback(() => {
    setDictionaryOpen(false);
    reloadVocabulary();
  }, [reloadVocabulary]);

  const filtered = entries.filter((e) => {
    const matchesTab =
      activeTab === "all" || e.type === activeTab;
    const matchesSearch =
      !searchQuery ||
      e.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const wordCount = entries.filter((e) => e.type === "word").length;
  const expressionCount = entries.filter((e) => e.type === "expression").length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl">単語帳</h1>
            <p className="text-muted-foreground">
              学習した単語や表現をまとめて管理
              {isFreePlan && (
                <span className="ml-2 text-sm">
                  （{totalVocabCount}/{FREE_PLAN_VOCAB_LIMIT}件）
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={dictionaryOpen ? "default" : "outline"}
              className="gap-2"
              onClick={() => setDictionaryOpen(!dictionaryOpen)}
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">辞書検索</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setDeckGeneratorOpen(true)}
              disabled={isAtLimit}
            >
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">AI生成</span>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-2"
              disabled={allEntries.length < 4}
            >
              <Link to="/vocabulary/quiz">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">クイズ</span>
              </Link>
            </Button>
            <Button
              className="gap-2"
              onClick={() => setDialogOpen(true)}
              disabled={isAtLimit}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">追加</span>
            </Button>
          </div>
        </div>

        {/* Deck Selector */}
        <div className="flex items-center gap-3">
          <DeckSelector
            decks={decks}
            selectedDeckId={selectedDeckId}
            onSelect={setSelectedDeckId}
            onDelete={handleDeleteDeck}
            onRename={handleRenameDeck}
            defaultVocabCount={defaultVocabCount}
          />
          {selectedDeckId && (
            <p className="text-sm text-muted-foreground">
              {decks.find((d) => d.id === selectedDeckId)?.description || "AIで生成されたデッキ"}
            </p>
          )}
        </div>

        {/* Free Plan Limitation Banner */}
        {isFreePlan && (
          <Card className={`${isAtLimit ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" : "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <Info className={`h-5 w-5 shrink-0 ${isAtLimit ? "text-red-600 dark:text-red-500" : "text-amber-600 dark:text-amber-500"}`} />
              <div className="flex-1">
                <p className={`text-sm ${isAtLimit ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200"}`}>
                  {isAtLimit ? (
                    <>無料プランの上限（{FREE_PLAN_VOCAB_LIMIT}件）に達しました</>
                  ) : (
                    <>無料プランでは{FREE_PLAN_VOCAB_LIMIT}件まで登録できます（残り{remainingSlots}件）</>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className={`gap-1.5 ${isAtLimit ? "border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30" : "border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"}`}
                onClick={openUpgradeModal}
              >
                <Crown className="h-3.5 w-3.5" />
                Proで無制限に
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats - Show for current deck */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">単語</p>
                <p className="font-serif text-xl font-bold">{wordCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <MessageSquareText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">表現</p>
                <p className="font-serif text-xl font-bold">{expressionCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedDeckId ? "デッキ内" : "My単語帳"}
                </p>
                <p className="font-serif text-xl font-bold">{entries.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Tabs */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="単語や表現を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              setActiveTab(v as "all" | "word" | "expression")
            }
          >
            <TabsList>
              <TabsTrigger value="all">すべて ({entries.length})</TabsTrigger>
              <TabsTrigger value="word">単語 ({wordCount})</TabsTrigger>
              <TabsTrigger value="expression">
                表現 ({expressionCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Entries */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/30" />
              <div className="text-center">
                <p className="font-medium">
                  {searchQuery
                    ? "該当する単語・表現が見つかりません"
                    : selectedDeckId
                    ? "このデッキは空です"
                    : "まだ単語・表現が登録されていません"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "検索条件を変更してください"
                    : "単語を追加してみましょう"}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  最初の単語を追加
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <Card
                key={entry.id}
                className="group transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            entry.type === "word"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-accent/10 text-accent border-accent/20"
                          }
                        >
                          {entry.type === "word" ? "単語" : "表現"}
                        </Badge>
                        <span className="font-medium font-mono">
                          {entry.term}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.meaning}
                      </p>
                      {entry.example && (
                        <p className="text-sm italic text-muted-foreground/70">
                          {entry.example}
                        </p>
                      )}
                      {entry.source && (
                        <p className="text-xs text-muted-foreground/50">
                          出典: {entry.source}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">単語・表現を追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={vocabType === "word" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVocabType("word")}
                >
                  単語
                </Button>
                <Button
                  variant={vocabType === "expression" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVocabType("expression")}
                >
                  表現
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {vocabType === "word" ? "単語" : "表現"}
                </label>
                <Input
                  value={vocabTerm}
                  onChange={(e) => setVocabTerm(e.target.value)}
                  placeholder={
                    vocabType === "word"
                      ? "e.g., information"
                      : "e.g., In my opinion..."
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">意味・解説</label>
                <Input
                  value={vocabMeaning}
                  onChange={(e) => setVocabMeaning(e.target.value)}
                  placeholder="日本語で意味や使い方を記入"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">例文（任意）</label>
                <Textarea
                  value={vocabExample}
                  onChange={(e) => setVocabExample(e.target.value)}
                  placeholder="例文を入力"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!vocabTerm.trim() || saving}
                >
                  {saving ? "保存中..." : "登録する"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deck Generator Dialog */}
        <DeckGeneratorDialog
          open={deckGeneratorOpen}
          onOpenChange={setDeckGeneratorOpen}
          onGenerated={(deckId) => {
            reloadAll();
            if (deckId) {
              setSelectedDeckId(deckId);
            }
          }}
          currentVocabCount={totalVocabCount}
          vocabLimit={FREE_PLAN_VOCAB_LIMIT}
          isFreePlan={isFreePlan}
          existingDecks={decks}
          deckLimit={FREE_PLAN_DECK_LIMIT}
          maxVocabPerDeck={MAX_VOCAB_PER_DECK}
        />
      </div>

      {/* Dictionary Side Panel */}
      {dictionaryOpen && (
        <>
          {/* Mobile overlay backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={handleCloseDictionary}
          />

          {/* Panel */}
          <aside
            className={[
              "z-50 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg",
              // Mobile: fixed slide-in from right
              "fixed inset-y-0 right-0 w-[340px] rounded-l-xl rounded-r-none lg:rounded-xl",
              // Desktop: sticky side column
              "lg:relative lg:inset-auto lg:w-[360px] lg:shrink-0 lg:shadow-none",
              "lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]",
            ].join(" ")}
          >
            <DictionaryPanel
              onClose={handleCloseDictionary}
              emptyMessage="単語や表現を検索して単語帳に追加できます"
            />
          </aside>
        </>
      )}
    </div>
  );
}
