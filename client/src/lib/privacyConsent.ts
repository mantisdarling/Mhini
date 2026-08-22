export const privacyConsentKey = "mantis-analytics-consent";
export type PrivacyChoice = "accepted" | "declined";

export function normalizeAnalyticsEndpoint(endpoint: string) {
  return endpoint.replace(/\/$/, "");
}

export function shouldLoadAnalytics(choice: string | null) {
  return choice === "accepted";
}

export function savePrivacyChoice(storage: Pick<Storage, "setItem">, choice: PrivacyChoice) {
  storage.setItem(privacyConsentKey, choice);
}

export function analyticsScriptDetails(endpoint: string, websiteId: string) {
  return {
    src: `${normalizeAnalyticsEndpoint(endpoint)}/umami`,
    websiteId,
  };
}
