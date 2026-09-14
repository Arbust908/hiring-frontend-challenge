import Link from "next/link";

export default function AuctionNotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-(--page-width) px-(--page-gutter) py-20"
    >
      <div className="max-w-xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
          Error 404
        </p>
        <h1 className="mt-3 text-heading font-display font-extrabold uppercase tracking-[-0.02em] text-ink">
          No encontramos esta subasta
        </h1>
        <p className="mt-4 text-muted">
          Revisá el enlace o explorá las subastas disponibles.
        </p>
        <Link
          href="/subasta"
          className="mt-8 inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-3 font-bold uppercase tracking-wide text-accent-ink transition-[background-color,transform] duration-200 ease-out hover:bg-accent-hover active:translate-y-px"
        >
          Ver subastas
        </Link>
      </div>
    </main>
  );
}
