import { AuctionCardLink } from "@/components/auction-card-link";
import type { AuctionPart, AuctionSummary } from "@/lib/auction/types";
import { formatBidTime, formatMoney } from "@/lib/auction/format";
import { NavigationPending } from "@/components/navigation-pending";
import { VehicleImage } from "@/components/vehicle-image";

function getImageUri(parts: AuctionPart[]) {
  for (const part of parts) {
    if (part.__typename === "MainImage" && part.imageUri) {
      return part.imageUri;
    }

    if (part.__typename === "ImageGallery" && part.imageUris?.[0]) {
      return part.imageUris[0];
    }
  }

  return null;
}

export function AuctionCard({
  auction,
  featured = false,
  index = 0,
}: {
  auction: AuctionSummary;
  featured?: boolean;
  index?: number;
}) {
  const imageUri = getImageUri(auction.parts);
  const location = auction.location;
  const title = auction.title || `${auction.make} ${auction.model}`;
  const entranceDelay = 160 + Math.min(index, 8) * 40;

  return (
    <article
      className={`group flex animate-rise flex-col overflow-hidden rounded-card border border-rule bg-paper md:[&>a]:grid md:[&>a]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] ${featured ? "col-span-full lg:[&>a]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" : " xl:[&>a]:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]"}`}
      style={{ animationDelay: `${entranceDelay}ms` }}
    >
      <AuctionCardLink href={`/subasta/${auction.slug}`}>
        <div
          className={`relative overflow-hidden bg-paper-2 ${featured ? "aspect-16/10 md:aspect-auto md:min-h-72 lg:min-h-96" : "aspect-4/3 md:aspect-auto md:min-h-64"}`}
        >
          <VehicleImage
            key={imageUri}
            src={imageUri ?? undefined}
            alt={title}
            priority={featured}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
          <span className="absolute left-3 top-3 rounded-xs bg-panel px-2.5 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-on-dark">
            Datos al cargar
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-3 text-on-dark opacity-0 transition-opacity duration-200 ease-out group-focus-within:opacity-100 group-hover:opacity-100"
          >
            ↗
          </span>
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col p-5 ${featured ? "lg:p-8" : ""}`}
        >
          <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent-text">
            {auction.year} <span aria-hidden="true">/</span> {auction.make}
          </p>
          <h2
            className={`mt-3 wrap-break-words font-display font-bold uppercase leading-[1.05] tracking-[-0.01em] text-ink ${featured ? "text-4xl lg:text-5xl" : "text-xl sm:text-2xl"}`}
          >
            {title}
          </h2>
          {location && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <span aria-hidden="true">⌖</span> {location}
            </p>
          )}

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-t border-rule pt-4">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                Última oferta registrada
              </p>
              <p
                className={`mt-1 wrap-break-words font-bold tabular-nums text-ink ${featured ? "text-xl" : "text-lg"}`}
              >
                {auction.currentBid
                  ? formatMoney(
                      auction.currentBid.amount,
                      auction.currency.symbol,
                      0,
                    )
                  : "Sin ofertas"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                Ofertas
              </p>
              <p
                className={`mt-1 font-bold tabular-nums text-ink ${featured ? "text-xl" : "text-lg"}`}
              >
                {auction.countBids}
              </p>
            </div>
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
            Ver subasta
            <NavigationPending />
            <span
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              ↗
            </span>
          </span>
        </div>
      </AuctionCardLink>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-panel px-4 py-3 text-sm font-semibold text-on-dark sm:px-5">
        <span className="text-muted-on-dark">
          Cierre previsto <span aria-hidden="true">·</span> hora argentina
        </span>
        {auction.endsAt ? (
          <time dateTime={auction.endsAt} className="font-mono tabular-nums">
            {formatBidTime(auction.endsAt)}
          </time>
        ) : (
          <span>Cierre no informado</span>
        )}
      </div>
    </article>
  );
}
