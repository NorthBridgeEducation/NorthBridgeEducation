import { CandidateProfilePage } from "../../CandidateProfilePage";
import { DraftProfilePage } from "../../DraftProfilePage";
import { ProfileError, ProfileLoading } from "../components/ProfileFeedback";
import { usePortalProfile } from "../hooks/usePortalProfile";

export function ProfilePage1() {
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
        avatarUrl={profile.avatarUrl}
        candidateId={profile.candidateId}
        userId={profile.userId}
        email={profile.email}
      />
    );
  }

  return (
    <DraftProfilePage
      key={profile.userId}
      userId={profile.userId}
      email={profile.email}
    />
  );
}