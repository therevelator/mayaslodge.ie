import "server-only";
import { getSettings } from "./settings";
import { formatDate, formatPrice } from "./format";
import { phoneCountry } from "./contact-validation";

// Email the owner about every new booking request, via Resend
// (https://resend.com). Needs RESEND_API_KEY in the environment.
//
// Recipient: NOTIFY_EMAIL, else the contact email in Admin → Settings.
// Sender:    EMAIL_FROM, else Resend's shared test sender — which can only
//            deliver to the email the Resend account was created with. Verify
//            mayaslodge.ie in Resend and set EMAIL_FROM to send from your domain.
//
// Never throws: a failed email must not lose or block a booking.

type BookingForEmail = {
  id: string;
  roomName: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  totalPrice: number | null;
  message: string | null;
};

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function notifyNewBooking(b: BookingForEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[notify] RESEND_API_KEY not set — booking email skipped", b.id);
    return;
  }

  try {
    const settings = await getSettings();
    const to = process.env.NOTIFY_EMAIL || settings.email;
    if (!to) return;
    const from = process.env.EMAIL_FROM || `${settings.propertyName} <onboarding@resend.dev>`;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://mayaslodge.ie").replace(/\/$/, "");
    const adminUrl = `${site}/admin/bookings?status=PENDING`;
    const ref = b.id.slice(-6).toUpperCase();
    const total = b.totalPrice != null ? formatPrice(b.totalPrice, settings.currency) : "—";
    const country = b.guestPhone ? phoneCountry(b.guestPhone) : null;
    const phone = b.guestPhone ? `${b.guestPhone}${country ? ` (${country.name})` : ""}` : "—";

    const rows: [string, string][] = [
      ["Room", b.roomName],
      ["Check-in", formatDate(b.checkIn)],
      ["Check-out", formatDate(b.checkOut)],
      ["Nights", String(b.nights)],
      ["Guests", String(b.guests)],
      ["Total", total],
      ["Name", b.guestName],
      ["Email", b.guestEmail ?? "—"],
      ["Phone", phone],
    ];

    const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#1f2a24;background:#f7f4ee;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px">
    <h2 style="margin:0 0 4px;color:#1d5c3a">New booking request</h2>
    <p style="margin:0 0 16px;color:#6b7280">Ref ${esc(ref)} · waiting for your confirmation</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 0;color:#6b7280;width:120px">${esc(k)}</td><td style="padding:6px 0;font-weight:600">${esc(v)}</td></tr>`
        )
        .join("")}
    </table>
    ${
      b.message
        ? `<p style="margin:16px 0 4px;color:#6b7280;font-size:14px">Message</p><p style="margin:0;white-space:pre-wrap;font-size:14px">${esc(b.message)}</p>`
        : ""
    }
    <p style="margin:24px 0 0"><a href="${esc(adminUrl)}" style="background:#1d5c3a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block">Open in admin</a></p>
  </div>
</body></html>`;

    const text = [
      `New booking request (ref ${ref})`,
      "",
      ...rows.map(([k, v]) => `${k}: ${v}`),
      ...(b.message ? ["", "Message:", b.message] : []),
      "",
      `Open in admin: ${adminUrl}`,
    ].join("\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        ...(b.guestEmail ? { reply_to: b.guestEmail } : {}),
        subject: `New booking: ${b.roomName}, ${formatDate(b.checkIn)} – ${formatDate(b.checkOut)} (${b.guestName})`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[notify] Resend error", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[notify] booking email failed", err);
  }
}
