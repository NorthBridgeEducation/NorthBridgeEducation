
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "./_lib/session.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
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
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

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
  } catch (error) {
    console.error("Language test API error:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
