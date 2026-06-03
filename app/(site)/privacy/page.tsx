import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Maya's Lodge collects, uses and protects your personal data.",
};

const LAST_UPDATED = "June 2026";

export default async function PrivacyPage() {
  const s = await getSettings();
  const addr = [s.addressLine, s.town, s.county, s.eircode, s.country].filter(Boolean).join(", ");

  return (
    <LegalPage
      title="Privacy Policy"
      subtitle={`How ${s.propertyName} collects, uses and protects your personal information.`}
      lastUpdated={LAST_UPDATED}
    >
      <p>
        {s.propertyName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to protecting your privacy
        and handling your personal data responsibly and transparently, in line with the General
        Data Protection Regulation (GDPR) and the Irish Data Protection Acts.
      </p>

      <h2>1. Who we are (Data Controller)</h2>
      <p>
        {s.propertyName}, {addr}, is the data controller responsible for your personal data.
        For any privacy question or request, contact us
        {s.email ? <> at <a href={`mailto:${s.email}`}>{s.email}</a></> : null}
        {s.phone ? <> or {s.phone}</> : null}.
      </p>

      <h2>2. What information we collect</h2>
      <p>When you make a booking request or contact us, we collect:</p>
      <ul>
        <li>Your name</li>
        <li>Your email address and phone number</li>
        <li>Your requested check-in and check-out dates and number of guests</li>
        <li>Any message, special requests or dietary requirements you provide</li>
      </ul>
      <p>
        When you submit a request, our website also automatically records technical information
        about the request for security, fraud-prevention and record-keeping purposes:
      </p>
      <ul>
        <li>Your IP address</li>
        <li>An approximate location (country, region and city) derived from that IP address</li>
        <li>Basic device and browser information (your browser&rsquo;s user-agent)</li>
        <li>Your browser&rsquo;s language setting and the page you arrived from</li>
        <li>The date and time of your request</li>
      </ul>
      <p>
        This is standard technical data that accompanies any web request; we do not ask for or
        access your device&rsquo;s precise GPS location. We do not run advertising or third-party
        advertising trackers on this website, and we do not knowingly collect data from children.
      </p>

      <h2>3. How we use your information</h2>
      <p>We use your personal data only to:</p>
      <ul>
        <li>Respond to your booking request and manage your reservation</li>
        <li>Contact you about your stay (for example to confirm details or arrival times)</li>
        <li>Keep records required for accounting and legal obligations</li>
      </ul>

      <h2>4. Our lawful basis</h2>
      <p>We rely on the following lawful bases under the GDPR:</p>
      <ul>
        <li><strong>Steps prior to a contract</strong> &mdash; to handle your booking request and arrange your stay.</li>
        <li><strong>Legitimate interests</strong> &mdash; to communicate with you about your enquiry, to run our small business, and to keep our website and bookings secure (for example detecting fraudulent or abusive requests using the technical data above).</li>
        <li><strong>Legal obligation</strong> &mdash; where we must keep certain records (for example for tax).</li>
      </ul>

      <h2>5. Who we share it with</h2>
      <p>
        We do not sell your personal data. We only share it where necessary &mdash; for example
        with service providers who help us operate (such as our email or website hosting
        provider), and where required by law. To work out the approximate location of a booking
        request, your IP address may be sent to a third-party IP-geolocation service for that
        single lookup. Any such providers are required to protect your data.
      </p>

      <h2>6. How long we keep it</h2>
      <p>
        We keep your booking information only for as long as necessary to manage your stay and to
        meet our legal and accounting obligations, after which it is securely deleted. Enquiries
        that do not lead to a booking are kept for a short period and then removed.
      </p>
      <p>
        The technical data described above (IP address, approximate location and device
        information) is automatically deleted a set number of days after your request &mdash; by
        default within 90 days &mdash; in keeping with the principle of data minimisation.
      </p>

      <h2>7. Cookies</h2>
      <p>
        This website uses only strictly necessary cookies needed for it to function securely
        (for example to keep the owner signed in to the private admin area). We do not use
        advertising or analytics cookies, so no cookie consent banner is required.
      </p>

      <h2>8. Keeping your data safe</h2>
      <p>
        We use reasonable technical and organisational measures to protect your personal data
        against loss, misuse and unauthorised access.
      </p>

      <h2>9. Your rights</h2>
      <p>
        You have rights over your personal data under the GDPR. These are explained in detail,
        together with how to exercise them, on our{" "}
        <Link href="/gdpr">GDPR &amp; Data Protection</Link> page.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Any changes will be posted on this page with
        a new &ldquo;last updated&rdquo; date.
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
