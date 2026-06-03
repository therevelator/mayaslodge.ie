import { CURRENCY_SYMBOLS } from "./constants";

/** Format euro-cents as a price string, e.g. 9500 -> "€95". */
export function formatPrice(cents: number, currency = "EUR"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? "€";
  const euros = cents / 100;
  // Show decimals only when there are cents.
  const value =
    euros % 1 === 0 ? euros.toString() : euros.toFixed(2);
  return `${symbol}${value}`;
}

/** Parse a user-entered price string (euros) into integer cents. */
export function parsePriceToCents(input: string): number {
  const cleaned = input.replace(/[^0-9.,]/g, "").replace(",", ".");
  const value = parseFloat(cleaned);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

const DATE_FMT = new Intl.DateTimeFormat("en-IE", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_FMT_SHORT = new Intl.DateTimeFormat("en-IE", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** Format a Date stored at UTC midnight as a friendly date. */
export function formatDate(date: Date): string {
  return DATE_FMT.format(date);
}

export function formatDateShort(date: Date): string {
  return DATE_FMT_SHORT.format(date);
}

/** Produce a YYYY-MM-DD string from a UTC-midnight Date. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
