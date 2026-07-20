// import React, { useState, useEffect, useMemo } from "react";
// import "../jobnumber.css";
// import JobNumberDetailsModal from "./JobNumberDetailsModal";

// const API = import.meta.env.VITE_API_URL;

// const currentYear = new Date().getFullYear();
// const yearOptions = Array.from({ length: 5 }, (_, i) =>
//   (currentYear - i).toString(),
// );

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "Job Number": "jobNumber",
//   Brand: "brand",
//   Model: "model",
//   "Serial No.": "serialNo",
// };

// // Determine job status label based on the most advanced flag set to true
// const getJobStatus = (job) => {
//   if (job.unitDelivered && job.certificateDelivered)
//     return "Job Number Finished";
//   if (job.forPrintFinalTagged) return "Print Final Certificate";
//   if (job.forCheckingSigTagged) return "For Checking SIG";
//   if (job.forCheckingOICTagged) return "For Checking OIC";
//   if (job.forTypingTagged) return "For Typing";
//   if (job.ongoingTagged) return "On-Going Calibration";
//   if (job.tagged && job.concernTagged) return "Incoming Concern";
//   if (job.tagged) return "Incoming Calibration";
//   return "Waiting for Update";
// };

// // Determine MOR (mode of receipt) based on the dedicated onSite flag set in
// // JobNumberModal — NOT `tagged`, which only tracks pipeline-stage progress
// // (whether the job has passed Instrument Tag) and can be true for either
// // in-house or on-site jobs.
// const getMOR = (job) => {
//   if (job.onSite === true) return "On-Site";
//   if (job.onSite === false) return "In-house";
//   return "Waiting for Update"; // onSite not yet set (legacy job)
// };

// const JobNumber = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // SEARCH & FILTER STATE
//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");
//   const [rowsPerPage, setRowsPerPage] = useState(25);

//   // DETAILS MODAL STATE
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);

//   // FETCH JOBS FROM DATABASE
//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const fetchJobs = async () => {
//     setLoading(true);
//     try {
//       // Fetch job numbers, job receipts, and delivery receipts in
//       // parallel. Several fields (companyName, dateRec, customerID,
//       // companyAddress, contactInfo, contactRec) live on the receipt,
//       // not the job number, until later pipeline stages copy them
//       // over. DO Unit/Cert No/Date/By and Eval Out live only inside
//       // delivery receipt documents (top-level for DR info, per-item
//       // for Eval Out), so all of these are joined here for display.
//       const [jobsRes, receiptsRes, deliveryRes] = await Promise.all([
//         fetch(`${API}/api/jobnumbers`),
//         fetch(`${API}/api/jobreceipts`),
//         fetch(`${API}/api/deliveryreceipts`),
//       ]);

//       if (!jobsRes.ok) throw new Error("Failed to fetch job numbers");
//       if (!receiptsRes.ok) throw new Error("Failed to fetch job receipts");
//       if (!deliveryRes.ok) throw new Error("Failed to fetch delivery receipts");

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
//         ? jobsData.map((job) => {
//             const receipt = receiptsMap[job.jobReceiptID] || {};

//             // Find the delivery receipt (if any) that released this
//             // job's unit, and the one that released its certificate.
//             const unitDR = deliveryReceipts.find(
//               (r) =>
//                 r.type === "instrument" &&
//                 r.items?.some((i) => i.jobNumber === job.jobNumber),
//             );
//             const certDR = deliveryReceipts.find(
//               (r) =>
//                 r.type === "certificate" &&
//                 r.items?.some((i) => i.jobNumber === job.jobNumber),
//             );
//             const unitItem = unitDR?.items?.find(
//               (i) => i.jobNumber === job.jobNumber,
//             );

//             return {
//               ...job,
//               // Prefer values already saved directly on the job doc (true
//               // for jobs that reached On-Going Calibration or later),
//               // otherwise fall back to a live join from the parent receipt.
//               companyName: job.companyName || receipt.companyName || "",
//               dateRec: job.dateRec || receipt.date || "",
//               customerID: job.customerID || receipt.customerID || "",
//               companyAddress:
//                 job.companyAddress || receipt.companyAddress || "",
//               contactInfo: job.contactInfo || receipt.contactInfo || "",
//               contactRec: job.contactRec || receipt.contactName || "",

