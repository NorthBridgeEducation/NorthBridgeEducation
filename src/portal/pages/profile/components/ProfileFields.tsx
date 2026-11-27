import { Input } from "@/components/ui/input"
import type { Field } from "../profileFields"

export function ProfileFieldInput({
  field,
  value,
  onChange,
  required,
  variant = "candidate",
}: {
  field: Field
  value: string
  onChange: (value: string) => void
  required?: boolean
  variant?: "candidate" | "draft"
}) {
  return (
    <label
      className={
        variant === "draft"
          ? "min-w-0 space-y-1.5 text-sm font-medium"
          : "block min-w-0 space-y-1.5 text-sm font-medium"
      }
    >
      <span>
        {field.label}
        {variant === "draft" && required ? " *" : ""}
      </span>
      <Input
        className={
          variant === "candidate" ? "min-h-11 text-base sm:text-sm" : undefined
        }
        type={field.type ?? "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={field.key === "passing_year" ? 1950 : undefined}
        max={field.key === "passing_year" ? 2100 : undefined}
        step={
          field.type === "number" && field.key !== "passing_year"
            ? "any"
            : undefined
        }
      />
    </label>
  )
}

function DisplayField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words whitespace-pre-wrap">
        {value || "—"}
      </dd>
    </div>
  )
}

export function ProfileFieldInputs<K extends string>({
  fields,
  values,
  onChange,
  requiredKey,
  variant,
}: {
  fields: readonly Field<K>[]
  values: Record<K, string>
  onChange: (key: K, value: string) => void
  requiredKey?: K
  variant?: "candidate" | "draft"
}) {
  return fields.map((field) => (
    <ProfileFieldInput
      key={field.key}
      field={field}
      value={values[field.key]}
      required={field.key === requiredKey}
      variant={variant}
      onChange={(value) => onChange(field.key, value)}
    />
  ))
}

export function ProfileFieldValues<K extends string>({
  fields,
  values,
}: {
  fields: readonly Field<K>[]
  values: Record<K, string>
}) {
  return fields.map(({ key, label }) => (
    <DisplayField key={key} label={label} value={values[key]} />
  ))
}

export function AccountEmail({
  email,
  variant = "candidate",
}: {
  email: string
  variant?: "candidate" | "draft" | "display"
}) {
  if (variant === "display")
    return <DisplayField label="Account email" value={email} />

  const candidate = variant === "candidate"
  return (
    <label
      className={
        candidate
          ? "block min-w-0 space-y-1.5 text-sm font-medium"
          : "block space-y-1.5 text-sm font-medium"
      }
    >
      <span>Account email</span>
      <Input
        className={candidate ? "min-h-11 text-base sm:text-sm" : undefined}
        type="email"
        value={email}
        readOnly
      />
    </label>
  )
}
