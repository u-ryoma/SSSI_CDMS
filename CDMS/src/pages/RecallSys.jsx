// import React, { useState, useEffect, useMemo } from "react";
// import { createPortal } from "react-dom";
// import "./jobnumber.css";

// const API = import.meta.env.VITE_API_URL;

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "Job Number": "jobNumber",
//   Brand: "brand",
//   Model: "model",
//   "Serial No.": "serialNo",
// };

// // Same status logic as JobNumber.jsx — a job only qualifies for recall once
// // both the unit and certificate have actually been delivered back out.
// const isJobFinished = (job) =>
//   Boolean(job.unitDelivered && job.certificateDelivered);

// // Calibration frequency -> months, for computing the next due date.
// const FREQUENCY_MONTHS = {
//   "6 Months": 6,
//   "1 Year": 12,
//   "2 Years": 24,
//   "3 Years": 36,
// };

// // Due date = certificate delivery date + frequency. Returns null if either
// // piece is missing (e.g. delivery receipt join found nothing, or frequency
// // wasn't set), in which case we can't say whether it's due yet.
// const getDueDate = (job) => {
//   const months = FREQUENCY_MONTHS[job.frequency];
//   if (!job.doCertDate || !months) return null;
//   const due = new Date(job.doCertDate);
//   due.setMonth(due.getMonth() + months);
//   return due;
// };

// const formatDate = (date) => (date ? date.toISOString().split("T")[0] : "");

// // How many days before the due date the Reuse button becomes enabled.
// const REUSE_LEAD_DAYS = 5;
// const MS_PER_DAY = 1000 * 60 * 60 * 24;

// // Days remaining until due (negative = overdue). Null if we don't have
// // enough info (missing cert date or unrecognized frequency) to say.
// const getDaysUntilDue = (dueDate) => {
//   if (!dueDate) return null;
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const due = new Date(dueDate);
//   due.setHours(0, 0, 0, 0);
//   return Math.round((due - today) / MS_PER_DAY);
// };

// const getRecallStatus = (daysUntilDue) => {
//   if (daysUntilDue === null) return "Unknown";
//   if (daysUntilDue < 0) return "Overdue";
//   if (daysUntilDue <= REUSE_LEAD_DAYS) return "Due Soon";
//   return "Not Yet Due";
// };

// // Find the delivery receipt of a given type (instrument/certificate) that
// // belongs to a job's CURRENT cycle. A job number can be reused (see
// // handleReuse below), so multiple delivery receipts may share the same
// // jobNumber across different cycles. `job.reusedAt` (set at the moment of
// // reuse) is the cutoff: any candidate receipt dated before it belongs to a
// // previous, already-closed-out cycle and must be ignored. Among whatever
// // remains, take the most recent one.
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

// const RecallSys = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [resettingId, setResettingId] = useState(null);

//   const [selectedJob, setSelectedJob] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);

//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const fetchJobs = async () => {
//     setLoading(true);
//     try {
//       // Same three-way join as JobNumber.jsx: company/date info lives on the
//       // receipt, and DO Unit/Cert dates live only inside delivery receipts.
//       const [jobsRes, receiptsRes, deliveryRes] = await Promise.all([
//         fetch(`${API}/api/jobnumbers`),
//         fetch(`${API}/api/jobreceipts`),
//         fetch(`${API}/api/deliveryreceipts`),
//       ]);

//       const jobsData = await jobsRes.json();
//       const receiptsData = await receiptsRes.json();
//       const deliveryData = await deliveryRes.json();

//       const receiptsMap = {};
//       if (Array.isArray(receiptsData)) {
//         receiptsData.forEach((r) => {
//           receiptsMap[r.jrId] = r;
//         });
//       }

//       const deliveryReceipts = Array.isArray(deliveryData) ? deliveryData : [];

//       const merged = Array.isArray(jobsData)
//         ? jobsData.filter(isJobFinished).map((job) => {
//             const receipt = receiptsMap[job.jobReceiptID] || {};

