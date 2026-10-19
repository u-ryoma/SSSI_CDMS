// import { useEffect, useState, useCallback } from "react";
// import AssignTechnicianModal from "./AssignTechnicianModal";
// import AutoScheduleModal from "./AutoScheduleModal";
// import { authHeaders, canEditSchedule } from "../../utils/auth";
// import "./SchedMonitor.css";

// const API_BASE = "/api/schedule"; // adjust if your axios instance uses a different base
// const TECHNICIANS_URL = "/api/technicians"; // separate resource, not nested under /schedule

// const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// // --- date helpers (no external date lib) ---
// const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
// const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
// const addDays = (d, n) => {
//   const copy = new Date(d);
//   copy.setDate(copy.getDate() + n);
//   return copy;
// };
// const startOfWeek = (d) => addDays(d, -d.getDay());
// const isSameDay = (a, b) =>
//   a.getFullYear() === b.getFullYear() &&
//   a.getMonth() === b.getMonth() &&
//   a.getDate() === b.getDate();
// const toISODate = (d) =>
//   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//     d.getDate(),
//   ).padStart(2, "0")}`;

// function buildMonthGrid(anchorDate) {
//   const first = startOfMonth(anchorDate);
//   const gridStart = startOfWeek(first);
//   const days = [];
//   for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
//   return days;
// }

// function buildWeekGrid(anchorDate) {
//   const weekStart = startOfWeek(anchorDate);
//   const days = [];
//   for (let i = 0; i < 7; i++) days.push(addDays(weekStart, i));
//   return days;
// }

// export default function SchedMonitor() {
//   const canEdit = canEditSchedule(); // admin/owner only

//   const [viewMode, setViewMode] = useState("month"); // 'month' | 'week'
//   const [anchorDate, setAnchorDate] = useState(new Date());
//   const [assignments, setAssignments] = useState([]);
//   const [technicians, setTechnicians] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [showAutoSchedule, setShowAutoSchedule] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const days =
//     viewMode === "month"
//       ? buildMonthGrid(anchorDate)
//       : buildWeekGrid(anchorDate);
//   const rangeStart = days[0];
//   const rangeEnd = days[days.length - 1];

//   const fetchAssignments = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `${API_BASE}?start=${toISODate(rangeStart)}&end=${toISODate(rangeEnd)}`,
//         { headers: authHeaders() },
//       );
//       if (!res.ok) throw new Error("Failed to fetch assignments");
//       const data = await res.json();
//       setAssignments(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [rangeStart.getTime(), rangeEnd.getTime()]);

//   useEffect(() => {
//     fetchAssignments();
//   }, [fetchAssignments]);

//   const fetchTechnicians = useCallback(async () => {
//     // Only admins need the technician list (for the assign dropdown)
//     if (!canEdit) return;
//     try {
//       const res = await fetch(TECHNICIANS_URL, { headers: authHeaders() });
//       if (!res.ok) throw new Error("Failed to fetch technicians");
//       const data = await res.json();
//       setTechnicians(data);
//     } catch (err) {
//       console.error("Failed to fetch technicians:", err);
//     }
//   }, [canEdit]);

//   useEffect(() => {
//     fetchTechnicians();
//   }, [fetchTechnicians]);

//   const assignmentsForDay = (day) =>
//     assignments.filter((a) => isSameDay(new Date(a.date), day));

//   // notes now carries { notes, location } from the modal
//   const handleAssign = async (technicianId, notes, location) => {
//     if (!canEdit) throw new Error("Admin access required.");
//     const res = await fetch(API_BASE, {
//       method: "POST",
//       headers: authHeaders(),
//       body: JSON.stringify({
//         date: toISODate(selectedDate),
//         technicianId,
//         notes,
//         location,
//       }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Failed to assign");
//     setAssignments((prev) => [...prev, data]);
//   };

//   const handleRemove = async (assignmentId) => {
//     if (!canEdit) return;
//     const res = await fetch(`${API_BASE}/${assignmentId}`, {
//       method: "DELETE",
//       headers: authHeaders(),
//     });
//     if (res.ok) {
//       setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
//     } else {
//       const data = await res.json().catch(() => ({}));
//       alert(data.message || "Failed to remove assignment.");
//     }
//   };

//   const goPrev = () =>
//     setAnchorDate((prev) =>
//       viewMode === "month"
//         ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
//         : addDays(prev, -7),
//     );
//   const goNext = () =>
//     setAnchorDate((prev) =>
//       viewMode === "month"
//         ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
//         : addDays(prev, 7),
//     );
//   const goToday = () => setAnchorDate(new Date());

//   const headerLabel =
//     viewMode === "month"
//       ? anchorDate.toLocaleDateString("en-PH", {
//           month: "long",
//           year: "numeric",
//         })
//       : `${rangeStart.toLocaleDateString("en-PH", {
//           month: "short",
//           day: "numeric",
//         })} – ${rangeEnd.toLocaleDateString("en-PH", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//         })}`;

