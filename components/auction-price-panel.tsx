"use client";

import type { Auction } from "@/lib/auction/types";
import type { Clock } from "@/lib/websocket/live-auction";
import { getNextBid } from "@/lib/auction/bid-increment";
import { formatCountdown, formatMoney } from "@/lib/auction/format";
import { stateLabels } from "@/lib/auction/labels";

export function AuctionPricePanel({
  auction,
  stale,
  remaining,
  expired,
  clock,
  className = "",
}: {
  auction: Auction;
  stale: boolean;
  remaining: number | null;
  expired: boolean;
  clock: Clock | null;
  className?: string;
}) {
  const isOpen = auction.state === "LIVE";
  const amount = auction.currentBid?.amount ?? 0;

  return (
    <section
      aria-labelledby="price-heading"
      className={`auction-price rounded-card border border-rule bg-panel p-4 text-on-dark sm:p-6 ${className}`}
    >
      <div className="grid min-h-48 grid-cols-2 gap-4">
        <div className="min-w-0">
          <h2
            id="price-heading"
            className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-on-dark"
          >
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 bg-accent"
            />
            Última oferta registrada
          </h2>
          <p className="mt-3 wrap-break-words text-2xl font-extrabold tabular-nums tracking-tight sm:text-3xl">
            {auction.currentBid
              ? formatMoney(amount, auction.currency.symbol)
              : "Sin ofertas"}
          </p>
          <p className="mt-2 text-sm text-muted-on-dark">
            {auction.currency.name} ·{" "}
            {auction.countBids.toLocaleString("es-AR")} ofertas
          </p>
          <p
            className={`mt-1 min-h-10 text-xs leading-5 font-semibold ${stale ? "text-warning-on-dark" : "text-muted-on-dark"}`}
          >
            {stale
              ? "Precio sin confirmar en vivo"
              : isOpen
                ? "Precio actualizado en vivo"
                : "Registro final"}
          </p>
        </div>
        <div className="min-w-0 border-l border-rule-dark pl-4">
          <h3 className="text-sm font-semibold">
            {isOpen ? "Tiempo restante" : "Estado de la subasta"}
          </h3>
          <p
            aria-live="off"
            className="mt-3 wrap-break-words font-mono text-lg font-bold tabular-nums sm:text-xl"
          >
            {!isOpen
              ? stateLabels[auction.state]
              : expired
                ? "Confirmando cierre…"
                : remaining === null
                  ? "Cierre no informado"
                  : formatCountdown(remaining)}
          </p>
          {isOpen && (
            <p className="mt-2 min-h-10 text-xs leading-5 text-muted-on-dark sm:min-h-5">
              {expired &&
                "Esperamos confirmación del cierre; puede extenderse. "}
              {clock?.source === "server"
                ? "Tiempo calculado con el reloj del servidor."
                : clock?.source === "local"
                  ? "Tiempo estimado con el reloj de tu dispositivo."
                  : "Tiempo estimado al cargar la página; verificando reloj."}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() =>
          window.alert(
            "Esta es una demo: las pujas están deshabilitadas y no se registra ninguna oferta. El monto mostrado es orientativo hasta confirmar los datos en vivo.",
          )
        }
        className="mt-4 w-full min-h-11 cursor-pointer rounded-md bg-accent px-4 py-3 text-base font-bold uppercase tracking-wide text-accent-ink transition-colors hover:bg-accent-hover"
      >
        {isOpen && !expired
          ? `Pujar ${formatMoney(getNextBid(amount), auction.currency.symbol)}`
          : expired
            ? "Confirmando cierre"
            : auction.state === "PENDING" || auction.state === "DRAFT"
              ? "Pujas aún no habilitadas"
              : "Pujas cerradas"}
      </button>
    </section>
  );
}
