// import React, { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   Cell,
//   PieChart,
//   Pie,
//   AreaChart,
//   Area,
// } from "recharts";
// import "./Dashboard.css";

// const API = import.meta.env.VITE_API_URL;

// // Stages a bar can represent -> which sidebar page it should link to on click.
// // "Returned Without Calibration" and "Completed" have no dedicated list page
// // (RWOC jobs just live in whatever collection query you build for them
// // later; Completed jobs are just finished, done, nothing to route to), so
// // they're intentionally left out of this map — handlePipelineBarClick below
// // already no-ops safely for any stage without a route.
// const STAGE_ROUTES = {
//   "Pending Tagging": "/admin/instrumenttag",
//   "Incoming Calibration": "/admin/incomingcalib",
//   "On Going Calibration": "/admin/ongoinggcalib",
//   "For Typing & Beyond": "/admin/fortyping",
//   Concern: "/admin/concernincoming",
// };

// const STAGE_COLORS = {
//   "Pending Tagging": "#f59e0b",
//   "Incoming Calibration": "#3b82f6",
//   "On Going Calibration": "#8b5cf6",
//   "For Typing & Beyond": "#10b981",
//   Concern: "#ef4444",
//   // Finished jobs (unit + cert both delivered) — distinct from "For Typing
//   // & Beyond" so a done job doesn't inflate the count of jobs still
//   // actively being typed/checked/readied for delivery.
//   Completed: "#14b8a6",
//   // Distinct from "Concern" (red) since RWOC is a resolved/terminal state,
//   // not an open issue — slate/gray reads as "closed out", matching how
//   // finished jobs elsewhere in the app aren't color-coded as urgent.
//   "Returned Without Calibration": "#64748b",
//   Other: "#a1a1aa",
// };

// const TYPE_COLORS = {
//   mechanical: "#3b82f6",
//   electrical: "#f59e0b",
// };

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [view, setView] = useState("year");
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchAnalytics(view);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [view]);

//   const fetchAnalytics = async (currentView) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/stats/analytics?view=${currentView}`);
//       if (!res.ok) throw new Error(`Request failed (${res.status})`);
//       const json = await res.json();
//       setData(json);
//       setError("");
//     } catch (err) {
//       console.error("Failed to load analytics:", err);
//       setError("Failed to load dashboard data.");
//       setData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const activePipelineCount = useMemo(() => {
//     if (!data?.pipeline) return 0;
//     // "For Typing & Beyond" jobs are still active pipeline work, but
//     // "Completed" and RWOC are both terminal/closed-out states, so
//     // they're excluded from the "active" count alongside each other.
//     return data.pipeline
//       .filter(
//         (p) =>
//           p.stage !== "Completed" && p.stage !== "Returned Without Calibration",
//       )
//       .reduce((sum, p) => sum + p.count, 0);
//   }, [data]);

//   const handlePipelineBarClick = (barData) => {
//     const route = STAGE_ROUTES[barData?.stage];
//     if (route) navigate(route);
//   };

//   const formatDateLabel = (iso) => {
//     if (!iso) return "";
//     const d = new Date(iso);
//     return isNaN(d) ? iso : d.toLocaleDateString();
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Header */}
//       <div className="dashboard-header">
//         <h2>Dashboard</h2>
//       </div>

//       {/* Toggle */}
//       <div className="dashboard-toggle">
//         <button
//           className={view === "week" ? "active" : ""}
//           onClick={() => setView("week")}
//         >
//           Week
//         </button>
//         <button
//           className={view === "month" ? "active" : ""}
//           onClick={() => setView("month")}
//         >
//           Month
//         </button>
//         <button
//           className={view === "year" ? "active" : ""}
//           onClick={() => setView("year")}
//         >
//           Year
//         </button>
//       </div>

//       {error && <p className="dashboard-error">{error}</p>}

