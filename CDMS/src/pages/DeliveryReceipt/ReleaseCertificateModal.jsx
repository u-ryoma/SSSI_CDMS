// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import "./DeliveryReceiptModals.css";

// const API = import.meta.env.VITE_API_URL;

// const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

// // "RELEASE CERTIFICATE" picker, opened from the Add button in
// // DeliveryReceiptCertificateModal. Mirrors ReleaseUnitModal - loads a
// // list of jobs ready to have their certificate released, lets the user
// // click through and add several to the delivery receipt's item list
// // without closing between picks, then close manually when done.
// //
// // TODO: confirm what "Load" should actually fetch. Right now it pulls
// // `${API}/api/jobnumbers` and filters to jobs tagged forDeliveryTagged
// // (same tag the list page uses) since that's the closest existing
// // pattern - swap the filter/endpoint once the real source is settled.
// // It's possible certificates should be filtered by forPrintFinalTagged
// // or a dedicated certificate-ready flag instead - let me know which.
// //
// // TODO: "Log" and "Quick Log" are stubbed with console.log - there's no
// // reference yet for what those screens should show.
// const ReleaseCertificateModal = ({
//   isOpen,
//   onClose,
//   onAddItem,
//   addedIds = [],
// }) => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [pageSize, setPageSize] = useState(26);
//   const [evaluatedBy, setEvaluatedBy] = useState("");
//   const [evaluators, setEvaluators] = useState([]);

//   const handleLoad = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/jobnumbers`);
//       const data = await res.json();
//       const jobs = Array.isArray(data) ? data : [];
//       setRows(jobs.filter((job) => job.forDeliveryTagged === true));
//     } catch (err) {
//       console.error("Failed to load releasable certificates:", err);
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // TODO: confirm the endpoint/shape for the "Evaluated By" options -
//   // guessing it's the same users collection used elsewhere.
//   const fetchEvaluators = async () => {
//     try {
//       const res = await fetch(`${API}/api/users`);
//       const data = await res.json();
//       setEvaluators(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch evaluators:", err);
//     }
//   };

//   const handleLog = () => console.log("Open Log");
//   const handleQuickLog = () => console.log("Open Quick Log");

//   const handleRowClick = (row) => {
//     const rowId = row.jobReceiptID || row._id;
//     if (addedIds.includes(rowId)) return;
//     onAddItem({
//       id: rowId,
//       value: [
//         row.jobReceiptID,
//         row.instrumentName || row.type,
//         row.certificateNo,
//       ]
//         .filter(Boolean)
//         .join(" — "),
//       evaluatedBy,
//     });
//   };

//   useEffect(() => {
//     fetchEvaluators();
//   }, []);

//   if (!isOpen) return null;

//   const visibleRows = rows.slice(0, pageSize);

//   return ReactDOM.createPortal(
//     <div className="dr-modal-overlay">
//       <div className="dr-modal dr-modal--large">
//         <CdmsModalHeader title="RELEASE CERTIFICATE" onClose={onClose} />

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
//             <button className="dr-btn dr-btn--bold" onClick={handleLog}>
//               Log
//             </button>
//             <button className="dr-btn" onClick={handleQuickLog}>
//               Quick Log
//             </button>

//             <div className="dr-release-toolbar-spacer" />

//             <label className="dr-release-evaluated-by">
//               Evaluated By :
//               <select
//                 value={evaluatedBy}
//                 onChange={(e) => setEvaluatedBy(e.target.value)}
//               >
//                 <option value=""></option>
//                 {evaluators.map((u) => (
//                   <option key={u._id} value={u.fullName || u.name}>
//                     {u.fullName || u.name}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </div>

//           <div className="dr-release-list-wrapper">
//             {loading ? (
//               <p className="dr-release-loading">Loading...</p>
//             ) : (
//               <table className="dr-table dr-release-table">
//                 <tbody>
//                   {visibleRows.length > 0
//                     ? visibleRows.map((row) => {
//                         const rowId = row.jobReceiptID || row._id;
//                         const added = addedIds.includes(rowId);
//                         return (
//                           <tr
//                             key={rowId}
//                             className={`dr-release-row${added ? " dr-release-row--added" : ""}`}
//                             onClick={() => handleRowClick(row)}
//                           >
//                             <td>
//                               {[
//                                 row.jobReceiptID,
//                                 row.instrumentName || row.type,
//                                 row.certificateNo,
//                               ]
//                                 .filter(Boolean)
//                                 .join(" — ")}
//                               {added ? " (added)" : ""}
//                             </td>
//                           </tr>
//                         );
//                       })
//                     : // Blank ruled rows so the list looks like the
//                       // reference screenshot before anything is loaded.
//                       Array.from({ length: 20 }).map((_, i) => (
//                         <tr
//                           key={i}
//                           className="dr-release-row dr-release-row--blank"
//                         >
//                           <td>&nbsp;</td>
//                         </tr>
//                       ))}
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

// export default ReleaseCertificateModal;
import React, { useState } from "react";
import ReactDOM from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import "./DeliveryReceiptModals.css";

const API = import.meta.env.VITE_API_URL;

const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

// "RELEASE CERTIFICATE" picker, opened from the Add button in
// DeliveryReceiptCertificateModal, scoped to the customer already
// picked there. Mirrors ReleaseUnitModal exactly, with one deliberate
// difference: filters on certificateDelivered instead of
// unitDelivered, so a job that already had its instrument released
// still shows up here to be released for certificate too.
//
// Flow: click Load -> fetches completed jobs (forDeliveryTagged ===
// true, certificateDelivered !== true) for the selected customer.
// Click row(s) to select (toggle highlight, multi-select). Click Log
// -> pulls full details of every selected row into the delivery
// receipt's item list and clears the selection.
//
// TODO: "Quick Log" is still stubbed - no reference yet for what that
// screen should show.
const ReleaseCertificateModal = ({
  isOpen,
  onClose,
  onAddItem,
  addedIds = [],
  customerId,
}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(26);
  const [evaluatedBy, setEvaluatedBy] = useState("");
  const [loadError, setLoadError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  React.useEffect(() => {
    if (!isOpen) return;
    setEvaluatedBy(sessionStorage.getItem("username") || "");
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
                job.forDeliveryTagged === true &&
                job.certificateDelivered !== true,
            )
            .filter((job) => {
              const receipt = receiptsMap[job.jobReceiptID];
              return receipt?.customerID === customerId;
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
      console.error("Failed to load releasable certificates:", err);
      setLoadError("Failed to load completed jobs.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = () => console.log("Open Quick Log");

  const toggleRowSelected = (row) => {
    const rowId = row.jobNumber;
    if (addedIds.includes(rowId)) return;
    setSelectedIds((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId],
    );
  };

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
        <CdmsModalHeader title="RELEASE CERTIFICATE" onClose={onClose} />

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
            <button className="dr-btn" onClick={handleQuickLog}>
              Quick Log
            </button>

            <div className="dr-release-toolbar-spacer" />

            <label className="dr-release-evaluated-by">
              Evaluated By :
              <input type="text" value={evaluatedBy} disabled />
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

export default ReleaseCertificateModal;
