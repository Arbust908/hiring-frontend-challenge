import { getBidIncrement, getNextBid } from "./bid-increment";

describe("getBidIncrement", () => {
  it("applies the minimum increment to bids up to 1.000", () => {
    expect(getBidIncrement(0)).toBe(50);
    expect(getBidIncrement(1000)).toBe(50);
  });

  it("applies 100 increments between 1.001 and 5.000", () => {
    expect(getBidIncrement(1001)).toBe(100);
    expect(getBidIncrement(5000)).toBe(100);
  });

  it("applies 150 increments between 5.001 and 10.000", () => {
    expect(getBidIncrement(5001)).toBe(150);
    expect(getBidIncrement(10000)).toBe(150);
  });

  it("applies 200 increments between 10.001 and 25.000", () => {
    expect(getBidIncrement(10001)).toBe(200);
    expect(getBidIncrement(25000)).toBe(200);
  });

  it("applies 250 increments above 25.000", () => {
    expect(getBidIncrement(25001)).toBe(250);
    expect(getBidIncrement(1_000_000)).toBe(250);
  });
});

describe("getNextBid", () => {
  it("adds the increment to the current price", () => {
    expect(getNextBid(1000)).toBe(1050);
    expect(getNextBid(4999)).toBe(5099);
    expect(getNextBid(26000)).toBe(26250);
  });
});