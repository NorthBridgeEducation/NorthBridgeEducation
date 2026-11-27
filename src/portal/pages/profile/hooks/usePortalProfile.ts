import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      userId: string;
      email: string;
      avatarUrl?: string;
      candidateId: string | null;
    };

export function usePortalProfile() {
  const [profile, setProfile] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (controller.signal.aborted) return;

        if (authError || !user) {
          throw new Error("Please sign in again to open your profile.");
        }

        const { data: candidate, error: candidateError } = await supabase
          .from("candidates")
          .select("id")
          .eq("auth_user_id", user.id)
          .abortSignal(controller.signal)
          .maybeSingle();

        if (controller.signal.aborted) return;

        if (candidateError) {
          throw new Error("Could not load your profile. Please try again.");
        }

        const avatarUrl = user.user_metadata?.avatar_url;

        setProfile({
          status: "ready",
          userId: user.id,
          email: user.email ?? "",
          avatarUrl: typeof avatarUrl === "string" ? avatarUrl : undefined,
          candidateId: candidate?.id ?? null,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

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

    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setProfile({ status: "loading" });
    setAttempt((previous) => previous + 1);
  }

  return { profile, retry };
}