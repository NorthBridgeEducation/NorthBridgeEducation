import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

export const educationLevels = ["SSC", "HSC", "Bachelor"] as const;

export type EducationLevel = (typeof educationLevels)[number];

const personalFields = [
  { key: "given_name", label: "Given name" },
  { key: "surname", label: "Surname" },
  { key: "date_of_birth", label: "Date of birth", type: "date" },
  { key: "number", label: "Phone number", type: "tel" },
] as const;

export const otherFields = [
  { key: "passport_number", label: "Passport number" },
  { key: "gender", label: "Gender" },
  { key: "nid_number", label: "NID number" },
  { key: "passport_date_of_issue", label: "Passport issue date", type: "date" },
  { key: "passport_date_of_expiry", label: "Passport expiry date", type: "date" },
  { key: "place_birth", label: "Place of birth" },
  { key: "fathers_name", label: "Father’s name" },
  { key: "mothers_name", label: "Mother’s name" },
  { key: "permanent_address", label: "Permanent address" },
] as const;

const educationFields = [
  { key: "institution_name", label: "Institution" },
  { key: "board", label: "Board / University" },
  { key: "group_major", label: "Group / Major" },
  { key: "passing_year", label: "Passing year", type: "number" },
  { key: "grading_scale", label: "Grading scale" },
  { key: "obtained_mark", label: "Result / GPA", type: "number" },
] as const;

type Field = {
  key: string;
  label: string;
  type?: "date" | "tel" | "number";
};

type PersonalKey = (typeof personalFields)[number]["key"];
type OtherKey = (typeof otherFields)[number]["key"];
type EducationKey = (typeof educationFields)[number]["key"];

export type PersonalInfo = Record<PersonalKey | OtherKey, string>;
export type EducationInfo = Record<EducationKey, string>;

export type EducationEntry = {
  id?: string;
  values: EducationInfo;
};

export type EducationSections = Record<EducationLevel, EducationEntry[]>;

export function readFields<K extends string>(
  fields: readonly { key: K }[],
  source: unknown,
): Record<K, string> {
  const row = source && typeof source === "object"
    ? (source as Record<string, unknown>)
    : {};

  return Object.fromEntries(
    fields.map(({ key }) => {
      const value = row[key];
      return [key, typeof value === "string" || typeof value === "number"
        ? String(value)
        : ""];
    }),
  ) as Record<K, string>;
}

export function readPersonalInfo(source: unknown): PersonalInfo {
  return {
    ...readFields(personalFields, source),
    ...readFields(otherFields, source),
  };
}

export function readEducationInfo(source: unknown): EducationInfo {
  return readFields(educationFields, source);
}

export function emptyEducationSections(): EducationSections {
  return {
    SSC: [{ values: readEducationInfo(null) }],
    HSC: [{ values: readEducationInfo(null) }],
    Bachelor: [{ values: readEducationInfo(null) }],
  };
}

function qualificationLevel(qualification: string): EducationLevel | undefined {
  const value = qualification.trim().toLowerCase();

  if (value.includes("bachelor")) return "Bachelor";

  if (/^(?:hsc|higher secondary)(?:\s|$)/.test(value)) return "HSC";

  if (/^(?:ssc|secondary school)(?:\s|$)/.test(value)) return "SSC";

  return undefined;
}

function FieldInput({
  field,
  value,
  onChange,
  required,
}: {
  field: Field;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block min-w-0 space-y-1.5 text-sm font-medium">
      <span>{field.label}</span>
      <Input
        type={field.type ?? "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={field.key === "passing_year" ? 1950 : undefined}
        max={field.key === "passing_year" ? 2100 : undefined}
        step={field.key === "obtained_mark" ? "any" : undefined}
      />
    </label>
  );
}

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Something went wrong. Please try again.";
}

type ProfileFormProps = {
  title: string;
  description: string;
  email: string;
  initialPersonal: PersonalInfo;
  initialEducation: EducationSections;
  savePersonal: (values: PersonalInfo) => Promise<void>;
  saveEducation: (
    level: EducationLevel,
    entry: EducationEntry,
  ) => Promise<EducationEntry>;
  draft?: boolean;
  readOnly?: boolean;
};

