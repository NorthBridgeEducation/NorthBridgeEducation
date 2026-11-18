import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Globe2,
  Languages,
  Loader2,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const initialData = {
  // Personal
  fullName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Bangladeshi",
  email: "",
  phone: "",
  whatsapp: "",
  city: "",
  countryOfResidence: "Bangladesh",
  address: "",

  // Education
  highestQualification: "",
  institution: "",
  major: "",
  passingYear: "",
  result: "",
  gradingScale: "",
  educationDetails: "",

  // Study preferences
  destinationCountry: "",
  preferredUniversity: "",
  degreeLevel: "",
  preferredSubject: "",
  preferredIntake: "",
  studyMode: "On Campus",
  secondCountry: "",
  otherUniversity: "",

  // Language
  englishTest: "",
  englishScore: "",
  englishTestDate: "",
  otherLanguage: "",

  // Financial
  annualBudget: "",
  fundingSource: "",
  scholarship: "",
  sponsor: "",
  previousVisaRefusal: "",
  studyPlan: "",
  additionalMessage: "",
};

type FormData = typeof initialData;
type FieldName = keyof FormData;
type Errors = Partial<Record<FieldName, string>>;

type FieldDef = {
  name: FieldName;
  label: string;
  kind?: "text" | "email" | "tel" | "date" | "number" | "select" | "textarea";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  full?: boolean; // span both columns
};

type StepDef = {
  title: string;
  description: string;
  icon: LucideIcon;
  fields: FieldDef[];
};

