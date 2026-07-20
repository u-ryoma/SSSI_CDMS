// import React, { useState, useEffect, useMemo } from "react";
// import "./Ongoinglistcalib.css";
// import IncomingCalibDetailsModal from "../IncomingCalibration/IncomingCalibDetailsModal";

// const API = import.meta.env.VITE_API_URL;

// const currentYear = new Date().getFullYear();
// const yearOptions = Array.from({ length: 5 }, (_, i) =>
//   (currentYear - i).toString(),
// );

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "Contact Name": "contactName",
//   "JR ID": "jobReceiptID",
// };

// const OnGoingCalib = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");
//   const [selectedYear, setSelectedYear] = useState(currentYear.toString());
//   const [rowsPerPage, setRowsPerPage] = useState(25);

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
//             // Only jobs that have been moved on from Incoming Calibration,
//             // and haven't already moved on to For Typing.
//             .filter((job) => job.ongoingTagged === true && !job.forTypingTagged)
//             .map((job) => {
//               const receipt = receiptsMap[job.jobReceiptID] || {};
//               return {
//                 jobNumber: job.jobNumber,
//                 jobReceiptID: job.jobReceiptID,
//                 type: job.type || "mechanical",
//                 description: job.description || "",
//                 brand: job.brand || "",
//                 model: job.model || "",
//                 serialNo: job.serialNo || "",
//                 remarks: job.remarks || "",
//                 concern: job.concern || "",
//                 range: job.range || "",
//                 uncertainty: job.uncertainty || "",
//                 contactCert: job.contactCert || "",
//                 frequency: job.frequency || "1 Year",
//                 eta: job.eta || "",
//                 evalBy: job.evalBy || "",
//                 priority: job.priority || "Normal",
//                 voltage: job.voltage || "-",
//                 ongoingTagged: job.ongoingTagged || false,
//                 forTypingTagged: job.forTypingTagged || false,
//                 // fields carried over from the Incoming Calibration step
//                 sig: job.sig || "",
//                 dateCal: job.dateCal || "",
//                 dateDue: job.dateDue || "",
//                 accreditationLogo: job.accreditationLogo || "with",
//                 calibrationProcedure: job.calibrationProcedure || "",
//                 calibrationStandards: job.calibrationStandards || [],
//                 photoUrl: job.photoUrl || "",
//                 dateRec: receipt.date || "",
//                 companyName: receipt.companyName || "",
//                 contactName: receipt.contactName || "",
//               };
//             })
//         : [];

//       setRecords(merged);
//     } catch (err) {
//       console.error("Failed to fetch on-going calibration:", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRecords = useMemo(() => {
//     const yr = selectedYear.slice(-2);
//     return records
//       .filter((r) => {
//         const parts = r.jobNumber?.split("/");
//         const jobYear = parts?.[2];
//         if (jobYear !== yr) return false;
//         if (activeSearch.trim()) {
//           const key = searchKeyMap[searchBy];
//           return r[key]
//             ?.toString()
//             .toLowerCase()
//             .includes(activeSearch.toLowerCase());
//         }
//         return true;
//       })
//       .slice(0, rowsPerPage);
//   }, [records, selectedYear, activeSearch, searchBy, rowsPerPage]);

//   const handleRowClick = (record) => {
//     setSelectedRecord(record);
//     setShowModal(true);
//   };

//   // Clicking Update moves the job on to "For Typing": tag it on the
//   // backend, then drop it out of this table immediately (rather than
//   // just merging the edited fields back in, like the other stages do).
//   const handleUpdate = async (updatedFields) => {
//     try {
//       const res = await fetch(`${API}/api/jobnumbers/update-details`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           jobNumber: selectedRecord.jobNumber,
//           ...updatedFields,
//           forTypingTagged: true,
//         }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setRecords((prev) =>
//           prev.filter((r) => r.jobNumber !== selectedRecord.jobNumber),
//         );
//         setShowModal(false);
//       }
//     } catch (err) {
//       console.error("Update failed:", err);
//     }
//   };

