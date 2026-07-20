// import React, { useState, useEffect, useMemo } from "react";
// import { createPortal } from "react-dom";

// const API = import.meta.env.VITE_API_URL;

// // How many days before the due date "Use Details" becomes enabled — same
// // window as RecallSys.jsx.
// const REUSE_LEAD_DAYS = 5;
// const MS_PER_DAY = 1000 * 60 * 60 * 24;

// const FREQUENCY_MONTHS = {
//   "6 Months": 6,
//   "1 Year": 12,
//   "2 Years": 24,
//   "3 Years": 36,
// };

// const isJobFinished = (job) =>
//   Boolean(job.unitDelivered && job.certificateDelivered);

// const getDueDate = (job) => {
//   const months = FREQUENCY_MONTHS[job.frequency];
//   if (!job.doCertDate || !months) return null;
//   const due = new Date(job.doCertDate);
//   due.setMonth(due.getMonth() + months);
//   return due;
// };

// const getDaysUntilDue = (dueDate) => {
//   if (!dueDate) return null;
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const due = new Date(dueDate);
//   due.setHours(0, 0, 0, 0);
//   return Math.round((due - today) / MS_PER_DAY);
// };

// const getRecallStatus = (daysUntilDue) => {
//   if (daysUntilDue === null) return "Not Yet Finished";
//   if (daysUntilDue < 0) return "Overdue";
//   if (daysUntilDue <= REUSE_LEAD_DAYS) return "Due Soon";
//   return "Not Yet Due";
// };

// const formatDate = (date) => (date ? date.toISOString().split("T")[0] : "");

// // Find the delivery receipt of a given type (instrument/certificate) that
// // belongs to a job's CURRENT cycle. A job number can be reused (see
// // RecallSys.jsx's handleReuse), so multiple delivery receipts may share the
// // same jobNumber across different cycles. `job.reusedAt` (set at the moment
// // of reuse) is the cutoff: any candidate receipt dated before it belongs to
// // a previous, already-closed-out cycle and must be ignored. Among whatever
// // remains, take the most recent one — this is what "Use Details" should
// // actually be pulling from, not the first match in the list.
// const findCurrentDeliveryReceipt = (deliveryReceipts, job, type) => {
//   const candidates = deliveryReceipts.filter((r) => {
//     if (r.type !== type) return false;
//     if (!r.items?.some((i) => i.jobNumber === job.jobNumber)) return false;
//     if (job.reusedAt && r.date && new Date(r.date) < new Date(job.reusedAt)) {
//       return false;
//     }
//     return true;
//   });

//   if (candidates.length === 0) return undefined;

//   return candidates.reduce((latest, r) => {
//     if (!latest) return r;
//     if (!r.date) return latest;
//     if (!latest.date) return r;
//     return new Date(r.date) > new Date(latest.date) ? r : latest;
//   }, undefined);
// };

// const RecallJobModal = ({ onClose, onUseDetails, savedJobNumbers }) => {
//   const currentYr = new Date().getFullYear();
//   const yearOptions = Array.from({ length: 6 }, (_, i) =>
//     (currentYr - i).toString().slice(-2),
//   );

//   const [prefix, setPrefix] = useState("SSS");
//   const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
//   const [jobNumberInput, setJobNumberInput] = useState("");
//   const [selectedJob, setSelectedJob] = useState(null);

//   const [deliveryReceipts, setDeliveryReceipts] = useState([]);
//   const [loadingDelivery, setLoadingDelivery] = useState(false);

//   // Fetch delivery receipts once, on open — needed to compute doCertDate for
//   // each job (same join JobNumber.jsx / RecallSys.jsx do), since
//   // savedJobNumbers here is the raw /api/jobnumbers list without that join.
//   useEffect(() => {
//     const fetchDeliveryReceipts = async () => {
//       setLoadingDelivery(true);
//       try {
//         const res = await fetch(`${API}/api/deliveryreceipts`);
//         const data = await res.json();
//         setDeliveryReceipts(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to fetch delivery receipts:", err);
//         setDeliveryReceipts([]);
//       } finally {
//         setLoadingDelivery(false);
//       }
//     };
//     fetchDeliveryReceipts();
//   }, []);

