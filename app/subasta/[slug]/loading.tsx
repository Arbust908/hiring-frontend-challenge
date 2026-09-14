import Link from "next/link";
import { AuctionPanelsSkeleton } from "@/components/auction-skeleton";

export default function Loading() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-(--page-width) px-(--page-gutter) py-8 sm:py-12"
    >
      <Link
        href="/subasta"
        className="inline-flex min-h-11 items-center rounded font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted transition-colors duration-200 ease-out hover:text-accent-text"
      >
        ← Volver a subastas
      </Link>
      <header className="my-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
          Motordil
        </p>
        <h1 className="mt-3 md:mt-2 text-title font-display font-extrabold uppercase tracking-[-0.02em] text-ink wrap-anywhere">
          Cargando subasta…
        </h1>
      </header>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <AuctionPanelsSkeleton />
        <div className="contents lg:col-start-1 lg:row-start-1 lg:grid lg:min-w-0 lg:gap-6">
          <div
            aria-hidden="true"
            className="order-3 min-w-0 rounded-card border border-rule bg-paper p-4 sm:p-6 lg:order-2"
          >
            <div className="mt-3 grid grid-cols-2 gap-x-4 border-t border-rule sm:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="min-w-0 space-y-1 border-b border-rule py-3"
                >
                  <div className="h-4 w-1/2 rounded-md bg-paper-2 motion-safe:animate-pulse" />
                  <div className="h-5 w-3/4 rounded-md bg-paper-2 motion-safe:animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div aria-hidden="true" className="order-4 min-w-0 lg:order-1">
            <div className="aspect-video rounded-card border border-rule bg-paper-2 motion-safe:animate-pulse" />
            <div className="auction-thumbnails mt-3 h-18" />
          </div>
        </div>
      </div>
    </main>
  );
}
