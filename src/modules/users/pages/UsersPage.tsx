import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  providers: string[];
  createdAt: string;
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

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "—";
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
          const errorBody = await response.json().catch(() => null);
          throw new Error(errorBody?.message || "Could not load users.");
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
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table aria-label="Supabase Auth users" className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    {["Name", "Email", "Phone", "Provider", "Created", "Last sign-in", "User ID"].map(
                      (column) => (
                        <th key={column} scope="col" className="whitespace-nowrap px-4 py-3">
                          {column}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {state.data.users.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{user.name ?? "—"}</td>
                      <td className="px-4 py-3">{user.email ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3">{user.phone ?? "—"}</td>
                      <td className="px-4 py-3">{user.providers.join(", ") || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatDate(user.createdAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatDate(user.lastSignInAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{user.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <nav aria-label="Users pagination" className="flex items-center justify-end gap-3">
            <Button type="button" size="sm" variant="outline" disabled={page === 1}
              onClick={() => changePage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button type="button" size="sm" variant="outline" disabled={!state.data.hasNextPage}
              onClick={() => changePage(page + 1)}>
              Next
            </Button>
          </nav>
        </>
      )}
    </section>
  );
}