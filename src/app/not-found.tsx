import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-cream px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-green-deep sm:text-4xl">This page has gone missing</h1>
      <p className="mt-3 max-w-md text-ink">The link may be broken or the page may have been moved.</p>
      <Link href="/" className="mt-8 inline-flex h-11 items-center rounded-full bg-green px-6 text-sm font-semibold text-white hover:bg-green-deep">Back to home</Link>
    </main>
  );
}
