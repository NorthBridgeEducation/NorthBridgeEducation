import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img
        src="/pwa-192x192.png"
        alt="NorthBridge"
        className="size-10 rounded-lg object-contain"
      />
      <div className="leading-tight">
        <p className="text-xl font-bold tracking-tight text-[#122c46]">
          NorthBridge Education
        </p>
      </div>
    </Link>
  );
}

export function ComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3f7fa] text-[#122c46]">
      <header className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
  <Brand />

  <Link
    to="/portal/login"
    className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#122c46] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#28577e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28577e] focus-visible:ring-offset-2 sm:px-4"
  >
    Login
  </Link>
</header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="text-center">
          <Badge
            variant="outline"
            className="mb-6 gap-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#28577e]"
          >
            <Sparkles className="size-4" />
            NEW WEBSITE
          </Badge>

          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-[#122c46] sm:text-6xl lg:text-7xl">
            Coming soon.....
          </h1>

          <p className="mt-5 text-base text-slate-600">
            We are working on something new.
          </p>
        </div>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} NorthBridge Education. All rights reserved.
      </footer>
    </div>
  );
}