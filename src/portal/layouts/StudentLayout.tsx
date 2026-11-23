
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  UserRound,
  FileText,
  FolderOpen,
  CreditCard,
  Bell,
  LogOut,
  Network,
  Languages,
  Menu,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";

const navigation = [
  { title: "My Profile", path: "/portal/profile", icon: UserRound, end: true },
  { title: "Application", path: "/portal/application", icon: FileText, end: true },
  { title: "Documents", path: "/portal/documents", icon: FolderOpen, end: true },
  { title: "Payments", path: "/portal/payments", icon: CreditCard, end: true },
  { title: "Notifications", path: "/portal/notifications", icon: Bell, end: true },
  {
  title: "Language Tests",
  path: "/portal/language-tests",
  icon: Languages,
  end: true,
},
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
       <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-5">
  <div className="flex items-center gap-3 md:hidden">
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Open student menu"
          className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-muted"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </DialogTrigger>

      <DialogContent
        aria-describedby={undefined}
        className="top-0 left-0 flex h-dvh w-72 max-w-[85vw] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-r bg-card p-0 text-card-foreground sm:max-w-[85vw] data-open:slide-in-from-left data-open:zoom-in-100 data-closed:slide-out-to-left"
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b px-5 pr-12">
          <Network className="size-5" aria-hidden="true" />
          <DialogTitle>Student Portal</DialogTitle>
        </div>

        <nav aria-label="Student portal" className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <DialogClose key={item.path} asChild>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")
                  }
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  {item.title}
                </NavLink>
              </DialogClose>
            );
          })}
        </nav>

        <div className="shrink-0 border-t p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-[18px]" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </DialogContent>
    </Dialog>

    <span className="font-semibold">NBridge</span>
  </div>

  <span className="hidden text-sm font-medium md:block">
    Student Workspace
  </span>
</header>

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

        <main className="flex-1 p-5 sm:p-7 lg:p-9">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
