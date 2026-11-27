import { educationFields, type EducationInfo } from "../profileFields";
import { ProfileFieldInputs, ProfileFieldValues } from "./ProfileFields";

type EducationInputsProps = {
  values: EducationInfo;
  onChange: (key: keyof EducationInfo, value: string) => void;
  variant?: "candidate" | "draft";
};

export function EducationInputs({
  values,
  onChange,
  variant = "candidate",
}: EducationInputsProps) {
  return (
    <ProfileFieldInputs
      fields={educationFields}
      values={values}
      onChange={onChange}
      variant={variant}
    />
  );
}

export function EducationValues({ values }: { values: EducationInfo }) {
  return <ProfileFieldValues fields={educationFields} values={values} />;
}