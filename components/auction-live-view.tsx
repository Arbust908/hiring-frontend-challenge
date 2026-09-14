"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import type { Auction } from "@/lib/auction/types";
import { stateLabels } from "@/lib/auction/labels";
import { useLiveAuction } from "@/lib/auction/use-live-auction";
import { useTick } from "@/lib/auction/use-tick";
import { NavigationPending } from "@/components/navigation-pending";
import { AuctionConnectionBanner } from "@/components/auction-connection-banner";
import { AuctionPricePanel } from "@/components/auction-price-panel";
import { AuctionBidHistory } from "@/components/auction-bid-history";

export function AuctionLiveView({
  initialAuction,
  initialNow,
  heading,
  vehicleSpecs,
  gallery,
}: {
  initialAuction: Auction;
  initialNow: number;
  heading: ReactNode;
  vehicleSpecs: ReactNode;
  gallery: ReactNode;
}) {
  const { auction, connection, connectionFailure, clock, reconcile } =
    useLiveAuction(initialAuction);
  const tick = useTick();
  const reconciledEnds = useRef(new Set<string>());
  const isOpen = auction.state === "LIVE";
  const stale = isOpen && connection.status !== "live";

  const now =
    clock && tick
      ? clock.serverTimeMs + tick.monotonic - clock.monotonicTimeMs
      : initialNow;
  const end = auction.endsAt ? Date.parse(auction.endsAt) : NaN;
  const remaining = Number.isFinite(end) ? end - now : null;
  const expired = isOpen && remaining !== null && remaining <= 0;
  const retrySeconds =
    tick && connection.retryAt !== null
      ? Math.max(0, Math.ceil((connection.retryAt - tick.wall) / 1000))
      : null;

  useEffect(() => {
    if (
      clock &&
      tick &&
      expired &&
      auction.endsAt &&
      !reconciledEnds.current.has(auction.endsAt)
    ) {
      reconciledEnds.current.add(auction.endsAt);
      reconcile();
    }
  }, [clock, tick, expired, auction.endsAt, reconcile]);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-(--page-width) px-(--page-gutter) py-8 sm:py-12"
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/subasta"
          className="inline-flex min-h-11 items-center rounded font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted transition-colors duration-200 ease-out hover:text-accent-text"
        >
          ← Volver a subastas
          <NavigationPending />
        </Link>
        <p className="text-right text-sm font-semibold">
          {expired ? "Confirmando cierre…" : stateLabels[auction.state]}
        </p>
      </div>

      <header className="my-6 animate-fade-in">
        <div className="min-w-0">{heading}</div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="contents lg:col-start-2 lg:row-start-1 lg:grid lg:min-w-0 lg:gap-6">
          <div className="order-1 min-w-0 lg:order-0">
            <AuctionConnectionBanner
              state={auction.state}
              connection={connection}
              connectionFailure={connectionFailure}
              stale={stale}
              retrySeconds={retrySeconds}
              onVerify={reconcile}
            />
          </div>

          <div className="order-2 animate-fade-in min-w-0 [animation-delay:120ms] lg:order-0">
            <AuctionPricePanel
              auction={auction}
              stale={stale}
              remaining={remaining}
              expired={expired}
              clock={clock}
            />
          </div>
          <div className="order-5 animate-fade-in min-w-0 [animation-delay:120ms] lg:order-0">
            <AuctionBidHistory auction={auction} />
          </div>
        </div>
        <div className="contents lg:col-start-1 lg:row-start-1 lg:grid lg:min-w-0 lg:gap-6">
          <div className="order-3 animate-fade-in min-w-0 [animation-delay:60ms] lg:order-2">
            {vehicleSpecs}
          </div>
          <div className="order-4 animate-fade-in min-w-0 [animation-delay:60ms] lg:order-1">
            {gallery}
          </div>
        </div>
      </div>
    </main>
  );
}
