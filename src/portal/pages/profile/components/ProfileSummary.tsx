import { useState } from "react"
import { Button } from "@/components/ui/button"

export type ProfileApplication = { programme: string; destination: string }

export function ProfileSummary({
  givenName,
  surname,
  email,
  avatarUrl,
  applications = [],
  applicationsUnavailable,
  editDisabled,
  onEdit,
}: {
  givenName: string
  surname: string
  email: string
  avatarUrl?: string
  applications?: ProfileApplication[]
  applicationsUnavailable?: boolean
  editDisabled: boolean
  onEdit?: () => void
}) {
  const [avatarFailed, setAvatarFailed] = useState(false)

  const nameParts = [givenName, surname]
    .map((part) => part.trim())
    .filter(Boolean)

  const studentName = nameParts.join(" ") || "Student"
  const initials =
    nameParts
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S"

  const destinations = [
    ...new Set(
      applications.map(({ destination }) => destination).filter(Boolean)
    ),
  ]
  const programmes = [
    ...new Set(applications.map(({ programme }) => programme).filter(Boolean)),
  ]

  return (
    <section
      aria-label="Student profile summary"
      className="flex flex-wrap items-center gap-x-5 gap-y-3 py-2 sm:flex-nowrap sm:py-3"
    >
      {avatarUrl && !avatarFailed ? (
        <img
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setAvatarFailed(true)}
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
        <h2 className="text-lg leading-tight font-extrabold break-words sm:text-xl">
          {studentName}
        </h2>
        <p className="text-sm font-semibold break-all sm:text-base">{email}</p>

        <dl className="space-y-0.5 text-sm sm:text-base">
          <div>
            <dt className="inline font-bold">Destination: </dt>
            <dd className="inline font-semibold break-words">
              {destinations.join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="inline font-bold">Programme: </dt>
            <dd className="inline font-semibold break-words">
              {programmes.join(", ") || "—"}
            </dd>
          </div>
        </dl>

        {applicationsUnavailable && (
          <p className="text-sm text-muted-foreground">
            Could not load your programme applications.
          </p>
        )}
      </div>

      {onEdit && (
        <Button
          type="button"
          variant="outline"
          aria-label="Edit profile"
          className="ml-auto h-11 min-w-24 shrink-0 rounded-lg border-green-300 bg-green-200 font-semibold text-green-950 hover:bg-green-300 hover:text-green-950 sm:h-14"
          disabled={editDisabled}
          onClick={onEdit}
        >
          Edit
        </Button>
      )}
    </section>
  )
}
