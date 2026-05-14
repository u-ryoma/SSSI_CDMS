import { useState, useEffect } from "react";
import "./SystemActivity.css";
export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRecentActivity();
  }, []);

  async function loadRecentActivity() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logs`);
      if (!res.ok) {
        setError(`Server Error: ${res.status}`);
        return;
      }
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError("Connection Failed.");
    }
  }

  function formatDateTime(ts) {
    const dateObj = new Date(ts);
    const time = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = dateObj.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    return `${date} • ${time}`;
  }

  return (
    <div className="activity-page">
      <div className="activity-header">
        <h2>System Activity</h2>
        <p>Recent login and logout activity across all users.</p>
      </div>

      <div className="activity-table-wrapper">
        {error && <div className="activity-error">{error}</div>}
        {logs.length === 0 && !error && (
          <div className="activity-empty">No activity yet.</div>
        )}
        {logs.length > 0 && (
          <table className="activity-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Action</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{log.username}</td>
                  <td>{log.name}</td>
                  <td>
                    <span className={`role-badge ${log.role}`}>{log.role}</span>
                  </td>
                  <td>
                    <span
                      className={`action-badge ${log.action?.includes("in") ? "in" : "out"}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>{formatDateTime(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
