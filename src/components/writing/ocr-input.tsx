import { useState, useCallback, useRef, useEffect } from "react";
import { callOcrHandwriting, isRateLimitError, getRateLimitMessage, isProOnlyError } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Camera,
  Upload,
  X,
  Loader2,
  Check,
  RotateCcw,
  FileImage,
  Sparkles,
  AlertCircle,
  PenLine,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker using Vite's URL handling
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

interface OcrInputProps {
  onComplete: (text: string) => void;
  onCancel: () => void;
}

type OcrStep = "upload" | "pdf-select" | "preview" | "processing" | "confirm";

interface PdfPage {
  pageNum: number;
  thumbnail: string;
}

// Image optimization settings
const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;
const MAX_FILE_SIZE_MB = 10;
const THUMBNAIL_SIZE = 150;

async function optimizeImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height / width) * MAX_DIMENSION);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width / height) * MAX_DIMENSION);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx!.fillStyle = "#FFFFFF";
      ctx!.fillRect(0, 0, width, height);
      ctx!.drawImage(img, 0, 0, width, height);

      const base64 = canvas.toDataURL("image/jpeg", JPEG_QUALITY).split(",")[1];
      resolve({ base64, mimeType: "image/jpeg" });
    };

    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });
}

async function optimizeImageFromDataUrl(dataUrl: string): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height / width) * MAX_DIMENSION);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width / height) * MAX_DIMENSION);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx!.fillStyle = "#FFFFFF";
      ctx!.fillRect(0, 0, width, height);
      ctx!.drawImage(img, 0, 0, width, height);

      const base64 = canvas.toDataURL("image/jpeg", JPEG_QUALITY).split(",")[1];
      resolve({ base64, mimeType: "image/jpeg" });
    };

    img.onerror = () => reject(new Error("画像の変換に失敗しました"));
    img.src = dataUrl;
  });
}

async function renderPdfPage(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale: number
): Promise<string> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.9);
}

async function parsePdf(file: File): Promise<{ pdf: pdfjsLib.PDFDocumentProxy; pages: PdfPage[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: PdfPage[] = [];
  const totalPages = pdf.numPages;

  // Generate thumbnails for each page
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });

    // Calculate scale for thumbnail
    const scale = THUMBNAIL_SIZE / Math.max(viewport.width, viewport.height);
    const thumbnail = await renderPdfPage(pdf, i, scale);

    pages.push({ pageNum: i, thumbnail });
  }

  return { pdf, pages };
}

