
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Country = {
  id: string;
  name: string;
};

type University = {
  id: string;
  name: string;
  country_id: string;
};

type Program = {
  id: string;
  name: string;
  degree_level: string;
  description: string | null;
  university_id: string;
};

type Candidate = {
  id: string;
};

type Application = {
  id: string;
  status: string;
  submitted_at: string;
  program: {
    name: string;
    degree_level: string;
    university: {
      name: string;
      country: {
        name: string;
      } | null;
    } | null;
  } | null;
};

export function ApplicationPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  const [countryId, setCountryId] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [programId, setProgramId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in again to continue.");
      }

      // Find candidate linked to logged-in user
      const { data: candidateData, error: candidateError } =
        await supabase
          .from("candidates")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

      if (candidateError) throw candidateError;

      if (!candidateData) {
        setCandidate(null);
        return;
      }

      setCandidate(candidateData);

      // Load active countries and candidate applications
      const [countryResult, applicationResult] = await Promise.all([
        supabase
          .from("countries")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),

        supabase
          .from("program_applications")
          .select(`
            id,
            status,
            submitted_at,
            program:programs (
              name,
              degree_level,
              university:universities (
                name,
                country:countries (name)
              )
            )
          `)
          .eq("candidate_id", candidateData.id)
          .order("submitted_at", { ascending: false }),
      ]);

      if (countryResult.error) throw countryResult.error;
      if (applicationResult.error) throw applicationResult.error;

      setCountries(countryResult.data || []);
      setApplications(
        (applicationResult.data || []) as unknown as Application[]
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  // Load universities when country changes
  useEffect(() => {
    async function loadUniversities() {
      setUniversityId("");
      setProgramId("");
      setUniversities([]);
      setPrograms([]);

      if (!countryId) return;

      const { data, error: queryError } = await supabase
        .from("universities")
        .select("id, name, country_id")
        .eq("country_id", countryId)
        .eq("is_active", true)
        .order("name");

      if (queryError) {
        setError(queryError.message);
        return;
      }

      setUniversities(data || []);
    }

    void loadUniversities();
  }, [countryId]);

  // Load programs when university changes
  useEffect(() => {
    async function loadPrograms() {
      setProgramId("");
      setPrograms([]);

      if (!universityId) return;

      const { data, error: queryError } = await supabase
        .from("programs")
        .select("id, name, degree_level, description, university_id")
        .eq("university_id", universityId)
        .eq("is_active", true)
        .order("degree_level")
        .order("name");

      if (queryError) {
        setError(queryError.message);
        return;
      }

      setPrograms(data || []);
    }

    void loadPrograms();
  }, [universityId]);

  async function submitApplication() {
    if (!candidate || !programId) {
      setError("Please select a program.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: insertError } = await supabase
        .from("program_applications")
        .insert({
          candidate_id: candidate.id,
          program_id: programId,
          status: "Submitted",
        })
        .select("id, status, submitted_at")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error(
            "You have already applied to this program."
          );
        }

        throw insertError;
      }

      const selectedProgram = programs.find(
        (program) => program.id === programId
      );

      const selectedUniversity = universities.find(
        (university) => university.id === universityId
      );

      const selectedCountry = countries.find(
        (country) => country.id === countryId
      );

      if (
        selectedProgram &&
        selectedUniversity &&
        selectedCountry
      ) {
        setApplications((previous) => [
          {
            ...data,
            program: {
              name: selectedProgram.name,
              degree_level: selectedProgram.degree_level,
              university: {
                name: selectedUniversity.name,
                country: {
                  name: selectedCountry.name,
                },
              },
            },
          },
          ...previous,
        ]);
      }

      setSuccess(
        "Your application has been submitted successfully."
      );

      setCountryId("");
      setUniversityId("");
      setProgramId("");
      setUniversities([]);
      setPrograms([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Application submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading your applications...
      </p>
    );
  }

  if (!candidate) {
    return (
      <section className="max-w-2xl space-y-3 rounded-xl border border-dashed p-6">
        <h1 className="text-xl font-semibold">
          My Applications
        </h1>

        <p className="text-sm text-muted-foreground">
          Your account is not linked to a registered candidate
          profile yet. Please contact NorthBridge Education to
          complete your candidate registration before applying
          to programs.
        </p>
      </section>
    );
  }

  const selectedProgram = programs.find(
    (program) => program.id === programId
  );

  return (
    <section className="max-w-5xl space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-sm text-muted-foreground">
          STUDENT PORTAL
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          My Applications
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Explore universities and submit applications to your
          preferred programs.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Success Message */}
      {success && (
        <p
          role="status"
          className="rounded-lg border border-green-500/30 p-3 text-sm text-green-700"
        >
          {success}
        </p>
      )}

      {/* Find a Program */}
      <div className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Find a Program
          </h2>

          <p className="text-sm text-muted-foreground">
            Select a country and university to explore available
            programs.
          </p>
        </div>

        {/* Country and University */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Country
            </label>

            <select
              value={countryId}
              onChange={(event) => {
                setError("");
                setCountryId(event.target.value);
              }}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select country</option>

              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              University
            </label>

            <select
              value={universityId}
              onChange={(event) => {
                setError("");
                setUniversityId(event.target.value);
              }}
              disabled={!countryId}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select university</option>

              {universities.map((university) => (
                <option
                  key={university.id}
                  value={university.id}
                >
                  {university.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Available Programs Grid */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">
              Available Programs
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Select a program card to continue.
            </p>
          </div>

          {!countryId ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Select a country to explore universities and
                available programs.
              </p>
            </div>
          ) : !universityId ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Select a university to view its available programs.
              </p>
            </div>
          ) : programs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="font-medium">
                No programs available
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                There are currently no active programs for this
                university.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((program) => {
                const selected = programId === program.id;

                return (
                  <button
                    key={program.id}
                    type="button"
                    onClick={() => {
                      setProgramId(program.id);
                      setError("");
                      setSuccess("");
                    }}
                    aria-pressed={selected}
                    className={`group relative flex min-h-[170px] flex-col rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/50 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-semibold leading-snug">
                          {program.name}
                        </h4>

                        <span className="mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {program.degree_level}
                        </span>
                      </div>

                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </div>

                    {program.description && (
                      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                        {program.description}
                      </p>
                    )}

                    <div className="mt-auto pt-4">
                      <span
                        className={`text-xs font-semibold ${
                          selected
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-primary"
                        }`}
                      >
                        {selected
                          ? "Selected"
                          : "Select Program →"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Program Information */}
        {selectedProgram && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs font-medium text-primary">
              SELECTED PROGRAM
            </p>

            <h3 className="mt-1 font-semibold">
              {selectedProgram.name}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {selectedProgram.degree_level}
            </p>

            {selectedProgram.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedProgram.description}
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end border-t pt-4">
          <button
            type="button"
            onClick={submitApplication}
            disabled={!programId || submitting}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : "Submit Application"}
          </button>
        </div>
      </div>

      {/* Candidate Applications */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Your Applications
          </h2>

          <p className="text-sm text-muted-foreground">
            Track the status of each program application separately.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">
              No applications yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Choose an available program above to submit your
              first application.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {applications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold">
                    {application.program?.name || "Program"}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {application.program?.university?.name ||
                      "University"}
                    {" · "}
                    {application.program?.university?.country?.name ||
                      "Country"}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {application.program?.degree_level || ""}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted:{" "}
                    {new Date(
                      application.submitted_at
                    ).toLocaleDateString()}
                  </p>
                </div>

                <span className="w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold">
                  {application.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
