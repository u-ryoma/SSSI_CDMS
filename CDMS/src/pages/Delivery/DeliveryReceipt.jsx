// import React, { useState, useEffect, useMemo } from "react";
// import "../OngoingCalibration/Ongoinglistcalib.css";
// import DeliveryTypeModal from "./DeliveryReceiptTypeModal";
// import DeliveryReceiptUnitModal from "./DeliveryReceiptUnitModal";
// import DeliveryReceiptCertificateModal from "./DeliveryReceiptCertificateModal";

// const API = import.meta.env.VITE_API_URL;

// const searchKeyMap = {
//   CompanyName: "companyName",
//   ContactName: "contactName",
//   "JR ID": "jobReceiptID",
//   "DR ID": "deliveryReceiptId",
//   Reference: "reference",
// };

// // Separate search key map for the "For Delivery" tab — these rows come
// // from jobnumbers, not deliveryreceipts, so the field names differ.
// const forDeliverySearchKeyMap = {
//   "Job Number": "jobNumber",
//   CompanyName: "companyName",
//   "Company Address": "companyAddress",
//   "Contact Info": "contactInfo",
//   ContactName: "contactName",
// };

// const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

// const DeliveryReceiptList = () => {
//   // Which tab is active: "forDelivery" | "delivered"
//   const [activeTab, setActiveTab] = useState("forDelivery");

//   // ==========================
//   // List of Delivered (deliveryreceipts collection) — unchanged
//   // ==========================
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchBy, setSearchBy] = useState("CompanyName");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");
//   const [pageSize, setPageSize] = useState(26);

//   // ==========================
//   // List for Delivery (jobnumbers collection, filtered client-side)
//   // ==========================
//   const [jobs, setJobs] = useState([]);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [fdSearchBy, setFdSearchBy] = useState("CompanyName");
//   const [fdSearchInput, setFdSearchInput] = useState("");
//   const [fdActiveSearch, setFdActiveSearch] = useState("");
//   const [fdPageSize, setFdPageSize] = useState(26);

//   // Add New flow: step 1 picks the type, step 2 opens the matching form.
//   const [showTypeModal, setShowTypeModal] = useState(false);
//   const [showUnitModal, setShowUnitModal] = useState(false);
//   const [showCertificateModal, setShowCertificateModal] = useState(false);
//   const [pendingType, setPendingType] = useState(null); // "instrument" | "certificate"

//   useEffect(() => {
//     fetchRecords();
//     fetchJobsForDelivery();
//   }, []);

//   // Delivery receipts are their own collection (created via Add New ->
//   // pick type -> pick customer -> log completed job(s) -> Save, which
//   // generates a DRID). This list reads straight from that collection —
//   // it no longer re-derives rows from jobnumbers/jobreceipts, since that
//   // was only ever a placeholder before this collection existed.
//   const fetchRecords = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/deliveryreceipts`);
//       const data = await res.json();
//       setRecords(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch delivery receipts:", err);
//       setRecords([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // "For Delivery" jobs = forDeliveryTagged true (finished Print Final
//   // and pushed forward, same flag statsRoutes.js uses for the "For
//   // Delivery" pipeline bucket) and not yet fully delivered. A job is
//   // fully delivered once BOTH unitDelivered and certificateDelivered are
//   // true, mirroring statsRoutes.js's isFinished check — once isFinished
//   // is true a job is "Completed" and should drop off this list even if
//   // forDeliveryTagged is still set.
//   //
//   // companyAddress/contactInfo/contactName generally aren't stamped
//   // directly on the jobnumbers doc (only companyName sometimes is, e.g.
//   // for Site Calibration jobs) — they live on the linked jobreceipts doc
//   // instead, joined via jobNumber.jobReceiptID -> jobreceipt.jrId, same
//   // as the $lookup in statsRoutes.js. So fetch both collections and merge,
//   // preferring whatever's already on the job doc and falling back to the
//   // receipt.
//   const fetchJobsForDelivery = async () => {
//     setJobsLoading(true);
//     try {
//       const [jobsRes, receiptsRes] = await Promise.all([
//         fetch(`${API}/api/jobnumbers`),
//         fetch(`${API}/api/jobreceipts`),
//       ]);
//       const jobsData = await jobsRes.json();
//       const receiptsData = await receiptsRes.json();
//       const allJobs = Array.isArray(jobsData) ? jobsData : [];
//       const allReceipts = Array.isArray(receiptsData) ? receiptsData : [];

