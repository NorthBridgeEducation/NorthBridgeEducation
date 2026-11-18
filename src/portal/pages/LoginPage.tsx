
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Network, LockKeyhole } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function StudentLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/portal`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

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

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-input bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="size-5"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                transform="translate(0 4)"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.28 5.65c4.25-3.92 6.68-9.69 6.68-17.3Z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z"
                transform="translate(0 4)"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.28-5.65c-2.02 1.35-4.6 2.15-8.62 2.15-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
              />
            </svg>

            {googleLoading
              ? "Connecting to Google..."
              : "Continue with Google"}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            OR CONTINUE WITH EMAIL
            <span className="h-px flex-1 bg-border" />
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
              disabled={loading || googleLoading}
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
