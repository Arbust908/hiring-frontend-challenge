"use client";

import { useEffect, useState } from "react";
import { getLiveAuctions } from "../lib/auction/queries";
import type { Auction, AuctionSummary } from "../lib/auction/types";
import { LiveAuctionCard } from "./live-auction-card";

export function RawResults() {
  const [summaries, setSummaries] = useState<AuctionSummary[]>([]);
  const [graphqlRaw, setGraphqlRaw] = useState<unknown>(null);
  const [graphqlError, setGraphqlError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getLiveAuctions();
        if (cancelled) return;
        setSummaries(result);
        setGraphqlRaw(result);
      } catch (e) {
        if (!cancelled) setGraphqlError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const liveAuctions = summaries.filter((s) => s.state === "LIVE");

  return (
    <div className="w-full max-w-5xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Raw Results</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">GraphQL Response (getLiveAuctions)</h2>
        {graphqlError && <p className="text-red-500">Error: {graphqlError}</p>}
        <pre className="bg-zinc-900 text-green-400 p-4 rounded overflow-auto max-h-96 text-xs">
          {graphqlRaw ? JSON.stringify(graphqlRaw, null, 2) : "Loading..."}
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">WebSocket Live Data</h2>
        {liveAuctions.length === 0 && (
          <p className="text-zinc-500">No live auctions to connect to.</p>
        )}
        {liveAuctions.map((summary) => {
          const auction: Auction = {
            id: summary.id,
            slug: summary.slug,
            title: summary.title,
            make: summary.make,
            model: summary.model,
            version: null,
            year: summary.year,
            odometer: 0,
            location: summary.location,
            state: summary.state,
            endsAt: summary.endsAt,
            currentBid: summary.currentBid
              ? { id: "placeholder", amount: summary.currentBid.amount, placedAt: summary.currentBid.date, isAuto: false, bidder: null }
              : null,
            countBids: summary.countBids,
            bids: [],
            currency: summary.currency,
            images: [],
          };
          return <LiveAuctionCard key={summary.id} auction={auction} />;
        })}
      </section>
    </div>
  );
}
