
import { useEffect, useState, type FormEvent } from "react";
import { GraduationCap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Candidate = {
  id: string;
  candidate_code: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
};

const initialForm = {
  candidate_id: "",
  qualification: "",
  board: "",
  institution_name: "",
  group_major: "",
  passing_year: "",
  grading_scale: "",
  obtained_mark: "",
};

export function CandidateEducationTestPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadCandidates() {
      try {
        const response = await fetch("/api/admin/candidates", {
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        const rows = result.candidates ?? [];
        setCandidates(rows);

        if (rows.length) {
          setForm((old) => ({
            ...old,
            candidate_id: rows[0].id,
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load candidates.");
      } finally {
        setLoading(false);
      }
    }

    void loadCandidates();
  }, []);

  function update(key: keyof typeof initialForm, value: string) {
    setForm((old) => ({ ...old, [key]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/candidate-education", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.message);
      }

      setSuccess("Education successfully saved to Supabase.");

      setForm((old) => ({
        ...initialForm,
        candidate_id: old.candidate_id,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="size-4" />
          Candidate / Education Test
        </div>

        <h1 className="mt-2 text-2xl font-semibold">
          Add Candidate Education
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Test education records using the Supabase database.
        </p>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Education Information</CardTitle>
          <CardDescription>
            Select a candidate and add their academic history.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Candidate *
              </label>

              <select
                required
                value={form.candidate_id}
                onChange={(e) => update("candidate_id", e.target.value)}
                disabled={loading || candidates.length === 0}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {loading ? "Loading candidates..." : "Select candidate"}
                </option>

                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.first_name} {candidate.last_name ?? ""}
                    {candidate.candidate_code
                      ? ` — ${candidate.candidate_code}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Qualification *</label>
                <Input
                  required
                  value={form.qualification}
                  onChange={(e) => update("qualification", e.target.value)}
                  placeholder="e.g. HSC"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Board</label>
                <Input
                  value={form.board}
                  onChange={(e) => update("board", e.target.value)}
                  placeholder="e.g. Dhaka Board"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Institution Name</label>
                <Input
                  value={form.institution_name}
                  onChange={(e) => update("institution_name", e.target.value)}
                  placeholder="School / College / University"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Group / Major</label>
                <Input
                  value={form.group_major}
                  onChange={(e) => update("group_major", e.target.value)}
                  placeholder="Science / Business / CSE"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Passing Year</label>
                <Input
                  type="number"
                  value={form.passing_year}
                  onChange={(e) => update("passing_year", e.target.value)}
                  placeholder="2024"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Grading Scale</label>
                <Input
                  value={form.grading_scale}
                  onChange={(e) => update("grading_scale", e.target.value)}
                  placeholder="GPA 5.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Obtained Mark / GPA</label>
                <Input
                  value={form.obtained_mark}
                  onChange={(e) => update("obtained_mark", e.target.value)}
                  placeholder="4.83"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            {success && (
              <p className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="size-4" />
                {success}
              </p>
            )}

            <Button
              type="submit"
              disabled={saving || loading || candidates.length === 0}
            >
              {saving ? "Saving..." : "Save Education"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