//       {/* Stats cards */}
//       <div className="dashboard-stats">
//         {[
//           {
//             key: "received",
//             label: `Received This ${view}`,
//             value: data?.totalReceived,
//             icon: "fa-inbox",
//             accent: "blue",
//           },
//           {
//             key: "due",
//             label: "Calibration Due Soon",
//             value: data?.dueSoon,
//             icon: "fa-clock",
//             accent: "amber",
//           },
//           {
//             key: "overdue",
//             label: "Overdue Calibration",
//             value: data?.overdue,
//             icon: "fa-exclamation-triangle",
//             accent: "red",
//           },
//           {
//             key: "completed",
//             label: `Completed This ${view}`,
//             value: data?.completed,
//             icon: "fa-check-circle",
//             accent: "green",
//           },
//           {
//             key: "active",
//             label: "Active In Pipeline",
//             value: activePipelineCount,
//             icon: "fa-sync-alt",
//             accent: "purple",
//           },
//         ].map((card) => (
//           <div className={`stat-card accent-${card.accent}`} key={card.key}>
//             <div className="stat-card-top">
//               <span className={`stat-icon-badge badge-${card.accent}`}>
//                 <i className={`fas ${card.icon}`}></i>
//               </span>
//               <span className="stat-label">{card.label}</span>
//             </div>
//             <p className="stat-value">{loading ? "…" : (card.value ?? 0)}</p>
//           </div>
//         ))}
//       </div>

//       {/* Pipeline funnel chart */}
//       <div className="chart-card">
//         <h3>Job Pipeline by Stage</h3>
//         <p className="chart-subtitle">Click a bar to open that list</p>
//         <ResponsiveContainer width="100%" height={280}>
//           <BarChart
//             data={data?.pipeline || []}
//             layout="vertical"
//             margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis type="number" allowDecimals={false} />
//             <YAxis type="category" dataKey="stage" width={140} />
//             <Tooltip />
//             <Bar
//               dataKey="count"
//               radius={[0, 6, 6, 0]}
//               cursor="pointer"
//               onClick={handlePipelineBarClick}
//             >
//               {(data?.pipeline || []).map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={STAGE_COLORS[entry.stage] || STAGE_COLORS.Other}
//                 />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Trend chart */}
//       <div className="chart-card">
//         <h3>Jobs Received Over Time</h3>
//         <ResponsiveContainer width="100%" height={260}>
//           <AreaChart data={data?.trend || []}>
//             <defs>
//               <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
//                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="label" tick={{ fontSize: 12 }} />
//             <YAxis allowDecimals={false} />
//             <Tooltip />
//             <Area
//               type="monotone"
//               dataKey="count"
//               stroke="#3b82f6"
//               fill="url(#trendFill)"
//               strokeWidth={2}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Type distribution + Top companies */}
//       <div className="chart-row">
//         <div className="chart-card chart-card-half">
//           <h3>Job Type Distribution</h3>
//           <ResponsiveContainer width="100%" height={240}>
//             <PieChart>
//               <Pie
//                 data={data?.typeDistribution || []}
//                 dataKey="count"
//                 nameKey="type"
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={55}
//                 outerRadius={85}
//                 paddingAngle={2}
//               >
//                 {(data?.typeDistribution || []).map((entry, index) => (
//                   <Cell
//                     key={`type-cell-${index}`}
//                     fill={TYPE_COLORS[entry.type] || "#a1a1aa"}
//                   />
//                 ))}
//               </Pie>
//               <Legend />
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="chart-card chart-card-half">
//           <h3>Top Companies</h3>
//           <ResponsiveContainer width="100%" height={240}>
//             <BarChart
//               data={data?.topCompanies || []}
//               layout="vertical"
//               margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis type="number" allowDecimals={false} />
//               <YAxis type="category" dataKey="company" width={110} />
//               <Tooltip />
//               <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent activity */}
//       <div className="dashboard-table-wrapper">
//         <h3>Recent Activity</h3>
//         <table className="dashboard-table">
//           <thead>
//             <tr>
//               <th>Job Number</th>
//               <th>Company</th>
//               <th>Stage</th>
//               <th>Date Received</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="4">Loading...</td>
//               </tr>
//             ) : data?.recentJobs?.length ? (
//               data.recentJobs.map((job, idx) => (
//                 <tr key={idx}>
//                   <td>{job.jobNumber}</td>
//                   <td>{job.companyName}</td>
//                   <td>
//                     <span
//                       className="stage-pill"
//                       style={{
//                         backgroundColor:
//                           (STAGE_COLORS[job.stage] || STAGE_COLORS.Other) +
//                           "22",
//                         color: STAGE_COLORS[job.stage] || STAGE_COLORS.Other,
//                       }}
//                     >
//                       {job.stage}
//                     </span>
//                   </td>
//                   <td>{formatDateLabel(job.createdAt)}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4">No recent activity.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import "./Dashboard.css";

