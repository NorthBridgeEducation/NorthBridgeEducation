import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";
import { CandidateProfilePage } from "./CandidateProfilePage";
import { DraftProfilePage } from "./DraftProfilePage";

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      avatarUrl?: string;
      userId: string;
      email: string;
      candidateId: string | null;
    };

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { data: { user }, error: authError } =
          await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in again to open your profile.");
        }

        const { data: candidate, error: candidateError } = await supabase
          .from("candidates")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (candidateError) throw candidateError;

        if (active) {
          setProfile({
            status: "ready",
            userId: user.id,
            avatarUrl:
  typeof user.user_metadata?.avatar_url === "string"
    ? user.user_metadata.avatar_url
    : undefined,
            email: user.email ?? "",
            candidateId: candidate?.id ?? null,
          });
        }
      } catch (error) {
        if (active) {
          setProfile({
            status: "error",
            message: error instanceof Error
              ? error.message
              : "Could not load your profile. Please try again.",
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
    return <p role="status">Loading your profile…</p>;
  }

  if (profile.status === "error") {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-destructive">
          {profile.message}
        </p>
        <button
          type="button"
          className="rounded-md border px-4 py-2 text-sm font-medium"
          onClick={() => {
            setProfile({ status: "loading" });
            setAttempt((value) => value + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return profile.candidateId ? (
    <CandidateProfilePage
      key={profile.candidateId}
      avatarUrl={profile.avatarUrl}
      candidateId={profile.candidateId}
      userId={profile.userId}
      email={profile.email}
    />
  ) : (
    <DraftProfilePage
      key={profile.userId}
      userId={profile.userId}
      email={profile.email}
    />
  );
}