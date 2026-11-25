
import { useEffect, useState, type FormEvent } from "react";

import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

import {
  CandidateProfilePage,
  readPersonalInfo,
  type PersonalInfo,
} from "./CandidateProfilePage";

import { DraftProfilePage } from "./DraftProfilePage";

// Available study destinations
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

// Available degree levels
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
      personal: PersonalInfo;
      destination: string;
      degree: string;
    };

// Default profile avatar
function ProfileAvatar() {
  return (
    <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 sm:size-32">

      <svg
        viewBox="0 0 120 120"
        className="size-full"
        aria-hidden="true"
      >
        <rect
          width="120"
          height="120"
          fill="#cce1fc"
        />

        <circle
          cx="76"
          cy="56"
          r="53"
          fill="#bcd6f5"
        />

        {/* Suit */}
        <path
          d="M9 120 L17 92 Q20 85 45 79 L75 79 Q102 85 105 95 L114 120Z"
          fill="#315a78"
        />

        {/* Shirt */}
        <path
          d="M48 77 L60 90 L73 77 L83 120 L37 120Z"
          fill="#f3f6f8"
        />

        {/* Neck */}
        <path
          d="M48 65 L48 79 L60 89 L73 79 L73 65Z"
          fill="#f0b5a0"
        />

        {/* Face */}
        <ellipse
          cx="60"
          cy="49"
          rx="21"
          ry="28"
          fill="#ffd1ba"
        />

        {/* Hair */}
        <path
          d="M39 44 L38 30 Q38 17 49 17 H67 Q80 16 80 27 Q86 28 84 44 L76 42 L73 32 Q60 39 46 32 L44 42Z"
          fill="#24475e"
        />

        {/* Jacket */}
        <path
          d="M45 79 L33 89 L40 96 L34 101 L48 120 L55 120Z M75 79 L87 89 L80 96 L86 101 L72 120 L65 120Z"
          fill="#24465f"
        />

        {/* Tie */}
        <path
          d="M60 89 L66 95 L63 101 L68 120 L52 120 L57 101 L54 95Z"
          fill="#d35c62"
        />
      </svg>

    </div>
  );
}

