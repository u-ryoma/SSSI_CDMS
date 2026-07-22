// import React, { useState, useEffect } from "react";
// import AddQuotationModal from "./AddQuotationModal";
// import "../QuotationList.css";

// const API = import.meta.env.VITE_API_URL;

// const QuotationList = () => {
//   const [company, setCompany] = useState("");
//   const [search, setSearch] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [quotations, setQuotations] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [nextQuotationId, setNextQuotationId] = useState("");

//   // EDIT MODE — null means "Add New" (blank form); a quotation object
//   // means the modal was opened by clicking an existing row.
//   const [selectedQuotation, setSelectedQuotation] = useState(null);
//   const [rowLoading, setRowLoading] = useState(false);

//   const currentUser = {
//     name: sessionStorage.getItem("name") || "Guest User",
//     role: sessionStorage.getItem("role") || "staff",
//   };

//   const companies = ["Company Name", "Contact Name", "JR ID"];

//   useEffect(() => {
//     fetchQuotations();
//   }, []);

//   const fetchQuotations = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/quotations`);
//       const data = await res.json();
//       setQuotations(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch quotations", err);
//       setQuotations([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredQuotations = quotations.filter(
//     (q) =>
//       (!company || q.companyName === company) &&
//       (!search ||
//         (q.reference || "").toLowerCase().includes(search.toLowerCase())),
//   );

//   // OPEN ADD QUOTATION MODAL (brand new) — reserve a preview ID from the
//   // backend first, same pattern as JobReceipt.jsx's handleOpenModal. The
//   // real ID is still generated atomically server-side on save.
//   const handleOpenModal = async () => {
//     try {
//       const res = await fetch(`${API}/api/quotations/next-id`);
//       const data = await res.json();
//       setNextQuotationId(data.nextQuotationId);
//     } catch {
//       const yr = new Date().getFullYear().toString().slice(-2);
//       setNextQuotationId(`QTN/????/${yr}`);
//     }
//     setSelectedQuotation(null);
//     setShowModal(true);
//   };

//   // OPEN EXISTING QUOTATION (row click) — loads the latest saved data from
//   // the database into the modal, same pattern as JobReceipt.jsx's
//   // handleRowClick. This is what lets Upload/View Files and Download
//   // Template work, since those need a real, permanent quotationId.
//   const handleRowClick = async (quotation) => {
//     setRowLoading(true);
//     try {
//       let fullQuotation = quotation;
//       try {
//         const res = await fetch(
//           `${API}/api/quotations/${encodeURIComponent(quotation.quotationId)}`,
//         );
//         if (res.ok) {
//           const data = await res.json();
//           if (data) fullQuotation = data;
//         }
//       } catch (err) {
//         console.warn(
//           "Falling back to cached row data (single-fetch failed):",
//           err,
//         );
//       }
//       setSelectedQuotation(fullQuotation);
//       setShowModal(true);
//     } finally {
//       setRowLoading(false);
//     }
//   };

//   // SAVE QUOTATION — POST for brand new, PUT for edits to an existing
//   // record. The server returns the real quotationId (atomic counter on
//   // create), so we trust that over the preview.
//   const handleSave = async (data) => {
//     try {
//       const isEditMode = Boolean(selectedQuotation);
//       const url = isEditMode
//         ? `${API}/api/quotations/${encodeURIComponent(selectedQuotation.quotationId)}`
//         : `${API}/api/quotations`;
//       const method = isEditMode ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       if (!res.ok) throw new Error("Failed to save quotation");
//       const result = await res.json();

//       if (result.success) {
//         await fetchQuotations();
//         setShowModal(false);
//         setSelectedQuotation(null);
//       }
//     } catch (err) {
//       console.error("Failed to save quotation:", err);
//     }
//   };

//   const handleRefresh = () => {
//     setSearch("");
//     setCompany("");
//     fetchQuotations();
//   };

//   return (
//     <div className="quotation-container">
//       {/* Header */}
//       <div className="quotation-header">
//         <h2>LIST OF QUOTATION</h2>
//       </div>

