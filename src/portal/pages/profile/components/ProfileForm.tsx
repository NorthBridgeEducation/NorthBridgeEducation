import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  languageTestFields,
  otherFields,
  personalFields,
  readFields,
  type EducationEntry,
  type EducationLevel,
  type EducationSections,
  type PersonalInfo,
} from "../profileFields";
import { CandidateEducationSection } from "./CandidateEducationSection";
import {
  AccountEmail,
  ProfileFieldInputs,
  ProfileFieldValues,
} from "./ProfileFields";
import { ProfileSummary, type ProfileApplication } from "./ProfileSummary";

type ProfileFormProps = {
  title?: string;
  description?: string;
  email: string;
  avatarUrl?: string;
  applications?: ProfileApplication[];
  applicationsUnavailable?: boolean;
  initialPersonal: PersonalInfo;
  initialEducation: EducationSections;
  savePersonal: (values: PersonalInfo) => Promise<void>;
  saveEducation: (
    level: EducationLevel,
    entry: EducationEntry,
  ) => Promise<EducationEntry>;
  showCertificateDemos?: boolean;
  draft?: boolean;
  readOnly?: boolean;
};

type EditState = {
  section: string;
  restore: () => void;
};

type Notice = {
  section: string;
  message: string;
  error: boolean;
};

const personalSections = [
  { id: "personal", title: "Personal Info", fields: personalFields },
  { id: "other", title: "Other Info", fields: otherFields },
] as const;

export function ProfileForm({
  email,
  avatarUrl,
  applications,
  applicationsUnavailable,
  initialPersonal,
  initialEducation,
  savePersonal,
  saveEducation,
  showCertificateDemos = false,
  draft = false,
  readOnly = false,
}: ProfileFormProps) {
  const [personal, setPersonal] = useState(initialPersonal);
  const [education, setEducation] = useState(initialEducation);
  const [languageTest, setLanguageTest] = useState(() =>
    readFields(languageTestFields, null),
  );
  const [activeTab, setActiveTab] = useState("personal");
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const disabled = readOnly || saving;
  const defaultSaveLabel = draft ? "Save draft" : "Save changes";

  function startEdit(section: string, restore: () => void) {
    setNotice(null);
    setEdit({ section, restore });
  }

  function cancelEdit() {
    edit?.restore();
    setEdit(null);
    setNotice(null);
  }

  async function saveSection(
    event: FormEvent<HTMLFormElement>,
    section: string,
    save: () => Promise<void>,
    successMessage = draft ? "Draft saved." : "Changes saved.",
  ) {
    event.preventDefault();

    if (disabled || edit?.section !== section) return;

    setSaving(true);
    setNotice(null);

    try {
      await save();
      setEdit(null);
      setNotice({ section, message: successMessage, error: false });
    } catch (error) {
      const message =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Could not save changes. Please try again.";

      setNotice({ section, message, error: true });
    } finally {
      setSaving(false);
    }
  }

  function sectionHeader(
    title: string,
    section: string,
    restore: () => void,
  ) {
    return (
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {!readOnly && edit?.section !== section && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Edit ${title}`}
            disabled={disabled || edit !== null}
            onClick={() => startEdit(section, restore)}
          >
            Edit
          </Button>
        )}
      </div>
    );
  }

  function sectionActions(section: string, label = defaultSaveLabel) {
    return (
      <>
        {notice?.section === section && (
          <p
            role={notice.error ? "alert" : "status"}
            className={
              notice.error ? "text-sm text-destructive" : "text-sm text-muted-foreground"
            }
          >
            {notice.message}
          </p>
        )}

        {!readOnly && edit?.section === section && (
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={disabled}>
              {saving ? "Saving…" : label}
            </Button>
            <Button type="button" variant="outline" disabled={saving} onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      <ProfileSummary
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
                setActiveTab("personal");
                startEdit("personal", () => setPersonal(personal));
              }
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-4">
        <div className="overflow-x-auto border-b pb-1">
          <TabsList variant="line" aria-label="Profile sections">
            <TabsTrigger value="personal" disabled={edit !== null && activeTab !== "personal"}>
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="education" disabled={edit !== null && activeTab !== "education"}>
              Education
            </TabsTrigger>
            {showCertificateDemos && (
              <TabsTrigger value="language" disabled={edit !== null && activeTab !== "language"}>
                Language Tests
              </TabsTrigger>
            )}
            <TabsTrigger value="other" disabled={edit !== null && activeTab !== "other"}>
              Other Info
            </TabsTrigger>
          </TabsList>
        </div>

        {personalSections.map(({ id, title, fields }) => (
          <TabsContent key={id} value={id}>
            <form
              className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
              onSubmit={(event) =>
                void saveSection(event, id, () => savePersonal(personal))
              }
            >
              {sectionHeader(title, id, () => setPersonal(personal))}

              {!readOnly && edit?.section === id ? (
                <fieldset disabled={disabled} className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <ProfileFieldInputs<keyof PersonalInfo>
                    fields={fields}
                    values={personal}
                    requiredKey={id === "personal" ? "given_name" : undefined}
                    onChange={(key, value) =>
                      setPersonal((previous) => ({ ...previous, [key]: value }))
                    }
                  />
                  {id === "personal" && <AccountEmail email={email} />}
                </fieldset>
              ) : (
                <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <ProfileFieldValues<keyof PersonalInfo> fields={fields} values={personal} />
                  {id === "personal" && <AccountEmail email={email} variant="display" />}
                </dl>
              )}

              {sectionActions(id)}
            </form>
          </TabsContent>
        ))}

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
                  "language",
                  async () => {
                    if (!languageTest.test_name.trim()) {
                      throw new Error("Enter the test name.");
                    }
                  },
                  "Demo saved for this visit.",
                )
              }
            >
              {sectionHeader("Language Tests", "language", () =>
                setLanguageTest(languageTest),
              )}

              {!readOnly && edit?.section === "language" ? (
                <fieldset disabled={disabled} className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <ProfileFieldInputs
                    fields={languageTestFields}
                    values={languageTest}
                    requiredKey="test_name"
                    onChange={(key, value) =>
                      setLanguageTest((previous) => ({ ...previous, [key]: value }))
                    }
                  />
                </fieldset>
              ) : (
                <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <ProfileFieldValues fields={languageTestFields} values={languageTest} />
                </dl>
              )}

              {sectionActions("language", "Save demo")}
            </form>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}