//       const receiptByJrId = new Map(allReceipts.map((r) => [r.jrId, r]));

//       const merged = allJobs.map((j) => {
//         const receipt = receiptByJrId.get(j.jobReceiptID);
//         return {
//           ...j,
//           companyName: j.companyName || receipt?.companyName,
//           companyAddress: j.companyAddress || receipt?.companyAddress,
//           contactInfo: j.contactInfo || receipt?.contactInfo,
//           contactName: j.contactName || receipt?.contactName,
//         };
//       });

//       const filtered = merged.filter((j) => {
//         const isFinished =
//           j.unitDelivered === true && j.certificateDelivered === true;
//         return j.forDeliveryTagged === true && !isFinished;
//       });
//       setJobs(filtered);
//     } catch (err) {
//       console.error("Failed to fetch jobs for delivery:", err);
//       setJobs([]);
//     } finally {
//       setJobsLoading(false);
//     }
//   };

//   const filteredRecords = useMemo(() => {
//     if (!activeSearch.trim()) return records;
//     const key = searchKeyMap[searchBy];
//     return records.filter((r) =>
//       r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
//     );
//   }, [records, activeSearch, searchBy]);

//   const visibleRecords = useMemo(
//     () => filteredRecords.slice(0, pageSize),
//     [filteredRecords, pageSize],
//   );

//   const filteredJobs = useMemo(() => {
//     if (!fdActiveSearch.trim()) return jobs;
//     const key = forDeliverySearchKeyMap[fdSearchBy];
//     return jobs.filter((j) =>
//       j[key]?.toString().toLowerCase().includes(fdActiveSearch.toLowerCase()),
//     );
//   }, [jobs, fdActiveSearch, fdSearchBy]);

//   const visibleJobs = useMemo(
//     () => filteredJobs.slice(0, fdPageSize),
//     [filteredJobs, fdPageSize],
//   );

//   const handleSearch = () => setActiveSearch(searchInput);
//   const handleSearchKeyDown = (e) => {
//     if (e.key === "Enter") handleSearch();
//   };
//   const handleRefresh = () => {
//     setSearchInput("");
//     setActiveSearch("");
//     setSearchBy("CompanyName");
//     fetchRecords();
//   };

//   const handleFdSearch = () => setFdActiveSearch(fdSearchInput);
//   const handleFdSearchKeyDown = (e) => {
//     if (e.key === "Enter") handleFdSearch();
//   };
//   const handleFdRefresh = () => {
//     setFdSearchInput("");
//     setFdActiveSearch("");
//     setFdSearchBy("CompanyName");
//     fetchJobsForDelivery();
//   };

//   const handleAddNew = () => setShowTypeModal(true);

//   const handleTypeSelected = (type) => {
//     setShowTypeModal(false);
//     setPendingType(type);
//     if (type === "instrument") {
//       setShowUnitModal(true);
//     } else {
//       setShowCertificateModal(true);
//     }
//   };

//   const handleUnitSaved = () => {
//     setShowUnitModal(false);
//     setPendingType(null);
//     fetchRecords();
//     fetchJobsForDelivery();
//   };

//   const handleCertificateSaved = () => {
//     setShowCertificateModal(false);
//     setPendingType(null);
//     fetchRecords();
//     fetchJobsForDelivery();
//   };

//   return (
//     <div className="calibration-container">
//       <div className="calibration-header">
//         <h2>DELIVERY RECEIPT</h2>
//       </div>

//       <div className="calibration-tabs">
//         <button
//           className={activeTab === "forDelivery" ? "active" : ""}
//           onClick={() => setActiveTab("forDelivery")}
//         >
//           List for Delivery
//         </button>
//         <button
//           className={activeTab === "delivered" ? "active" : ""}
//           onClick={() => setActiveTab("delivered")}
//         >
//           List of Delivered
//         </button>
//       </div>

