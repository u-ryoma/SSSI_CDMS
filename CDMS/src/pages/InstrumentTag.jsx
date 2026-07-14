// import React, { useState, useEffect, useMemo } from "react";
// import { createPortal } from "react-dom";
// import "./instrumenttag.css";

// const API = import.meta.env.VITE_API_URL;

// const currentYear = new Date().getFullYear();
// const yearOptions = Array.from({ length: 5 }, (_, i) =>
//   (currentYear - i).toString(),
// );

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "Job Number": "jobNumber",
//   Brand: "brand",
// };

// const TaggingModal = ({ record, onClose, onTagged }) => {
//   const [concernPicTaken, setConcernPicTaken] = useState(
//     record.concernTagged || false,
//   );
//   const [confirming, setConfirming] = useState(false);

//   const handleMarkTagged = () => setConfirming(true);

//   const handleConfirm = () => {
//     onTagged(record, { concernPicTaken });
//     setConfirming(false);
//   };

//   return createPortal(
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="tag-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">INSTRUMENT TAGGING</span>
//               <span className="jr-modal-title-sub">
//                 SCIENTIFIC STANDARDS SERVICES
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         <div className="tag-modal-scroll">
//           <div className="tag-info-row">
//             <div className="tag-info-item">
//               <span className="tag-info-label">Job Number</span>
//               <span className="tag-info-value">{record.jobNumber}</span>
//             </div>
//             <div className="tag-info-item">
//               <span className="tag-info-label">Job Receipt ID</span>
//               <span className="tag-info-value">{record.jobReceiptID}</span>
//             </div>
//             <div className="tag-info-item">
//               <span className="tag-info-label">Date Rec</span>
//               <span className="tag-info-value">{record.dateRec}</span>
//             </div>
//             <div className="tag-info-item">
//               <span className="tag-info-label">Priority</span>
//               <span
//                 className={`tag-priority tag-priority-${record.priority?.toLowerCase().replace(" ", "-")}`}
//               >
//                 {record.priority}
//               </span>
//             </div>
//           </div>

//           <div className="tag-details-section">
//             <table className="tag-details-table">
//               <tbody>
//                 <tr>
//                   <td className="tag-detail-label">Company</td>
//                   <td className="tag-detail-value">{record.company}</td>
//                   <td className="tag-detail-label">Brand</td>
//                   <td className="tag-detail-value">{record.brand}</td>
//                 </tr>
//                 <tr>
//                   <td className="tag-detail-label">Description</td>
//                   <td className="tag-detail-value">{record.description}</td>
//                   <td className="tag-detail-label">Model</td>
//                   <td className="tag-detail-value">{record.model}</td>
//                 </tr>
//                 <tr>
//                   <td className="tag-detail-label">Serial No.</td>
//                   <td className="tag-detail-value">{record.serialNo}</td>
//                   <td className="tag-detail-label">ETA</td>
//                   <td className="tag-detail-value">{record.eta}</td>
//                 </tr>
//                 <tr>
//                   <td className="tag-detail-label">Range</td>
//                   <td className="tag-detail-value">{record.range}</td>
//                   <td className="tag-detail-label">Uncertainty</td>
//                   <td className="tag-detail-value">{record.uncertainty}</td>
//                 </tr>
//                 <tr>
//                   <td className="tag-detail-label">Frequency</td>
//                   <td className="tag-detail-value">{record.frequency}</td>
//                   <td className="tag-detail-label">Voltage</td>
//                   <td className="tag-detail-value">{record.voltage}</td>
//                 </tr>
//                 <tr>
//                   <td className="tag-detail-label">Eval By</td>
//                   <td className="tag-detail-value">{record.evalBy}</td>
//                   <td className="tag-detail-label">Type</td>
//                   <td className="tag-detail-value">
//                     {record.type === "electrical" ? "Electrical" : "Mechanical"}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="tag-detail-label">Remarks</td>
//                   <td className="tag-detail-value" colSpan="3">
//                     {record.remarks}
//                   </td>
//                 </tr>
//                 <tr>
//                   <td className="tag-detail-label">Concern</td>
//                   <td className="tag-detail-value" colSpan="3">
//                     {record.concern}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           {confirming && (
//             <div className="tag-confirm-prompt">
//               <p>
//                 Are you sure you want to mark this as tagged?
//                 {concernPicTaken
//                   ? " It will be moved to Incoming Concern."
//                   : " It will be moved to Incoming Calibration."}
//               </p>
//               <div className="tag-confirm-actions">
//                 <button
//                   className="cancel-btn"
//                   onClick={() => setConfirming(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button className="confirm-btn" onClick={handleConfirm}>
//                   Confirm
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="tag-footer">
//           <label className="tag-checkbox-label">
//             <input
//               type="checkbox"
//               checked={concernPicTaken}
//               onChange={(e) => setConcernPicTaken(e.target.checked)}
//             />
//             <span>Concern / PIC Taken</span>
//           </label>
//           <div className="tag-footer-actions">
//             <button
//               className="tag-btn-primary"
//               onClick={handleMarkTagged}
//               disabled={confirming}
//             >
//               Mark as Tagged & PIC Taken
//             </button>
//             <button className="jr-action-btn" onClick={onClose}>
//               Exit
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// const InstrumentTag = () => {
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
//         ? jobs.map((job) => {
//             const receipt = receiptsMap[job.jobReceiptID] || {};
//             return {
//               _id: job._id,
//               jobNumber: job.jobNumber,
//               jobReceiptID: job.jobReceiptID,
//               dateRec: receipt.date || "",
//               priority: job.priority || "",
//               company: receipt.companyName || "",
//               description: job.description || "",
//               brand: job.brand || "",
//               model: job.model || "",
//               serialNo: job.serialNo || "",
//               eta: job.eta || "",
//               remarks: job.remarks || "",
//               concern: job.concern || "",
//               range: job.range || "",
//               uncertainty: job.uncertainty || "",
//               frequency: job.frequency || "",
//               voltage: job.voltage || "",
//               evalBy: job.evalBy || "",
//               type: job.type || "mechanical",
//               tagged: job.tagged || false,
//               concernTagged: job.concernTagged || false,
//             };
//           })
//         : [];

