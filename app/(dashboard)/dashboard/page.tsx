"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import DocumentUpload from "@/components/dashboard/DocumentUpload";
import SummaryPanel from "@/components/dashboard/SummaryPanel";
import ChatPanel from "@/components/dashboard/ChatPanel";
import ExportButton from "@/components/export/ExportButton";
import Toast, { ToastType } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

export default function DashboardPage() {
  const { activeDocument, toggleSidebar, isSidebarOpen } = useAppStore();
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100
              rounded-lg transition-colors"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-sm font-semibold text-gray-900">
            {activeDocument ? activeDocument.original_filename : "New Analysis"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeDocument && (
            <ExportButton onError={(msg) => addToast(msg, "error")} />
          )}
        </div>
      </header>

      {/* Main Content */}
      {!activeDocument ? (
        <div className="flex-1 overflow-hidden">
          <DocumentUpload
            onUploadComplete={(msg) => addToast(msg, "success")}
            onUploadError={(msg) => addToast(msg, "error")}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Summary Panel */}
          <div className="flex-1 overflow-hidden lg:max-w-[55%]">
            <SummaryPanel />
          </div>

          {/* Chat Panel */}
          <div className="flex-1 overflow-hidden lg:max-w-[45%]">
            <ChatPanel />
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}