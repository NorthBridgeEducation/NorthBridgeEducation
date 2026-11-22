
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
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const body = typeof req.body === "string"
    ? JSON.parse(req.body)
    : req.body || {};

  const optionalText = (value: unknown) =>
    typeof value === "string" && value.trim()
      ? value.trim()
      : null;

  try {
    // GET: Load countries and universities
    if (req.method === "GET") {
      const [countries, universities] = await Promise.all([
        supabase.from("countries").select("*").order("name"),
        supabase
          .from("universities")
          .select("*, country:countries(id, name)")
          .order("name"),
      ]);

      if (countries.error) throw countries.error;
      if (universities.error) throw universities.error;

      return res.status(200).json({
        success: true,
        countries: countries.data || [],
        universities: universities.data || [],
      });
    }

    const type = body.type === "university" ? "university" : "country";
    const id = optionalText(body.id ?? req.query.id);
    const name = optionalText(body.name);

    // POST: Create country or university
    if (req.method === "POST") {
      if (!name) {
        return res.status(400).json({ message: "Name is required." });
      }

      if (type === "country") {
        const { data, error } = await supabase
          .from("countries")
          .insert({ name, is_active: body.is_active !== false })
          .select("*")
          .single();

        if (error) throw error;

        return res.status(201).json({ success: true, item: data });
      }

      const countryId = optionalText(body.country_id);

      if (!countryId) {
        return res.status(400).json({ message: "Country is required." });
      }

      const { data, error } = await supabase
        .from("universities")
        .insert({
          name,
          country_id: countryId,
          is_active: body.is_active !== false,
        })
        .select("*, country:countries(id, name)")
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, item: data });
    }

    // PATCH: Update country or university
    if (req.method === "PATCH") {
      if (!id || !name) {
        return res.status(400).json({
          message: "ID and name are required.",
        });
      }

      if (type === "country") {
        const { data, error } = await supabase
          .from("countries")
          .update({
            name,
            is_active: body.is_active !== false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select("*")
          .single();

        if (error) throw error;

        return res.status(200).json({ success: true, item: data });
      }

      const countryId = optionalText(body.country_id);

      if (!countryId) {
        return res.status(400).json({ message: "Country is required." });
      }

      const { data, error } = await supabase
        .from("universities")
        .update({
          name,
          country_id: countryId,
          is_active: body.is_active !== false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*, country:countries(id, name)")
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, item: data });
    }

    // DELETE: Remove country or university
    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({ message: "ID is required." });
      }

      if (type === "country") {
        const { count, error: checkError } = await supabase
          .from("universities")
          .select("id", { count: "exact", head: true })
          .eq("country_id", id);

        if (checkError) throw checkError;

        if ((count || 0) > 0) {
          return res.status(409).json({
            message: "Delete or move this country's universities first.",
          });
        }

        const { error } = await supabase
          .from("countries")
          .delete()
          .eq("id", id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("universities")
          .delete()
          .eq("id", id);

        if (error) throw error;
      }

      return res.status(200).json({ success: true });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";
    console.error("Catalog API error:", message);

    return res.status(500).json({
      message: "Could not process catalog request.",
      details: message,
    });
  }
}
