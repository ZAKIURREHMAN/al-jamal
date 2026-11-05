import { formatPKR } from "@/lib/money";
import { cn } from "@/lib/utils";

export function Price({ cents, className, from = false }: { cents: number; className?: string; from?: boolean }) {
  return (
    <span className={cn("font-semibold tabular-nums text-green-deep", className)}>
      {from && <span className="mr-1 text-xs font-medium text-muted">from</span>}
      {formatPKR(cents)}
    </span>
  );
}
