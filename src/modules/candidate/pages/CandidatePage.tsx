import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCandidates } from "../hooks/useCandidates";
import type {
  Candidate,
  CandidateStatus,
} from "../hooks/useCandidates";
import {
  Users,
  // UserRoundPlus,
  Clock3,
  CheckCircle2,
  // GraduationCap,
  Search,
  Plus,
  ArrowUpRight,
  FileText,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


const filters = [
  "All",
  "In Review",
  "Documents Pending",
  "Offer Received",
  "Completed",
] as const;

type Filter = (typeof filters)[number];

const statusStyles: Record<CandidateStatus, string> = {
  "In Review": "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300",
  "Documents Pending": "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300",
  "Offer Received": "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/40 dark:text-violet-300",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CandidateStatusBadge({ status }: { status: CandidateStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
}) {
  return (
    <Card className="gap-3 py-5 shadow-none">
      <CardContent className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CandidatePage() {
  const navigate = useNavigate();

  const {
    candidates,
    loading,
    error,
    createCandidate,
    refreshCandidates,
  } = useCandidates();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [showForm, setShowForm] = useState(false);
const [creating, setCreating] = useState(false);
const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    education: "",
  });

 const filteredCandidates = useMemo(() => {
  const query = search.toLowerCase().trim();

  return candidates.filter((candidate) => {
    const matchesSearch =
      !query ||
      candidate.name.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query) ||
      candidate.candidateCode.toLowerCase().includes(query) ||
      candidate.country.toLowerCase().includes(query) ||
      candidate.phone.toLowerCase().includes(query);

    const matchesStatus =
      activeFilter === "All" ||
      candidate.status === activeFilter;

    return matchesSearch && matchesStatus;
  });
}, [candidates, search, activeFilter]);
  const stats = {
    total: candidates.length,
    review: candidates.filter((c) => c.status === "In Review").length,
    pending: candidates.filter((c) => c.status === "Documents Pending").length,
    completed: candidates.filter((c) => c.status === "Completed").length,
  };

  async function handleAddCandidate(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setCreating(true);
  setFormError("");

  try {
    await createCandidate({
      name: form.name,
      email: form.email,
    });

    setForm({
      name: "",
      email: "",
      country: "",
      education: "",
    });

    setShowForm(false);
    setActiveFilter("All");
    setSearch("");
  } catch (err) {
    setFormError(
      err instanceof Error
        ? err.message
        : "Failed to create candidate."
    );
  } finally {
    setCreating(false);
  }
}

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            Management
            <span>/</span>
            <span className="text-foreground">Candidates</span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Candidates
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage student profiles and track their application progress.
          </p>
        </div>

        <Button onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? <X /> : <Plus />}
          {showForm ? "Close" : "Add Candidate"}
        </Button>
      </div>

      {/* Add candidate form */}
      {showForm && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">New candidate</CardTitle>
            <CardDescription>
              Add a candidate to your workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full name</label>
                  <Input
                    required
                    placeholder="Candidate name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    required
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <Input
                    required
                    placeholder="e.g. United Kingdom"
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Education</label>
                  <Input
                    required
                    placeholder="e.g. Bachelor's"
                    value={form.education}
                    onChange={(e) =>
                      setForm({ ...form, education: e.target.value })
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
                <Button type="submit" disabled={creating}>
  <Plus />
  {creating ? "Creating..." : "Create Candidate"}
</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total candidates"
          value={stats.total}
          description="All registered candidates"
          icon={Users}
        />
        <StatCard
          title="In review"
          value={stats.review}
          description="Applications under review"
          icon={Clock3}
        />
        <StatCard
          title="Documents pending"
          value={stats.pending}
          description="Require document submission"
          icon={FileText}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          description="Completed applications"
          icon={CheckCircle2}
        />
      </div>

      {/* Candidate list */}
      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <CardHeader className="gap-4 border-b px-5 py-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-base">All candidates</CardTitle>
              <CardDescription className="mt-1">
                View and manage your candidate records.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="size-4" />
              {filteredCandidates.length} results
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, ID or country..."
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={activeFilter === filter ? "secondary" : "ghost"}
                  className="h-8 text-xs"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Candidate ID</th>
                  <th className="px-4 py-3 font-medium">Destination</th>
                  <th className="px-4 py-3 font-medium">Education</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied date</th>
                  <th className="px-5 py-3 text-right font-medium">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading && (
  <tr>
    <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
      Loading candidates...
    </td>
  </tr>
)}

{!loading && error && (
  <tr>
    <td colSpan={7} className="px-5 py-12 text-center text-destructive">
      {error}
    </td>
  </tr>
)}
                {!loading && !error && filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(candidate.name)}
                        </div>

                        <div className="min-w-0">
                          <button
  type="button"
  onClick={() =>
    navigate(`/app/candidate/${candidate.id}`)
  }
  className="truncate text-left font-medium hover:text-primary hover:underline"
>
  {candidate.name}
</button>
                          <p className="truncate text-xs text-muted-foreground">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
  {candidate.candidateCode}
</td>

                    <td className="px-4 py-3.5">{candidate.country}</td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {candidate.education}
                    </td>

                    <td className="px-4 py-3.5">
                      <CandidateStatusBadge status={candidate.status} />
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {candidate.applied}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Button
  variant="ghost"
  size="icon"
  className="size-8"
  aria-label={`View ${candidate.name}`}
  title="Candidate details"
  onClick={() =>
    navigate(`/app/candidate/${candidate.id}`)
  }
>
  <ArrowUpRight className="size-4" />
</Button>
                    </td>
                  </tr>
                ))}

                {!loading && !error && filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted">
                        <Search className="size-5 text-muted-foreground" />
                      </div>
                      <p className="mt-3 font-medium">No candidates found</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try another search term or change the status filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </span>
            <span>Candidate management</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}