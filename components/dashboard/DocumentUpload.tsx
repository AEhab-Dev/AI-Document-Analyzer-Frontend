"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useAppStore } from "@/store/appStore";
import api from "@/lib/api";
import { DocumentUploadResponse, DocumentListItem } from "@/lib/types";
import Button from "@/components/ui/Button";

interface Props {
  onUploadComplete: (message: string) => void;
  onUploadError: (message: string) => void;
}

export default function DocumentUpload({ onUploadComplete, onUploadError }: Props) {
  const { setActiveDocument, addDocument } = useAppStore();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      onUploadError("Only PDF files are accepted.");
      return;
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      onUploadError("File size exceeds the 10MB limit.");
      return;
    }

    setUploading(true);
    setProgress("Uploading document...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress("Extracting text and generating summary...");
      const res = await api.post<DocumentUploadResponse>(
        "/api/documents/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = res.data;

      const listItem: DocumentListItem = {
        id: data.document_id,
        original_filename: data.original_filename,
        document_type: data.document_type,
        created_at: new Date().toISOString(),
      };
      addDocument(listItem);

      const detailRes = await api.get(`/api/documents/${data.document_id}`);
      setActiveDocument(detailRes.data);

      onUploadComplete(
        data.was_truncated
          ? "Document analyzed. Note: only the first 12,000 words were processed."
          : "Document analyzed successfully."
      );
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to process document. Please try again.";
      onUploadError(message);
    } finally {
      setUploading(false);
      setProgress("");
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Analyze a Document
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Upload a CV, contract, or policy PDF and get an instant AI-powered summary.
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center
            border-2 border-dashed rounded-2xl px-8 py-16
            transition-all duration-200 cursor-pointer
            ${dragging
              ? "border-gray-900 bg-gray-100"
              : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
            }
            ${uploading ? "cursor-not-allowed opacity-70" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
              <p className="text-sm text-gray-600 text-center">{progress}</p>
              <p className="text-xs text-gray-400">This may take 10–30 seconds</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Drop your PDF here, or{" "}
                  <span className="text-gray-900 underline underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF only · Max 10MB · Text-based documents only
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Select PDF File
          </Button>
        </div>
      </div>
    </div>
  );
}