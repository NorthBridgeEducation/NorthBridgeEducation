
import { useCallback, useEffect, useState } from "react";
import {
  ClipboardList,
  RefreshCw,
  Search,
  Eye,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Draft = {
  id: string;
  user_id: string;
  given_name: string | null;
  surname: string | null;
  date_of_birth: string | null;
  number: string | null;
  passport_number: string | null;
  gender: string | null;
  nid_number: string | null;
  passport_date_of_issue: string | null;
  passport_date_of_expiry: string | null;
  place_birth: string | null;
  fathers_name: string | null;
  mothers_name: string | null;
  permanent_address: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  candidate_id?: string | null;
};

const detailFields: {
  label: string;
  key: keyof Draft;
}[] = [
  { label: "Given Name", key: "given_name" },
  { label: "Surname", key: "surname" },
  { label: "Date of Birth", key: "date_of_birth" },
  { label: "Phone Number", key: "number" },
  { label: "Passport Number", key: "passport_number" },
  { label: "Gender", key: "gender" },
  { label: "NID Number", key: "nid_number" },
  { label: "Passport Issue Date", key: "passport_date_of_issue" },
  { label: "Passport Expiry Date", key: "passport_date_of_expiry" },
  { label: "Place of Birth", key: "place_birth" },
  { label: "Father's Name", key: "fathers_name" },
  { label: "Mother's Name", key: "mothers_name" },
  { label: "Permanent Address", key: "permanent_address" },
  { label: "Auth User ID", key: "user_id" },
  { label: "Created At", key: "created_at" },
  { label: "Updated At", key: "updated_at" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString();
}

export function DraftPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState("");
  const loadDrafts = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const response = await fetch("/api/admin/drafts", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "API did not return JSON. Check /api/admin/drafts.",
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `Request failed (${response.status})`,
        );
      }

      setDrafts(result.drafts ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load draft applications.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDrafts();
  }, [loadDrafts]);

  const filteredDrafts = drafts.filter((draft) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return [
      draft.given_name,
      draft.surname,
      draft.number,
      draft.passport_number,
      draft.status,
    ].some((value) => value?.toLowerCase().includes(query));
  });

  const pendingCount = drafts.filter(
    (draft) => draft.status !== "approved",
  ).length;

  const approvedCount = drafts.filter(
    (draft) => draft.status === "approved",
  ).length;
  async function approveDraft(draft: Draft) {
  if (approving || draft.status === "approved") return;

  setApproving(true);
  setApprovalError("");

  try {
    const response = await fetch("/api/admin/drafts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft_id: draft.id }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success || !result.candidate_id) {
      throw new Error(result?.message ?? "Could not approve the draft.");
    }

    const approvedDraft: Draft = {
      ...draft,
      status: "approved",
      candidate_id: result.candidate_id,
    };

    setDrafts((previous) =>
      previous.map((row) => row.id === draft.id ? approvedDraft : row),
    );

    setSelectedDraft((current) =>
      current?.id === draft.id ? approvedDraft : current,
    );
  } catch (error) {
    setApprovalError(
      error instanceof Error ? error.message : "Could not approve the draft.",
    );
  } finally {
    setApproving(false);
  }
}
  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="size-4" />
            Management / Draft Applications
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Draft Applications
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View applications saved by students from the portal.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadDrafts(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            className={`size-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total Drafts
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {drafts.length}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pending Review
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {pendingCount}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Approved
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {approvedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Draft List */}
      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <CardHeader className="border-b px-5 py-5">
          <CardTitle>Student Drafts</CardTitle>
          <CardDescription>
            {filteredDrafts.length} applications found
          </CardDescription>

          <div className="relative mt-3 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone, passport..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Passport</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-muted-foreground"
                    >
                      Loading draft applications...
                    </td>
                  </tr>
                ) : filteredDrafts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-muted-foreground"
                    >
                      {error
                        ? "Unable to display drafts."
                        : "No draft applications found."}
                    </td>
                  </tr>
                ) : (
                  filteredDrafts.map((draft) => {
                    const fullName =
                      `${draft.given_name || ""} ${draft.surname || ""}`.trim() ||
                      "Unnamed Student";

                    return (
                      <tr
                        key={draft.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-4 font-medium">
                          {fullName}
                        </td>

                        <td className="px-4 py-4">
                          {draft.number || "—"}
                        </td>

                        <td className="px-4 py-4 font-mono text-xs">
                          {draft.passport_number || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              draft.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {draft.status || "draft"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDate(draft.created_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
  setApprovalError("");
  setSelectedDraft(draft);
}}
                          >
                            <Eye className="size-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Draft Details Modal */}
      {selectedDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDraft(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="draft-details-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2
                  id="draft-details-title"
                  className="text-xl font-semibold"
                >
                  Draft Application Details
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Student information submitted from the portal.
                </p>
              </div>

              <Button
                size="icon"
                variant="ghost"
                aria-label="Close details"
                onClick={() => setSelectedDraft(null)}
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {detailFields.map(({ label, key }) => (
                <div key={key} className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {label}
                  </p>

                  <p className="mt-1 break-words text-sm font-medium">
                    {key === "created_at" || key === "updated_at"
                      ? formatDate(selectedDraft[key])
                      : String(selectedDraft[key] || "—")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t pt-4">
  {approvalError && (
    <p role="alert" className="text-sm text-destructive">{approvalError}</p>
  )}

  {selectedDraft.status === "approved" && (
    <p role="status" className="text-sm text-muted-foreground">
      {selectedDraft.candidate_id ? "Approved. Candidate created." : "Approved."}
    </p>
  )}

  <div className="flex flex-wrap justify-end gap-2">
    <Button variant="outline" onClick={() => setSelectedDraft(null)}>
      Close
    </Button>

    {(!selectedDraft.status || selectedDraft.status === "draft") && (
      <Button
        type="button"
        disabled={approving}
        onClick={() => void approveDraft(selectedDraft)}
      >
        {approving ? "Approving…" : "Approve & Create Candidate"}
      </Button>
    )}
  </div>
</div>
          </div>
        </div>
      )}
    </section>
  );
}
