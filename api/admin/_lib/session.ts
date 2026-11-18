
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const COOKIE_NAME = "nbridge_admin_session";
const SESSION_DURATION = 8 * 60 * 60; // 8 hours

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is missing or too short.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return (
    left.length === right.length &&
    timingSafeEqual(left, right)
  );
}

export function createAdminSession() {
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(token?: string) {
  if (!token) return false;

  const [payload, signature] = token.split(".");

  if (!payload || !signature) return false;

  try {
    if (!safeCompare(sign(payload), signature)) return false;

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );

    return (
      decoded.role === "admin" &&
      typeof decoded.exp === "number" &&
      decoded.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function getSessionToken(req: VercelRequest) {
  const cookie = req.headers.cookie || "";

  const item = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  return item?.slice(COOKIE_NAME.length + 1);
}

export function setSessionCookie(
  res: VercelResponse,
  token: string,
) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DURATION}${secure}`,
  );
}

export function clearSessionCookie(res: VercelResponse) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`,
  );
}

export function isAdminAuthenticated(req: VercelRequest) {
  return verifyAdminSession(getSessionToken(req));
}
