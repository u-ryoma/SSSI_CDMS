// import { useEffect, useState } from "react";
// import "./AssignTechnicianModal.css";

// const fmtDate = (s) =>
//   new Date(`${s}T00:00:00`).toLocaleDateString("en-PH", {
//     weekday: "short",
//     month: "short",
//     day: "numeric",
//   });

// const th = { textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #ddd", fontSize: 12, color: "#555" };
// const td = { padding: "6px 8px", borderBottom: "1px solid #eee", fontSize: 13, verticalAlign: "top" };

// const lateStyle = (days) =>
//   days > 0
//     ? { color: "#b42318", fontWeight: 600 }
//     : { color: "#067647", fontWeight: 600 };

// // Shows a proposed schedule for site calibration jobs that have no
// // assignment yet. Nothing is saved until the user confirms.
// export default function AutoScheduleModal({ apiBase, onClose, onConfirmed }) {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState(null);
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [result, setResult] = useState(null);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await fetch(`${apiBase}/suggest`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({}),
//         });
//         const d = await res.json();
//         if (!res.ok || !d.success) throw new Error(d.message || "Failed to build a schedule");
//         setData(d);
//       } catch (err) {
//         console.error(err);
//         setError(err.message || "Failed to build a schedule");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [apiBase]);

//   const handleConfirm = async () => {
//     setSaving(true);
//     setError("");
//     try {
//       const res = await fetch(`${apiBase}/confirm`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           createdBy: sessionStorage.getItem("username") || "",
//           assignments: data.assignments.map((a) => ({
//             scIds: a.scIds,
//             date: a.date,
//             technicianId: a.technicianId,
//             technicianName: a.technicianName,
//             location: a.location,
//           })),
//         }),
//       });
//       const d = await res.json();
//       if (!res.ok || !d.success) throw new Error(d.message || "Failed to save the schedule");
//       setResult(d);
//       onConfirmed();
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Failed to save the schedule");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const rows = data?.assignments || [];
//   const opt = data?.optimized;
//   const base = data?.baseline;

//   return (
//     <div className="atm-overlay" onClick={onClose}>
//       <div className="atm-content" style={{ maxWidth: 940, width: "94%" }} onClick={(e) => e.stopPropagation()}>
//         <div className="atm-header">
//           <h2>Auto-Schedule Site Calibration</h2>
//           <button className="atm-close" onClick={onClose}>
//             &times;
//           </button>
//         </div>

//         <div className="atm-body" style={{ maxHeight: "72vh", overflowY: "auto" }}>
//           {loading && <p className="atm-empty">Building a schedule…</p>}
//           {error && <p className="atm-error">{error}</p>}

//           {!loading && data && rows.length === 0 && (
//             <p className="atm-empty">{data.note || "Nothing to schedule."}</p>
//           )}

//           {!loading && rows.length > 0 && !result && (
//             <>
//               <p style={{ fontSize: 13, margin: "0 0 10px" }}>
//                 <strong>{data.pendingVisits}</strong> site visit(s) without an assignment,{" "}
//                 <strong>{data.technicianCount}</strong> technician(s). Existing assignments are respected: nobody is
//                 booked twice on the same day.
//                 {data.syncsTechnician &&
//                   " Confirming also sets the technician on the Site Calibration records" +
//                     (data.syncsDate ? " and moves their date if the visit slips." : ".")}
//               </p>

//               {opt && base && (
//                 <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: 14 }}>
//                   <thead>
//                     <tr>
//                       <th style={th}>Method</th>
//                       <th style={th}>Visits later than requested</th>
//                       <th style={th}>Priority-weighted late days</th>
//                       <th style={th}>Workload spread (max − min days)</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr>
//                       <td style={td}>Baseline (earliest date first)</td>
//                       <td style={td}>{base.lateVisits}</td>
//                       <td style={td}>{base.weightedLateDays}</td>
//                       <td style={td}>{base.loadSpread}</td>
//                     </tr>
//                     <tr>
//                       <td style={td}>
//                         <strong>Optimized (simulated annealing)</strong> — proposed below
//                       </td>
//                       <td style={td}>{opt.lateVisits}</td>
//                       <td style={td}>{opt.weightedLateDays}</td>
//                       <td style={td}>{opt.loadSpread}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               )}

//               <table style={{ borderCollapse: "collapse", width: "100%" }}>
//                 <thead>
//                   <tr>
//                     <th style={th}>Site Calibration</th>
//                     <th style={th}>Company</th>
//                     <th style={th}>Requested</th>
//                     <th style={th}>Suggested</th>
//                     <th style={th}>Technician</th>
//                     <th style={th}>Set on SC form</th>
//                     <th style={th}>Delay</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rows.map((a) => (
//                     <tr key={a.scIds.join("|")}>
//                       <td style={td}>{a.scIds.join(", ")}</td>
//                       <td style={td}>{a.companyName}</td>
//                       <td style={td}>{fmtDate(a.requestedDate)}</td>
//                       <td style={td}>{fmtDate(a.date)}</td>
//                       <td style={td}>{a.technicianName}</td>
//                       <td style={td}>{a.currentTechnicians.join(", ") || "-"}</td>
//                       <td style={{ ...td, ...lateStyle(a.lateWorkingDays) }}>
//                         {a.lateWorkingDays > 0 ? `+${a.lateWorkingDays} day(s)` : "On time"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {data.unscheduled?.length > 0 && (
//                 <p className="atm-error" style={{ marginTop: 10 }}>
//                   Could not place: {data.unscheduled.map((u) => u.scIds.join(", ")).join("; ")} (no free technician
//                   within the planning window).
//                 </p>
//               )}

//               <button
//                 className="atm-assign-btn"
//                 style={{ marginTop: 14 }}
//                 onClick={handleConfirm}
//                 disabled={saving}
//               >
//                 {saving ? "Saving…" : `Confirm & Save ${rows.length} Assignment(s)`}
//               </button>
//             </>
//           )}

//           {result && (
//             <>
//               <p style={{ fontSize: 14 }}>
//                 <strong>{result.createdCount}</strong> assignment(s) saved to the calendar.
//               </p>
//               {result.skipped?.length > 0 && (
//                 <div className="atm-error">
//                   {result.skipped.length} skipped:
//                   <ul style={{ margin: "4px 0 0 18px" }}>
//                     {result.skipped.map((s, i) => (
//                       <li key={i}>
//                         {(s.scIds || []).join(", ") || "Unknown"} — {s.reason}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//               <button className="atm-assign-btn" style={{ marginTop: 14 }} onClick={onClose}>
//                 Close
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import "./AssignTechnicianModal.css";

const fmtDate = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const th = {
  textAlign: "left",
  padding: "6px 8px",
  borderBottom: "1px solid #ddd",
  fontSize: 12,
  color: "#555",
};
const td = {
  padding: "6px 8px",
  borderBottom: "1px solid #eee",
  fontSize: 13,
  verticalAlign: "top",
};

const lateStyle = (days) =>
  days > 0
    ? { color: "#b42318", fontWeight: 600 }
    : { color: "#067647", fontWeight: 600 };

// Shows a proposed schedule for site calibration jobs that have no
// assignment yet. Nothing is saved until the user confirms.
export default function AutoScheduleModal({ apiBase, onClose, onConfirmed }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/suggest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const d = await res.json();
        if (!res.ok || !d.success)
          throw new Error(d.message || "Failed to build a schedule");
        setData(d);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to build a schedule");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiBase]);

  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          createdBy: sessionStorage.getItem("username") || "",
          assignments: data.assignments.map((a) => ({
            scIds: a.scIds,
            date: a.date,
            technicianId: a.technicianId,
            technicianName: a.technicianName,
            location: a.location,
          })),
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.success)
        throw new Error(d.message || "Failed to save the schedule");
      setResult(d);
      onConfirmed();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save the schedule");
    } finally {
      setSaving(false);
    }
  };

  const rows = data?.assignments || [];
  const opt = data?.optimized;
  const base = data?.baseline;

  return (
    <div className="atm-overlay" onClick={onClose}>
      <div
        className="atm-content"
        style={{ maxWidth: 940, width: "94%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="atm-header">
          <h2>Auto-Schedule Site Calibration</h2>
          <button className="atm-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div
          className="atm-body"
          style={{ maxHeight: "72vh", overflowY: "auto" }}
        >
          {loading && <p className="atm-empty">Building a schedule…</p>}
          {error && <p className="atm-error">{error}</p>}

          {!loading && data && rows.length === 0 && (
            <p className="atm-empty">{data.note || "Nothing to schedule."}</p>
          )}

          {!loading && rows.length > 0 && !result && (
            <>
              <p style={{ fontSize: 13, margin: "0 0 10px" }}>
                <strong>{data.pendingVisits}</strong> site visit(s) without an
                assignment, <strong>{data.technicianCount}</strong>{" "}
                technician(s). Existing assignments are respected: nobody is
                booked twice on the same day.
                {data.syncsTechnician &&
                  " Confirming also sets the technician on the Site Calibration records" +
                    (data.syncsDate
                      ? " and moves their date if the visit slips."
                      : ".")}
              </p>

              {opt && base && (
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    marginBottom: 14,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={th}>Method</th>
                      <th style={th}>Visits later than requested</th>
                      <th style={th}>Priority-weighted late days</th>
                      <th style={th}>Workload spread (max − min days)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={td}>Baseline (earliest date first)</td>
                      <td style={td}>{base.lateVisits}</td>
                      <td style={td}>{base.weightedLateDays}</td>
                      <td style={td}>{base.loadSpread}</td>
                    </tr>
                    <tr>
                      <td style={td}>
                        <strong>Optimized (simulated annealing)</strong> —
                        proposed below
                      </td>
                      <td style={td}>{opt.lateVisits}</td>
                      <td style={td}>{opt.weightedLateDays}</td>
                      <td style={td}>{opt.loadSpread}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={th}>Site Calibration</th>
                    <th style={th}>Company</th>
                    <th style={th}>Requested</th>
                    <th style={th}>Suggested</th>
                    <th style={th}>Technician</th>
                    <th style={th}>Set on SC form</th>
                    <th style={th}>Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.scIds.join("|")}>
                      <td style={td}>{a.scIds.join(", ")}</td>
                      <td style={td}>{a.companyName}</td>
                      <td style={td}>{fmtDate(a.requestedDate)}</td>
                      <td style={td}>{fmtDate(a.date)}</td>
                      <td style={td}>{a.technicianName}</td>
                      <td style={td}>
                        {a.currentTechnicians.join(", ") || "-"}
                      </td>
                      <td style={{ ...td, ...lateStyle(a.lateWorkingDays) }}>
                        {a.lateWorkingDays > 0
                          ? `+${a.lateWorkingDays} day(s)`
                          : "On time"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.unscheduled?.length > 0 && (
                <p className="atm-error" style={{ marginTop: 10 }}>
                  Could not place:{" "}
                  {data.unscheduled.map((u) => u.scIds.join(", ")).join("; ")}{" "}
                  (no free technician within the planning window).
                </p>
              )}

              <button
                className="atm-assign-btn"
                style={{ marginTop: 14 }}
                onClick={handleConfirm}
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : `Confirm & Save ${rows.length} Assignment(s)`}
              </button>
            </>
          )}

          {result && (
            <>
              <p style={{ fontSize: 14 }}>
                <strong>{result.createdCount}</strong> assignment(s) saved to
                the calendar.
              </p>
              {result.skipped?.length > 0 && (
                <div className="atm-error">
                  {result.skipped.length} skipped:
                  <ul style={{ margin: "4px 0 0 18px" }}>
                    {result.skipped.map((s, i) => (
                      <li key={i}>
                        {(s.scIds || []).join(", ") || "Unknown"} — {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                className="atm-assign-btn"
                style={{ marginTop: 14 }}
                onClick={onClose}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
