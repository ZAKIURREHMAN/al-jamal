import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { mailConfigured } from "@/lib/mailer";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/admin");
  return (
    <>
      <PageHeader title="Store settings" description="Contact details and delivery charges. Changes apply to the website immediately — no rebuild needed." />
      <SettingsForm initial={await getSettings()} mailConfigured={mailConfigured()} />
    </>
  );
}
