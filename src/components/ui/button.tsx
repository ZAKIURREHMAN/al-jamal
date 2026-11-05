import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0";

const variants = {
  primary: "bg-green text-white shadow-soft hover:bg-green-deep hover:-translate-y-0.5",
  secondary: "bg-white text-green-deep ring-1 ring-line hover:ring-green hover:-translate-y-0.5",
  gold: "bg-gold text-charcoal hover:bg-[#c9931a] hover:-translate-y-0.5 shadow-soft",
  ghost: "text-green-deep hover:bg-green-soft",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-green text-green hover:bg-green hover:text-white",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
  icon: "h-10 w-10",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
