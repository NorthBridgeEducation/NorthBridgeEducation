import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearSessionCookie } from "./_lib/session.js";

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  clearSessionCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}