import type { Auction } from "@/lib/auction/types";

export function AuctionVehicleSpecs({
  auction,
  className = "",
}: {
  auction: Auction;
  className?: string;
}) {
  const rows: Array<[string, string]> = [
    ["Marca", auction.make],
    ["Modelo", auction.model],
    ["Versión", auction.version || "No informada"],
    ["Año", String(auction.year)],
    ["Kilometraje", `${auction.odometer.toLocaleString("es-AR")} km`],
    ["Ubicación", auction.location || "No informada"],
  ];

  return (
    <section aria-labelledby="vehicle-heading" className={className}>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 border-t border-rule sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="min-w-0 space-y-1 border-b border-rule py-3"
          >
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              {label}
            </dt>
            <dd className="wrap-break-words text-sm font-semibold tabular-nums text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