//               // Joined from delivery receipts — never stored on the job
//               // document itself.
//               evalOut: unitItem?.evaluatedBy || "",
//               doUnitNo: unitDR?.deliveryReceiptId || "",
//               doUnitDate: unitDR?.date || "",
//               doUnitBy: unitDR?.preparedBy || "",
//               doCertNo: certDR?.deliveryReceiptId || "",
//               doCertDate: certDR?.date || "",
//               doCertBy: certDR?.preparedBy || "",
//             };
//           })
//         : [];

//       setJobs(merged);
//     } catch (err) {
//       console.error("Failed to fetch job numbers:", err);
//       setJobs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // FILTERED JOBS
//   const filteredJobs = useMemo(() => {
//     let result = [...jobs];

//     if (activeSearch.trim()) {
//       const key = searchKeyMap[searchBy];
//       result = result.filter((job) =>
//         job[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
//       );
//     }

//     return result.slice(0, rowsPerPage);
//   }, [jobs, searchBy, activeSearch, rowsPerPage]);

//   const handleSearch = () => setActiveSearch(searchInput);

//   const handleSearchKeyDown = (e) => {
//     if (e.key === "Enter") handleSearch();
//   };

//   const handleRefresh = () => {
//     setSearchInput("");
//     setActiveSearch("");
//     setSearchBy("Company Name");
//     setRowsPerPage(25);
//     fetchJobs();
//   };

//   const handleRowClick = (job) => {
//     setSelectedJob(job);
//     setShowDetailsModal(true);
//   };

//   const handleUpdateJob = async (updatedFields) => {
//     try {
//       const res = await fetch(`${API}/api/jobnumbers/update-details`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedFields),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setShowDetailsModal(false);
//         setSelectedJob(null);
//         fetchJobs(); // refresh the list to reflect saved changes
//       }
//     } catch (err) {
//       console.error("Failed to update job number:", err);
//     }
//   };

//   return (
//     <div className="job-container">
//       {/* HEADER */}
//       <div className="job-header">
//         <h2>LIST OF JOB NUMBERS</h2>
//       </div>

//       {/* TABS */}
//       <div className="job-tabs">
//         <button className="active">List of Jobs</button>
//       </div>

//       {/* SEARCH BAR */}
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

//         <select
//           value={rowsPerPage}
//           onChange={(e) => setRowsPerPage(Number(e.target.value))}
//         >
//           <option value={25}>25</option>
//           <option value={50}>50</option>
//           <option value={100}>100</option>
//         </select>

//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       {/* RESULTS INFO */}
//       <div className="search-results-info">
//         <span>
//           Showing <strong>{filteredJobs.length}</strong> of{" "}
//           <strong>{jobs.length}</strong> job numbers
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

//       {/* JOB LIST TABLE */}
//       <div className="table-wrapper">
//         <table className="job-table">
//           <thead>
//             <tr>
//               <th>Job Number</th>
//               <th>Date Rec</th>
//               <th>MOR</th>
//               <th>Company Name</th>
//               <th>Job Status</th>
//               <th>Description</th>
//               <th>Brand</th>
//               <th>Model</th>
//               <th>Serial No.</th>
//               <th>ETA</th>
//               <th>Remarks</th>
//               <th>Concern</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="12" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredJobs.length > 0 ? (
//               filteredJobs.map((job, index) => (
//                 <tr
//                   key={job._id || index}
//                   className="clickable-row"
//                   onClick={() => handleRowClick(job)}
//                 >
//                   <td>{job.jobNumber}</td>
//                   <td>{job.dateRec}</td>
//                   <td>{getMOR(job)}</td>
//                   <td>{job.companyName}</td>
//                   <td>{getJobStatus(job)}</td>
//                   <td>{job.description}</td>
//                   <td>{job.brand}</td>
//                   <td>{job.model}</td>
//                   <td>{job.serialNo}</td>
//                   <td>{job.eta}</td>
//                   <td>{job.remarks}</td>
//                   <td>{job.concern}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="12" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : "No Job Numbers Found"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* JOB NUMBER DETAILS MODAL */}
//       {showDetailsModal && selectedJob && (
//         <JobNumberDetailsModal
//           job={selectedJob}
//           onClose={() => {
//             setShowDetailsModal(false);
//             setSelectedJob(null);
//           }}
//           onUpdate={handleUpdateJob}
//         />
//       )}
//     </div>
//   );
// };

