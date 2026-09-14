import type { AuctionState, Bid } from "../auction/types";

export type AuctionEvent =
  | { type: "bid_placed"; bid: Bid }
  | { type: "auction_ended"; state: Extract<AuctionState, "FINISHED_SALE" | "FINISHED_NO_SALE" | "CANCELLED"> };

export type SocketMessage = AuctionEvent
  | { type: "subscribed" }
  | { type: "failed_subscribe"; message: string }
  | { type: "pong" };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function parseId(value: unknown): string | null {
  const raw = typeof value === "string" ? value : asRecord(value)?.$oid;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

/** The wire protocol is untrusted, including messages for other subscriptions. */
export function normalizeMessage(data: unknown, auctionId: string): SocketMessage | null {
  if (typeof data !== "string") return null;
  let value: Record<string, unknown> | null;
  try { value = asRecord(JSON.parse(data)); } catch { return null; }
  if (!value) return null;
  if (value.type === "pong") return { type: "pong" };
  if (parseId(value.auction_id) !== auctionId) return null;
  if (value.type === "subscribed") return { type: "subscribed" };
  if (value.type === "failed_subscribe") {
    return {
      type: "failed_subscribe", message: typeof value.message === "string"
        ? value.message : "No se pudo suscribir a la subasta."
    };
  }
  if (value.type === "auction_ended") {
    const state = typeof value.state === "string" ? value.state.toUpperCase() : "";
    if (state !== "FINISHED_SALE" && state !== "FINISHED_NO_SALE" && state !== "CANCELLED") return null;
    return { type: "auction_ended", state };
  }
  if (value.type !== "bid_placed") return null;
  const bidId = parseId(value.bid_id);
  if (!bidId) return null;
  if (
    typeof value.bid_amount !== "number" ||
    !Number.isFinite(value.bid_amount) ||
    value.bid_amount < 0
  ) return null;
  if (
    typeof value.placed_at !== "string" ||
    !Number.isFinite(Date.parse(value.placed_at))
  ) return null;
  if (typeof value.is_auto !== "boolean") return null;

  let bidder: Bid["bidder"] = null;
  if (value.bidder_profile != null) {
    const profile = asRecord(value.bidder_profile);
    if (
      !profile ||
      typeof profile.username !== "string" ||
      typeof profile.is_verified !== "boolean"
    ) return null;
    const bidderId = parseId(profile._id);
    bidder = {
      username: profile.username,
      verified: profile.is_verified,
      ...(bidderId ? { id: bidderId } : {}),
      ...(typeof profile.avatar_url === "string" ? { avatar: profile.avatar_url } : {}),
    };
  }
  return {
    type: "bid_placed",
    bid: {
      id: bidId, amount: value.bid_amount, placedAt: value.placed_at, isAuto: value.is_auto,
      bidder,
    },
  };
}
