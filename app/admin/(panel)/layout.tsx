import { redirect } from "next/navigation";
import { after } from "next/server";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { purgeExpiredMeta } from "@/lib/retention";

export const metadata = { title: "Admin" };

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Lazily enforce the technical-data retention policy. Runs after the page has
  // been sent (so it never slows the admin down) and at most hourly.
  after(() => purgeExpiredMeta().catch(() => 0));

  return (
    <div className="min-h-screen bg-cream">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
