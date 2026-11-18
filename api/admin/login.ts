import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createAdminSession,
  setSessionCookie,
} from "./_lib/session.js";

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
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  // Kon env missing seta dekhabe (value kokhono dekhabe na)
  const missing = [
    !configuredEmail && "ADMIN_DEMO_EMAIL",
    !configuredPassword && "ADMIN_DEMO_PASSWORD",
    (!sessionSecret || sessionSecret.length < 32) &&
      "ADMIN_SESSION_SECRET (min 32 chars)",
  ].filter(Boolean);

  if (missing.length > 0) {
    console.error("Missing/invalid env:", missing.join(", "));
    return res.status(500).json({
      message: `Admin authentication is not configured: ${missing.join(", ")}`,
    });
  }

  let body: { email?: unknown; password?: unknown };

  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    return res.status(400).json({ message: "Invalid request body." });
  }

  const email =
    typeof body?.email === "string" ? body.email.trim() : "";

  const password =
    typeof body?.password === "string" ? body.password : "";

  if (email !== configuredEmail || password !== configuredPassword) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  try {
    const token = createAdminSession();
    setSessionCookie(res, token);
  } catch (error) {
    console.error("Session creation failed:", error);
    return res.status(500).json({ message: "Could not create session." });
  }

  return res.status(200).json({
    success: true,
    message: "Login successful.",
  });
}