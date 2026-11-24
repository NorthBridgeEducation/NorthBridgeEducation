import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FolderOpen,
  LogOut,
  Menu,
  Network,
  UserRound,
  X,
} from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { supabase } from "@/lib/supabase/client";

const navigation = [
  {
    title: "My Profile",
    path: "/portal/profile",
    icon: UserRound,
  },
  {
    title: "Documents",
    path: "/portal/documents",
    icon: FolderOpen,
  },
];

const iconButtonClass =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring";

type SidebarProps = {
  onNavigate?: () => void;
  onSignOut: () => void;
  signingOut: boolean;
  signOutError: string;
};

function StudentSidebar({
  onNavigate,
  onSignOut,
  signingOut,
  signOutError,
}: SidebarProps) {
  return (
    <>
      <nav
        aria-label="Student portal"
        className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4"
      >
        {navigation.map(({ title, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              ].join(" ")
            }
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            {title}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t p-4">
        {signOutError && (
          <p role="alert" className="mb-2 px-3 text-sm text-destructive">
            {signOutError}
          </p>
        )}

        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </>
  );
}

export function StudentLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const currentPage =
    navigation.find(({ path }) => pathname === path)?.title ?? "Student Portal";

  useEffect(() => {
    // Match Tailwind's md breakpoint so the drawer closes on desktop.
    const desktop = window.matchMedia("(min-width: 48rem)");

    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) setMenuOpen(false);
    }

    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    setSignOutError("");

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setMenuOpen(false);
      navigate("/portal/login", { replace: true });
    } catch {
      setSignOutError("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  const sidebarProps = {
    onSignOut: handleSignOut,
    signingOut,
    signOutError,
  };

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b px-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Network className="size-5" aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight">NBridge</span>
        </div>

        <p className="px-7 pt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Student Portal
        </p>

        <StudentSidebar {...sidebarProps} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b bg-card px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <DialogPrimitive.Trigger asChild>
                <button
                  type="button"
                  aria-label="Open student menu"
                  className={iconButtonClass}
                >
                  <Menu className="size-5" aria-hidden="true" />
                </button>
              </DialogPrimitive.Trigger>

              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/45 motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0 motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0" />

                <DialogPrimitive.Content
                  aria-describedby={undefined}
                  className="fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r bg-card text-card-foreground shadow-xl motion-safe:data-open:animate-in motion-safe:data-open:slide-in-from-left motion-safe:data-closed:animate-out motion-safe:data-closed:slide-out-to-left"
                >
                  <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4">
                    <DialogPrimitive.Title className="font-semibold">
                      Student Portal
                    </DialogPrimitive.Title>

                    <DialogPrimitive.Close asChild>
                      <button
                        type="button"
                        aria-label="Close student menu"
                        className={iconButtonClass}
                      >
                        <X className="size-5" aria-hidden="true" />
                      </button>
                    </DialogPrimitive.Close>
                  </div>

                  <StudentSidebar
                    {...sidebarProps}
                    onNavigate={() => setMenuOpen(false)}
                  />
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            <span className="truncate text-sm font-semibold">{currentPage}</span>
          </div>

          <span className="hidden text-sm font-medium md:block">
            Student Workspace
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-7 lg:p-9">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}