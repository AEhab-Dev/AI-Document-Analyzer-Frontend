"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "info",
  duration = 4000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: "bg-green-50 border-green-400 text-green-800",
    error: "bg-red-50 border-red-400 text-red-800",
    warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
    info: "bg-gray-50 border-gray-400 text-gray-800",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border rounded-lg shadow-md text-sm
        transition-all duration-300 max-w-sm
        ${styles[type]}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <span className="font-bold mt-0.5">{icons[type]}</span>
      <p className="flex-1">{message}</p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="opacity-60 hover:opacity-100 font-bold"
      >
        ✕
      </button>
    </div>
  );
}