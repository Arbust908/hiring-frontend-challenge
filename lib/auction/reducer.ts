import type { Auction, AuctionState, Bid } from "./types";

export function applyBid(auction: Auction, bid: Bid): Auction {
  if (auction.bids.some((existing) => existing.id === bid.id)) return auction;

  const alreadyCounted = auction.currentBid?.id === bid.id;
  const bids = [...auction.bids, bid].sort(
    (a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt),
  );
  const currentBid =
    !auction.currentBid ||
    bid.amount > auction.currentBid.amount ||
    (bid.amount === auction.currentBid.amount &&
      Date.parse(bid.placedAt) > Date.parse(auction.currentBid.placedAt))
      ? bid
      : auction.currentBid;

  return {
    ...auction,
    currentBid,
    bids,
    countBids: Math.max(auction.countBids + (alreadyCounted ? 0 : 1), bids.length),
  };
}

export function applyAuctionEnded(auction: Auction, state: AuctionState): Auction {
  const terminal = (value: AuctionState) =>
    value === "FINISHED_SALE" || value === "FINISHED_NO_SALE" || value === "CANCELLED";
  if (terminal(auction.state) || !terminal(state)) return auction;
  return { ...auction, state };
}