//       {activeTab === "forDelivery" ? (
//         <>
//           <div className="calibration-search">
//             <select
//               value={fdSearchBy}
//               onChange={(e) => setFdSearchBy(e.target.value)}
//             >
//               {Object.keys(forDeliverySearchKeyMap).map((label) => (
//                 <option key={label} value={label}>
//                   {label}
//                 </option>
//               ))}
//             </select>

//             <input
//               type="text"
//               placeholder="Search..."
//               value={fdSearchInput}
//               onChange={(e) => setFdSearchInput(e.target.value)}
//               onKeyDown={handleFdSearchKeyDown}
//             />

//             <button onClick={handleFdSearch}>Search</button>

//             <select
//               value={fdPageSize}
//               onChange={(e) => setFdPageSize(Number(e.target.value))}
//             >
//               {PAGE_SIZE_OPTIONS.map((n) => (
//                 <option key={n} value={n}>
//                   {n}
//                 </option>
//               ))}
//             </select>

//             <button onClick={handleAddNew}>Add New</button>
//             <button onClick={handleFdRefresh}>Refresh</button>
//           </div>

//           <div className="calibration-table-wrapper">
//             <table className="calibration-table">
//               <thead>
//                 <tr>
//                   <th>Job Number</th>
//                   <th>Company Name</th>
//                   <th>Company Address</th>
//                   <th>Contact Info</th>
//                   <th>Contact Name</th>
//                   <th>Unit Delivered</th>
//                   <th>Certificate Delivered</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {jobsLoading ? (
//                   <tr>
//                     <td colSpan="7" className="no-data">
//                       Loading...
//                     </td>
//                   </tr>
//                 ) : visibleJobs.length > 0 ? (
//                   visibleJobs.map((j, idx) => (
//                     <tr key={j._id || idx}>
//                       <td>{j.jobNumber}</td>
//                       <td>{j.companyName || "Unknown"}</td>
//                       <td>{j.companyAddress || "—"}</td>
//                       <td>{j.contactInfo || "—"}</td>
//                       <td>{j.contactName || "—"}</td>
//                       <td>{j.unitDelivered ? "Yes" : "No"}</td>
//                       <td>{j.certificateDelivered ? "Yes" : "No"}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="7" className="no-data">
//                       {fdActiveSearch
//                         ? `No results found for "${fdActiveSearch}"`
//                         : "No jobs pending delivery"}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       ) : (
//         <>
//           <div className="calibration-search">
//             <select
//               value={searchBy}
//               onChange={(e) => setSearchBy(e.target.value)}
//             >
//               {Object.keys(searchKeyMap).map((label) => (
//                 <option key={label} value={label}>
//                   {label}
//                 </option>
//               ))}
//             </select>

//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               onKeyDown={handleSearchKeyDown}
//             />

//             <button onClick={handleSearch}>Search</button>

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

//             <button onClick={handleAddNew}>Add New</button>
//             <button onClick={handleRefresh}>Refresh</button>
//           </div>

//           <div className="calibration-table-wrapper">
//             <table className="calibration-table">
//               <thead>
//                 <tr>
//                   <th>DR ID</th>
//                   {/* <th>JR ID</th> */}
//                   <th>Type</th>
//                   <th>Date</th>
//                   <th>Company Name</th>
//                   <th>Address</th>
//                   <th>Contact Info</th>
//                   <th>Contact Name</th>
//                   <th>Reference</th>
//                   <th>Prepared By</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan="10" className="no-data">
//                       Loading...
//                     </td>
//                   </tr>
//                 ) : visibleRecords.length > 0 ? (
//                   visibleRecords.map((r, idx) => (
//                     <tr key={r._id || idx}>
//                       <td>{r.deliveryReceiptId}</td>
//                       {/* <td>{r.jobReceiptID}</td> */}
//                       <td>{r.type}</td>
//                       <td>{r.date}</td>
//                       <td>{r.companyName}</td>
//                       <td>{r.address}</td>
//                       <td>{r.contactInfo}</td>
//                       <td>{r.contactName}</td>
//                       <td>{r.reference}</td>
//                       <td>{r.preparedBy}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="10" className="no-data">
//                       {activeSearch
//                         ? `No results found for "${activeSearch}"`
//                         : "No delivery receipts yet"}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}

