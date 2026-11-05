"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-cream px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-green-deep">Something went wrong</h1>
      <p className="mt-3 max-w-md text-ink">We couldn&apos;t load this page. Please try again in a moment.</p>
      <button onClick={reset} className="mt-8 inline-flex h-11 items-center rounded-full bg-green px-6 text-sm font-semibold text-white hover:bg-green-deep">Try again</button>
    </main>
  );
}
