import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export default function ArticleNotFound() {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-bold text-green-deep">Article not found</h1>
      <p className="mt-3 text-ink">It may have moved. Browse all our desi ghee guides instead.</p>
      <ButtonLink href="/blog" className="mt-8">All guides</ButtonLink>
    </Container>
  );
}