export function OcrInput({ onComplete, onCancel }: OcrInputProps) {
  const [step, setStep] = useState<OcrStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PDF specific state
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfPages, setPdfPages] = useState<PdfPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [previewPage, setPreviewPage] = useState(1); // For large preview display
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  // Load high-res preview when preview page changes
  useEffect(() => {
    if (!pdfDoc || step !== "pdf-select") return;

    let cancelled = false;
    const loadPreview = async () => {
      const highResScale = 1.5;
      const preview = await renderPdfPage(pdfDoc, previewPage, highResScale);
      if (!cancelled) {
        setPagePreviewUrl(preview);
      }
    };
    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, previewPage, step]);

  // Toggle page selection
  const togglePageSelection = useCallback((pageNum: number) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNum)) {
        return prev.filter((p) => p !== pageNum);
      } else {
        return [...prev, pageNum].sort((a, b) => a - b);
      }
    });
  }, []);

  // Select all pages
  const selectAllPages = useCallback(() => {
    setSelectedPages(pdfPages.map((p) => p.pageNum));
  }, [pdfPages]);

  // Deselect all pages
  const deselectAllPages = useCallback(() => {
    setSelectedPages([]);
  }, []);

  const isPdf = (file: File) => {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  };

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"];
    const isImage = validImageTypes.includes(file.type) || file.name.toLowerCase().endsWith(".heic");
    const isPdfFile = isPdf(file);

    if (!isImage && !isPdfFile) {
      toast.error("JPEG, PNG, WebP, GIF, またはPDF形式のファイルを選択してください");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`ファイルサイズは${MAX_FILE_SIZE_MB}MB以下にしてください`);
      return;
    }

    setSelectedFile(file);
    setError(null);

    if (isPdfFile) {
      // Handle PDF
      setPdfLoading(true);
      try {
        const { pdf, pages } = await parsePdf(file);
        setPdfDoc(pdf);
        setPdfPages(pages);
        setSelectedPages([1]); // Default select first page
        setPreviewPage(1);
        setStep("pdf-select");
      } catch (err) {
        console.error("PDF parse error:", err);
        toast.error("PDFの読み込みに失敗しました");
        setSelectedFile(null);
      } finally {
        setPdfLoading(false);
      }
    } else {
      // Handle image
      setPreviewUrl(URL.createObjectURL(file));
      setStep("preview");
    }
  }, []);

  const handlePdfPageSelect = useCallback(async () => {
    if (!pdfDoc || selectedPages.length === 0) return;

    if (selectedPages.length === 1) {
      // Single page - go to preview step
      setPdfLoading(true);
      try {
        const highResScale = 2.5;
        const dataUrl = await renderPdfPage(pdfDoc, selectedPages[0], highResScale);
        setPreviewUrl(dataUrl);
        setStep("preview");
      } catch (err) {
        console.error("PDF render error:", err);
        toast.error("ページの読み込みに失敗しました");
      } finally {
        setPdfLoading(false);
      }
    } else {
      // Multiple pages - process directly
      setProcessing(true);
      setStep("processing");
      setError(null);
      isProcessingRef.current = true;

      try {
        const results: string[] = [];
        const highResScale = 2.5;

        for (let i = 0; i < selectedPages.length; i++) {
          const pageNum = selectedPages[i];
          setProcessingProgress({ current: i + 1, total: selectedPages.length });

          // Render page
          const dataUrl = await renderPdfPage(pdfDoc, pageNum, highResScale);
          const optimized = await optimizeImageFromDataUrl(dataUrl);

          // OCR
          const result = await callOcrHandwriting(optimized.base64, optimized.mimeType);
          if (result.text.trim()) {
            results.push(result.text.trim());
          }
        }

        const combinedText = results.join("\n\n");
        setRecognizedText(combinedText);
        setEditedText(combinedText);
        setStep("confirm");
      } catch (err) {
        console.error("OCR error:", err);
        if (isProOnlyError(err)) {
          setError("手書き認識機能はProプラン限定です");
          toast.error("手書き認識機能はProプラン限定です。アップグレードしてご利用ください。");
        } else if (isRateLimitError(err)) {
          setError(getRateLimitMessage(err));
          toast.error(getRateLimitMessage(err), { duration: 8000 });
        } else {
          setError("画像の認識に失敗しました。もう一度お試しください。");
          toast.error("画像の認識に失敗しました");
        }
        setStep("pdf-select");
      } finally {
        isProcessingRef.current = false;
        setProcessing(false);
        setProcessingProgress(null);
      }
    }
  }, [pdfDoc, selectedPages]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleProcess = useCallback(async () => {
    if (!previewUrl || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setProcessing(true);
    setStep("processing");
    setError(null);

    try {
      let base64: string;
      let mimeType: string;

      if (selectedFile && !isPdf(selectedFile)) {
        // Optimize image file
        const optimized = await optimizeImage(selectedFile);
        base64 = optimized.base64;
        mimeType = optimized.mimeType;
      } else {
        // Optimize from data URL (PDF page)
        const optimized = await optimizeImageFromDataUrl(previewUrl);
        base64 = optimized.base64;
        mimeType = optimized.mimeType;
      }

      // Call OCR API
      const result = await callOcrHandwriting(base64, mimeType);

      setRecognizedText(result.text);
      setEditedText(result.text);
      setStep("confirm");
    } catch (err) {
      console.error("OCR error:", err);
      if (isProOnlyError(err)) {
        setError("手書き認識機能はProプラン限定です");
        toast.error("手書き認識機能はProプラン限定です。アップグレードしてご利用ください。");
      } else if (isRateLimitError(err)) {
        setError(getRateLimitMessage(err));
        toast.error(getRateLimitMessage(err), { duration: 8000 });
      } else {
        setError("画像の認識に失敗しました。もう一度お試しください。");
        toast.error("画像の認識に失敗しました");
      }
      setStep("preview");
    } finally {
      isProcessingRef.current = false;
      setProcessing(false);
    }
  }, [previewUrl, selectedFile]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl && !previewUrl.startsWith("data:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setRecognizedText("");
    setEditedText("");
    setPdfDoc(null);
    setPdfPages([]);
    setSelectedPages([]);
    setPreviewPage(1);
    setPagePreviewUrl(null);
    setProcessingProgress(null);
    setStep("upload");
    setError(null);
  }, [previewUrl]);

  const handleConfirm = useCallback(() => {
    if (editedText.trim()) {
      onComplete(editedText.trim());
    }
  }, [editedText, onComplete]);

  const wordCount = editedText.trim() ? editedText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <Camera className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-medium">手書き認識</h3>
            <p className="text-xs text-muted-foreground">
              紙やiPadに書いた英文を読み取ります
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-8 transition-colors hover:border-primary/40 hover:bg-muted/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.heic,.pdf,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {pdfLoading ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm text-muted-foreground">PDFを読み込み中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                <FileImage className="h-8 w-8 text-violet-600" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">画像またはPDFをドロップ</p>
                <p className="text-sm text-muted-foreground">
                  JPEG, PNG, WebP, GIF, PDF（最大{MAX_FILE_SIZE_MB}MB）
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  ファイルを選択
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PDF Page Selection Step */}
      {step === "pdf-select" && pdfPages.length > 0 && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium">
                ページを選択
              </span>
              {selectedPages.length > 0 && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                  {selectedPages.length}ページ選択中
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pdfPages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllPages}
                    className="h-7 text-xs"
                  >
                    すべて選択
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAllPages}
                    className="h-7 text-xs"
                  >
                    選択解除
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={handleReset}>
                別のファイル
              </Button>
            </div>
          </div>

          {/* Main content: Thumbnails + Preview */}
          <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
            {/* Thumbnail sidebar */}
            <div className="order-2 lg:order-1 min-w-0">
              <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[400px] lg:pb-0 lg:pr-2">
                {pdfPages.map((page) => {
                  const isSelected = selectedPages.includes(page.pageNum);
                  const isPreview = previewPage === page.pageNum;
                  const selectionOrder = selectedPages.indexOf(page.pageNum) + 1;

                  return (
                    <div
                      key={page.pageNum}
                      className="relative shrink-0"
                    >
                      {/* Thumbnail button for preview */}
                      <button
                        onClick={() => setPreviewPage(page.pageNum)}
                        className={`
                          group relative overflow-hidden rounded-lg border-2 transition-all
                          ${isPreview
                            ? "border-violet-500 ring-2 ring-violet-500/20 shadow-lg"
                            : isSelected
                              ? "border-violet-300 shadow-md"
                              : "border-border/60 hover:border-violet-200"
                          }
                        `}
                      >
                        <img
                          src={page.thumbnail}
                          alt={`Page ${page.pageNum}`}
                          className={`
                            h-24 w-auto min-w-[68px] object-contain bg-white lg:h-auto lg:w-full
                            ${isSelected ? "opacity-100" : "opacity-70 group-hover:opacity-100"}
                          `}
                        />
                        {/* Selection overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-violet-500/10" />
                        )}
                        {/* Page number badge */}
                        <div
                          className={`
                            absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-[10px] font-bold
                            ${isPreview
                              ? "bg-violet-500 text-white"
                              : "bg-black/60 text-white"
                            }
                          `}
                        >
                          {page.pageNum}
                        </div>
                      </button>

                      {/* Checkbox overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePageSelection(page.pageNum);
                        }}
                        className={`
                          absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-md
                          transition-all shadow-sm
                          ${isSelected
                            ? "bg-violet-500 text-white"
                            : "bg-white border border-border/80 text-muted-foreground hover:border-violet-300 hover:text-violet-500"
                          }
                        `}
                      >
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Square className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Selection order badge */}
                      {isSelected && selectedPages.length > 1 && (
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-sm">
                          {selectionOrder}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Large preview */}
            <div className="order-1 lg:order-2 min-w-0">
              <div className="relative overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
                {pagePreviewUrl ? (
                  <img
                    src={pagePreviewUrl}
                    alt={`Page ${previewPage} preview`}
                    className="mx-auto max-h-[400px] max-w-full w-auto object-contain"
                  />
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Quick selection toggle on preview */}
                <button
                  onClick={() => togglePageSelection(previewPage)}
                  className={`
                    absolute left-3 top-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium shadow-md transition-all
                    ${selectedPages.includes(previewPage)
                      ? "bg-violet-500 text-white hover:bg-violet-600"
                      : "bg-white/90 text-muted-foreground hover:bg-white hover:text-violet-600"
                    }
                  `}
                >
                  {selectedPages.includes(previewPage) ? (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      選択中
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      選択
                    </>
                  )}
                </button>

                {/* Page navigation overlay */}
                {pdfPages.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/40 to-transparent px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                      disabled={previewPage === 1}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
                      {previewPage} / {pdfPages.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                      onClick={() => setPreviewPage((p) => Math.min(pdfPages.length, p + 1))}
                      disabled={previewPage === pdfPages.length}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {selectedPages.length === 0
                ? "認識するページを選択してください"
                : selectedPages.length === 1
                  ? `ページ ${selectedPages[0]} を認識します`
                  : `${selectedPages.length}ページを順番に認識して結合します`
              }
            </p>
            <Button
              className="gap-2"
              onClick={handlePdfPageSelect}
              disabled={pdfLoading || selectedPages.length === 0}
            >
              {pdfLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {selectedPages.length <= 1 ? "認識する" : `${selectedPages.length}ページを認識`}
            </Button>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === "preview" && previewUrl && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/30">
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto max-h-[400px] max-w-full object-contain"
            />
            <div className="absolute right-2 top-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 shadow-md"
                onClick={handleReset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              別のファイルを選択
            </Button>
            <Button className="gap-2" onClick={handleProcess}>
              <Sparkles className="h-4 w-4" />
              文字を認識する
            </Button>
          </div>
        </div>
      )}

      {/* Processing Step */}
      {step === "processing" && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-violet-500/20" />
            <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-8 w-8 text-violet-500" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="font-medium text-lg">文字を認識中...</p>
            {processingProgress ? (
              <p className="text-sm text-muted-foreground">
                ページ {processingProgress.current} / {processingProgress.total} を処理中
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                AIが画像から英文を読み取っています
              </p>
            )}
          </div>
          {/* Progress bar for multiple pages */}
          {processingProgress && processingProgress.total > 1 && (
            <div className="w-48">
              <div className="h-1.5 w-full rounded-full bg-violet-100">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-300"
                  style={{
                    width: `${(processingProgress.current / processingProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {/* Confirm Step */}
      {step === "confirm" && (
        <div className="space-y-4">
          {/* Success indicator */}
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">
              {selectedPages.length > 1
                ? `${selectedPages.length}ページの認識完了！内容を確認・編集してください`
                : "認識完了！内容を確認・編集してください"
              }
            </span>
          </div>

          {/* Preview thumbnail or page count */}
          <div className="flex items-start gap-4">
            {previewUrl ? (
              <div className="shrink-0 overflow-hidden rounded-lg border border-border/60">
                <img
                  src={previewUrl}
                  alt="Original"
                  className="h-20 w-20 object-cover"
                />
              </div>
            ) : selectedPages.length > 1 ? (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-violet-50">
                <div className="text-center">
                  <FileText className="mx-auto h-6 w-6 text-violet-500" />
                  <span className="text-xs font-medium text-violet-700">
                    {selectedPages.length}ページ
                  </span>
                </div>
              </div>
            ) : null}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                認識結果（編集可能）
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {wordCount}語
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-3 w-3" />
                  やり直す
                </Button>
              </div>
            </div>
          </div>

          {/* Editable text */}
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={8}
            placeholder="認識されたテキスト..."
            className="min-h-[200px] resize-none text-base leading-relaxed"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              別のファイル
            </Button>
            <Button
              className="gap-2"
              onClick={handleConfirm}
              disabled={!editedText.trim()}
            >
              <PenLine className="h-4 w-4" />
              この内容で添削する
            </Button>
          </div>
        </div>
      )}

      {/* Tips */}
      {step === "upload" && (
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            きれいに認識するコツ
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>・ 明るい場所で撮影する</li>
            <li>・ 紙は白っぽいものを使う</li>
            <li>・ 文字がはっきり見えるように撮る</li>
            <li>・ iPadのメモはPDFで書き出すと高精度</li>
          </ul>
        </div>
      )}
    </div>
  );
}