//       <DeliveryTypeModal
//         isOpen={showTypeModal}
//         onClose={() => setShowTypeModal(false)}
//         onSelect={handleTypeSelected}
//       />

//       <DeliveryReceiptUnitModal
//         isOpen={showUnitModal}
//         onClose={() => {
//           setShowUnitModal(false);
//           setPendingType(null);
//         }}
//         onSaved={handleUnitSaved}
//         type={pendingType}
//       />

//       <DeliveryReceiptCertificateModal
//         isOpen={showCertificateModal}
//         onClose={() => {
//           setShowCertificateModal(false);
//           setPendingType(null);
//         }}
//         onSaved={handleCertificateSaved}
//         type={pendingType}
//       />
//     </div>
//   );
// };

// export default DeliveryReceiptList;
import React, { useState, useEffect, useMemo } from "react";
import "../OngoingCalibration/Ongoinglistcalib.css";
import DeliveryTypeModal from "./DeliveryReceiptTypeModal";
import DeliveryReceiptUnitModal from "./DeliveryReceiptUnitModal";
import DeliveryReceiptCertificateModal from "./DeliveryReceiptCertificateModal";

const API = import.meta.env.VITE_API_URL;

const searchKeyMap = {
  CompanyName: "companyName",
  ContactName: "contactName",
  "JR ID": "jobReceiptID",
  "DR ID": "deliveryReceiptId",
  Reference: "reference",
};

// Separate search key map for the "For Delivery" tab — these rows come
// from jobnumbers, not deliveryreceipts, so the field names differ.
const forDeliverySearchKeyMap = {
  "Job Number": "jobNumber",
  CompanyName: "companyName",
  "Company Address": "companyAddress",
  "Contact Info": "contactInfo",
  ContactName: "contactName",
};

const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

