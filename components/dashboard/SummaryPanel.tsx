"use client";

import { useAppStore } from "@/store/appStore";

function formatSummary(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const boldLine = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    const isBullet = line.trim().startsWith("-") || line.trim().startsWith("•");
    if (isBullet) {
      return (
        <li
          key={i}
          className="ml-4 text-sm text-gray-700 leading-relaxed list-disc"
          dangerouslySetInnerHTML={{ __html: boldLine.replace(/^[-•]\s*/, "") }}
        />
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return (
      <p
        key={i}
        className="text-sm text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: boldLine }}
      />
    );
  });
}

function DocTypeBadge({ type }: { type: string | null }) {
  const map: Record<string, { label: string; className: string }> = {
    cv: { label: "CV / Resume", className: "bg-blue-100 text-blue-700 border-blue-200" },
    contract: { label: "Contract", className: "bg-purple-100 text-purple-700 border-purple-200" },
    policy: { label: "Policy Document", className: "bg-orange-100 text-orange-700 border-orange-200" },
    general: { label: "General Report", className: "bg-gray-100 text-gray-600 border-gray-200" },
  };
  const t = type ?? "general";
  const style = map[t] ?? map.general;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${style.className}`}>
      {style.label}
    </span>
  );
}

export default function SummaryPanel() {
  const activeDocument = useAppStore((s) => s.activeDocument);

  if (!activeDocument) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-1">Analyzing</p>
            <h2
              className="text-base font-semibold text-gray-900 truncate"
              title={activeDocument.original_filename}
            >
              {activeDocument.original_filename}
            </h2>
          </div>
          <DocTypeBadge type={activeDocument.document_type} />
        </div>

        {activeDocument.was_truncated && (
          <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <span className="text-yellow-500 text-sm shrink-0">⚠</span>
            <p className="text-xs text-yellow-700">
              This document is long — analysis is based on the first 12,000 words.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Summary
        </h3>
        <div className="flex flex-col gap-1">
          {formatSummary(activeDocument.summary ?? "No summary available.")}
        </div>
      </div>
    </div>
  );
}