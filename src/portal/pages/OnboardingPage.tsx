import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FolderOpen,
  Globe,
  GraduationCap,
  Library,
  RotateCcw,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

// DEMO DATA — replace with database results during integration.
const countries = [
  { id: "slovenia", name: "Slovenia", code: "SI", region: "Europe", flag: "🇸🇮" },
  { id: "south-korea", name: "South Korea", code: "KR", region: "Asia", flag: "🇰🇷" },
];

const studyLevels = [
  { id: "bachelor", name: "Bachelor's degree", description: "Undergraduate studies", icon: GraduationCap },
  { id: "master", name: "Master's degree", description: "Postgraduate studies", icon: BookOpen },
  { id: "phd", name: "PhD", description: "Doctoral studies and research", icon: Library },
];

const steps = [
  { title: "Welcome", description: "Get started", icon: UserRound },
  { title: "Study destination", description: "Choose a country", icon: Globe },
  { title: "Study level", description: "Choose your qualification", icon: GraduationCap },
  { title: "Review", description: "Confirm your preferences", icon: ClipboardCheck },
];

export type OnboardingValues = {
  countryId: string;
  studyLevelId: string;
};

type StepProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function StepHeading({ eyebrow, title, description }: StepProps) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#41678b] dark:text-sky-300">
        {eyebrow}
      </p>
      <h2 id="onboarding-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
}

