import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The booking terms and conditions for staying at Maya's Lodge.",
};

const LAST_UPDATED = "June 2026";

export default async function TermsPage() {
  const s = await getSettings();
  const addr = [s.addressLine, s.town, s.county, s.eircode, s.country].filter(Boolean).join(", ");

  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle={`These terms govern your use of this website and any booking you make with ${s.propertyName}.`}
      lastUpdated={LAST_UPDATED}
    >
      <p>
        Welcome to {s.propertyName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By using
        this website and requesting a booking, you agree to the following terms.
        Please read them carefully. Our address is {addr}
        {s.email ? <>, and you can contact us at <a href={`mailto:${s.email}`}>{s.email}</a></> : null}.
      </p>

      <h2>1. Booking requests &amp; confirmation</h2>
      <p>
        Submitting a request through this website is <strong>not a confirmed booking</strong>.
        It is a request to stay. A booking only becomes confirmed once we send you a
        written confirmation (by email). We reserve the right to decline any request.
      </p>

      <h2>2. Prices</h2>
      <p>
        Room prices are shown per room, per night, in euro (€), and include breakfast where
        stated on the room. Prices are subject to change until your booking is confirmed.
        Once we confirm your booking, the agreed price will not change.
      </p>

      <h2>3. Payment</h2>
      <p>
        We do not take payment online through this website. Payment is made directly to us,
        on arrival or departure, or as otherwise agreed with you when we confirm your booking.
        We accept the payment methods communicated to you at the time of confirmation.
      </p>

      <h2>4. Check-in &amp; check-out</h2>
      <p>
        Check-in is from {s.checkInTime} and check-out is by {s.checkOutTime}. If you expect to
        arrive outside normal hours, please let us know in advance so we can make arrangements.
      </p>

      <h2>5. Cancellations &amp; no-shows</h2>
      <p>
        If you need to cancel or change a confirmed booking, please contact us as soon as
        possible. The specific cancellation terms that apply to your stay will be confirmed in
        writing at the time of booking. Failure to arrive (a &ldquo;no-show&rdquo;) may be treated
        as a late cancellation.
      </p>

      <h2>6. Your stay &amp; house rules</h2>
      <p>
        Guests are asked to treat the property with respect and to follow our house rules,
        which include no smoking indoors, observing quiet hours, and respecting other guests.
        We may refuse or end a stay where behaviour is unsafe, unlawful, or seriously disturbs
        others. The number of guests must not exceed the capacity stated for the room.
      </p>

      <h2>7. Damage</h2>
      <p>
        You are responsible for any loss or damage caused to the property or its contents during
        your stay (beyond normal wear and tear), and we may charge for the reasonable cost of
        repair or replacement.
      </p>

      <h2>8. Liability</h2>
      <p>
        We take reasonable care to provide a safe and comfortable stay. To the extent permitted
        by law, we are not liable for loss of or damage to your personal belongings, or for
        indirect or consequential losses. Nothing in these terms limits our liability for death
        or personal injury caused by our negligence, or for anything that cannot be excluded
        under Irish law.
      </p>

      <h2>9. Events beyond our control</h2>
      <p>
        We are not responsible for failure to provide accommodation due to circumstances beyond
        our reasonable control (for example fire, flood, utility failure, or other emergencies).
        In such cases we will contact you and, where a confirmed booking cannot proceed, refund
        any payment already made.
      </p>

      <h2>10. Privacy</h2>
      <p>
        We handle your personal data in line with our{" "}
        <Link href="/privacy">Privacy Policy</Link> and our{" "}
        <Link href="/gdpr">GDPR &amp; Data Protection</Link> statement.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of Ireland, and any disputes are subject to the
        exclusive jurisdiction of the Irish courts.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The version published on this website at
        the time of your booking is the version that applies to you.
      </p>

      <h2>Contact</h2>
      <p>
        {s.propertyName}, {addr}.
        {s.email ? <> Email: <a href={`mailto:${s.email}`}>{s.email}</a>.</> : null}
        {s.phone ? <> Phone: {s.phone}.</> : null}
      </p>
    </LegalPage>
  );
}