// export default JobNumber;
import React, { useState, useEffect, useMemo } from "react";
import "../jobnumber.css";
import JobNumberDetailsModal from "./JobNumberDetailsModal";

const API = import.meta.env.VITE_API_URL;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) =>
  (currentYear - i).toString(),
);

const searchKeyMap = {
  "Company Name": "companyName",
  "Job Number": "jobNumber",
  Brand: "brand",
  Model: "model",
  "Serial No.": "serialNo",
};

// Determine job status label based on the most advanced flag set to true
const getJobStatus = (job) => {
  if (job.unitDelivered && job.certificateDelivered)
    return "Job Number Finished";
  if (job.forPrintFinalTagged) return "Print Final Certificate";
  if (job.forCheckingSigTagged) return "For Checking SIG";
  if (job.forCheckingOICTagged) return "For Checking OIC";
  if (job.forTypingTagged) return "For Typing";
  if (job.ongoingTagged) return "On-Going Calibration";
  if (job.tagged && job.concernTagged) return "Incoming Concern";
  if (job.tagged) return "Incoming Calibration";
  return "Waiting for Update";
};

// Determine MOR (mode of receipt) based on the dedicated onSite flag set in
// JobNumberModal — NOT `tagged`, which only tracks pipeline-stage progress
// (whether the job has passed Instrument Tag) and can be true for either
// in-house or on-site jobs.
const getMOR = (job) => {
  if (job.onSite === true) return "On-Site";
  if (job.onSite === false) return "In-house";
  return "Waiting for Update"; // onSite not yet set (legacy job)
};

// Find the delivery receipt of a given type (instrument/certificate) that
// belongs to a job's CURRENT cycle. A job number can be reused (see
// RecallSys.jsx's handleReuse), so multiple delivery receipts may share the
// same jobNumber across different cycles. `job.reusedAt` (set at the moment
// of reuse) is the cutoff: any candidate receipt dated before it belongs to
// a previous, already-closed-out cycle and must be ignored. Among whatever
// remains, take the most recent one — this is the receipt for the job's
// current run, not necessarily the very first match found.
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

