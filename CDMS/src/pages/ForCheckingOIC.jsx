// // import React, { useState, useEffect, useMemo } from "react";
// // import "./Ongoinglistcalib.css";

// // const API = import.meta.env.VITE_API_URL;

// // const searchKeyMap = {
// //   "Company Name": "companyName",
// //   "Contact Name": "contactName",
// //   "JR ID": "jobReceiptID",
// // };

// // const ForCheckingOIC = () => {
// //   const [records, setRecords] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [searchBy, setSearchBy] = useState("Company Name");
// //   const [searchInput, setSearchInput] = useState("");
// //   const [activeSearch, setActiveSearch] = useState("");

// //   useEffect(() => {
// //     fetchRecords();
// //   }, []);

// //   const fetchRecords = async () => {
// //     setLoading(true);
// //     try {
// //       const [jobsRes, receiptsRes] = await Promise.all([
// //         fetch(`${API}/api/jobnumbers`),
// //         fetch(`${API}/api/jobreceipts`),
// //       ]);
// //       const jobs = await jobsRes.json();
// //       const receipts = await receiptsRes.json();

// //       const receiptsMap = {};
// //       if (Array.isArray(receipts)) {
// //         receipts.forEach((r) => {
// //           receiptsMap[r.jrId] = r;
// //         });
// //       }

// //       const merged = Array.isArray(jobs)
// //         ? jobs
// //             // Only jobs uploaded from ForTyping via "Upload and Auto Backup"
// //             .filter((job) => job.forCheckingOICTagged === true)
// //             .map((job) => {
// //               const receipt = receiptsMap[job.jobReceiptID] || {};
// //               return {
// //                 jobNumber: job.jobNumber,
// //                 jobReceiptID: job.jobReceiptID,
// //                 description: job.description || "",
// //                 brand: job.brand || "",
// //                 model: job.model || "",
// //                 serialNo: job.serialNo || "",
// //                 remarks: job.remarks || "",
// //                 concern: job.concern || "",
// //                 eta: job.eta || "",
// //                 evalBy: job.evalBy || "",
// //                 priority: job.priority || "Normal",
// //                 typedBy: job.typedBy || "",
// //                 dateRec: receipt.date || "",
// //                 companyName: receipt.companyName || "",
// //                 contactName: receipt.contactName || "",
// //               };
// //             })
// //         : [];

// //       setRecords(merged);
// //     } catch (err) {
// //       console.error("Failed to fetch for-checking-OIC calibration:", err);
// //       setRecords([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const filteredRecords = useMemo(() => {
// //     if (!activeSearch.trim()) return records;
// //     const key = searchKeyMap[searchBy];
// //     return records.filter((r) =>
// //       r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
// //     );
// //   }, [records, activeSearch, searchBy]);

// //   const handleSearch = () => setActiveSearch(searchInput);
// //   const handleSearchKeyDown = (e) => {
// //     if (e.key === "Enter") handleSearch();
// //   };
// //   const handleRefresh = () => {
// //     setSearchInput("");
// //     setActiveSearch("");
// //     setSearchBy("Company Name");
// //     fetchRecords();
// //   };

// //   return (
// //     <div className="calibration-container">
// //       <div className="calibration-header">
// //         <h2>REPORT FOR CHECKING OIC</h2>
// //       </div>

// //       <div className="calibration-tabs">
// //         <button className="active">List of Jobs</button>
// //       </div>

// //       <div className="calibration-search">
// //         <select
// //           value={searchBy}
// //           onChange={(e) => {
// //             setSearchBy(e.target.value);
// //             setSearchInput("");
// //             setActiveSearch("");
// //           }}
// //         >
// //           {Object.keys(searchKeyMap).map((label) => (
// //             <option key={label} value={label}>
// //               {label}
// //             </option>
// //           ))}
// //         </select>

// //         <input
// //           type="text"
// //           placeholder={`Search by ${searchBy}...`}
// //           value={searchInput}
// //           onChange={(e) => setSearchInput(e.target.value)}
// //           onKeyDown={handleSearchKeyDown}
// //         />

// //         <button>Re-Log</button>
// //         <button>Quick Log</button>
// //         <button onClick={handleRefresh}>Refresh</button>
// //       </div>

// //       <div className="search-results-info">
// //         <span>
// //           Showing <strong>{filteredRecords.length}</strong> of{" "}
// //           <strong>{records.length}</strong> records
// //         </span>
// //         {activeSearch && (
// //           <span>
// //             {" "}
// //             — searching <strong>{searchBy}</strong>: "
// //             <strong>{activeSearch}</strong>"
// //             <button
// //               className="clear-search-btn"
// //               onClick={() => {
// //                 setSearchInput("");
// //                 setActiveSearch("");
// //               }}
// //             >
// //               ✕ Clear
// //             </button>
// //           </span>
// //         )}
// //       </div>

