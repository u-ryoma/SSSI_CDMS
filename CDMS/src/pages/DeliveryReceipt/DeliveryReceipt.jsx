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
//   "Ref No.": "refNo",
// };

// const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

// const DeliveryReceiptList = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchBy, setSearchBy] = useState("CompanyName");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");
//   const [pageSize, setPageSize] = useState(26);

//   // Add New flow: step 1 picks the type, step 2 opens the matching form.
//   const [showTypeModal, setShowTypeModal] = useState(false);
//   const [showUnitModal, setShowUnitModal] = useState(false);
//   const [showCertificateModal, setShowCertificateModal] = useState(false);

//   useEffect(() => {
//     fetchRecords();
//   }, []);

//   // NOTE ON DATA SOURCE: it isn't settled yet whether this list should
//   // pull from jobnumbers (jobs tagged forDeliveryTagged, same pattern
//   // as the other stage pages) or from a dedicated deliveryReceipts
//   // collection once that exists. For now this defaults to the former
//   // so the page renders real data immediately - swap the body of this
//   // function for a fetch to `${API}/api/deliveryreceipts` (or whatever
//   // the collection ends up being called) once that's decided.
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
//             .filter((job) => job.forDeliveryTagged === true)
//             .map((job) => {
//               const receipt = receiptsMap[job.jobReceiptID] || {};
//               return {
//                 jobReceiptID: job.jobReceiptID,
//                 type: job.type || receipt.type || "",
//                 date: receipt.date || "",
//                 companyName: receipt.companyName || "",
//                 companyAddress: receipt.companyAddress || "",
//                 contactInfo: receipt.contactInfo || receipt.contactNumber || "",
//                 contactName: receipt.contactName || "",
//                 refNo: job.refNo || receipt.refNo || "",
//                 preparedBy: job.preparedBy || job.evalBy || "",
//               };
//             })
//         : [];

//       setRecords(merged);
//     } catch (err) {
//       console.error("Failed to fetch delivery receipt list:", err);
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

//   const visibleRecords = useMemo(
//     () => filteredRecords.slice(0, pageSize),
//     [filteredRecords, pageSize],
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

//   const handleAddNew = () => setShowTypeModal(true);

//   const handleTypeSelected = (type) => {
//     setShowTypeModal(false);
//     if (type === "instrument") {
//       setShowUnitModal(true);
//     } else {
//       setShowCertificateModal(true);
//     }
//   };

//   const handleUnitSaved = () => {
//     setShowUnitModal(false);
//     fetchRecords();
//   };

//   const handleCertificateSaved = () => {
//     setShowCertificateModal(false);
//     fetchRecords();
//   };

//   return (
//     <div className="calibration-container">
//       <div className="calibration-header">
//         <h2>DELIVERY RECEIPT</h2>
//       </div>

//       <div className="calibration-tabs">
//         <button className="active">List of Deliveries</button>
//       </div>

//       <div className="calibration-search">
//         <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
//           {Object.keys(searchKeyMap).map((label) => (
//             <option key={label} value={label}>
//               {label}
//             </option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchInput}
//           onChange={(e) => setSearchInput(e.target.value)}
//           onKeyDown={handleSearchKeyDown}
//         />

//         <button onClick={handleSearch}>Search</button>

//         <select
//           value={pageSize}
//           onChange={(e) => setPageSize(Number(e.target.value))}
//         >
//           {PAGE_SIZE_OPTIONS.map((n) => (
//             <option key={n} value={n}>
//               {n}
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
//               <th>JR ID</th>
//               <th>Type</th>
//               <th>Date</th>
//               <th>Company Name</th>
//               <th>Company Address</th>
//               <th>Contact Info</th>
//               <th>Contact Name</th>
//               <th>Ref No.</th>
//               <th>Prepared By</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="9" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : visibleRecords.length > 0 ? (
//               visibleRecords.map((r, idx) => (
//                 <tr key={idx}>
//                   <td>{r.jobReceiptID}</td>
//                   <td>{r.type}</td>
//                   <td>{r.date}</td>
//                   <td>{r.companyName}</td>
//                   <td>{r.companyAddress}</td>
//                   <td>{r.contactInfo}</td>
//                   <td>{r.contactName}</td>
//                   <td>{r.refNo}</td>
//                   <td>{r.preparedBy}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="9" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : "No delivery receipts yet"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <DeliveryTypeModal
//         isOpen={showTypeModal}
//         onClose={() => setShowTypeModal(false)}
//         onSelect={handleTypeSelected}
//       />

//       <DeliveryReceiptUnitModal
//         isOpen={showUnitModal}
//         onClose={() => setShowUnitModal(false)}
//         onSaved={handleUnitSaved}
//       />

//       <DeliveryReceiptCertificateModal
//         isOpen={showCertificateModal}
//         onClose={() => setShowCertificateModal(false)}
//         onSaved={handleCertificateSaved}
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

const PAGE_SIZE_OPTIONS = [10, 26, 50, 100];

const DeliveryReceiptList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBy, setSearchBy] = useState("CompanyName");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [pageSize, setPageSize] = useState(26);

  // Add New flow: step 1 picks the type, step 2 opens the matching form.
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [pendingType, setPendingType] = useState(null); // "instrument" | "certificate"

  useEffect(() => {
    fetchRecords();
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
  };

  const handleCertificateSaved = () => {
    setShowCertificateModal(false);
    setPendingType(null);
    fetchRecords();
  };

  return (
    <div className="calibration-container">
      <div className="calibration-header">
        <h2>DELIVERY RECEIPT</h2>
      </div>

      <div className="calibration-tabs">
        <button className="active">List of Deliveries</button>
      </div>

      <div className="calibration-search">
        <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
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
                <tr key={r._id || idx}>
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
    </div>
  );
};

export default DeliveryReceiptList;
