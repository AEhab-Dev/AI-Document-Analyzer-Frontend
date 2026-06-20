"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { logout } from "@/lib/auth";
import api from "@/lib/api";
import { DocumentListItem } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DocTypeTag({ type }: { type: string | null }) {
  const map: Record<string, string> = {
    cv: "bg-blue-100 text-blue-700",
    contract: "bg-purple-100 text-purple-700",
    policy: "bg-orange-100 text-orange-700",
    general: "bg-gray-100 text-gray-600",
  };
  const label = type ?? "general";
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        map[label] ?? map.general
      }`}
    >
      {label.toUpperCase()}
    </span>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const {
    user,
    documents,
    setDocuments,
    activeDocument,
    setActiveDocument,
    isSidebarOpen,
    toggleSidebar,
  } = useAppStore();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      try {
        const res = await api.get<DocumentListItem[]>("/api/documents?limit=10");
        setDocuments(res.data);
      } catch {
        // fail silently — user will see empty state
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [setDocuments]);

  async function handleSelectDocument(id: string) {
    try {
      const res = await api.get(`/api/documents/${id}`);
      setActiveDocument(res.data);
    } catch {
      // fail silently
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed lg:relative z-20 h-full flex flex-col
          bg-gray-900 text-white
          transition-all duration-300
          ${isSidebarOpen ? "w-64" : "w-0 overflow-hidden"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold">Doc Analyzer</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* New Analysis Button */}
        <div className="px-3 py-3 shrink-0">
          <button
            onClick={() => setActiveDocument(null)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300
              hover:bg-gray-800 rounded-lg transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Analysis
          </button>
        </div>

        {/* Document History */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-2">
            Recent Documents
          </p>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-xs text-gray-500 px-2 py-4">
              No documents yet. Upload your first document.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() => handleSelectDocument(doc.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                      activeDocument?.id === doc.id
                        ? "bg-gray-700"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-medium text-gray-200 truncate leading-tight">
                        {doc.original_filename}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocTypeTag type={doc.document_type} />
                      <span className="text-xs text-gray-500">
                        {formatDate(doc.created_at)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User Footer */}
        <div className="px-3 py-3 border-t border-gray-700 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-gray-200">
                  {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-200 truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-gray-500 hover:text-gray-300 transition-colors shrink-0 ml-2"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}