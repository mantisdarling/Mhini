export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(error => {
          console.warn(
            "[Mantis] Offline support unavailable",
            error instanceof Error ? error.name : "registration-failed"
          );
        });
    },
    { once: true }
  );
}
