import { notFound } from "next/navigation";
import { AuctionLiveView } from "@/components/auction-live-view";
import { getAuction } from "@/lib/auction/queries";
import { AuctionGallery } from "@/components/auction-gallery";
import { AuctionVehicleSpecs } from "@/components/auction-vehicle-specs";

export const dynamic = "force-dynamic";

export default async function AuctionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { auction, serverTimeMs, receivedAtMs } = await getAuction(slug);
  if (!auction) notFound();
  const title = auction.title || `${auction.make} ${auction.model}`;
  return (
    <AuctionLiveView
      key={auction.id}
      initialAuction={auction}
      initialNow={serverTimeMs ?? receivedAtMs}
      heading={
        <>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
            Motordil · {auction.year} · {auction.make}
          </p>
          <h1 className="mt-3 warp-break-words md:mt-2 text-title font-display font-extrabold uppercase tracking-[-0.02em] text-ink wrap-anywhere">
            {title}
          </h1>
        </>
      }
      vehicleSpecs={
        <AuctionVehicleSpecs
          auction={auction}
          className="rounded-card border border-rule bg-paper p-4 sm:p-6"
        />
      }
      gallery={<AuctionGallery images={auction.images} title={title} />}
    />
  );
}
