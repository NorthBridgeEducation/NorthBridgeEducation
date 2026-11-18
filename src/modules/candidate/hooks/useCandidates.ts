
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export interface CandidateDB {
  id: string;
  candidate_code: string | null;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  candidateCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  authUserId: string | null;
  createdAt: string;
  updatedAt: string;

  // Dummy fields: database schema-এ এখনো নেই
  nationality: string;
  gender: string;
  status: string;
  currentStage: string;
  passportNumber: string;
  country: string;
}

const mockExtras = [
  {
    nationality: "Bangladeshi",
    gender: "Male",
    status: "Active",
    currentStage: "Medical",
    passportNumber: "BD1234567",
    country: "Saudi Arabia",
  },
  {
    nationality: "Bangladeshi",
    gender: "Female",
    status: "Processing",
    currentStage: "Visa",
    passportNumber: "BD7654321",
    country: "Japan",
  },
];

function mapCandidate(
  row: CandidateDB,
  index: number
): Candidate {
  const mock = mockExtras[index % mockExtras.length];

  return {
    id: row.id,
    candidateCode: row.candidate_code ?? "Not assigned",
    firstName: row.first_name,
    lastName: row.last_name ?? "",
    fullName: [row.first_name, row.last_name]
      .filter(Boolean)
      .join(" "),
    dateOfBirth: row.date_of_birth ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    authUserId: row.auth_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    ...mock,
  };
}

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCandidates() {
      setLoading(true);

      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setCandidates(
        (data ?? []).map((row, index) =>
          mapCandidate(row as CandidateDB, index)
        )
      );

      setError(null);
      setLoading(false);
    }

    fetchCandidates();

    const channel = supabase
      .channel("candidates-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidates",
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "INSERT") {
            const newCandidate = mapCandidate(
              payload.new as CandidateDB,
              0
            );

            setCandidates((previous) => [
              newCandidate,
              ...previous.filter(
                (item) => item.id !== newCandidate.id
              ),
            ]);
          }

          if (payload.eventType === "UPDATE") {
            const updatedRow = payload.new as CandidateDB;

            setCandidates((previous) =>
              previous.map((item, index) =>
                item.id === updatedRow.id
                  ? {
                      ...mapCandidate(updatedRow, index),
                      // Existing dummy values preserve করা
                      nationality: item.nationality,
                      gender: item.gender,
                      status: item.status,
                      currentStage: item.currentStage,
                      passportNumber: item.passportNumber,
                      country: item.country,
                    }
                  : item
              )
            );
          }

          if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;

            setCandidates((previous) =>
              previous.filter((item) => item.id !== deletedId)
            );
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    candidates,
    loading,
    error,
    totalCandidates: candidates.length,
  };
}
