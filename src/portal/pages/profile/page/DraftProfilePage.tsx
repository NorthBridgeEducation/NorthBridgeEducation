import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

import { DraftDocumentsStep } from "../../DraftDocumentsStep";
import { DraftEducationSection } from "../components/DraftEducationSection";
import {
  AccountEmail,
  ProfileFieldInputs,
} from "../components/ProfileFields";
import { ProfileSummary } from "../components/ProfileSummary";
import {
  educationLevels,
  otherFields,
  personalFields,
  readEducationInfo,
  readPersonalInfo,
  type EducationInfo,
  type EducationLevel,
  type PersonalInfo,
} from "../profileFields";

const steps = ["Personal Info", "Education", "Other Info", "Documents"] as const;

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
  avatarUrl?: string;
};

function readDraftEducation(
  source?: Partial<Record<EducationLevel, unknown>> | null,
): EducationDraft {
  return {
    SSC: readEducationInfo(source?.SSC),
    HSC: readEducationInfo(source?.HSC),
    Bachelor: readEducationInfo(source?.Bachelor),
  };
}

export function DraftProfilePage({
  userId,
  email,
  avatarUrl,
}: DraftProfileProps) {
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

    async function loadDraft() {
      try {
        const { data, error } = await supabase
          .from("draft")
          .select("*")
          .eq("user_id", userId)
          .abortSignal(controller.signal)
          .maybeSingle();

        if (controller.signal.aborted) return;
        if (error) throw error;

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
      } catch {
        if (!controller.signal.aborted) {
          setLoadError("Could not load your profile draft.");
        }
      }
    }

    void loadDraft();
    return () => controller.abort();
  }, [userId]);

  function changeStep(nextStep: number) {
    setStep(nextStep);
    setSaveError("");
    setNotice("");
  }

  function changePersonal(key: keyof PersonalInfo, value: string) {
    setPersonal((previous) => ({ ...previous, [key]: value }));
    setNotice("");
  }

  async function saveStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft || draft.approved || saving || step === 3) return;

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
        if (!data) {
          throw new Error("This draft could not be updated. Reload the page.");
        }
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
        personal:
          step === 1
            ? draft.personal
            : readPersonalInfo({ ...draft.personal, ...sectionValues }),
        education: step === 1 ? education : draft.education,
      });

      setStep(step + 1);
      setNotice(`${steps[step]} saved to your draft.`);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        setSaveError("A draft already exists. Reload the page before saving.");
      } else {
        setSaveError(
          error instanceof Error ? error.message : "Could not save your draft.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return <p role="alert" className="text-destructive">{loadError}</p>;
  }

  if (!draft) {
    return <p role="status">Loading your profile draft…</p>;
  }

  const savedLevels = educationLevels.filter((level) =>
    Object.values(draft.education[level]).some((value) => value.trim()),
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <ProfileSummary
        givenName={draft.personal.given_name}
        surname={draft.personal.surname}
        email={email}
        avatarUrl={avatarUrl}
        editDisabled={saving}
        onEdit={draft.approved ? undefined : () => changeStep(0)}
      />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">My Profile Draft</h1>
        <p className="text-sm text-muted-foreground">
          {draft.approved
            ? "Your draft has been approved. You can review your saved information."
            : `Step ${step + 1} of ${steps.length}. Save each section as you go.`}
        </p>
      </header>

      <nav aria-label="Profile draft steps">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((title, index) => (
            <li key={title}>
              <Button
                type="button"
                variant={step === index ? "default" : "outline"}
                aria-current={step === index ? "step" : undefined}
                disabled={saving || (!draft.exists && index > 0)}
                onClick={() => changeStep(index)}
                className="w-full justify-start"
              >
                {index + 1}. {title}
              </Button>
            </li>
          ))}
        </ol>
      </nav>

      {notice && (
        <p role="status" className="text-sm text-muted-foreground">{notice}</p>
      )}

      {step === 3 ? (
        <DraftDocumentsStep
          userId={userId}
          readOnly={draft.approved}
          onBack={() => changeStep(2)}
        />
      ) : (
        <form
          key={step}
          onSubmit={saveStep}
          className="space-y-5 rounded-xl border bg-card p-4 sm:p-6"
        >
          <h2 className="text-lg font-semibold">{steps[step]}</h2>

          <fieldset disabled={saving || draft.approved} className="min-w-0 space-y-4">
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileFieldInputs<keyof PersonalInfo>
                  fields={personalFields}
                  values={personal}
                  onChange={changePersonal}
                  requiredKey="given_name"
                  variant="draft"
                />
                <AccountEmail email={email} variant="draft" />
              </div>
            )}

            {step === 1 && (
              <DraftEducationSection
                education={education}
                savedEducation={draft.education}
                savedLevels={savedLevels}
                onChange={(level, key, value) => {
                  setEducation((previous) => ({
                    ...previous,
                    [level]: { ...previous[level], [key]: value },
                  }));
                  setNotice("");
                }}
              />
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileFieldInputs<keyof PersonalInfo>
                  fields={otherFields}
                  values={personal}
                  onChange={changePersonal}
                  variant="draft"
                />
              </div>
            )}
          </fieldset>

          {saveError && (
            <p role="alert" className="text-sm text-destructive">{saveError}</p>
          )}

          <div className="flex flex-wrap gap-2">
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
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save and continue"}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}