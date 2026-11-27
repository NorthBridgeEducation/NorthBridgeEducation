import { useState } from "react";

import { Button } from "@/components/ui/button";

export type ProfileApplication = {
  programme: string;
  destination: string;
};

type ProfileSummaryProps = {
  givenName: string;
  surname: string;
  email: string;
  avatarUrl?: string;
  applications?: ProfileApplication[];
  applicationsUnavailable?: boolean;
  editDisabled?: boolean;
  onEdit?: () => void;
};

export function ProfileSummary({
  givenName,
  surname,
  email,
  avatarUrl,
  applications = [],
  applicationsUnavailable = false,
  editDisabled = false,
  onEdit,
}: ProfileSummaryProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string>();

  const nameParts = [givenName.trim(), surname.trim()].filter(Boolean);
  const fullName = nameParts.join(" ") || "Student";
  const initials =
    nameParts.map((part) => part.charAt(0)).join("").toUpperCase() || "S";

  const destinations = [
    ...new Set(applications.map(({ destination }) => destination).filter(Boolean)),
  ];
  const programmes = [
    ...new Set(applications.map(({ programme }) => programme).filter(Boolean)),
  ];

  return (
    <section
      aria-label="Student profile summary"
      className="flex flex-wrap items-center gap-x-5 gap-y-3 py-2 sm:flex-nowrap sm:py-3"
    >
      {avatarUrl && avatarUrl !== failedAvatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailedAvatarUrl(avatarUrl)}
          className="size-20 shrink-0 rounded-full object-cover sm:size-32"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-20 shrink-0 place-items-center rounded-full bg-blue-100 text-2xl font-bold text-blue-800 sm:size-32 sm:text-4xl"
        >
          {initials}
        </span>
      )}

      <div className="min-w-0 flex-1 space-y-1">
        <h2 className="break-words text-lg font-extrabold sm:text-xl">
          {fullName}
        </h2>

        <p className="break-all text-sm font-semibold sm:text-base">
          {email || "—"}
        </p>

        <dl className="space-y-0.5 text-sm sm:text-base">
          <div>
            <dt className="inline font-bold">Destination: </dt>
            <dd className="inline break-words font-semibold">
              {destinations.join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="inline font-bold">Programme: </dt>
            <dd className="inline break-words font-semibold">
              {programmes.join(", ") || "—"}
            </dd>
          </div>
        </dl>

        {applicationsUnavailable && (
          <p role="status" className="text-sm text-muted-foreground">
            Could not load your programme applications.
          </p>
        )}
      </div>

      {onEdit && (
        <Button
          type="button"
          variant="outline"
          aria-label="Edit profile"
          disabled={editDisabled}
          onClick={onEdit}
          className="ml-auto h-11 min-w-24 shrink-0 border-green-300 bg-green-200 font-semibold text-green-950 hover:bg-green-300 hover:text-green-950 sm:h-14"
        >
          Edit
        </Button>
      )}
    </section>
  );
}