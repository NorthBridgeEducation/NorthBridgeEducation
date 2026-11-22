
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "./_lib/session.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed.",
    });
  }

  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({
      message: "Unauthorized. Admin login required.",
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    return res.status(500).json({
      message: "Supabase server environment variables are missing.",
    });
  }

  try {
    const supabase = createClient(supabaseUrl, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // GET: Load language test records
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
          updated_at,
          candidate:candidates (
            candidate_code,
            first_name,
            last_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Language test query error:", error);

        return res.status(500).json({
          message: "Could not load language test records.",
        });
      }

      return res.status(200).json({
        success: true,
        total: data?.length ?? 0,
        languageTests: data ?? [],
      });
    }

    // POST: Add a new language test
    const body = req.body ?? {};

    const candidateId =
      typeof body.candidate_id === "string"
        ? body.candidate_id.trim()
        : "";

    const testName =
      typeof body.test_name === "string"
        ? body.test_name.trim()
        : "";

    if (!candidateId || !testName) {
      return res.status(400).json({
        message: "Candidate and test name are required.",
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
        message: "Obtained score must be a valid number.",
      });
    }

    const optionalText = (value: unknown): string | null => {
      return typeof value === "string" && value.trim()
        ? value.trim()
        : null;
    };

    const { data, error } = await supabase
      .from("candidate_language_tests")
      .insert({
        candidate_id: candidateId,
        test_name: testName,
        test_type: optionalText(body.test_type),
        obtained_score: score,
        score_scale: optionalText(body.score_scale),
        test_date: optionalText(body.test_date),
        expiry_date: optionalText(body.expiry_date),
        certificate_no: optionalText(body.certificate_no),
      })
      .select()
      .single();

    if (error) {
      console.error("Language test insert error:", error);

      return res.status(500).json({
        message: error.message || "Could not save language test.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Language test added successfully.",
      languageTest: data,
    });
  } catch (error) {
    console.error("Language test API error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
