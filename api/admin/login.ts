
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createAdminSession,
  setSessionCookie,
} from "./_lib/session";

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  const configuredEmail = process.env.ADMIN_DEMO_EMAIL;
  const configuredPassword = process.env.ADMIN_DEMO_PASSWORD;

  if (!configuredEmail || !configuredPassword) {
    return res.status(500).json({
      message: "Admin authentication is not configured.",
    });
  }

  const body =
    typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

  const email =
    typeof body?.email === "string" ? body.email.trim() : "";

  const password =
    typeof body?.password === "string" ? body.password : "";

  if (email !== configuredEmail || password !== configuredPassword) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  const token = createAdminSession();

  setSessionCookie(res, token);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
  });
}
