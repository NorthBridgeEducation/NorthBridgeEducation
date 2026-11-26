import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

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

export function usePortalProfile() {
  const [profile, setProfile] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in again to open your profile.");
        }

        const { data: candidate, error: candidateError } = await supabase
          .from("candidates")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (candidateError) throw candidateError;
        if (!active) return;

        const avatarUrl = user.user_metadata?.avatar_url;

        setProfile({
          status: "ready",
          userId: user.id,
          avatarUrl: typeof avatarUrl === "string" ? avatarUrl : undefined,
          email: user.email ?? "",
          candidateId: candidate?.id ?? null,
        });
      } catch (error) {
        if (!active) return;

        setProfile({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Could not load your profile. Please try again.",
        });
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [attempt]);

  function retry() {
    setProfile({ status: "loading" });
    setAttempt((value) => value + 1);
  }

  return { profile, retry };
}