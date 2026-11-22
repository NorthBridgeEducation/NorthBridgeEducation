
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "./_lib/session.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "no-store");

  if (!["GET", "POST", "PATCH", "DELETE"].includes(req.method || "")) {
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
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

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const text = (value: unknown) =>
      typeof value === "string" && value.trim()
        ? value.trim()
        : null;

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("programs")
        .select(`
          id,
          name,
          degree_level,
          description,
          is_active,
          university_id,
          university:universities (
            id,
            name,
            country:countries (id, name)
          )
        `)
        .order("name");

      if (error) throw error;

      return res.status(200).json({
        success: true,
        programs: data || [],
      });
    }

    const id = text(body.id ?? req.query.id);
    const name = text(body.name);
    const universityId = text(body.university_id);
    const degreeLevel = text(body.degree_level);

    const allowedLevels = [
      "Bachelor",
      "Master",
      "PhD",
      "Diploma",
      "Other",
    ];

    if (req.method === "POST" || req.method === "PATCH") {
      if (!name || !universityId || !degreeLevel) {
        return res.status(400).json({
          message: "Program name, university and degree level are required.",
        });
      }

      if (!allowedLevels.includes(degreeLevel)) {
        return res.status(400).json({
          message: "Invalid degree level.",
        });
      }

      const payload = {
        name,
        university_id: universityId,
        degree_level: degreeLevel,
        description: text(body.description),
        is_active: body.is_active !== false,
        updated_at: new Date().toISOString(),
      };

      if (req.method === "POST") {
        const { data, error } = await supabase
          .from("programs")
          .insert(payload)
          .select("*")
          .single();

        if (error) throw error;

        return res.status(201).json({ success: true, item: data });
      }

      if (!id) {
        return res.status(400).json({ message: "Program ID is required." });
      }

      const { data, error } = await supabase
        .from("programs")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, item: data });
    }

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({ message: "Program ID is required." });
      }

      const { count, error: countError } = await supabase
        .from("program_applications")
        .select("id", { count: "exact", head: true })
        .eq("program_id", id);

      if (countError) throw countError;

      if ((count || 0) > 0) {
        return res.status(409).json({
          message:
            "This program has applications. Set it to Inactive instead of deleting it.",
        });
      }

      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Request failed.";

    console.error("Admin programs API error:", message);

    return res.status(500).json({
      message: "Could not process programs request.",
      details: message,
    });
  }
}
