
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const optionalText = (value: unknown): string | null =>
  typeof value === "string" && value.trim()
    ? value.trim()
    : null;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "no-store");

  if (!["GET", "POST", "PATCH"].includes(req.method || "")) {
    return res.status(405).json({ message: "Method not allowed." });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    return res.status(500).json({
      message: "Supabase server environment variables are missing.",
    });
  }

  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return res.status(401).json({
      message: "Student authentication required.",
    });
  }

  try {
    const supabase = createClient(supabaseUrl, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Verify the real Supabase Auth user.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user?.email) {
      return res.status(401).json({
        message: "Invalid or expired student session.",
      });
    }

    // Find the candidate using the authenticated email.
    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("id, candidate_code, first_name, last_name, email")
      .ilike("email", user.email)
      .maybeSingle();

    if (candidateError) {
      console.error("Candidate lookup failed:", candidateError.message);

      return res.status(500).json({
        message: "Could not verify your candidate profile.",
      });
    }

    if (!candidate) {
      return res.status(200).json({
        success: true,
        candidate: null,
        languageTests: [],
        // Future Admin Lock integration point.
        editingLocked: false,
      });
    }

    // GET: Only this authenticated candidate's records.
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("candidate_language_tests")
        .select(`
          id,
          candidate_id,
          test_name,
          test_type,
          obtained_score,
          score_scale,
          test_date,
          expiry_date,
          certificate_no,
          created_at,
          updated_at
        `)
        .eq("candidate_id", candidate.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Language tests query failed:", error.message);

        return res.status(500).json({
          message: "Could not load your language tests.",
        });
      }

      return res.status(200).json({
        success: true,
        candidate,
        languageTests: data ?? [],
        // TODO: Replace with Admin-controlled database permission.
        editingLocked: false,
      });
    }

    const body = req.body ?? {};

    const testName = optionalText(body.test_name);

    if (!testName) {
      return res.status(400).json({
        message: "Test name is required.",
      });
    }

    const score =
      body.obtained_score === "" ||
      body.obtained_score === null ||
      body.obtained_score === undefined
        ? null
        : Number(body.obtained_score);

    if (score !== null && !Number.isFinite(score)) {
      return res.status(400).json({
        message: "Please enter a valid score.",
      });
    }

    const testData = {
      test_name: testName,
      test_type: optionalText(body.test_type),
      obtained_score: score,
      score_scale: optionalText(body.score_scale),
      test_date: optionalText(body.test_date),
      expiry_date: optionalText(body.expiry_date),
      certificate_no: optionalText(body.certificate_no),
    };

    // POST: Add a new test for the authenticated candidate.
    if (req.method === "POST") {
      const { data, error } = await supabase
        .from("candidate_language_tests")
        .insert({
          candidate_id: candidate.id,
          ...testData,
        })
        .select()
        .single();

      if (error) {
        console.error("Language test insert failed:", error.message);

        return res.status(500).json({
          message: "Could not save your language test.",
        });
      }

      return res.status(201).json({
        success: true,
        languageTest: data,
      });
    }

    // PATCH: Update only a record owned by this candidate.
    const recordId =
      typeof body.id === "string" ? body.id.trim() : "";

    if (!recordId) {
      return res.status(400).json({
        message: "Language test ID is required.",
      });
    }

    const { data, error } = await supabase
      .from("candidate_language_tests")
      .update(testData)
      .eq("id", recordId)
      .eq("candidate_id", candidate.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Language test update failed:", error.message);

      return res.status(500).json({
        message: "Could not update your language test.",
      });
    }

    if (!data) {
      return res.status(404).json({
        message: "Language test not found in your account.",
      });
    }

    return res.status(200).json({
      success: true,
      languageTest: data,
    });
  } catch (error) {
    console.error("Student language test API error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
