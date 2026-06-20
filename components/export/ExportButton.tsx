"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

interface Props {
  onError: (message: string) => void;
}

export default function ExportButton({ onError }: Props) {
  const activeDocument = useAppStore((s) => s.activeDocument);
  const [loading, setLoading] = useState(false);

  if (!activeDocument) return null;

  async function handleExport() {
    if (!activeDocument) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/export/${activeDocument.id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        activeDocument.original_filename.replace(".pdf", "_report.pdf")
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      onError("Failed to export PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={loading}
      onClick={handleExport}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export PDF
    </Button>
  );
}