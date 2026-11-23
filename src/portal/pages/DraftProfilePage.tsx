import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import {
  educationLevels,
  readEducationInfo,
  readPersonalInfo,
  type EducationInfo,
  type EducationLevel,
  type PersonalInfo,
} from "./CandidateProfilePage";

const steps = [
  { title: "Personal Info", description: "Name, birth date and contact number" },
  { title: "Education", description: "SSC, HSC and Bachelor" },
  { title: "Other Info", description: "Identity, family and address" },
] as const;

type Field<K extends string> = {
  key: K;
  label: string;
  type?: "text" | "date" | "tel" | "number";
};

const personalFields: Field<keyof PersonalInfo>[] = [
  { key: "given_name", label: "Given name" },
  { key: "surname", label: "Surname" },
  { key: "date_of_birth", label: "Date of birth", type: "date" },
  { key: "number", label: "Phone number", type: "tel" },
];

const otherFields: Field<keyof PersonalInfo>[] = [
  { key: "passport_number", label: "Passport number" },
  { key: "gender", label: "Gender" },
  { key: "nid_number", label: "NID number" },
  { key: "passport_date_of_issue", label: "Passport issue date", type: "date" },
  { key: "passport_date_of_expiry", label: "Passport expiry date", type: "date" },
  { key: "place_birth", label: "Place of birth" },
  { key: "fathers_name", label: "Father’s name" },
  { key: "mothers_name", label: "Mother’s name" },
  { key: "permanent_address", label: "Permanent address" },
];

const educationFields: Field<keyof EducationInfo>[] = [
  { key: "institution_name", label: "Institution" },
  { key: "board", label: "Board / University" },
  { key: "group_major", label: "Group / Major" },
  { key: "passing_year", label: "Passing year", type: "number" },
  { key: "grading_scale", label: "Grading scale" },
  { key: "obtained_mark", label: "Result / GPA", type: "number" },
];

type EducationDraft = Record<EducationLevel, EducationInfo>;

type Draft = {
  exists: boolean;
  approved: boolean;
  personal: PersonalInfo;
  education: EducationDraft;
};

type DraftProfileProps = {
  userId: string;
  email: string;
};

function hasEducation(values: EducationInfo) {
  return Object.values(values).some((value) => value.trim() !== "");
}

function readDraftEducation(
  source?: Partial<Record<EducationLevel, unknown>>,
): EducationDraft {
  return {
    SSC: readEducationInfo(source?.SSC),
    HSC: readEducationInfo(source?.HSC),
    Bachelor: readEducationInfo(source?.Bachelor),
  };
}

function FieldGrid<K extends string>({
  fields,
  values,
  onChange,
}: {
  fields: Field<K>[];
  values: Record<K, string>;
  onChange: (key: K, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(({ key, label, type }) => (
        <label key={key} className="min-w-0 space-y-1.5 text-sm font-medium">
          <span>{label}{key === "given_name" ? " *" : ""}</span>
          <Input
            type={type ?? "text"}
            value={values[key]}
            onChange={(event) => onChange(key, event.target.value)}
            required={key === "given_name"}
            min={key === "passing_year" ? 1950 : undefined}
            max={key === "passing_year" ? 2100 : undefined}
            step={key === "obtained_mark" ? "any" : undefined}
          />
        </label>
      ))}
    </div>
  );
}

