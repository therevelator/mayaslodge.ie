import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export const metadata = { title: "Request received" };

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <LogoMark size={84} />
      <h1 className="mt-6 text-3xl font-semibold text-brand-dark sm:text-4xl">
        Thank you — your request is in!
      </h1>
      <p className="mt-3 max-w-md text-ink/80">
        We&rsquo;ve received your booking request. Keep an eye on your inbox (and
        your spam folder, just in case) — we&rsquo;ll email you shortly.
      </p>
      <p className="mt-4 max-w-md rounded-xl bg-orange/10 px-4 py-3 text-sm font-medium text-orange-dark">
        Please note: this is a booking <strong>request</strong>, not a
        confirmation. Your room is only reserved once we reply by email to
        confirm it.
      </p>
      {ref && (
        <p className="mt-4 rounded-full bg-brand-light px-4 py-1.5 text-sm font-semibold text-brand-dark">
          Your reference: {ref}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/rooms" className="btn btn-primary">Browse more rooms</Link>
        <Link href="/" className="btn btn-outline">Back to home</Link>
      </div>
    </div>
  );
}
