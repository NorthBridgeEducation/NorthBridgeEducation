import { LogOut, UserRound, ChevronDown } from "lucide-react";

export function UserMenu() {
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
            Manage your account
          </p>
        </div>

        <button
          type="button"
          disabled
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </details>
  );
}