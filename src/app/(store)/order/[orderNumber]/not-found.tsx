import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-bold text-green-deep">Order not found</h1>
      <p className="mt-3 text-ink">Please check the order number and try again.</p>
      <ButtonLink href="/track" className="mt-8">Track an order</ButtonLink>
    </Container>
  );
}
