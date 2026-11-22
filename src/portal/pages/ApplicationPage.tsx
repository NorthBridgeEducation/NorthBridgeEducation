
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
      };
    };
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
      setApplications((applicationResult.data || []) as unknown as Application[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load applications."
      );
    } finally {
      setLoading(false);
    }
  }

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

      if (selectedProgram && selectedUniversity && selectedCountry) {
        setApplications((previous) => [
          {
            ...data,
            program: {
              name: selectedProgram.name,
              degree_level: selectedProgram.degree_level,
              university: {
                name: selectedUniversity.name,
                country: { name: selectedCountry.name },
              },
            },
          },
          ...previous,
        ]);
      }

      setSuccess("Your application has been submitted successfully.");

      setCountryId("");
      setUniversityId("");
      setProgramId("");
      setUniversities([]);
      setPrograms([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Application submission failed."
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
        <h1 className="text-xl font-semibold">My Applications</h1>
        <p className="text-sm text-muted-foreground">
          Your account is not linked to a registered candidate profile yet.
          Please contact NorthBridge Education to complete your candidate
          registration before applying to programs.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">STUDENT PORTAL</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          My Applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore universities and submit applications to your preferred
          programs.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="rounded-lg border border-green-500/30 p-3 text-sm text-green-700"
        >
          {success}
        </p>
      )}

      <div className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">Find a Program</h2>
          <p className="text-sm text-muted-foreground">
            Select a destination, university and program.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <select
              value={countryId}
              onChange={(event) => setCountryId(event.target.value)}
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
            <label className="text-sm font-medium">University</label>
            <select
              value={universityId}
              onChange={(event) => setUniversityId(event.target.value)}
              disabled={!countryId}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-50"
            >
              <option value="">Select university</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Program</label>
            <select
              value={programId}
              onChange={(event) => setProgramId(event.target.value)}
              disabled={!universityId}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-50"
            >
              <option value="">Select program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name} ({program.degree_level})
                </option>
              ))}
            </select>
          </div>
        </div>

        {programs.find((program) => program.id === programId)?.description && (
          <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            {programs.find((program) => program.id === programId)?.description}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={submitApplication}
            disabled={!programId || submitting}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Your Applications</h2>
          <p className="text-sm text-muted-foreground">
            Each program application is tracked separately.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">No applications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a program above to submit your first application.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium">
                    {application.program?.name || "Program"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {application.program?.university?.name || "University"}
                    {" · "}
                    {application.program?.university?.country?.name || "Country"}
                    {" · "}
                    {application.program?.degree_level || ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted:{" "}
                    {new Date(application.submitted_at).toLocaleDateString()}
                  </p>
                </div>

                <span className="w-fit rounded-full border px-3 py-1 text-xs font-medium">
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