//   // Join each job with its certificate delivery date, then compute due date
//   // / days-until-due / recall status — same logic as RecallSys.jsx. Uses
//   // findCurrentDeliveryReceipt so a reused job number's stale, previous-
//   // cycle delivery receipt is never mistaken for the current one.
//   const enrichedJobs = useMemo(() => {
//     return savedJobNumbers.map((job) => {
//       const certDR = findCurrentDeliveryReceipt(
//         deliveryReceipts,
//         job,
//         "certificate",
//       );
//       const doCertDate = certDR?.date || "";
//       const dueDate = getDueDate({ ...job, doCertDate });
//       const daysUntilDue = getDaysUntilDue(dueDate);
//       const recallStatus = getRecallStatus(daysUntilDue);
//       const reuseEnabled =
//         isJobFinished(job) &&
//         daysUntilDue !== null &&
//         daysUntilDue <= REUSE_LEAD_DAYS;

//       return {
//         ...job,
//         doCertDate,
//         dueDate,
//         daysUntilDue,
//         recallStatus,
//         reuseEnabled,
//       };
//     });
//   }, [savedJobNumbers, deliveryReceipts]);

//   const filtered = enrichedJobs.filter((job) => {
//     const parts = job.jobNumber?.split("/");
//     if (!parts || parts.length < 3) return false;
//     return parts[0] === prefix && parts[2] === selectedYear;
//   });

//   const handleRowClick = (job) => {
//     setSelectedJob(job);
//     setJobNumberInput(job.jobNumber);
//   };

//   const handleUseDetails = () => {
//     if (!selectedJob || !selectedJob.reuseEnabled) return;
//     onUseDetails(selectedJob);
//   };

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <div
//         className="recall-modal-wrapper"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* FIXED HEADER */}
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">RECALL JOB NUMBER</span>
//               <span className="jr-modal-title-sub">
//                 SCIENTIFIC STANDARDS SERVICES
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         {/* CONTENT */}
//         <div className="recall-content">
//           <div className="recall-filter-row">
//             <select
//               className="recall-select"
//               value={prefix}
//               onChange={(e) => {
//                 setPrefix(e.target.value);
//                 setSelectedJob(null);
//                 setJobNumberInput("");
//               }}
//             >
//               <option value="SSS">SSS</option>
//               <option value="SSE">SSE</option>
//             </select>

//             <input
//               type="text"
//               className="recall-input"
//               placeholder="Job number..."
//               value={jobNumberInput}
//               onChange={(e) => setJobNumberInput(e.target.value)}
//             />

//             <select
//               className="recall-select"
//               value={selectedYear}
//               onChange={(e) => {
//                 setSelectedYear(e.target.value);
//                 setSelectedJob(null);
//                 setJobNumberInput("");
//               }}
//             >
//               {yearOptions.map((yr) => (
//                 <option key={yr} value={yr}>
//                   {yr}
//                 </option>
//               ))}
//             </select>

//             <button className="recall-search-btn" title="Search">
//               🔍
//             </button>
//           </div>

