
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
    if (req.method === "POST") {
  const contentType = req.headers["content-type"]?.split(";")[0].trim();

  if (contentType !== "application/json") {
    return res.status(415).json({
      success: false,
      message: "Send an application/json body.",
    });
  }

  const draftId = req.body?.draft_id;

  if (
    typeof draftId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(draftId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid draft ID.",
    });
  }

  const { data: candidateId, error } = await supabase.rpc(
    "approve_candidate_draft",
    { p_draft_id: draftId },
  );

  if (error) {
    if (error.code === "P0002") {
      return res.status(404).json({ success: false, message: "Draft not found." });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A candidate with this account, email or phone already exists.",
      });
    }

    if (error.code === "22023") {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (["22P02", "22007", "22008", "23514"].includes(error.code)) {
      return res.status(422).json({
        success: false,
        message: "Check the draft's dates, passing year and results before approving.",
      });
    }

    console.error("Draft approval failed:", error.code);
    return res.status(500).json({
      success: false,
      message: "Could not approve the draft.",
    });
  }

  return res.status(200).json({
    success: true,
    candidate_id: candidateId,
  });
}
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
