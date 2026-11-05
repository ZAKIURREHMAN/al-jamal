import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/lib/seo";

/** Accessible, crawlable FAQ accordion (details/summary keeps answers in the HTML for search engines). */
export function FaqList({ faqs, open = 0 }: { faqs: FAQ[]; open?: number }) {
  return (
    <div className="divide-y divide-line rounded-3xl bg-cream ring-1 ring-line/60">
      {faqs.map((f, i) => (
        <details key={f.q} className="group px-6 py-5 open:bg-white/60" open={i < open}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-green-deep [&::-webkit-details-marker]:hidden">
            <h3 className="font-sans text-base font-semibold">{f.q}</h3>
            <ChevronDown className="h-5 w-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink sm:text-base">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
