import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
        <div className="fixed h-screen w-64">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
