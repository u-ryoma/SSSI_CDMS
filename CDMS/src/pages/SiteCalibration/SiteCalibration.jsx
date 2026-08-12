// // import React, { useState, useEffect, useMemo } from "react";
// // import "../OngoingCalibration/Ongoinglistcalib.css";

// // const API = import.meta.env.VITE_API_URL;

// // const searchKeyMap = {
// //   "Company Name": "company",
// //   "Contact Name": "contactName",
// //   "JR ID": "jrId",
// // };

// // const SiteCalibration = () => {
// //   const [jobNumbers, setJobNumbers] = useState([]);
// //   const [receipts, setReceipts] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   const [searchBy, setSearchBy] = useState("Company Name");
// //   const [searchInput, setSearchInput] = useState("");
// //   const [activeSearch, setActiveSearch] = useState("");

// //   useEffect(() => {
// //     fetchAll();
// //   }, []);

// //   const fetchAll = async () => {
// //     setLoading(true);
// //     try {
// //       const [jobsRes, receiptsRes] = await Promise.all([
// //         fetch(`${API}/api/jobnumbers`),
// //         fetch(`${API}/api/jobreceipts`),
// //       ]);
// //       const jobsData = await jobsRes.json();
// //       const receiptsData = await receiptsRes.json();
// //       setJobNumbers(Array.isArray(jobsData) ? jobsData : []);
// //       setReceipts(Array.isArray(receiptsData) ? receiptsData : []);
// //     } catch (err) {
// //       console.error("Failed to fetch site calibration data:", err);
// //       setJobNumbers([]);
// //       setReceipts([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleRefresh = () => {
// //     setSearchInput("");
// //     setActiveSearch("");
// //     setSearchBy("Company Name");
// //     fetchAll();
// //   };

// //   const handleSearch = () => setActiveSearch(searchInput);

// //   const handleSearchKeyDown = (e) => {
// //     if (e.key === "Enter") handleSearch();
// //   };

// //   // Join each job number with its parent receipt (for company/contact/JR ID),
// //   // then keep only jobs flagged On-Site via the JobNumberModal checkbox.
// //   const calibrations = useMemo(() => {
// //     const receiptsById = new Map(receipts.map((r) => [r.jrId, r]));

// //     return jobNumbers
// //       .filter((job) => job.onSite === true)
// //       .map((job) => {
// //         const receipt = receiptsById.get(job.jobReceiptID) || {};
// //         return {
// //           jobNumber: job.jobNumber,
// //           jrId: receipt.jrId || job.jobReceiptID || "",
// //           dateRec: receipt.date || "",
// //           priority: job.priority || "",
// //           oic: job.evalBy || "",
// //           company: receipt.companyName || "",
// //           contactName: receipt.contactName || "",
// //           description: job.description || "",
// //           brand: job.brand || "",
// //           model: job.model || "",
// //           serialNo: job.serialNo || "",
// //           eta: job.eta || "",
// //           remarks: job.remarks || "",
// //         };
// //       });
// //   }, [jobNumbers, receipts]);

// //   const filteredCalibrations = useMemo(() => {
// //     if (!activeSearch.trim()) return calibrations;
// //     const key = searchKeyMap[searchBy];
// //     return calibrations.filter((c) =>
// //       c[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
// //     );
// //   }, [calibrations, activeSearch, searchBy]);

// //   return (
// //     <div className="calibration-container">
// //       <div className="calibration-header">
// //         <h2>SITE CALIBRATION</h2>
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

// //         <button onClick={handleSearch}>Search</button>

// //         {/* TODO: wire these up once Re-Log / Quick Log flows are defined */}
// //         <button onClick={() => console.log("Re-Log clicked")}>Re-Log</button>
// //         <button onClick={() => console.log("Quick Log clicked")}>
// //           Quick Log
// //         </button>
// //         <button onClick={handleRefresh}>Refresh</button>
// //       </div>

