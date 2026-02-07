import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { saveVocab } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  BookOpen,
  Check,
  Loader2,
  Type,
  Quote,
  Plus,
  Sparkles,
} from "lucide-react";
import { type VocabularyItem } from "@/types";

interface LearningPointsProps {
  vocabularyItems?: VocabularyItem[];
  sourcePrompt?: string;
}

export function LearningPoints({
  vocabularyItems,
  sourcePrompt,
}: LearningPointsProps) {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // If no vocabulary items, don't render
  if (!vocabularyItems || vocabularyItems.length === 0) {
    return null;
  }

  // Create items with IDs
  const items = vocabularyItems.map((item, index) => ({
    ...item,
    id: `vocab-${index}`,
  }));

  // Toggle selection
  const toggleSelection = (id: string) => {
    if (addedIds.has(id)) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all unselected items
  const selectAll = () => {
    const allUnaddedIds = items
      .filter((item) => !addedIds.has(item.id))
      .map((item) => item.id);
    setSelectedIds(new Set(allUnaddedIds));
  };

  // Add selected items to vocabulary
  const handleAddSelected = async () => {
    if (!user || selectedIds.size === 0) return;

    setSaving(true);
    const toAdd = items.filter((item) => selectedIds.has(item.id));
    const successIds: string[] = [];

    try {
      for (const item of toAdd) {
        await saveVocab(user.uid, {
          type: item.type,
          term: item.term,
          meaning: item.meaning,
          example: "",
          tags: ["添削"],
          source: sourcePrompt,
        });
        successIds.push(item.id);
      }

      setAddedIds((prev) => new Set([...prev, ...successIds]));
      setSelectedIds(new Set());

      const wordCount = toAdd.filter((item) => item.type === "word").length;
      const exprCount = toAdd.filter((item) => item.type === "expression").length;
      const parts = [];
      if (wordCount > 0) parts.push(`単語${wordCount}件`);
      if (exprCount > 0) parts.push(`表現${exprCount}件`);
      toast.success(`${parts.join("、")}を単語帳に追加しました`);
    } catch (err) {
      console.error("Failed to save vocab:", err);
      toast.error("一部の項目の追加に失敗しました");
      if (successIds.length > 0) {
        setAddedIds((prev) => new Set([...prev, ...successIds]));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          successIds.forEach((id) => next.delete(id));
          return next;
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Count stats
  const totalCount = items.length;
  const addedCount = addedIds.size;
  const selectedCount = selectedIds.size;
  const remainingCount = totalCount - addedCount;

  const wordCount = items.filter((item) => item.type === "word").length;
  const exprCount = items.filter((item) => item.type === "expression").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
            <BookOpen className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-medium">
              単語・表現を追加
            </h2>
            <p className="text-xs text-muted-foreground">
              {wordCount > 0 && `単語${wordCount}件`}
              {wordCount > 0 && exprCount > 0 && "・"}
              {exprCount > 0 && `表現${exprCount}件`}
            </p>
          </div>
        </div>

        {remainingCount > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={selectAll}
            disabled={saving}
          >
            すべて選択
          </Button>
        )}
      </div>

      {/* Learning points grid */}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const isAdded = addedIds.has(item.id);
          const isSelected = selectedIds.has(item.id);
          const isWord = item.type === "word";

          return (
            <div
              key={item.id}
              onClick={() => !isAdded && !saving && toggleSelection(item.id)}
              role="button"
              tabIndex={isAdded || saving ? -1 : 0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isAdded && !saving) toggleSelection(item.id);
                }
              }}
              className={`
                group relative flex items-start gap-3 rounded-xl border p-4
                text-left transition-all duration-200
                ${
                  isAdded
                    ? "border-primary/30 bg-primary/5 cursor-default"
                    : isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/60 bg-card hover:border-border hover:shadow-sm"
                }
                ${!isAdded && !saving && "cursor-pointer"}
                ${(isAdded || saving) && "opacity-70"}
              `}
            >
              {/* Checkbox */}
              <div className="shrink-0 pt-0.5">
                {isAdded ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                ) : (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(item.id)}
                    disabled={saving}
                  />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Type indicator */}
                  <span
                    className={`
                      inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium
                      ${
                        isWord
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                          : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                      }
                    `}
                  >
                    {isWord ? (
                      <Type className="h-2.5 w-2.5" />
                    ) : (
                      <Quote className="h-2.5 w-2.5" />
                    )}
                    {isWord ? "単語" : "表現"}
                  </span>

                  {/* Term */}
                  <span className="font-mono font-semibold text-foreground">
                    {item.term}
                  </span>
                </div>

                {/* Meaning */}
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {item.meaning}
                </p>
              </div>

              {/* Add indicator on hover */}
              {!isAdded && !isSelected && (
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress & Add button */}
      <div
        className={`
          flex items-center justify-between rounded-xl border p-4
          ${
            remainingCount === 0
              ? "border-primary/30 bg-primary/5"
              : "border-dashed border-border/60 bg-muted/20"
          }
        `}
      >
        {remainingCount === 0 ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            すべて単語帳に追加しました！
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {addedCount > 0 && (
                <span className="mr-2">
                  <Check className="mr-1 inline h-3.5 w-3.5 text-primary" />
                  {addedCount}件追加済
                </span>
              )}
              {selectedCount > 0 && (
                <span className="font-medium text-foreground">
                  {selectedCount}件選択中
                </span>
              )}
              {selectedCount === 0 && addedCount === 0 && (
                <span>覚えたい項目を選択</span>
              )}
            </div>

            <Button
              onClick={handleAddSelected}
              disabled={saving || selectedCount === 0}
              size="sm"
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  追加中
                </>
              ) : (
                <>
                  <BookOpen className="h-3.5 w-3.5" />
                  単語帳に追加
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
