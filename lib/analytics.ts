// ============================================================
// Analytics tracking helper (lib/analytics.ts)
// Fire-and-forget event logging for page views and button clicks.
// Form submissions are logged server-side in the relevant API routes.
// ============================================================

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const key = "lts_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function trackEvent(
  eventType: "page_view" | "button_click",
  page: string,
  label?: string,
  metadata?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type: eventType,
      page,
      label: label || null,
      session_id: getSessionId(),
      metadata: metadata || null,
    }),
    keepalive: true,
  }).catch(() => {});
}
