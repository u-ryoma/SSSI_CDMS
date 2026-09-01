// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import "./DeliveryReceiptModals.css";

// const API = import.meta.env.VITE_API_URL;

// const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

// // "RELEASE UNIT" picker, opened from the Add button in
// // DeliveryReceiptUnitModal, scoped to the customer already picked
// // there.
// //
// // Flow: click Load -> fetches completed jobs (forDeliveryTagged ===
// // true, delivered !== true) for the selected customer from the
// // database and renders them with full details. Click row(s) to select
// // (toggle highlight, multi-select). Click Log -> pulls the full detail
// // of every selected, not-yet-added row into the delivery receipt's
// // item list and clears the selection (rows already added show
// // "(added)" and can't be re-selected).
// //
// // Evaluated By is a dropdown of users with role === "technician",
// // fetched from /api/accounts when the modal opens. Defaults to the
// // currently logged-in user (sessionStorage "name") if that user is
// // itself a technician, otherwise starts blank.
// //
// // TODO: "Quick Log" is still stubbed - no reference yet for what that
// // screen should show.
// const ReleaseUnitModal = ({
//   isOpen,
//   onClose,
//   onAddItem,
//   addedIds = [],
//   customerId,
// }) => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pageSize, setPageSize] = useState(26);
//   const [technicians, setTechnicians] = useState([]);
//   const [evaluatedBy, setEvaluatedBy] = useState("");
//   const [loadError, setLoadError] = useState("");
//   const [selectedIds, setSelectedIds] = useState([]);

//   useEffect(() => {
//     if (!isOpen) return;

//     const loggedInName = sessionStorage.getItem("name") || "";

//     fetch(`${API}/api/accounts`)
//       .then((res) => res.json())
//       .then((accounts) => {
//         const techs = Array.isArray(accounts)
//           ? accounts.filter((acc) => acc.role === "technician")
//           : [];
//         setTechnicians(techs);
//         // Default to the logged-in user only if they're a technician;
//         // otherwise leave the select on its placeholder.
//         setEvaluatedBy(
//           techs.some((t) => t.name === loggedInName) ? loggedInName : "",
//         );
//       })
//       .catch((err) => {
//         console.error("Failed to load technicians:", err);
//         setTechnicians([]);
//       });
//   }, [isOpen]);

//   const handleLoad = async () => {
//     if (!customerId) {
//       setLoadError("No customer selected.");
//       setRows([]);
//       return;
//     }
//     setLoading(true);
//     setLoadError("");
//     setSelectedIds([]);
//     try {
//       const [jobsRes, receiptsRes] = await Promise.all([
//         fetch(`${API}/api/jobnumbers`),
//         fetch(`${API}/api/jobreceipts`),
//       ]);
//       const jobs = await jobsRes.json();
//       const receipts = await receiptsRes.json();

//       const receiptsMap = {};
//       if (Array.isArray(receipts)) {
//         receipts.forEach((r) => {
//           receiptsMap[r.jrId] = r;
//         });
//       }

//       const completedForCustomer = Array.isArray(jobs)
//         ? jobs
//             .filter(
//               (job) => job.forDeliveryTagged === true && job.delivered !== true,
//             )
//             .filter((job) => {
//               const receipt = receiptsMap[job.jobReceiptID];
//               return receipt?.customerID === customerId;
//             })
//             .map((job) => ({
//               jobNumber: job.jobNumber,
//               jobReceiptID: job.jobReceiptID,
//               description: job.description || "",
//               brand: job.brand || "",
//               model: job.model || "",
//               serialNo: job.serialNo || "",
//               eta: job.eta || "",
//               frequency: job.frequency || "",
//               remarks: job.remarks || "",
//               concern: job.concern || "",
//             }))
//         : [];

//       setRows(completedForCustomer);
//     } catch (err) {
//       console.error("Failed to load releasable units:", err);
//       setLoadError("Failed to load completed jobs.");
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleQuickLog = () => console.log("Open Quick Log");

