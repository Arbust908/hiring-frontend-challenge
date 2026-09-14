"use client";

import Link from "next/link";
import { useTransition } from "react";

export default function AuctionError({
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
          No pudimos cargar la subasta
        </h1>
        <p className="mt-4 text-muted">
          Hubo un problema al consultar los datos. Probá de nuevo en unos
          instantes.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <button
            disabled={pending}
            aria-busy={pending}
            onClick={() => startTransition(retry)}
            className="min-h-11 min-w-40 rounded-md bg-accent px-6 py-3 font-bold uppercase tracking-wide text-accent-ink transition-[background-color,transform] duration-200 ease-out hover:bg-accent-hover active:translate-y-px disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? "Reintentando…" : "Reintentar"}
          </button>
          <Link
            href="/subasta"
            className="inline-flex min-h-11 items-center rounded text-sm font-semibold text-ink underline decoration-rule underline-offset-4 transition-colors duration-200 ease-out hover:text-accent-text hover:decoration-accent"
          >
            Volver a subastas
          </Link>
        </div>
      </div>
    </main>
  );
}