//   return (
//     <div className="sm-container">
//       <div className="sm-topline">
//         <div>
//           {/* <span className="sm-eyebrow">Field Operations</span> */}
//           <div className="sm-banner">
//             <h1>On-Site Operations</h1>
//           </div>
//         </div>
//       </div>

//       <div className="sm-toolbar">
//         <div className="sm-nav">
//           <button onClick={goToday}>Today</button>
//           <span className="sm-header-label">{headerLabel}</span>
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           {canEdit && (
//             <button
//               onClick={() => setShowAutoSchedule(true)}
//               style={{
//                 background: "#0a0a0a",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: 6,
//                 padding: "8px 14px",
//                 fontWeight: 600,
//                 cursor: "pointer",
//               }}
//             >
//               Auto-Schedule
//             </button>
//           )}

//           <div className="sm-view-toggle">
//             <button
//               className={viewMode === "month" ? "active" : ""}
//               onClick={() => setViewMode("month")}
//             >
//               Month
//             </button>
//             <button
//               className={viewMode === "week" ? "active" : ""}
//               onClick={() => setViewMode("week")}
//             >
//               Week
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="sm-grid-wrap">
//         <button
//           className="sm-nav-prev"
//           onClick={goPrev}
//           aria-label="Previous month"
//         >
//           &lt;
//         </button>
//         <button
//           className="sm-nav-next"
//           onClick={goNext}
//           aria-label="Next month"
//         >
//           &gt;
//         </button>

//         <div className={`sm-grid ${viewMode}`}>
//           {WEEKDAY_LABELS.map((label) => (
//             <div key={label} className="sm-weekday-label">
//               {label}
//             </div>
//           ))}

//           {days.map((day) => {
//             const dayAssignments = assignmentsForDay(day);
//             const inCurrentMonth =
//               viewMode === "week" || day.getMonth() === anchorDate.getMonth();
//             const isToday = isSameDay(day, new Date());

//             return (
//               <div
//                 key={day.toISOString()}
//                 className={`sm-day-cell ${inCurrentMonth ? "" : "sm-outside"} ${
//                   isToday ? "sm-today" : ""
//                 }`}
//                 onClick={() => setSelectedDate(day)}
//               >
//                 <span className="sm-day-number">{day.getDate()}</span>
//                 <div className="sm-day-assignments">
//                   {dayAssignments
//                     .slice(0, viewMode === "month" ? 4 : 20)
//                     .map((a) => (
//                       <div
//                         key={a._id}
//                         className="sm-tech-chip"
//                         title={a.technician?.name || "Unknown"}
//                       >
//                         {a.technician?.name || "Unknown"}
//                       </div>
//                     ))}
//                   {viewMode === "month" && dayAssignments.length > 4 && (
//                     <div className="sm-more-label">
//                       +{dayAssignments.length - 4} more
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {loading && <p className="sm-loading">Loading schedule…</p>}

//       {selectedDate && (
//         <AssignTechnicianModal
//           date={selectedDate}
//           technicians={technicians}
//           existingAssignments={assignmentsForDay(selectedDate)}
//           onAssign={handleAssign}
//           onRemove={handleRemove}
//           onClose={() => setSelectedDate(null)}
//           canEdit={canEdit}
//         />
//       )}

//       {showAutoSchedule && canEdit && (
//         <AutoScheduleModal
//           apiBase={API_BASE}
//           onClose={() => setShowAutoSchedule(false)}
//           onConfirmed={fetchAssignments}
//         />
//       )}
//     </div>
//   );
// }
import { useEffect, useState, useCallback } from "react";
import AssignTechnicianModal from "./AssignTechnicianModal";
import AutoScheduleModal from "./AutoScheduleModal";
import ConfirmDialog from "../../components/ConfirmDialog"; // CHANGED
import { authHeaders, canEditSchedule } from "../../utils/auth";
import "./SchedMonitor.css";

const API_BASE = "/api/schedule"; // adjust if your axios instance uses a different base
const TECHNICIANS_URL = "/api/technicians"; // separate resource, not nested under /schedule

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- date helpers (no external date lib) ---
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addDays = (d, n) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};
const startOfWeek = (d) => addDays(d, -d.getDay());
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

function buildMonthGrid(anchorDate) {
  const first = startOfMonth(anchorDate);
  const gridStart = startOfWeek(first);
  const days = [];
  for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
  return days;
}

function buildWeekGrid(anchorDate) {
  const weekStart = startOfWeek(anchorDate);
  const days = [];
  for (let i = 0; i < 7; i++) days.push(addDays(weekStart, i));
  return days;
}

export default function SchedMonitor() {
  const canEdit = canEditSchedule(); // admin/owner only

  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week'
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(null); // CHANGED

  const days =
    viewMode === "month"
      ? buildMonthGrid(anchorDate)
      : buildWeekGrid(anchorDate);
  const rangeStart = days[0];
  const rangeEnd = days[days.length - 1];

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}?start=${toISODate(rangeStart)}&end=${toISODate(rangeEnd)}`,
        { headers: authHeaders() },
      );
      if (!res.ok) throw new Error("Failed to fetch assignments");
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [rangeStart.getTime(), rangeEnd.getTime()]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const fetchTechnicians = useCallback(async () => {
    // Only admins need the technician list (for the assign dropdown)
    if (!canEdit) return;
    try {
      const res = await fetch(TECHNICIANS_URL, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch technicians");
      const data = await res.json();
      setTechnicians(data);
    } catch (err) {
      console.error("Failed to fetch technicians:", err);
    }
  }, [canEdit]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const assignmentsForDay = (day) =>
    assignments.filter((a) => isSameDay(new Date(a.date), day));

  // notes now carries { notes, location } from the modal
  const handleAssign = async (technicianId, notes, location) => {
    if (!canEdit) throw new Error("Admin access required.");
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        date: toISODate(selectedDate),
        technicianId,
        notes,
        location,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to assign");
    setAssignments((prev) => [...prev, data]);
  };

  const handleRemove = async (assignmentId) => {
    if (!canEdit) return;
    const res = await fetch(`${API_BASE}/${assignmentId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
    } else {
      // CHANGED: was alert(...)
      const data = await res.json().catch(() => ({}));
      setDialog({
        title: "Remove failed",
        message: data.message || "Failed to remove assignment.",
        type: "danger",
        confirmLabel: "OK",
        onConfirm: () => setDialog(null),
      });
    }
  };

  const goPrev = () =>
    setAnchorDate((prev) =>
      viewMode === "month"
        ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        : addDays(prev, -7),
    );
  const goNext = () =>
    setAnchorDate((prev) =>
      viewMode === "month"
        ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        : addDays(prev, 7),
    );
  const goToday = () => setAnchorDate(new Date());

  const headerLabel =
    viewMode === "month"
      ? anchorDate.toLocaleDateString("en-PH", {
          month: "long",
          year: "numeric",
        })
      : `${rangeStart.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
        })} – ${rangeEnd.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;

  return (
    <div className="sm-container">
      <div className="sm-topline">
        <div>
          {/* <span className="sm-eyebrow">Field Operations</span> */}
          <div className="sm-banner">
            <h1>On-Site Operations</h1>
          </div>
        </div>
      </div>

      <div className="sm-toolbar">
        <div className="sm-nav">
          <button onClick={goToday}>Today</button>
          <span className="sm-header-label">{headerLabel}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {canEdit && (
            <button
              onClick={() => setShowAutoSchedule(true)}
              style={{
                background: "#0a0a0a",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Auto-Schedule
            </button>
          )}

          <div className="sm-view-toggle">
            <button
              className={viewMode === "month" ? "active" : ""}
              onClick={() => setViewMode("month")}
            >
              Month
            </button>
            <button
              className={viewMode === "week" ? "active" : ""}
              onClick={() => setViewMode("week")}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      <div className="sm-grid-wrap">
        <button
          className="sm-nav-prev"
          onClick={goPrev}
          aria-label="Previous month"
        >
          &lt;
        </button>
        <button
          className="sm-nav-next"
          onClick={goNext}
          aria-label="Next month"
        >
          &gt;
        </button>

        <div className={`sm-grid ${viewMode}`}>
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="sm-weekday-label">
              {label}
            </div>
          ))}

          {days.map((day) => {
            const dayAssignments = assignmentsForDay(day);
            const inCurrentMonth =
              viewMode === "week" || day.getMonth() === anchorDate.getMonth();
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`sm-day-cell ${inCurrentMonth ? "" : "sm-outside"} ${
                  isToday ? "sm-today" : ""
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <span className="sm-day-number">{day.getDate()}</span>
                <div className="sm-day-assignments">
                  {dayAssignments
                    .slice(0, viewMode === "month" ? 4 : 20)
                    .map((a) => (
                      <div
                        key={a._id}
                        className="sm-tech-chip"
                        title={a.technician?.name || "Unknown"}
                      >
                        {a.technician?.name || "Unknown"}
                      </div>
                    ))}
                  {viewMode === "month" && dayAssignments.length > 4 && (
                    <div className="sm-more-label">
                      +{dayAssignments.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading && <p className="sm-loading">Loading schedule…</p>}

      {selectedDate && (
        <AssignTechnicianModal
          date={selectedDate}
          technicians={technicians}
          existingAssignments={assignmentsForDay(selectedDate)}
          onAssign={handleAssign}
          onRemove={handleRemove}
          onClose={() => setSelectedDate(null)}
          canEdit={canEdit}
        />
      )}

      {showAutoSchedule && canEdit && (
        <AutoScheduleModal
          apiBase={API_BASE}
          onClose={() => setShowAutoSchedule(false)}
          onConfirmed={fetchAssignments}
        />
      )}

      {/* CHANGED */}
      {dialog && <ConfirmDialog {...dialog} />}
    </div>
  );
}
