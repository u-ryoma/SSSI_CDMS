export const STATS_REFRESH_EVENT = "stats:refresh";

export function emitStatsRefresh() {
  window.dispatchEvent(new Event(STATS_REFRESH_EVENT));
}

// Call once at startup (main.jsx).
// After any successful write (POST/PUT/PATCH/DELETE) to /api, fire a refresh.
export function installStatsRefreshOnWrites() {
  if (window.__statsFetchPatched) return;
  window.__statsFetchPatched = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const res = await originalFetch(input, init);

    try {
      const url = typeof input === "string" ? input : (input?.url ?? "");
      const method = (init.method || input?.method || "GET").toUpperCase();
      const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

      if (
        isWrite &&
        res.ok &&
        url.includes("/api/") &&
        !url.includes("/api/stats") // avoid loops
      ) {
        emitStatsRefresh();
      }
    } catch {
      // never let the refresh hook break a real request
    }

    return res;
  };
}
