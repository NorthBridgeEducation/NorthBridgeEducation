import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Wallet,
  Folder,
  Layers,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { useApp } from "../../app/providers/AppProvider";

type NavigationItem = {
  title: string;
  path: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    path: "/app",
    icon: LayoutDashboard,
  },
  {
    title: "Lead",
    path: "/app/lead",
    icon: Users,
  },
  {
    title: "Candidate",
    path: "/app/candidate",
    icon: UserRound,
  },
  {
    title: "Finance",
    path: "/app/finance",
    icon: Wallet,
  },
  {
    title: "Files",
    path: "/app/files",
    icon: Folder,
  },
  {
    title: "Others",
    path: "/app/others",
    icon: Layers,
  },
];

export function SidebarNav() {
  const { sidebarCollapsed, closeMobileSidebar } = useApp();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      <p
        className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${
          sidebarCollapsed ? "md:hidden" : ""
        }`}
      >
        Workspace
      </p>

      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/app"}
            onClick={closeMobileSidebar}
            title={sidebarCollapsed ? item.title : undefined}
            className={({ isActive }) =>
              [
                "group flex h-10 items-center gap-3 rounded-md px-3",
                "text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border border-border bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                sidebarCollapsed ? "md:justify-center md:px-0" : "",
              ].join(" ")
            }
          >
            <Icon className="size-[18px] shrink-0" />

            <span className={sidebarCollapsed ? "md:hidden" : ""}>
              {item.title}
            </span>
          </NavLink>
        );
      })}

      <div className="mt-auto border-t pt-3">
        <NavLink
          to="/app/settings"
          onClick={closeMobileSidebar}
          title={sidebarCollapsed ? "Settings" : undefined}
          className={({ isActive }) =>
            [
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "border border-border bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
              sidebarCollapsed ? "md:justify-center md:px-0" : "",
            ].join(" ")
          }
        >
          <Settings className="size-[18px] shrink-0" />
          <span className={sidebarCollapsed ? "md:hidden" : ""}>
            Settings
          </span>
        </NavLink>
      </div>
    </nav>
  );
}