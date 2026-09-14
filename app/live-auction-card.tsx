"use client";

import { useEffect, useReducer, useRef } from "react";
import { initialLiveState, liveReducer, startLiveAuction } from "../lib/websocket/live-auction";
import { getAuction } from "../lib/auction/queries";
import type { Auction } from "../lib/auction/types";

type Props = { auction: Auction };

export function LiveAuctionCard({ auction: initial }: Props) {
  const [state, dispatch] = useReducer(liveReducer, initial, initialLiveState);
  const sessionRef = useRef<ReturnType<typeof startLiveAuction> | null>(null);

  useEffect(() => {
    const session = startLiveAuction(initial, dispatch, getAuction);
    sessionRef.current = session;
    return () => { sessionRef.current = null; session.dispose(); };
  }, [initial]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        {state.auction.title} — <span className="text-zinc-500">{state.connection.status}</span>
      </h3>
      <pre className="bg-zinc-900 text-amber-400 p-4 rounded overflow-auto max-h-64 text-xs">
        {JSON.stringify(state.auction, null, 2)}
      </pre>
    </div>
  );
}