//           <div className="recall-table-wrapper">
//             <table className="recall-table">
//               <thead>
//                 <tr>
//                   <th>Job Number</th>
//                   <th>Description</th>
//                   <th>Brand</th>
//                   <th>Model</th>
//                   <th>Serial No.</th>
//                   <th>Range</th>
//                   <th>Uncertainty</th>
//                   <th>Remarks</th>
//                   <th>Priority</th>
//                   <th>Due Date</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loadingDelivery ? (
//                   <tr>
//                     <td colSpan="11" className="jr-no-data">
//                       Loading...
//                     </td>
//                   </tr>
//                 ) : filtered.length > 0 ? (
//                   filtered.map((job, index) => (
//                     <tr
//                       key={index}
//                       className={`recall-row ${selectedJob?.jobNumber === job.jobNumber ? "recall-row-selected" : ""} ${!job.reuseEnabled ? "recall-row-ineligible" : ""}`}
//                       onClick={() => handleRowClick(job)}
//                       title={
//                         job.reuseEnabled
//                           ? ""
//                           : "Not yet due — details can be viewed but not reused"
//                       }
//                     >
//                       <td>{job.jobNumber}</td>
//                       <td>{job.description}</td>
//                       <td>{job.brand}</td>
//                       <td>{job.model}</td>
//                       <td>{job.serialNo}</td>
//                       <td>{job.range}</td>
//                       <td>{job.uncertainty}</td>
//                       <td>{job.remarks}</td>
//                       <td>{job.priority}</td>
//                       <td>{formatDate(job.dueDate) || "—"}</td>
//                       <td>{job.recallStatus}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="11" className="jr-no-data">
//                       No job numbers found for {prefix}/{selectedYear}.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {selectedJob && (
//             <div className="recall-preview">
//               <div className="recall-preview-title">
//                 Selected: {selectedJob.jobNumber} —{" "}
//                 <span
//                   style={{
//                     color: selectedJob.reuseEnabled ? "green" : "#b00",
//                   }}
//                 >
//                   {selectedJob.recallStatus}
//                 </span>
//               </div>
//               <div className="recall-preview-grid">
//                 <div>
//                   <span>Description:</span> {selectedJob.description}
//                 </div>
//                 <div>
//                   <span>Brand:</span> {selectedJob.brand}
//                 </div>
//                 <div>
//                   <span>Model:</span> {selectedJob.model}
//                 </div>
//                 <div>
//                   <span>Serial No.:</span> {selectedJob.serialNo}
//                 </div>
//                 <div>
//                   <span>Range:</span> {selectedJob.range}
//                 </div>
//                 <div>
//                   <span>Uncertainty:</span> {selectedJob.uncertainty}
//                 </div>
//                 <div>
//                   <span>Frequency:</span> {selectedJob.frequency}
//                 </div>
//                 <div>
//                   <span>Priority:</span> {selectedJob.priority}
//                 </div>
//                 <div>
//                   <span>Due Date:</span>{" "}
//                   {formatDate(selectedJob.dueDate) || "—"}
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="recall-footer">
//             <button
//               className={`jr-save-btn ${!selectedJob?.reuseEnabled ? "recall-btn-disabled" : ""}`}
//               onClick={handleUseDetails}
//               disabled={!selectedJob?.reuseEnabled}
//               title={
//                 selectedJob && !selectedJob.reuseEnabled
//                   ? `Enabled ${REUSE_LEAD_DAYS} days before the due date`
//                   : ""
//               }
//             >
//               Use Details
//             </button>
//             <button className="jr-action-btn" onClick={onClose}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default RecallJobModal;
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

// How long before the due date "Use Details" becomes enabled — same window
// as RecallSys.jsx. Using months (not a fixed day count) so the window is
// always "1 calendar month before", correctly accounting for months of
// different lengths.
const REUSE_LEAD_MONTHS = 1;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const FREQUENCY_MONTHS = {
  "6 Months": 6,
  "1 Year": 12,
  "2 Years": 24,
  "3 Years": 36,
};

const isJobFinished = (job) =>
  Boolean(job.unitDelivered && job.certificateDelivered);

const getDueDate = (job) => {
  const months = FREQUENCY_MONTHS[job.frequency];
  if (!job.doCertDate || !months) return null;
  const due = new Date(job.doCertDate);
  due.setMonth(due.getMonth() + months);
  return due;
};

const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / MS_PER_DAY);
};

