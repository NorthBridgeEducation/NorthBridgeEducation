
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "./_lib/session.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    return res.status(500).json({
      message: "Supabase server environment variables are missing.",
    });
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const candidate_id = String(body?.candidate_id ?? "").trim();
    const qualification = String(body?.qualification ?? "").trim();

    if (!candidate_id || !qualification) {
      return res.status(400).json({
        message: "Candidate and qualification are required.",
      });
    }

    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const year = String(body?.passing_year ?? "").trim();
    const passing_year = year ? Number(year) : null;

    if (passing_year !== null && !Number.isInteger(passing_year)) {
      return res.status(400).json({
        message: "Passing year must be a whole number.",
      });
    }

    const { data, error } = await supabase
      .from("candidate_education")
      .insert({
        candidate_id,
        qualification,
        board: body.board?.trim() || null,
        institution_name: body.institution_name?.trim() || null,
        group_major: body.group_major?.trim() || null,
        passing_year,
        grading_scale: body.grading_scale?.trim() || null,
        obtained_mark: body.obtained_mark?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Education insert failed:", error.message);
      return res.status(500).json({
        message: "Could not save education record.",
        details: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      education: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
