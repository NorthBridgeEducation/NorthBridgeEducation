import { X } from "lucide-react";

import { SidebarNav } from "./SidebarNav";
import { useApp } from "../../app/providers/AppProvider";

export function AppSidebar() {
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    closeMobileSidebar,
  } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "border-r bg-background transition-all duration-200 ease-in-out",
          "w-[260px]",
          sidebarCollapsed ? "md:w-[72px]" : "md:w-[260px]",
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">N</span>
            </div>

            <span
              className={`truncate text-base font-bold tracking-tight ${
                sidebarCollapsed ? "md:hidden" : ""
              }`}
            >
              NBridge
            </span>
          </div>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>

          {sidebarCollapsed ? null : (
            <span className="hidden md:block text-xs text-muted-foreground">
              ERP
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex min-h-0 flex-1 flex-col py-5">
          <SidebarNav />
        </div>

        {/* Footer */}
        <div className="border-t p-3">
          <div
            className={`flex items-center gap-3 rounded-md p-2 ${
              sidebarCollapsed ? "md:justify-center" : ""
            }`}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              NB
            </div>

            <div className={sidebarCollapsed ? "md:hidden" : ""}>
              <p className="text-sm font-medium">NBridge Workspace</p>
              <p className="text-xs text-muted-foreground">Management</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}