const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
const LOVABLE_HOSTS = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];
const PROJECT_DEV = /^project--[a-z0-9-]+-dev$/;
const SW_PATH = "/sw.js";

function isPreviewHost(host: string) {
  const label = host.split(".")[0] ?? "";
  if (LOVABLE_HOSTS.some((suffix) => host.endsWith(suffix))) {
    if (PREVIEW_LABEL.test(label) || PROJECT_DEV.test(label)) return true;
  }
  return ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"].some(
    (d) => host === d || host.endsWith(`.${d}`),
  );
}

/** Pure guard: the offline worker only runs on the published site in production. */
export function shouldRegister(location: URL | Location, isProd: boolean, inIframe: boolean) {
  if (!isProd || inIframe) return false;
  if (new URLSearchParams(location.search).get("sw") === "off") return false;
  return !isPreviewHost(location.hostname.toLowerCase());
}

async function unregisterAppWorkers() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => (r.active ?? r.waiting ?? r.installing)?.scriptURL.endsWith(SW_PATH))
      .map((r) => r.unregister()),
  );
}

/** Single registration entry point; call once after hydration. */
export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  let inIframe = true;
  try {
    inIframe = window.self !== window.top;
  } catch {}
  if (!shouldRegister(window.location, import.meta.env.PROD, inIframe)) {
    await unregisterAppWorkers();
    return;
  }
  await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
}
