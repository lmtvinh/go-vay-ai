"use client";

import { useEffect } from "react";

type ErrorPopupProps = {
  message: string | null;
  onClose: () => void;
  autoCloseMs?: number;
};

export default function ErrorPopup({
  message,
  onClose,
  autoCloseMs = 1800,
}: ErrorPopupProps) {
  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => window.clearTimeout(timer);
  }, [message, onClose, autoCloseMs]);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-red-400/30 bg-neutral-950 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-2xl">
          ⚠️
        </div>

        <h2 className="text-xl font-bold text-white">Nước đi không hợp lệ</h2>

        <p className="mt-3 text-sm leading-6 text-neutral-300">{message}</p>

        <button
          onClick={onClose}
          className="mt-6 rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}