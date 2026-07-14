// import React, { useState, useEffect, useMemo } from "react";
// import "../OnGoingCalibration/Ongoinglistcalib.css";
// import ForPrintFinalDetailsModal from "./ForPrintFinalDetailsModal";

// const API = import.meta.env.VITE_API_URL;

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "Contact Name": "contactName",
//   "JR ID": "jobReceiptID",
// };

// const PrintFinal = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");

//   // ---- Modal state ----
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   // Local "printed" gate — true once Print Final Certificate has been
//   // clicked for the currently open record. Controls whether the
//   // Update button is enabled. Not persisted to the backend; resets
//   // whenever a (new) modal is opened or closed.
//   const [isPrinted, setIsPrinted] = useState(false);

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
//             // Only jobs updated from Checking SIG, ready for final
//             // certificate printing, and not yet moved past this stage.
//             .filter(
//               (job) =>
//                 job.forPrintFinalTagged === true && !job.forDeliveryTagged,
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

//                 // ---- extra fields needed by ForPrintFinalDetailsModal ----
//                 sig: job.sig || "",
//                 frequency: job.frequency || "",
//                 contactCert: job.contactCert || "",
//                 uncertainty: job.uncertainty || "",
//                 range: job.range || "",
//                 dateCal: job.dateCal || "",
//                 dateDue: job.dateDue || "",

//                 // keep the raw job/receipt around in case the modal
//                 // or its handlers need something not mapped above
//                 _rawJob: job,
//                 _rawReceipt: receipt,
//               };
//             })
//         : [];

//       setRecords(merged);
//     } catch (err) {
//       console.error("Failed to fetch print-final calibration:", err);
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
//     setIsPrinted(false); // fresh record -> Update starts disabled again
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedJob(null);
//     setIsPrinted(false);
//   };

//   // "Print Final Certificate & Print PDF File" doesn't touch the
//   // backend or move the job. It's a local confirmation gate that
//   // unlocks the Update button for this record.
//   const handlePrintFinalCertificate = () => {
//     // TODO: hook up actual PDF generation / print flow here
//     setIsPrinted(true);
//   };

//   // "Update" is what actually persists the move: tag the job as ready
//   // for the next stage (Delivery Receipt), then drop it out of this
//   // table and close.
//   const handleUpdate = async () => {
//     if (!selectedJob) return;
//     try {
//       const res = await fetch(`${API}/api/jobnumbers/update-details`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           jobNumber: selectedJob.jobNumber,
//           forDeliveryTagged: true,
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
//       console.error("Update (move past Print Final) failed:", err);
//     }
//   };

//   return (
//     <div className="calibration-container">
//       {/* Header */}
//       <div className="calibration-header">
//         <h2>PRINT FINAL CERTIFICATE</h2>
//       </div>

//       {/* Tabs */}
//       <div className="calibration-tabs">
//         <button className="active">List of Jobs</button>
//       </div>

//       {/* Search bar */}
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

//       {/* Table */}
//       <div className="calibration-table-wrapper">
//         <table className="calibration-table">
//           <thead>
//             <tr>
//               <th>Job Number</th>
//               <th>Date Rec</th>
//               <th>Priority</th>
//               <th>OIC</th>
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
//                 <td colSpan="12" className="no-data">
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
//                 <td colSpan="12" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : "No jobs ready for final certificate"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showModal && selectedJob && (
//         <ForPrintFinalDetailsModal
//           jobForm={selectedJob}
//           onClose={handleCloseModal}
//           onOpenCamera={() => {
//             // TODO: wire up camera capture flow
//             console.log("Open camera for", selectedJob.jobNumber);
//           }}
//           onOpenFolder={() => {
//             // TODO: wire up folder/file picker flow
//             console.log("Open folder for", selectedJob.jobNumber);
//           }}
//           onPrintFinalCertificate={handlePrintFinalCertificate}
//           onUpdate={handleUpdate}
//           onLogForRetyping={() => {
//             // TODO: PATCH job back to typist stage
//             console.log("Log for re-typing", selectedJob.jobNumber);
//           }}
//           isUpdateEnabled={isPrinted}
//         />
//       )}
//     </div>
//   );
// };

