
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Languages,
  Plus,
  Pencil,
  RefreshCw,
  Award,
  CalendarDays,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Candidate = {
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
};

type TestForm = {
  test_name: string;
  test_type: string;
  obtained_score: string;
  score_scale: string;
  test_date: string;
  expiry_date: string;
  certificate_no: string;
};

const emptyForm: TestForm = {
  test_name: "IELTS",
  test_type: "",
  obtained_score: "",
  score_scale: "",
  test_date: "",
  expiry_date: "",
  certificate_no: "",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");
}

export function LanguageTestsPage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [records, setRecords] = useState<LanguageTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestForm>(emptyForm);

  // Future Admin Lock integration point.
  const [editingLocked, setEditingLocked] = useState(false);

  const apiRequest = async (
    method: "GET" | "POST" | "PATCH",
    body?: unknown,
  ) => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Please sign in again to continue.");
    }

    const response = await fetch("/api/portal/language-tests", {
      method,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
        Accept: "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Something went wrong.");
    }

    return result;
  };

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("GET");

      setCandidate(result.candidate ?? null);
      setRecords(result.languageTests ?? []);
      setEditingLocked(Boolean(result.editingLocked));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load records.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(record: LanguageTest) {
    setEditingId(record.id);

    setForm({
      test_name: record.test_name || "",
      test_type: record.test_type || "",
      obtained_score:
        record.obtained_score === null
          ? ""
          : String(record.obtained_score),
      score_scale: record.score_scale || "",
      test_date: record.test_date || "",
      expiry_date: record.expiry_date || "",
      certificate_no: record.certificate_no || "",
    });

    setFormError("");
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.test_name.trim()) {
      setFormError("Please enter a test name.");
      return;
    }

    if (editingLocked) {
      setFormError("Editing is currently disabled.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const method = editingId ? "PATCH" : "POST";

      await apiRequest(method, {
        ...(editingId ? { id: editingId } : {}),
        ...form,
      });

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadRecords();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save your test.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages className="size-4" />
            Student Portal
            <span>/</span>
            Language Tests
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            My Language Tests
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your language proficiency test records.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadRecords}
            className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm hover:bg-muted"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>

          {candidate && !editingLocked && (
            <button
              onClick={openAddForm}
              className="flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
            >
              <Plus className="size-4" />
              Add Test
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Candidate not linked */}
      {!error && !candidate && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Languages className="mx-auto size-9 text-muted-foreground" />

          <h2 className="mt-3 font-semibold">
            Candidate Profile Not Linked
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your signed-in email does not match a candidate record.
            Please contact NorthBridge Education.
          </p>
        </div>
      )}

      {candidate && (
        <>
          {/* Candidate information */}
          <div className="rounded-xl border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Candidate Information
            </p>

            <div className="mt-3 flex flex-col justify-between gap-2 sm:flex-row">
              <div>
                <h2 className="font-semibold">
                  {candidate.first_name} {candidate.last_name || ""}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {candidate.email || "No email"}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Candidate ID: {candidate.candidate_code || candidate.id}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border bg-card p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Test Records
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {records.length}
                </p>
              </div>
              <Award className="size-6 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between rounded-xl border bg-card p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Tests with Expiry Dates
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {records.filter((r) => r.expiry_date).length}
                </p>
              </div>
              <CalendarDays className="size-6 text-muted-foreground" />
            </div>
          </div>

          {/* Future lock message */}
          {editingLocked && (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              Editing is currently disabled by the administrator.
              You can still view your records.
            </div>
          )}

          {/* Records */}
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b p-5">
              <h2 className="font-semibold">My Test Records</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your language test information.
              </p>
            </div>

            {records.length === 0 ? (
              <div className="p-12 text-center">
                <Languages className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 font-medium">
                  No Language Tests Found
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have not added any language test records yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                      <th className="px-5 py-3 font-medium">Test</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Score</th>
                      <th className="px-4 py-3 font-medium">Test Date</th>
                      <th className="px-4 py-3 font-medium">Expiry</th>
                      <th className="px-4 py-3 font-medium">Certificate</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/20">
                        <td className="px-5 py-4 font-medium">
                          {record.test_name}
                        </td>
                        <td className="px-4 py-4">
                          {record.test_type || "—"}
                        </td>
                        <td className="px-4 py-4">
                          {record.obtained_score ?? "—"}
                          {record.score_scale
                            ? ` / ${record.score_scale}`
                            : ""}
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
                        <td className="px-4 py-4">
                          {!editingLocked && (
                            <button
                              onClick={() => openEditForm(record)}
                              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted"
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add / Edit Form */}
          {formOpen && (
            <div className="rounded-xl border bg-card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {editingId ? "Edit Language Test" : "Add Language Test"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your test information below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                  className="rounded-md p-2 hover:bg-muted"
                  aria-label="Close form"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Test Name *
                    </label>
                    <input
                      required
                      value={form.test_name}
                      onChange={(e) =>
                        setForm({ ...form, test_name: e.target.value })
                      }
                      placeholder="IELTS, TOEFL, PTE..."
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test Type</label>
                    <input
                      value={form.test_type}
                      onChange={(e) =>
                        setForm({ ...form, test_type: e.target.value })
                      }
                      placeholder="Academic / General / iBT"
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Obtained Score
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.obtained_score}
                      onChange={(e) =>
                        setForm({ ...form, obtained_score: e.target.value })
                      }
                      placeholder="e.g. 7.5"
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Score Scale</label>
                    <input
                      value={form.score_scale}
                      onChange={(e) =>
                        setForm({ ...form, score_scale: e.target.value })
                      }
                      placeholder="e.g. 9.0 / 120"
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test Date</label>
                    <input
                      type="date"
                      value={form.test_date}
                      onChange={(e) =>
                        setForm({ ...form, test_date: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expiry Date</label>
                    <input
                      type="date"
                      value={form.expiry_date}
                      onChange={(e) =>
                        setForm({ ...form, expiry_date: e.target.value })
                      }
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium">
                      Certificate Number
                    </label>
                    <input
                      value={form.certificate_no}
                      onChange={(e) =>
                        setForm({ ...form, certificate_no: e.target.value })
                      }
                      placeholder="Enter certificate number"
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}

                <div className="flex justify-end gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    disabled={saving}
                    className="h-10 rounded-lg border px-4 text-sm hover:bg-muted"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="h-10 rounded-lg bg-foreground px-5 text-sm font-medium text-background disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Test"
                        : "Save Test"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </section>
  );
}
