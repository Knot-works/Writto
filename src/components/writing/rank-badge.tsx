"use client";

import { type Rank, getRankColor } from "@/types";

interface RankBadgeProps {
  rank: Rank;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function RankBadge({ rank, size = "md", label }: RankBadgeProps) {
  const colorClass = getRankColor(rank);

  const sizeClasses = {
    sm: "h-10 w-10 text-lg",
    md: "h-16 w-16 text-2xl",
    lg: "h-24 w-24 text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeClasses[size]} ${colorClass} flex items-center justify-center rounded-2xl border-2 font-serif font-bold`}
        style={{
          borderColor: "currentColor",
          backgroundColor: "color-mix(in oklch, currentColor 8%, transparent)",
        }}
      >
        {rank}
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
