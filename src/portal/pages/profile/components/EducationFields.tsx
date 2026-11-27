import { educationFields, type EducationInfo } from "../profileFields"
import { ProfileFieldInputs, ProfileFieldValues } from "./ProfileFields"

export function EducationInputs({
  values,
  onChange,
  variant,
}: {
  values: EducationInfo
  onChange: (key: keyof EducationInfo, value: string) => void
  variant?: "candidate" | "draft"
}) {
  return (
    <ProfileFieldInputs
      fields={educationFields}
      values={values}
      onChange={onChange}
      variant={variant}
    />
  )
}

export function EducationValues({ values }: { values: EducationInfo }) {
  return <ProfileFieldValues fields={educationFields} values={values} />
}
