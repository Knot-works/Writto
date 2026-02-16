import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Loading chunk") ||
      error.message.includes("Loading CSS chunk") ||
      error.name === "ChunkLoadError"
    );
  }
  return false;
}

export function ChunkErrorBoundary() {
  const error = useRouteError();
  const [isReloading, setIsReloading] = useState(false);

  const isChunkError = isChunkLoadError(error);

  useEffect(() => {
    // Auto-reload once for chunk load errors
    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem("chunk-error-reloaded");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk-error-reloaded", "true");
        window.location.reload();
      }
    }
  }, [isChunkError]);

  // Clear the reload flag when component unmounts (successful navigation)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("chunk-error-reloaded");
    };
  }, []);

  const handleReload = () => {
    setIsReloading(true);
    sessionStorage.removeItem("chunk-error-reloaded");
    window.location.reload();
  };

  // For chunk load errors, show a friendly update message
  if (isChunkError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">アプリが更新されました</h1>
          <p className="text-muted-foreground">
            新しいバージョンが利用可能です。ページを更新してください。
          </p>
        </div>
        <Button onClick={handleReload} disabled={isReloading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isReloading ? "animate-spin" : ""}`} />
          {isReloading ? "更新中..." : "ページを更新"}
        </Button>
      </div>
    );
  }

  // For other errors, show a generic error message
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">エラーが発生しました</h1>
          <p className="text-muted-foreground">
            {error.status} - {error.statusText}
          </p>
        </div>
        <Button onClick={handleReload}>
          <RefreshCw className="mr-2 h-4 w-4" />
          ページを更新
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">予期しないエラーが発生しました</h1>
        <p className="text-muted-foreground">
          問題が解決しない場合は、ページを更新してください。
        </p>
      </div>
      <Button onClick={handleReload}>
        <RefreshCw className="mr-2 h-4 w-4" />
        ページを更新
      </Button>
    </div>
  );
}