// The calendar date at which the reuse window opens — exactly
// REUSE_LEAD_MONTHS before the due date.
const getReuseEligibleFrom = (dueDate) => {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  d.setMonth(d.getMonth() - REUSE_LEAD_MONTHS);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Whether today has reached the reuse window for this due date.
const isReuseEligible = (dueDate) => {
  const eligibleFrom = getReuseEligibleFrom(dueDate);
  if (!eligibleFrom) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= eligibleFrom;
};

const getRecallStatus = (daysUntilDue, reuseEligible) => {
  if (daysUntilDue === null) return "Not Yet Finished";
  if (daysUntilDue < 0) return "Overdue";
  if (reuseEligible) return "Due Soon";
  return "Not Yet Due";
};

const formatDate = (date) => (date ? date.toISOString().split("T")[0] : "");

// Find the delivery receipt of a given type (instrument/certificate) that
// belongs to a job's CURRENT cycle. A job number can be reused (see
// RecallSys.jsx's handleReuse), so multiple delivery receipts may share the
// same jobNumber across different cycles. `job.reusedAt` (set at the moment
// of reuse) is the cutoff: any candidate receipt dated before it belongs to
// a previous, already-closed-out cycle and must be ignored. Among whatever
// remains, take the most recent one — this is what "Use Details" should
// actually be pulling from, not the first match in the list.
const findCurrentDeliveryReceipt = (deliveryReceipts, job, type) => {
  const candidates = deliveryReceipts.filter((r) => {
    if (r.type !== type) return false;
    if (!r.items?.some((i) => i.jobNumber === job.jobNumber)) return false;
    if (job.reusedAt && r.date && new Date(r.date) < new Date(job.reusedAt)) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) return undefined;

  return candidates.reduce((latest, r) => {
    if (!latest) return r;
    if (!r.date) return latest;
    if (!latest.date) return r;
    return new Date(r.date) > new Date(latest.date) ? r : latest;
  }, undefined);
};

const RecallJobModal = ({ onClose, onUseDetails, savedJobNumbers }) => {
  const currentYr = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) =>
    (currentYr - i).toString().slice(-2),
  );

  const [prefix, setPrefix] = useState("SSS");
  const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
  const [jobNumberInput, setJobNumberInput] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const [deliveryReceipts, setDeliveryReceipts] = useState([]);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  // Fetch delivery receipts once, on open — needed to compute doCertDate for
  // each job (same join JobNumber.jsx / RecallSys.jsx do), since
  // savedJobNumbers here is the raw /api/jobnumbers list without that join.
  useEffect(() => {
    const fetchDeliveryReceipts = async () => {
      setLoadingDelivery(true);
      try {
        const res = await fetch(`${API}/api/deliveryreceipts`);
        const data = await res.json();
        setDeliveryReceipts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch delivery receipts:", err);
        setDeliveryReceipts([]);
      } finally {
        setLoadingDelivery(false);
      }
    };
    fetchDeliveryReceipts();
  }, []);

  // Join each job with its certificate delivery date, then compute due date
  // / days-until-due / recall status — same logic as RecallSys.jsx. Uses
  // findCurrentDeliveryReceipt so a reused job number's stale, previous-
  // cycle delivery receipt is never mistaken for the current one.
  const enrichedJobs = useMemo(() => {
    return savedJobNumbers.map((job) => {
      const certDR = findCurrentDeliveryReceipt(
        deliveryReceipts,
        job,
        "certificate",
      );
      const doCertDate = certDR?.date || "";
      const dueDate = getDueDate({ ...job, doCertDate });
      const daysUntilDue = getDaysUntilDue(dueDate);
      const reuseEnabled = isJobFinished(job) && isReuseEligible(dueDate);
      const recallStatus = getRecallStatus(daysUntilDue, reuseEnabled);

      return {
        ...job,
        doCertDate,
        dueDate,
        daysUntilDue,
        recallStatus,
        reuseEnabled,
      };
    });
  }, [savedJobNumbers, deliveryReceipts]);

  const filtered = enrichedJobs.filter((job) => {
    const parts = job.jobNumber?.split("/");
    if (!parts || parts.length < 3) return false;
    return parts[0] === prefix && parts[2] === selectedYear;
  });

  const handleRowClick = (job) => {
    setSelectedJob(job);
    setJobNumberInput(job.jobNumber);
  };

  const handleUseDetails = () => {
    if (!selectedJob || !selectedJob.reuseEnabled) return;
    onUseDetails(selectedJob);
  };

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <div
        className="recall-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIXED HEADER */}
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">RECALL JOB NUMBER</span>
              <span className="jr-modal-title-sub">
                SCIENTIFIC STANDARDS SERVICES
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="recall-content">
          <div className="recall-filter-row">
            <select
              className="recall-select"
              value={prefix}
              onChange={(e) => {
                setPrefix(e.target.value);
                setSelectedJob(null);
                setJobNumberInput("");
              }}
            >
              <option value="SSS">SSS</option>
              <option value="SSE">SSE</option>
            </select>

            <input
              type="text"
              className="recall-input"
              placeholder="Job number..."
              value={jobNumberInput}
              onChange={(e) => setJobNumberInput(e.target.value)}
            />

            <select
              className="recall-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedJob(null);
                setJobNumberInput("");
              }}
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            <button className="recall-search-btn" title="Search">
              🔍
            </button>
          </div>

          <div className="recall-table-wrapper">
            <table className="recall-table">
              <thead>
                <tr>
                  <th>Job Number</th>
                  <th>Description</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Serial No.</th>
                  <th>Range</th>
                  <th>Uncertainty</th>
                  <th>Remarks</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingDelivery ? (
                  <tr>
                    <td colSpan="11" className="jr-no-data">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((job, index) => (
                    <tr
                      key={index}
                      className={`recall-row ${selectedJob?.jobNumber === job.jobNumber ? "recall-row-selected" : ""} ${!job.reuseEnabled ? "recall-row-ineligible" : ""}`}
                      onClick={() => handleRowClick(job)}
                      title={
                        job.reuseEnabled
                          ? ""
                          : "Not yet due — details can be viewed but not reused"
                      }
                    >
                      <td>{job.jobNumber}</td>
                      <td>{job.description}</td>
                      <td>{job.brand}</td>
                      <td>{job.model}</td>
                      <td>{job.serialNo}</td>
                      <td>{job.range}</td>
                      <td>{job.uncertainty}</td>
                      <td>{job.remarks}</td>
                      <td>{job.priority}</td>
                      <td>{formatDate(job.dueDate) || "—"}</td>
                      <td>{job.recallStatus}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="jr-no-data">
                      No job numbers found for {prefix}/{selectedYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedJob && (
            <div className="recall-preview">
              <div className="recall-preview-title">
                Selected: {selectedJob.jobNumber} —{" "}
                <span
                  style={{
                    color: selectedJob.reuseEnabled ? "green" : "#b00",
                  }}
                >
                  {selectedJob.recallStatus}
                </span>
              </div>
              <div className="recall-preview-grid">
                <div>
                  <span>Description:</span> {selectedJob.description}
                </div>
                <div>
                  <span>Brand:</span> {selectedJob.brand}
                </div>
                <div>
                  <span>Model:</span> {selectedJob.model}
                </div>
                <div>
                  <span>Serial No.:</span> {selectedJob.serialNo}
                </div>
                <div>
                  <span>Range:</span> {selectedJob.range}
                </div>
                <div>
                  <span>Uncertainty:</span> {selectedJob.uncertainty}
                </div>
                <div>
                  <span>Frequency:</span> {selectedJob.frequency}
                </div>
                <div>
                  <span>Priority:</span> {selectedJob.priority}
                </div>
                <div>
                  <span>Due Date:</span>{" "}
                  {formatDate(selectedJob.dueDate) || "—"}
                </div>
              </div>
            </div>
          )}

          <div className="recall-footer">
            <button
              className={`jr-save-btn ${!selectedJob?.reuseEnabled ? "recall-btn-disabled" : ""}`}
              onClick={handleUseDetails}
              disabled={!selectedJob?.reuseEnabled}
              title={
                selectedJob && !selectedJob.reuseEnabled
                  ? `Enabled ${REUSE_LEAD_MONTHS} month before the due date`
                  : ""
              }
            >
              Use Details
            </button>
            <button className="jr-action-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RecallJobModal;
