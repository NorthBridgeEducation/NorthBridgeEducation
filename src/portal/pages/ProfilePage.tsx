
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
type Candidate = {
  id: string;
  candidate_code: string | null;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
};

type EducationRecord = {
  id: string;
  qualification: string;
  board: string | null;
  institution_name: string | null;
  group_major: string | null;
  passing_year: number | null;
  grading_scale: string | null;
  obtained_mark: number | null;
};

type EducationForm = {
  board: string;
  institution_name: string;
  group_major: string;
  passing_year: string;
  grading_scale: string;
  obtained_mark: string;
};

const emptyForm: EducationForm = {
  board: "",
  institution_name: "",
  group_major: "",
  passing_year: "",
  grading_scale: "",
  obtained_mark: "",
};

function isSSCOrHSC(qualification: string) {
  const value = qualification.trim().toUpperCase();

  return (
    value === "SSC" ||
    value === "HSC" ||
    value.includes("SECONDARY SCHOOL") ||
    value.includes("HIGHER SECONDARY")
  );
}

function educationLabel(qualification: string) {
  const value = qualification.trim().toUpperCase();

  if (value === "SSC" || value.includes("SECONDARY SCHOOL")) {
    return "SSC";
  }

  if (value === "HSC" || value.includes("HIGHER SECONDARY")) {
    return "HSC";
  }

  return qualification;
}

