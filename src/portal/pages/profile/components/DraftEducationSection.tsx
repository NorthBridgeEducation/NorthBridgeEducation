import {
  educationFields,
  educationLevels,
  type EducationInfo,
  type EducationLevel,
} from "../profileFields";
import { EducationInputs } from "./EducationFields";

type DraftEducationSectionProps = {
  education: Record<EducationLevel, EducationInfo>;
  savedEducation: Record<EducationLevel, EducationInfo>;
  savedLevels: readonly EducationLevel[];
  onChange: (
    level: EducationLevel,
    key: keyof EducationInfo,
    value: string,
  ) => void;
};

export function DraftEducationSection({
  education,
  savedEducation,
  savedLevels,
  onChange,
}: DraftEducationSectionProps) {
  return (
    <>
      {educationLevels.map((level) => {
        const values = education[level];
        const savedValues = savedEducation[level];
        const hasChanges = educationFields.some(
          ({ key }) => values[key] !== savedValues[key],
        );

        let status = savedLevels.includes(level) ? "Saved" : "Not added";
        if (hasChanges) status = "Unsaved changes";

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
                values={values}
                variant="draft"
                onChange={(key, value) => onChange(level, key, value)}
              />
            </div>
          </section>
        );
      })}
    </>
  );
}