//             const unitDR = findCurrentDeliveryReceipt(
//               deliveryReceipts,
//               job,
//               "instrument",
//             );
//             const certDR = findCurrentDeliveryReceipt(
//               deliveryReceipts,
//               job,
//               "certificate",
//             );

//             return {
//               ...job,
//               companyName: job.companyName || receipt.companyName || "",
//               doUnitDate: unitDR?.date || "",
//               doCertDate: certDR?.date || "",
//             };
//           })
//         : [];

//       setJobs(merged);
//     } catch (err) {
//       console.error("Failed to fetch recall list:", err);
//       setJobs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const rows = useMemo(() => {
//     return jobs.map((job) => {
//       const dueDate = getDueDate(job);
//       const daysUntilDue = getDaysUntilDue(dueDate);
//       const recallStatus = getRecallStatus(daysUntilDue);
//       const reuseEnabled =
//         daysUntilDue !== null && daysUntilDue <= REUSE_LEAD_DAYS;
//       return { ...job, dueDate, daysUntilDue, recallStatus, reuseEnabled };
//     });
//   }, [jobs]);

//   const filteredRows = useMemo(() => {
//     if (!activeSearch.trim()) return rows;
//     const key = searchKeyMap[searchBy];
//     return rows.filter((r) =>
//       r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
//     );
//   }, [rows, searchBy, activeSearch]);

//   const handleSearch = () => setActiveSearch(searchInput);
//   const handleSearchKeyDown = (e) => {
//     if (e.key === "Enter") handleSearch();
//   };
//   const handleRefresh = () => {
//     setSearchInput("");
//     setActiveSearch("");
//     setSearchBy("Company Name");
//     fetchJobs();
//   };

//   const handleRowClick = (job) => {
//     setSelectedJob(job);
//     setShowDetailsModal(true);
//   };

//   // REUSE — resets this job's pipeline progress back to the start so it can
//   // go through Instrument Tag / Incoming Calibration / etc. again, keeping
//   // the same jobNumber, jobReceiptID, and equipment details (brand, model,
//   // serialNo, description) rather than reserving a brand-new job number.
//   //
//   // `reusedAt` is stamped here as the cutoff between this job's old,
//   // closed-out cycle and its new one. JobNumber.jsx, RecallSys.jsx, and
//   // RecallJobModal.jsx all use it (via findCurrentDeliveryReceipt) to make
//   // sure a delivery receipt from the PREVIOUS cycle is never mistaken for
//   // the current one, since both share the same jobNumber.
//   const handleReuse = async (job) => {
//     const confirmed = window.confirm(
//       `Reuse Job Number ${job.jobNumber}? This resets its status so it re-enters the pipeline. This cannot be undone.`,
//     );
//     if (!confirmed) return;

//     setResettingId(job._id);
//     try {
//       const nowIso = new Date().toISOString();
//       const res = await fetch(`${API}/api/jobnumbers/${job._id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           dateRec: nowIso.split("T")[0],
//           reusedAt: nowIso,
//           unitDelivered: false,
//           certificateDelivered: false,
//           tagged: false,
//           concernTagged: false,
//           ongoingTagged: false,
//           forTypingTagged: false,
//           forCheckingOICTagged: false,
//           forCheckingSigTagged: false,
//           forPrintFinalTagged: false,
//         }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         // Drop it from this list immediately — it's no longer "finished".
//         setJobs((prev) => prev.filter((j) => j._id !== job._id));
//         setShowDetailsModal(false);
//         setSelectedJob(null);
//       } else {
//         console.error("Failed to reuse job number:", data.message);
//       }
//     } catch (err) {
//       console.error("Failed to reuse job number:", err);
//     } finally {
//       setResettingId(null);
//     }
//   };

//   return (
//     <div className="job-container">
//       <div className="job-header">
//         <h2>RECALL SYSTEM</h2>
//       </div>

//       <div className="job-tabs">
//         <button className="active">Finished Job Numbers</button>
//       </div>

