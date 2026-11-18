import {
  Users,
  UserRound,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    title: "Total Leads",
    value: "1,240",
    change: "+12.5%",
    positive: true,
    icon: Users,
  },
  {
    title: "Total Candidates",
    value: "856",
    change: "+8.2%",
    positive: true,
    icon: UserRound,
  },
  {
    title: "Total Revenue",
    value: "৳ 2.4M",
    change: "+14.3%",
    positive: true,
    icon: Wallet,
  },
  {
    title: "Pending Tasks",
    value: "24",
    change: "-4.5%",
    positive: false,
    icon: TrendingUp,
  },
];

const activities = [
  {
    title: "New lead added",
    description: "A new lead was added to the workspace.",
    time: "10 minutes ago",
  },
  {
    title: "Candidate updated",
    description: "Candidate information was updated.",
    time: "35 minutes ago",
  },
  {
    title: "Payment received",
    description: "A payment record was created.",
    time: "1 hour ago",
  },
  {
    title: "New document uploaded",
    description: "A document was added to the files.",
    time: "2 hours ago",
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back! Here's what's happening in your workspace.
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          Overview / 2026
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>

                <div className="rounded-md bg-muted p-2">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </h2>

                <span
                  className={`flex items-center text-xs font-medium ${
                    stat.positive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {stat.positive ? (
                    <ArrowUpRight className="mr-1 size-3.5" />
                  ) : (
                    <ArrowDownRight className="mr-1 size-3.5" />
                  )}
                  {stat.change}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Compared to last month
              </p>
            </div>
          );
        })}
      </div>

      {/* Main dashboard sections */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Activity */}
        <section className="rounded-xl border bg-card xl:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">Recent Activity</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Latest updates from your workspace
              </p>
            </div>

            <button className="text-sm font-medium text-primary hover:underline">
              View all
            </button>
          </div>

          <div className="divide-y">
            {activities.map((activity) => (
              <div
                key={activity.title}
                className="flex items-start justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick overview */}
        <section className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">Workspace Overview</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Current workspace summary
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Leads</span>
                <span className="font-medium">72%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[72%] rounded-full bg-primary" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Candidates</span>
                <span className="font-medium">58%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[58%] rounded-full bg-primary" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Finance</span>
                <span className="font-medium">86%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[86%] rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}