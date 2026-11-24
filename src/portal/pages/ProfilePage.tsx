
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  GraduationCap,
  Globe2,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

import { EmptyState } from "../components/EmptyState";
import { CandidateProfilePage } from "./CandidateProfilePage";
import { DraftProfilePage } from "./DraftProfilePage";

const countries = [
  {
    value: "SI",
    label: "Slovenia",
    flag: "🇸🇮",
  },
  {
    value: "KR",
    label: "South Korea",
    flag: "🇰🇷",
  },
] as const;

const degrees = [
  {
    value: "bachelor",
    label: "Bachelor",
  },
  {
    value: "master",
    label: "Master's",
  },
  {
    value: "phd",
    label: "PhD",
  },
] as const;

type Country = (typeof countries)[number]["value"];
type StudentType = (typeof degrees)[number]["value"];

type Preferences = {
  destination_country: Country;
  student_type: StudentType;
};

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      userId: string;
      email: string;
      candidateId: string | null;
      hasDraft: boolean;
      preferences: Preferences | null;
    };

function WelcomeForm({
  userId,
  onSaved,
}: {
  userId: string;
  onSaved: (preferences: Preferences) => void;
}) {
  const [country, setCountry] =
    useState<Country | "">("");

  const [degree, setDegree] =
    useState<StudentType | "">("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!country || !degree || saving) return;

    setSaving(true);
    setError("");

    try {
      const preferences: Preferences = {
        destination_country: country,
        student_type: degree,
      };

      const { error: insertError } = await supabase
        .from("student_study_preferences")
        .insert({
          user_id: userId,
          ...preferences,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          const { data, error: readError } =
            await supabase
              .from("student_study_preferences")
              .select("destination_country, student_type")
              .eq("user_id", userId)
              .single();

          if (readError) throw readError;

          onSaved(data as Preferences);
          return;
        }

        throw insertError;
      }

      onSaved(preferences);
    } catch {
      setError(
        "Could not save your preferences. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-4 sm:py-10">

      {/* Welcome message */}
      <header className="space-y-3 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
          <GraduationCap className="size-8" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome to NorthBridge Education!
        </h1>

        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Your study abroad journey starts here.
          Tell us about your study preferences to get started.
        </p>
      </header>

      <form
        onSubmit={handleContinue}
        className="space-y-6 rounded-xl border bg-card p-4 sm:p-6"
      >
        <fieldset
          disabled={saving}
          className="min-w-0 space-y-6"
        >
          {/* Country selection */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe2 className="size-5" />

              <h2 className="font-semibold">
                Where would you like to study?
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {countries.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={country === item.value}
                  onClick={() => {
                    setCountry(item.value);
                    setError("");
                  }}
                  className={[
                    "flex min-h-20 items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-ring",
                    country === item.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50",
                  ].join(" ")}
                >
                  <span
                    className="text-3xl"
                    aria-hidden="true"
                  >
                    {item.flag}
                  </span>

                  <span className="flex-1 font-medium">
                    {item.label}
                  </span>

                  {country === item.value && (
                    <CheckCircle2 className="size-5 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Preferred degree */}
          {country && (
            <section className="space-y-3 border-t pt-5">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-5" />

                <h2 className="font-semibold">
                  What is your preferred degree?
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {degrees.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={degree === item.value}
                    onClick={() => {
                      setDegree(item.value);
                      setError("");
                    }}
                    className={[
                      "flex min-h-14 items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm font-medium",
                      "focus-visible:outline-2 focus-visible:outline-ring",
                      degree === item.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted/50",
                    ].join(" ")}
                  >
                    {item.label}

                    {degree === item.value && (
                      <CheckCircle2 className="size-4 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={!country || !degree || saving}
          className="h-11 w-full"
        >
          {saving ? "Saving..." : "Continue"}

          {!saving && (
            <ArrowRight className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

export function ProfilePage() {
  const [profile, setProfile] =
    useState<ProfileState>({
      status: "loading",
    });

  const [attempt, setAttempt] = useState(0);
  const [showDraft, setShowDraft] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "Please sign in again to open your profile.",
          );
        }

        // Existing registered candidate
        const { data: candidate, error: candidateError } =
          await supabase
            .from("candidates")
            .select("id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (candidateError) throw candidateError;

        if (candidate) {
          if (active) {
            setProfile({
              status: "ready",
              userId: user.id,
              email: user.email ?? "",
              candidateId: candidate.id,
              hasDraft: false,
              preferences: null,
            });
          }

          return;
        }

        // Check saved draft and study preferences
        const [draftResult, preferencesResult] =
          await Promise.all([
            supabase
              .from("draft")
              .select("user_id")
              .eq("user_id", user.id)
              .maybeSingle(),

            supabase
              .from("student_study_preferences")
              .select("destination_country, student_type")
              .eq("user_id", user.id)
              .maybeSingle(),
          ]);

        if (draftResult.error) {
          throw draftResult.error;
        }

        if (preferencesResult.error) {
          throw preferencesResult.error;
        }

        if (active) {
          setProfile({
            status: "ready",
            userId: user.id,
            email: user.email ?? "",
            candidateId: null,
            hasDraft: Boolean(draftResult.data),
            preferences:
              preferencesResult.data as Preferences | null,
          });
        }
      } catch {
        if (active) {
          setProfile({
            status: "error",
            message:
              "Could not load your profile. Please try again.",
          });
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [attempt]);

  if (profile.status === "loading") {
    return (
      <div
        role="status"
        className="flex min-h-[250px] items-center justify-center text-sm text-muted-foreground"
      >
        Loading your profile...
      </div>
    );
  }

  if (profile.status === "error") {
    return (
      <EmptyState
        icon={UserRound}
        title="Could not load your profile"
        description={profile.message}
      >
        <Button
          variant="outline"
          onClick={() => {
            setProfile({ status: "loading" });
            setAttempt((value) => value + 1);
          }}
        >
          Try again
        </Button>
      </EmptyState>
    );
  }

  // Registered candidate: keep existing profile
  if (profile.candidateId) {
    return (
      <CandidateProfilePage
        key={profile.candidateId}
        candidateId={profile.candidateId}
        userId={profile.userId}
        email={profile.email}
      />
    );
  }

  // Existing draft or student wants to complete profile
  if (profile.hasDraft || showDraft) {
    return (
      <DraftProfilePage
        key={profile.userId}
        userId={profile.userId}
        email={profile.email}
        preferredStudentType={
          profile.preferences?.student_type
        }
      />
    );
  }

  // Brand-new student: only two questions
  if (!profile.preferences) {
    return (
      <WelcomeForm
        userId={profile.userId}
        onSaved={(preferences) => {
          setProfile({
            ...profile,
            preferences,
          });
        }}
      />
    );
  }

  const selectedCountry = countries.find(
    (item) =>
      item.value ===
      profile.preferences?.destination_country,
  );

  const selectedDegree = degrees.find(
    (item) =>
      item.value === profile.preferences?.student_type,
  );

  // Preferences saved, but profile not completed
  return (
    <section className="mx-auto max-w-4xl space-y-6">

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          My Profile
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your personal and academic information.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card p-4 text-sm">

        <div className="flex items-center gap-2">
          <span>{selectedCountry?.flag}</span>
          <span className="font-medium">
            {selectedCountry?.label}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <GraduationCap className="size-4" />
          {selectedDegree?.label}
        </div>

      </div>

      <EmptyState
        icon={UserRound}
        title="Your profile is not completed yet"
        description="Complete your profile when you are ready. Your information will help us guide you through your study abroad journey."
      >
        <Button onClick={() => setShowDraft(true)}>
          Complete profile
          <ArrowRight className="size-4" />
        </Button>
      </EmptyState>

    </section>
  );
}
