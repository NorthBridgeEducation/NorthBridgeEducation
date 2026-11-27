import { useEffect, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { DraftDocumentsStep } from "./DraftDocumentsStep"
import {
  educationLevels,
  personalFields,
  otherFields,
  readEducationInfo,
  readPersonalInfo,
  type EducationInfo,
  type EducationLevel,
  type PersonalInfo,
} from "./profile/profileFields"
import {
  AccountEmail,
  ProfileFieldInputs,
} from "./profile/components/ProfileFields"
import { DraftEducationSection } from "./profile/components/DraftEducationSection"
import { ProfileSummary } from "./profile/components/ProfileSummary"

const steps = [
  {
    title: "Personal Info",
    description: "Name, birth date and contact number",
  },
  { title: "Education", description: "SSC, HSC and Bachelor" },
  { title: "Other Info", description: "Identity, family and address" },
  { title: "Documents", description: "Optional supporting documents" },
] as const

type EducationDraft = Record<EducationLevel, EducationInfo>

type Draft = {
  exists: boolean
  approved: boolean
  personal: PersonalInfo
  education: EducationDraft
}

type DraftProfileProps = {
  userId: string
  email: string
  avatarUrl?: string
}

function hasEducation(values: EducationInfo) {
  return Object.values(values).some((value) => value.trim() !== "")
}

function readDraftEducation(
  source?: Partial<Record<EducationLevel, unknown>>
): EducationDraft {
  return {
    SSC: readEducationInfo(source?.SSC),
    HSC: readEducationInfo(source?.HSC),
    Bachelor: readEducationInfo(source?.Bachelor),
  }
}

export function DraftProfilePage({
  userId,
  email,
  avatarUrl,
}: DraftProfileProps) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [personal, setPersonal] = useState(() => readPersonalInfo(null))
  const [education, setEducation] = useState(() => readDraftEducation())
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      const { data, error } = await supabase
        .from("draft")
        .select("*")
        .eq("user_id", userId)
        .abortSignal(controller.signal)
        .maybeSingle()

      if (controller.signal.aborted) return

      if (error) {
        setLoadError("Could not load your profile draft.")
        return
      }

      const savedPersonal = readPersonalInfo(data)
      const savedEducation = readDraftEducation(data?.education)

      setPersonal(savedPersonal)
      setEducation(savedEducation)
      setDraft({
        exists: Boolean(data),
        approved: data?.status === "approved",
        personal: savedPersonal,
        education: savedEducation,
      })
    }

    void load()
    return () => controller.abort()
  }, [userId])

  function changeStep(nextStep: number) {
    setStep(nextStep)
    setSaveError("")
    setNotice("")
  }

  async function saveStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft || draft.approved || saving) return

    setSaveError("")
    setNotice("")

    if (step === 0 && !personal.given_name.trim()) {
      setSaveError("Enter your given name.")
      return
    }

    if (!draft.exists && step !== 0) {
      setSaveError("Save Personal Info first to create your draft.")
      return
    }

    setSaving(true)

    try {
      const fields = step === 0 ? personalFields : otherFields
      const sectionValues = Object.fromEntries(
        fields.map(({ key }) => [key, personal[key].trim() || null])
      )

      const changes = {
        ...(step === 1 ? { education } : sectionValues),
        updated_at: new Date().toISOString(),
      }

      if (draft.exists) {
        const { data, error } = await supabase
          .from("draft")
          .update(changes)
          .eq("user_id", userId)
          .or("status.is.null,status.neq.approved")
          .select("user_id")
          .maybeSingle()

        if (error) throw error
        if (!data)
          throw new Error("This draft could not be updated. Reload the page.")
      } else {
        const { error } = await supabase.from("draft").insert({
          ...changes,
          user_id: userId,
          status: "draft",
        })

        if (error) throw error
      }

      setDraft({
        ...draft,
        exists: true,
        personal:
          step === 1
            ? draft.personal
            : readPersonalInfo({ ...draft.personal, ...sectionValues }),
        education: step === 1 ? education : draft.education,
      })

      if (step < steps.length - 1) setStep(step + 1)
      setNotice(`${steps[step].title} saved to your draft.`)
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        setSaveError("A draft already exists. Reload the page before saving.")
      } else {
        setSaveError(
          error instanceof Error ? error.message : "Could not save your draft."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  if (loadError)
    return (
      <p role="alert" className="text-destructive">
        {loadError}
      </p>
    )
  if (!draft) return <p role="status">Loading your profile draft…</p>

  const savedLevels = educationLevels.filter((level) =>
    hasEducation(draft.education[level])
  )
  const sectionStatus = [
    draft.personal.given_name.trim() ? "Saved" : "Not added",
    `${savedLevels.length} of ${educationLevels.length} added`,
    otherFields.some(({ key }) => draft.personal[key].trim())
      ? "Saved"
      : "Not added",
    "Optional",
  ]

  function changePersonal(key: keyof PersonalInfo, value: string) {
    setPersonal((previous) => ({ ...previous, [key]: value }))
    setNotice("")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <ProfileSummary
        key={avatarUrl}
        givenName={draft.personal.given_name}
        surname={draft.personal.surname}
        email={email}
        avatarUrl={avatarUrl}
        editDisabled={saving}
        onEdit={
          draft.approved
            ? undefined
            : () => {
                changeStep(0)
                document.getElementById("draft-personal-step")?.focus()
              }
        }
      />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          My Profile Draft
        </h1>
        <p className="text-sm text-muted-foreground">
          {draft.approved
            ? "Your draft has been approved. You can review the saved information below."
            : `Step ${step + 1} of ${steps.length}. Save each section as you go.`}
        </p>
      </header>

      <nav aria-label="Profile draft steps">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ title }, index) => (
            <li key={title}>
              <button
                type="button"
                id={index === 0 ? "draft-personal-step" : undefined}
                aria-current={step === index ? "step" : undefined}
                disabled={saving || (!draft.exists && index > 0)}
                onClick={() => changeStep(index)}
                className={[
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                  "focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50",
                  step === index
                    ? "border-primary bg-primary/5"
                    : "bg-card hover:bg-muted/60",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
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

      {notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
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

          <fieldset
            disabled={saving || draft.approved}
            className="min-w-0 space-y-4"
          >
            {step === 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProfileFieldInputs
                    fields={personalFields}
                    values={personal}
                    onChange={changePersonal}
                    requiredKey="given_name"
                    variant="draft"
                  />
                </div>
                <AccountEmail email={email} variant="draft" />
              </>
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
                  }))
                  setNotice("")
                }}
              />
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileFieldInputs
                  fields={otherFields}
                  values={personal}
                  onChange={changePersonal}
                  variant="draft"
                />
              </div>
            )}
          </fieldset>

          {saveError && (
            <p role="alert" className="text-sm text-destructive">
              {saveError}
            </p>
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
                  {saving
                    ? "Saving…"
                    : step === 2
                      ? "Save draft and continue"
                      : "Save and continue"}
                </Button>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  )
}
