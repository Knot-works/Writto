import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import { callLookupWord, isRateLimitError, getRateLimitMessage, type LookupResult } from "@/lib/functions";
import { saveVocab, deleteVocab } from "@/lib/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  Plus,
  Check,
  Loader2,
  Volume2,
  X,
  ChevronRight,
} from "lucide-react";
import type { VocabType } from "@/types";

interface DictionaryPanelProps {
  onClose?: () => void;
  /** External search trigger - when this changes, search will be triggered */
  searchTrigger?: { word: string; timestamp: number };
  /** Custom empty state message (default shows writing context message) */
  emptyMessage?: string;
}

export function DictionaryPanel({ onClose, searchTrigger, emptyMessage }: DictionaryPanelProps) {
  const { t } = useTranslation("app");
  const { user, profile } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LookupResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [savedTerms, setSavedTerms] = useState<Map<string, string>>(new Map());
  const [savingTerm, setSavingTerm] = useState<string | null>(null);
  const [removingTerm, setRemovingTerm] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSearchingRef = useRef(false);
  const lastSearchTriggerRef = useRef<number>(0);

  // For dictionary, use uiLanguage if set, otherwise fall back to explanationLang
  // This ensures Korean UI users get Korean dictionary results
  const dictionaryLang = profile?.uiLanguage === "ko" ? "ko" : profile?.explanationLang;

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isSearchingRef.current) return;
    isSearchingRef.current = true;
    setSearching(true);
    setResults([]);
    try {
      const response = await callLookupWord(query.trim(), dictionaryLang);
      setResults(response.results || []);
      if (!response.results?.length) {
        toast.info(t("dictionary.noResults"));
      }
    } catch (err) {
      console.error("Lookup error:", err);
      if (isRateLimitError(err)) {
        toast.error(getRateLimitMessage(err), { duration: 8000 });
      } else {
        toast.error(t("dictionary.searchError"));
      }
    } finally {
      isSearchingRef.current = false;
      setSearching(false);
    }
  }, [query, dictionaryLang, t]);

  // Handle external search trigger with cooldown to prevent rapid API calls
  useEffect(() => {
    const MIN_SEARCH_INTERVAL = 1000; // 1 second cooldown
    const now = Date.now();

    if (
      searchTrigger &&
      searchTrigger.timestamp > lastSearchTriggerRef.current
    ) {
      // Check cooldown - prevent searches within 1 second of last search
      const timeSinceLastSearch = now - lastSearchTriggerRef.current;
      if (timeSinceLastSearch < MIN_SEARCH_INTERVAL && lastSearchTriggerRef.current > 0) {
        // Update query but don't search (cooldown active)
        setQuery(searchTrigger.word);
        return;
      }

      lastSearchTriggerRef.current = now;
      setQuery(searchTrigger.word);
      // Trigger search after query is set
      setTimeout(async () => {
        if (!searchTrigger.word.trim() || isSearchingRef.current) return;
        isSearchingRef.current = true;
        setSearching(true);
        setResults([]);
        try {
          const response = await callLookupWord(searchTrigger.word.trim(), dictionaryLang);
          setResults(response.results || []);
          if (!response.results?.length) {
            toast.info(t("dictionary.noResults"));
          }
        } catch (err) {
          console.error("Lookup error:", err);
          if (isRateLimitError(err)) {
            toast.error(getRateLimitMessage(err), { duration: 8000 });
          } else {
            toast.error(t("dictionary.searchError"));
          }
        } finally {
          isSearchingRef.current = false;
          setSearching(false);
        }
      }, 50);
    }
  }, [searchTrigger, dictionaryLang, t]);

  const handleAddToVocab = async (result: LookupResult) => {
    if (!user) return;
    setSavingTerm(result.term);
    try {
      const vocabType: VocabType =
        result.partOfSpeech === "表現" || result.term.includes(" ")
          ? "expression"
          : "word";

      const vocabId = await saveVocab(user.uid, {
        type: vocabType,
        term: result.term,
        meaning: result.meaning,
        example: result.examples[0] || "",
        source: "dictionary",
      });

      setSavedTerms((prev) => new Map(prev).set(result.term, vocabId));
      toast.success(t("dictionary.addedToVocab", { term: result.term }));
    } catch (err) {
      console.error("Save vocab error:", err);
      toast.error(t("dictionary.addToVocabError"));
    } finally {
      setSavingTerm(null);
    }
  };

  const handleRemoveFromVocab = async (term: string) => {
    if (!user) return;
    const vocabId = savedTerms.get(term);
    if (!vocabId) return;

    setRemovingTerm(term);
    try {
      await deleteVocab(user.uid, vocabId);
      setSavedTerms((prev) => {
        const next = new Map(prev);
        next.delete(term);
        return next;
      });
      toast.success(t("dictionary.removedFromVocab", { term }));
    } catch (err) {
      console.error("Remove vocab error:", err);
      toast.error(t("dictionary.removeFromVocabError"));
    } finally {
      setRemovingTerm(null);
    }
  };

  const handleRelatedClick = (term: string) => {
    setQuery(term);
    setResults([]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-serif text-sm font-medium">{t("dictionary.title")}</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="border-b border-border/40 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={t("dictionary.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSearch()}
            maxLength={100}
            className="h-9 pl-9 pr-16 text-sm"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 h-7 -translate-y-1/2 px-2 text-xs font-medium text-primary hover:text-primary"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
          >
            {searching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              t("dictionary.search")
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {searching && (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{t("dictionary.searching")}</span>
          </div>
        )}

        {!searching && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {emptyMessage || t("dictionary.emptyMessage")}
            </p>
          </div>
        )}

        {results.map((result, i) => (
          <div
            key={`${result.term}-${i}`}
            className="border-b border-border/30 px-4 py-4 transition-colors last:border-0 hover:bg-muted/20"
          >
            {/* Term Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base font-bold leading-tight">
                    {result.term}
                  </h3>
                  {result.pronunciation && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Volume2 className="h-3 w-3" />
                      {result.pronunciation}
                    </span>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="mt-1.5 text-xs font-normal"
                >
                  {result.partOfSpeech}
                </Badge>
              </div>

              {/* Add/Remove Vocab */}
              <Button
                variant={savedTerms.has(result.term) ? "secondary" : "outline"}
                size="sm"
                className="h-8 shrink-0 gap-1.5 text-xs"
                disabled={
                  savingTerm === result.term || removingTerm === result.term
                }
                onClick={() =>
                  savedTerms.has(result.term)
                    ? handleRemoveFromVocab(result.term)
                    : handleAddToVocab(result)
                }
              >
                {savingTerm === result.term || removingTerm === result.term ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : savedTerms.has(result.term) ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                {savedTerms.has(result.term) ? t("dictionary.added") : t("dictionary.addToVocab")}
              </Button>
            </div>

            {/* Meaning */}
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {result.meaning}
            </p>

            {/* Examples */}
            {result.examples?.length > 0 && (
              <div className="mt-3 space-y-2">
                {result.examples.map((ex, j) => (
                  <p
                    key={j}
                    className="rounded-md bg-muted/40 px-3 py-2.5 text-sm leading-relaxed text-foreground/70"
                  >
                    {ex}
                  </p>
                ))}
              </div>
            )}

            {/* Related Expressions */}
            {result.related?.length > 0 && (
              <div className="mt-3">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground/70">
                  {t("dictionary.relatedTerms")}
                </span>
                <div className="flex flex-wrap gap-2">
                {result.related.map((rel) => (
                  <button
                    key={rel}
                    onClick={() => handleRelatedClick(rel)}
                    className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {rel}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
