import { getCurrentTenantUser } from "@/modules/tenancy/auth";
import { Logo } from "@/components/logo";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentTenantUser();

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col border-r bg-sidebar">
        <div className="flex h-16 items-center px-4">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav />
        </div>
        <div className="border-t p-3">
          <UserMenu name={user.name} email={user.email} />
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-muted/30">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
