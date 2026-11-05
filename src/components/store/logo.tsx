import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Brand wordmark. `light` switches to the cream version for dark backgrounds. */
export function Logo({ className, light = false, height = 36 }: { className?: string; light?: boolean; height?: number }) {
  const src = light ? "/brand/wordmark-cream.png" : "/brand/wordmark.png";
  // Source image is 1449×303
  const width = Math.round(height * (1449 / 303));
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label="Al Jamal — Home">
      <Image src={src} alt="Al Jamal" width={width} height={height} priority className="h-auto" style={{ width, height: "auto" }} />
    </Link>
  );
}
