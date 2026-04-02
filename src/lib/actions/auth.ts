"use server";

import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "stemscore2026";
const SESSION_TOKEN = "admin-session-active";

export async function loginWithPassword(password: string) {
  if (password !== ADMIN_PASSWORD) {
    return { error: "Wrong password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("session", SESSION_TOKEN, {
    maxAge: 60 * 60 * 24 * 5,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return { success: true };
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  return session === SESSION_TOKEN;
}

export async function getSessionUid(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (session !== SESSION_TOKEN) return null;
  return "admin";
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}
