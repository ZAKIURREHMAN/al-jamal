import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { AccountForm } from "@/components/admin/account-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return (
    <>
      <PageHeader title="My account" description="Your login email and password. Passwords are stored encrypted and can't be shown, only changed." />
      <AccountForm name={session.name} email={session.email} />
    </>
  );
}
