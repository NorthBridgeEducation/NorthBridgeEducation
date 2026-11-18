import { Outlet } from "react-router-dom";

export function ProtectedRoute() {
  // TODO: Add authentication session validation.
  return <Outlet />;
}