function ChoiceCard({ selected, onSelect, icon, title, description }: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-24 w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-5 ${
        selected
          ? "border-[#326a85] bg-[#eef6f9] ring-1 ring-[#326a85] dark:border-sky-400 dark:bg-sky-950/30 dark:ring-sky-400"
          : "border-border bg-card hover:border-muted-foreground/50 hover:bg-muted/40"
      }`}
    >
      <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${selected ? "bg-[#122c46] text-white dark:bg-sky-300 dark:text-slate-950" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block font-semibold leading-tight">{title}</span>
        <span className="block text-sm leading-snug text-muted-foreground">{description}</span>
      </span>
      <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-full border ${selected ? "border-[#326a85] bg-[#326a85] text-white dark:border-sky-300 dark:bg-sky-300 dark:text-slate-950" : "border-muted-foreground/40"}`}>
        {selected && <Check className="size-3.5" />}
      </span>
    </button>
  );
}

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<OnboardingValues>({ countryId: "", studyLevelId: "" });
  const [completed, setCompleted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const initialRender = useRef(true);

  const country = countries.find((item) => item.id === values.countryId);
  const level = studyLevels.find((item) => item.id === values.studyLevelId);
  const progress = completed ? 100 : Math.round((step / steps.length) * 100);
  const canContinue = step === 0 || (step === 1 && !!country) || (step >= 2 && !!country && !!level);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    contentRef.current?.focus({ preventScroll: true });
  }, [step, completed]);

  function handleNext() {
    if (!canContinue || completed) return;
    if (step < steps.length - 1) {
      setStep((previous) => previous + 1);
      return;
    }
    // Integration boundary: later persist `values` here and show success
    // only after the database confirms the save. No persistence in this demo.
    setCompleted(true);
  }

  function handleReset() {
    setValues({ countryId: "", studyLevelId: "" });
    setStep(0);
    setCompleted(false);
  }

  return (
    <div className="mx-auto w-full max-w-5xl py-2 sm:py-5 lg:py-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#122c46] text-white">
            <GraduationCap className="size-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight sm:text-lg">NorthBridge Education</h1>
            <p className="text-xs text-muted-foreground">Student onboarding</p>
          </div>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">UI preview</span>
      </header>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm xl:grid xl:min-h-[650px] xl:grid-cols-[268px_minmax(0,1fr)]">
        {/* Desktop step navigation */}
        <aside className="relative hidden flex-col overflow-hidden bg-[#122c46] p-7 text-white xl:flex">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full border border-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full border border-white/10" />
          <p className="relative text-xs font-medium uppercase tracking-[0.18em] text-sky-200">Student workspace</p>
          <h2 className="relative mt-4 text-2xl font-semibold leading-tight tracking-tight">Your journey starts here.</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">A few simple steps to help us understand your study goals.</p>

          <nav aria-label="Onboarding progress" className="mt-10">
            <ol className="space-y-1">
              {steps.map(({ title, description, icon: Icon }, index) => {
                const done = completed || index < step;
                const current = !completed && index === step;
                return (
                  <li key={title} className="relative pb-5 last:pb-0" aria-current={current ? "step" : undefined}>
                    {index < steps.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[17px] top-9 w-px bg-white/15" />}
                    <div className="relative flex items-start gap-3">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-full border ${done ? "border-teal-300/30 bg-teal-300/15 text-teal-200" : current ? "border-white bg-white text-[#122c46]" : "border-white/20 text-slate-300"}`}>
                        {done ? <Check className="size-4" aria-hidden="true" /> : <Icon className="size-4" aria-hidden="true" />}
                      </span>
                      <div className="pt-0.5">
                        <p className={`text-sm font-semibold ${current || done ? "text-white" : "text-slate-300"}`}>{title}</p>
                        <p className="mt-1 text-xs leading-snug text-slate-300">{description}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="mt-auto border-t border-white/15 pt-5">
            <p className="text-xs font-semibold text-slate-100">One step at a time.</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">Your journey. Your future. Our guidance.</p>
          </div>
        </aside>

        <section aria-labelledby="onboarding-heading" className="flex min-w-0 flex-col">
          {/* Shared progress header */}
          <div className="border-b px-5 py-5 sm:px-8 xl:px-10">
            <div className="flex items-center justify-between gap-3 text-xs font-medium">
              <span className="text-muted-foreground">{completed ? "All steps completed" : `Step ${step + 1} of ${steps.length} · ${steps[step].title}`}</span>
              <span className="tabular-nums text-foreground">{progress}% complete</span>
            </div>
            <div role="progressbar" aria-label="Onboarding completion" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="mt-3 flex gap-1.5">
              {steps.map(({ title }, index) => (
                <span key={title} className={`h-1.5 flex-1 rounded-full ${completed || index < step ? "bg-[#326a85] dark:bg-sky-400" : index === step ? "bg-[#326a85]/40 dark:bg-sky-400/40" : "bg-muted"}`} />
              ))}
            </div>
          </div>

          <div ref={contentRef} tabIndex={-1} className="flex-1 space-y-7 px-5 py-7 outline-none sm:px-8 sm:py-9 xl:px-10">
            {!completed && step === 0 && (
              <>
                <div className="grid size-16 place-items-center rounded-2xl bg-[#eaf1f7] text-[#122c46] dark:bg-sky-950 dark:text-sky-200">
                  <GraduationCap className="size-8" aria-hidden="true" />
                </div>
                <StepHeading eyebrow="Welcome to NorthBridge" title="Let's plan your next chapter." description="Tell us where and what you would like to study. We'll guide you through the next steps of your international education journey." />
                <div className="rounded-xl border bg-muted/25 p-4 sm:p-5">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">What to expect</p>
                  <div className="space-y-4">
                    {[
                      { icon: Globe, title: "Choose your study preferences", description: "Tell us your preferred destination and study level." },
                      { icon: UserRound, title: "Complete your student profile", description: "Provide your personal and academic information in the next stage." },
                      { icon: FolderOpen, title: "Prepare supporting documents", description: "Have your passport and academic records ready for later." },
                    ].map(({ icon: Icon, title, description }) => (
                      <div key={title} className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-card text-foreground"><Icon className="size-5" aria-hidden="true" /></span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!completed && step === 1 && (
              <>
                <StepHeading eyebrow="Study destination" title="Where would you like to study?" description="Choose the country you are most interested in. This is a preference, not a university application." />
                <div role="group" aria-label="Preferred study destination" className="space-y-3">
                  {countries.map((item) => (
                    <ChoiceCard key={item.id} selected={values.countryId === item.id} onSelect={() => setValues((previous) => previous.countryId === item.id ? previous : { countryId: item.id, studyLevelId: "" })} icon={<span className="text-sm font-bold tracking-wider" aria-hidden="true">{item.code}</span>} title={`${item.flag} ${item.name}`} description={item.region} />
                  ))}
                </div>
              </>
            )}

            {!completed && step === 2 && (
              <>
                <StepHeading eyebrow="Study level" title="What would you like to pursue?" description={`Choose your preferred level of study${country ? ` in ${country.name}` : ""}.`} />
                {country && <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm"><Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="text-muted-foreground">Destination</span><ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="font-medium">{country.name}</span></div>}
                <div role="group" aria-label="Preferred study level" className="space-y-3">
                  {studyLevels.map(({ id, name, description, icon: Icon }) => (
                    <ChoiceCard key={id} selected={values.studyLevelId === id} onSelect={() => setValues((previous) => ({ ...previous, studyLevelId: id }))} icon={<Icon className="size-6" aria-hidden="true" />} title={name} description={description} />
                  ))}
                </div>
              </>
            )}

            {!completed && step === 3 && (
              <>
                <StepHeading eyebrow="Review your choices" title="Does everything look right?" description="Check your study preferences before finishing this step of onboarding." />
                <div className="divide-y rounded-xl border">
                  {[
                    { label: "Study destination", value: country?.name ?? "—", icon: Globe, target: 1 },
                    { label: "Study level", value: level?.name ?? "—", icon: GraduationCap, target: 2 },
                  ].map(({ label, value, icon: Icon, target }) => (
                    <div key={label} className="flex items-center gap-3 p-4 sm:p-5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted"><Icon className="size-5" aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 break-words text-sm font-semibold sm:text-base">{value}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" aria-label={`Edit ${label.toLowerCase()}`} onClick={() => setStep(target)}>Edit</Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
                  <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-muted-foreground">Next, you will complete your personal and academic information and prepare your supporting documents once the full portal is connected.</p>
                </div>
              </>
            )}

            {completed && (
              <div className="flex flex-col items-center gap-5 py-5 text-center sm:py-10">
                <span className="grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><CheckCircle2 className="size-10" aria-hidden="true" /></span>
                <StepHeading eyebrow="Preferences complete" title="You're ready for the next step." description="You've completed the onboarding preview. Your study preferences are shown below." />
                <dl className="w-full max-w-sm divide-y rounded-xl border text-left">
                  <div className="flex flex-wrap justify-between gap-2 p-4"><dt className="text-sm text-muted-foreground">Destination</dt><dd className="text-sm font-semibold">{country?.name}</dd></div>
                  <div className="flex flex-wrap justify-between gap-2 p-4"><dt className="text-sm text-muted-foreground">Study level</dt><dd className="text-sm font-semibold">{level?.name}</dd></div>
                </dl>
                <p role="status" className="text-xs text-muted-foreground">UI demo only. No information has been saved.</p>
              </div>
            )}
          </div>

          {/* Navigation stays in a consistent position across steps. */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t bg-card px-5 py-4 sm:px-8 sm:py-5 xl:px-10">
            {completed ? (
              <Button type="button" variant="outline" className="ml-auto min-h-11" onClick={handleReset}><RotateCcw className="size-4" aria-hidden="true" /> Restart demo</Button>
            ) : (
              <>
                {step > 0 && <Button type="button" variant="outline" className="min-h-11" onClick={() => setStep((previous) => previous - 1)}><ArrowLeft className="size-4" aria-hidden="true" /> Back</Button>}
                <Button type="button" onClick={handleNext} disabled={!canContinue} className="ml-auto min-h-11 min-w-32 bg-[#122c46] px-5 text-white hover:bg-[#204664] focus-visible:ring-[#326a85] dark:bg-sky-200 dark:text-[#122c46] dark:hover:bg-sky-300">
                  {step === 0 ? "Get started" : step === steps.length - 1 ? "Finish onboarding" : "Continue"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </>
            )}
          </footer>
        </section>
      </div>
      <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">NorthBridge Education · Your journey. Your future. Our guidance.</p>
    </div>
  );
}
