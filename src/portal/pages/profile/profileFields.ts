export const educationLevels = ["SSC", "HSC", "Bachelor"] as const

export type EducationLevel = (typeof educationLevels)[number]

export const personalFields = [
  { key: "given_name", label: "Given name" },
  { key: "surname", label: "Surname" },
  { key: "date_of_birth", label: "Date of birth", type: "date" },
  { key: "number", label: "Phone number", type: "tel" },
] as const

export const otherFields = [
  { key: "passport_number", label: "Passport number" },
  { key: "gender", label: "Gender" },
  { key: "nid_number", label: "NID number" },
  { key: "passport_date_of_issue", label: "Passport issue date", type: "date" },
  {
    key: "passport_date_of_expiry",
    label: "Passport expiry date",
    type: "date",
  },
  { key: "place_birth", label: "Place of birth" },
  { key: "fathers_name", label: "Father’s name" },
  { key: "mothers_name", label: "Mother’s name" },
  { key: "permanent_address", label: "Permanent address" },
] as const

export const educationFields = [
  { key: "institution_name", label: "Institution" },
  { key: "board", label: "Board / University" },
  { key: "group_major", label: "Group / Major" },
  { key: "passing_year", label: "Passing year", type: "number" },
  { key: "grading_scale", label: "Grading scale" },
  { key: "obtained_mark", label: "Result / GPA", type: "number" },
] as const

export const languageTestFields = [
  { key: "test_name", label: "Test name" },
  { key: "test_type", label: "Test type" },
  { key: "obtained_score", label: "Score", type: "number" },
  { key: "score_scale", label: "Score scale" },
  { key: "test_date", label: "Test date", type: "date" },
  { key: "expiry_date", label: "Expiry date", type: "date" },
  { key: "certificate_no", label: "Certificate number" },
] as const

export type Field<K extends string = string> = {
  key: K
  label: string
  type?: "date" | "tel" | "number"
}

type PersonalKey = (typeof personalFields)[number]["key"]
type OtherKey = (typeof otherFields)[number]["key"]
type EducationKey = (typeof educationFields)[number]["key"]

export type PersonalInfo = Record<PersonalKey | OtherKey, string>
export type EducationInfo = Record<EducationKey, string>

export type EducationEntry = {
  id?: string
  values: EducationInfo
}

export type EducationSections = Record<EducationLevel, EducationEntry[]>

export function readFields<K extends string>(
  fields: readonly { key: K }[],
  source: unknown
): Record<K, string> {
  const row =
    source && typeof source === "object"
      ? (source as Record<string, unknown>)
      : {}

  return Object.fromEntries(
    fields.map(({ key }) => {
      const value = row[key]
      return [
        key,
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : "",
      ]
    })
  ) as Record<K, string>
}

export function readPersonalInfo(source: unknown): PersonalInfo {
  return {
    ...readFields(personalFields, source),
    ...readFields(otherFields, source),
  }
}

export function readEducationInfo(source: unknown): EducationInfo {
  return readFields(educationFields, source)
}

export function emptyEducationSections(): EducationSections {
  return {
    SSC: [{ values: readEducationInfo(null) }],
    HSC: [{ values: readEducationInfo(null) }],
    Bachelor: [{ values: readEducationInfo(null) }],
  }
}
