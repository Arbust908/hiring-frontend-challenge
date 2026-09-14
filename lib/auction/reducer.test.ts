import { applyAuctionEnded, applyBid } from "./reducer";
import type { Auction, Bid } from "./types";

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  return {
    id: "a1",
    slug: "subasta",
    title: "Auto",
    make: "Ford",
    model: "Focus",
    version: null,
    year: 2020,
    odometer: 1000,
    location: "CABA",
    state: "LIVE",
    endsAt: null,
    currentBid: null,
    countBids: 0,
    bids: [],
    currency: { symbol: "$", name: "ARS" },
    images: [],
    ...overrides,
  };
}

function makeBid(overrides: Partial<Bid> = {}): Bid {
  return {
    id: "b1",
    amount: 1000,
    placedAt: "2026-08-29T18:04:11Z",
    isAuto: false,
    bidder: { username: "juanpe", verified: true },
    ...overrides,
  };
}

describe("applyBid", () => {
  it("adds the bid and updates the current bid", () => {
    const initial = makeAuction();
    const bid = makeBid({ id: "b1", amount: 5000, placedAt: "2026-08-29T18:10:00Z" });

    const result = applyBid(initial, bid);

    expect(result.bids).toEqual([bid]);
    expect(result.currentBid).toEqual(bid);
    expect(result.countBids).toBe(1);
  });

  it("ignores a bid that was already applied", () => {
    const initial = makeAuction({ currentBid: makeBid(), bids: [makeBid()], countBids: 1 });

    const result = applyBid(initial, makeBid());

    expect(result).toBe(initial);
  });

  it("keeps the highest bid when a lower one arrives late", () => {
    const top = makeBid({ id: "b2", amount: 9000, placedAt: "2026-08-29T18:12:00Z" });
    const initial = makeAuction({
      currentBid: top,
      bids: [top],
      countBids: 1,
    });

    const result = applyBid(initial, makeBid({ id: "b3", amount: 8000, placedAt: "2026-08-29T18:13:00Z" }));

    expect(result.currentBid).toEqual(top);
    expect(result.bids).toHaveLength(2);
    expect(result.countBids).toBe(2);
  });

  it("uses the placement time to break ties for equal amounts", () => {
    const earlier = makeBid({ id: "b1", amount: 9000, placedAt: "2026-08-29T18:12:00Z" });
    const later = makeBid({ id: "b2", amount: 9000, placedAt: "2026-08-29T18:13:00Z" });
    const initial = makeAuction({
      currentBid: earlier,
      bids: [earlier],
      countBids: 1,
    });

    const result = applyBid(initial, later);

    expect(result.currentBid).toEqual(later);
  });

  it("sorts the history from newest to oldest", () => {
    const older = makeBid({ id: "b1", placedAt: "2026-08-29T18:04:11Z" });
    const newer = makeBid({ id: "b2", placedAt: "2026-08-29T18:10:00Z" });
    const initial = makeAuction({ bids: [older], countBids: 1 });

    const result = applyBid(initial, newer);

    expect(result.bids.map((bid) => bid.id)).toEqual(["b2", "b1"]);
  });
});

describe("applyAuctionEnded", () => {
  it("marks a live auction as finished when the event says so", () => {
    const result = applyAuctionEnded(makeAuction(), "FINISHED_SALE");
    expect(result.state).toBe("FINISHED_SALE");
  });

  it("does not regress a finished auction", () => {
    const initial = makeAuction({ state: "FINISHED_SALE" });
    expect(applyAuctionEnded(initial, "LIVE")).toBe(initial);
    expect(applyAuctionEnded(initial, "FINISHED_NO_SALE")).toBe(initial);
  });

  it("ignores non-terminal incoming states", () => {
    const initial = makeAuction({ state: "LIVE" });
    expect(applyAuctionEnded(initial, "PENDING")).toBe(initial);
  });
});