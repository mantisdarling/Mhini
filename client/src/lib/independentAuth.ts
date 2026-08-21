const provider = import.meta.env.VITE_AUTH_PROVIDER ?? "manus";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_VITE_SUPABASE_URL ?? "";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.SUPABASE_VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const sessionKey = "independent-access-token";

export function independentAuthEnabled() {
  return provider === "supabase" && Boolean(supabaseUrl && supabasePublishableKey);
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
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
    return true;
  } catch {
    return false;
  }
}

export async function requestIndependentMagicLink(email: string) {
  if (!independentAuthEnabled()) throw new Error("Independent authentication is not configured yet.");
  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/otp`, {
    method: "POST",
    headers: { apikey: supabasePublishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      create_user: true,
      redirect_to: `${window.location.origin}/studio`,
    }),
  });
  if (!response.ok) throw new Error(`Could not send the sign-in link: ${await response.text()}`);
}
