
import { useState, type FormEvent } from "react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Moon,
  Network,
  ShieldCheck,
  Sun,
} from "lucide-react";

export function LoginPage() {
    
const navigate = useNavigate();

  const { resolvedTheme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  // Demo login
  navigate("/app", { replace: true });
}

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="grid min-h-dvh lg:grid-cols-[1fr_0.9fr]">

        {/* Login section */}
        <section className="flex min-h-dvh flex-col px-6 py-6 sm:px-10 lg:px-14 xl:px-20">

          {/* Brand */}
          <header className="flex items-center justify-between">
            <a href="/login" className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
                <Network className="size-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                NBridge
              </span>
            </a>

            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-[18px]" />
              ) : (
                <Moon className="size-[18px]" />
              )}
            </button>
          </header>

          {/* Form */}
          <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">

            <div className="mb-8">
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl border bg-muted/60">
                <LockKeyhole className="size-5" />
              </div>

              <p className="mb-2 text-sm font-medium text-muted-foreground">
                WELCOME BACK
              </p>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Sign in to your workspace
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Enter your account details to continue to your NBridge workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Work email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@company.com"
                  required
                  className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none placeholder:text-muted-foreground/70 focus-visible:ring-3 focus-visible:ring-ring/20"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setNotice("Password recovery is not connected yet.")
                    }
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    className="h-11 w-full rounded-lg border border-input bg-background px-3.5 pr-11 text-sm outline-none placeholder:text-muted-foreground/70 focus-visible:ring-3 focus-visible:ring-ring/20"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-[18px]" />
                    ) : (
                      <Eye className="size-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="remember"
                  className="size-4 accent-foreground"
                />
                Keep me signed in
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/85"
              >
                Sign in
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>

              {notice && (
                <p role="status" className="rounded-lg border bg-muted/60 px-3.5 py-3 text-sm text-muted-foreground">
                  {notice}
                </p>
              )}
            </form>

            {/* Security */}
            <div className="mt-8 flex gap-3 rounded-lg border bg-muted/30 p-4">
              <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                Your workspace is protected. Only use your organization-issued
                account to sign in.
              </p>
            </div>
          </div>

          <footer className="flex flex-col gap-2 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} NBridge. All rights reserved.</span>
            <span>Workspace Management System</span>
          </footer>
        </section>

        {/* Right visual panel */}
        <aside className="relative hidden min-h-dvh flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex xl:p-16">

          {/* Background grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            }}
          />

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-32 top-1/4 size-[520px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-16 top-[31%] size-[360px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute right-12 top-[38%] size-44 rounded-full border border-white/10 bg-white/[0.03]" />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <Network className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              NBridge
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/75">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              ONE WORKSPACE. CONNECTED WORK.
            </div>

            <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">
              Bring your work
              <br />
              together.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
              A clear, connected workspace for your team to manage operations,
              stay organized, and move work forward with confidence.
            </p>

            <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-2xl font-semibold">01</p>
                <p className="mt-1 text-xs text-white/50">
                  One connected workspace
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-2xl font-semibold">24/7</p>
                <p className="mt-1 text-xs text-white/50">
                  Access when you need it
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between border-t border-white/10 pt-5 text-xs text-white/40">
            <span>Designed for focused work.</span>
            <span>Secure access</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
