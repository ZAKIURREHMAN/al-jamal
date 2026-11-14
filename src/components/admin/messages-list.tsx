"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Phone, Trash2 } from "lucide-react";
import { apiFetch, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type M = { id: string; name: string; phone: string; message: string; isRead: boolean; createdAt: string };

export function MessagesList({ messages }: { messages: M[] }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  async function call(path: string, init: RequestInit, done: string) {
    try { await apiFetch(path, init); toast(done); router.refresh(); } catch (e) { toast((e as Error).message, "error"); }
  }
  if (messages.length === 0) return <p className="rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center text-sm text-muted">No messages yet.</p>;
  return (
    <ul className="space-y-4">
      {messages.map((m) => (
        <li key={m.id} className={cn("rounded-3xl bg-white p-5 ring-1", m.isRead ? "ring-line/60" : "ring-2 ring-gold/70")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-charcoal">{m.name} {!m.isRead && <span className="ml-2 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-bold text-green-deep">New</span>}</p>
              <p className="text-xs text-muted">{formatDateTime(m.createdAt)}</p>
            </div>
            <div className="flex flex-wrap gap-1 text-sm">
              <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-green-deep hover:bg-green-soft"><Phone className="h-3.5 w-3.5" /> {m.phone}</a>
              <a href={`https://wa.me/92${m.phone.slice(1)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-green-deep hover:bg-green-soft"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
              <button onClick={() => call(`/api/admin/messages/${m.id}`, { method: "PATCH", body: JSON.stringify({ isRead: !m.isRead }) }, m.isRead ? "Marked unread." : "Marked as read.")} className="rounded-full px-3 py-1.5 font-medium text-ink hover:bg-cream">{m.isRead ? "Mark unread" : "Mark read"}</button>
              <button onClick={() => confirm("Delete this message?") && call(`/api/admin/messages/${m.id}`, { method: "DELETE" }, "Message deleted.")} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{m.message}</p>
        </li>
      ))}
    </ul>
  );
}