export function DraftProfilePage({ userId, email }: DraftProfileProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [personal, setPersonal] = useState(() => readPersonalInfo(null));
  const [education, setEducation] = useState(() => readDraftEducation());
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const { data, error } = await supabase
        .from("draft")
        .select("*")
        .eq("user_id", userId)
        .abortSignal(controller.signal)
        .maybeSingle();

      if (controller.signal.aborted) return;

      if (error) {
        setLoadError("Could not load your profile draft.");
        return;
      }

      const savedPersonal = readPersonalInfo(data);
      const savedEducation = readDraftEducation(data?.education);

      setPersonal(savedPersonal);
      setEducation(savedEducation);
      setDraft({
        exists: Boolean(data),
        approved: data?.status === "approved",
        personal: savedPersonal,
        education: savedEducation,
      });
    }

    void load();
    return () => controller.abort();
  }, [userId]);

  function changeStep(nextStep: number) {
    setStep(nextStep);
    setSaveError("");
    setNotice("");
  }

  async function saveStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || draft.approved || saving) return;

    setSaveError("");
    setNotice("");

    if (step === 0 && !personal.given_name.trim()) {
      setSaveError("Enter your given name.");
      return;
    }

    if (!draft.exists && step !== 0) {
      setSaveError("Save Personal Info first to create your draft.");
      return;
    }

    setSaving(true);

    try {
      const fields = step === 0 ? personalFields : otherFields;
      const sectionValues = Object.fromEntries(
        fields.map(({ key }) => [key, personal[key].trim() || null]),
      );

      const changes = {
        ...(step === 1 ? { education } : sectionValues),
        updated_at: new Date().toISOString(),
      };

      if (draft.exists) {
        const { data, error } = await supabase
          .from("draft")
          .update(changes)
          .eq("user_id", userId)
          .or("status.is.null,status.neq.approved")
          .select("user_id")
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("This draft could not be updated. Reload the page.");
      } else {
        const { error } = await supabase.from("draft").insert({
          ...changes,
          user_id: userId,
          status: "draft",
        });

        if (error) throw error;
      }

      setDraft({
        ...draft,
        exists: true,
        personal: step === 1
          ? draft.personal
          : readPersonalInfo({ ...draft.personal, ...sectionValues }),
        education: step === 1 ? education : draft.education,
      });

      if (step < steps.length - 1) setStep(step + 1);
      setNotice(`${steps[step].title} saved to your draft.`);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "23505") {
        setSaveError("A draft already exists. Reload the page before saving.");
      } else {
        setSaveError(error instanceof Error ? error.message : "Could not save your draft.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <p role="alert" className="text-destructive">{loadError}</p>;
  if (!draft) return <p role="status">Loading your profile draft…</p>;

  const savedLevels = educationLevels.filter((level) => hasEducation(draft.education[level]));
  const sectionStatus = [
    draft.personal.given_name.trim() ? "Saved" : "Not added",
    `${savedLevels.length} of ${educationLevels.length} added`,
    otherFields.some(({ key }) => draft.personal[key].trim()) ? "Saved" : "Not added",
  ];

  function changePersonal(key: keyof PersonalInfo, value: string) {
    setPersonal((previous) => ({ ...previous, [key]: value }));
    setNotice("");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Profile Draft</h1>
        <p className="text-sm text-muted-foreground">
          {draft.approved
            ? "Your draft has been approved. You can review the saved information below."
            : `Step ${step + 1} of ${steps.length}. Save each section as you go.`}
        </p>
      </header>

      <nav aria-label="Profile draft steps">
        <ol className="grid gap-2 sm:grid-cols-3">
          {steps.map(({ title }, index) => (
            <li key={title}>
              <button
                type="button"
                aria-current={step === index ? "step" : undefined}
                disabled={saving || (!draft.exists && index > 0)}
                onClick={() => changeStep(index)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                  "focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50",
                  step === index ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/60",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    step === index ? "bg-primary text-primary-foreground" : "bg-muted",
                  ].join(" ")}
                >
                  {index + 1}
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-sm text-muted-foreground">
                    {sectionStatus[index]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <form
        key={step}
        onSubmit={saveStep}
        aria-labelledby="draft-step-heading"
        className="space-y-5 rounded-xl border bg-card p-4 sm:p-6"
      >
        <div>
          <h2 id="draft-step-heading" className="text-lg font-semibold">
            {steps[step].title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {steps[step].description}
          </p>
        </div>

        <fieldset disabled={saving || draft.approved} className="min-w-0 space-y-4">
          {step === 0 && (
            <>
              <FieldGrid fields={personalFields} values={personal} onChange={changePersonal} />
              <label className="block space-y-1.5 text-sm font-medium">
                <span>Account email</span>
                <Input type="email" value={email} readOnly />
              </label>
            </>
          )}

          {step === 1 && educationLevels.map((level) => {
            const changed = educationFields.some(
              ({ key }) => education[level][key] !== draft.education[level][key],
            );

            return (
              <section key={level} className="space-y-4 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{level}</h3>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {changed ? "Unsaved changes" : savedLevels.includes(level) ? "Saved" : "Not added"}
                  </span>
                </div>

                <FieldGrid
                  fields={educationFields}
                  values={education[level]}
                  onChange={(key, value) => {
                    setEducation((previous) => ({
                      ...previous,
                      [level]: { ...previous[level], [key]: value },
                    }));
                    setNotice("");
                  }}
                />
              </section>
            );
          })}

          {step === 2 && (
            <FieldGrid fields={otherFields} values={personal} onChange={changePersonal} />
          )}
        </fieldset>

        {saveError && (
          <p role="alert" className="text-sm text-destructive">{saveError}</p>
        )}
        {notice && (
          <p role="status" className="text-sm text-muted-foreground">{notice}</p>
        )}

        {(step > 0 || !draft.approved) && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => changeStep(step - 1)}
              >
                Back
              </Button>
            )}

            {!draft.approved && (
              <Button type="submit" disabled={saving} className="ml-auto">
                {saving ? "Saving…" : step === 2 ? "Save draft" : "Save and continue"}
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}