// //       <div className="calibration-table-wrapper">
// //         <table className="calibration-table">
// //           <thead>
// //             <tr>
// //               <th>Job Number</th>
// //               <th>Date Rec</th>
// //               <th>Priority</th>
// //               <th>OIC</th>
// //               <th>Company</th>
// //               <th>Description</th>
// //               <th>Brand</th>
// //               <th>Model</th>
// //               <th>Serial No</th>
// //               <th>ETA</th>
// //               <th>Remarks</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {loading ? (
// //               <tr>
// //                 <td colSpan="11" className="no-data">
// //                   Loading...
// //                 </td>
// //               </tr>
// //             ) : filteredCalibrations.length > 0 ? (
// //               filteredCalibrations.map((c, idx) => (
// //                 <tr key={c.jobNumber || idx}>
// //                   <td>{c.jobNumber}</td>
// //                   <td>{c.dateRec}</td>
// //                   <td>{c.priority}</td>
// //                   <td>{c.oic}</td>
// //                   <td>{c.company}</td>
// //                   <td>{c.description}</td>
// //                   <td>{c.brand}</td>
// //                   <td>{c.model}</td>
// //                   <td>{c.serialNo}</td>
// //                   <td>{c.eta}</td>
// //                   <td>{c.remarks}</td>
// //                 </tr>
// //               ))
// //             ) : (
// //               <tr>
// //                 <td colSpan="11" className="no-data">
// //                   {activeSearch
// //                     ? `No results found for "${activeSearch}"`
// //                     : "No site calibration jobs found"}
// //                 </td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SiteCalibration;
// import React, { useState, useEffect, useMemo } from "react";
// import AddSiteCalibrationModal from "./AddSiteCalibrationModal";
// import "../OngoingCalibration/Ongoinglistcalib.css";

// const API = import.meta.env.VITE_API_URL;

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "Contact Name": "contactName",
//   "SC ID": "scId",
//   "Ref No.": "refNo",
// };

// const PAGE_SIZE_OPTIONS = [10, 25, 26, 50, 100];

// const SiteCalibration = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");

//   const [pageSize, setPageSize] = useState(26);
//   const [currentPage, setCurrentPage] = useState(1);

