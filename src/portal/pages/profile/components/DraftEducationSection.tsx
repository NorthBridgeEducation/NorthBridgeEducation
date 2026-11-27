import {
  educationFields,
  educationLevels,
  type EducationInfo,
  type EducationLevel,
} from "../profileFields"
import { EducationInputs } from "./EducationFields"

type Props = {
  education: Record<EducationLevel, EducationInfo>
  savedEducation: Record<EducationLevel, EducationInfo>
  savedLevels: readonly EducationLevel[]
  onChange: (
    level: EducationLevel,
    key: keyof EducationInfo,
    value: string
  ) => void
}

export function DraftEducationSection({
  education,
  savedEducation,
  savedLevels,
  onChange,
}: Props) {
  return educationLevels.map((level) => {
    const values = education[level]
    const changed = educationFields.some(
      ({ key }) => values[key] !== savedEducation[level][key]
    )
    const status = changed
      ? "Unsaved changes"
      : savedLevels.includes(level)
        ? "Saved"
        : "Not added"

    return (
      <section key={level} className="space-y-4 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{level}</h3>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            {status}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <EducationInputs
            variant="draft"
            values={values}
            onChange={(key, value) => onChange(level, key, value)}
          />
        </div>
      </section>
    )
  })
}
