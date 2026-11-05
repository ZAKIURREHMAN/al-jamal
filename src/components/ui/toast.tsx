"use client";

import { create } from "zustand";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; message: string; kind: "success" | "error" };
type ToastState = { toasts: Toast[]; push: (message: string, kind?: Toast["kind"]) => void; dismiss: (id: number) => void };

let nextId = 1;
export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind = "success") => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 animate-fade-up",
            t.kind === "success" ? "ring-green/20" : "ring-red-200",
          )}
        >
          {t.kind === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />}
          <p className="flex-1 text-sm text-charcoal">{t.message}</p>
          <button onClick={() => dismiss(t.id)} className="text-muted hover:text-charcoal" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