//       setRecords(merged);
//     } catch (err) {
//       console.error("Failed to fetch records:", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRecords = useMemo(() => {
//     const yr = selectedYear.slice(-2);

//     return records
//       .filter((r) => {
//         // HIDE tagged records
//         if (r.tagged) return false;

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

//   const handleTagged = async (record, { concernPicTaken }) => {
//     try {
//       const res = await fetch(`${API}/api/jobnumbers/tag`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           jobNumber: record.jobNumber,
//           tagged: true,
//           concernTagged: concernPicTaken,
//           taggedAt: new Date().toISOString(),
//         }),
//       });

//       const data = await res.json();
//       if (data.success) {
//         setRecords((prev) =>
//           prev.map((r) =>
//             r.jobNumber === record.jobNumber
//               ? { ...r, tagged: true, concernTagged: concernPicTaken }
//               : r,
//           ),
//         );
//         setShowModal(false);
//       } else {
//         console.error("Tag update failed:", data.message);
//       }
//     } catch (err) {
//       console.error("Failed to mark as tagged:", err);
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
//     setRowsPerPage(25);
//     fetchRecords();
//   };

//   return (
//     <div className="instrument-container">
//       <div className="instrument-header">
//         <h2>INSTRUMENT TAG / PIC</h2>
//       </div>

//       <div className="instrument-tabs">
//         <button className="active">Instrument List</button>
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

//         <button>Log Printed</button>
//         <button>Re-Print</button>
//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       <div className="search-results-info">
//         <span>
//           Showing <strong>{filteredRecords.length}</strong> of{" "}
//           <strong>{records.filter((r) => !r.tagged).length}</strong> untagged
//           records for <strong>{selectedYear}</strong>
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
//         <table className="instrument-table">
//           <thead>
//             <tr>
//               <th>Job Number</th>
//               <th>Date Rec</th>
//               <th>Priority</th>
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
//                 <td colSpan="10" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredRecords.length > 0 ? (
//               filteredRecords.map((record, index) => (
//                 <tr
//                   key={index}
//                   className="clickable-row"
//                   onClick={() => handleRowClick(record)}
//                 >
//                   <td>{record.jobNumber}</td>
//                   <td>{record.dateRec}</td>
//                   <td>{record.priority}</td>
//                   <td>{record.company}</td>
//                   <td>{record.description}</td>
//                   <td>{record.brand}</td>
//                   <td>{record.model}</td>
//                   <td>{record.serialNo}</td>
//                   <td>{record.eta}</td>
//                   <td>{record.remarks}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="10" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : `No untagged records found for ${selectedYear}`}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showModal && selectedRecord && (
//         <TaggingModal
//           record={selectedRecord}
//           onClose={() => setShowModal(false)}
//           onTagged={handleTagged}
//         />
//       )}
//     </div>
//   );
// };

