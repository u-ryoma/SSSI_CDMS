// import React, { useState, useEffect, useMemo } from "react";
// import "../OngoingCalibration/Ongoinglistcalib.css";
// import ForCheckingSigDetailsModal from "./ForCheckingSigDetailsModal";

// const API = import.meta.env.VITE_API_URL;

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "Contact Name": "contactName",
//   "JR ID": "jobReceiptID",
// };

// const ForCheckingSig = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");

//   // ---- Modal state ----
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   // Local "reviewed" gate — true once Check and Sign Report has been
//   // clicked for the currently open record. Controls whether the
//   // Update button is enabled. Not persisted to the backend; resets
//   // whenever a (new) modal is opened or closed.
//   const [isSigned, setIsSigned] = useState(false);

//   useEffect(() => {
//     fetchRecords();
//   }, []);

//   const fetchRecords = async () => {
//     setLoading(true);
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

//       const merged = Array.isArray(jobs)
//         ? jobs
//             // Only jobs checked and signed by the SIG, and not yet
//             // moved on to Print Final.
//             .filter(
//               (job) =>
//                 job.forCheckingSigTagged === true && !job.forPrintFinalTagged,
//             )
//             .map((job) => {
//               const receipt = receiptsMap[job.jobReceiptID] || {};
//               return {
//                 // ---- fields already used by the table ----
//                 jobNumber: job.jobNumber,
//                 jobReceiptID: job.jobReceiptID,
//                 description: job.description || "",
//                 brand: job.brand || "",
//                 model: job.model || "",
//                 serialNo: job.serialNo || "",
//                 remarks: job.remarks || "",
//                 concern: job.concern || "",
//                 eta: job.eta || "",
//                 evalBy: job.evalBy || "",
//                 priority: job.priority || "Normal",
//                 dateRec: receipt.date || "",
//                 companyName: receipt.companyName || "",
//                 contactName: receipt.contactName || "",

//                 // ---- extra fields needed by ForCheckingSigDetailsModal ----
//                 sig: job.sig || "",
//                 typedBy: job.typedBy || "",
//                 frequency: job.frequency || "",
//                 contactCert: job.contactCert || "",
//                 uncertainty: job.uncertainty || "",
//                 range: job.range || "",
//                 dateCal: job.dateCal || "",
//                 dateDue: job.dateDue || "",
//                 accreditationLogo: job.accreditationLogo || "",
//                 calibrationProcedure: job.calibrationProcedure || "",
//                 calibrationStandards: job.calibrationStandards || [],

//                 // keep the raw job/receipt around in case the modal
//                 // or its handlers need something not mapped above
//                 _rawJob: job,
//                 _rawReceipt: receipt,
//               };
//             })
//         : [];

//       setRecords(merged);
//     } catch (err) {
//       console.error("Failed to fetch for-checking-SIG calibration:", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRecords = useMemo(() => {
//     if (!activeSearch.trim()) return records;
//     const key = searchKeyMap[searchBy];
//     return records.filter((r) =>
//       r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
//     );
//   }, [records, activeSearch, searchBy]);

//   const handleSearch = () => setActiveSearch(searchInput);
//   const handleSearchKeyDown = (e) => {
//     if (e.key === "Enter") handleSearch();
//   };
//   const handleRefresh = () => {
//     setSearchInput("");
//     setActiveSearch("");
//     setSearchBy("Company Name");
//     fetchRecords();
//   };

//   // ---- Row click -> open modal with that job's data ----
//   const handleRowClick = (record) => {
//     setSelectedJob(record);
//     setIsSigned(false); // fresh record -> Update starts disabled again
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedJob(null);
//     setIsSigned(false);
//   };

//   // "Check and Sign Report" no longer touches the backend or moves the
//   // job. It's just a local confirmation gate that unlocks the Update
//   // button for this record.
//   const handleCheckAndSignReport = () => {
//     setIsSigned(true);
//   };

//   // "Update" is what actually persists the move: stamp the SIG review
//   // dates, tag the job as ready for Print Final, then drop it out of
//   // this table and close.
//   // "Update" is what actually persists the move: stamp the SIG review
//   // dates and who performed the check, tag the job as ready for Print
//   // Final, then drop it out of this table and close.
//   const handleUpdate = async () => {
//     if (!selectedJob) return;
//     try {
//       const now = new Date().toISOString();
//       const sigCheckedBy = sessionStorage.getItem("name") || "";
//       const res = await fetch(`${API}/api/jobnumbers/update-details`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           jobNumber: selectedJob.jobNumber,
//           forPrintFinalTagged: true,
//           draftCheckedSIGAt: now,
//           certCheckedSIGAt: now,
//           sigCheckedBy,
//         }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setRecords((prev) =>
//           prev.filter((r) => r.jobNumber !== selectedJob.jobNumber),
//         );
//         handleCloseModal();
//       }
//     } catch (err) {
//       console.error("Update (move to Print Final) failed:", err);
//     }
//   };

