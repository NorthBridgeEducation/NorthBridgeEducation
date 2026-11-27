import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  personalFields,
  otherFields,
  languageTestFields,
  readFields,
  type EducationEntry,
  type EducationLevel,
  type EducationSections,
  type PersonalInfo,
} from "../profileFields"
import { errorMessage } from "../profileError"
import {
  AccountEmail,
  ProfileFieldInputs,
  ProfileFieldValues,
} from "./ProfileFields"
import { CandidateEducationSection } from "./CandidateEducationSection"
import { ProfileSummary, type ProfileApplication } from "./ProfileSummary"
import { DemoCertificateUpload } from "./DemoCertificateUpload"

type ProfileFormProps = {
  title: string
  description: string
  email: string
  avatarUrl?: string
  applications?: ProfileApplication[]
  applicationsUnavailable?: boolean
  initialPersonal: PersonalInfo
  initialEducation: EducationSections
  savePersonal: (values: PersonalInfo) => Promise<void>
  saveEducation: (
    level: EducationLevel,
    entry: EducationEntry
  ) => Promise<EducationEntry>
  showCertificateDemos?: boolean
  draft?: boolean
  readOnly?: boolean
}

export function ProfileForm({
  // title,
  // description,
  email,
  avatarUrl,
  applications,
  applicationsUnavailable = false,
  initialPersonal,
  initialEducation,
  savePersonal,
  saveEducation,
  showCertificateDemos = false,
  draft = false,
  readOnly = false,
}: ProfileFormProps) {
  const [personal, setPersonal] = useState(initialPersonal)
  const [education, setEducation] = useState(initialEducation)
  const [languageTest, setLanguageTest] = useState(() =>
    readFields(languageTestFields, null)
  )
  const [activeTab, setActiveTab] = useState("personal")
  const [edit, setEdit] = useState<{
    section: string
    restore: () => void
  } | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [notice, setNotice] = useState<{
    section: string
    text: string
    error: boolean
  } | null>(null)

  async function saveSection(
    event: FormEvent<HTMLFormElement>,
    section: string,
    save: () => Promise<void>,
    successText = draft ? "Draft saved." : "Changes saved."
  ) {
    event.preventDefault()
    if (saving || readOnly || edit?.section !== section) return

    setSaving(section)
    setNotice(null)

    try {
      await save()
      setEdit(null)
      setNotice({
        section,
        text: successText,
        error: false,
      })
    } catch (error) {
      setNotice({ section, text: errorMessage(error), error: true })
    } finally {
      setSaving(null)
    }
  }

  function feedback(section: string) {
    if (notice?.section !== section) return null

    return (
      <p
        role={notice.error ? "alert" : "status"}
        className={
          notice.error
            ? "text-sm text-destructive"
            : "text-sm text-muted-foreground"
        }
      >
        {notice.text}
      </p>
    )
  }

  function changePersonal(key: keyof PersonalInfo, value: string) {
    setPersonal((previous) => ({ ...previous, [key]: value }))
  }

  const disabled = readOnly || saving !== null
  const buttonLabel = draft ? "Save draft" : "Save changes"

  function sectionHeader(title: string, section: string, restore: () => void) {
    return (
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {!readOnly && edit?.section !== section && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 px-4 sm:min-h-9"
            disabled={disabled || edit !== null}
            aria-label={`Edit ${title}`}
            onClick={() => {
              setNotice(null)
              setEdit({ section, restore })
            }}
          >
            Edit
          </Button>
        )}
      </div>
    )
  }

  function sectionActions(section: string, label = buttonLabel) {
    return (
      <>
        {feedback(section)}
        {!readOnly && edit?.section === section && (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:flex-wrap">
            <Button
              type="submit"
              className="min-h-11 whitespace-normal sm:min-h-9"
              disabled={disabled}
            >
              {saving === section ? "Saving…" : label}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 sm:min-h-9"
              disabled={disabled}
              onClick={() => {
                edit.restore()
                setEdit(null)
                setNotice(null)
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      {applications && (
        <ProfileSummary
          key={avatarUrl}
          givenName={personal.given_name}
          surname={personal.surname}
          email={email}
          avatarUrl={avatarUrl}
          applications={applications}
          applicationsUnavailable={applicationsUnavailable}
          editDisabled={disabled || edit !== null}
          onEdit={
            readOnly
              ? undefined
              : () => {
                  setNotice(null)
                  setActiveTab("personal")
                  setEdit({
                    section: "personal",
                    restore: () => setPersonal(personal),
                  })
                }
          }
        />
      )}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (edit === null) setActiveTab(value)
        }}
        className="w-full gap-4"
      >
        <div className="overflow-x-auto border-b pb-1">
          <TabsList variant="line" aria-label="Profile sections">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            {showCertificateDemos && (
              <TabsTrigger value="language">Language Tests</TabsTrigger>
            )}
            <TabsTrigger value="other">Other Info</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="personal">
          <form
            className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
            onSubmit={(event) =>
              void saveSection(event, "personal", () => savePersonal(personal))
            }
          >
            {sectionHeader("Personal Info", "personal", () =>
              setPersonal(personal)
            )}
            {!readOnly && edit?.section === "personal" ? (
              <fieldset
                disabled={disabled}
                className="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2"
              >
                <ProfileFieldInputs
                  fields={personalFields}
                  values={personal}
                  requiredKey="given_name"
                  onChange={changePersonal}
                />
                <AccountEmail email={email} />
              </fieldset>
            ) : (
              <dl className="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2">
                <ProfileFieldValues fields={personalFields} values={personal} />
                <AccountEmail email={email} variant="display" />
              </dl>
            )}

            {sectionActions("personal")}
          </form>
        </TabsContent>

        <TabsContent value="education">
          <CandidateEducationSection
            education={education}
            setEducation={setEducation}
            saveEducation={saveEducation}
            saveSection={saveSection}
            sectionHeader={sectionHeader}
            sectionActions={sectionActions}
            editingSection={edit?.section}
            disabled={disabled}
            readOnly={readOnly}
            draft={draft}
            showCertificateDemos={showCertificateDemos}
          />
        </TabsContent>

        {showCertificateDemos && (
          <TabsContent value="language">
            <form
              className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
              onSubmit={(event) =>
                void saveSection(
                  event,
                  "language-test",
                  async () => {
                    if (!languageTest.test_name.trim()) {
                      throw new Error("Enter the test name.")
                    }
                  },
                  "Demo saved for this visit."
                )
              }
            >
              {sectionHeader("Language Tests", "language-test", () =>
                setLanguageTest(languageTest)
              )}
              {edit?.section === "language-test" && !readOnly ? (
                <fieldset
                  disabled={disabled}
                  className="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2"
                >
                  <ProfileFieldInputs
                    fields={languageTestFields}
                    values={languageTest}
                    requiredKey="test_name"
                    onChange={(key, value) =>
                      setLanguageTest((previous) => ({
                        ...previous,
                        [key]: value,
                      }))
                    }
                  />
                </fieldset>
              ) : languageTest.test_name.trim() ? (
                <dl className="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <ProfileFieldValues
                    fields={languageTestFields}
                    values={languageTest}
                  />
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No language test added.
                </p>
              )}

              <DemoCertificateUpload
                level="Language test"
                editing={edit?.section === "language-test" && !readOnly}
                disabled={disabled}
              />
              {sectionActions("language-test", "Save demo")}
            </form>
          </TabsContent>
        )}

        <TabsContent value="other">
          <form
            className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
            onSubmit={(event) =>
              void saveSection(event, "other", () => savePersonal(personal))
            }
          >
            {sectionHeader("Other Info", "other", () => setPersonal(personal))}
            {!readOnly && edit?.section === "other" ? (
              <fieldset
                disabled={disabled}
                className="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2"
              >
                <ProfileFieldInputs
                  fields={otherFields}
                  values={personal}
                  onChange={changePersonal}
                />
              </fieldset>
            ) : (
              <dl className="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2">
                <ProfileFieldValues fields={otherFields} values={personal} />
              </dl>
            )}

            {sectionActions("other")}
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