// export default InstrumentTag;
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import "./instrumenttag.css";

const API = import.meta.env.VITE_API_URL;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) =>
  (currentYear - i).toString(),
);

const searchKeyMap = {
  "Company Name": "companyName",
  "Job Number": "jobNumber",
  Brand: "brand",
};

const TaggingModal = ({ record, onClose, onTagged }) => {
  const [concernPicTaken, setConcernPicTaken] = useState(
    record.concernTagged || false,
  );
  const [confirming, setConfirming] = useState(false);

  const handleMarkTagged = () => setConfirming(true);

  const handleConfirm = () => {
    onTagged(record, { concernPicTaken });
    setConfirming(false);
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="tag-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">INSTRUMENT TAGGING</span>
              <span className="jr-modal-title-sub">
                SCIENTIFIC STANDARDS SERVICES
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="tag-modal-scroll">
          <div className="tag-info-row">
            <div className="tag-info-item">
              <span className="tag-info-label">Job Number</span>
              <span className="tag-info-value">{record.jobNumber}</span>
            </div>
            <div className="tag-info-item">
              <span className="tag-info-label">Job Receipt ID</span>
              <span className="tag-info-value">{record.jobReceiptID}</span>
            </div>
            <div className="tag-info-item">
              <span className="tag-info-label">Date Rec</span>
              <span className="tag-info-value">{record.dateRec}</span>
            </div>
            <div className="tag-info-item">
              <span className="tag-info-label">Priority</span>
              <span
                className={`tag-priority tag-priority-${record.priority?.toLowerCase().replace(" ", "-")}`}
              >
                {record.priority}
              </span>
            </div>
          </div>

          <div className="tag-details-section">
            <table className="tag-details-table">
              <tbody>
                <tr>
                  <td className="tag-detail-label">Company</td>
                  <td className="tag-detail-value">{record.company}</td>
                  <td className="tag-detail-label">Brand</td>
                  <td className="tag-detail-value">{record.brand}</td>
                </tr>
                <tr>
                  <td className="tag-detail-label">Description</td>
                  <td className="tag-detail-value">{record.description}</td>
                  <td className="tag-detail-label">Model</td>
                  <td className="tag-detail-value">{record.model}</td>
                </tr>
                <tr>
                  <td className="tag-detail-label">Serial No.</td>
                  <td className="tag-detail-value">{record.serialNo}</td>
                  <td className="tag-detail-label">ETA</td>
                  <td className="tag-detail-value">{record.eta}</td>
                </tr>
                <tr>
                  <td className="tag-detail-label">Range</td>
                  <td className="tag-detail-value">{record.range}</td>
                  <td className="tag-detail-label">Uncertainty</td>
                  <td className="tag-detail-value">{record.uncertainty}</td>
                </tr>
                <tr>
                  <td className="tag-detail-label">Frequency</td>
                  <td className="tag-detail-value">{record.frequency}</td>
                  <td className="tag-detail-label">Voltage</td>
                  <td className="tag-detail-value">{record.voltage}</td>
                </tr>
                <tr>
                  <td className="tag-detail-label">Eval By</td>
                  <td className="tag-detail-value">{record.evalBy}</td>
                  <td className="tag-detail-label">Type</td>
                  <td className="tag-detail-value">
                    {record.type === "electrical" ? "Electrical" : "Mechanical"}
                  </td>
                </tr>
                <tr>
                  <td className="tag-detail-label">Remarks</td>
                  <td className="tag-detail-value" colSpan="3">
                    {record.remarks}
                  </td>
                </tr>
                <tr>
                  <td className="tag-detail-label">Concern</td>
                  <td className="tag-detail-value" colSpan="3">
                    {record.concern}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {confirming && (
            <div className="tag-confirm-prompt">
              <p>
                Are you sure you want to mark this as tagged?
                {concernPicTaken
                  ? " It will be moved to Incoming Concern."
                  : " It will be moved to Incoming Calibration."}
              </p>
              <div className="tag-confirm-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </button>
                <button className="confirm-btn" onClick={handleConfirm}>
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="tag-footer">
          <label className="tag-checkbox-label">
            <input
              type="checkbox"
              checked={concernPicTaken}
              onChange={(e) => setConcernPicTaken(e.target.checked)}
            />
            <span>Concern / PIC Taken</span>
          </label>
          <div className="tag-footer-actions">
            <button
              className="tag-btn-primary"
              onClick={handleMarkTagged}
              disabled={confirming}
            >
              Mark as Tagged & PIC Taken
            </button>
            <button className="jr-action-btn" onClick={onClose}>
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const InstrumentTag = () => {
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
        ? jobs.map((job) => {
            const receipt = receiptsMap[job.jobReceiptID] || {};
            return {
              _id: job._id,
              jobNumber: job.jobNumber,
              jobReceiptID: job.jobReceiptID,
              dateRec: receipt.date || "",
              priority: job.priority || "",
              company: receipt.companyName || "",
              description: job.description || "",
              brand: job.brand || "",
              model: job.model || "",
              serialNo: job.serialNo || "",
              eta: job.eta || "",
              remarks: job.remarks || "",
              concern: job.concern || "",
              range: job.range || "",
              uncertainty: job.uncertainty || "",
              frequency: job.frequency || "",
              voltage: job.voltage || "",
              evalBy: job.evalBy || "",
              type: job.type || "mechanical",
              tagged: job.tagged || false,
              concernTagged: job.concernTagged || false,
            };
          })
        : [];

      setRecords(merged);
    } catch (err) {
      console.error("Failed to fetch records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    const yr = selectedYear.slice(-2);

    return records
      .filter((r) => {
        // HIDE tagged records
        if (r.tagged) return false;

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

  const handleTagged = async (record, { concernPicTaken }) => {
    try {
      const res = await fetch(`${API}/api/jobnumbers/tag`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNumber: record.jobNumber,
          tagged: true,
          concernTagged: concernPicTaken,
          taggedAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.jobNumber === record.jobNumber
              ? { ...r, tagged: true, concernTagged: concernPicTaken }
              : r,
          ),
        );
        setShowModal(false);
      } else {
        console.error("Tag update failed:", data.message);
      }
    } catch (err) {
      console.error("Failed to mark as tagged:", err);
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
    setRowsPerPage(25);
    fetchRecords();
  };

  return (
    <div className="instrument-container">
      <div className="instrument-header">
        <h2>INSTRUMENT TAG / PIC</h2>
      </div>

      <div className="instrument-tabs">
        <button className="active">Instrument List</button>
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

        <button>Log Printed</button>
        <button>Re-Print</button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="search-results-info">
        <span>
          Showing <strong>{filteredRecords.length}</strong> of{" "}
          <strong>{records.filter((r) => !r.tagged).length}</strong> untagged
          records for <strong>{selectedYear}</strong>
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
        <table className="instrument-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Date Rec</th>
              <th>Priority</th>
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
                <td colSpan="11" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr
                  key={index}
                  className="clickable-row"
                  onClick={() => handleRowClick(record)}
                >
                  <td>{record.jobNumber}</td>
                  <td>{record.dateRec}</td>
                  <td>{record.priority}</td>
                  <td>{record.company}</td>
                  <td>{record.description}</td>
                  <td>{record.brand}</td>
                  <td>{record.model}</td>
                  <td>{record.serialNo}</td>
                  <td>{record.eta}</td>
                  <td>{record.remarks}</td>
                  <td>{record.concern}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : `No untagged records found for ${selectedYear}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedRecord && (
        <TaggingModal
          record={selectedRecord}
          onClose={() => setShowModal(false)}
          onTagged={handleTagged}
        />
      )}
    </div>
  );
};

export default InstrumentTag;
