import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";

interface SelectionPopoverProps {
  children: ReactNode;
  onAsk: (selectedText: string) => void;
  className?: string;
}

interface PopoverPosition {
  x: number;
  y: number;
}

export function SelectionPopover({ children, onAsk, className }: SelectionPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }

    const text = selection.toString().trim();

    // Check if selection is within our container
    if (!containerRef.current) {
      setIsVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;

    // Check if the selection is inside our container
    const isInContainer = containerRef.current.contains(commonAncestor);

    if (!isInContainer || text.length < 2) {
      setIsVisible(false);
      return;
    }

    // Get the position for the popover
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Position the popover at the top-right of the selection
    setPosition({
      x: Math.min(rect.right - containerRect.left, containerRect.width - 100),
      y: rect.top - containerRect.top - 40,
    });

    setSelectedText(text);
    setIsVisible(true);
  }, []);

  const handleClick = useCallback(() => {
    if (selectedText) {
      onAsk(selectedText);
      setIsVisible(false);
      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  }, [selectedText, onAsk]);

  // Listen to selection changes
  useEffect(() => {
    const handleMouseUp = () => {
      // Small delay to let selection finalize
      setTimeout(handleSelectionChange, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Hide popover when clicking outside of it
      const target = e.target as HTMLElement;
      if (!target.closest('[data-selection-popover]')) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      {children}

      {/* Floating popover */}
      {isVisible && position && (
        <div
          data-selection-popover
          className="absolute z-50 animate-fade-in"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <button
            onClick={handleClick}
            className="
              flex items-center gap-1.5 rounded-full
              bg-primary px-3 py-1.5
              text-xs font-medium text-primary-foreground
              shadow-lg shadow-primary/25
              transition-all hover:scale-105 hover:shadow-xl
              active:scale-95
            "
          >
            <MessageCircle className="h-3 w-3" />
            質問する
          </button>
        </div>
      )}
    </div>
  );
}
