import { useMemo } from "react";
import { Layers, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  type StructureAnalysis as StructureAnalysisType,
  type StructureRole,
  STRUCTURE_ROLE_LABELS,
  STRUCTURE_ROLE_COLORS,
} from "@/types";

interface StructureAnalysisProps {
  userAnswer: string;
  structureAnalysis: StructureAnalysisType;
}

// Split text into sentences for mapping
function splitIntoSentences(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.filter((s) => s.trim().length > 0);
}

// Expected structure elements for a good essay
const IDEAL_STRUCTURE: StructureRole[] = ["opinion", "reason", "example", "conclusion"];

export function StructureAnalysis({
  userAnswer,
  structureAnalysis,
}: StructureAnalysisProps) {
  const sentences = useMemo(() => splitIntoSentences(userAnswer), [userAnswer]);

  // Map each sentence to its role (if any)
  const sentenceRoleMap = useMemo(() => {
    const map: Map<number, { role: StructureRole; blockIndex: number }> = new Map();
    structureAnalysis.blocks.forEach((block, blockIndex) => {
      block.sentenceIndices.forEach((sentenceIndex) => {
        map.set(sentenceIndex, { role: block.role, blockIndex });
      });
    });
    return map;
  }, [structureAnalysis.blocks]);

  // Check which elements are present
  const presentRoles = useMemo(() => {
    return new Set(structureAnalysis.blocks.map((b) => b.role));
  }, [structureAnalysis.blocks]);

  const missingRoles = structureAnalysis.missingElements || [];
  const hasGoodStructure = missingRoles.length === 0 ||
    (presentRoles.has("opinion") && presentRoles.has("reason"));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10">
          <Layers className="h-4 w-4 text-sky-600" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-medium">文章構成</h2>
          <p className="text-xs text-muted-foreground">
            あなたの回答の論理構造
          </p>
        </div>
      </div>

      {/* Structure Rail + Text */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {/* Structure Legend - Compact */}
        <div className="border-b border-border/40 bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {IDEAL_STRUCTURE.map((role) => {
              const isPresent = presentRoles.has(role);
              const colors = STRUCTURE_ROLE_COLORS[role];
              return (
                <div
                  key={role}
                  className={`
                    flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
                    ${isPresent
                      ? `${colors.bg} ${colors.text} ${colors.border} border`
                      : "bg-muted text-muted-foreground border border-dashed border-muted-foreground/30"
                    }
                  `}
                >
                  {isPresent ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3 opacity-50" />
                  )}
                  {STRUCTURE_ROLE_LABELS[role]}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentences with Structure Rail */}
        <div className="p-4">
          <div className="space-y-0">
            {sentences.map((sentence, index) => {
              const roleInfo = sentenceRoleMap.get(index);
              const role = roleInfo?.role;
              const colors = role ? STRUCTURE_ROLE_COLORS[role] : null;

              return (
                <div key={index} className="flex group">
                  {/* Structure Rail */}
                  <div className="w-16 shrink-0 flex flex-col items-end pr-3 pt-1">
                    {role && (
                      <span
                        className={`
                          text-[10px] font-semibold uppercase tracking-wide
                          ${colors?.text || "text-muted-foreground"}
                        `}
                      >
                        {STRUCTURE_ROLE_LABELS[role]}
                      </span>
                    )}
                  </div>

                  {/* Connector Line */}
                  <div className="relative w-4 shrink-0">
                    {/* Vertical line */}
                    <div
                      className={`
                        absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2
                        ${role ? colors?.bg?.replace("/10", "/40") || "bg-muted" : "bg-border/50"}
                      `}
                    />
                    {/* Dot */}
                    <div
                      className={`
                        absolute left-1/2 top-2.5 h-2 w-2 -translate-x-1/2 rounded-full
                        ${role
                          ? `${colors?.bg?.replace("/10", "")} ring-2 ring-white`
                          : "bg-border"
                        }
                      `}
                    />
                  </div>

                  {/* Sentence Text */}
                  <div
                    className={`
                      flex-1 py-2 pl-3 pr-2 rounded-lg transition-colors
                      ${role
                        ? `${colors?.bg} border-l-2 ${colors?.border?.replace("/30", "")}`
                        : "border-l-2 border-transparent"
                      }
                    `}
                  >
                    <p className="text-[15px] leading-relaxed text-foreground/90">
                      {sentence}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missing Elements Warning or Success */}
        {structureAnalysis.feedback && (
          <div
            className={`
              border-t px-4 py-3
              ${hasGoodStructure
                ? "border-emerald-200/50 bg-emerald-500/5"
                : "border-amber-200/50 bg-amber-500/5"
              }
            `}
          >
            <div className="flex items-start gap-2">
              {hasGoodStructure ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              )}
              <p
                className={`text-sm ${
                  hasGoodStructure ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {structureAnalysis.feedback}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