// export default PrintFinal;
import React, { useState, useEffect, useMemo } from "react";
import "../OngoingCalibration/Ongoinglistcalib.css";
import ForPrintFinalDetailsModal from "./ForPrintFinalDetailsModal";

const API = import.meta.env.VITE_API_URL;

const searchKeyMap = {
  "Company Name": "companyName",
  "Contact Name": "contactName",
  "JR ID": "jobReceiptID",
};

const PrintFinal = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // ---- Modal state ----
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Local "printed" gate — true once Print Final Certificate has been
  // clicked for the currently open record. Controls whether the
  // Update button is enabled. Not persisted to the backend; resets
  // whenever a (new) modal is opened or closed.
  const [isPrinted, setIsPrinted] = useState(false);

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
            // Only jobs updated from Checking SIG, ready for final
            // certificate printing, and not yet moved past this stage.
            .filter(
              (job) =>
                job.forPrintFinalTagged === true && !job.forDeliveryTagged,
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
                evalBy: job.evalBy || "",
                priority: job.priority || "Normal",
                dateRec: receipt.date || "",
                companyName: receipt.companyName || "",
                contactName: receipt.contactName || "",
                typedBy: job.typedBy || "",

                // ---- extra fields needed by ForPrintFinalDetailsModal ----
                sig: job.sig || "",
                frequency: job.frequency || "",
                contactCert: job.contactCert || "",
                uncertainty: job.uncertainty || "",
                range: job.range || "",
                dateCal: job.dateCal || "",
                dateDue: job.dateDue || "",

                // keep the raw job/receipt around in case the modal
                // or its handlers need something not mapped above
                _rawJob: job,
                _rawReceipt: receipt,
              };
            })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch print-final calibration:", err);
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
    setIsPrinted(false); // fresh record -> Update starts disabled again
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setIsPrinted(false);
  };

  // "Print Final Certificate & Print PDF File" doesn't touch the
  // backend or move the job. It's a local confirmation gate that
  // unlocks the Update button for this record.
  const handlePrintFinalCertificate = () => {
    // TODO: hook up actual PDF generation / print flow here
    setIsPrinted(true);
  };

  // "Update" is what actually persists the move: tag the job as ready
  // for the next stage (Delivery Receipt), then drop it out of this
  // table and close.
  const handleUpdate = async () => {
    if (!selectedJob) return;
    try {
      const res = await fetch(`${API}/api/jobnumbers/update-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNumber: selectedJob.jobNumber,
          forDeliveryTagged: true,
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
      console.error("Update (move past Print Final) failed:", err);
    }
  };

  return (
    <div className="calibration-container">
      {/* Header */}
      <div className="calibration-header">
        <h2>PRINT FINAL CERTIFICATE</h2>
      </div>

      {/* Tabs */}
      <div className="calibration-tabs">
        <button className="active">List of Jobs</button>
      </div>

      {/* Search bar */}
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

      {/* Table */}
      <div className="calibration-table-wrapper">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Date Rec</th>
              <th>Priority</th>
              <th>OIC</th>
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
                <td colSpan="14" className="no-data">
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
                  <td>{r.evalBy || r.contactName}</td>
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
                <td colSpan="14" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : "No jobs ready for final certificate"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedJob && (
        <ForPrintFinalDetailsModal
          jobForm={selectedJob}
          onClose={handleCloseModal}
          onOpenCamera={() => {
            // TODO: wire up camera capture flow
            console.log("Open camera for", selectedJob.jobNumber);
          }}
          onOpenFolder={() => {
            // TODO: wire up folder/file picker flow
            console.log("Open folder for", selectedJob.jobNumber);
          }}
          onPrintFinalCertificate={handlePrintFinalCertificate}
          onUpdate={handleUpdate}
          onLogForRetyping={() => {
            // TODO: PATCH job back to typist stage
            console.log("Log for re-typing", selectedJob.jobNumber);
          }}
          isUpdateEnabled={isPrinted}
        />
      )}
    </div>
  );
};

export default PrintFinal;
