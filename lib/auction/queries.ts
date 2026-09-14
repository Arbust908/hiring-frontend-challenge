import { requestGraphQL } from "../graphql/client";
import { normalizeAuction, normalizeAuctionSummary } from "./normalize";
import type { AuctionSnapshot, AuctionSummary } from "./types";

const AUCTION_QUERY = `
  query AuctionDetail($slug: String!) {
    auction(slug: $slug) {
      id slug title make model version year odometer location state endsAt countBids
      currency { symbol name }
      currentBid { ...BidFields }
      bids { ...BidFields }
      parts {
        __typename
        ... on MainImage { imageUri }
        ... on ImageGallery { imageUris }
      }
    }
  }
  fragment BidFields on AuctionBid {
    id amount date isAuto
    profile { id username avatar isVerified }
  }
`;

export async function getAuction(
  slug: string,
  signal?: AbortSignal,
): Promise<AuctionSnapshot> {
  const { data, serverTimeMs, receivedAtMs } = await requestGraphQL<{ auction?: unknown }>(
    AUCTION_QUERY, { slug }, signal,
  );
  if (!data || data.auction === undefined) {
    throw new Error("GraphQL response did not include auction");
  }
  return {
    auction: data.auction === null ? null : normalizeAuction(data.auction),
    serverTimeMs,
    receivedAtMs,
  };
}

const LIVE_AUCTIONS_QUERY = `
  query LiveAuctions {
    auctions(filter: { state: LIVE }, first: 24, sort: ENDS_AT_ASC) {
      nodes {
        id
        title
        slug
        make
        model
        year
        location
        state
        endsAt
        currentBid {
          amount
          date
        }
        countBids
        currency {
          symbol
          name
        }
        parts {
          __typename
          ... on MainImage {
            imageUri
          }
          ... on ImageGallery {
            imageUris
          }
        }
      }
    }
  }
`;

export async function getLiveAuctions(): Promise<AuctionSummary[]> {
  const { data } = await requestGraphQL<{ auctions?: { nodes?: unknown } }>(LIVE_AUCTIONS_QUERY);
  const auctions = data?.auctions?.nodes;

  if (!Array.isArray(auctions)) {
    throw new Error("GraphQL response did not include auctions.nodes");
  }

  return auctions.map(normalizeAuctionSummary);
}
