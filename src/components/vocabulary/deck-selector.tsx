import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  FolderOpen,
  Trash2,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import type { VocabDeck } from "@/types";

const DECK_NAME_MAX_LENGTH = 50;

interface DeckSelectorProps {
  decks: VocabDeck[];
  selectedDeckId: string | null; // null = "My Vocabulary" (default)
  onSelect: (deckId: string | null) => void;
  onDelete: (deckId: string) => void;
  onRename: (deckId: string, newName: string) => void;
  defaultVocabCount: number;
}

export function DeckSelector({
  decks,
  selectedDeckId,
  onSelect,
  onDelete,
  onRename,
  defaultVocabCount,
}: DeckSelectorProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<VocabDeck | null>(null);
  const [deckToRename, setDeckToRename] = useState<VocabDeck | null>(null);
  const [newDeckName, setNewDeckName] = useState("");

  const selectedDeck = selectedDeckId
    ? decks.find((d) => d.id === selectedDeckId)
    : null;

  const handleDeleteClick = (deck: VocabDeck, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeckToDelete(deck);
    setDeleteDialogOpen(true);
  };

  const handleRenameClick = (deck: VocabDeck, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeckToRename(deck);
    setNewDeckName(deck.name);
    setRenameDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deckToDelete) {
      onDelete(deckToDelete.id);
      if (selectedDeckId === deckToDelete.id) {
        onSelect(null); // Switch to default deck
      }
    }
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  const handleConfirmRename = () => {
    if (deckToRename && newDeckName.trim()) {
      onRename(deckToRename.id, newDeckName.trim().slice(0, DECK_NAME_MAX_LENGTH));
    }
    setRenameDialogOpen(false);
    setDeckToRename(null);
    setNewDeckName("");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 h-11 px-4 justify-between min-w-[200px]"
          >
            <div className="flex items-center gap-2">
              {selectedDeck ? (
                <>
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium truncate max-w-[150px]">
                    {selectedDeck.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({selectedDeck.vocabCount})
                  </span>
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">My単語帳</span>
                  <span className="text-xs text-muted-foreground">
                    ({defaultVocabCount})
                  </span>
                </>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[300px]">
          {/* Default deck */}
          <DropdownMenuItem
            onClick={() => onSelect(null)}
            className={`flex items-center gap-3 p-3 cursor-pointer ${
              selectedDeckId === null ? "bg-primary/5" : ""
            }`}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">My単語帳</p>
              <p className="text-xs text-muted-foreground">
                手動で追加した単語
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {defaultVocabCount}
            </span>
          </DropdownMenuItem>

          {decks.length > 0 && <DropdownMenuSeparator />}

          {/* AI generated decks */}
          {decks.map((deck) => (
            <DropdownMenuItem
              key={deck.id}
              onClick={() => onSelect(deck.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer group ${
                selectedDeckId === deck.id ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{deck.name}</p>
                {deck.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {deck.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-sm text-muted-foreground mr-1">
                  {deck.vocabCount}
                </span>
                <button
                  onClick={(e) => handleRenameClick(deck, e)}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors"
                  aria-label="デッキ名を変更"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => handleDeleteClick(deck, e)}
                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive transition-colors"
                  aria-label="デッキを削除"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </DropdownMenuItem>
          ))}

          {decks.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>AIデッキはまだありません</p>
              <p className="text-xs mt-1">「AI生成」から作成できます</p>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              デッキを削除しますか？
            </DialogTitle>
            <DialogDescription className="pt-2">
              「{deckToDelete?.name}」とその中の
              <span className="font-medium text-foreground">
                {deckToDelete?.vocabCount}件
              </span>
              の単語・表現がすべて削除されます。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              削除する
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>デッキ名を変更</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Input
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value.slice(0, DECK_NAME_MAX_LENGTH))}
                placeholder="デッキ名を入力"
                className="text-base"
                maxLength={DECK_NAME_MAX_LENGTH}
              />
              <p className="text-xs text-muted-foreground text-right">
                {newDeckName.length}/{DECK_NAME_MAX_LENGTH}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setRenameDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleConfirmRename}
                disabled={!newDeckName.trim()}
              >
                変更する
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
