import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
const PAGE = 50;

export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/admin");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [total, rows] = await Promise.all([db.auditLog.count(), db.auditLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE })]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  return (
    <>
      <PageHeader title="Activity log" description="Every change made in this dashboard: who, what and when." />
      <Table>
        <thead><tr><Th>When</Th><Th>Who</Th><Th>Action</Th><Th>What</Th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><Td className="py-10 text-center text-muted">No activity recorded yet.</Td><Td /><Td /><Td /></tr>}
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-cream/50">
              <Td className="whitespace-nowrap text-muted">{formatDateTime(r.createdAt)}</Td>
              <Td>{r.userEmail}</Td>
              <Td><span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-green-deep ring-1 ring-line">{r.entity} · {r.action}</span></Td>
              <Td>{r.summary}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
          <Link className={page <= 1 ? "pointer-events-none opacity-40" : "font-medium text-green-deep hover:underline"} href={`/admin/audit?page=${page - 1}`}>← Newer</Link>
          <span className="text-muted">Page {page} of {pages}</span>
          <Link className={page >= pages ? "pointer-events-none opacity-40" : "font-medium text-green-deep hover:underline"} href={`/admin/audit?page=${page + 1}`}>Older →</Link>
        </nav>
      )}
    </>
  );
}
