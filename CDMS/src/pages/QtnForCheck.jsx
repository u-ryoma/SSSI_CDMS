// import React, { useState, useEffect, useCallback } from "react";
// import "./QuotationList.css";

// const API = import.meta.env.VITE_API_URL;

// /**
//  * QtnForCheck — "Quotation For Check" list.
//  *
//  * Shows every quotation whose status is "For Checking" — i.e. records
//  * where a staff member has already run Save on AddQuotationModal with a
//  * template file attached (see AddQuotationModal's handleSaveClick, which
//  * PUTs .../upload-template and flips status server-side).
//  *
//  * Fetches straight from GET /api/quotations and filters client-side,
//  * rather than maintaining any local/hardcoded list, so a newly-saved
//  * quotation shows up here on the next fetch/refresh without any other
//  * wiring.
//  *
//  * Search field select: the three options ("Company Name", "Contact
//  * Name", "JR ID") pick which quotation field the search box matches
//  * against, rather than being literal company values to filter by.
//  * NOTE: there's no dedicated "JR ID" field on the quotation schema
//  * (customerId, companyName, address, contactInfo, reference, contactName,
//  * poNumber, remarks) — this is mapped to `reference` as the closest
//  * existing field. Swap the FIELD_MAP entry below if "JR ID" should
//  * actually reference something else (e.g. a linked job receipt number).
//  */
// const SEARCH_FIELDS = ["Company Name", "Contact Name", "JR ID"];
// const FIELD_MAP = {
//   "Company Name": "companyName",
//   "Contact Name": "contactName",
//   "JR ID": "reference",
// };

// const QtnForCheck = () => {
//   const [searchField, setSearchField] = useState(SEARCH_FIELDS[0]);
//   const [search, setSearch] = useState("");
//   const [quotations, setQuotations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchQuotations = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch(`${API}/api/quotations`);
//       if (!res.ok) throw new Error("Failed to load quotations");
//       const all = await res.json();
//       // Only show quotations currently sitting in "For Checking".
//       setQuotations(
//         (Array.isArray(all) ? all : []).filter(
//           (q) => q.status === "For Checking",
//         ),
//       );
//     } catch (err) {
//       console.error("Failed to fetch quotations:", err);
//       setError("Failed to load quotations. Please try again.");
//       setQuotations([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchQuotations();
//   }, [fetchQuotations]);

//   const filteredQuotations = quotations.filter((q) => {
//     if (!search.trim()) return true;
//     const field = FIELD_MAP[searchField];
//     const value = q[field] || "";
//     return value.toLowerCase().includes(search.toLowerCase());
//   });

//   return (
//     <div className="quotation-container">
//       {/* Header */}
//       <div className="quotation-header">
//         {/* <h1>CALIBRATION DATABASE AND MONITORING SYSTEM (CDMS)</h1> */}
//         <h2>QUOTATION FOR CHECK</h2>
//       </div>

//       {/* Tabs */}
//       <div className="quotation-tabs">
//         <button className="active">List of Quotations</button>
//         {/* <button>Add New Quotation</button> */}
//       </div>

//       {/* Search bar */}
//       <div className="quotation-search">
//         {/* <label>Search by:</label> */}
//         <select
//           value={searchField}
//           onChange={(e) => setSearchField(e.target.value)}
//         >
//           {SEARCH_FIELDS.map((field, idx) => (
//             <option key={idx} value={field}>
//               {field}
//             </option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <button onClick={fetchQuotations} disabled={loading}>
//           {loading ? "Refreshing..." : "Refresh"}
//         </button>
//       </div>

//       {error && <div className="quotation-error">{error}</div>}

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
//             {!loading && filteredQuotations.length === 0 && (
//               <tr>
//                 <td colSpan={10} className="quotation-empty">
//                   No quotations currently for checking.
//                 </td>
//               </tr>
//             )}
//             {filteredQuotations.map((q) => (
//               <tr key={q.quotationId}>
//                 <td>{q.quotationId}</td>
//                 <td>{q.date}</td>
//                 <td>{q.companyName}</td>
//                 <td>{q.address}</td>
//                 <td>{q.contactInfo}</td>
//                 <td>{q.contactName}</td>
//                 <td>{q.reference}</td>
//                 <td>{q.preparedBy}</td>
//                 <td>{q.checkedBy}</td>
//                 <td>{q.sentBy}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default QtnForCheck;