//   return (
//     <div className="calibration-container">
//       <div className="calibration-header">
//         <h2>REPORT FOR CHECKING SIG</h2>
//       </div>

//       <div className="calibration-tabs">
//         <button className="active">List of Jobs</button>
//       </div>

//       <div className="calibration-search">
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

//         <button>Re-Log</button>
//         <button>Quick Log</button>
//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       <div className="search-results-info">
//         <span>
//           Showing <strong>{filteredRecords.length}</strong> of{" "}
//           <strong>{records.length}</strong> records
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

//       <div className="calibration-table-wrapper">
//         <table className="calibration-table">
//           <thead>
//             <tr>
//               <th>Job Number</th>
//               <th>Date Rec</th>
//               <th>Priority</th>
//               <th>OIC</th>
//               <th>SIG</th>
//               <th>Typist</th>
//               <th>Company</th>
//               <th>Description</th>
//               <th>Brand</th>
//               <th>Model</th>
//               <th>Serial No</th>
//               <th>ETA</th>
//               <th>Remarks</th>
//               <th>Concern</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="14" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredRecords.length > 0 ? (
//               filteredRecords.map((r, idx) => (
//                 <tr
//                   key={idx}
//                   onClick={() => handleRowClick(r)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <td>{r.jobNumber}</td>
//                   <td>{r.dateRec}</td>
//                   <td>{r.priority}</td>
//                   <td>{r.evalBy || r.contactName}</td>
//                   <td>{r.sig}</td>
//                   <td>{r.typedBy}</td>
//                   <td>{r.companyName}</td>
//                   <td>{r.description}</td>
//                   <td>{r.brand}</td>
//                   <td>{r.model}</td>
//                   <td>{r.serialNo}</td>
//                   <td>{r.eta}</td>
//                   <td>{r.remarks}</td>
//                   <td>{r.concern}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="14" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : "No jobs awaiting SIG check"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showModal && selectedJob && (
//         <ForCheckingSigDetailsModal
//           jobForm={selectedJob}
//           onClose={handleCloseModal}
//           onOpenCamera={() => {
//             console.log("Open camera for", selectedJob.jobNumber);
//           }}
//           onOpenFolder={() => {
//             console.log("Open folder for", selectedJob.jobNumber);
//           }}
//           onCheckAndSignReport={handleCheckAndSignReport}
//           onUpdate={handleUpdate}
//           onLogForRetyping={() => {
//             console.log("Log for re-typing", selectedJob.jobNumber);
//           }}
//           onOpenCalStandardLookup={(rowIndex, columnKey) => {
//             console.log("Cal standard lookup", rowIndex, columnKey);
//           }}
//           onOpenCalProcedureLookup={() => {
//             console.log("Cal procedure lookup for", selectedJob.jobNumber);
//           }}
//           isUpdateEnabled={isSigned}
//         />
//       )}
//     </div>
//   );
// };

// export default ForCheckingSig;
import React, { useState, useEffect, useMemo } from "react";
import "../OngoingCalibration/Ongoinglistcalib.css";
import ForCheckingSigDetailsModal from "./ForCheckingSigDetailsModal";

const API = import.meta.env.VITE_API_URL;

const searchKeyMap = {
  "Company Name": "companyName",
  "Contact Name": "contactName",
  "JR ID": "jobReceiptID",
};

