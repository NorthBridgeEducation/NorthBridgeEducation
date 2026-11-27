import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { ProfileForm } from "./profile/components/ProfileForm"
import type { ProfileApplication } from "./profile/components/ProfileSummary"
import { errorMessage } from "./profile/profileError"
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
} from "./profile/profileFields"

export { ProfileForm } from "./profile/components/ProfileForm"
export {
  educationLevels,
  emptyEducationSections,
  otherFields,
  readFields,
  readEducationInfo,
  readPersonalInfo,
} from "./profile/profileFields"
export type {
  EducationEntry,
  EducationInfo,
  EducationLevel,
  EducationSections,
  PersonalInfo,
} from "./profile/profileFields"

function qualificationLevel(qualification: string): EducationLevel | undefined {
  const value = qualification.trim().toLowerCase()

  if (value.includes("bachelor")) return "Bachelor"

  if (/^(?:hsc|higher secondary)(?:\s|$)/.test(value)) return "HSC"

  if (/^(?:ssc|secondary school)(?:\s|$)/.test(value)) return "SSC"

  return undefined
}

const educationColumns =
  "id, qualification, board, institution_name, group_major, passing_year, grading_scale, obtained_mark"

type CandidateProfileProps = {
  candidateId: string
  userId: string
  email: string
  avatarUrl?: string
}

export function CandidateProfilePage({
  candidateId,
  userId,
  email,
  avatarUrl,
}: CandidateProfileProps) {
  const [profile, setProfile] = useState<{
    personal: PersonalInfo
    education: EducationSections
    code: string | null
    otherInfo: Record<string, unknown>
  } | null>(null)
  const [error, setError] = useState("")
  const [applications, setApplications] = useState<ProfileApplication[]>([])
  const [applicationsUnavailable, setApplicationsUnavailable] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadApplications() {
      const { data, error } = await supabase
        .from("program_applications")
        .select(
          `
        program:programs (
          name,
          university:universities (
            country:countries (name)
          )
        )
      `
        )
        .eq("candidate_id", candidateId)
        .order("submitted_at", { ascending: false })
        .abortSignal(controller.signal)

      if (controller.signal.aborted) return

      if (error) {
        setApplicationsUnavailable(true)
        return
      }

      const rows = data as unknown as {
        program: {
          name: string
          university: { country: { name: string } | null } | null
        } | null
      }[]

      setApplications(
        rows.map(({ program }) => ({
          programme: program?.name ?? "",
          destination: program?.university?.country?.name ?? "",
        }))
      )
    }

    void loadApplications()
    return () => controller.abort()
  }, [candidateId])
  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [candidateResult, educationResult] = await Promise.all([
          supabase
            .from("candidates")
            .select(
              "candidate_code, first_name, last_name, date_of_birth, phone, other_info"
            )
            .eq("id", candidateId)
            .eq("auth_user_id", userId)
            .single(),
          supabase
            .from("candidate_education")
            .select(educationColumns)
            .eq("candidate_id", candidateId)
            .order("passing_year")
            .order("id"),
        ])

        if (candidateResult.error) throw candidateResult.error
        if (educationResult.error) throw educationResult.error

        const candidate = candidateResult.data
        const rowsByLevel: Record<EducationLevel, EducationEntry[]> = {
          SSC: [],
          HSC: [],
          Bachelor: [],
        }

        for (const row of educationResult.data) {
          const level = qualificationLevel(row.qualification)
          if (level) {
            rowsByLevel[level].push({
              id: row.id,
              values: readEducationInfo(row),
            })
          }
        }

        const education = emptyEducationSections()
        for (const level of educationLevels) {
          if (rowsByLevel[level].length) education[level] = rowsByLevel[level]
        }

        if (active) {
          setProfile({
            code: candidate.candidate_code,
            otherInfo: candidate.other_info ?? {},
            personal: readPersonalInfo({
              ...candidate.other_info,
              given_name: candidate.first_name,
              surname: candidate.last_name,
              date_of_birth: candidate.date_of_birth,
              number: candidate.phone,
            }),
            education,
          })
        }
      } catch (error) {
        if (active) setError(errorMessage(error))
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [candidateId, userId])

  async function savePersonal(values: PersonalInfo) {
    const givenName = values.given_name.trim()
    if (!givenName)
      throw new Error("Enter your given name in Personal Info first.")

    const otherInfo = Object.fromEntries(
      otherFields.map(({ key }) => [key, values[key].trim() || null])
    )

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
      .single()

    if (error) throw error
  }

  async function saveEducation(level: EducationLevel, entry: EducationEntry) {
    const values = entry.values

    if (!entry.id && !Object.values(values).some((value) => value.trim())) {
      throw new Error(`Enter some ${level} information first.`)
    }

    const payload = {
      institution_name: values.institution_name.trim() || null,
      board: values.board.trim() || null,
      group_major: values.group_major.trim() || null,
      passing_year: values.passing_year ? Number(values.passing_year) : null,
      grading_scale: values.grading_scale.trim() || null,
      obtained_mark: values.obtained_mark ? Number(values.obtained_mark) : null,
    }

    const query = entry.id
      ? supabase
          .from("candidate_education")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", entry.id)
          .eq("candidate_id", candidateId)
      : supabase
          .from("candidate_education")
          .insert({
            ...payload,
            candidate_id: candidateId,
            qualification: level,
          })

    const { data, error } = await query.select(educationColumns).single()
    if (error) throw error

    return { id: data.id, values: readEducationInfo(data) }
  }

  if (error)
    return (
      <p role="alert" className="text-destructive">
        {error}
      </p>
    )
  if (!profile) return <p role="status">Loading candidate profile…</p>

  return (
    <ProfileForm
      title="My Profile"
      description={
        profile.code
          ? `Candidate ID: ${profile.code}`
          : "Manage your candidate profile."
      }
      email={email}
      initialPersonal={profile.personal}
      initialEducation={profile.education}
      savePersonal={savePersonal}
      saveEducation={saveEducation}
      showCertificateDemos
      avatarUrl={avatarUrl}
      applications={applications}
      applicationsUnavailable={applicationsUnavailable}
    />
  )
}
