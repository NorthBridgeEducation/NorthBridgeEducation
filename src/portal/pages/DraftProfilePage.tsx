
import { useEffect, useState, type FormEvent } from "react";
import {
  ContactRound,
  GraduationCap,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";

import { DraftDocumentsStep } from "./DraftDocumentsStep";

import {
  educationLevels,
  readEducationInfo,
  readPersonalInfo,
  type EducationInfo,
  type EducationLevel,
  type PersonalInfo,
} from "./CandidateProfilePage";

// Study levels
const studentTypes = [
  {
    value: "bachelor",
    label: "Bachelor",
    description: "Undergraduate studies",
    icon: GraduationCap,
  },
  {
    value: "master",
    label: "Master's",
    description: "Postgraduate studies",
    icon: BookOpen,
  },
  {
    value: "phd",
    label: "PhD",
    description: "Doctoral studies",
    icon: BookOpenCheck,
  },
] as const;

type StudentType = (typeof studentTypes)[number]["value"];

type PassportInfo = PersonalInfo & {
  student_type: StudentType | "";
};

// Profile draft steps
const steps = [
  {
    title: "Passport Information",
    description: "Personal, passport and contact details",
  },
  {
    title: "Education",
    description: "Your academic qualifications",
  },
  {
    title: "Documents",
    description: "Optional supporting documents",
  },
] as const;

type Field<K extends string> = {
  key: K;
  label: string;
  type?: "text" | "date" | "tel" | "number" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
};

// Personal details
const personalFields: Field<keyof PersonalInfo>[] = [
  {
    key: "given_name",
    label: "Given name",
    placeholder: "As shown in passport",
    required: true,
  },
  {
    key: "surname",
    label: "Surname",
    placeholder: "As shown in passport",
  },
  {
    key: "date_of_birth",
    label: "Date of birth",
    type: "date",
  },
  {
    key: "gender",
    label: "Gender",
    type: "select",
  },
  {
    key: "place_birth",
    label: "Place of birth",
    placeholder: "Enter place of birth",
  },
  {
    key: "nid_number",
    label: "NID number",
    placeholder: "Enter national ID number",
  },
];

// Passport details
const passportFields: Field<keyof PersonalInfo>[] = [
  {
    key: "passport_number",
    label: "Passport number",
    placeholder: "Enter passport number",
  },
  {
    key: "passport_date_of_issue",
    label: "Date of issue",
    type: "date",
  },
  {
    key: "passport_date_of_expiry",
    label: "Date of expiry",
    type: "date",
  },
];

// Family and contact information
const familyFields: Field<keyof PersonalInfo>[] = [
  {
    key: "fathers_name",
    label: "Father's name",
    placeholder: "Enter father's full name",
  },
  {
    key: "mothers_name",
    label: "Mother's name",
    placeholder: "Enter mother's full name",
  },
  {
    key: "number",
    label: "Phone number",
    type: "tel",
    placeholder: "+880",
  },
  {
    key: "permanent_address",
    label: "Permanent address",
    type: "textarea",
    placeholder: "Enter your full permanent address",
  },
];

const allPassportFields = [
  ...personalFields,
  ...passportFields,
  ...familyFields,
];

// Existing education fields
const educationFields: Field<keyof EducationInfo>[] = [
  { key: "institution_name", label: "Institution" },
  { key: "board", label: "Board / University" },
  { key: "group_major", label: "Group / Major" },
  {
    key: "passing_year",
    label: "Passing year",
    type: "number",
  },
  { key: "grading_scale", label: "Grading scale" },
  {
    key: "obtained_mark",
    label: "Result / GPA",
    type: "number",
  },
];

type EducationDraft = Record<EducationLevel, EducationInfo>;

type Draft = {
  exists: boolean;
  approved: boolean;
  personal: PassportInfo;
  education: EducationDraft;
};

type DraftProfileProps = {
  userId: string;
  email: string;
};

// Read existing passport data from Supabase
function readPassportInfo(source: unknown): PassportInfo {
  const row =
    source && typeof source === "object"
      ? (source as Record<string, unknown>)
      : {};

  const studentType =
    studentTypes.find((item) => item.value === row.student_type)
      ?.value ?? "";

  return {
    ...readPersonalInfo(source),
    student_type: studentType,
  };
}

function hasEducation(values: EducationInfo) {
  return Object.values(values).some(
    (value) => value.trim() !== "",
  );
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

// Reusable responsive form fields
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const {
          key,
          label,
          type,
          placeholder,
          required,
        } = field;

        return (
          <label
            key={key}
            className={[
              "block min-w-0 space-y-2 text-sm font-medium",
              type === "textarea" ? "sm:col-span-2" : "",
            ].join(" ")}
          >
            <span>
              {label}
              {required && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </span>

            {type === "textarea" ? (
              <Textarea
                value={values[key]}
                placeholder={placeholder}
                required={required}
                rows={3}
                className="min-h-24 resize-y text-base sm:text-sm"
                onChange={(event) =>
                  onChange(key, event.target.value)
                }
              />
            ) : type === "select" ? (
              <select
                value={values[key]}
                required={required}
                onChange={(event) =>
                  onChange(key, event.target.value)
                }
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="X">X / Other</option>

                {values[key] &&
                  !["Male", "Female", "X"].includes(values[key]) && (
                    <option value={values[key]}>
                      {values[key]}
                    </option>
                  )}
              </select>
            ) : (
              <Input
                type={type ?? "text"}
                value={values[key]}
                placeholder={placeholder}
                required={required}
                className="h-11 min-w-0 text-base sm:text-sm"
                onChange={(event) =>
                  onChange(key, event.target.value)
                }
                min={key === "passing_year" ? 1950 : undefined}
                max={key === "passing_year" ? 2100 : undefined}
                step={key === "obtained_mark" ? "any" : undefined}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="font-semibold">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export function DraftProfilePage({
  userId,
  email,
}: DraftProfileProps) {
  const [draft, setDraft] = useState<Draft | null>(null);

  const [personal, setPersonal] = useState(() =>
    readPassportInfo(null),
  );

  const [education, setEducation] = useState(() =>
    readDraftEducation(),
  );

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  // Load saved draft
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

      const savedPersonal = readPassportInfo(data);
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
    if (!draft || saving) return;

    if (
      nextStep > 0 &&
      !draft.approved &&
      (!draft.exists ||
        !draft.personal.given_name.trim() ||
        !draft.personal.student_type)
    ) {
      setSaveError("Please save Passport Information first.");
      return;
    }

    setStep(nextStep);
    setSaveError("");
    setNotice("");
  }

  function changePersonal(
    key: keyof PersonalInfo,
    value: string,
  ) {
    setPersonal((previous) => ({
      ...previous,
      [key]: value,
    }));

    setNotice("");
  }

  function changeStudentType(value: StudentType) {
    setPersonal((previous) => ({
      ...previous,
      student_type: value,
    }));

    setNotice("");
  }

  // Save current section to Supabase
  async function saveStep(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!draft || draft.approved || saving) return;
    if (step !== 0 && step !== 1) return;

    setSaveError("");
    setNotice("");

    if (step === 0) {
      if (!personal.given_name.trim()) {
        setSaveError("Enter your given name.");
        return;
      }

      if (!personal.student_type) {
        setSaveError("Please select your intended level of study.");
        return;
      }

      if (
        personal.passport_date_of_issue &&
        personal.passport_date_of_expiry &&
        personal.passport_date_of_expiry <=
          personal.passport_date_of_issue
      ) {
        setSaveError(
          "Passport expiry date must be after the issue date.",
        );
        return;
      }
    }

    if (
      step === 1 &&
      (!draft.exists ||
        !draft.personal.given_name.trim() ||
        !draft.personal.student_type)
    ) {
      setSaveError("Save Passport Information first.");
      return;
    }

    setSaving(true);

    try {
      const passportValues = Object.fromEntries(
        allPassportFields.map(({ key }) => [
          key,
          personal[key].trim() || null,
        ]),
      );

      const changes =
        step === 0
          ? {
              ...passportValues,
              student_type: personal.student_type,
              updated_at: new Date().toISOString(),
            }
          : {
              education,
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

        if (!data) {
          throw new Error(
            "This draft could not be updated. Reload the page.",
          );
        }
      } else {
        const { error } = await supabase
          .from("draft")
          .insert({
            ...changes,
            user_id: userId,
            status: "draft",
          });

        if (error) throw error;
      }

      setDraft({
        ...draft,
        exists: true,
        personal:
          step === 0
            ? readPassportInfo(changes)
            : draft.personal,
        education:
          step === 1 ? education : draft.education,
      });

      setNotice(`${steps[step].title} saved successfully.`);

      if (step < steps.length - 1) {
        setStep(step + 1);
      }
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        setSaveError(
          "A draft already exists. Reload the page before saving.",
        );
      } else {
        setSaveError(
          error &&
            typeof error === "object" &&
            "message" in error
            ? String(error.message)
            : "Could not save your draft.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {loadError}
      </p>
    );
  }

  if (!draft) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading your profile draft...
      </p>
    );
  }

  const savedLevels = educationLevels.filter((level) =>
    hasEducation(draft.education[level]),
  );

  const passportSaved =
    Boolean(draft.personal.given_name.trim()) &&
    Boolean(draft.personal.student_type);

  const sectionStatus = [
    passportSaved
      ? "Saved"
      : draft.personal.given_name.trim()
        ? "Incomplete"
        : "Not added",

    `${savedLevels.length} of ${educationLevels.length} added`,

    "Optional",
  ];

  const selectedStudentType = studentTypes.find(
    (item) => item.value === draft.personal.student_type,
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-5">

      {/* Page header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          My Profile Draft
        </h1>

        <p className="text-sm text-muted-foreground">
          {draft.approved
            ? "Your profile draft has been approved."
            : `Step ${step + 1} of ${steps.length}. Save each section as you go.`}
        </p>
      </header>

      {/* Step navigation */}
      <nav aria-label="Profile draft steps">
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {steps.map(({ title }, index) => (
            <li key={title}>
              <button
                type="button"
                aria-current={
                  step === index ? "step" : undefined
                }
                disabled={
                  saving ||
                  (index > 0 &&
                    !draft.approved &&
                    (!draft.exists || !passportSaved))
                }
                onClick={() => changeStep(index)}
                className={[
                  "flex h-full w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "focus-visible:outline-2 focus-visible:outline-ring",
                  step === index
                    ? "border-primary bg-primary/5"
                    : "bg-card hover:bg-muted/60",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    step === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  ].join(" ")}
                >
                  {index + 1}
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {title}
                  </span>

                  <span className="block text-xs text-muted-foreground">
                    {sectionStatus[index]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {notice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm"
        >
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          {notice}
        </div>
      )}

      {/* Step 3: Existing documents component */}
      {step === 2 ? (
        <DraftDocumentsStep
          userId={userId}
          readOnly={draft.approved}
          onBack={() => changeStep(1)}
        />
      ) : (
        <form
          key={step}
          onSubmit={saveStep}
          className="space-y-6 rounded-xl border bg-card p-4 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              {step === 0 ? (
                <ContactRound className="size-5" />
              ) : (
                <GraduationCap className="size-5" />
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                {steps[step].title}
              </h2>

              <p className="text-sm text-muted-foreground">
                {steps[step].description}
              </p>
            </div>
          </div>

          <fieldset
            disabled={saving || draft.approved}
            className="min-w-0 space-y-6"
          >

            {/* Step 1: Passport information */}
            {step === 0 && (
              <>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Please enter your information exactly as it
                  appears in your passport.
                </div>

                {/* Personal details */}
                <section className="space-y-4">
                  <SectionHeading
                    title="Personal details"
                    description="Basic identity information."
                  />

                  <FieldGrid
                    fields={personalFields}
                    values={personal}
                    onChange={changePersonal}
                  />
                </section>

                {/* Passport details */}
                <section className="space-y-4 border-t pt-5">
                  <SectionHeading
                    title="Passport details"
                    description="Information from your current passport."
                  />

                  <FieldGrid
                    fields={passportFields}
                    values={personal}
                    onChange={changePersonal}
                  />
                </section>

                {/* Family and contact details */}
                <section className="space-y-4 border-t pt-5">
                  <SectionHeading
                    title="Family and contact information"
                    description="Family details and permanent address."
                  />

                  <FieldGrid
                    fields={familyFields}
                    values={personal}
                    onChange={changePersonal}
                  />

                  <label className="block space-y-2 text-sm font-medium">
                    <span>Account email</span>

                    <Input
                      type="email"
                      value={email}
                      readOnly
                      className="h-11 bg-muted/50 text-base sm:text-sm"
                    />

                    <p className="text-xs font-normal text-muted-foreground">
                      Linked to your registered account.
                    </p>
                  </label>
                </section>

                {/* Student type selection */}
                <section className="space-y-4 border-t pt-5">
                  <SectionHeading
                    title="What level of study are you applying for? *"
                    description="Your selection will determine the academic information required in the next section."
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {studentTypes.map((item) => {
                      const Icon = item.icon;
                      const selected =
                        personal.student_type === item.value;

                      return (
                        <label
                          key={item.value}
                          className={[
                            "relative flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                            "focus-within:ring-2 focus-within:ring-ring",
                            "sm:flex-col sm:items-start",
                            selected
                              ? "border-primary bg-primary/5"
                              : "bg-card hover:bg-muted/40",
                          ].join(" ")}
                        >
                          <input
                            type="radio"
                            name="student_type"
                            value={item.value}
                            checked={selected}
                            required
                            onChange={() =>
                              changeStudentType(item.value)
                            }
                            className="sr-only"
                          />

                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="size-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold">
                              {item.label}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>

                          {selected ? (
                            <CheckCircle2 className="size-5 shrink-0 text-primary sm:absolute sm:right-3 sm:top-3" />
                          ) : (
                            <span className="size-5 shrink-0 rounded-full border border-muted-foreground/40 sm:absolute sm:right-3 sm:top-3" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {/* Step 2: Education */}
            {step === 1 && (
              <>
                {selectedStudentType && (
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                    <GraduationCap className="size-5 shrink-0" />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Intended level of study
                      </p>

                      <p className="text-sm font-semibold">
                        {selectedStudentType.label}
                      </p>
                    </div>
                  </div>
                )}

                {educationLevels.map((level) => {
                  const changed = educationFields.some(
                    ({ key }) =>
                      education[level][key] !==
                      draft.education[level][key],
                  );

                  return (
                    <section
                      key={level}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold">
                          {level}
                        </h3>

                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {changed
                            ? "Unsaved changes"
                            : savedLevels.includes(level)
                              ? "Saved"
                              : "Not added"}
                        </span>
                      </div>

                      <FieldGrid
                        fields={educationFields}
                        values={education[level]}
                        onChange={(key, value) => {
                          setEducation((previous) => ({
                            ...previous,
                            [level]: {
                              ...previous[level],
                              [key]: value,
                            },
                          }));

                          setNotice("");
                        }}
                      />
                    </section>
                  );
                })}
              </>
            )}
          </fieldset>

          {saveError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {saveError}
            </div>
          )}

          {/* Form actions */}
          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => changeStep(step - 1)}
                className="h-11 w-full sm:w-auto"
              >
                Back
              </Button>
            )}

            {!draft.approved && (
              <Button
                type="submit"
                disabled={saving}
                className="h-11 w-full sm:ml-auto sm:w-auto"
              >
                {saving ? "Saving..." : "Save and continue"}

                {!saving && <ArrowRight className="size-4" />}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
