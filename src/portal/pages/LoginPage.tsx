
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Network, LockKeyhole } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function StudentLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/portal", { replace: true });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10 text-foreground">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="mb-10 flex items-center justify-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
            <Network className="size-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight">NBridge</span>
        </Link>

        <div className="rounded-2xl border bg-card p-7 shadow-sm sm:p-9">
          <div className="mb-7">
            <div className="mb-5 flex size-11 items-center justify-center rounded-xl border bg-muted">
              <LockKeyhole className="size-5" />
            </div>

            <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground">
              STUDENT PORTAL
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your student account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="student-email" className="text-sm font-medium">
                Email address
              </label>

              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="student@example.com"
                required
                className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="student-password" className="text-sm font-medium">
                Password
              </label>

              <input
                id="student-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/20"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NBridge. Student Portal.
        </p>
      </div>
    </main>
  );
}
