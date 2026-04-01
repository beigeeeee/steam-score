"use server";

import { cookies } from "next/headers";

const IS_EMULATOR = process.env.NEXT_PUBLIC_USE_EMULATOR === "true";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "stemscore2026";
const LOCAL_SESSION_TOKEN = "local-admin-session";

export async function loginWithPassword(password: string) {
  if (password !== ADMIN_PASSWORD) {
    return { error: "Wrong password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("session", LOCAL_SESSION_TOKEN, {
    maxAge: 60 * 60 * 24 * 5, // 5 days
    httpOnly: true,
    secure: false,
    path: "/",
    sameSite: "lax",
  });

  return { success: true };
}

export async function createSessionCookie(idToken: string) {
  if (IS_EMULATOR) {
    // In emulator mode, just set a local session
    const cookieStore = await cookies();
    cookieStore.set("session", LOCAL_SESSION_TOKEN, {
      maxAge: 60 * 60 * 24 * 5,
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "lax",
    });
    return { success: true };
  }

  const { adminAuth } = await import("@/lib/firebase-admin");
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });
  const cookieStore = await cookies();
  cookieStore.set("session", sessionCookie, {
    maxAge: expiresIn / 1000,
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
  if (!session) return false;

  if (IS_EMULATOR) {
    return session === LOCAL_SESSION_TOKEN;
  }

  try {
    const { adminAuth } = await import("@/lib/firebase-admin");
    await adminAuth.verifySessionCookie(session);
    return true;
  } catch {
    return false;
  }
}

export async function getSessionUid(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  if (IS_EMULATOR) {
    return session === LOCAL_SESSION_TOKEN ? "local-admin" : null;
  }

  try {
    const { adminAuth } = await import("@/lib/firebase-admin");
    const decoded = await adminAuth.verifySessionCookie(session);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}
