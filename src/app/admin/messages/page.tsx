import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { MessagesList } from "@/components/admin/messages-list";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <>
      <PageHeader title="Messages" description="Messages sent through the contact form on the website." />
      <MessagesList messages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
    </>
  );
}