const steps: StepDef[] = [
  {
    title: "Personal",
    description: "Tell us who you are and how we can reach you.",
    icon: UserRound,
    fields: [
      { name: "fullName", label: "Full name", placeholder: "As on your passport", required: true, full: true },
      { name: "dateOfBirth", label: "Date of birth", kind: "date" },
      { name: "gender", label: "Gender", kind: "select", options: ["Male", "Female", "Other", "Prefer not to say"] },
      { name: "email", label: "Email", kind: "email", placeholder: "you@example.com", required: true },
      { name: "phone", label: "Phone", kind: "tel", placeholder: "+880 1XXXXXXXXX", required: true },
      { name: "whatsapp", label: "WhatsApp number", kind: "tel", placeholder: "+880 1XXXXXXXXX" },
      { name: "nationality", label: "Nationality" },
      { name: "city", label: "City", placeholder: "Your city" },
      { name: "countryOfResidence", label: "Country of residence" },
      { name: "address", label: "Full address", kind: "textarea", placeholder: "House, road, area, district", full: true },
    ],
  },
  {
    title: "Education",
    description: "Your most recent completed or ongoing qualification.",
    icon: BookOpen,
    fields: [
      {
        name: "highestQualification",
        label: "Highest qualification",
        kind: "select",
        options: ["SSC / O-Level", "HSC / A-Level", "Diploma", "Bachelor's degree", "Master's degree", "PhD", "Other"],
        required: true,
      },
      { name: "institution", label: "Institution", placeholder: "School, college or university", required: true },
      { name: "major", label: "Subject / major", placeholder: "e.g. Science, Computer Science" },
      { name: "passingYear", label: "Passing year", kind: "number", placeholder: "e.g. 2025" },
      { name: "result", label: "GPA / CGPA / result", placeholder: "e.g. 4.50 or 3.75" },
      {
        name: "gradingScale",
        label: "Grading scale",
        kind: "select",
        options: ["Out of 4.00", "Out of 5.00", "Out of 10.00", "Percentage", "Other"],
      },
      {
        name: "educationDetails",
        label: "Anything else about your education",
        kind: "textarea",
        placeholder: "Other degrees, study gaps, achievements",
        full: true,
      },
    ],
  },
  {
    title: "Study plans",
    description: "Where and what you want to study.",
    icon: Globe2,
    fields: [
      {
        name: "destinationCountry",
        label: "Preferred country",
        kind: "select",
        options: ["USA", "UK", "Canada", "Australia", "Germany", "Japan", "South Korea", "Malaysia", "China", "Italy", "France", "Finland", "Sweden", "Other"],
        required: true,
      },
      { name: "preferredUniversity", label: "Preferred university", placeholder: "If you already have one in mind" },
      {
        name: "degreeLevel",
        label: "Degree level",
        kind: "select",
        options: ["Foundation", "Diploma", "Bachelor's", "Master's", "PhD", "Language course", "Other"],
        required: true,
      },
      { name: "preferredSubject", label: "Preferred subject", placeholder: "e.g. Computer Science" },
      { name: "preferredIntake", label: "Preferred intake", placeholder: "e.g. September 2027" },
      { name: "studyMode", label: "Study mode", kind: "select", options: ["On Campus", "Online", "Hybrid"] },
      { name: "secondCountry", label: "Backup country", placeholder: "Optional" },
      { name: "otherUniversity", label: "Backup university", placeholder: "Optional" },
    ],
  },
  {
    title: "Language",
    description: "English test results and other languages you know.",
    icon: Languages,
    fields: [
      {
        name: "englishTest",
        label: "English test",
        kind: "select",
        options: ["IELTS Academic", "IELTS General", "TOEFL", "PTE Academic", "Duolingo", "SAT", "Not taken yet", "Other"],
      },
      { name: "englishScore", label: "Test score", placeholder: "e.g. IELTS 6.5" },
      { name: "englishTestDate", label: "Test date", kind: "date" },
      { name: "otherLanguage", label: "Other languages", placeholder: "e.g. Japanese N5, German A2" },
    ],
  },
  {
    title: "Finance",
    description: "Helps us suggest options that fit your budget.",
    icon: Wallet,
    fields: [
      {
        name: "annualBudget",
        label: "Annual budget",
        kind: "select",
        options: ["Below $5,000", "$5,000 – $10,000", "$10,000 – $15,000", "$15,000 – $20,000", "$20,000 – $30,000", "Above $30,000", "Not decided yet"],
      },
      {
        name: "fundingSource",
        label: "Funding source",
        kind: "select",
        options: ["Self funded", "Family sponsored", "Education loan", "Scholarship", "Other"],
      },
      { name: "scholarship", label: "Interested in a scholarship?", kind: "select", options: ["Yes", "No", "Need guidance"] },
      { name: "sponsor", label: "Sponsor", placeholder: "e.g. Father, Mother, Self" },
      { name: "previousVisaRefusal", label: "Any previous visa refusal?", kind: "select", options: ["No", "Yes", "Not applicable"] },
      { name: "studyPlan", label: "Your study plan", kind: "textarea", placeholder: "Your academic goals and plans after graduation", full: true },
      { name: "additionalMessage", label: "Anything else?", kind: "textarea", placeholder: "Anything you want our team to know", full: true },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Validation                                                                */
/* -------------------------------------------------------------------------- */

function validateStep(stepIndex: number, data: FormData): Errors {
  const errors: Errors = {};

  for (const field of steps[stepIndex].fields) {
    const value = data[field.name].trim();

    if (field.required && !value) {
      errors[field.name] = `${field.label} is required.`;
      continue;
    }
    if (field.name === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) {
      errors.email = "Enter a valid email address.";
    }
    if (field.name === "phone" && value && value.replace(/\D/g, "").length < 10) {
      errors.phone = "Enter a valid phone number.";
    }
  }

  return errors;
}

/* -------------------------------------------------------------------------- */
/*  Field renderer                                                            */
/* -------------------------------------------------------------------------- */

function FormField({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (name: FieldName, value: string) => void;
}) {
  const { name, label, kind = "text", placeholder, options, required, full } = field;
  const errorId = `${name}-error`;

  return (
    <div className={cn("space-y-2", full && "sm:col-span-2")}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>

      {kind === "select" ? (
        <Select value={value || undefined} onValueChange={(v) => onChange(name, v)}>
          <SelectTrigger
            id={name}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="w-full"
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : kind === "textarea" ? (
        <Textarea
          id={name}
          rows={4}
          value={value}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <Input
          id={name}
          type={kind}
          inputMode={kind === "tel" ? "tel" : kind === "number" ? "numeric" : undefined}
          value={value}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}

      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stepper                                                                   */
/* -------------------------------------------------------------------------- */

function Stepper({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Application progress">
      {/* Mobile: compact summary */}
      <div className="space-y-2 sm:hidden">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">{steps[current].title}</span>
          <span className="text-muted-foreground">
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <Progress value={((current + 1) / steps.length) * 100} className="h-1.5" />
      </div>

      {/* Desktop: full stepper */}
      <ol className="hidden items-center sm:flex">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const Icon = step.icon;

          return (
            <li key={step.title} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={index > current}
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                className="group flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-background text-primary ring-4 ring-primary/10",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="size-4" /> : <Icon className="size-4" />}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </button>

              {index < steps.length - 1 && (
                <Separator
                  className={cn("mx-3 flex-1", done ? "bg-primary" : "bg-border")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export function PublicLeadPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isLast = step === steps.length - 1;
  const current = steps[step];
  const Icon = current.icon;

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const update = (name: FieldName, value: string) => {
    setData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const goTo = (index: number) => {
    setErrors({});
    setSubmitError("");
    setStep(index);
    scrollTop();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    if (!isLast) {
      goTo(step + 1);
      return;
    }

    // Last step: re-check earlier steps so nothing required is skipped
    for (let i = 0; i < steps.length - 1; i++) {
      const prevErrors = validateStep(i, data);
      if (Object.keys(prevErrors).length > 0) {
        goTo(i);
        setErrors(prevErrors);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          leadType: "student",
          source: "public-website",
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      setSubmitted(true);
      scrollTop();
    } catch {
      setSubmitError(
        "We couldn't submit your application. Check your connection and try again, or contact our team."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------ Success view ----------------------------- */

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Application received</CardTitle>
            <CardDescription className="text-base">
              Thank you, {data.fullName.split(" ")[0]}. Our consultants will review your
              profile and contact you on {data.phone || data.email} soon.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  /* -------------------------------- Form view ------------------------------ */

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <a href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-semibold tracking-tight">NBridge</span>
              <span className="block text-xs text-muted-foreground">
                Your global education partner
              </span>
            </span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12">
        <div className="space-y-2">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Start your study abroad application
          </h1>
          <p className="max-w-xl text-pretty text-muted-foreground">
            Fill in your profile and our consultants will help you choose the right
            country, university and course. It takes about five minutes.
          </p>
        </div>

        <Stepper current={step} onSelect={goTo} />

        <Card>
          <form onSubmit={handleSubmit} noValidate>
            <CardHeader className="flex-row items-center gap-4 pb-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">{current.title}</CardTitle>
                <CardDescription>{current.description}</CardDescription>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="grid gap-5 py-6 sm:grid-cols-2">
              {current.fields.map((field) => (
                <FormField
                  key={field.name}
                  field={field}
                  value={data[field.name]}
                  error={errors[field.name]}
                  onChange={update}
                />
              ))}
            </CardContent>

            {submitError && (
              <div className="px-6 pb-6">
                <Alert variant="destructive">
                  <CircleAlert className="size-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              </div>
            )}

            <Separator />

            <CardFooter className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => goTo(step - 1)}
                className={cn(step === 0 && "invisible")}
              >
                <ArrowLeft /> Back
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Submitting
                  </>
                ) : isLast ? (
                  <>
                    Submit application <ArrowRight />
                  </>
                ) : (
                  <>
                    Continue <ArrowRight />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NBridge. Your information is kept confidential.
        </p>
      </main>
    </div>
  );
}
