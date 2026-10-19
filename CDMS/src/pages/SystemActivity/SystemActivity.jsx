import { useState, useEffect, useMemo } from "react";
import "./SystemActivity.css";

function getType(log) {
  if (log.type) return log.type;
  // older entries only have the action text
  const a = (log.action || "").toLowerCase();
  if (a.includes("logout") || a.includes("logged out") || a.includes("log out"))
    return "logout";
  if (a.includes("login") || a.includes("logged in") || a.includes("log in"))
    return "login";
  return "other";
}

const TYPE_LABELS = {
  login: "Login",
  logout: "Logout",
  create: "Create",
  update: "Update",
  delete: "Delete",
  other: "Other",
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadRecentActivity();
    const timer = setInterval(loadRecentActivity, 30000); // refresh every 30s
    return () => clearInterval(timer);
  }, []);

  async function loadRecentActivity() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logs`);
      if (!res.ok) {
        setError(`Server Error: ${res.status}`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setLogs(data);
      setError("");
    } catch (err) {
      setError("Connection Failed.");
    }
    setLoading(false);
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

  const modules = useMemo(() => {
    const set = new Set(logs.map((l) => l.module || "Authentication"));
    return Array.from(set).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      const mod = log.module || "Authentication";
      const type = getType(log);
      if (moduleFilter !== "all" && mod !== moduleFilter) return false;
      if (typeFilter !== "all" && type !== typeFilter) return false;
      if (!q) return true;
      return [log.username, log.name, log.action, log.details, mod]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [logs, search, moduleFilter, typeFilter]);

  return (
    <div className="activity-page">
      <div className="activity-header">
        <div className="activity-banner">
          <h2>SYSTEM ACTIVITY</h2>
        </div>
        <p>
          Recent activity across all users: logins, logouts, and every change
          made in the system.
        </p>
      </div>

      <div className="activity-filters">
        <input
          type="text"
          className="activity-search"
          placeholder="Search user, action, or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="activity-select"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <option value="all">All modules</option>
          {modules.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="activity-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All actions</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="activity-refresh" onClick={loadRecentActivity}>
          Refresh
        </button>
      </div>

      <div className="activity-table-wrapper">
        {error && <div className="activity-error">{error}</div>}
        {loading && !error && <div className="activity-empty">Loading...</div>}
        {!loading && filteredLogs.length === 0 && !error && (
          <div className="activity-empty">No activity found.</div>
        )}
        {filteredLogs.length > 0 && (
          <table className="activity-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Module</th>
                <th>Action</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => {
                const type = getType(log);
                return (
                  <tr key={log._id || index}>
                    <td>{log.username}</td>
                    <td>{log.name}</td>
                    <td>
                      <span className={`role-badge ${log.role}`}>
                        {log.role}
                      </span>
                    </td>
                    <td>{log.module || "Authentication"}</td>
                    <td>
                      <span className={`action-badge ${type}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="activity-details">{log.details || "—"}</td>
                    <td>{formatDateTime(log.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
