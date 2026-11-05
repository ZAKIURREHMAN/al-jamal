import { PageHeader, BackLink } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <>
      <BackLink href="/admin/products">All products</BackLink>
      <PageHeader title="Add product" />
      <ProductForm />
    </>
  );
}
