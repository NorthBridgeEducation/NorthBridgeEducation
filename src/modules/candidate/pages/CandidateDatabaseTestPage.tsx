
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  Database,
  GraduationCap,
//   Languages,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Education = {
  id: string;
  qualification: string;
  institution_name: string | null;
  passing_year: number | null;
  group_major: string | null;
};

type LanguageTest = {
  id: string;
  test_name: string;
  test_type: string | null;
  obtained_score: number | null;
  score_scale: string | null;
};

type Candidate = {
  id: string;
  candidate_code: string | null;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  candidate_education: Education[];
  candidate_language_tests: LanguageTest[];
};

export function CandidateDatabaseTestPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [addNotice, setAddNotice] = useState("");
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/candidates", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load candidates.");
      }

      setCandidates(result.candidates ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);
async function addCandidate(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (saving) return;

  const fields = new FormData(event.currentTarget);
  setSaving(true);
  setAddError("");
  setAddNotice("");

  try {
    const response = await fetch("/api/admin/candidates", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fields)),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      throw new Error(result?.message ?? "Could not add the candidate.");
    }

    setAddOpen(false);
    setSearch("");
    setAddNotice("Candidate added successfully.");
    await loadCandidates();
  } catch (error) {
    setAddError(error instanceof Error ? error.message : "Could not add the candidate.");
  } finally {
    setSaving(false);
  }
}
  const filteredCandidates = candidates.filter((candidate) => {
    const name = [
      candidate.first_name,
      candidate.last_name ?? "",
    ].join(" ").toLowerCase();

    const query = search.toLowerCase().trim();

    return (
      !query ||
      name.includes(query) ||
      (candidate.email ?? "").toLowerCase().includes(query) ||
      (candidate.candidate_code ?? "").toLowerCase().includes(query) ||
      (candidate.phone ?? "").includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="size-4" />
            Management
            <span>/</span>
            <span className="text-foreground">
              Candidate Database Test
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Candidate Database Test
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Verify real candidate records from Supabase.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
  <Button type="button" variant="outline" onClick={loadCandidates} disabled={loading}>
    <RefreshCw className={loading ? "animate-spin" : ""} />
    Refresh Database
  </Button>

  <Dialog
    open={addOpen}
    onOpenChange={(open) => {
      if (saving) return;
      setAddOpen(open);
      setAddError("");
    }}
  >
    <DialogTrigger asChild>
      <Button type="button">
        <UserPlus className="size-4" aria-hidden="true" />
        Add Candidate
      </Button>
    </DialogTrigger>

    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Add Candidate</DialogTitle>
        <DialogDescription>
          First name is required. You can fill in the other details later.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={addCandidate} className="space-y-4">
        <fieldset disabled={saving} className="grid min-w-0 gap-4 sm:grid-cols-2">
          {[
            { name: "first_name", label: "First name", type: "text", required: true },
            { name: "last_name", label: "Last name", type: "text" },
            { name: "date_of_birth", label: "Date of birth", type: "date" },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "email", label: "Email", type: "email" },
          ].map((field) => (
            <label key={field.name} className="block min-w-0 space-y-1.5 text-sm font-medium">
              <span>{field.label}{field.required ? " *" : ""}</span>
              <Input name={field.name} type={field.type} required={field.required} />
            </label>
          ))}
        </fieldset>

        {addError && <p role="alert" className="text-sm text-destructive">{addError}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={saving} onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Adding…" : "Add Candidate"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</div>
      </div>
{addNotice && (
  <p role="status" className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
    {addNotice}
  </p>
)}
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="gap-3 py-5 shadow-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Candidates
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {loading ? "..." : candidates.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Real database records
              </p>
            </div>
            <Users className="size-6 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="gap-3 py-5 shadow-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Education Records
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {loading
                  ? "..."
                  : candidates.reduce(
                      (total, c) =>
                        total + (c.candidate_education?.length ?? 0),
                      0,
                    )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Linked education records
              </p>
            </div>
            <GraduationCap className="size-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive/40 shadow-none">
          <CardContent className="py-5">
            <p className="font-medium text-destructive">
              Database connection failed
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={loadCandidates}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Candidate list */}
      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <CardHeader className="gap-4 border-b px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                Supabase Candidates
              </CardTitle>
              <CardDescription className="mt-1">
                Live records from your candidates table.
              </CardDescription>
            </div>

            <span className="text-xs text-muted-foreground">
              {loading ? "Loading..." : `${filteredCandidates.length} results`}
            </span>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, code or phone..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Loading real candidates from Supabase...
            </div>
          ) : error ? null : filteredCandidates.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto size-9 text-muted-foreground" />
              <p className="mt-3 font-medium">
                No candidates found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {candidates.length === 0
                  ? "Your Supabase candidates table is currently empty."
                  : "Try another search term."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Candidate Code</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Education</th>
                    <th className="px-4 py-3 font-medium">Language Tests</th>
                    <th className="px-4 py-3 font-medium">Registered</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredCandidates.map((candidate) => {
                    const fullName = [
                      candidate.first_name,
                      candidate.last_name ?? "",
                    ].join(" ").trim();

                    return (
                      <tr
                        key={candidate.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium">{fullName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {candidate.email || "—"}
                          </p>
                        </td>

                        <td className="px-4 py-4 font-mono text-xs">
                          {candidate.candidate_code || "—"}
                        </td>

                        <td className="px-4 py-4">
                          {candidate.phone || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {candidate.candidate_education?.length ? (
                              candidate.candidate_education.map((edu) => (
                                <p key={edu.id} className="text-xs">
                                  {edu.qualification}
                                  {edu.passing_year
                                    ? ` (${edu.passing_year})`
                                    : ""}
                                </p>
                              ))
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {candidate.candidate_language_tests?.length ? (
                              candidate.candidate_language_tests.map((test) => (
                                <p key={test.id} className="text-xs">
                                  {test.test_name}:{" "}
                                  {test.obtained_score ?? "—"}
                                  {test.score_scale
                                    ? ` / ${test.score_scale}`
                                    : ""}
                                </p>
                              ))
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {new Date(candidate.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
