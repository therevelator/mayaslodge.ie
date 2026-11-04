"use client";

import { useState } from "react";
import {
  sanitizePhone,
  isAcceptablePhone,
  phoneCountry,
  unknownCallingCode,
  isValidEmail,
} from "@/lib/contact-validation";

// Email + phone inputs for the booking form, with live validation:
// - phone accepts only digits and a leading "+", and names the country once a
//   country code is typed
// - email is checked as you go (after you leave the field once)

export function EmailField() {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = isValidEmail(value);
  const showError = touched && value.length > 0 && !valid;

  return (
    <div>
      <label className="label" htmlFor="guestEmail">Email</label>
      <input
        id="guestEmail"
        name="guestEmail"
        type="email"
        className={`input ${showError ? "border-orange ring-1 ring-orange/40" : ""}`}
        required
        autoComplete="email"
        inputMode="email"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          e.target.setCustomValidity(isValidEmail(e.target.value) ? "" : "Enter a valid email, e.g. name@example.com");
        }}
        onBlur={() => setTouched(true)}
        aria-invalid={showError}
        aria-describedby="guestEmail-hint"
      />
      <p id="guestEmail-hint" className={`mt-1 min-h-4 text-xs ${showError ? "text-orange-dark" : "text-muted"}`}>
        {showError ? "That email doesn't look right, e.g. name@example.com" : ""}
      </p>
    </div>
  );
}

export function PhoneField() {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const country = phoneCountry(value);
  const badCode = unknownCallingCode(value);
  const ok = isAcceptablePhone(value);
  const showError = touched && value.length > 0 && !ok;

  let hint: React.ReactNode = "Digits only. Start with + and your country code, e.g. +353.";
  if (badCode) hint = "Unknown country code.";
  else if (showError) hint = country ? `That doesn't look like a valid ${country.name} number.` : "Please enter a valid phone number.";
  else if (country) hint = <span className="font-medium text-ink/80">{country.flag} {country.name}</span>;

  return (
    <div>
      <label className="label" htmlFor="guestPhone">Phone</label>
      <input
        id="guestPhone"
        name="guestPhone"
        type="tel"
        className={`input ${showError || badCode ? "border-orange ring-1 ring-orange/40" : ""}`}
        required
        autoComplete="tel"
        inputMode="tel"
        placeholder="+353 83 123 4567"
        value={value}
        onChange={(e) => {
          const clean = sanitizePhone(e.target.value);
          setValue(clean);
          e.target.setCustomValidity(isAcceptablePhone(clean) ? "" : "Enter a valid phone number (digits and + only).");
        }}
        onBlur={() => setTouched(true)}
        aria-invalid={showError || badCode}
        aria-describedby="guestPhone-hint"
      />
      <p
        id="guestPhone-hint"
        className={`mt-1 min-h-4 text-xs ${showError || badCode ? "text-orange-dark" : "text-muted"}`}
      >
        {hint}
      </p>
    </div>
  );
}
