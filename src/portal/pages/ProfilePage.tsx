
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type StudentProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

export function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        if (mounted) {
          setError("Unable to verify your student account.");
          setLoading(false);
        }
        return;
      }

      const { data, error: queryError } = await supabase
        .from("students")
        .select("id, full_name, email, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setProfile(data);
      }

      setLoading(false);
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading profile...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">ACCOUNT</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          My Profile
        </h1>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border p-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {!error && !profile && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <h2 className="font-medium">Profile not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is authenticated, but no student profile is linked yet.
          </p>
        </div>
      )}

      {profile && (
        <div className="max-w-2xl rounded-xl border bg-card p-6">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Full name</dt>
              <dd className="mt-1 text-sm font-medium">
                {profile.full_name || "Not provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="mt-1 text-sm font-medium">
                {profile.email || "Not provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Phone</dt>
              <dd className="mt-1 text-sm font-medium">
                {profile.phone || "Not provided"}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">Student ID</dt>
              <dd className="mt-1 text-sm font-medium">{profile.id}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
