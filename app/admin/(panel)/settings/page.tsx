import { getSettings } from "@/lib/settings";
import { saveSettings } from "@/app/admin/actions";

export const metadata = { title: "Settings" };

function Field({
  name, label, defaultValue, placeholder, type = "text", help,
}: {
  name: string; label: string; defaultValue?: string; placeholder?: string; type?: string; help?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} className="input" defaultValue={defaultValue} placeholder={placeholder} />
      {help && <p className="mt-1 text-xs text-muted">{help}</p>}
    </div>
  );
}

function Area({
  name, label, defaultValue, rows = 4, help,
}: {
  name: string; label: string; defaultValue?: string; rows?: number; help?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={rows} className="input" defaultValue={defaultValue} />
      {help && <p className="mt-1 text-xs text-muted">{help}</p>}
    </div>
  );
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [s, { saved }] = await Promise.all([getSettings(), searchParams]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-dark">Settings</h1>
      {saved && (
        <p className="rounded-lg bg-brand-light px-4 py-2 text-sm text-brand-dark">Settings saved.</p>
      )}

      <form action={saveSettings} className="space-y-6">
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-brand-dark">Brand & homepage</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field name="propertyName" label="Property name" defaultValue={s.propertyName} />
            <Field name="tagline" label="Tagline" defaultValue={s.tagline} />
            <div className="sm:col-span-2">
              <Field name="heroHeadline" label="Hero headline" defaultValue={s.heroHeadline} />
            </div>
            <div className="sm:col-span-2">
              <Area name="heroSubline" label="Hero sub-text" defaultValue={s.heroSubline} rows={2} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-brand-dark">About & breakfast</h2>
          <div className="mt-4 space-y-4">
            <Field name="aboutTitle" label="About title" defaultValue={s.aboutTitle} />
            <Area name="aboutBody" label="About text" defaultValue={s.aboutBody} rows={6} />
            <Area name="breakfastInfo" label="Breakfast info" defaultValue={s.breakfastInfo} rows={3} />
            <Area name="houseRules" label="House rules" defaultValue={s.houseRules} rows={3} help="Separate rules with a new line or a · character." />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-brand-dark">Contact & location</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field name="addressLine" label="Address line" defaultValue={s.addressLine} />
            <Field name="town" label="Town" defaultValue={s.town} />
            <Field name="county" label="County" defaultValue={s.county} />
            <Field name="eircode" label="Eircode" defaultValue={s.eircode} />
            <Field name="country" label="Country" defaultValue={s.country} />
            <Field name="phone" label="Phone" defaultValue={s.phone} />
            <Field name="email" label="Email" type="email" defaultValue={s.email} />
            <Field name="checkInTime" label="Check-in time" defaultValue={s.checkInTime} placeholder="15:00" />
            <Field name="checkOutTime" label="Check-out time" defaultValue={s.checkOutTime} placeholder="11:00" />
            <div className="sm:col-span-2">
              <Field name="mapEmbedUrl" label="Google Maps embed URL (optional)" defaultValue={s.mapEmbedUrl} help="Maps → Share → Embed a map → copy the src URL from the iframe." />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-brand-dark">Links</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field name="facebookUrl" label="Facebook URL" defaultValue={s.facebookUrl} />
            <Field name="instagramUrl" label="Instagram URL" defaultValue={s.instagramUrl} />
            <Field name="currency" label="Currency code" defaultValue={s.currency} placeholder="EUR" help="EUR, GBP or USD." />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-brand-dark">Privacy &amp; data retention</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              name="metaRetentionDays"
              label="Keep visitor technical data for (days)"
              type="number"
              defaultValue={String(s.metaRetentionDays)}
              help="Auto-deletes each booking's IP, location and device info this many days after it was submitted. The booking itself is kept. Set 0 to keep indefinitely."
            />
          </div>
        </section>

        <button type="submit" className="btn btn-primary">Save settings</button>
      </form>
    </div>
  );
}
