import { Outlet } from "react-router-dom";

export function MainContent() {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">
        <Outlet />
      </div>
    </main>
  );
}