// Welcome screen for new students
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
    <section className="mx-auto w-full max-w-xl space-y-6 py-6 sm:py-12">

      {/* Welcome message */}
      <header className="space-y-3 text-center">

        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
          <GraduationCap className="size-8" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to NorthBridge Education!
        </h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Your study abroad journey starts here.
          Tell us about your study preferences.
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
          {/* Country */}
          <section className="space-y-3">

            <h2 className="font-medium">
              Where would you like to study?
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {countries.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={country === item.value}
                  onClick={() => setCountry(item.value)}
                  className={[
                    "flex min-h-20 items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-ring",
                    country === item.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50",
                  ].join(" ")}
                >
                  <span className="text-3xl">
                    {item.flag}
                  </span>

                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>

                  {country === item.value && (
                    <CheckCircle2 className="size-5 shrink-0" />
                  )}
                </button>
              ))}
            </div>

          </section>

          {/* Programme */}
          {country && (
            <section className="space-y-3 border-t pt-5">

              <h2 className="font-medium">
                What is your preferred degree?
              </h2>

              <div className="grid gap-3 sm:grid-cols-3">
                {degrees.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={degree === item.value}
                    onClick={() => setDegree(item.value)}
                    className={[
                      "flex min-h-12 items-center justify-between gap-2 rounded-lg border p-3 text-sm font-medium",
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
          <p
            role="alert"
            className="text-sm text-destructive"
          >
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
    </section>
  );
}

// Main student profile
export function ProfilePage() {
  useEffect(() => {
    document.title = "My Profile | NorthBridge Education";
  }, []);
  const [profile, setProfile] =
    useState<ProfileState>({
      status: "loading",
    });

  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState(false);

  // Load profile information
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
            "Please sign in again.",
          );
        }

        // Check registered candidate
        const {
          data: candidate,
          error: candidateError,
        } = await supabase
          .from("candidates")
          .select(
            "id, first_name, last_name, date_of_birth, phone, other_info",
          )
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (candidateError) {
          throw candidateError;
        }

        // Load study preferences
        const {
          data: preferenceData,
          error: preferenceError,
        } = await supabase
          .from("student_study_preferences")
          .select(
            "destination_country, student_type",
          )
          .eq("user_id", user.id)
          .maybeSingle();

        if (preferenceError) {
          throw preferenceError;
        }

        const preferences =
          preferenceData as Preferences | null;

        // Existing registered candidate
        if (candidate) {
          const otherInfo =
            candidate.other_info ?? {};

          if (active) {
            setProfile({
              status: "ready",
              userId: user.id,
              email: user.email ?? "",
              candidateId: candidate.id,
              hasDraft: false,
              preferences,
              personal: readPersonalInfo({
                ...otherInfo,
                given_name: candidate.first_name,
                surname: candidate.last_name,
                date_of_birth: candidate.date_of_birth,
                number: candidate.phone,
              }),
              destination:
                preferences?.destination_country ??
                String(
                  otherInfo.destination_country ?? "",
                ),
              degree:
                preferences?.student_type ??
                String(
                  otherInfo.student_type ?? "",
                ),
            });
          }

          return;
        }

        // Check unapproved student draft
        const {
          data: draft,
          error: draftError,
        } = await supabase
          .from("draft")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (draftError) {
          throw draftError;
        }

        if (active) {
          setProfile({
            status: "ready",
            userId: user.id,
            email: user.email ?? "",
            candidateId: null,
            hasDraft: Boolean(draft),
            preferences,
            personal: readPersonalInfo(draft),
            destination:
              preferences?.destination_country ??
              String(
                draft?.destination_country ?? "",
              ),
            degree:
              String(
                draft?.student_type ||
                preferences?.student_type ||
                "",
              ),
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

  // Reload profile after editing
  function refreshProfile() {
    setEditing(false);
    setProfile({ status: "loading" });
    setAttempt((value) => value + 1);
  }

  // Loading
  if (profile.status === "loading") {
    return (
      <div
        role="status"
        className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground"
      >
        Loading your profile...
      </div>
    );
  }

  // Loading error
  if (profile.status === "error") {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">

        <UserRound className="size-10 text-muted-foreground" />

        <p className="text-sm text-muted-foreground">
          {profile.message}
        </p>

        <Button
          variant="outline"
          onClick={refreshProfile}
        >
          Try again
        </Button>

      </div>
    );
  }

  // New student welcome screen
  if (
    !profile.candidateId &&
    !profile.hasDraft &&
    !profile.preferences
  ) {
    return (
      <WelcomeForm
        userId={profile.userId}
        onSaved={(preferences) => {
          setProfile({
            ...profile,
            preferences,
            destination:
              preferences.destination_country,
            degree:
              preferences.student_type,
          });
        }}
      />
    );
  }

  // Student's display name
  const fullName =
    [
      profile.personal.given_name,
      profile.personal.surname,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "No Name";

  // Destination label
  const destinationLabel =
    countries.find(
      (item) =>
        item.value === profile.destination,
    )?.label ||
    profile.destination ||
    "Not selected";

  // Programme label
  const degreeLabel =
    degrees.find(
      (item) =>
        item.value === profile.degree,
    )?.label ||
    profile.degree ||
    "Not selected";

  return (
    <section className="mx-auto w-full space-y-3">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-5">
        <ProfileAvatar />

        <div className="min-w-0 break-words text-sm font-semibold leading-snug sm:text-base">
          <h1 className="text-lg font-bold sm:text-xl">{fullName}</h1>
          <p>{profile.email}</p>
          <p>Destination: {destinationLabel}</p>
          <p>Programme: {degreeLabel}</p>
        </div>

        {editing ? (
          <Button
            type="button"
            variant="outline"
            onClick={refreshProfile}
            className="col-span-2 h-11 sm:col-span-1"
          >
            <ArrowLeft className="size-4" />
            Back to profile
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setEditing(true)}
            className="col-span-2 h-11 min-w-24 border border-green-400 bg-green-200 font-semibold text-green-950 hover:bg-green-300 sm:col-span-1 sm:h-14"
          >
            Edit
          </Button>
        )}
      </header>

      {editing ? (
        profile.candidateId ? (
          <CandidateProfilePage
            key={profile.candidateId}
            candidateId={profile.candidateId}
            userId={profile.userId}
            email={profile.email}
          />
        ) : (
          <DraftProfilePage
            key={profile.userId}
            userId={profile.userId}
            email={profile.email}
            preferredStudentType={profile.preferences?.student_type}
          />
        )
      ) : (
        <div className="min-h-72 rounded-lg border border-dashed border-muted-foreground/45 sm:min-h-[clamp(21rem,55dvh,36rem)]" />
      )}
    </section>
  );
}