export function ProfileForm({
  title,
  description,
  email,
  initialPersonal,
  initialEducation,
  savePersonal,
  saveEducation,
  draft = false,
  readOnly = false,
}: ProfileFormProps) {
  const [personal, setPersonal] = useState(initialPersonal);
  const [education, setEducation] = useState(initialEducation);
  const [edit, setEdit] = useState<{
    section: string;
    restore: () => void;
  } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    section: string;
    text: string;
    error: boolean;
  } | null>(null);

  async function saveSection(
    event: FormEvent<HTMLFormElement>,
    section: string,
    save: () => Promise<void>,
  ) {
    event.preventDefault();
    if (saving || readOnly || edit?.section !== section) return;

    setSaving(section);
    setNotice(null);

    try {
      await save();
      setEdit(null);
      setNotice({
        section,
        text: draft ? "Draft saved." : "Changes saved.",
        error: false,
      });
    } catch (error) {
      setNotice({ section, text: errorMessage(error), error: true });
    } finally {
      setSaving(null);
    }
  }

  function feedback(section: string) {
    if (notice?.section !== section) return null;

    return (
      <p
        role={notice.error ? "alert" : "status"}
        className={notice.error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
      >
        {notice.text}
      </p>
    );
  }

  function personalInputs(fields: readonly (Field & { key: keyof PersonalInfo })[]) {
    return fields.map((field) => (
      <FieldInput
        key={field.key}
        field={field}
        value={personal[field.key]}
        required={field.key === "given_name"}
        onChange={(value) =>
          setPersonal((previous) => ({ ...previous, [field.key]: value }))
        }
      />
    ));
  }

  const disabled = readOnly || saving !== null;
  const buttonLabel = draft ? "Save draft" : "Save changes";

  function sectionHeader(title: string, section: string, restore: () => void) {
    return (
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {!readOnly && edit?.section !== section && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || edit !== null}
            aria-label={`Edit ${title}`}
            onClick={() => {
              setNotice(null);
              setEdit({ section, restore });
            }}
          >
            Edit
          </Button>
        )}
      </div>
    );
  }

  function sectionActions(section: string, label = buttonLabel) {
    return (
      <>
        {feedback(section)}
        {!readOnly && edit?.section === section && (
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={disabled}>
              {saving === section ? "Saving…" : label}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                edit.restore();
                setEdit(null);
                setNotice(null);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </>
    );
  }

  function displayField(label: string, value: string) {
    return (
      <div key={label} className="min-w-0 space-y-1">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="whitespace-pre-wrap break-words text-sm font-medium">
          {value || "—"}
        </dd>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <form
        className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
        onSubmit={(event) =>
          void saveSection(event, "personal", () => savePersonal(personal))
        }
      >
        {sectionHeader("Personal Info", "personal", () => setPersonal(personal))}
        {!readOnly && edit?.section === "personal" ? (
          <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
            {personalInputs(personalFields)}
            <label className="block min-w-0 space-y-1.5 text-sm font-medium">
              <span>Account email</span>
              <Input type="email" value={email} readOnly />
            </label>
          </fieldset>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            {personalFields.map(({ key, label }) => displayField(label, personal[key]))}
            {displayField("Account email", email)}
          </dl>
        )}

        {sectionActions("personal")}
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Educational Info</h2>

        {educationLevels.map((level) =>
          education[level].map((entry, index) => {
            const section = `${level}-${index}`;

            return (
              <form
                key={section}
                className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
                onSubmit={(event) =>
                  void saveSection(event, section, async () => {
                    const saved = await saveEducation(level, entry);
                    setEducation((previous) => ({
                      ...previous,
                      [level]: previous[level].map((item, itemIndex) =>
                        itemIndex === index ? saved : item,
                      ),
                    }));
                  })
                }
              >
                {sectionHeader(
                  education[level].length > 1 ? `${level} — Record ${index + 1}` : level,
                  section,
                  () => setEducation(education),
                )}

                {!readOnly && edit?.section === section ? (
                  <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
                    {educationFields.map((field) => (
                      <FieldInput
                        key={field.key}
                        field={field}
                        value={entry.values[field.key]}
                        onChange={(value) =>
                          setEducation((previous) => ({
                            ...previous,
                            [level]: previous[level].map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, values: { ...item.values, [field.key]: value } }
                                : item,
                            ),
                          }))
                        }
                      />
                    ))}
                  </fieldset>
                ) : (
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {educationFields.map(({ key, label }) =>
                      displayField(label, entry.values[key]),
                    )}
                  </dl>
                )}

                {sectionActions(
                  section,
                  draft ? "Save education draft"
                    : entry.id ? "Save education changes" : `Add ${level}`,
                )}
              </form>
            );
          }),
        )}
      </section>

      <form
        className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
        onSubmit={(event) =>
          void saveSection(event, "other", () => savePersonal(personal))
        }
      >
        {sectionHeader("Other Info", "other", () => setPersonal(personal))}
        {!readOnly && edit?.section === "other" ? (
          <fieldset disabled={disabled} className="grid gap-4 sm:grid-cols-2">
            {personalInputs(otherFields)}
          </fieldset>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            {otherFields.map(({ key, label }) => displayField(label, personal[key]))}
          </dl>
        )}

        {sectionActions("other")}
      </form>
    </div>
  );
}

function DemoFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [demoFileName, setDemoFileName] = useState("");

  return (
    <form
      className="mx-auto max-w-4xl space-y-4 rounded-xl border bg-card p-4 sm:p-6"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (file) setDemoFileName(file.name);
      }}
    >
      <h2 className="text-lg font-semibold">File Upload Demo</h2>
      <p className="text-sm text-muted-foreground">
        Choose a file to try the upload flow locally. Files are never sent to a server.
      </p>
      <label className="block space-y-1.5 text-sm font-medium">
        <span>Choose a file</span>
        <Input
          type="file"
          onChange={(event) => {
            setFile(event.currentTarget.files?.[0] ?? null);
            setDemoFileName("");
          }}
        />
      </label>
      <Button type="submit" disabled={!file}>Simulate upload</Button>
      {demoFileName && (
        <p role="status" className="break-words text-sm text-muted-foreground">
          Demo upload complete for {demoFileName}.
        </p>
      )}
    </form>
  );
}

const educationColumns =
  "id, qualification, board, institution_name, group_major, passing_year, grading_scale, obtained_mark";

type CandidateProfileProps = {
  candidateId: string;
  userId: string;
  email: string;
};

export function CandidateProfilePage({
  candidateId,
  userId,
  email,
}: CandidateProfileProps) {
  const [profile, setProfile] = useState<{
    personal: PersonalInfo;
    education: EducationSections;
    code: string | null;
    otherInfo: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [candidateResult, educationResult] = await Promise.all([
          supabase
            .from("candidates")
            .select("candidate_code, first_name, last_name, date_of_birth, phone, other_info")
            .eq("id", candidateId)
            .eq("auth_user_id", userId)
            .single(),
          supabase
            .from("candidate_education")
            .select(educationColumns)
            .eq("candidate_id", candidateId)
            .order("passing_year")
            .order("id"),
        ]);

        if (candidateResult.error) throw candidateResult.error;
        if (educationResult.error) throw educationResult.error;

        const candidate = candidateResult.data;
        const rowsByLevel: Record<EducationLevel, EducationEntry[]> = {
          SSC: [],
          HSC: [],
          Bachelor: [],
        };

        for (const row of educationResult.data) {
          const level = qualificationLevel(row.qualification);
          if (level) {
            rowsByLevel[level].push({
              id: row.id,
              values: readEducationInfo(row),
            });
          }
        }

        const education = emptyEducationSections();
        for (const level of educationLevels) {
          if (rowsByLevel[level].length) education[level] = rowsByLevel[level];
        }

        if (active) {
          setProfile({
            code: candidate.candidate_code,
            otherInfo: candidate.other_info ?? {},
            personal: readPersonalInfo({
              ...candidate.other_info,
              given_name: candidate.first_name,
              surname: candidate.last_name,
              date_of_birth: candidate.date_of_birth,
              number: candidate.phone,
            }),
            education,
          });
        }
      } catch (error) {
        if (active) setError(errorMessage(error));
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [candidateId, userId]);

  async function savePersonal(values: PersonalInfo) {
    const givenName = values.given_name.trim();
    if (!givenName) throw new Error("Enter your given name in Personal Info first.");

    const otherInfo = Object.fromEntries(
      otherFields.map(({ key }) => [key, values[key].trim() || null]),
    );

    const { error } = await supabase
      .from("candidates")
      .update({
        first_name: givenName,
        last_name: values.surname.trim() || null,
        date_of_birth: values.date_of_birth || null,
        phone: values.number.trim() || null,
        other_info: { ...profile?.otherInfo, ...otherInfo },
      })
      .eq("id", candidateId)
      .eq("auth_user_id", userId)
      .select("id")
      .single();

    if (error) throw error;
  }

  async function saveEducation(level: EducationLevel, entry: EducationEntry) {
    const values = entry.values;

    if (!entry.id && !Object.values(values).some((value) => value.trim())) {
      throw new Error(`Enter some ${level} information first.`);
    }

    const payload = {
      institution_name: values.institution_name.trim() || null,
      board: values.board.trim() || null,
      group_major: values.group_major.trim() || null,
      passing_year: values.passing_year ? Number(values.passing_year) : null,
      grading_scale: values.grading_scale.trim() || null,
      obtained_mark: values.obtained_mark ? Number(values.obtained_mark) : null,
    };

    const query = entry.id
      ? supabase
          .from("candidate_education")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", entry.id)
          .eq("candidate_id", candidateId)
      : supabase
          .from("candidate_education")
          .insert({ ...payload, candidate_id: candidateId, qualification: level });

    const { data, error } = await query.select(educationColumns).single();
    if (error) throw error;

    return { id: data.id, values: readEducationInfo(data) };
  }

  if (error) return <p role="alert" className="text-destructive">{error}</p>;
  if (!profile) return <p role="status">Loading candidate profile…</p>;

  return (
    <div className="space-y-6">
      <ProfileForm
        title="My Profile"
        description={profile.code ? `Candidate ID: ${profile.code}` : "Manage your candidate profile."}
        email={email}
        initialPersonal={profile.personal}
        initialEducation={profile.education}
        savePersonal={savePersonal}
        saveEducation={saveEducation}
      />
      <DemoFileUpload />
    </div>
  );
}