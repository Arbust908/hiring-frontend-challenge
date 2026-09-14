import { formatBidTime, formatCountdown, formatMoney } from "./format";

describe("formatMoney", () => {
  it("formats money with the requested decimals and thousands separators", () => {
    expect(formatMoney(19250.5, "$")).toBe("$ 19.250,5");
    expect(formatMoney(12500, "$", 0)).toBe("$ 12.500");
    expect(formatMoney(0, "US$", 0)).toBe("US$ 0");
  });
});

describe("formatCountdown", () => {
  it("renders zero and negative values as zero time", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(-5000)).toBe("00:00:00");
  });

  it("renders countdowns as clock time", () => {
    expect(formatCountdown(59_000)).toBe("00:00:59");
    expect(formatCountdown(3661_000)).toBe("01:01:01");
  });

  it("prepends the days segment when it is nonzero", () => {
    expect(formatCountdown(27 * 86400_000 + 7200_000)).toBe("27d 02:00:00");
  });
});

describe("formatBidTime", () => {
  it("renders bid timestamps in Argentina time", () => {
    expect(formatBidTime("2026-08-29T18:04:11Z")).toBe("29/08/2026 15:04:11");
  });

  it("explains missing or invalid values", () => {
    expect(formatBidTime("no es una fecha")).toBe("Horario no disponible");
  });
});