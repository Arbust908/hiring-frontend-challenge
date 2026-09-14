"use client";

import { useTransition } from "react";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-(--page-width) px-(--page-gutter) py-20"
    >
      <div className="max-w-xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
          Error de carga
        </p>
        <h1 className="mt-3 text-heading font-display font-extrabold uppercase tracking-[-0.02em] text-ink">
          No pudimos cargar las subastas
        </h1>
        <p className="mt-4 text-muted">Intentá nuevamente en unos instantes.</p>
        <button
          disabled={pending}
          aria-busy={pending}
          onClick={() => startTransition(retry)}
          className="mt-8 min-h-11 min-w-36 rounded-md bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wide text-accent-ink transition-[background-color,transform] duration-200 ease-out hover:bg-accent-hover active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Reintentando…" : "Reintentar"}
        </button>
      </div>
    </main>
  );
}