//   const toggleRowSelected = (row) => {
//     const rowId = row.jobNumber;
//     if (addedIds.includes(rowId)) return; // already logged, can't reselect
//     setSelectedIds((prev) =>
//       prev.includes(rowId)
//         ? prev.filter((id) => id !== rowId)
//         : [...prev, rowId],
//     );
//   };

//   // "Log" confirms the current selection: pulls full details for each
//   // selected row into the delivery receipt's item list, then clears
//   // the selection so the rows can't be logged twice.
//   const handleLog = () => {
//     if (selectedIds.length === 0) return;
//     const toLog = rows.filter((row) => selectedIds.includes(row.jobNumber));
//     toLog.forEach((row) => {
//       onAddItem({
//         id: row.jobNumber,
//         jobNumber: row.jobNumber,
//         jobReceiptID: row.jobReceiptID,
//         description: row.description,
//         brand: row.brand,
//         model: row.model,
//         serialNo: row.serialNo,
//         eta: row.eta,
//         frequency: row.frequency,
//         remarks: row.remarks,
//         concern: row.concern,
//         value: [
//           row.jobNumber,
//           row.description,
//           row.brand,
//           row.model,
//           row.serialNo,
//         ]
//           .filter(Boolean)
//           .join(" — "),
//         evaluatedBy,
//       });
//     });
//     setSelectedIds([]);
//   };

//   if (!isOpen) return null;

//   const visibleRows = rows.slice(0, pageSize);

//   return ReactDOM.createPortal(
//     <div className="dr-modal-overlay">
//       <div className="dr-modal dr-modal--large">
//         <CdmsModalHeader title="RELEASE UNIT" onClose={onClose} />

//         <div className="dr-modal-body">
//           <div className="dr-release-toolbar">
//             <select
//               value={pageSize}
//               onChange={(e) => setPageSize(Number(e.target.value))}
//             >
//               {PAGE_SIZE_OPTIONS.map((n) => (
//                 <option key={n} value={n}>
//                   {n}
//                 </option>
//               ))}
//             </select>

//             <button className="dr-btn" onClick={handleLoad}>
//               Load
//             </button>
//             <button
//               className="dr-btn dr-btn--bold"
//               onClick={handleLog}
//               disabled={selectedIds.length === 0}
//             >
//               Log
//             </button>
//             {/* <button className="dr-btn" onClick={handleQuickLog}>
//               Quick Log
//             </button> */}

//             <div className="dr-release-toolbar-spacer" />

//             <label className="dr-release-evaluated-by">
//               Evaluated By :
//               <select
//                 value={evaluatedBy}
//                 onChange={(e) => setEvaluatedBy(e.target.value)}
//               >
//                 <option value="">Select technician</option>
//                 {technicians.map((tech) => (
//                   <option key={tech._id || tech.username} value={tech.name}>
//                     {tech.name}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </div>

//           <div className="dr-release-list-wrapper">
//             {loading ? (
//               <p className="dr-release-loading">Loading...</p>
//             ) : loadError ? (
//               <p className="dr-release-loading">{loadError}</p>
//             ) : (
//               <table className="dr-table dr-release-table">
//                 <thead>
//                   <tr>
//                     <th>Job Number</th>
//                     <th>Description</th>
//                     <th>Brand</th>
//                     <th>Model</th>
//                     <th>Serial No.</th>
//                     <th>ETA</th>
//                     <th>Frequency</th>
//                     <th>Remarks</th>
//                     <th>Concern</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {visibleRows.length > 0 ? (
//                     visibleRows.map((row) => {
//                       const added = addedIds.includes(row.jobNumber);
//                       const selected = selectedIds.includes(row.jobNumber);
//                       return (
//                         <tr
//                           key={row.jobNumber}
//                           className={`dr-release-row${
//                             selected ? " dr-release-row--selected" : ""
//                           }${added ? " dr-release-row--added" : ""}`}
//                           onClick={() => toggleRowSelected(row)}
//                           style={{ cursor: added ? "default" : "pointer" }}
//                         >
//                           <td>
//                             {row.jobNumber}
//                             {added ? " (added)" : ""}
//                           </td>
//                           <td>{row.description}</td>
//                           <td>{row.brand}</td>
//                           <td>{row.model}</td>
//                           <td>{row.serialNo}</td>
//                           <td>{row.eta}</td>
//                           <td>{row.frequency}</td>
//                           <td>{row.remarks}</td>
//                           <td>{row.concern}</td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan="9" className="no-data">
//                         No completed jobs loaded yet — click Load.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default ReleaseUnitModal;
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import "./DeliveryReceiptModals.css";

