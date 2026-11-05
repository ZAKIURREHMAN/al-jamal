import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export const metadata = pageMetadata({ title: "Track Your Order | Al Jamal", description: "Look up an Al Jamal order by its order number.", path: "/track", noIndex: true });

async function track(formData: FormData) {
  "use server";
  const raw = String(formData.get("orderNumber") ?? "").trim().toUpperCase();
  if (!/^AJ-\d{6}-[A-Z0-9]{5}$/.test(raw)) redirect("/track?error=1");
  redirect(`/order/${raw}`);
}

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const { error } = await searchParams;
  return (
    <Container className="max-w-lg py-16 sm:py-24">
      <h1 className="text-3xl font-bold text-green-deep sm:text-4xl">Track your order</h1>
      <p className="mt-3 text-ink">Enter the order number from your confirmation page (for example AJ-261101-ABC12).</p>
      <form action={track} className="mt-8 space-y-4 rounded-3xl bg-white p-6 ring-1 ring-line/60">
        <Field label="Order number" htmlFor="orderNumber" error={error ? "That doesn't look like a valid order number." : undefined}>
          <Input id="orderNumber" name="orderNumber" placeholder="AJ-XXXXXX-XXXXX" required autoComplete="off" className="uppercase" aria-invalid={!!error} />
        </Field>
        <Button type="submit" className="w-full">Find my order</Button>
      </form>
    </Container>
  );
}