//       {/* Tabs */}
//       <div className="quotation-tabs">
//         <button className="active">List of Quotations</button>
//       </div>

//       {/* Search bar */}
//       <div className="quotation-search">
//         <select value={company} onChange={(e) => setCompany(e.target.value)}>
//           <option value="">-- Select Company --</option>
//           {companies.map((comp, idx) => (
//             <option key={idx} value={comp}>
//               {comp}
//             </option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <button onClick={handleOpenModal}>Add New</button>
//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       {/* Table */}
//       <div className="quotation-table-wrapper">
//         <table className="quotation-table">
//           <thead>
//             <tr>
//               <th>Quotation ID</th>
//               <th>Date</th>
//               <th>Company Name</th>
//               <th>Company Address</th>
//               <th>Contact Info</th>
//               <th>Contact Name</th>
//               <th>Ref No.</th>
//               <th>Prepared By</th>
//               <th>Checked By</th>
//               <th>Sent By</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="10" className="no-data">
//                   Loading...
//                 </td>
//               </tr>
//             ) : filteredQuotations.length > 0 ? (
//               filteredQuotations.map((q, idx) => (
//                 <tr
//                   key={q._id || idx}
//                   className="clickable-row"
//                   onClick={() => handleRowClick(q)}
//                 >
//                   <td>{q.quotationId}</td>
//                   <td>{q.date}</td>
//                   <td>{q.companyName}</td>
//                   <td>{q.address}</td>
//                   <td>{q.contactInfo}</td>
//                   <td>{q.contactName}</td>
//                   <td>{q.reference}</td>
//                   <td>{q.preparedBy}</td>
//                   <td>{q.checkedBy || ""}</td>
//                   <td>{q.sentBy || ""}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="10" className="no-data">
//                   No Quotations found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {rowLoading && (
//         <div className="jr-row-loading-overlay">
//           <span>Loading quotation...</span>
//         </div>
//       )}

//       {/* Add/Edit Quotation modal */}
//       {showModal && (
//         <AddQuotationModal
//           key={selectedQuotation?.quotationId || "new"}
//           onClose={() => {
//             setShowModal(false);
//             setSelectedQuotation(null);
//           }}
//           onSave={handleSave}
//           currentUser={currentUser}
//           quotationId={
//             selectedQuotation ? selectedQuotation.quotationId : nextQuotationId
//           }
//           initialData={selectedQuotation}
//           isEditMode={Boolean(selectedQuotation)}
//         />
//       )}
//     </div>
//   );
// };

// export default QuotationList;
import React, { useState, useEffect } from "react";
import AddQuotationModal from "./AddQuotationModal";
import "../QuotationList.css";

const API = import.meta.env.VITE_API_URL;

