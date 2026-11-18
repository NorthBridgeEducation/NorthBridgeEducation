
import { useMemo, useState, type FormEvent } from "react";
import {
  Search,
  Plus,
  Users,
  UserPlus,
  Phone,
  Mail,
  // Globe,
  // ArrowUpRight,
  MoreHorizontal,
  Filter,
  GraduationCap,
  CheckCircle2,
  // Clock3,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Converted"
  | "Lost";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  program: string;
  source: string;
  status: LeadStatus;
  date: string;
};

const initialLeads: Lead[] = [
  {
    id: "LD-1001",
    name: "Rahim Ahmed",
    email: "rahim@example.com",
    phone: "+880 1712-345678",
    country: "Canada",
    program: "Bachelor's",
    source: "Website",
    status: "New",
    date: "Nov 09, 2026",
  },
  {
    id: "LD-1002",
    name: "Nusrat Jahan",
    email: "nusrat@example.com",
    phone: "+880 1812-345678",
    country: "United Kingdom",
    program: "Master's",
    source: "Facebook",
    status: "Contacted",
    date: "Nov 08, 2026",
  },
  {
    id: "LD-1003",
    name: "Sakib Hasan",
    email: "sakib@example.com",
    phone: "+880 1912-345678",
    country: "Australia",
    program: "Diploma",
    source: "Referral",
    status: "Qualified",
    date: "Nov 07, 2026",
  },
  {
    id: "LD-1004",
    name: "Fatema Akter",
    email: "fatema@example.com",
    phone: "+880 1612-345678",
    country: "Japan",
    program: "Language Course",
    source: "Website",
    status: "Converted",
    date: "Nov 06, 2026",
  },
  {
    id: "LD-1005",
    name: "Tanvir Hossain",
    email: "tanvir@example.com",
    phone: "+880 1512-345678",
    country: "Germany",
    program: "Bachelor's",
    source: "Facebook",
    status: "Lost",
    date: "Nov 05, 2026",
  },
];

const filters = [
  "All",
  "New",
  "Contacted",
  "Qualified",
  "Converted",
  "Lost",
] as const;

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-blue-500/10 text-blue-600",
  Contacted: "bg-amber-500/10 text-amber-600",
  Qualified: "bg-violet-500/10 text-violet-600",
  Converted: "bg-emerald-500/10 text-emerald-600",
  Lost: "bg-muted text-muted-foreground",
};

export function LeadPage() {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    program: "",
  });

  const stats = useMemo(
    () => [
      {
        title: "Total leads",
        value: leads.length,
        description: "All registered leads",
        icon: Users,
      },
      {
        title: "New leads",
        value: leads.filter((lead) => lead.status === "New").length,
        description: "Waiting for first contact",
        icon: UserPlus,
      },
      {
        title: "Qualified",
        value: leads.filter((lead) => lead.status === "Qualified").length,
        description: "Ready for next step",
        icon: CheckCircle2,
      },
      {
        title: "Converted",
        value: leads.filter((lead) => lead.status === "Converted").length,
        description: "Successfully converted",
        icon: GraduationCap,
      },
    ],
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const query = search.toLowerCase().trim();

    return leads.filter((lead) => {
      const matchesSearch = [
        lead.name,
        lead.email,
        lead.phone,
        lead.country,
        lead.id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        activeFilter === "All" || lead.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, activeFilter]);

  const handleAddLead = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newLead: Lead = {
      id: `LD-${Date.now().toString().slice(-6)}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      country: form.country,
      program: form.program,
      source: "Manual",
      status: "New",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setLeads((previous) => [newLead, ...previous]);
    setForm({
      name: "",
      email: "",
      phone: "",
      country: "",
      program: "",
    });
    setShowForm(false);
    setActiveFilter("All");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-foreground">Leads</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Lead Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage inquiries and track prospective students.
          </p>
        </div>

        <Button onClick={() => setShowForm((value) => !value)}>
          {showForm ? <X className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
          {showForm ? "Close form" : "Add lead"}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title} className="shadow-none">
              <CardContent className="flex items-start justify-between p-5">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-2.5">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add lead form */}
      {showForm && (
        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Create new lead</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the prospective student's basic information.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full name *</label>
                  <Input
                    required
                    placeholder="Student name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    required
                    type="email"
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone *</label>
                  <Input
                    required
                    placeholder="+880 1XXXXXXXXX"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Preferred country
                  </label>
                  <Input
                    placeholder="e.g. Canada"
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Study program</label>
                  <Input
                    placeholder="e.g. Bachelor's"
                    value={form.program}
                    onChange={(e) =>
                      setForm({ ...form, program: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="mr-2 size-4" />
                  Create lead
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lead table */}
      <Card className="shadow-none">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">All leads</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                View and manage your prospective students.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="shrink-0">
                <Filter className="mr-2 size-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Status filters */}
          <div className="flex gap-1 overflow-x-auto border-b">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 border-b-2 px-3 py-2 text-sm transition-colors ${
                  activeFilter === filter
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
                {filter === "All" && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {leads.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Lead</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Study interest</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                          {lead.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="whitespace-nowrap font-medium">
                            {lead.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lead.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 whitespace-nowrap text-muted-foreground">
                          <Mail className="size-3.5" />
                          {lead.email}
                        </p>
                        <p className="flex items-center gap-2 whitespace-nowrap text-muted-foreground">
                          <Phone className="size-3.5" />
                          {lead.phone}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="whitespace-nowrap font-medium">
                          {lead.country || "Not specified"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.program || "Not specified"}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {lead.source}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusStyles[lead.status]}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {lead.date}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${lead.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="size-8 text-muted-foreground/50" />
                        <p className="font-medium">No leads found</p>
                        <p className="text-sm text-muted-foreground">
                          Try another search or status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredLeads.length} of {leads.length} leads
            </span>
            <span>Demo data · Local state only</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
