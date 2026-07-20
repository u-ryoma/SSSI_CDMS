// // import { useState, useEffect } from "react";

// // export default function RightPanel() {
// //   const [activeUsers, setActiveUsers] = useState([]);
// //   const [error, setError] = useState("");

// //   useEffect(() => {
// //     loadCurrentlyLoggedIn();
// //     const interval = setInterval(loadCurrentlyLoggedIn, 35000);
// //     return () => clearInterval(interval);
// //   }, []);

// //   function formatTime(ts) {
// //     return new Date(ts).toLocaleTimeString([], {
// //       hour: "2-digit",
// //       minute: "2-digit",
// //     });
// //   }

// //   async function loadCurrentlyLoggedIn() {
// //     try {
// //       const [logsRes, activeRes] = await Promise.all([
// //         fetch(`${import.meta.env.VITE_API_URL}/api/logs`),
// //         fetch(`${import.meta.env.VITE_API_URL}/api/active-users`),
// //       ]);

// //       const logs = await logsRes.json();
// //       const activeUsernames = await activeRes.json();

// //       const userDetails = {};
// //       logs.forEach((log) => {
// //         if (!userDetails[log.username]) {
// //           userDetails[log.username] = log;
// //         }
// //       });

// //       const users = activeUsernames
// //         .map((username) => userDetails[username])
// //         .filter(Boolean);

// //       setActiveUsers(users);
// //     } catch (err) {
// //       console.error("Failed to load:", err);
// //       setError("Failed to load.");
// //     }
// //   }

// //   return (
// //     <aside className="sidebar-right">
// //       <div className="right-panel panel-top">
// //         <h3>System Status</h3>
// //       </div>

// //       <div className="right-panel panel-bottom">
// //         <h3>Currently Logged In</h3>
// //         <div className="panel-content">
// //           {error && <p style={{ padding: "10px", color: "#888" }}>{error}</p>}
// //           {activeUsers.length === 0 && !error && (
// //             <p style={{ padding: "10px", color: "#888" }}>No active users.</p>
// //           )}
// //           {activeUsers.map((log, index) => (
// //             <div className="log-entry" key={index}>
// //               <div className="log-left">
// //                 <span className="log-dot"></span>
// //                 <div>
// //                   <div className="log-name">{log.username}</div>
// //                   <div className="log-meta">{log.name}</div>
// //                 </div>
// //               </div>
// //               <span className="log-meta">{formatTime(log.timestamp)}</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </aside>
// //   );
// // }
// import { useState, useEffect } from "react";

// export default function RightPanel() {
//   const [activeUsers, setActiveUsers] = useState([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     loadCurrentlyLoggedIn();
//     const interval = setInterval(loadCurrentlyLoggedIn, 35000);
//     return () => clearInterval(interval);
//   }, []);

//   function formatTime(ts) {
//     return new Date(ts).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   }

//   async function loadCurrentlyLoggedIn() {
//     try {
//       const [logsRes, activeRes] = await Promise.all([
//         fetch(`${import.meta.env.VITE_API_URL}/api/logs`),
//         fetch(`${import.meta.env.VITE_API_URL}/api/active-users`),
//       ]);

//       if (!logsRes.ok || !activeRes.ok) {
//         throw new Error(
//           `Request failed (logs: ${logsRes.status}, active-users: ${activeRes.status})`,
//         );
//       }

//       const logs = await logsRes.json();
//       const activeUsernames = await activeRes.json();

//       const userDetails = {};
//       logs.forEach((log) => {
//         if (!userDetails[log.username]) {
//           userDetails[log.username] = log;
//         }
//       });

//       const users = activeUsernames
//         .map((username) => userDetails[username])
//         .filter(Boolean);

//       setActiveUsers(users);
//       setError("");
//     } catch (err) {
//       console.error("Failed to load:", err);
//       setError("Failed to load.");
//     }
//   }

//   return (
//     <aside className="sidebar-right">
//       <div className="right-panel panel-top">
//         <h3>System Status</h3>
//       </div>

