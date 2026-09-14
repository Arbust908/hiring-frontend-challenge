export type AuctionState =
  | "FINISHED_SALE"
  | "FINISHED_NO_SALE"
  | "LIVE"
  | "CANCELLED"
  | "DRAFT"
  | "PENDING";

export type Bid = {
  id: string;
  amount: number;
  placedAt: string;
  isAuto: boolean;
  bidder: {
    id?: string;
    username: string;
    avatar?: string;
    verified: boolean;
  } | null;
};

export type Auction = {
  id: string;
  slug: string;
  title: string;
  make: string;
  model: string;
  version: string | null;
  year: number;
  odometer: number;
  location: string;
  state: AuctionState;
  endsAt: string | null;
  currentBid: Bid | null;
  countBids: number;
  bids: Bid[];
  currency: { symbol: string; name: string };
  images: string[];
};

export type AuctionSnapshot = {
  auction: Auction | null;
  serverTimeMs: number | null;
  receivedAtMs: number;
};

export type AuctionPart =
  | { __typename: "MainImage"; imageUri: string }
  | { __typename: "ImageGallery"; imageUris: string[] };

export type AuctionSummary = {
  id: string;
  title: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  location: string;
  state: AuctionState;
  endsAt: string | null;
  currentBid: {
    amount: number;
    date: string;
  } | null;
  countBids: number;
  currency: {
    symbol: string;
    name: string;
  };
  parts: AuctionPart[];
};
