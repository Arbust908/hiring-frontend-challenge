export function getBidIncrement(currentPrice: number): number {
  if (currentPrice <= 1000) return 50;
  if (currentPrice <= 5000) return 100;
  if (currentPrice <= 10000) return 150;
  if (currentPrice <= 25000) return 200;
  return 250;
}

export function getNextBid(currentPrice: number): number {
  return currentPrice + getBidIncrement(currentPrice);
}