//   const handleSearch = () => setActiveSearch(searchInput);
//   const handleSearchKeyDown = (e) => {
//     if (e.key === "Enter") handleSearch();
//   };
//   const handleRefresh = () => {
//     setSearchInput("");
//     setActiveSearch("");
//     setSearchBy("Company Name");
//     setSelectedYear(currentYear.toString());
//     fetchRecords();
//   };

//   return (
//     <div className="calibration-container">
//       <div className="calibration-header">
//         <h2>ON-GOING CALIBRATION</h2>
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

//         <select
//           value={selectedYear}
//           onChange={(e) => {
//             setSelectedYear(e.target.value);
//             setActiveSearch("");
//             setSearchInput("");
//           }}
//         >
//           {yearOptions.map((yr) => (
//             <option key={yr} value={yr}>
//               {yr}
//             </option>
//           ))}
//         </select>

//         <select
//           value={rowsPerPage}
//           onChange={(e) => setRowsPerPage(Number(e.target.value))}
//         >
//           <option value={25}>25</option>
//           <option value={50}>50</option>
//           <option value={100}>100</option>
//         </select>

//         <button>Re-Log</button>
//         <button>Quick Log</button>
//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       <div className="search-results-info">
//         <span>
//           Showing <strong>{filteredRecords.length}</strong> of{" "}
//           <strong>{records.length}</strong> records for{" "}
//           <strong>{selectedYear}</strong>
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
//               <th>Company</th>
//               <th>Description</th>
//               <th>Brand</th>
//               <th>Model</th>
//               <th>Serial No</th>
//               <th>ETA</th>
//               <th>Remarks</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="11" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredRecords.length > 0 ? (
//               filteredRecords.map((r, idx) => (
//                 <tr
//                   key={idx}
//                   className="clickable-row"
//                   onClick={() => handleRowClick(r)}
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
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="11" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : `No on-going calibration records for ${selectedYear}`}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Reuses the same details modal as Incoming Calibration, retitled */}
//       {showModal && selectedRecord && (
//         <IncomingCalibDetailsModal
//           jobForm={selectedRecord}
//           title="ON-GOING CALIBRATION DETAILS"
//           onClose={() => setShowModal(false)}
//           onUpdate={handleUpdate}
//           onOpenCamera={() => {}}
//           onOpenFolder={() => {}}
//           onLoadTemplate={() => {}}
//           onLoadAndConnect={() => {}}
//           onOpenCalProcedureLookup={() => {}}
//           onOpenCalStandardLookup={(rowIndex, columnKey) => {}}
//         />
//       )}
//     </div>
//   );
// };

// export default OnGoingCalib;
import React, { useState, useEffect, useMemo } from "react";
import "./Ongoinglistcalib.css";
import IncomingCalibDetailsModal from "../IncomingCalibration/IncomingCalibDetailsModal";

const API = import.meta.env.VITE_API_URL;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) =>
  (currentYear - i).toString(),
);

const searchKeyMap = {
  "Company Name": "companyName",
  "Contact Name": "contactName",
  "JR ID": "jobReceiptID",
};

