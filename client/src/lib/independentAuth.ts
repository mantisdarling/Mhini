const provider = import.meta.env.VITE_AUTH_PROVIDER ?? "manus";
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  import.meta.env.SUPABASE_VITE_SUPABASE_URL ??
  "";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.SUPABASE_VITE_SUPABASE_PUBLISHABLE_KEY ??
  "";
const sessionKey = "independent-access-token";

export type MagicLinkFailureCode =
  | "invalid-email"
  | "rate-limit"
  | "timeout"
  | "unavailable";

export class IndependentAuthError extends Error {
  readonly code: MagicLinkFailureCode;

  constructor(code: MagicLinkFailureCode) {
    super(code);
    this.name = "IndependentAuthError";
    this.code = code;
  }
}

export function getMagicLinkFailureMessage(error: unknown) {
  if (error instanceof IndependentAuthError) {
    switch (error.code) {
      case "invalid-email":
        return {
          title: "Check the email address",
          body: "Enter a valid email address and try again.",
        };
      case "rate-limit":
        return {
          title: "Please wait before trying again",
          body: "Too many sign-in requests were made. Wait a few minutes, then request a fresh link.",
        };
      case "timeout":
        return {
          title: "The request took too long",
          body: "Check your connection and try again. No sign-in link was issued.",
        };
      default:
        return {
          title: "Sign-in link unavailable",
          body: "We could not send the link right now. Please try again in a moment.",
        };
    }
  }
  return {
    title: "Sign-in link unavailable",
    body: "We could not send the link right now. Please try again in a moment.",
  };
}

export function independentAuthEnabled() {
  return (
    provider === "supabase" && Boolean(supabaseUrl && supabasePublishableKey)
  );
}

export function getIndependentAccessToken() {
  if (!independentAuthEnabled()) return null;
  try {
    return sessionStorage.getItem(sessionKey);
  } catch {
    return null;
  }
}

export function clearIndependentSession() {
  try {
    sessionStorage.removeItem(sessionKey);
  } catch {}
}

export function captureIndependentSessionFromUrl() {
  if (!independentAuthEnabled() || typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const token = params.get("access_token");
  if (!token) return false;
  try {
    sessionStorage.setItem(sessionKey, token);
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}${window.location.search}`
    );
    return true;
  } catch {
    return false;
  }
}

export async function requestIndependentMagicLink(email: string) {
  if (!independentAuthEnabled()) {
    throw new Error("Independent authentication is not configured yet.");
  }
  const normalizedEmail = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new IndependentAuthError("invalid-email");
  }

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/auth/v1/otp`,
      {
        method: "POST",
        headers: {
          apikey: supabasePublishableKey,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          email: normalizedEmail,
          create_user: true,
          redirect_to: `${window.location.origin}/studio`,
        }),
      }
    );
    if (response.status === 429) {
      throw new IndependentAuthError("rate-limit");
    }
    if (!response.ok) throw new IndependentAuthError("unavailable");
  } catch (error) {
    if (error instanceof IndependentAuthError) throw error;
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new IndependentAuthError("timeout");
    }
    throw new IndependentAuthError("unavailable");
  }
}
