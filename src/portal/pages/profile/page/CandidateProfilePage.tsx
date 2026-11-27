import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { ProfileForm } from "../components/ProfileForm";
import type { ProfileApplication } from "../components/ProfileSummary";
import {
  educationLevels,
  emptyEducationSections,
  otherFields,
  readEducationInfo,
  readPersonalInfo,
  type EducationEntry,
  type EducationLevel,
  type EducationSections,
  type PersonalInfo,
} from "../profileFields";

const educationColumns =
  "id, qualification, board, institution_name, group_major, passing_year, grading_scale, obtained_mark";

type CandidateProfileProps = {
  candidateId: string;
  userId: string;
  email: string;
  avatarUrl?: string;
};

type CandidateProfileData = {
  personal: PersonalInfo;
  education: EducationSections;
  otherInfo: Record<string, unknown>;
};

type ApplicationRow = {
  program: {
    name: string;
    university: { country: { name: string } | null } | null;
  } | null;
};

function qualificationLevel(qualification: string): EducationLevel | undefined {
  const value = qualification.trim().toLowerCase();

  if (value.includes("bachelor")) return "Bachelor";
  if (/^(?:hsc|higher secondary)(?:\s|$)/.test(value)) return "HSC";
  if (/^(?:ssc|secondary school)(?:\s|$)/.test(value)) return "SSC";

  return undefined;
}

export function CandidateProfilePage({
  candidateId,
  userId,
  email,
  avatarUrl,
}: CandidateProfileProps) {
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [applications, setApplications] = useState<ProfileApplication[]>([]);
  const [applicationsUnavailable, setApplicationsUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const [candidateResult, educationResult] = await Promise.all([
          supabase
            .from("candidates")
            .select("first_name, last_name, date_of_birth, phone, other_info")
            .eq("id", candidateId)
            .eq("auth_user_id", userId)
            .abortSignal(controller.signal)
            .single(),
          supabase
            .from("candidate_education")
            .select(educationColumns)
            .eq("candidate_id", candidateId)
            .order("passing_year")
            .order("id")
            .abortSignal(controller.signal),
        ]);

        if (controller.signal.aborted) return;
        if (candidateResult.error) throw candidateResult.error;
        if (educationResult.error) throw educationResult.error;

        const candidate = candidateResult.data;
        const otherInfo = candidate.other_info ?? {};

        const rowsByLevel: EducationSections = {
          SSC: [],
          HSC: [],
          Bachelor: [],
        };

        for (const row of educationResult.data) {
          const level = qualificationLevel(row.qualification);

          if (level) {
            rowsByLevel[level].push({
              id: row.id,
              values: readEducationInfo(row),
            });
          }
        }

        const education = emptyEducationSections();

        for (const level of educationLevels) {
          if (rowsByLevel[level].length > 0) {
            education[level] = rowsByLevel[level];
          }
        }

        setProfile({
          otherInfo,
          education,
          personal: readPersonalInfo({
            ...otherInfo,
            given_name: candidate.first_name,
            surname: candidate.last_name,
            date_of_birth: candidate.date_of_birth,
            number: candidate.phone,
          }),
        });
      } catch {
        if (!controller.signal.aborted) {
          setLoadError("Could not load your candidate profile. Please try again.");
        }
      }
    }

    async function loadApplications() {
      try {
        const { data, error } = await supabase
          .from("program_applications")
          .select(`
            program:programs (
              name,
              university:universities (
                country:countries (name)
              )
            )
          `)
          .eq("candidate_id", candidateId)
          .order("submitted_at", { ascending: false })
          .abortSignal(controller.signal);

        if (controller.signal.aborted) return;
        if (error) throw error;

        const rows = data as unknown as ApplicationRow[];

        setApplications(
          rows.map(({ program }) => ({
            programme: program?.name ?? "",
            destination: program?.university?.country?.name ?? "",
          })),
        );
      } catch {
        if (!controller.signal.aborted) {
          setApplicationsUnavailable(true);
        }
      }
    }

    void loadProfile();
    void loadApplications();

    return () => controller.abort();
  }, [candidateId, userId]);

  async function savePersonal(values: PersonalInfo) {
    const givenName = values.given_name.trim();

    if (!givenName) {
      throw new Error("Enter your given name in Personal Info first.");
    }

    const otherInfo = Object.fromEntries(
      otherFields.map(({ key }) => [key, values[key].trim() || null]),
    );

    const { error } = await supabase
      .from("candidates")
      .update({
        first_name: givenName,
        last_name: values.surname.trim() || null,
        date_of_birth: values.date_of_birth || null,
        phone: values.number.trim() || null,
        other_info: { ...profile?.otherInfo, ...otherInfo },
      })
      .eq("id", candidateId)
      .eq("auth_user_id", userId)
      .select("id")
      .single();

    if (error) throw error;
  }

  async function saveEducation(
    level: EducationLevel,
    entry: EducationEntry,
  ): Promise<EducationEntry> {
    const { values } = entry;

    if (!entry.id && !Object.values(values).some((value) => value.trim())) {
      throw new Error(`Enter some ${level} information first.`);
    }

    const payload = {
      institution_name: values.institution_name.trim() || null,
      board: values.board.trim() || null,
      group_major: values.group_major.trim() || null,
      passing_year: values.passing_year ? Number(values.passing_year) : null,
      grading_scale: values.grading_scale.trim() || null,
      obtained_mark: values.obtained_mark ? Number(values.obtained_mark) : null,
    };

    const query = entry.id
      ? supabase
          .from("candidate_education")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", entry.id)
          .eq("candidate_id", candidateId)
      : supabase.from("candidate_education").insert({
          ...payload,
          candidate_id: candidateId,
          qualification: level,
        });

    const { data, error } = await query.select(educationColumns).single();

    if (error) throw error;

    return { id: data.id, values: readEducationInfo(data) };
  }

  if (loadError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {loadError}
      </p>
    );
  }

  if (!profile) {
    return <p role="status">Loading candidate profile…</p>;
  }

  return (
    <ProfileForm
      email={email}
      avatarUrl={avatarUrl}
      applications={applications}
      applicationsUnavailable={applicationsUnavailable}
      initialPersonal={profile.personal}
      initialEducation={profile.education}
      savePersonal={savePersonal}
      saveEducation={saveEducation}
      showCertificateDemos
    />
  );
}