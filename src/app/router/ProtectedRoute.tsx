
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!mounted) return;

        setAuthenticated(response.ok);
      } catch {
        if (mounted) setAuthenticated(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void verifySession();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="size-7 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