//       <div className="search-bar">
//         <select
//           value={searchBy}
//           onChange={(e) => {
//             setSearchBy(e.target.value);
//             setSearchInput("");
//             setActiveSearch("");
//           }}
//         >
//           {Object.keys(searchKeyMap).map((label) => (
//             <option key={label} value={label}>
//               {label}
//             </option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder={`Search by ${searchBy}...`}
//           value={searchInput}
//           onChange={(e) => setSearchInput(e.target.value)}
//           onKeyDown={handleSearchKeyDown}
//         />

//         <button onClick={handleSearch}>Search</button>
//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       <div className="search-results-info">
//         <span>
//           Showing <strong>{filteredRows.length}</strong> of{" "}
//           <strong>{jobs.length}</strong> finished job numbers
//         </span>
//         {activeSearch && (
//           <span>
//             {" "}
//             — searching <strong>{searchBy}</strong>: "
//             <strong>{activeSearch}</strong>"
//             <button
//               className="clear-search-btn"
//               onClick={() => {
//                 setSearchInput("");
//                 setActiveSearch("");
//               }}
//             >
//               ✕ Clear
//             </button>
//           </span>
//         )}
//       </div>

//       <div className="table-wrapper">
//         <table className="job-table">
//           <thead>
//             <tr>
//               <th>Job Number</th>
//               <th>Company Name</th>
//               <th>Brand</th>
//               <th>Model</th>
//               <th>Serial No.</th>
//               <th>Frequency</th>
//               <th>Cert Delivered</th>
//               <th>Due Date</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="9" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredRows.length > 0 ? (
//               filteredRows.map((job, index) => (
//                 <tr
//                   key={job._id || index}
//                   className="clickable-row"
//                   onClick={() => handleRowClick(job)}
//                 >
//                   <td>{job.jobNumber}</td>
//                   <td>{job.companyName}</td>
//                   <td>{job.brand}</td>
//                   <td>{job.model}</td>
//                   <td>{job.serialNo}</td>
//                   <td>{job.frequency}</td>
//                   <td>{job.doCertDate}</td>
//                   <td>{formatDate(job.dueDate) || "—"}</td>
//                   <td>{job.recallStatus}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="9" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : "No finished job numbers found"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showDetailsModal &&
//         selectedJob &&
//         createPortal(
//           <div
//             className="jr-modal-overlay"
//             onClick={() => {
//               setShowDetailsModal(false);
//               setSelectedJob(null);
//             }}
//           >
//             <div
//               className="jn-modal-wrapper"
//               onClick={(e) => e.stopPropagation()}
//               style={{ maxWidth: "500px" }}
//             >
//               <div className="jr-modal-header">
//                 <div className="jr-modal-header-left">
//                   <div className="jr-cdms-logo">CDMS</div>
//                   <div className="jr-modal-title">
//                     <span className="jr-modal-title-sub">
//                       RECALL SYSTEM — JOB NUMBER DETAILS
//                     </span>
//                     <span className="jr-modal-title-main">
//                       {selectedJob.jobNumber}
//                     </span>
//                   </div>
//                 </div>
//                 <button
//                   className="jr-modal-close"
//                   onClick={() => {
//                     setShowDetailsModal(false);
//                     setSelectedJob(null);
//                   }}
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="jn-modal-scroll" style={{ padding: "16px" }}>
//                 <div className="jr-field-row">
//                   <label>Company Name</label>
//                   <input type="text" value={selectedJob.companyName} disabled />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Description</label>
//                   <input type="text" value={selectedJob.description} disabled />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Brand</label>
//                   <input type="text" value={selectedJob.brand} disabled />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Model</label>
//                   <input type="text" value={selectedJob.model} disabled />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Serial No.</label>
//                   <input type="text" value={selectedJob.serialNo} disabled />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Remarks</label>
//                   <input type="text" value={selectedJob.remarks} disabled />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Concern</label>
//                   <input type="text" value={selectedJob.concern} disabled />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Frequency</label>
//                   <input type="text" value={selectedJob.frequency} disabled />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Certificate Delivered</label>
//                   <input type="text" value={selectedJob.doCertDate} disabled />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Due Date</label>
//                   <input
//                     type="text"
//                     value={formatDate(selectedJob.dueDate) || "—"}
//                     disabled
//                   />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Status</label>
//                   <input
//                     type="text"
//                     value={selectedJob.recallStatus}
//                     disabled
//                   />
//                 </div>
//               </div>

