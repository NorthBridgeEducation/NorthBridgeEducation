
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Languages,
  RefreshCw,
  Search,
  Award,
  Users,
  CalendarDays,
  Plus,
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
type CandidateInfo = {
  id: string;
  candidate_code: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
};

type LanguageTest = {
  id: string;
  candidate_id: string;
  test_name: string;
  test_type: string | null;
  obtained_score: number | null;
  score_scale: string | null;
  test_date: string | null;
  expiry_date: string | null;
  certificate_no: string | null;
  created_at: string;
  updated_at: string;
  candidate: CandidateInfo | CandidateInfo[] | null;
};

type TestForm = {
  candidate_id: string;
  test_name: string;
  test_type: string;
  obtained_score: string;
  score_scale: string;
  test_date: string;
  expiry_date: string;
  certificate_no: string;
};

const initialForm: TestForm = {
  candidate_id: "",
  test_name: "IELTS",
  test_type: "",
  obtained_score: "",
  score_scale: "",
  test_date: "",
  expiry_date: "",
  certificate_no: "",
};

function getCandidate(
  value: LanguageTest["candidate"],
): CandidateInfo | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");
}

export function CandidateLanguageTestsPage() {
  const [records, setRecords] = useState<LanguageTest[]>([]);
  const [candidates, setCandidates] = useState<CandidateInfo[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState<TestForm>(initialForm);

  // Load language test records
  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/candidate-language-tests",
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load language tests.",
        );
      }

      setRecords(result.languageTests ?? []);
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

  // Load candidate list for the Add Test form
  const loadCandidates = useCallback(async () => {
    setFormError("");

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
        throw new Error(
          result.message || "Could not load candidates.",
        );
      }

      setCandidates(result.candidates ?? []);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Could not load candidates.",
      );
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  // Search
  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return records;

    return records.filter((record) => {
      const candidate = getCandidate(record.candidate);

      const name = [
        candidate?.first_name,
        candidate?.last_name ?? "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        name.includes(query) ||
        record.test_name.toLowerCase().includes(query) ||
        (record.test_type ?? "").toLowerCase().includes(query) ||
        (record.certificate_no ?? "").toLowerCase().includes(query) ||
        (candidate?.email ?? "").toLowerCase().includes(query) ||
        (candidate?.candidate_code ?? "").toLowerCase().includes(query)
      );
    });
  }, [records, search]);

  // Statistics
  const candidateCount = useMemo(
    () => new Set(records.map((record) => record.candidate_id)).size,
    [records],
  );

  const expiryCount = records.filter(
    (record) => record.expiry_date,
  ).length;

  // Open Add Test dialog
  const openAddDialog = () => {
    setForm(initialForm);
    setFormError("");
    setDialogOpen(true);
    void loadCandidates();
  };

  // Save a new language test
  const handleAddTest = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.candidate_id || !form.test_name.trim()) {
      setFormError("Please select a candidate and test name.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const response = await fetch(
        "/api/admin/candidate-language-tests",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not save language test.",
        );
      }

      setDialogOpen(false);
      setForm(initialForm);

      await loadRecords();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages className="size-4" />
            Management
            <span>/</span>
            <span className="text-foreground">
              Language Tests
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Candidate Language Tests
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage candidate language proficiency test records.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadRecords}
            disabled={loading}
          >
            <RefreshCw
              className={loading ? "animate-spin" : ""}
            />
            Refresh Records
          </Button>

          <Button onClick={openAddDialog}>
            <Plus />
            Add Test
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">

        <Card className="gap-3 py-5 shadow-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Test Records
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {loading ? "..." : records.length}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Real Supabase records
              </p>
            </div>

            <Award className="size-6 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="gap-3 py-5 shadow-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Candidates
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {loading ? "..." : candidateCount}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                With language tests
              </p>
            </div>

            <Users className="size-6 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="gap-3 py-5 shadow-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Expiry Dates
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {loading ? "..." : expiryCount}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Records with expiry dates
              </p>
            </div>

            <CalendarDays className="size-6 text-muted-foreground" />
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
              onClick={loadRecords}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Language Test Table */}
      <Card className="gap-0 overflow-hidden py-0 shadow-none">

        <CardHeader className="gap-4 border-b px-5 py-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-base">
                Language Test Records
              </CardTitle>

              <CardDescription className="mt-1">
                Live records from candidate_language_tests.
              </CardDescription>
            </div>

            <span className="text-xs text-muted-foreground">
              {loading
                ? "Loading..."
                : `${filteredRecords.length} results`}
            </span>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, test or certificate..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Loading language test records from Supabase...
            </div>
          ) : error ? null : filteredRecords.length === 0 ? (
            <div className="py-16 text-center">
              <Languages className="mx-auto size-9 text-muted-foreground" />

              <p className="mt-3 font-medium">
                No Language Test Records
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {records.length === 0
                  ? "No language tests have been added yet."
                  : "Try another search term."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Test Name</th>
                    <th className="px-4 py-3 font-medium">Test Type</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Test Date</th>
                    <th className="px-4 py-3 font-medium">Expiry Date</th>
                    <th className="px-4 py-3 font-medium">Certificate No.</th>
                    <th className="px-4 py-3 font-medium">Created At</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredRecords.map((record) => {
                    const candidate = getCandidate(record.candidate);

                    const fullName = [
                      candidate?.first_name,
                      candidate?.last_name ?? "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <tr
                        key={record.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {fullName || "Candidate not found"}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {candidate?.candidate_code ||
                              candidate?.email ||
                              record.candidate_id}
                          </p>
                        </td>

                        <td className="px-4 py-4 font-medium">
                          {record.test_name}
                        </td>

                        <td className="px-4 py-4">
                          {record.test_type || "—"}
                        </td>

                        <td className="px-4 py-4 font-medium">
                          {record.obtained_score ?? "—"}

                          {record.score_scale && (
                            <span className="text-muted-foreground">
                              {" "}/ {record.score_scale}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {formatDate(record.test_date)}
                        </td>

                        <td className="px-4 py-4">
                          {formatDate(record.expiry_date)}
                        </td>

                        <td className="px-4 py-4 font-mono text-xs">
                          {record.certificate_no || "—"}
                        </td>

                        <td className="px-4 py-4 text-xs text-muted-foreground">
                          {new Date(
                            record.created_at,
                          ).toLocaleDateString("en-GB")}
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

      {/* Add Language Test Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setDialogOpen(open);
            if (!open) setFormError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add Language Test
            </DialogTitle>

            <DialogDescription>
              Add a new language test record for a candidate.
              One candidate can have multiple test records.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTest} className="space-y-4">

            {/* Candidate */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Candidate *
              </label>

              <Select
                value={form.candidate_id}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    candidate_id: value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>

                <SelectContent>
                  {candidates.map((candidate) => (
                    <SelectItem
                      key={candidate.id}
                      value={candidate.id}
                    >
                      {candidate.first_name} {candidate.last_name ?? ""}
                      {" — "}
                      {candidate.candidate_code ||
                        candidate.email ||
                        candidate.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {candidates.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No candidates available. Check the candidate database.
                </p>
              )}
            </div>

            {/* Test Name and Type */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Test Name *
                </label>

                <Select
                  value={form.test_name}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      test_name: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select test" />
                  </SelectTrigger>

                  <SelectContent>
                    {[
                      "IELTS",
                      "TOEFL",
                      "PTE",
                      "Duolingo",
                      "Cambridge English",
                      "Other",
                    ].map((test) => (
                      <SelectItem key={test} value={test}>
                        {test}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Test Type
                </label>

                <Input
                  placeholder="Academic / General / iBT"
                  value={form.test_type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      test_type: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Score */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Obtained Score
                </label>

                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 7.5"
                  value={form.obtained_score}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      obtained_score: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Score Scale
                </label>

                <Input
                  placeholder="e.g. 9.0 / 120 / 90"
                  value={form.score_scale}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      score_scale: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Test Date
                </label>

                <Input
                  type="date"
                  value={form.test_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      test_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Expiry Date
                </label>

                <Input
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      expiry_date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Certificate */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Certificate Number
              </label>

              <Input
                placeholder="Enter certificate number"
                value={form.certificate_no}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    certificate_no: e.target.value,
                  }))
                }
              />
            </div>

            {/* Form Error */}
            {formError && (
              <p className="text-sm text-destructive">
                {formError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  saving ||
                  !form.candidate_id ||
                  !form.test_name.trim()
                }
              >
                {saving ? "Saving..." : "Save Language Test"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
