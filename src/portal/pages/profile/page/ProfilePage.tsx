import { ProfileError, ProfileLoading } from "../components/ProfileFeedback";
import { usePortalProfile } from "../hooks/usePortalProfile";
import { CandidateProfilePage } from "./CandidateProfilePage";
import { DraftProfilePage } from "./DraftProfilePage";

export function ProfilePage() {
  const { profile, retry } = usePortalProfile();

  if (profile.status === "loading") {
    return <ProfileLoading />;
  }

  if (profile.status === "error") {
    return <ProfileError message={profile.message} onRetry={retry} />;
  }

  if (profile.candidateId) {
    return (
      <CandidateProfilePage
        key={profile.candidateId}
        candidateId={profile.candidateId}
        userId={profile.userId}
        email={profile.email}
        avatarUrl={profile.avatarUrl}
      />
    );
  }

  return (
    <DraftProfilePage
      key={profile.userId}
      userId={profile.userId}
      email={profile.email}
      avatarUrl={profile.avatarUrl}
    />
  );
}