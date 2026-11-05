import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-bold text-green-deep">We couldn&apos;t find that product</h1>
      <p className="mt-3 text-ink">It may have been removed or the link is incorrect.</p>
      <ButtonLink href="/products" className="mt-8">Browse all products</ButtonLink>
    </Container>
  );
}
