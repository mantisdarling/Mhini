import React, { useEffect, useState } from "react";
import { analyticsScriptDetails, privacyConsentKey, shouldLoadAnalytics } from "@/lib/privacyConsent";

export function injectAnalyticsScript(endpoint: string, websiteId: string) {
  if (typeof document === "undefined" || document.querySelector("script[data-mantis-analytics]")) return false;
  const details = analyticsScriptDetails(endpoint, websiteId);
  const script = document.createElement("script");
  script.defer = true;
  script.src = details.src;
  script.dataset.websiteId = details.websiteId;
  script.dataset.mantisAnalytics = "true";
  document.head.appendChild(script);
  return true;
}

function loadAnalytics() {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID as string | undefined;
  if (!endpoint || !websiteId) return;
  injectAnalyticsScript(endpoint, websiteId);
}

export default function PrivacyConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = window.localStorage.getItem(privacyConsentKey);
    if (shouldLoadAnalytics(choice)) loadAnalytics();
    else if (!choice) setVisible(true);
  }, []);

  function choose(choice: "accepted" | "declined") {
    window.localStorage.setItem(privacyConsentKey, choice);
    if (choice === "accepted") loadAnalytics();
    setVisible(false);
  }

  if (!visible || window.location.pathname === "/privacy") return null;
  return (
    <aside className="fixed inset-x-4 bottom-4 z-[70] border border-border bg-card p-4 shadow-2xl sm:inset-x-auto sm:right-6 sm:max-w-md" aria-label="Privacy choices">
      <p className="font-mono text-[0.62rem] tracking-[0.14em] text-primary">PRIVACY SIGNAL</p>
      <p className="mt-2 text-sm leading-6 text-foreground">This site uses privacy-focused analytics to understand visits and improve the experience. No analytics loads unless you allow it. <a className="text-primary underline" href="/privacy">Read the privacy policy</a>.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("accepted")} className="bg-primary px-4 py-2 font-mono text-[0.65rem] tracking-[0.1em] text-primary-foreground transition-transform active:scale-[0.97]">ALLOW ANALYTICS</button>
        <button type="button" onClick={() => choose("declined")} className="border border-border px-4 py-2 font-mono text-[0.65rem] tracking-[0.1em] text-foreground transition-colors hover:border-primary hover:text-primary active:scale-[0.97]">DECLINE</button>
      </div>
    </aside>
  );
}

export function clearPrivacyChoice() {
  if (typeof window !== "undefined") window.localStorage.removeItem(privacyConsentKey);
}
