import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { isAdminAuthenticated } from "./_lib/session.js";

const PAGE_SIZE = 50;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "private, no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed." });
  }

  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ message: "Admin login required." });
  }

  const pageParam = req.query.page ?? "1";

  if (typeof pageParam !== "string" || !/^[1-9]\d{0,7}$/.test(pageParam)) {
    return res.status(400).json({ message: "Invalid page number." });
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    return res.status(500).json({
      message: "Supabase server configuration is missing.",
    });
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.admin.listUsers({
      page: Number(pageParam),
      perPage: PAGE_SIZE,
    });

    if (error) throw error;

    const users = data.users.map((user) => {
      const metadata = user.user_metadata;

      const name = [
        metadata?.full_name,
        metadata?.name,
        metadata?.display_name,
      ].find(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0,
      );

      const avatarUrl = [metadata?.avatar_url, metadata?.picture].find(
        (value): value is string =>
          typeof value === "string" && value.trim().startsWith("https://"),
      );

      return {
        id: user.id,
        name: name?.trim() ?? null,
        avatarUrl: avatarUrl?.trim() ?? null,
        phone: user.phone || null,
        email: user.email || null,
        lastSignInAt: user.last_sign_in_at ?? null,
      };
    });

    return res.status(200).json({
      users,
      hasNextPage: data.nextPage != null,
    });
  } catch {
    return res.status(502).json({
      message: "Could not load users from Supabase Auth.",
    });
  }
}