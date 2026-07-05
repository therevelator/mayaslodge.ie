import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = {
  title: "GDPR & Data Protection",
  description:
    "Your data protection rights under the GDPR and how to exercise them with Maya's Lodge.",
};

const LAST_UPDATED = "June 2026";

export default async function GdprPage() {
  const s = await getSettings();
  const addr = [s.addressLine, s.town, s.county, s.eircode, s.country].filter(Boolean).join(", ");

  return (
    <LegalPage
      title="GDPR & Data Protection"
      subtitle={`Your rights over your personal data, and how to exercise them with ${s.propertyName}.`}
      lastUpdated={LAST_UPDATED}
    >
      <p>
        {s.propertyName} respects your privacy and complies with the General Data Protection
        Regulation (EU) 2016/679 (&ldquo;GDPR&rdquo;) and the Irish Data Protection Acts. This page
        explains your rights and how to use them. It should be read alongside our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Data Controller</h2>
      <p>
        The data controller for your personal data is {s.propertyName}, {addr}
        {s.email ? <>. You can reach our data contact at <a href={`mailto:${s.email}`}>{s.email}</a></> : null}
        {s.phone ? <> or {s.phone}</> : null}.
      </p>

      <h2>Your rights under the GDPR</h2>
      <p>As a data subject, you have the right to:</p>
      <ul>
        <li><strong>Be informed</strong> about how your data is used (see our Privacy Policy).</li>
        <li><strong>Access</strong> the personal data we hold about you.</li>
        <li><strong>Rectification</strong> &mdash; have inaccurate or incomplete data corrected.</li>
        <li><strong>Erasure</strong> &mdash; ask us to delete your data (the &ldquo;right to be forgotten&rdquo;), where there is no overriding legal reason to keep it.</li>
        <li><strong>Restrict processing</strong> of your data in certain circumstances.</li>
        <li><strong>Data portability</strong> &mdash; receive your data in a portable format.</li>
        <li><strong>Object</strong> to processing based on our legitimate interests.</li>
        <li><strong>Withdraw consent</strong> at any time, where we rely on consent.</li>
      </ul>

      <h2>How to exercise your rights</h2>
      <p>
        To make a request, simply contact us
        {s.email ? <> at <a href={`mailto:${s.email}`}>{s.email}</a></> : null}. We will respond
        within one month, as required by the GDPR. There is normally no charge. We may need to
        verify your identity before acting on a request, to keep your data safe.
      </p>

      <h2>Updates</h2>
      <p>
        We may update this statement from time to time. The current version is always available
        on this page.
      </p>
    </LegalPage>
  );
}