const API = import.meta.env.VITE_API_URL;

// Stages a bar can represent -> which sidebar page it should link to on click.
// "Returned Without Calibration" and "Completed" have no dedicated list page
// (RWOC jobs just live in whatever collection query you build for them
// later; Completed jobs are just finished, done, nothing to route to), so
// they're intentionally left out of this map — handlePipelineBarClick below
// already no-ops safely for any stage without a route.
const STAGE_ROUTES = {
  "Pending Tagging": "/admin/instrumenttag",
  "Incoming Calibration": "/admin/incomingcalib",
  "On Going Calibration": "/admin/ongoinggcalib",
  "Site Calibration": "/admin/sitecalibration",
  "Incoming Concern": "/admin/concernincoming",
  "Outgoing Concern": "/admin/concernoutgoing",
  "For Typing": "/admin/fortyping",
  "For Checking OIC": "/admin/forcheckingoic",
  "For Checking SIG": "/admin/forcheckingsig",
  Concern: "/admin/concernincoming",
  // Legacy bucket name kept for backwards compatibility with any old data
  // that still has this stage string.
  "For Typing & Beyond": "/admin/fortyping",
};

// Explicit colors for every known stage so the palette stays predictable
// and on-brand. Add new stages here as new pipeline steps get built —
// anything NOT listed here automatically gets a distinct color from
// STAGE_COLOR_PALETTE via getStageColor() below, so nothing ever silently
// collapses into the gray "Other" bucket.
const STAGE_COLORS = {
  "Pending Tagging": "#f59e0b", // amber
  "Incoming Calibration": "#2563eb", // blue
  "On Going Calibration": "#8b5cf6", // violet
  "Site Calibration": "#a855f7", // purple
  "Incoming Concern": "#ef4444", // red
  "Outgoing Concern": "#f43f5e", // rose
  "For Typing": "#10b981", // emerald
  "For Checking OIC": "#06b6d4", // cyan
  "For Checking SIG": "#6366f1", // indigo
  "For Printing": "#eab308", // yellow
  Concern: "#ef4444",
  // Finished jobs (unit + cert both delivered) — distinct from the active
  // pipeline stages so a done job doesn't visually blend with in-progress
  // work.
  Completed: "#14b8a6", // teal
  // Distinct from "Concern" (red) since RWOC is a resolved/terminal state,
  // not an open issue — slate/gray reads as "closed out", matching how
  // finished jobs elsewhere in the app aren't color-coded as urgent.
  "Returned Without Calibration": "#64748b", // slate
  // Legacy catch-all bucket name — kept mapped in case old records still
  // carry this stage string.
  "For Typing & Beyond": "#10b981",
  Other: "#a1a1aa",
};

// Fallback palette for any stage string not explicitly listed above.
// Deliberately excludes colors already used in STAGE_COLORS/TYPE_COLORS so
// a new stage never visually collides with an existing one.
const STAGE_COLOR_PALETTE = [
  "#ec4899", // pink
  "#84cc16", // lime
  "#f97316", // orange
  "#0ea5e9", // sky
  "#d946ef", // fuchsia
  "#22c55e", // green
  "#eab308", // yellow
  "#fb7185", // rose light
  "#4ade80", // green light
  "#818cf8", // indigo light
];

// Simple deterministic string hash so the same stage name always maps to
// the same fallback color across renders and reloads.
function hashStringToIndex(str, mod) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // keep as 32-bit int
  }
  return Math.abs(hash) % mod;
}

function getStageColor(stage) {
  if (!stage) return STAGE_COLORS.Other;
  if (STAGE_COLORS[stage]) return STAGE_COLORS[stage];
  return STAGE_COLOR_PALETTE[
    hashStringToIndex(stage, STAGE_COLOR_PALETTE.length)
  ];
}