//       <div className="right-panel panel-bottom">
//         <h3>Currently Logged In</h3>
//         <div className="panel-content">
//           {error && <p style={{ padding: "10px", color: "#888" }}>{error}</p>}
//           {activeUsers.length === 0 && !error && (
//             <p style={{ padding: "10px", color: "#888" }}>No active users.</p>
//           )}
//           {activeUsers.map((log, index) => (
//             <div className="log-entry" key={index}>
//               <div className="log-left">
//                 <span className="log-dot"></span>
//                 <div>
//                   <div className="log-name">{log.username}</div>
//                   <div className="log-meta">{log.role}</div>
//                 </div>
//               </div>
//               <span className="log-meta">{formatTime(log.timestamp)}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </aside>
//   );
// }
import { useState, useEffect } from "react";

export default function RightPanel() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [error, setError] = useState("");

  // ==========================
  // STATS STATE
  // ==========================
  const [stats, setStats] = useState({
    incomingCalibration: null,
    ongoingCalibration: null,
    instrumentTag: null,
  });
  const [statsError, setStatsError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadCurrentlyLoggedIn();
    loadStats();

    const logInterval = setInterval(loadCurrentlyLoggedIn, 35000);
    const statsInterval = setInterval(loadStats, 35000);

    return () => {
      clearInterval(logInterval);
      clearInterval(statsInterval);
    };
  }, []);

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadCurrentlyLoggedIn() {
    try {
      const [logsRes, activeRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/logs`),
        fetch(`${import.meta.env.VITE_API_URL}/api/active-users`),
      ]);

      if (!logsRes.ok || !activeRes.ok) {
        throw new Error(
          `Request failed (logs: ${logsRes.status}, active-users: ${activeRes.status})`,
        );
      }

      const logs = await logsRes.json();
      const activeUsernames = await activeRes.json();

      const userDetails = {};
      logs.forEach((log) => {
        if (!userDetails[log.username]) {
          userDetails[log.username] = log;
        }
      });

      const users = activeUsernames
        .map((username) => userDetails[username])
        .filter(Boolean);

      setActiveUsers(users);
      setError("");
    } catch (err) {
      console.error("Failed to load:", err);
      setError("Failed to load.");
    }
  }

  // ==========================
  // LOAD STATS FROM /api/stats/dashboard
  // ==========================
  async function loadStats() {
    try {
      setStatsLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stats/dashboard`,
      );

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const data = await res.json();

      setStats({
        incomingCalibration: data.incomingCalibration ?? 0,
        ongoingCalibration: data.ongoingCalibration ?? 0,
        instrumentTag: data.instrumentTag ?? 0,
      });
      setStatsError("");
    } catch (err) {
      console.error("Failed to load stats:", err);
      setStatsError("Failed to load stats.");
    } finally {
      setStatsLoading(false);
    }
  }

  const statItems = [
    {
      label: "For Instrument Tagging",
      value: stats.instrumentTag,
      color: "#10b981",
    },
    {
      label: "Incoming Calibration",
      value: stats.incomingCalibration,
      color: "#3b82f6",
    },
    {
      label: "On Going Calibration",
      value: stats.ongoingCalibration,
      color: "#f59e0b",
    },
  ];

  return (
    <aside className="sidebar-right">
      <div className="right-panel panel-top">
        <h3>System Status</h3>
        <div className="panel-content">
          {statsError && (
            <p style={{ padding: "10px", color: "#888" }}>{statsError}</p>
          )}

          {!statsError &&
            statItems.map((item, index) => (
              <div
                key={index}
                className="stat-entry"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderBottom:
                    index < statItems.length - 1 ? "1px solid #eee" : "none",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: item.color,
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  ></span>
                  <span style={{ fontSize: "0.85rem", color: "#3f3f46" }}>
                    {item.label}
                  </span>
                </div>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    color: "#18181b",
                    minWidth: "24px",
                    textAlign: "right",
                  }}
                >
                  {statsLoading ? "…" : item.value}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div className="right-panel panel-bottom">
        <h3>Currently Logged In</h3>
        <div className="panel-content">
          {error && <p style={{ padding: "10px", color: "#888" }}>{error}</p>}
          {activeUsers.length === 0 && !error && (
            <p style={{ padding: "10px", color: "#888" }}>No active users.</p>
          )}
          {activeUsers.map((log, index) => (
            <div className="log-entry" key={index}>
              <div className="log-left">
                <span className="log-dot"></span>
                <div>
                  <div className="log-name">{log.username}</div>
                  <div className="log-meta">{log.role}</div>
                </div>
              </div>
              <span className="log-meta">{formatTime(log.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
