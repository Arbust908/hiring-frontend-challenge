const block = "motion-safe:animate-pulse rounded-md";

export function AuctionConnectionSkeleton() {
  return (
    <aside
      aria-label="Estado de actualización"
      aria-busy="true"
      className="auction-connection items-center border-y border-rule py-2"
    >
      <span className="sr-only" role="status">
        Cargando conexión en vivo…
      </span>
      <div aria-hidden="true" className="col-span-2 min-w-0">
        <div className={`${block} h-5 w-56 max-w-full bg-paper-2`} />
      </div>
      <div aria-hidden="true" className="col-span-2 min-w-0">
        <div className={`${block} h-5 w-40 max-w-full bg-paper-2`} />
      </div>
      <p
        aria-hidden="true"
        className={`${block} col-span-2 h-5 w-56 max-w-full bg-paper-2`}
      />
    </aside>
  );
}

export function AuctionPanelsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando datos de la subasta"
      className="contents lg:col-start-2 lg:row-start-1 lg:grid lg:min-w-0 lg:gap-6"
    >
      <div className="order-1 min-w-0 lg:order-0">
        <AuctionConnectionSkeleton />
      </div>
      <section className="auction-price order-2 min-w-0 rounded-card border border-rule bg-panel p-4 sm:p-6 lg:order-0">
        <div className="grid min-h-48 grid-cols-2 gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-on-dark">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 bg-accent"
              />
              Última oferta registrada
            </h2>
            <div aria-hidden="true" className="space-y-3">
              <div className={`${block} mt-3 h-10 w-3/4 bg-rule-dark`} />
              <div className={`${block} h-5 w-1/2 bg-rule-dark`} />
              <div className={`${block} h-5 w-2/3 bg-rule-dark`} />
            </div>
          </div>
          <div
            aria-hidden="true"
            className="space-y-3 border-l border-rule-dark pl-4"
          >
            <div className={`${block} h-5 w-1/2 bg-rule-dark`} />
            <div className={`${block} h-8 w-2/3 bg-rule-dark`} />
            <div className={`${block} h-10 w-full bg-rule-dark`} />
          </div>
        </div>
        <div
          aria-hidden="true"
          className={`${block} mt-4 h-12 w-full bg-rule-dark`}
        />
      </section>
      <section className="order-5 min-w-0 rounded-card border border-rule bg-paper p-4 sm:p-6 lg:order-0">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-ink">
          <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
          Historial de ofertas
        </h2>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
          Horarios de Argentina · Últimos datos registrados
        </p>
        <div
          aria-hidden="true"
          className="auction-history-body mt-4 h-80 space-y-4 overflow-y-auto scrollbar-gutter-stable sm:h-96"
        >
          {[0, 1, 2].map((row) => (
            <div key={row} className={`${block} h-16 w-full bg-paper-2`} />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="auction-history-footer mt-3 min-h-4"
        />
      </section>
    </div>
  );
}