const QuotationList = () => {
  const [company, setCompany] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextQuotationId, setNextQuotationId] = useState("");

  // EDIT MODE — null means "Add New" (blank form); a quotation object
  // means the modal was opened by clicking an existing row.
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [rowLoading, setRowLoading] = useState(false);

  const currentUser = {
    name: sessionStorage.getItem("name") || "Guest User",
    role: sessionStorage.getItem("role") || "staff",
  };

  const companies = ["Company Name", "Contact Name", "JR ID"];

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/quotations`);
      const data = await res.json();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch quotations", err);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(
    (q) =>
      (!company || q.companyName === company) &&
      (!search ||
        (q.reference || "").toLowerCase().includes(search.toLowerCase())),
  );

  // Text color of a row reflects its workflow status — no separate column.
  const rowStatusClass = (status) => {
    switch (status) {
      case "For Checking":
        return "qtn-row-checking";
      case "For Sending":
        return "qtn-row-sending";
      case "Sent":
        return "qtn-row-sent";
      default:
        return "qtn-row-creating";
    }
  };

  const handleOpenModal = async () => {
    try {
      const res = await fetch(`${API}/api/quotations/next-id`);
      const data = await res.json();
      setNextQuotationId(data.nextQuotationId);
    } catch {
      const yr = new Date().getFullYear().toString().slice(-2);
      setNextQuotationId(`QTN/????/${yr}`);
    }
    setSelectedQuotation(null);
    setShowModal(true);
  };

  const handleRowClick = async (quotation) => {
    setRowLoading(true);
    try {
      let fullQuotation = quotation;
      try {
        const res = await fetch(
          `${API}/api/quotations/${encodeURIComponent(quotation.quotationId)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data) fullQuotation = data;
        }
      } catch (err) {
        console.warn(
          "Falling back to cached row data (single-fetch failed):",
          err,
        );
      }
      setSelectedQuotation(fullQuotation);
      setShowModal(true);
    } finally {
      setRowLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      const isEditMode = Boolean(selectedQuotation);
      const url = isEditMode
        ? `${API}/api/quotations/${encodeURIComponent(selectedQuotation.quotationId)}`
        : `${API}/api/quotations`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save quotation");
      const result = await res.json();

      if (result.success) {
        await fetchQuotations();
        setShowModal(false);
        setSelectedQuotation(null);
      }
    } catch (err) {
      console.error("Failed to save quotation:", err);
    }
  };

  // Called by the modal after a status-changing action (template upload,
  // signed upload, mark-sent) succeeds server-side, so the list + the open
  // modal both reflect the new status without a full modal remount.
  const handleQuotationUpdated = async (updatedQuotation) => {
    await fetchQuotations();
    setSelectedQuotation(updatedQuotation);
  };

  const handleRefresh = () => {
    setSearch("");
    setCompany("");
    fetchQuotations();
  };

  return (
    <div className="quotation-container">
      {/* Header */}
      <div className="quotation-header">
        <h2>LIST OF QUOTATION</h2>
      </div>

      {/* Tabs */}
      <div className="quotation-tabs">
        <button className="active">List of Quotations</button>
      </div>

      {/* Search bar */}
      <div className="quotation-search">
        <select value={company} onChange={(e) => setCompany(e.target.value)}>
          <option value="">-- Select Company --</option>
          {companies.map((comp, idx) => (
            <option key={idx} value={comp}>
              {comp}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={handleOpenModal}>Add New</button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      {/* Table */}
      <div className="quotation-table-wrapper">
        <table className="quotation-table">
          <thead>
            <tr>
              <th>Quotation ID</th>
              <th>Date</th>
              <th>Company Name</th>
              <th>Company Address</th>
              <th>Contact Info</th>
              <th>Contact Name</th>
              <th>Ref No.</th>
              <th>Prepared By</th>
              <th>Checked By</th>
              <th>Sent By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredQuotations.length > 0 ? (
              filteredQuotations.map((q, idx) => (
                <tr
                  key={q._id || idx}
                  className={`clickable-row ${rowStatusClass(q.status)}`}
                  onClick={() => handleRowClick(q)}
                >
                  <td>{q.quotationId}</td>
                  <td>{q.date}</td>
                  <td>{q.companyName}</td>
                  <td>{q.address}</td>
                  <td>{q.contactInfo}</td>
                  <td>{q.contactName}</td>
                  <td>{q.reference}</td>
                  <td>{q.preparedBy}</td>
                  <td>{q.checkedBy || ""}</td>
                  <td>{q.sentBy || ""}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  No Quotations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rowLoading && (
        <div className="jr-row-loading-overlay">
          <span>Loading quotation...</span>
        </div>
      )}

      {/* Add/Edit Quotation modal */}
      {showModal && (
        <AddQuotationModal
          key={selectedQuotation?.quotationId || "new"}
          onClose={() => {
            setShowModal(false);
            setSelectedQuotation(null);
          }}
          onSave={handleSave}
          onQuotationUpdated={handleQuotationUpdated}
          currentUser={currentUser}
          quotationId={
            selectedQuotation ? selectedQuotation.quotationId : nextQuotationId
          }
          initialData={selectedQuotation}
          isEditMode={Boolean(selectedQuotation)}
        />
      )}
    </div>
  );
};

export default QuotationList;