const JobNumber = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // SEARCH & FILTER STATE
  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // DETAILS MODAL STATE
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // FETCH JOBS FROM DATABASE
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Fetch job numbers, job receipts, and delivery receipts in
      // parallel. Several fields (companyName, dateRec, customerID,
      // companyAddress, contactInfo, contactRec) live on the receipt,
      // not the job number, until later pipeline stages copy them
      // over. DO Unit/Cert No/Date/By and Eval Out live only inside
      // delivery receipt documents (top-level for DR info, per-item
      // for Eval Out), so all of these are joined here for display.
      const [jobsRes, receiptsRes, deliveryRes] = await Promise.all([
        fetch(`${API}/api/jobnumbers`),
        fetch(`${API}/api/jobreceipts`),
        fetch(`${API}/api/deliveryreceipts`),
      ]);

      if (!jobsRes.ok) throw new Error("Failed to fetch job numbers");
      if (!receiptsRes.ok) throw new Error("Failed to fetch job receipts");
      if (!deliveryRes.ok) throw new Error("Failed to fetch delivery receipts");

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
        ? jobsData.map((job) => {
            const receipt = receiptsMap[job.jobReceiptID] || {};

            // Find the delivery receipt (if any) that released this
            // job's unit, and the one that released its certificate —
            // scoped to the job's current cycle (see
            // findCurrentDeliveryReceipt above), so a reused job number
            // doesn't pick up stale data from a previous cycle.
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
            const unitItem = unitDR?.items?.find(
              (i) => i.jobNumber === job.jobNumber,
            );

            return {
              ...job,
              // Prefer values already saved directly on the job doc (true
              // for jobs that reached On-Going Calibration or later),
              // otherwise fall back to a live join from the parent receipt.
              companyName: job.companyName || receipt.companyName || "",
              dateRec: job.dateRec || receipt.date || "",
              customerID: job.customerID || receipt.customerID || "",
              companyAddress:
                job.companyAddress || receipt.companyAddress || "",
              contactInfo: job.contactInfo || receipt.contactInfo || "",
              contactRec: job.contactRec || receipt.contactName || "",

              // Joined from delivery receipts — never stored on the job
              // document itself.
              evalOut: unitItem?.evaluatedBy || "",
              doUnitNo: unitDR?.deliveryReceiptId || "",
              doUnitDate: unitDR?.date || "",
              doUnitBy: unitDR?.preparedBy || "",
              doCertNo: certDR?.deliveryReceiptId || "",
              doCertDate: certDR?.date || "",
              doCertBy: certDR?.preparedBy || "",
            };
          })
        : [];

      setJobs(merged);
    } catch (err) {
      console.error("Failed to fetch job numbers:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // FILTERED JOBS
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (activeSearch.trim()) {
      const key = searchKeyMap[searchBy];
      result = result.filter((job) =>
        job[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
      );
    }

    return result.slice(0, rowsPerPage);
  }, [jobs, searchBy, activeSearch, rowsPerPage]);

  const handleSearch = () => setActiveSearch(searchInput);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("Company Name");
    setRowsPerPage(25);
    fetchJobs();
  };

  const handleRowClick = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  const handleUpdateJob = async (updatedFields) => {
    try {
      const res = await fetch(`${API}/api/jobnumbers/update-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (data.success) {
        setShowDetailsModal(false);
        setSelectedJob(null);
        fetchJobs(); // refresh the list to reflect saved changes
      }
    } catch (err) {
      console.error("Failed to update job number:", err);
    }
  };

  return (
    <div className="job-container">
      {/* HEADER */}
      <div className="job-header">
        <h2>LIST OF JOB NUMBERS</h2>
      </div>

      {/* TABS */}
      <div className="job-tabs">
        <button className="active">List of Jobs</button>
      </div>

      {/* SEARCH BAR */}
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

        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>

        <button onClick={handleRefresh}>Refresh</button>
      </div>

      {/* RESULTS INFO */}
      <div className="search-results-info">
        <span>
          Showing <strong>{filteredJobs.length}</strong> of{" "}
          <strong>{jobs.length}</strong> job numbers
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

      {/* JOB LIST TABLE */}
      <div className="table-wrapper">
        <table className="job-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Date Rec</th>
              <th>MOR</th>
              <th>Company Name</th>
              <th>Job Status</th>
              <th>Description</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial No.</th>
              <th>ETA</th>
              <th>Remarks</th>
              <th>Concern</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <tr
                  key={job._id || index}
                  className="clickable-row"
                  onClick={() => handleRowClick(job)}
                >
                  <td>{job.jobNumber}</td>
                  <td>{job.dateRec}</td>
                  <td>{getMOR(job)}</td>
                  <td>{job.companyName}</td>
                  <td>{getJobStatus(job)}</td>
                  <td>{job.description}</td>
                  <td>{job.brand}</td>
                  <td>{job.model}</td>
                  <td>{job.serialNo}</td>
                  <td>{job.eta}</td>
                  <td>{job.remarks}</td>
                  <td>{job.concern}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : "No Job Numbers Found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* JOB NUMBER DETAILS MODAL */}
      {showDetailsModal && selectedJob && (
        <JobNumberDetailsModal
          job={selectedJob}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedJob(null);
          }}
          onUpdate={handleUpdateJob}
        />
      )}
    </div>
  );
};

export default JobNumber;
