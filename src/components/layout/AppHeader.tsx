import { useLocation } from "react-router-dom";
import {
  Menu,
  PanelLeft,
  Sun,
  Moon,
  Search,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";

import { useApp } from "../../app/providers/AppProvider";
import { UserMenu } from "./UserMenu";

export function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar } = useApp();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const currentPath = location.pathname.split("/").filter(Boolean);
  const currentPage =
    currentPath.length > 1
      ? currentPath[currentPath.length - 1]
      : "dashboard";

  const pageTitle =
    currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>

        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden rounded-md p-2 text-muted-foreground hover:bg-accent md:inline-flex"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="size-5" />
        </button>

        <div className="hidden h-5 w-px bg-border sm:block" />

        <div className="truncate text-sm">
          <span className="text-muted-foreground">Workspace</span>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{pageTitle}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          aria-label="Search"
          className="rounded-md p-2 text-muted-foreground hover:bg-accent"
        >
          <Search className="size-[18px]" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-2 text-muted-foreground hover:bg-accent"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
        </button>

        <button
  type="button"
  aria-label="Toggle theme"
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
>
  <Sun className="absolute size-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

  <Moon className="absolute size-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
</button>

        <div className="mx-1 h-6 w-px bg-border" />

        <UserMenu />
      </div>
    </header>
  );
}