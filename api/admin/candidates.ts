
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "./_lib/session.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "no-store");

 if (req.method !== "GET" && req.method !== "POST") {
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: "Method not allowed." });
}

  // Existing custom Admin Authentication
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({
      message: "Unauthorized. Admin login required.",
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const serviceRoleKey =
  process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({
      message: "Supabase server environment variables are missing.",
    });
  }

  try {
    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
if (req.method === "POST") {
  if (req.headers["content-type"]?.split(";")[0].trim() !== "application/json") {
    return res.status(415).json({ message: "Send an application/json body." });
  }

  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ message: "Invalid candidate information." });
  }

  const firstName = typeof body.first_name === "string" ? body.first_name.trim() : "";
  const lastName = typeof body.last_name === "string" ? body.last_name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const birthDate = typeof body.date_of_birth === "string" ? body.date_of_birth.trim() : "";

  if (!firstName) {
    return res.status(400).json({ message: "First name is required." });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  if (birthDate) {
    const parsed = new Date(`${birthDate}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== birthDate
    ) {
      return res.status(400).json({ message: "Enter a valid date of birth." });
    }
  }

  const { data, error } = await supabase
    .from("candidates")
    .insert({
      first_name: firstName,
      last_name: lastName || null,
      date_of_birth: birthDate || null,
      phone: phone || null,
      email: email || null,
    })
    .select("id, candidate_code")
    .single();

  if (error?.code === "23505") {
    return res.status(409).json({
      message: "A candidate with the same email or phone may already exist.",
    });
  }

  if (error) {
    console.error("Candidate creation failed:", error.code);
    return res.status(500).json({ message: "Could not add the candidate." });
  }

  return res.status(201).json({ success: true, candidate: data });
}
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        id,
        candidate_code,
        first_name,
        last_name,
        date_of_birth,
        phone,
        email,
        created_at,
        candidate_education (
          id,
          qualification,
          board,
          institution_name,
          group_major,
          passing_year,
          grading_scale,
          obtained_mark
        ),
        candidate_language_tests (
          id,
          test_name,
          test_type,
          obtained_score,
          score_scale,
          test_date,
          expiry_date,
          certificate_no
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Candidate query failed:", error.message);

      return res.status(500).json({
        message: "Could not fetch candidates from Supabase.",
      });
    }

    return res.status(200).json({
      success: true,
      total: data?.length ?? 0,
      candidates: data ?? [],
    });
  } catch (error) {
    console.error("Candidate API error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
