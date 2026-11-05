import { Container } from "@/components/ui/container";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <div className="h-10 w-64 animate-pulse rounded bg-cream-deep" />
        <div className="mt-12"><ProductGridSkeleton count={8} /></div>
      </Container>
    </section>
  );
}
