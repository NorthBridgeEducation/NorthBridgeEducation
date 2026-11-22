
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "./_lib/session.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  // Keep existing custom admin authentication
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Admin login required.",
    });
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    return res.status(500).json({
      success: false,
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

    // Read-only: Fetch saved student drafts
    const { data, error } = await supabase
      .from("draft")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Draft query failed:", error.message);

      return res.status(500).json({
        success: false,
        message: "Could not fetch drafts from Supabase.",
        details:
          process.env.NODE_ENV === "production"
            ? undefined
            : error.message,
      });
    }

    return res.status(200).json({
      success: true,
      total: data?.length ?? 0,
      drafts: data ?? [],
    });
  } catch (error) {
    console.error("Draft API error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}
