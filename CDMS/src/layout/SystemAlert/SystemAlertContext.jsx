// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// /**
//  * Wire this to your real API base. Vite exposes env vars via import.meta.env,
//  * so set VITE_API_URL in your .env file (e.g. VITE_API_URL=http://localhost:4000).
//  * Falls back to a relative path if not set, assuming your frontend and API
//  * share an origin or you're proxying /api in vite.config.js.
//  */
// const API_BASE = import.meta.env.VITE_API_URL || "";
// const ALERTS_ENDPOINT = `${API_BASE}/api/system-alerts`;
// const POLL_INTERVAL_MS = 15000; // how often non-admin accounts re-check for new/ended alerts

// const SystemAlertContext = createContext(null);

// export function SystemAlertProvider({ children }) {
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const pollRef = useRef(null);

//   const fetchActiveAlerts = useCallback(async () => {
//     try {
//       const res = await fetch(`${ALERTS_ENDPOINT}?active=true`);
//       if (!res.ok) throw new Error(`Failed to load alerts (${res.status})`);
//       const data = await res.json();
//       setAlerts(data);
//       setError(null);
//     } catch (err) {
//       // Swallow polling errors quietly after the first successful load so a
//       // flaky network doesn't repeatedly flash an error state at users.
//       if (loading) setError(err.message);
//       console.error("[SystemAlert] fetch failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [loading]);

//   useEffect(() => {
//     fetchActiveAlerts();
//     pollRef.current = setInterval(fetchActiveAlerts, POLL_INTERVAL_MS);
//     return () => clearInterval(pollRef.current);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const publishAlert = useCallback(async ({ message, severity }) => {
//     const res = await fetch(ALERTS_ENDPOINT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message, severity }),
//     });
//     if (!res.ok) throw new Error(`Failed to publish alert (${res.status})`);
//     const created = await res.json();
//     setAlerts((prev) => [created, ...prev]);
//     return created;
//   }, []);

//   const endAlert = useCallback(
//     async (id) => {
//       // Optimistic update so the admin sees it disappear immediately.
//       setAlerts((prev) => prev.filter((a) => a.id !== id));
//       try {
//         const res = await fetch(`${ALERTS_ENDPOINT}/${id}`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ active: false }),
//         });
//         if (!res.ok) throw new Error(`Failed to end alert (${res.status})`);
//       } catch (err) {
//         console.error("[SystemAlert] end failed:", err);
//         // Re-sync from the server since our optimistic removal may be wrong.
//         fetchActiveAlerts();
//       }
//     },
//     [fetchActiveAlerts],
//   );

//   return (
//     <SystemAlertContext.Provider
//       value={{ alerts, loading, error, publishAlert, endAlert }}
//     >
//       {children}
//     </SystemAlertContext.Provider>
//   );
// }

// export function useSystemAlerts() {
//   const ctx = useContext(SystemAlertContext);
//   if (!ctx) {
//     throw new Error(
//       "useSystemAlerts must be used inside a <SystemAlertProvider>",
//     );
//   }
//   return ctx;
// }
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Wire this to your real API base. Vite exposes env vars via import.meta.env,
 * so set VITE_API_URL in your .env file (e.g. VITE_API_URL=http://localhost:4000).
 * Falls back to a relative path if not set, assuming your frontend and API
 * share an origin or you're proxying /api in vite.config.js.
 */
const API_BASE = import.meta.env.VITE_API_URL || "";
const ALERTS_ENDPOINT = `${API_BASE}/api/system-alerts`;
const POLL_INTERVAL_MS = 15000; // how often non-admin accounts re-check for new/ended alerts

const SystemAlertContext = createContext(null);

export function SystemAlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const fetchActiveAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${ALERTS_ENDPOINT}?active=true`);
      if (!res.ok) throw new Error(`Failed to load alerts (${res.status})`);
      const data = await res.json();
      setAlerts(data);
      setError(null);
    } catch (err) {
      // Swallow polling errors quietly after the first successful load so a
      // flaky network doesn't repeatedly flash an error state at users.
      if (loading) setError(err.message);
      console.error("[SystemAlert] fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchActiveAlerts();
    pollRef.current = setInterval(fetchActiveAlerts, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publishAlert = useCallback(async ({ message, severity, username }) => {
    const res = await fetch(ALERTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, severity, username }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(
        body?.message || `Failed to publish alert (${res.status})`,
      );
    }
    const created = await res.json();
    setAlerts((prev) => [created, ...prev]);
    return created;
  }, []);

  const endAlert = useCallback(
    async (id) => {
      const username = sessionStorage.getItem("activeUser");
      // Optimistic update so the admin sees it disappear immediately.
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      try {
        const res = await fetch(`${ALERTS_ENDPOINT}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: false, username }),
        });
        if (!res.ok) throw new Error(`Failed to end alert (${res.status})`);
      } catch (err) {
        console.error("[SystemAlert] end failed:", err);
        // Re-sync from the server since our optimistic removal may be wrong.
        fetchActiveAlerts();
      }
    },
    [fetchActiveAlerts],
  );

  return (
    <SystemAlertContext.Provider
      value={{ alerts, loading, error, publishAlert, endAlert }}
    >
      {children}
    </SystemAlertContext.Provider>
  );
}

export function useSystemAlerts() {
  const ctx = useContext(SystemAlertContext);
  if (!ctx) {
    throw new Error(
      "useSystemAlerts must be used inside a <SystemAlertProvider>",
    );
  }
  return ctx;
}
