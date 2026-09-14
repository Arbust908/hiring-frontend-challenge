import Link from "next/link";

function Wordmark() {
  return (
    <span className="font-body text-xl font-black lowercase tracking-tight text-ink">
      motordil<span className="text-accent">.</span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:bg-panel focus:px-4 focus:py-2 focus:text-on-dark"
      >
        Saltar al contenido
      </a>
      <header id="top" className="border-b border-rule bg-paper">
        <div className="mx-auto flex w-full max-w-(--page-width) items-center justify-between px-(--page-gutter) py-4">
          <Link
            href="/subasta"
            aria-label="Motordil, inicio"
            className="inline-flex min-h-11 shrink-0 items-center rounded"
          >
            <Wordmark />
          </Link>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule bg-paper">
      <div className="mx-auto flex w-full max-w-(--page-width) flex-col gap-6 px-(--page-gutter) py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Wordmark />
        </div>
        <div className="sm:text-right">
          <a
            href="#top"
            className="group mt-3 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-semibold text-ink transition-colors duration-200 ease-out hover:text-accent-text"
          >
            Volver arriba
            <span
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
            >
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