const API = import.meta.env.VITE_API_URL;

const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

// "RELEASE UNIT" picker, opened from the Add button in
// DeliveryReceiptUnitModal, scoped to the customer already picked
// there.
//
// Flow: click Load -> fetches completed jobs (forDeliveryTagged ===
// true, unitDelivered !== true) for the selected customer from the
// database and renders them with full details. Click row(s) to select
// (toggle highlight, multi-select). Click Log -> pulls the full detail
// of every selected, not-yet-added row into the delivery receipt's
// item list and clears the selection (rows already added show
// "(added)" and can't be re-selected).
//
// Evaluated By is a dropdown of users with role === "technician",
// fetched from /api/accounts when the modal opens. Defaults to the
// currently logged-in user (sessionStorage "name") if that user is
// itself a technician, otherwise starts blank.
//
// TODO: "Quick Log" is still stubbed - no reference yet for what that
// screen should show.
const ReleaseUnitModal = ({
  isOpen,
  onClose,
  onAddItem,
  addedIds = [],
  customerId,
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(26);
  const [technicians, setTechnicians] = useState([]);
  const [evaluatedBy, setEvaluatedBy] = useState("");
  const [loadError, setLoadError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const loggedInName = sessionStorage.getItem("name") || "";

    fetch(`${API}/api/accounts`)
      .then((res) => res.json())
      .then((accounts) => {
        const techs = Array.isArray(accounts)
          ? accounts.filter((acc) => acc.role === "technician")
          : [];
        setTechnicians(techs);
        // Default to the logged-in user only if they're a technician;
        // otherwise leave the select on its placeholder.
        setEvaluatedBy(
          techs.some((t) => t.name === loggedInName) ? loggedInName : "",
        );
      })
      .catch((err) => {
        console.error("Failed to load technicians:", err);
        setTechnicians([]);
      });
  }, [isOpen]);

  const handleLoad = async () => {
    if (!customerId) {
      setLoadError("No customer selected.");
      setRows([]);
      return;
    }
    setLoading(true);
    setLoadError("");
    setSelectedIds([]);
    try {
      const [jobsRes, receiptsRes] = await Promise.all([
        fetch(`${API}/api/jobnumbers`),
        fetch(`${API}/api/jobreceipts`),
      ]);
      const jobs = await jobsRes.json();
      const receipts = await receiptsRes.json();

      const receiptsMap = {};
      if (Array.isArray(receipts)) {
        receipts.forEach((r) => {
          receiptsMap[r.jrId] = r;
        });
      }

      const completedForCustomer = Array.isArray(jobs)
        ? jobs
            .filter(
              (job) =>
                job.forDeliveryTagged === true && job.unitDelivered !== true,
            )
            .filter((job) => {
              // Jobs created via Job Receipt carry a jobReceiptID, so the
              // customer lives on the linked jobreceipts doc. Jobs created
              // via Add Site Calibration never go through Job Receipt —
              // they have no jobReceiptID — but they DO have customerId
              // stamped directly on the jobnumbers doc itself. Check both
              // so both flows resolve correctly.
              const receipt = receiptsMap[job.jobReceiptID];
              const jobCustomerId = job.customerId || receipt?.customerID;
              return jobCustomerId === customerId;
            })
            .map((job) => ({
              jobNumber: job.jobNumber,
              jobReceiptID: job.jobReceiptID,
              description: job.description || "",
              brand: job.brand || "",
              model: job.model || "",
              serialNo: job.serialNo || "",
              eta: job.eta || "",
              frequency: job.frequency || "",
              remarks: job.remarks || "",
              concern: job.concern || "",
            }))
        : [];

      setRows(completedForCustomer);
    } catch (err) {
      console.error("Failed to load releasable units:", err);
      setLoadError("Failed to load completed jobs.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = () => console.log("Open Quick Log");

  const toggleRowSelected = (row) => {
    const rowId = row.jobNumber;
    if (addedIds.includes(rowId)) return; // already logged, can't reselect
    setSelectedIds((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId],
    );
  };

  // "Log" confirms the current selection: pulls full details for each
  // selected row into the delivery receipt's item list, then clears
  // the selection so the rows can't be logged twice.
  const handleLog = () => {
    if (selectedIds.length === 0) return;
    const toLog = rows.filter((row) => selectedIds.includes(row.jobNumber));
    toLog.forEach((row) => {
      onAddItem({
        id: row.jobNumber,
        jobNumber: row.jobNumber,
        jobReceiptID: row.jobReceiptID,
        description: row.description,
        brand: row.brand,
        model: row.model,
        serialNo: row.serialNo,
        eta: row.eta,
        frequency: row.frequency,
        remarks: row.remarks,
        concern: row.concern,
        value: [
          row.jobNumber,
          row.description,
          row.brand,
          row.model,
          row.serialNo,
        ]
          .filter(Boolean)
          .join(" — "),
        evaluatedBy,
      });
    });
    setSelectedIds([]);
  };

  if (!isOpen) return null;

  const visibleRows = rows.slice(0, pageSize);

  return ReactDOM.createPortal(
    <div className="dr-modal-overlay">
      <div className="dr-modal dr-modal--large">
        <CdmsModalHeader title="RELEASE UNIT" onClose={onClose} />

        <div className="dr-modal-body">
          <div className="dr-release-toolbar">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button className="dr-btn" onClick={handleLoad}>
              Load
            </button>
            <button
              className="dr-btn dr-btn--bold"
              onClick={handleLog}
              disabled={selectedIds.length === 0}
            >
              Log
            </button>
            {/* <button className="dr-btn" onClick={handleQuickLog}>
              Quick Log
            </button> */}

            <div className="dr-release-toolbar-spacer" />

            <label className="dr-release-evaluated-by">
              Evaluated By :
              <select
                value={evaluatedBy}
                onChange={(e) => setEvaluatedBy(e.target.value)}
              >
                <option value="">Select technician</option>
                {technicians.map((tech) => (
                  <option key={tech._id || tech.username} value={tech.name}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="dr-release-list-wrapper">
            {loading ? (
              <p className="dr-release-loading">Loading...</p>
            ) : loadError ? (
              <p className="dr-release-loading">{loadError}</p>
            ) : (
              <table className="dr-table dr-release-table">
                <thead>
                  <tr>
                    <th>Job Number</th>
                    <th>Description</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Serial No.</th>
                    <th>ETA</th>
                    <th>Frequency</th>
                    <th>Remarks</th>
                    <th>Concern</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length > 0 ? (
                    visibleRows.map((row) => {
                      const added = addedIds.includes(row.jobNumber);
                      const selected = selectedIds.includes(row.jobNumber);
                      return (
                        <tr
                          key={row.jobNumber}
                          className={`dr-release-row${
                            selected ? " dr-release-row--selected" : ""
                          }${added ? " dr-release-row--added" : ""}`}
                          onClick={() => toggleRowSelected(row)}
                          style={{ cursor: added ? "default" : "pointer" }}
                        >
                          <td>
                            {row.jobNumber}
                            {added ? " (added)" : ""}
                          </td>
                          <td>{row.description}</td>
                          <td>{row.brand}</td>
                          <td>{row.model}</td>
                          <td>{row.serialNo}</td>
                          <td>{row.eta}</td>
                          <td>{row.frequency}</td>
                          <td>{row.remarks}</td>
                          <td>{row.concern}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-data">
                        No completed jobs loaded yet — click Load.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ReleaseUnitModal;
