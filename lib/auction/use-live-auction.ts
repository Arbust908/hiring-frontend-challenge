"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { getAuction } from "./queries";
import { initialLiveState, liveReducer, startLiveAuction, type LiveAuctionSession } from "../websocket/live-auction";
import type { Auction } from "./types";

export function useLiveAuction(initialAuction: Auction) {
  const [state, dispatch] = useReducer(liveReducer, initialAuction, initialLiveState);
  const session = useRef<LiveAuctionSession | null>(null);

  useEffect(() => {
    dispatch({ type: "reset", auction: initialAuction });
    const current = startLiveAuction(initialAuction, dispatch, getAuction);
    session.current = current;
    return () => {
      session.current = null;
      current.dispose();
    };
  }, [initialAuction]);

  const reconcile = useCallback(() => session.current?.reconcile(), []);
  return { ...state, reconcile };
}