const ForCheckingSig = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // ---- Modal state ----
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Local "reviewed" gate — true once Check and Sign Report has been
  // clicked for the currently open record. Controls whether the
  // Update button is enabled. Not persisted to the backend; resets
  // whenever a (new) modal is opened or closed.
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
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

      const merged = Array.isArray(jobs)
        ? jobs
            // Only jobs checked and signed by the SIG, and not yet
            // moved on to Print Final.
            .filter(
              (job) =>
                job.forCheckingSigTagged === true && !job.forPrintFinalTagged,
            )
            .map((job) => {
              const receipt = receiptsMap[job.jobReceiptID] || {};
              return {
                // ---- fields already used by the table ----
                jobNumber: job.jobNumber,
                jobReceiptID: job.jobReceiptID,
                description: job.description || "",
                brand: job.brand || "",
                model: job.model || "",
                serialNo: job.serialNo || "",
                remarks: job.remarks || "",
                concern: job.concern || "",
                eta: job.eta || "",
                // "Eval By" (CPGP/SSSI) — set in JobNumberModal, unrelated
                // to who's processing the job. Kept for completeness but
                // NOT used for the OIC column below.
                evalBy: job.evalBy || "",
                // OIC — the originally assigned OIC from Incoming/On-Going
                // Calibration.
                oicBy: job.oicBy || "",
                // Audit stamp of who actually performed the OIC check
                // (separate from oicBy, the originally assigned OIC).
                oicCheckedBy: job.oicCheckedBy || "",
                priority: job.priority || "Normal",
                dateRec: receipt.date || "",
                companyName: receipt.companyName || "",
                contactName: receipt.contactName || "",

                // ---- extra fields needed by ForCheckingSigDetailsModal ----
                sig: job.sig || "",
                typedBy: job.typedBy || "",
                frequency: job.frequency || "",
                contactCert: job.contactCert || "",
                uncertainty: job.uncertainty || "",
                range: job.range || "",
                dateCal: job.dateCal || "",
                dateDue: job.dateDue || "",
                accreditationLogo: job.accreditationLogo || "",
                calibrationProcedure: job.calibrationProcedure || "",
                calibrationStandards: job.calibrationStandards || [],

                // keep the raw job/receipt around in case the modal
                // or its handlers need something not mapped above
                _rawJob: job,
                _rawReceipt: receipt,
              };
            })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch for-checking-SIG calibration:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!activeSearch.trim()) return records;
    const key = searchKeyMap[searchBy];
    return records.filter((r) =>
      r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
    );
  }, [records, activeSearch, searchBy]);

  const handleSearch = () => setActiveSearch(searchInput);
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("Company Name");
    fetchRecords();
  };

  // ---- Row click -> open modal with that job's data ----
  const handleRowClick = (record) => {
    setSelectedJob(record);
    setIsSigned(false); // fresh record -> Update starts disabled again
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setIsSigned(false);
  };

  // "Check and Sign Report" no longer touches the backend or moves the
  // job. It's just a local confirmation gate that unlocks the Update
  // button for this record.
  const handleCheckAndSignReport = () => {
    setIsSigned(true);
  };

  // "Update" is what actually persists the move: stamp the SIG review
  // dates and who performed the check, tag the job as ready for Print
  // Final, then drop it out of this table and close.
  const handleUpdate = async () => {
    if (!selectedJob) return;
    try {
      const now = new Date().toISOString();
      const sigCheckedBy = sessionStorage.getItem("name") || "";
      const res = await fetch(`${API}/api/jobnumbers/update-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNumber: selectedJob.jobNumber,
          forPrintFinalTagged: true,
          draftCheckedSIGAt: now,
          certCheckedSIGAt: now,
          sigCheckedBy,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) =>
          prev.filter((r) => r.jobNumber !== selectedJob.jobNumber),
        );
        handleCloseModal();
      }
    } catch (err) {
      console.error("Update (move to Print Final) failed:", err);
    }
  };

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>REPORT FOR CHECKING SIG</h2>
      </div>

      <div className="calibration-tabs">
        <button className="active">List of Jobs</button>
      </div>

      <div className="calibration-search">
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

        <button>Re-Log</button>
        <button>Quick Log</button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="search-results-info">
        <span>
          Showing <strong>{filteredRecords.length}</strong> of{" "}
          <strong>{records.length}</strong> records
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

      <div className="calibration-table-wrapper">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Date Rec</th>
              <th>Priority</th>
              <th>OIC</th>
              {/* <th>OIC Checked By</th> */}
              <th>SIG</th>
              <th>Typist</th>
              <th>Company</th>
              <th>Description</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial No</th>
              <th>ETA</th>
              <th>Remarks</th>
              <th>Concern</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="15" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((r, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(r)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{r.jobNumber}</td>
                  <td>{r.dateRec}</td>
                  <td>{r.priority}</td>
                  <td>{r.oicBy || r.contactName}</td>
                  {/* <td>{r.oicCheckedBy}</td> */}
                  <td>{r.sig}</td>
                  <td>{r.typedBy}</td>
                  <td>{r.companyName}</td>
                  <td>{r.description}</td>
                  <td>{r.brand}</td>
                  <td>{r.model}</td>
                  <td>{r.serialNo}</td>
                  <td>{r.eta}</td>
                  <td>{r.remarks}</td>
                  <td>{r.concern}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : "No jobs awaiting SIG check"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedJob && (
        <ForCheckingSigDetailsModal
          jobForm={selectedJob}
          onClose={handleCloseModal}
          onOpenCamera={() => {
            console.log("Open camera for", selectedJob.jobNumber);
          }}
          onOpenFolder={() => {
            console.log("Open folder for", selectedJob.jobNumber);
          }}
          onCheckAndSignReport={handleCheckAndSignReport}
          onUpdate={handleUpdate}
          onLogForRetyping={() => {
            console.log("Log for re-typing", selectedJob.jobNumber);
          }}
          onOpenCalStandardLookup={(rowIndex, columnKey) => {
            console.log("Cal standard lookup", rowIndex, columnKey);
          }}
          onOpenCalProcedureLookup={() => {
            console.log("Cal procedure lookup for", selectedJob.jobNumber);
          }}
          isUpdateEnabled={isSigned}
        />
      )}
    </div>
  );
};

export default ForCheckingSig;
