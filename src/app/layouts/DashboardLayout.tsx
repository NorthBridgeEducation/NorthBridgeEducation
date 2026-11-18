import { AppSidebar } from "../../components/layout/AppSidebar";
import { AppHeader } from "../../components/layout/AppHeader";
import { MainContent } from "../../components/layout/MainContent";
import { useApp } from "../providers/AppProvider";

export function DashboardLayout() {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <AppSidebar />

      <div
        className={[
          "flex min-w-0 flex-1 flex-col transition-[margin] duration-200",
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[260px]",
        ].join(" ")}
      >
        <AppHeader />
        <MainContent />
      </div>
    </div>
  );
}