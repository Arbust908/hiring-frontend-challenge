import assert from "node:assert/strict";
import test from "node:test";
import { formatBidTime, formatCountdown, formatMoney } from "./format";

test("formats money with the requested decimals and thousands separators", () => {
  assert.equal(formatMoney(19250.5, "$"), "$ 19.250,5");
  assert.equal(formatMoney(12500, "$", 0), "$ 12.500");
  assert.equal(formatMoney(0, "US$", 0), "US$ 0");
});

test("formats countdowns as clock time with an optional days segment", () => {
  assert.equal(formatCountdown(0), "00:00:00");
  assert.equal(formatCountdown(-5000), "00:00:00");
  assert.equal(formatCountdown(59_000), "00:00:59");
  assert.equal(formatCountdown(3661_000), "01:01:01");
  assert.equal(formatCountdown(27 * 86400_000 + 7200_000), "27d 02:00:00");
});

test("renders bid timestamps in Argentina time or explains missing values", () => {
  assert.equal(formatBidTime("2026-08-29T18:04:11Z"), "29/08/2026 15:04:11");
  assert.equal(formatBidTime("no es una fecha"), "Horario no disponible");
});
