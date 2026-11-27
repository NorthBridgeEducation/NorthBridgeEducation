import { Input } from "@/components/ui/input";

import type { Field } from "../profileFields";

type InputVariant = "candidate" | "draft";

type ProfileFieldInputProps = {
  field: Field;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  variant?: InputVariant;
};

export function ProfileFieldInput({
  field,
  value,
  onChange,
  required,
  variant = "candidate",
}: ProfileFieldInputProps) {
  const isPassingYear = field.key === "passing_year";

  return (
    <label className="block min-w-0 space-y-1.5 text-sm font-medium">
      <span>
        {field.label}
        {variant === "draft" && required ? " *" : ""}
      </span>

      <Input
        className={variant === "candidate" ? "min-h-11 text-base sm:text-sm" : undefined}
        type={field.type ?? "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={isPassingYear ? 1950 : undefined}
        max={isPassingYear ? 2100 : undefined}
        step={field.type === "number" && !isPassingYear ? "any" : undefined}
      />
    </label>
  );
}

type ProfileFieldInputsProps<K extends string> = {
  fields: readonly Field<K>[];
  values: Record<K, string>;
  onChange: (key: K, value: string) => void;
  requiredKey?: K;
  variant?: InputVariant;
};

export function ProfileFieldInputs<K extends string>({
  fields,
  values,
  onChange,
  requiredKey,
  variant,
}: ProfileFieldInputsProps<K>) {
  return fields.map((field) => (
    <ProfileFieldInput
      key={field.key}
      field={field}
      value={values[field.key]}
      required={field.key === requiredKey}
      variant={variant}
      onChange={(value) => onChange(field.key, value)}
    />
  ));
}

function DisplayField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-sm font-medium">
        {value || "—"}
      </dd>
    </div>
  );
}

type ProfileFieldValuesProps<K extends string> = {
  fields: readonly Field<K>[];
  values: Record<K, string>;
};

export function ProfileFieldValues<K extends string>({
  fields,
  values,
}: ProfileFieldValuesProps<K>) {
  return fields.map(({ key, label }) => (
    <DisplayField key={key} label={label} value={values[key]} />
  ));
}

type AccountEmailProps = {
  email: string;
  variant?: InputVariant | "display";
};

export function AccountEmail({
  email,
  variant = "candidate",
}: AccountEmailProps) {
  if (variant === "display") {
    return <DisplayField label="Account email" value={email} />;
  }

  return (
    <label className="block min-w-0 space-y-1.5 text-sm font-medium">
      <span>Account email</span>
      <Input
        className={variant === "candidate" ? "min-h-11 text-base sm:text-sm" : undefined}
        type="email"
        value={email}
        readOnly
      />
    </label>
  );
}