//               <div className="jn-modal-actions">
//                 <div className="jr-modal-actions-right">
//                   <button
//                     className="jr-action-btn"
//                     onClick={() => {
//                       setShowDetailsModal(false);
//                       setSelectedJob(null);
//                     }}
//                   >
//                     Close
//                   </button>
//                   <button
//                     className="jr-save-btn"
//                     onClick={() => handleReuse(selectedJob)}
//                     disabled={
//                       !selectedJob.reuseEnabled ||
//                       resettingId === selectedJob._id
//                     }
//                     title={
//                       selectedJob.reuseEnabled
//                         ? "Reset and reuse this job number"
//                         : `Enabled ${REUSE_LEAD_DAYS} days before the due date`
//                     }
//                   >
//                     {resettingId === selectedJob._id
//                       ? "Reusing..."
//                       : "Reuse Job Number"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>,
//           document.body,
//         )}
//     </div>
//   );
// };

// export default RecallSys;
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import "./jobnumber.css";

const API = import.meta.env.VITE_API_URL;

const searchKeyMap = {
  "Company Name": "companyName",
  "Job Number": "jobNumber",
  Brand: "brand",
  Model: "model",
  "Serial No.": "serialNo",
};

// Same status logic as JobNumber.jsx — a job only qualifies for recall once
// both the unit and certificate have actually been delivered back out.
const isJobFinished = (job) =>
  Boolean(job.unitDelivered && job.certificateDelivered);

// Calibration frequency -> months, for computing the next due date.
const FREQUENCY_MONTHS = {
  "6 Months": 6,
  "1 Year": 12,
  "2 Years": 24,
  "3 Years": 36,
};

// Due date = certificate delivery date + frequency. Returns null if either
// piece is missing (e.g. delivery receipt join found nothing, or frequency
// wasn't set), in which case we can't say whether it's due yet.
const getDueDate = (job) => {
  const months = FREQUENCY_MONTHS[job.frequency];
  if (!job.doCertDate || !months) return null;
  const due = new Date(job.doCertDate);
  due.setMonth(due.getMonth() + months);
  return due;
};

const formatDate = (date) => (date ? date.toISOString().split("T")[0] : "");

// How long before the due date the Reuse button becomes enabled. Using
// months (not a fixed day count) so the window is always "1 calendar month
// before", correctly accounting for months of different lengths.
const REUSE_LEAD_MONTHS = 1;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Days remaining until due (negative = overdue). Null if we don't have
// enough info (missing cert date or unrecognized frequency) to say.
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
  if (daysUntilDue === null) return "Unknown";
  if (daysUntilDue < 0) return "Overdue";
  if (reuseEligible) return "Due Soon";
  return "Not Yet Due";
};

// Find the delivery receipt of a given type (instrument/certificate) that
// belongs to a job's CURRENT cycle. A job number can be reused (see
// handleReuse below), so multiple delivery receipts may share the same
// jobNumber across different cycles. `job.reusedAt` (set at the moment of
// reuse) is the cutoff: any candidate receipt dated before it belongs to a
// previous, already-closed-out cycle and must be ignored. Among whatever
// remains, take the most recent one.
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

