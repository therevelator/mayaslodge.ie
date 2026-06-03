import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Owner login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={48} withText={false} href={null} />
          <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-dark">
            Maya&rsquo;s Lodge
          </h1>
          <p className="text-sm text-muted">Owner dashboard</p>
        </div>
        <div className="card p-6">
          <LoginForm next={next ?? "/admin"} />
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          ← <a href="/" className="hover:text-brand">Back to the website</a>
        </p>
      </div>
    </div>
  );
}
