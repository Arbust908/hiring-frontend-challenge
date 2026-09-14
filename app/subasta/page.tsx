import Link from "next/link";
import { AuctionCard } from "@/components/auction-card";
import { getLiveAuctions } from "@/lib/auction/queries";

export const dynamic = "force-dynamic";

export default async function SubastaPage() {
  const auctions = await getLiveAuctions();

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-(--page-width) px-(--page-gutter) pb-16 pt-10 sm:pb-24 sm:pt-14"
    >
      <header className="grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <h1 className="animate-rise font-display text-display font-extrabold uppercase tracking-[-0.02em] text-ink">
          Subastas
          <br />
          en vivo<span className="text-accent">.</span>
        </h1>
        <div className="animate-rise [animation-delay:60ms] md:pb-1 lg:pb-3">
          <p className="font-display text-lg font-bold uppercase leading-[1.1] tracking-wide text-ink">
            Tu próximo auto.
            <br />
            Una nueva historia.
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted sm:text-base sm:leading-7">
            Explorá los vehículos y seguí cada oferta, en tiempo real, desde el
            detalle de la subasta.
          </p>
        </div>
      </header>

      <div className="animate-rise mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-rule py-3 [animation-delay:120ms]">
        <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink">
          <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
          Mostrando {auctions.length}{" "}
          {auctions.length === 1 ? "subasta" : "subastas"}
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          Precios y estados al cargar esta página.
        </p>
      </div>

      {auctions.length > 0 ? (
        <section
          aria-label="Subastas activas"
          className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2"
        >
          {auctions.map((auction, index) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              featured={index === 0}
              index={index}
            />
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-card border border-dashed border-rule-dark bg-paper-2 px-6 py-20 text-center">
          <span
            aria-hidden="true"
            className="font-display text-4xl text-accent"
          >
            ↗
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold uppercase tracking-[-0.01em] text-ink">
            No hay subastas activas
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            La próxima oportunidad está en camino. Volvé pronto para descubrir
            nuevos vehículos.
          </p>
          <Link
            href="/subasta"
            className="group mt-6 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-semibold text-ink transition-colors duration-200 ease-out hover:text-accent-text"
          >
            Actualizar listado
            <span
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              ↗
            </span>
          </Link>
        </section>
      )}
    </main>
  );
}
