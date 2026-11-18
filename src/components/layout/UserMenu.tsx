
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, UserRound, ChevronDown } from "lucide-react";

export function UserMenu() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Admin logout failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md p-1.5 hover:bg-accent">
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <UserRound className="size-4" />
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium">Administrator</p>
          <p className="text-xs text-muted-foreground">Workspace Admin</p>
        </div>

        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </summary>

      <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border bg-popover p-1 shadow-lg">
        <div className="border-b px-3 py-2">
          <p className="text-sm font-medium">Administrator</p>
          <p className="text-xs text-muted-foreground">
            Workspace Admin
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          <LogOut className="size-4" />
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </details>
  );
}