//   // Controls the Add New modal
//   const [showAddModal, setShowAddModal] = useState(false);

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/sitecalibrations`);
//       const data = await res.json();
//       setRecords(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch site calibration records:", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = () => {
//     setSearchInput("");
//     setActiveSearch("");
//     setSearchBy("Company Name");
//     setCurrentPage(1);
//     fetchAll();
//   };

//   const handleSearch = () => {
//     setActiveSearch(searchInput);
//     setCurrentPage(1);
//   };

//   const handleSearchKeyDown = (e) => {
//     if (e.key === "Enter") handleSearch();
//   };

//   const handleAddNew = () => {
//     setShowAddModal(true);
//   };

//   const handleModalClose = () => {
//     setShowAddModal(false);
//   };

//   const handleModalSaved = () => {
//     setShowAddModal(false);
//     fetchAll();
//   };

//   const filteredRecords = useMemo(() => {
//     if (!activeSearch.trim()) return records;
//     const key = searchKeyMap[searchBy];
//     return records.filter((r) =>
//       r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
//     );
//   }, [records, activeSearch, searchBy]);

//   const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

//   const paginatedRecords = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return filteredRecords.slice(start, start + pageSize);
//   }, [filteredRecords, currentPage, pageSize]);

//   return (
//     <div className="calibration-container">
//       <div className="calibration-header">
//         <h2>SITE CALIBRATION RECORD</h2>
//       </div>

//       <div className="calibration-search">
//         <select
//           value={searchBy}
//           onChange={(e) => {
//             setSearchBy(e.target.value);
//             setSearchInput("");
//             setActiveSearch("");
//             setCurrentPage(1);
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
//           value={pageSize}
//           onChange={(e) => {
//             setPageSize(Number(e.target.value));
//             setCurrentPage(1);
//           }}
//         >
//           {PAGE_SIZE_OPTIONS.map((size) => (
//             <option key={size} value={size}>
//               {size}
//             </option>
//           ))}
//         </select>

//         <button onClick={handleAddNew}>Add New</button>
//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       <div className="calibration-table-wrapper">
//         <table className="calibration-table">
//           <thead>
//             <tr>
//               <th>SC ID</th>
//               <th>Date</th>
//               <th>Company Name</th>
//               <th>Company Address</th>
//               <th>Contact Info</th>
//               <th>Contact Name</th>
//               <th>Ref No.</th>
//               <th>Prepared By</th>
//               <th>Remarks</th>
//               <th>Technicians</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="10" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : paginatedRecords.length > 0 ? (
//               paginatedRecords.map((r, idx) => (
//                 <tr key={r.scId || idx}>
//                   <td>{r.scId}</td>
//                   <td>{r.date}</td>
//                   <td>{r.companyName}</td>
//                   <td>{r.companyAddress}</td>
//                   <td>{r.contactInfo}</td>
//                   <td>{r.contactName}</td>
//                   <td>{r.refNo}</td>
//                   <td>{r.preparedBy}</td>
//                   <td>{r.remarks}</td>
//                   <td>{r.technicians}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="10" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : "No site calibration records found"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {totalPages > 1 && (
//         <div className="calibration-pagination">
//           <button
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//           >
//             Prev
//           </button>
//           <span>
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//           >
//             Next
//           </button>
//         </div>
//       )}

//       <AddSiteCalibrationModal
//         isOpen={showAddModal}
//         onClose={handleModalClose}
//         onSaved={handleModalSaved}
//       />
//     </div>
//   );
// };

// export default SiteCalibration;
import React, { useState, useEffect, useMemo } from "react";
import AddSiteCalibrationModal from "./AddSiteCalibrationModal";
import "../OngoingCalibration/Ongoinglistcalib.css";

const API = import.meta.env.VITE_API_URL;

const searchKeyMap = {
  "Company Name": "companyName",
  "Contact Name": "contactName",
  "SC ID": "scId",
  "Ref No.": "refNo",
};

const PAGE_SIZE_OPTIONS = [10, 25, 26, 50, 100];

const SiteCalibration = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [pageSize, setPageSize] = useState(26);
  const [currentPage, setCurrentPage] = useState(1);

  // Controls the Add/Edit modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScId, setEditingScId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/sitecalibrations`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch site calibration records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("Company Name");
    setCurrentPage(1);
    fetchAll();
  };

  const handleSearch = () => {
    setActiveSearch(searchInput);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleAddNew = () => {
    setEditingScId(null); // make sure Add New always starts blank
    setShowAddModal(true);
  };

  // Row click opens the same modal in edit mode
  const handleRowClick = (record) => {
    setEditingScId(record.scId);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingScId(null);
  };

  const handleModalSaved = () => {
    setShowAddModal(false);
    setEditingScId(null);
    fetchAll();
  };

  const filteredRecords = useMemo(() => {
    if (!activeSearch.trim()) return records;
    const key = searchKeyMap[searchBy];
    return records.filter((r) =>
      r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
    );
  }, [records, activeSearch, searchBy]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>SITE CALIBRATION RECORD</h2>
      </div>

      <div className="calibration-search">
        <select
          value={searchBy}
          onChange={(e) => {
            setSearchBy(e.target.value);
            setSearchInput("");
            setActiveSearch("");
            setCurrentPage(1);
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
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <button onClick={handleAddNew}>Add New</button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="calibration-table-wrapper">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>SC ID</th>
              <th>Date</th>
              <th>Company Name</th>
              <th>Company Address</th>
              <th>Contact Info</th>
              <th>Contact Name</th>
              <th>Ref No.</th>
              <th>Prepared By</th>
              <th>Remarks</th>
              <th>Technicians</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : paginatedRecords.length > 0 ? (
              paginatedRecords.map((r, idx) => (
                <tr
                  key={r.scId || idx}
                  className="clickable-row"
                  onClick={() => handleRowClick(r)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{r.scId}</td>
                  <td>{r.date}</td>
                  <td>{r.companyName}</td>
                  <td>{r.companyAddress}</td>
                  <td>{r.contactInfo}</td>
                  <td>{r.contactName}</td>
                  <td>{r.refNo}</td>
                  <td>{r.preparedBy}</td>
                  <td>{r.remarks}</td>
                  <td>{r.technicians}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : "No site calibration records found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="calibration-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      <AddSiteCalibrationModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSaved={handleModalSaved}
        editingScId={editingScId}
      />
    </div>
  );
};

export default SiteCalibration;