const RecallSys = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resettingId, setResettingId] = useState(null);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Same three-way join as JobNumber.jsx: company/date info lives on the
      // receipt, and DO Unit/Cert dates live only inside delivery receipts.
      const [jobsRes, receiptsRes, deliveryRes] = await Promise.all([
        fetch(`${API}/api/jobnumbers`),
        fetch(`${API}/api/jobreceipts`),
        fetch(`${API}/api/deliveryreceipts`),
      ]);

      const jobsData = await jobsRes.json();
      const receiptsData = await receiptsRes.json();
      const deliveryData = await deliveryRes.json();

      const receiptsMap = {};
      if (Array.isArray(receiptsData)) {
        receiptsData.forEach((r) => {
          receiptsMap[r.jrId] = r;
        });
      }

      const deliveryReceipts = Array.isArray(deliveryData) ? deliveryData : [];

      const merged = Array.isArray(jobsData)
        ? jobsData.filter(isJobFinished).map((job) => {
            const receipt = receiptsMap[job.jobReceiptID] || {};

            const unitDR = findCurrentDeliveryReceipt(
              deliveryReceipts,
              job,
              "instrument",
            );
            const certDR = findCurrentDeliveryReceipt(
              deliveryReceipts,
              job,
              "certificate",
            );

            return {
              ...job,
              companyName: job.companyName || receipt.companyName || "",
              doUnitDate: unitDR?.date || "",
              doCertDate: certDR?.date || "",
            };
          })
        : [];

      setJobs(merged);
    } catch (err) {
      console.error("Failed to fetch recall list:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    return jobs.map((job) => {
      const dueDate = getDueDate(job);
      const daysUntilDue = getDaysUntilDue(dueDate);
      const reuseEnabled = isReuseEligible(dueDate);
      const recallStatus = getRecallStatus(daysUntilDue, reuseEnabled);
      return { ...job, dueDate, daysUntilDue, recallStatus, reuseEnabled };
    });
  }, [jobs]);

  const filteredRows = useMemo(() => {
    if (!activeSearch.trim()) return rows;
    const key = searchKeyMap[searchBy];
    return rows.filter((r) =>
      r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
    );
  }, [rows, searchBy, activeSearch]);

  const handleSearch = () => setActiveSearch(searchInput);
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("Company Name");
    fetchJobs();
  };

  const handleRowClick = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  // REUSE — resets this job's pipeline progress back to the start so it can
  // go through Instrument Tag / Incoming Calibration / etc. again, keeping
  // the same jobNumber, jobReceiptID, and equipment details (brand, model,
  // serialNo, description) rather than reserving a brand-new job number.
  //
  // `reusedAt` is stamped here as the cutoff between this job's old,
  // closed-out cycle and its new one. JobNumber.jsx, RecallSys.jsx, and
  // RecallJobModal.jsx all use it (via findCurrentDeliveryReceipt) to make
  // sure a delivery receipt from the PREVIOUS cycle is never mistaken for
  // the current one, since both share the same jobNumber.
  const handleReuse = async (job) => {
    const confirmed = window.confirm(
      `Reuse Job Number ${job.jobNumber}? This resets its status so it re-enters the pipeline. This cannot be undone.`,
    );
    if (!confirmed) return;

    setResettingId(job._id);
    try {
      const nowIso = new Date().toISOString();
      const res = await fetch(`${API}/api/jobnumbers/${job._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRec: nowIso.split("T")[0],
          reusedAt: nowIso,
          unitDelivered: false,
          certificateDelivered: false,
          tagged: false,
          concernTagged: false,
          ongoingTagged: false,
          forTypingTagged: false,
          forCheckingOICTagged: false,
          forCheckingSigTagged: false,
          forPrintFinalTagged: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Drop it from this list immediately — it's no longer "finished".
        setJobs((prev) => prev.filter((j) => j._id !== job._id));
        setShowDetailsModal(false);
        setSelectedJob(null);
      } else {
        console.error("Failed to reuse job number:", data.message);
      }
    } catch (err) {
      console.error("Failed to reuse job number:", err);
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div className="job-container">
      <div className="job-header">
        <h2>RECALL SYSTEM</h2>
      </div>

      <div className="job-tabs">
        <button className="active">Finished Job Numbers</button>
      </div>

      <div className="search-bar">
        <select
          value={searchBy}
          onChange={(e) => {
            setSearchBy(e.target.value);
            setSearchInput("");
            setActiveSearch("");
          }}
        >
          {Object.keys(searchKeyMap).map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={`Search by ${searchBy}...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />

        <button onClick={handleSearch}>Search</button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="search-results-info">
        <span>
          Showing <strong>{filteredRows.length}</strong> of{" "}
          <strong>{jobs.length}</strong> finished job numbers
        </span>
        {activeSearch && (
          <span>
            {" "}
            — searching <strong>{searchBy}</strong>: "
            <strong>{activeSearch}</strong>"
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchInput("");
                setActiveSearch("");
              }}
            >
              ✕ Clear
            </button>
          </span>
        )}
      </div>

      <div className="table-wrapper">
        <table className="job-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Company Name</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial No.</th>
              <th>Frequency</th>
              <th>Cert Delivered</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((job, index) => (
                <tr
                  key={job._id || index}
                  className="clickable-row"
                  onClick={() => handleRowClick(job)}
                >
                  <td>{job.jobNumber}</td>
                  <td>{job.companyName}</td>
                  <td>{job.brand}</td>
                  <td>{job.model}</td>
                  <td>{job.serialNo}</td>
                  <td>{job.frequency}</td>
                  <td>{job.doCertDate}</td>
                  <td>{formatDate(job.dueDate) || "—"}</td>
                  <td>{job.recallStatus}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : "No finished job numbers found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDetailsModal &&
        selectedJob &&
        createPortal(
          <div
            className="jr-modal-overlay"
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedJob(null);
            }}
          >
            <div
              className="jn-modal-wrapper"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "500px" }}
            >
              <div className="jr-modal-header">
                <div className="jr-modal-header-left">
                  <div className="jr-cdms-logo">CDMS</div>
                  <div className="jr-modal-title">
                    <span className="jr-modal-title-sub">
                      RECALL SYSTEM — JOB NUMBER DETAILS
                    </span>
                    <span className="jr-modal-title-main">
                      {selectedJob.jobNumber}
                    </span>
                  </div>
                </div>
                <button
                  className="jr-modal-close"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedJob(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="jn-modal-scroll" style={{ padding: "16px" }}>
                <div className="jr-field-row">
                  <label>Company Name</label>
                  <input type="text" value={selectedJob.companyName} disabled />
                </div>
                <div className="jr-field-row">
                  <label>Description</label>
                  <input type="text" value={selectedJob.description} disabled />
                </div>
                <div className="jr-field-row">
                  <label>Brand</label>
                  <input type="text" value={selectedJob.brand} disabled />
                </div>
                <div className="jr-field-row">
                  <label>Model</label>
                  <input type="text" value={selectedJob.model} disabled />
                </div>
                <div className="jr-field-row">
                  <label>Serial No.</label>
                  <input type="text" value={selectedJob.serialNo} disabled />
                </div>
                <div className="jr-field-row">
                  <label>Remarks</label>
                  <input type="text" value={selectedJob.remarks} disabled />
                </div>
                <div className="jr-field-row">
                  <label>Concern</label>
                  <input type="text" value={selectedJob.concern} disabled />
                </div>
                <div className="jr-field-row">
                  <label>Frequency</label>
                  <input type="text" value={selectedJob.frequency} disabled />
                </div>
                <div className="jr-field-row">
                  <label>Certificate Delivered</label>
                  <input type="text" value={selectedJob.doCertDate} disabled />
                </div>
                <div className="jr-field-row">
                  <label>Due Date</label>
                  <input
                    type="text"
                    value={formatDate(selectedJob.dueDate) || "—"}
                    disabled
                  />
                </div>
                <div className="jr-field-row">
                  <label>Status</label>
                  <input
                    type="text"
                    value={selectedJob.recallStatus}
                    disabled
                  />
                </div>
              </div>

              <div className="jn-modal-actions">
                <div className="jr-modal-actions-right">
                  <button
                    className="jr-action-btn"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedJob(null);
                    }}
                  >
                    Close
                  </button>
                  <button
                    className="jr-save-btn"
                    onClick={() => handleReuse(selectedJob)}
                    disabled={
                      !selectedJob.reuseEnabled ||
                      resettingId === selectedJob._id
                    }
                    title={
                      selectedJob.reuseEnabled
                        ? "Reset and reuse this job number"
                        : `Enabled ${REUSE_LEAD_MONTHS} month before the due date`
                    }
                  >
                    {resettingId === selectedJob._id
                      ? "Reusing..."
                      : "Reuse Job Number"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default RecallSys;