const DeliveryReceiptList = () => {
  // Which tab is active: "forDelivery" | "delivered"
  const [activeTab, setActiveTab] = useState("forDelivery");

  // ==========================
  // List of Delivered (deliveryreceipts collection) — unchanged
  // ==========================
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBy, setSearchBy] = useState("CompanyName");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [pageSize, setPageSize] = useState(26);

  // ==========================
  // List for Delivery (jobnumbers collection, filtered client-side)
  // ==========================
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [fdSearchBy, setFdSearchBy] = useState("CompanyName");
  const [fdSearchInput, setFdSearchInput] = useState("");
  const [fdActiveSearch, setFdActiveSearch] = useState("");
  const [fdPageSize, setFdPageSize] = useState(26);

  // Add New flow: step 1 picks the type, step 2 opens the matching form.
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [pendingType, setPendingType] = useState(null); // "instrument" | "certificate"

  // Row click on "List of Delivered" -> view an existing record
  // (read-only). Routed to the matching modal by record.type.
  const [viewRecord, setViewRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
    fetchJobsForDelivery();
  }, []);

  // Delivery receipts are their own collection (created via Add New ->
  // pick type -> pick customer -> log completed job(s) -> Save, which
  // generates a DRID). This list reads straight from that collection —
  // it no longer re-derives rows from jobnumbers/jobreceipts, since that
  // was only ever a placeholder before this collection existed.
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/deliveryreceipts`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch delivery receipts:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // "For Delivery" jobs = forDeliveryTagged true (finished Print Final
  // and pushed forward, same flag statsRoutes.js uses for the "For
  // Delivery" pipeline bucket) and not yet fully delivered. A job is
  // fully delivered once BOTH unitDelivered and certificateDelivered are
  // true, mirroring statsRoutes.js's isFinished check — once isFinished
  // is true a job is "Completed" and should drop off this list even if
  // forDeliveryTagged is still set.
  //
  // companyAddress/contactInfo/contactName generally aren't stamped
  // directly on the jobnumbers doc (only companyName sometimes is, e.g.
  // for Site Calibration jobs) — they live on the linked jobreceipts doc
  // instead, joined via jobNumber.jobReceiptID -> jobreceipt.jrId, same
  // as the $lookup in statsRoutes.js. So fetch both collections and merge,
  // preferring whatever's already on the job doc and falling back to the
  // receipt.
  const fetchJobsForDelivery = async () => {
    setJobsLoading(true);
    try {
      const [jobsRes, receiptsRes] = await Promise.all([
        fetch(`${API}/api/jobnumbers`),
        fetch(`${API}/api/jobreceipts`),
      ]);
      const jobsData = await jobsRes.json();
      const receiptsData = await receiptsRes.json();
      const allJobs = Array.isArray(jobsData) ? jobsData : [];
      const allReceipts = Array.isArray(receiptsData) ? receiptsData : [];

      const receiptByJrId = new Map(allReceipts.map((r) => [r.jrId, r]));

      const merged = allJobs.map((j) => {
        const receipt = receiptByJrId.get(j.jobReceiptID);
        return {
          ...j,
          companyName: j.companyName || receipt?.companyName,
          companyAddress: j.companyAddress || receipt?.companyAddress,
          contactInfo: j.contactInfo || receipt?.contactInfo,
          contactName: j.contactName || receipt?.contactName,
        };
      });

      const filtered = merged.filter((j) => {
        const isFinished =
          j.unitDelivered === true && j.certificateDelivered === true;
        return j.forDeliveryTagged === true && !isFinished;
      });
      setJobs(filtered);
    } catch (err) {
      console.error("Failed to fetch jobs for delivery:", err);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!activeSearch.trim()) return records;
    const key = searchKeyMap[searchBy];
    return records.filter((r) =>
      r[key]?.toString().toLowerCase().includes(activeSearch.toLowerCase()),
    );
  }, [records, activeSearch, searchBy]);

  const visibleRecords = useMemo(
    () => filteredRecords.slice(0, pageSize),
    [filteredRecords, pageSize],
  );

  const filteredJobs = useMemo(() => {
    if (!fdActiveSearch.trim()) return jobs;
    const key = forDeliverySearchKeyMap[fdSearchBy];
    return jobs.filter((j) =>
      j[key]?.toString().toLowerCase().includes(fdActiveSearch.toLowerCase()),
    );
  }, [jobs, fdActiveSearch, fdSearchBy]);

  const visibleJobs = useMemo(
    () => filteredJobs.slice(0, fdPageSize),
    [filteredJobs, fdPageSize],
  );

  const handleSearch = () => setActiveSearch(searchInput);
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  const handleRefresh = () => {
    setSearchInput("");
    setActiveSearch("");
    setSearchBy("CompanyName");
    fetchRecords();
  };

  const handleFdSearch = () => setFdActiveSearch(fdSearchInput);
  const handleFdSearchKeyDown = (e) => {
    if (e.key === "Enter") handleFdSearch();
  };
  const handleFdRefresh = () => {
    setFdSearchInput("");
    setFdActiveSearch("");
    setFdSearchBy("CompanyName");
    fetchJobsForDelivery();
  };

  const handleAddNew = () => setShowTypeModal(true);

  const handleTypeSelected = (type) => {
    setShowTypeModal(false);
    setPendingType(type);
    if (type === "instrument") {
      setShowUnitModal(true);
    } else {
      setShowCertificateModal(true);
    }
  };

  const handleUnitSaved = () => {
    setShowUnitModal(false);
    setPendingType(null);
    fetchRecords();
    fetchJobsForDelivery();
  };

  const handleCertificateSaved = () => {
    setShowCertificateModal(false);
    setPendingType(null);
    fetchRecords();
    fetchJobsForDelivery();
  };

  // Row click on "List of Delivered" -> open the matching modal
  // (instrument vs certificate) in read-only view mode.
  const handleRowClick = (record) => setViewRecord(record);
  const handleCloseView = () => setViewRecord(null);

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>DELIVERY RECEIPT</h2>
      </div>

      <div className="calibration-tabs">
        <button
          className={activeTab === "forDelivery" ? "active" : ""}
          onClick={() => setActiveTab("forDelivery")}
        >
          List for Delivery
        </button>
        <button
          className={activeTab === "delivered" ? "active" : ""}
          onClick={() => setActiveTab("delivered")}
        >
          List of Delivered
        </button>
      </div>

      {activeTab === "forDelivery" ? (
        <>
          <div className="calibration-search">
            <select
              value={fdSearchBy}
              onChange={(e) => setFdSearchBy(e.target.value)}
            >
              {Object.keys(forDeliverySearchKeyMap).map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search..."
              value={fdSearchInput}
              onChange={(e) => setFdSearchInput(e.target.value)}
              onKeyDown={handleFdSearchKeyDown}
            />

            <button onClick={handleFdSearch}>Search</button>

            <select
              value={fdPageSize}
              onChange={(e) => setFdPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button onClick={handleAddNew}>Add New</button>
            <button onClick={handleFdRefresh}>Refresh</button>
          </div>

          <div className="calibration-table-wrapper">
            <table className="calibration-table">
              <thead>
                <tr>
                  <th>Job Number</th>
                  <th>Company Name</th>
                  <th>Company Address</th>
                  <th>Contact Info</th>
                  <th>Contact Name</th>
                  <th>Unit Delivered</th>
                  <th>Certificate Delivered</th>
                </tr>
              </thead>
              <tbody>
                {jobsLoading ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Loading...
                    </td>
                  </tr>
                ) : visibleJobs.length > 0 ? (
                  visibleJobs.map((j, idx) => (
                    <tr key={j._id || idx}>
                      <td>{j.jobNumber}</td>
                      <td>{j.companyName || "Unknown"}</td>
                      <td>{j.companyAddress || "—"}</td>
                      <td>{j.contactInfo || "—"}</td>
                      <td>{j.contactName || "—"}</td>
                      <td>{j.unitDelivered ? "Yes" : "No"}</td>
                      <td>{j.certificateDelivered ? "Yes" : "No"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {fdActiveSearch
                        ? `No results found for "${fdActiveSearch}"`
                        : "No jobs pending delivery"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="calibration-search">
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
            >
              {Object.keys(searchKeyMap).map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />

            <button onClick={handleSearch}>Search</button>

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

            <button onClick={handleAddNew}>Add New</button>
            <button onClick={handleRefresh}>Refresh</button>
          </div>

          <div className="calibration-table-wrapper">
            <table className="calibration-table">
              <thead>
                <tr>
                  <th>DR ID</th>
                  {/* <th>JR ID</th> */}
                  <th>Type</th>
                  <th>Date</th>
                  <th>Company Name</th>
                  <th>Address</th>
                  <th>Contact Info</th>
                  <th>Contact Name</th>
                  <th>Reference</th>
                  <th>Prepared By</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="no-data">
                      Loading...
                    </td>
                  </tr>
                ) : visibleRecords.length > 0 ? (
                  visibleRecords.map((r, idx) => (
                    <tr
                      key={r._id || idx}
                      onClick={() => handleRowClick(r)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{r.deliveryReceiptId}</td>
                      {/* <td>{r.jobReceiptID}</td> */}
                      <td>{r.type}</td>
                      <td>{r.date}</td>
                      <td>{r.companyName}</td>
                      <td>{r.address}</td>
                      <td>{r.contactInfo}</td>
                      <td>{r.contactName}</td>
                      <td>{r.reference}</td>
                      <td>{r.preparedBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="no-data">
                      {activeSearch
                        ? `No results found for "${activeSearch}"`
                        : "No delivery receipts yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <DeliveryTypeModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelect={handleTypeSelected}
      />

      <DeliveryReceiptUnitModal
        isOpen={showUnitModal}
        onClose={() => {
          setShowUnitModal(false);
          setPendingType(null);
        }}
        onSaved={handleUnitSaved}
        type={pendingType}
      />

      <DeliveryReceiptCertificateModal
        isOpen={showCertificateModal}
        onClose={() => {
          setShowCertificateModal(false);
          setPendingType(null);
        }}
        onSaved={handleCertificateSaved}
        type={pendingType}
      />

      {/* Row-click view (read-only), separate instances from the
          Add New flow above so their state never collides. */}
      <DeliveryReceiptUnitModal
        isOpen={viewRecord?.type === "instrument"}
        onClose={handleCloseView}
        viewRecord={viewRecord?.type === "instrument" ? viewRecord : null}
      />

      <DeliveryReceiptCertificateModal
        isOpen={viewRecord?.type === "certificate"}
        onClose={handleCloseView}
        viewRecord={viewRecord?.type === "certificate" ? viewRecord : null}
      />
    </div>
  );
};

export default DeliveryReceiptList;
