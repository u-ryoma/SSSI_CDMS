// export default function Dashboard() {
//   return (
//     <div>
//       <h1>Dashboard</h1>
//       <p>Dashboard coming soon.</p>
//     </div>
//   );
// }
import React, { useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [view, setView] = useState("year");

  const stats = {
    week: { status: 10, due: 3, overdue: 1, recent: 5, month: 2 },
    month: { status: 40, due: 12, overdue: 5, recent: 20, month: 40 },
    year: { status: 400, due: 120, overdue: 50, recent: 200, month: 400 },
  };

  const currentStats = stats[view];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        {/* <h1>CALIBRATION DATABASE AND MONITORING SYSTEM (CDMS)</h1> */}
        <h2>Dashboard</h2>
      </div>

      {/* Toggle */}
      <div className="dashboard-toggle">
        <button
          className={view === "week" ? "active" : ""}
          onClick={() => setView("week")}
        >
          Week
        </button>
        <button
          className={view === "month" ? "active" : ""}
          onClick={() => setView("month")}
        >
          Month
        </button>
        <button
          className={view === "year" ? "active" : ""}
          onClick={() => setView("year")}
        >
          Year
        </button>
      </div>

      {/* Stats cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Calibration Status</h3>
          <p className="status-text">{currentStats.status}</p>
        </div>
        <div className="stat-card">
          <h3>
            Calibration <br></br>Due
          </h3>
          <p className="due-text">{currentStats.due}</p>
        </div>
        <div className="stat-card">
          <h3>Overdue Calibration</h3>
          <p className="overdue-text">{currentStats.overdue}</p>
        </div>
        <div className="stat-card">
          <h3>Recent Calibration</h3>
          <p className="recent-text">{currentStats.recent}</p>
        </div>
        <div className="stat-card">
          <h3>Calibration This {view}</h3>
          <p className="month-text">{currentStats.month}</p>
        </div>
      </div>

      {/* Recent activity */}
      {/* <div className="dashboard-table-wrapper">
        <h3>Recent Activity</h3>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Company</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>JOB-001</td>
              <td>ABC Company</td>
              <td>Completed</td>
              <td>2026-05-08</td>
            </tr>
            <tr>
              <td>JOB-002</td>
              <td>XYZ Corp</td>
              <td className="overdue-text">Overdue</td>
              <td>2026-05-07</td>
            </tr>
            <tr>
              <td>JOB-003</td>
              <td>Delta Industries</td>
              <td className="due-text">Due</td>
              <td>2026-05-09</td>
            </tr>
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default Dashboard;
