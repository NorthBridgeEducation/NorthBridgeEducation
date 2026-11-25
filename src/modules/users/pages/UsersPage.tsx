import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type AuthUser = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  phone: string | null;
  email: string | null;
  lastSignInAt: string | null;
};

type UsersResponse = {
  users: AuthUser[];
  hasNextPage: boolean;
};

type UsersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: UsersResponse };

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Dhaka",
});

function formatLastSignIn(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function UserCard({ user }: { user: AuthUser }) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const initials = (user.name || user.email || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const avatarUrl = user.avatarUrl;

  return (
    <li className="min-w-0 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-sm font-semibold">
          {avatarUrl && avatarUrl !== failedAvatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-full object-cover"
              onError={() => setFailedAvatarUrl(avatarUrl)}
            />
          ) : (
            <span aria-hidden="true">{initials}</span>
          )}
        </div>

        <h2 className="min-w-0 break-words font-semibold">
          {user.name || "Unnamed user"}
        </h2>
      </div>

      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Phone</dt>
        <dd className="break-words">{user.phone || "—"}</dd>

        <dt className="text-muted-foreground">Email</dt>
        <dd className="break-words">{user.email || "—"}</dd>

        <dt className="text-muted-foreground">Last sign-in</dt>
        <dd>{formatLastSignIn(user.lastSignInAt)}</dd>
      </dl>
    </li>
  );
}

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<UsersState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        const response = await fetch(`/api/admin/users?page=${page}`, {
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (response.status === 401) {
          throw new Error("Your admin session has expired. Sign in again.");
        }

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.message || "Could not load users.");
        }

        const data: UsersResponse = await response.json();

        if (!controller.signal.aborted) {
          setState({ status: "ready", data });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Could not load users.",
          });
        }
      }
    }

    void loadUsers();

    return () => controller.abort();
  }, [page, attempt]);

  function changePage(nextPage: number) {
    setState({ status: "loading" });
    setPage(nextPage);
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

      {state.status === "loading" && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading users…
        </p>
      )}

      {state.status === "error" && (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </Button>
        </div>
      )}

      {state.status === "ready" && (
        <>
          {state.data.users.length === 0 ? (
            <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              No users on this page.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {state.data.users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </ul>
          )}

          {(page > 1 || state.data.hasNextPage) && (
            <nav
              aria-label="Users pagination"
              className="flex items-center justify-end gap-3"
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">Page {page}</span>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!state.data.hasNextPage}
                onClick={() => changePage(page + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}