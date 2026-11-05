"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Plus, Trash2, Upload, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Label } from "@/components/ui/field";
import { Card } from "@/components/admin/ui";
import { apiFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { productInputSchema, type ProductInput } from "@/lib/validation";

type VariantRow = { id?: string; label: string; weightGrams: string; priceRupees: string; stock: string; sku: string; isActive: boolean };
type ImageRow = { id?: string; url: string; alt: string };

const emptyVariant = (): VariantRow => ({ label: "", weightGrams: "", priceRupees: "", stock: "0", sku: "", isActive: true });

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function ProductForm({ productId, initial }: { productId?: string; initial?: ProductInput & { variants: (ProductInput["variants"][number] & { id?: string })[]; images: (ProductInput["images"][number] & { id?: string })[] } }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map((v) => ({ id: v.id, label: v.label, weightGrams: String(v.weightGrams), priceRupees: String(v.priceRupees), stock: String(v.stock), sku: v.sku ?? "", isActive: v.isActive })) ?? [
      { label: "500g", weightGrams: "500", priceRupees: "", stock: "0", sku: "", isActive: true },
      { label: "1kg", weightGrams: "1000", priceRupees: "", stock: "0", sku: "", isActive: true },
    ],
  );
  const [images, setImages] = useState<ImageRow[]>(initial?.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })) ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function setVariant(i: number, patch: Partial<VariantRow>) {
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Upload failed");
        setImages((imgs) => [...imgs, { url: json.data.url, alt: name || "Product image" }]);
      }
      toast("Image uploaded.");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function move(i: number, dir: -1 | 1) {
    setImages((imgs) => {
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return imgs;
      const next = [...imgs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    const payload = {
      name,
      slug,
      shortDescription,
      description,
      isActive,
      isFeatured,
      sortOrder: Number(sortOrder) || 0,
      variants: variants.map((v, i) => ({
        id: v.id,
        label: v.label,
        weightGrams: Number(v.weightGrams),
        priceRupees: Number(v.priceRupees),
        stock: Number(v.stock),
        sku: v.sku,
        isActive: v.isActive,
        sortOrder: i,
      })),
      images: images.map((img, i) => ({ id: img.id, url: img.url, alt: img.alt, sortOrder: i })),
    };
    const parsed = productInputSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[issue.path.join(".")] = issue.message;
      setErrors(next);
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    setBusy(true);
    try {
      if (productId) {
        await apiFetch(`/api/admin/products/${productId}`, { method: "PUT", body: JSON.stringify(parsed.data) });
        toast("Product saved.");
        router.refresh();
      } else {
        const created = await apiFetch<{ id: string }>("/api/admin/products", { method: "POST", body: JSON.stringify(parsed.data) });
        toast("Product created.");
        router.push(`/admin/products/${created.id}`);
      }
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <Card>
          <h2 className="text-lg font-bold text-green-deep">Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Product name" htmlFor="name" error={errors.name} className="sm:col-span-2">
              <Input id="name" value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} aria-invalid={!!errors.name} />
            </Field>
            <Field label="URL slug" htmlFor="slug" error={errors.slug} hint="Lowercase letters, numbers and hyphens." className="sm:col-span-2">
              <Input id="slug" value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} aria-invalid={!!errors.slug} />
            </Field>
            <Field label="Short description" htmlFor="short" error={errors.shortDescription} hint="Shown on product cards (max 200 characters)." className="sm:col-span-2">
              <Input id="short" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={200} aria-invalid={!!errors.shortDescription} />
            </Field>
            <Field label="Full description" htmlFor="desc" error={errors.description} hint="Separate paragraphs with a blank line." className="sm:col-span-2">
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[160px]" aria-invalid={!!errors.description} />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-green-deep">Weights &amp; prices</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => setVariants((vs) => [...vs, emptyVariant()])}><Plus className="h-4 w-4" /> Add weight</Button>
          </div>
          {errors.variants && <p className="mt-2 text-sm text-red-600">{errors.variants}</p>}
          <div className="mt-4 space-y-3">
            {variants.map((v, i) => (
              <div key={v.id ?? `new-${i}`} className="grid gap-3 rounded-2xl bg-cream p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
                <Field label="Label" htmlFor={`v-label-${i}`} error={errors[`variants.${i}.label`]}><Input id={`v-label-${i}`} value={v.label} onChange={(e) => setVariant(i, { label: e.target.value })} placeholder="500g" /></Field>
                <Field label="Grams" htmlFor={`v-g-${i}`} error={errors[`variants.${i}.weightGrams`]}><Input id={`v-g-${i}`} type="number" inputMode="numeric" value={v.weightGrams} onChange={(e) => setVariant(i, { weightGrams: e.target.value })} /></Field>
                <Field label="Price (Rs.)" htmlFor={`v-p-${i}`} error={errors[`variants.${i}.priceRupees`]}><Input id={`v-p-${i}`} type="number" inputMode="decimal" value={v.priceRupees} onChange={(e) => setVariant(i, { priceRupees: e.target.value })} /></Field>
                <Field label="Stock" htmlFor={`v-s-${i}`} error={errors[`variants.${i}.stock`]}><Input id={`v-s-${i}`} type="number" inputMode="numeric" value={v.stock} onChange={(e) => setVariant(i, { stock: e.target.value })} /></Field>
                <Field label="SKU" htmlFor={`v-sku-${i}`} error={errors[`variants.${i}.sku`]}><Input id={`v-sku-${i}`} value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} placeholder="optional" /></Field>
                <div className="flex items-end gap-2 pb-1">
                  <label className="flex items-center gap-1.5 text-xs font-medium"><input type="checkbox" checked={v.isActive} onChange={(e) => setVariant(i, { isActive: e.target.checked })} className="accent-green" /> Active</label>
                  <button type="button" aria-label="Remove weight" onClick={() => setVariants((vs) => vs.filter((_, idx) => idx !== i))} disabled={variants.length <= 1} className="rounded-full p-2 text-red-600 hover:bg-red-50 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-green-deep">Images</h2>
            <div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" id="image-upload" onChange={(e) => onUpload(e.target.files)} />
              <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload images"}</Button>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted">JPG, PNG or WebP up to 6MB. Images are converted to WebP automatically. The first image is the main one.</p>
          {images.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">No images yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {images.map((img, i) => (
                <li key={img.url} className="flex gap-3 rounded-2xl bg-cream p-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white"><Image src={img.url} alt="" fill sizes="80px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1">
                    <Label htmlFor={`alt-${i}`} className="text-xs">Alt text</Label>
                    <Input id={`alt-${i}`} value={img.alt} onChange={(e) => setImages((imgs) => imgs.map((x, idx) => (idx === i ? { ...x, alt: e.target.value } : x)))} className="py-2 text-sm" />
                    <div className="mt-2 flex gap-1">
                      <button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="rounded-full p-1.5 text-muted hover:bg-white"><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="rounded-full p-1.5 text-muted hover:bg-white"><ArrowDown className="h-4 w-4" /></button>
                      <button type="button" aria-label="Remove image" onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))} className="rounded-full p-1.5 text-red-600 hover:bg-white"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="lg:sticky lg:top-6">
          <h2 className="text-lg font-bold text-green-deep">Visibility</h2>
          <label className="mt-4 flex items-center gap-3 text-sm"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-green" /> Active (visible in store)</label>
          <label className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 accent-green" /> Featured on homepage</label>
          <Field label="Sort order" htmlFor="sort" hint="Lower numbers appear first." className="mt-4">
            <Input id="sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </Field>
          <Button type="submit" className="mt-6 w-full" disabled={busy || uploading}>{busy ? "Saving…" : productId ? "Save changes" : "Create product"}</Button>
          {productId && <a href={`/products/${slug}`} target="_blank" rel="noreferrer" className="mt-3 block text-center text-sm font-medium text-green-deep hover:underline">View in store ↗</a>}
        </Card>
      </div>
    </form>
  );
}