const OnGoingCalib = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [rowsPerPage, setRowsPerPage] = useState(25);

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
            // Only jobs that have been moved on from Incoming Calibration,
            // and haven't already moved on to For Typing.
            .filter((job) => job.ongoingTagged === true && !job.forTypingTagged)
            .map((job) => {
              const receipt = receiptsMap[job.jobReceiptID] || {};
              return {
                jobNumber: job.jobNumber,
                jobReceiptID: job.jobReceiptID,
                type: job.type || "mechanical",
                description: job.description || "",
                brand: job.brand || "",
                model: job.model || "",
                serialNo: job.serialNo || "",
                remarks: job.remarks || "",
                concern: job.concern || "",
                range: job.range || "",
                uncertainty: job.uncertainty || "",
                contactCert: job.contactCert || "",
                frequency: job.frequency || "1 Year",
                eta: job.eta || "",
                oicBy: job.oicBy || "",
                priority: job.priority || "Normal",
                voltage: job.voltage || "-",
                ongoingTagged: job.ongoingTagged || false,
                forTypingTagged: job.forTypingTagged || false,
                // fields carried over from the Incoming Calibration step
                sig: job.sig || "",
                dateCal: job.dateCal || "",
                dateDue: job.dateDue || "",
                accreditationLogo: job.accreditationLogo || "with",
                calibrationProcedure: job.calibrationProcedure || "",
                calibrationStandards: job.calibrationStandards || [],
                photoUrl: job.photoUrl || "",
                dateRec: receipt.date || "",
                companyName: receipt.companyName || "",
                contactName: receipt.contactName || "",
              };
            })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch on-going calibration:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    const yr = selectedYear.slice(-2);
    return records
      .filter((r) => {
        const parts = r.jobNumber?.split("/");
        const jobYear = parts?.[2];
        if (jobYear !== yr) return false;
        if (activeSearch.trim()) {
          const key = searchKeyMap[searchBy];
          return r[key]
            ?.toString()
            .toLowerCase()
            .includes(activeSearch.toLowerCase());
        }
        return true;
      })
      .slice(0, rowsPerPage);
  }, [records, selectedYear, activeSearch, searchBy, rowsPerPage]);

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  // Clicking Update moves the job on to "For Typing": tag it on the
  // backend, then drop it out of this table immediately (rather than
  // just merging the edited fields back in, like the other stages do).
  const handleUpdate = async (updatedFields) => {
    try {
      const res = await fetch(`${API}/api/jobnumbers/update-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNumber: selectedRecord.jobNumber,
          ...updatedFields,
          forTypingTagged: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) =>
          prev.filter((r) => r.jobNumber !== selectedRecord.jobNumber),
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleSearch = () => setActiveSearch(searchInput);
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("Company Name");
    setSelectedYear(currentYear.toString());
    fetchRecords();
  };

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>ON-GOING CALIBRATION</h2>
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

        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setActiveSearch("");
            setSearchInput("");
          }}
        >
          {yearOptions.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>

        <button>Re-Log</button>
        <button>Quick Log</button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="search-results-info">
        <span>
          Showing <strong>{filteredRecords.length}</strong> of{" "}
          <strong>{records.length}</strong> records for{" "}
          <strong>{selectedYear}</strong>
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
              <th>Company</th>
              <th>Description</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial No</th>
              <th>ETA</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((r, idx) => (
                <tr
                  key={idx}
                  className="clickable-row"
                  onClick={() => handleRowClick(r)}
                >
                  <td>{r.jobNumber}</td>
                  <td>{r.dateRec}</td>
                  <td>{r.priority}</td>
                  <td>{r.oicBy || "Ready"}</td>
                  <td>{r.companyName}</td>
                  <td>{r.description}</td>
                  <td>{r.brand}</td>
                  <td>{r.model}</td>
                  <td>{r.serialNo}</td>
                  <td>{r.eta}</td>
                  <td>{r.remarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : `No on-going calibration records for ${selectedYear}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reuses the same details modal as Incoming Calibration, retitled */}
      {showModal && selectedRecord && (
        <IncomingCalibDetailsModal
          jobForm={selectedRecord}
          title="ON-GOING CALIBRATION DETAILS"
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdate}
          onOpenCamera={() => {}}
          onOpenFolder={() => {}}
          onLoadTemplate={() => {}}
          onLoadAndConnect={() => {}}
          onOpenCalProcedureLookup={() => {}}
          onOpenCalStandardLookup={(rowIndex, columnKey) => {}}
        />
      )}
    </div>
  );
};

export default OnGoingCalib;
