
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  MapPin,
  GraduationCap,
  CalendarDays,
  UserRound,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CandidateStatus =
  | "In Review"
  | "Documents Pending"
  | "Offer Received"
  | "Completed";

type Candidate = {
  id: string;
  name: string;
  email: string;
  country: string;
  education: string;
  status: CandidateStatus;
  applied: string;
};

const statusStyles: Record<CandidateStatus, string> = {
  "In Review":
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  "Documents Pending":
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "Offer Received":
    "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  Completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

export function CandidateProfilePage() {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  const candidate = useMemo(() => {
    try {
      const saved = localStorage.getItem("nbridge_candidates");
      const candidates: Candidate[] = saved ? JSON.parse(saved) : [];

      return candidates.find((item) => item.id === candidateId);
    } catch {
      return undefined;
    }
  }, [candidateId]);

  if (!candidate) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <UserRound className="size-6 text-muted-foreground" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          Candidate not found
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          This candidate may have been removed or does not exist.
        </p>

        <Button
          variant="outline"
          className="mt-5"
          onClick={() => navigate("/app/candidate")}
        >
          <ArrowLeft />
          Back to Candidates
        </Button>
      </div>
    );
  }

  const initials = candidate.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Breadcrumb and back */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Management <span className="mx-2">/</span>
          <button
            onClick={() => navigate("/app/candidate")}
            className="hover:text-foreground"
          >
            Candidates
          </button>
          <span className="mx-2">/</span>
          <span className="text-foreground">Profile</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/app/candidate")}
        >
          <ArrowLeft />
          Back to Candidates
        </Button>
      </div>

      {/* Profile header */}
      <Card className="gap-0 py-0 shadow-none">
        <CardContent className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
              {initials}
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">
                {candidate.name}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {candidate.id}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {candidate.email}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center rounded-md px-3 py-1.5 text-xs font-medium ${statusStyles[candidate.status]}`}
          >
            {candidate.status}
          </span>
        </CardContent>
      </Card>

      {/* Profile information */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="gap-4 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Personal information
            </CardTitle>
            <CardDescription>
              Candidate details and basic information.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <InfoItem
                icon={UserRound}
                label="Full name"
                value={candidate.name}
              />

              <InfoItem
                icon={Mail}
                label="Email address"
                value={candidate.email}
              />

              <InfoItem
                icon={MapPin}
                label="Destination"
                value={candidate.country}
              />

              <InfoItem
                icon={GraduationCap}
                label="Education"
                value={candidate.education}
              />
            </div>
          </CardContent>
        </Card>

        {/* Application overview */}
        <Card className="gap-4 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Application overview
            </CardTitle>
            <CardDescription>
              Current application information.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <InfoItem
              icon={FileText}
              label="Candidate ID"
              value={candidate.id}
            />

            <InfoItem
              icon={CalendarDays}
              label="Applied date"
              value={candidate.applied}
            />

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Application status
              </p>

              <p className="mt-2 text-sm font-medium">
                {candidate.status}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Future sections */}
      <Card className="gap-3 border-dashed shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            Candidate workspace
          </CardTitle>
          <CardDescription>
            Additional candidate management tools will be available here.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Documents", "Application history", "Notes"].map((item) => (
              <div
                key={item}
                className="rounded-lg border bg-muted/20 p-4"
              >
                <p className="text-sm font-medium">{item}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
