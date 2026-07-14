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
//                   <div className="log-meta">{log.name}</div>
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

  useEffect(() => {
    loadCurrentlyLoggedIn();
    const interval = setInterval(loadCurrentlyLoggedIn, 35000);
    return () => clearInterval(interval);
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

  return (
    <aside className="sidebar-right">
      <div className="right-panel panel-top">
        <h3>System Status</h3>
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
                  <div className="log-meta">{log.name}</div>
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