export function ProfilePage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [education, setEducation] = useState<EducationRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EducationForm>(emptyForm);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Unable to verify your account. Please log in again.");
        }

        // Find the candidate linked to the logged-in Supabase user.
        const { data: candidateData, error: candidateError } =
          await supabase
            .from("candidates")
            .select(
              "id, candidate_code, first_name, last_name, date_of_birth, phone, email"
            )
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (candidateError) throw candidateError;

        if (!candidateData) {
          if (!mounted) return;
          setCandidate(null);
          setEducation([]);
          return;
        }

        // Load only this candidate's education records.
        const { data: educationData, error: educationError } =
          await supabase
            .from("candidate_education")
            .select(
              "id, qualification, board, institution_name, group_major, passing_year, grading_scale, obtained_mark"
            )
            .eq("candidate_id", candidateData.id)
            .order("passing_year", { ascending: true });

        if (educationError) throw educationError;

        if (!mounted) return;

        setCandidate(candidateData);
        setEducation(
          (educationData || []).filter((item) =>
            isSSCOrHSC(item.qualification)
          )
        );
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your profile."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  function openEdit(record: EducationRecord) {
    setError("");
    setSuccess("");
    setEditingId(record.id);

    setForm({
      board: record.board || "",
      institution_name: record.institution_name || "",
      group_major: record.group_major || "",
      passing_year: record.passing_year?.toString() || "",
      grading_scale: record.grading_scale || "",
      obtained_mark: record.obtained_mark?.toString() || "",
    });
  }

  async function saveEducation(id: string) {
    if (!candidate) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Your login session has expired.");
      }

      // Validate passing year.
      const passingYear = form.passing_year.trim()
        ? Number(form.passing_year)
        : null;

      if (
        passingYear !== null &&
        (!Number.isInteger(passingYear) ||
          passingYear < 1950 ||
          passingYear > 2100)
      ) {
        throw new Error("Please enter a valid passing year.");
      }

      // Validate obtained mark.
      const obtainedMark = form.obtained_mark.trim()
        ? Number(form.obtained_mark)
        : null;

      if (
        obtainedMark !== null &&
        !Number.isFinite(obtainedMark)
      ) {
        throw new Error("Please enter a valid obtained mark.");
      }

      // Update only the logged-in candidate's existing education record.
      const { data, error: updateError } = await supabase
        .from("candidate_education")
        .update({
          board: form.board.trim() || null,
          institution_name: form.institution_name.trim() || null,
          group_major: form.group_major.trim() || null,
          passing_year: passingYear,
          grading_scale: form.grading_scale.trim() || null,
          obtained_mark: obtainedMark,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("candidate_id", candidate.id)
        .select(
          "id, qualification, board, institution_name, group_major, passing_year, grading_scale, obtained_mark"
        )
        .single();

      if (updateError) throw updateError;

      setEducation((previous) =>
        previous.map((item) => (item.id === id ? data : item))
      );

      setEditingId(null);
      setForm(emptyForm);
      setSuccess(
        `${educationLabel(data.qualification)} information updated successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update education information."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading profile...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">ACCOUNT</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage your personal and educational information.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="rounded-lg border border-green-500/30 p-4 text-sm text-green-700"
        >
          {success}
        </p>
      )}

      {/* Personal Information */}
      <section className="max-w-3xl space-y-5 rounded-xl border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Personal Information
          </h2>
          <p className="text-sm text-muted-foreground">
            Your registered candidate information
          </p>
        </div>

        {candidate ? (
          <>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">First Name</dt>
                <dd className="mt-1 text-sm font-medium">
                  {candidate.first_name || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">Last Name</dt>
                <dd className="mt-1 text-sm font-medium">
                  {candidate.last_name || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="mt-1 text-sm font-medium">
                  {candidate.email || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="mt-1 text-sm font-medium">
                  {candidate.phone || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  Date of Birth
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {candidate.date_of_birth || "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-muted-foreground">
                  Candidate Code
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {candidate.candidate_code || "Not assigned"}
                </dd>
              </div>
            </dl>

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground">Candidate ID</p>
              <p className="mt-1 break-all text-sm font-medium">
                {candidate.id}
              </p>
            </div>
          </>
        ) : (
          
<div className="rounded-xl border border-dashed p-6 space-y-3">
  <div>
    <h3 className="font-semibold text-lg">
      Welcome to NorthBridge Education
    </h3>

    <p className="mt-1 text-sm text-muted-foreground">
      You do not have a candidate profile yet.
      Your personal information will appear here
      once you become a registered candidate.
    </p>
  </div>

  <Link
    to="/portal/application"
    className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
  >
    Apply to Become a Candidate
  </Link>
</div>

        )}
      </section>

      {/* Education Information */}
      <section className="max-w-3xl space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Educational Information
          </h2>
          <p className="text-sm text-muted-foreground">
            Your SSC and HSC academic records
          </p>
        </div>

        {candidate && (
  <section className="max-w-3xl space-y-4">
    {/* Existing Educational Information section */}
  </section>
)}

        {education.map((record) => {
          const isEditing = editingId === record.id;

          return (
            <div
              key={record.id}
              className="space-y-5 rounded-xl border bg-card p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">
                    {educationLabel(record.qualification)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Academic record
                  </p>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => openEdit(record)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Board</label>
                      <input
                        value={form.board}
                        onChange={(e) =>
                          setForm({ ...form, board: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        placeholder="e.g. Dhaka"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Institution
                      </label>
                      <input
                        value={form.institution_name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            institution_name: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        placeholder="Institution name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Group / Major
                      </label>
                      <input
                        value={form.group_major}
                        onChange={(e) =>
                          setForm({ ...form, group_major: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        placeholder="Science / Business Studies / Humanities"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Passing Year
                      </label>
                      <input
                        type="number"
                        value={form.passing_year}
                        onChange={(e) =>
                          setForm({ ...form, passing_year: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        placeholder="2024"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Grading Scale
                      </label>
                      <input
                        value={form.grading_scale}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            grading_scale: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        placeholder="GPA / Percentage"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Obtained Mark / GPA
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={form.obtained_mark}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            obtained_mark: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        placeholder="e.g. 5.00"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => saveEducation(record.id)}
                      className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setEditingId(null);
                        setForm(emptyForm);
                      }}
                      className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <dl className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Board</dt>
                    <dd className="mt-1 text-sm font-medium">
                      {record.board || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Institution
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {record.institution_name || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Group / Major
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {record.group_major || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Passing Year
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {record.passing_year ?? "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Grading Scale
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {record.grading_scale || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Obtained Mark / GPA
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {record.obtained_mark ?? "Not provided"}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