// //       <div className="calibration-table-wrapper">
// //         <table className="calibration-table">
// //           <thead>
// //             <tr>
// //               <th>Job Number</th>
// //               <th>Date Rec</th>
// //               <th>Priority</th>
// //               <th>OIC</th>
// //               <th>Typist</th>
// //               <th>Company</th>
// //               <th>Description</th>
// //               <th>Brand</th>
// //               <th>Model</th>
// //               <th>Serial No</th>
// //               <th>ETA</th>
// //               <th>Remarks</th>
// //               <th>Concern</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {loading ? (
// //               <tr>
// //                 <td colSpan="13" className="no-data">
// //                   Loading...
// //                 </td>
// //               </tr>
// //             ) : filteredRecords.length > 0 ? (
// //               filteredRecords.map((r, idx) => (
// //                 <tr key={idx}>
// //                   <td>{r.jobNumber}</td>
// //                   <td>{r.dateRec}</td>
// //                   <td>{r.priority}</td>
// //                   <td>{r.evalBy || r.contactName}</td>
// //                   <td>{r.typedBy}</td>
// //                   <td>{r.companyName}</td>
// //                   <td>{r.description}</td>
// //                   <td>{r.brand}</td>
// //                   <td>{r.model}</td>
// //                   <td>{r.serialNo}</td>
// //                   <td>{r.eta}</td>
// //                   <td>{r.remarks}</td>
// //                   <td>{r.concern}</td>
// //                 </tr>
// //               ))
// //             ) : (
// //               <tr>
// //                 <td colSpan="13" className="no-data">
// //                   {activeSearch
// //                     ? `No results found for "${activeSearch}"`
// //                     : "No jobs awaiting OIC check"}
// //                 </td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ForCheckingOIC;
// import React, { useState, useEffect, useMemo } from "react";
// import "./OnGoingCalibration/Ongoinglistcalib.css";
// import ForTypingDetailsModal from "./ForTyping/ForTypingDetailsModal";

// const API = import.meta.env.VITE_API_URL;

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "Contact Name": "contactName",
//   "JR ID": "jobReceiptID",
// };

// const ForCheckingOIC = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [showModal, setShowModal] = useState(false);

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
//             // Only jobs uploaded from ForTyping via "Upload and Auto Backup"
//             .filter((job) => job.forCheckingOICTagged === true)
//             .map((job) => {
//               const receipt = receiptsMap[job.jobReceiptID] || {};
//               return {
//                 jobNumber: job.jobNumber,
//                 jobReceiptID: job.jobReceiptID,
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
//                 typedBy: job.typedBy || "",
//                 sig: job.sig || "",
//                 dateCal: job.dateCal || "",
//                 dateDue: job.dateDue || "",
//                 accreditationLogo: job.accreditationLogo || "with",
//                 calibrationProcedure: job.calibrationProcedure || "",
//                 calibrationStandards: job.calibrationStandards || [],
//                 dateRec: receipt.date || "",
//                 companyName: receipt.companyName || "",
//                 contactName: receipt.contactName || "",
//               };
//             })
//         : [];

//       setRecords(merged);
//     } catch (err) {
//       console.error("Failed to fetch for-checking-OIC calibration:", err);
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

//   const handleRowClick = (record) => {
//     setSelectedRecord(record);
//     setShowModal(true);
//   };

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

//   return (
//     <div className="calibration-container">
//       <div className="calibration-header">
//         <h2>REPORT FOR CHECKING OIC</h2>
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
//                 <td colSpan="13" className="no-data">
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
//                 <td colSpan="13" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : "No jobs awaiting OIC check"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showModal && selectedRecord && (
//         <ForTypingDetailsModal
//           jobForm={selectedRecord}
//           title="DRAFT REPORT FOR CHECKING OIC"
//           primaryButtonLabel="Approve and Update Report"
//           secondaryButtonLabel="Upload and Auto Backup"
//           onClose={() => setShowModal(false)}
//           onOpenCamera={() => {}}
//           onOpenFolder={() => {}}
//           onOpenAndUpdateReport={() => {}}
//           onSaveAndAutoBackup={() => {}}
//           onOpenCalStandardLookup={(rowIndex, columnKey) => {}}
//           onOpenCalProcedureLookup={() => {}}
//         />
//       )}
//     </div>
//   );
// };

// export default ForCheckingOIC;
