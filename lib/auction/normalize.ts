import type { Auction, AuctionPart, AuctionState, AuctionSummary, Bid } from "./types";

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid auction data: expected an object");
  }
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid auction data: expected text");
  return value;
}

function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Invalid auction data: expected a finite number");
  }
  return value;
}

export function normalizeId(value: unknown): string {
  return text(typeof value === "string" ? value : object(value).$oid);
}

export function normalizeAuctionState(value: unknown): AuctionState {
  const state = text(value).toUpperCase();
  switch (state) {
    case "FINISHED_SALE":
    case "FINISHED_NO_SALE":
    case "LIVE":
    case "CANCELLED":
    case "DRAFT":
    case "PENDING":
      return state;
    default:
      throw new Error(`Invalid auction state: ${state}`);
  }
}

export function normalizeBid(value: unknown): Bid {
  const bid = object(value);
  const rawProfile = bid.bidder ?? bid.profile ?? bid.bidder_profile;
  const profile = rawProfile == null ? null : object(rawProfile);
  const profileId = profile?.id ?? profile?._id;
  const avatar = profile?.avatar ?? profile?.avatar_url;
  const placedAt = text(bid.placedAt ?? bid.date ?? bid.placed_at);
  if (!Number.isFinite(Date.parse(placedAt))) throw new Error("Invalid bid timestamp");
  return {
    id: normalizeId(bid.id ?? bid._id ?? bid.bid_id),
    amount: number(bid.amount ?? bid.bid_amount),
    placedAt,
    isAuto: (bid.isAuto ?? bid.is_auto) === true,
    bidder: profile
      ? {
          ...(profileId == null ? {} : { id: normalizeId(profileId) }),
          username: text(profile.username),
          ...(avatar == null ? {} : { avatar: text(avatar) }),
          verified: (profile.verified ?? profile.isVerified ?? profile.is_verified) === true,
        }
      : null,
  };
}

export function normalizeAuctionSummary(value: unknown): AuctionSummary {
  const auction = object(value);
  const currency = object(auction.currency);
  if (!Array.isArray(auction.parts)) throw new Error("Invalid auction data: missing parts");
  const currentBid = auction.currentBid == null ? null : object(auction.currentBid);
  const endsAt = auction.endsAt == null ? null : text(auction.endsAt);
  if (endsAt !== null && !Number.isFinite(Date.parse(endsAt))) throw new Error("Invalid auction closing timestamp");
  const bidDate = currentBid ? text(currentBid.date) : null;
  if (bidDate !== null && !Number.isFinite(Date.parse(bidDate))) throw new Error("Invalid bid timestamp");
  const parts = auction.parts.flatMap((value): AuctionPart[] => {
    const part = object(value);
    if (part.__typename === "MainImage") return [{ __typename: "MainImage", imageUri: text(part.imageUri) }];
    if (part.__typename === "ImageGallery") {
      if (!Array.isArray(part.imageUris)) throw new Error("Invalid image gallery");
      return [{ __typename: "ImageGallery", imageUris: part.imageUris.map(text) }];
    }
    return [];
  });
  return {
    id: normalizeId(auction.id),
    slug: text(auction.slug),
    title: text(auction.title),
    make: text(auction.make),
    model: text(auction.model),
    year: number(auction.year),
    location: text(auction.location),
    state: normalizeAuctionState(auction.state),
    endsAt,
    currentBid: currentBid ? { amount: number(currentBid.amount), date: bidDate! } : null,
    countBids: number(auction.countBids),
    currency: { symbol: text(currency.symbol), name: text(currency.name) },
    parts,
  };
}

export function normalizeAuction(value: unknown): Auction {
  const auction = object(value);
  const currency = object(auction.currency);
  if (!Array.isArray(auction.bids) || !Array.isArray(auction.parts)) {
    throw new Error("Invalid auction data: missing bids or parts");
  }
  const rawCurrentBid = auction.currentBid ?? auction.current_bid;
  const currentBid = rawCurrentBid == null ? null : normalizeBid(rawCurrentBid);
  const uniqueBids = new Map(auction.bids.map((value) => {
    const bid = normalizeBid(value);
    return [bid.id, bid] as const;
  }));
  if (currentBid) uniqueBids.set(currentBid.id, currentBid);
  const bids = [...uniqueBids.values()].sort(
    (a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt),
  );
  const images = auction.parts.flatMap((value) => {
    const part = object(value);
    if (part.__typename === "MainImage") return [text(part.imageUri ?? part.image_uri)];
    if (part.__typename === "ImageGallery") {
      const uris = part.imageUris ?? part.image_uris;
      if (!Array.isArray(uris)) throw new Error("Invalid image gallery");
      return uris.map(text);
    }
    return [];
  });
  const endsAt = auction.endsAt ?? auction.ends_at;
  return {
    id: normalizeId(auction.id ?? auction._id),
    slug: text(auction.slug),
    title: text(auction.title),
    make: text(auction.make),
    model: text(auction.model),
    version: auction.version == null ? null : text(auction.version),
    year: number(auction.year),
    odometer: number(auction.odometer),
    location: text(auction.location),
    state: normalizeAuctionState(auction.state),
    endsAt: endsAt == null ? null : text(endsAt),
    currentBid,
    countBids: Math.max(number(auction.countBids ?? auction.count_bids), bids.length),
    bids,
    currency: { symbol: text(currency.symbol), name: text(currency.name) },
    images: [...new Set(images)],
  };
}
