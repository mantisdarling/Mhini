import type { Request } from "express";
import type { InsertUser, User } from "../drizzle/schema";
import * as db from "./db";
import { ENV } from "./_core/env";

type SupabaseIdentityResponse = {
  id?: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string };
  app_metadata?: { provider?: string };
};

export function independentAuthEnabled() {
  return ENV.authProvider === "supabase";
}

export function mapSupabaseIdentity(identity: SupabaseIdentityResponse): InsertUser {
  if (!identity.id || !identity.email) throw new Error("Supabase identity is missing an id or email.");
  const owner = ENV.ownerEmail.length > 0 && identity.email.toLowerCase() === ENV.ownerEmail.toLowerCase();
  return {
    openId: `supabase:${identity.id}`,
    email: identity.email,
    name: identity.user_metadata?.full_name ?? identity.user_metadata?.name ?? null,
    loginMethod: identity.app_metadata?.provider ?? "supabase-email",
    role: owner ? "admin" : "user",
    lastSignedIn: new Date(),
  };
}

function bearerToken(req: Request) {
  const value = req.headers.authorization;
  return typeof value === "string" && value.startsWith("Bearer ") ? value.slice(7) : null;
}

export async function authenticateIndependentRequest(req: Request): Promise<User> {
  if (!independentAuthEnabled()) throw new Error("Independent authentication is not enabled.");
  const token = bearerToken(req);
  if (!token || !ENV.supabaseUrl || !ENV.supabasePublishableKey) throw new Error("Independent session is unavailable.");

  const response = await fetch(`${ENV.supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: ENV.supabasePublishableKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Independent session is invalid.");

  const values = mapSupabaseIdentity(await response.json() as SupabaseIdentityResponse);
  await db.upsertUser(values);
  const user = await db.getUserByOpenId(values.openId);
  if (!user) throw new Error("Independent user record could not be loaded.");
  return user;
}
