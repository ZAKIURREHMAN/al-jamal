import { Download } from "lucide-react";

/** Plain anchor on purpose: this is a file download, not a page navigation. */
export function ExportCsvLink() {
  return (
    <a href="/api/admin/orders/export" download className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-green-deep ring-1 ring-line hover:ring-green">
      <Download className="h-4 w-4" /> Export CSV
    </a>
  );
}