const TYPE_COLORS = {
  mechanical: "#3b82f6",
  electrical: "#f59e0b",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("year");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const fetchAnalytics = async (currentView) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/stats/analytics?view=${currentView}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setData(json);
      setError("");
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Failed to load dashboard data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const activePipelineCount = useMemo(() => {
    if (!data?.pipeline) return 0;
    // "For Typing & Beyond" jobs are still active pipeline work, but
    // "Completed" and RWOC are both terminal/closed-out states, so
    // they're excluded from the "active" count alongside each other.
    return data.pipeline
      .filter(
        (p) =>
          p.stage !== "Completed" && p.stage !== "Returned Without Calibration",
      )
      .reduce((sum, p) => sum + p.count, 0);
  }, [data]);

  const handlePipelineBarClick = (barData) => {
    const route = STAGE_ROUTES[barData?.stage];
    if (route) navigate(route);
  };

  const formatDateLabel = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
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

      {error && <p className="dashboard-error">{error}</p>}

      {/* Stats cards */}
      <div className="dashboard-stats">
        {[
          {
            key: "received",
            label: `Received This ${view}`,
            value: data?.totalReceived,
            icon: "fa-inbox",
            accent: "blue",
          },
          {
            key: "due",
            label: "Calibration Due Soon",
            value: data?.dueSoon,
            icon: "fa-clock",
            accent: "amber",
          },
          {
            key: "overdue",
            label: "Overdue Calibration",
            value: data?.overdue,
            icon: "fa-exclamation-triangle",
            accent: "red",
          },
          {
            key: "completed",
            label: `Completed This ${view}`,
            value: data?.completed,
            icon: "fa-check-circle",
            accent: "green",
          },
          {
            key: "active",
            label: "Active In Pipeline",
            value: activePipelineCount,
            icon: "fa-sync-alt",
            accent: "purple",
          },
        ].map((card) => (
          <div className={`stat-card accent-${card.accent}`} key={card.key}>
            <div className="stat-card-top">
              <span className={`stat-icon-badge badge-${card.accent}`}>
                <i className={`fas ${card.icon}`}></i>
              </span>
              <span className="stat-label">{card.label}</span>
            </div>
            <p className="stat-value">{loading ? "…" : (card.value ?? 0)}</p>
          </div>
        ))}
      </div>

      {/* Pipeline funnel chart */}
      <div className="chart-card">
        <h3>Job Pipeline by Stage</h3>
        <p className="chart-subtitle">Click a bar to open that list</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data?.pipeline || []}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="stage" width={140} />
            <Tooltip />
            <Bar
              dataKey="count"
              radius={[0, 6, 6, 0]}
              cursor="pointer"
              onClick={handlePipelineBarClick}
            >
              {(data?.pipeline || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStageColor(entry.stage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend chart */}
      <div className="chart-card">
        <h3>Jobs Received Over Time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data?.trend || []}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fill="url(#trendFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Type distribution + Top companies */}
      <div className="chart-row">
        <div className="chart-card chart-card-half">
          <h3>Job Type Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data?.typeDistribution || []}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {(data?.typeDistribution || []).map((entry, index) => (
                  <Cell
                    key={`type-cell-${index}`}
                    fill={TYPE_COLORS[entry.type] || "#a1a1aa"}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card-half">
          <h3>Top Companies</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data?.topCompanies || []}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="company" width={110} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div className="dashboard-table-wrapper">
        <h3>Recent Activity</h3>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Company</th>
              <th>Stage</th>
              <th>Date Received</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4">Loading...</td>
              </tr>
            ) : data?.recentJobs?.length ? (
              data.recentJobs.map((job, idx) => (
                <tr key={idx}>
                  <td>{job.jobNumber}</td>
                  <td>{job.companyName}</td>
                  <td>
                    <span
                      className="stage-pill"
                      style={{
                        backgroundColor: getStageColor(job.stage) + "22",
                        color: getStageColor(job.stage),
                      }}
                    >
                      {job.stage}
                    </span>
                  </td>
                  <td>{formatDateLabel(job.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No recent activity.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
