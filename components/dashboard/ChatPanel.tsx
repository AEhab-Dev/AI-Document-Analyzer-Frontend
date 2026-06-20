"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useAppStore } from "@/store/appStore";
import api from "@/lib/api";
import { Message, ChatResponse } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gray-900 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const activeDocument = useAppStore((s) => s.activeDocument);
  const setActiveDocument = useAppStore((s) => s.setActiveDocument);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeDocument?.messages]);

  if (!activeDocument) return null;

  async function handleSend() {
    if (!question.trim() || loading || !activeDocument) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question.trim(),
      created_at: new Date().toISOString(),
    };

    setActiveDocument({
      ...activeDocument,
      messages: [...activeDocument.messages, userMessage],
    });

    setQuestion("");
    setLoading(true);

    try {
      const res = await api.post<ChatResponse>(
        `/api/chat/${activeDocument.id}`,
        { question: userMessage.content }
      );

      const assistantMessage: Message = {
        id: res.data.message_id,
        role: "assistant",
        content: res.data.answer,
        created_at: new Date().toISOString(),
      };

      setActiveDocument({
        ...activeDocument,
        messages: [...activeDocument.messages, userMessage, assistantMessage],
      });
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        created_at: new Date().toISOString(),
      };
      setActiveDocument({
        ...activeDocument,
        messages: [...activeDocument.messages, userMessage, errorMessage],
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const messages = activeDocument.messages;

  return (
    <div className="flex flex-col h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">Ask Questions</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Ask anything about this document
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                No questions yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Ask about specific clauses, dates, names, or any detail in the document.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
              {[
                "What are the payment terms?",
                "Are there any red flags?",
                "Who are the parties involved?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuestion(suggestion)}
                  className="text-xs text-gray-600 bg-white border border-gray-200
                    rounded-lg px-3 py-2 hover:bg-gray-50 hover:border-gray-300
                    transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Spinner size="sm" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-200 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document..."
            rows={1}
            className="flex-1 resize-none text-sm border border-gray-300 rounded-xl
              px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900
              focus:border-transparent placeholder-gray-400 leading-relaxed
              max-h-32 overflow-y-auto"
            style={{ minHeight: "42px" }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!question.trim() || loading}
            className="shrink-0 w-10 h-10 bg-gray-900 text-white rounded-xl
              flex items-center justify-center hover:bg-gray-700
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}