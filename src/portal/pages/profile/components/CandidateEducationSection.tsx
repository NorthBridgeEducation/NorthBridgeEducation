import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react"
import {
  educationLevels,
  type EducationEntry,
  type EducationLevel,
  type EducationSections,
} from "../profileFields"
import { DemoCertificateUpload } from "./DemoCertificateUpload"
import { EducationInputs, EducationValues } from "./EducationFields"

type Props = {
  education: EducationSections
  setEducation: Dispatch<SetStateAction<EducationSections>>
  saveEducation: (
    level: EducationLevel,
    entry: EducationEntry
  ) => Promise<EducationEntry>
  saveSection: (
    event: FormEvent<HTMLFormElement>,
    section: string,
    save: () => Promise<void>
  ) => Promise<void>
  sectionHeader: (
    title: string,
    section: string,
    restore: () => void
  ) => ReactNode
  sectionActions: (section: string, label?: string) => ReactNode
  editingSection?: string
  disabled: boolean
  readOnly: boolean
  draft: boolean
  showCertificateDemos: boolean
}

export function CandidateEducationSection({
  education,
  setEducation,
  saveEducation,
  saveSection,
  sectionHeader,
  sectionActions,
  editingSection,
  disabled,
  readOnly,
  draft,
  showCertificateDemos,
}: Props) {
  function restore() {
    setEducation(education)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Educational Info</h2>

      {educationLevels.map((level) =>
        education[level].map((entry, index) => {
          const section = `${level}-${index}`

          return (
            <form
              key={section}
              className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
              onSubmit={(event) =>
                void saveSection(event, section, async () => {
                  const saved = await saveEducation(level, entry)
                  setEducation((previous) => ({
                    ...previous,
                    [level]: previous[level].map((item, itemIndex) =>
                      itemIndex === index ? saved : item
                    ),
                  }))
                })
              }
            >
              {sectionHeader(
                education[level].length > 1
                  ? `${level} — Record ${index + 1}`
                  : level,
                section,
                restore
              )}

              {!readOnly && editingSection === section ? (
                <fieldset
                  disabled={disabled}
                  className="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2"
                >
                  <EducationInputs
                    values={entry.values}
                    onChange={(key, value) =>
                      setEducation((previous) => ({
                        ...previous,
                        [level]: previous[level].map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                values: { ...item.values, [key]: value },
                              }
                            : item
                        ),
                      }))
                    }
                  />
                </fieldset>
              ) : (
                <dl className="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <EducationValues values={entry.values} />
                </dl>
              )}

              {showCertificateDemos &&
                !readOnly &&
                (level === "SSC" || level === "HSC") && (
                  <DemoCertificateUpload
                    level={level}
                    editing={editingSection === section}
                    disabled={disabled}
                  />
                )}

              {sectionActions(
                section,
                draft
                  ? "Save education draft"
                  : entry.id
                    ? "Save education changes"
                    : `Add ${level}`
              )}
            </form>
          )
        })
      )}
    </section>
  )
}
