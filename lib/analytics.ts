// ============================================================
// Analytics tracking helper (lib/analytics.ts)
// Fire-and-forget event logging for page views and button clicks.
// Form submissions are logged server-side in the relevant API routes.
// ============================================================

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const key = "lts_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

function getDeviceInfo(): { device: string; browser: string } {
  const ua = navigator.userAgent;

  let device = "Desktop";
  if (/ipad|tablet/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android/i.test(ua)) {
    device = "Mobile";
  }

  let browser = "Other";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua)) browser = "Safari";

  return { device, browser };
}

// Traffic source for the session, captured on the first event (the landing page) so later
// events and server-side form submissions can be attributed to the campaign / link that
// brought the visitor in: ?utm_source / utm_medium / utm_campaign, else the referring site.
export type Attribution = { utm_source?: string; utm_medium?: string; utm_campaign?: string; referrer?: string };

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const key = "lts_attribution";
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}

  const params = new URLSearchParams(window.location.search);
  const attribution: Attribution = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign"] as const) {
    const v = params.get(k);
    if (v) attribution[k] = v.slice(0, 80).toLowerCase();
  }
  try {
    const stripWww = (host: string) => host.replace(/^www\./, "");
    const ref = document.referrer ? stripWww(new URL(document.referrer).hostname) : "";
    if (ref && ref !== stripWww(window.location.hostname)) attribution.referrer = ref;
  } catch {}
  try { sessionStorage.setItem(key, JSON.stringify(attribution)); } catch {}
  return attribution;
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
      metadata: { ...metadata, ...getDeviceInfo(), ...getAttribution() },
    }),
    keepalive: true,
  }).catch(() => {});
}
