import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, signOut } from "@/lib/auth";
import { getSiteSettings } from "@/features/projects/queries";
import { AdminTabs } from "@/components/admin/chrome";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
  const settings = await getSiteSettings();
  return (
    <div className="register-admin">
      <header className="admin-header">
        <div className="admin-header-inner">
          <Link className="admin-brand" href="/admin/projects">
            <span className="jl-mark">JL</span>
            <span className="admin-brand-text">
              Portfolio Admin<em>{settings.designerName}</em>
            </span>
          </Link>
          <AdminTabs />
          <div className="admin-header-actions">
            <Link href="/" target="_blank">
              View site ↗
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button>Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" className="screen admin-view">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
