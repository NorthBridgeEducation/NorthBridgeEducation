
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  FileText,
  FolderOpen,
  CreditCard,
  Bell,
  LogOut,
  Network,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const navigation = [
  { title: "Dashboard", path: "/portal", icon: LayoutDashboard, end: true },
  { title: "My Profile", path: "/portal/profile", icon: UserRound },
  { title: "Application", path: "/portal/application", icon: FileText },
  { title: "Documents", path: "/portal/documents", icon: FolderOpen },
  { title: "Payments", path: "/portal/payments", icon: CreditCard },
  { title: "Notifications", path: "/portal/notifications", icon: Bell },
];

export function StudentLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Student logout failed:", error.message);
      return;
    }

    navigate("/portal/login", { replace: true });
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Network className="size-5" />
          </span>
          <span className="font-semibold tracking-tight">NBridge</span>
        </div>

        <div className="px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Student Portal
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    ].join(" ")
                  }
                >
                  <Icon className="size-[18px]" />
                  {item.title}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-5">
          <div className="flex items-center gap-3 md:hidden">
            <Network className="size-5" />
            <span className="font-semibold">NBridge</span>
          </div>

          <span className="hidden text-sm font-medium md:block">
            Student Workspace
          </span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground md:hidden"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 md:hidden">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground",
                  ].join(" ")
                }
              >
                <Icon className="size-4" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        <main className="flex-1 p-5 sm:p-7 lg:p-9">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
