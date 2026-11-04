import { AsYouType, isPossiblePhoneNumber } from "libphonenumber-js";

// Shared (browser + server) checks for the guest contact fields.

/** Keep only digits and a single leading "+". */
export function sanitizePhone(input: string): string {
  const trimmed = input.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
}

/** Phone format accepted on the server: optional +, then 7–15 digits. */
export function isAcceptablePhone(value: string): boolean {
  if (!/^\+?\d{7,15}$/.test(value)) return false;
  // With a country code, it must also be a plausible number for that country.
  return value.startsWith("+") ? isPossiblePhoneNumber(value) : true;
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function flag(country: string): string {
  return country
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export type PhoneCountry = { code: string; name: string; flag: string } | null;

/** The country a "+..." number belongs to, as soon as it can be told. */
export function phoneCountry(value: string): PhoneCountry {
  if (!value.startsWith("+") || value.length < 3) return null;
  const typer = new AsYouType();
  typer.input(value);
  // Exact country when the number tells us; otherwise the main country for
  // the calling code (e.g. +44 -> United Kingdom).
  const number = typer.getNumber();
  const country = typer.getCountry() ?? number?.getPossibleCountries()[0];
  if (!country) return null;
  return { code: country, name: regionNames?.of(country) ?? country, flag: flag(country) };
}

/** Has the calling code been typed fully but matches no country? */
export function unknownCallingCode(value: string): boolean {
  if (!value.startsWith("+") || value.length < 5) return false;
  const typer = new AsYouType();
  typer.input(value);
  return !typer.getCallingCode();
}

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
