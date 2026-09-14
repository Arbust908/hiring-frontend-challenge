"use client";

import { memo } from "react";
import type { Auction } from "@/lib/auction/types";
import { formatBidTime, formatMoney } from "@/lib/auction/format";

export const AuctionBidHistory = memo(function AuctionBidHistory({
  auction,
  className = "",
}: {
  auction: Auction;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="history-heading"
      className={`min-w-0 rounded-card border border-rule bg-paper p-4 sm:p-6 ${className}`}
    >
      <h2
        id="history-heading"
        className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-ink"
      >
        <span aria-hidden="true" className="inline-block h-2 w-2 bg-accent" />
        Historial de ofertas
      </h2>
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
        Horarios de Argentina · Últimos datos registrados
      </p>
      {auction.bids.length === 0 ? (
        <div className="auction-history-body mt-4 h-80 overflow-y-auto scrollbar-gutter-stable sm:h-96">
          <p className="pt-4 text-sm text-muted">
            Todavía no hay ofertas registradas.
          </p>
        </div>
      ) : (
        <ol
          className="auction-history-body mt-4 h-80 divide-y divide-rule overflow-y-auto scrollbar-gutter-stable outline-offset-4 sm:h-96"
          tabIndex={0}
          aria-label="Ofertas registradas"
        >
          {auction.bids.map((bid) => (
            <li
              key={bid.id}
              className="grid min-w-0 animate-bid-in grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-1 px-3 py-3 first:bg-paper-2"
            >
              <p className="min-w-0 font-semibold text-ink wrap-anywhere">
                {bid.bidder?.username || "Participante anónimo"}
                {bid.bidder?.verified && (
                  <span className="mt-1 block text-xs font-semibold text-success">
                    ✓ Verificado
                  </span>
                )}
              </p>
              <p className="min-w-0 text-right font-bold tabular-nums text-ink wrap-anywhere">
                {formatMoney(bid.amount, auction.currency.symbol)}
              </p>
              <p className="col-span-full flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-mono text-xs text-muted">
                <time dateTime={bid.placedAt}>
                  {formatBidTime(bid.placedAt)}
                </time>
                {bid.isAuto && <span>Oferta automática</span>}
              </p>
            </li>
          ))}
        </ol>
      )}
      <p className="auction-history-footer mt-3 min-h-4 text-xs text-muted">
        {auction.countBids > auction.bids.length &&
          `Se muestran ${auction.bids.length} de ${auction.countBids} ofertas.`}
      </p>
    </section>
  );
});
