// // import React, { useState, useEffect, useMemo } from "react";
// // import "../jobreceipt.css";
// // import AddReceiptModal from "./AddReceiptModal";
// // import CustomerLookupModal from "./CustomerLookupModal";
// // import JobNumberModal from "./JobNumberModal";
// // import InstrumentListModal from "./InstrumentListModal";
// // import RecallJobModal from "./RecallJobModal";

// // const API = import.meta.env.VITE_API_URL;

// // export const emptyForm = {
// //   jrId: "",
// //   date: new Date().toISOString().split("T")[0],
// //   customerID: "",
// //   companyName: "",
// //   companyAddress: "",
// //   contactInfo: "",
// //   vat: "",
// //   reference: "",
// //   contactName: "",
// //   preparedBy: "",
// //   remarks: "",
// // };

// // export const emptyJobForm = {
// //   jobNumber: "",
// //   jobReceiptID: "",
// //   type: "",
// //   description: "",
// //   brand: "",
// //   model: "",
// //   serialNo: "",
// //   remarks: "",
// //   concern: "",
// //   range: "",
// //   uncertainty: "",
// //   contactCert: "",
// //   frequency: "1 Year",
// //   eta: new Date().toISOString().split("T")[0],
// //   evalBy: "",
// //   priority: "Normal",
// //   voltage: "-",
// // };

// // const currentYear = new Date().getFullYear();
// // const yearOptions = Array.from({ length: 5 }, (_, i) =>
// //   (currentYear - i).toString(),
// // );

// // const searchKeyMap = {
// //   "Company Name": "companyName",
// //   "JR ID": "jrId",
// //   "Contact Name": "contactName",
// //   "Prepared By": "preparedBy",
// // };

// // const JobReceipt = () => {
// //   const [receipts, setReceipts] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [showModal, setShowModal] = useState(false);
// //   const [showLookup, setShowLookup] = useState(false);
// //   const [showJobModal, setShowJobModal] = useState(false);
// //   const [showInstrumentList, setShowInstrumentList] = useState(false);
// //   const [showRecall, setShowRecall] = useState(false);
// //   const [formData, setFormData] = useState(emptyForm);
// //   const [jobForm, setJobForm] = useState(emptyJobForm);
// //   const [jobNumbers, setJobNumbers] = useState([]);
// //   const [allJobNumbers, setAllJobNumbers] = useState([]);
// //   const [editingJobIndex, setEditingJobIndex] = useState(null);

// //   const [searchBy, setSearchBy] = useState("Company Name");
// //   const [searchInput, setSearchInput] = useState("");
// //   const [activeSearch, setActiveSearch] = useState("");
// //   const [selectedYear, setSelectedYear] = useState(currentYear.toString());

// //   const user = sessionStorage.getItem("name") || "";

// //   useEffect(() => {
// //     fetchReceipts();
// //     fetchAllJobNumbers();
// //   }, []);

// //   const fetchReceipts = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetch(`${API}/api/jobreceipts`);
// //       const data = await res.json();
// //       setReceipts(Array.isArray(data) ? data : []);
// //     } catch (err) {
// //       console.error("Failed to fetch receipts", err);
// //       setReceipts([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchAllJobNumbers = async () => {
// //     try {
// //       const res = await fetch(`${API}/api/jobnumbers`);
// //       const data = await res.json();
// //       setAllJobNumbers(Array.isArray(data) ? data : []);
// //     } catch (err) {
// //       console.error("Failed to fetch job numbers", err);
// //       setAllJobNumbers([]);
// //     }
// //   };

// //   const filteredReceipts = useMemo(() => {
// //     const yr = selectedYear.slice(-2);
// //     return receipts.filter((r) => {
// //       const jrParts = r.jrId?.split("/");
// //       const receiptYear = jrParts?.[2];
// //       if (receiptYear !== yr) return false;
// //       if (activeSearch.trim()) {
// //         const key = searchKeyMap[searchBy];
// //         return r[key]
// //           ?.toString()
// //           .toLowerCase()
// //           .includes(activeSearch.toLowerCase());
// //       }
// //       return true;
// //     });
// //   }, [receipts, selectedYear, activeSearch, searchBy]);

// //   const handleChange = (e) =>
// //     setFormData({ ...formData, [e.target.name]: e.target.value });

// //   const handleJobChange = (e) =>
// //     setJobForm({ ...jobForm, [e.target.name]: e.target.value });

// //   const handleJobTypeChange = (e) => {
// //     const newType = e.target.value;
// //     const yr = new Date().getFullYear().toString().slice(-2);
// //     const prefix = newType === "electrical" ? "SSE" : "SSS";
// //     setJobForm((prev) => ({
// //       ...prev,
// //       type: newType,
// //       jobNumber: prev.jobNumber.includes("????")
// //         ? `${prefix}/????/${yr}`
// //         : prev.jobNumber,
// //     }));
// //   };

// //   const handleSelectCustomer = (customer) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       customerID: customer.customerID,
// //       companyName: customer.companyName,
// //       companyAddress: customer.companyAddress,
// //       contactInfo: customer.phoneNumber || "",
// //       vat: customer.vat || "",
// //       contactName: customer.contactNames?.[0] || "",
// //     }));
// //     setShowLookup(false);
// //   };

// //   const handleSelectInstrument = (instrument) => {
// //     setJobForm((prev) => ({
// //       ...prev,
// //       description: instrument.description || "",
// //       range: instrument.range || "",
// //       uncertainty: instrument.uncertainty || "",
// //       remarks: instrument.remarks || "",
// //     }));
// //     setShowInstrumentList(false);
// //   };

// //   const handleUseDetails = (job) => {
// //     setJobForm((prev) => ({
// //       ...prev,
// //       description: job.description || "",
// //       brand: job.brand || "",
// //       model: job.model || "",
// //       serialNo: job.serialNo || "",
// //       remarks: job.remarks || "",
// //       concern: job.concern || "",
// //       range: job.range || "",
// //       uncertainty: job.uncertainty || "",
// //       contactCert: job.contactCert || "",
// //       frequency: job.frequency || "1 Year",
// //       evalBy: job.evalBy || "",
// //       priority: job.priority || "Normal",
// //       voltage: job.voltage || "-",
// //     }));
// //     setShowRecall(false);
// //   };

// //   // OPEN NEW JOB NUMBER
// //   const handleOpenJobNumber = () => {
// //     const yr = new Date().getFullYear().toString().slice(-2);
// //     setEditingJobIndex(null);
// //     setJobForm({
// //       ...emptyJobForm,
// //       jobNumber: `SSS/????/${yr}`,
// //       eta: new Date().toISOString().split("T")[0],
// //     });
// //     setShowJobModal(true);
// //   };

// //   // OPEN EXISTING JOB NUMBER FOR EDITING
// //   const handleEditJobNumber = (index) => {
// //     setEditingJobIndex(index);
// //     setJobForm({ ...jobNumbers[index] });
// //     setShowJobModal(true);
// //   };

// //   // SAVE JOB NUMBER - update existing or add new
// //   const handleSaveJobNumber = () => {
// //     if (editingJobIndex !== null) {
// //       setJobNumbers((prev) =>
// //         prev.map((job, i) => (i === editingJobIndex ? { ...jobForm } : job)),
// //       );
// //       setEditingJobIndex(null);
// //     } else {
// //       setJobNumbers((prev) => [...prev, { ...jobForm }]);
// //     }
// //     setShowJobModal(false);
// //   };

// //   // CANCEL (REMOVE) JOB NUMBER FROM LIST
// //   const handleCancelJobNumber = () => {
// //     if (editingJobIndex === null) return;
// //     setJobNumbers((prev) => prev.filter((_, i) => i !== editingJobIndex));
// //     setEditingJobIndex(null);
// //     setShowJobModal(false);
// //   };

// //   // OPEN ADD RECEIPT MODAL
// //   const handleOpenModal = async () => {
// //     try {
// //       const res = await fetch(`${API}/api/jobreceipts/next-id`);
// //       const data = await res.json();
// //       setFormData({
// //         ...emptyForm,
// //         jrId: data.nextJrId,
// //         date: new Date().toISOString().split("T")[0],
// //         preparedBy: user,
// //       });
// //     } catch {
// //       const yr = new Date().getFullYear().toString().slice(-2);
// //       setFormData({
// //         ...emptyForm,
// //         jrId: `JR/????/${yr}`,
// //         date: new Date().toISOString().split("T")[0],
// //         preparedBy: user,
// //       });
// //     }
// //     setJobNumbers([]);
// //     setEditingJobIndex(null);
// //     setShowModal(true);
// //   };

// //   // SAVE RECEIPT + ALL JOB NUMBERS
// //   const handleSave = async () => {
// //     try {
// //       const res = await fetch(`${API}/api/jobreceipts`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ ...formData, jobNumbers: [] }),
// //       });
// //       if (!res.ok) throw new Error("Failed to save receipt");
// //       const data = await res.json();

// //       if (data.success) {
// //         const savedJrId = data.jrId;
// //         const savedJobs = [];

// //         for (const job of jobNumbers) {
// //           const jobRes = await fetch(`${API}/api/jobnumbers`, {
// //             method: "POST",
// //             headers: { "Content-Type": "application/json" },
// //             body: JSON.stringify({
// //               ...job,
// //               jobReceiptID: savedJrId,
// //               type: job.type,
// //             }),
// //           });
// //           const jobData = await jobRes.json();
// //           if (jobData.success) {
// //             savedJobs.push({ ...job, jobNumber: jobData.jobNumber });
// //           }
// //         }

// //         setAllJobNumbers((prev) => [...prev, ...savedJobs]);
// //         await fetchReceipts();
// //         setFormData(emptyForm);
// //         setJobNumbers([]);
// //         setShowModal(false);
// //       }
// //     } catch (err) {
// //       console.error("Failed to save receipt and job numbers:", err);
// //     }
// //   };

// //   const handleSearch = () => setActiveSearch(searchInput);

// //   const handleSearchKeyDown = (e) => {
// //     if (e.key === "Enter") handleSearch();
// //   };

// //   const handleRefresh = () => {
// //     setSearchInput("");
// //     setActiveSearch("");
// //     setSearchBy("Company Name");
// //     setSelectedYear(currentYear.toString());
// //     fetchReceipts();
// //   };

// //   return (
// //     <div className="receipt-container">
// //       <div className="receipt-header">
// //         <h2>JOB RECEIPT</h2>
// //       </div>

// //       <div className="receipt-tabs">
// //         <button className="active">Job Receipt List</button>
// //       </div>

// //       <div className="search-bar">
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

// //         <select
// //           value={selectedYear}
// //           onChange={(e) => {
// //             setSelectedYear(e.target.value);
// //             setActiveSearch("");
// //             setSearchInput("");
// //           }}
// //         >
// //           {yearOptions.map((yr) => (
// //             <option key={yr} value={yr}>
// //               {yr}
// //             </option>
// //           ))}
// //         </select>

// //         <button onClick={handleOpenModal}>Add New</button>
// //         <button onClick={handleRefresh}>Refresh</button>
// //       </div>

// //       <div className="search-results-info">
// //         <span>
// //           Showing <strong>{filteredReceipts.length}</strong> of{" "}
// //           <strong>{receipts.length}</strong> records for{" "}
// //           <strong>{selectedYear}</strong>
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

// //       <div className="table-wrapper">
// //         <table className="receipt-table">
// //           <thead>
// //             <tr>
// //               <th>JR ID</th>
// //               <th>Date</th>
// //               <th>Company Name</th>
// //               <th>Company Address</th>
// //               <th>Contact Info</th>
// //               <th>Contact Name</th>
// //               <th>VAT</th>
// //               <th>Reference</th>
// //               <th>Prepared By</th>
// //               <th>Remarks</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {loading ? (
// //               <tr>
// //                 <td colSpan="10" className="no-data">
// //                   Loading...
// //                 </td>
// //               </tr>
// //             ) : filteredReceipts.length > 0 ? (
// //               filteredReceipts.map((receipt, index) => (
// //                 <tr key={receipt._id || index} className="clickable-row">
// //                   <td>{receipt.jrId}</td>
// //                   <td>{receipt.date}</td>
// //                   <td>{receipt.companyName}</td>
// //                   <td>{receipt.companyAddress}</td>
// //                   <td>{receipt.contactInfo}</td>
// //                   <td>{receipt.contactName}</td>
// //                   <td>{receipt.vat}</td>
// //                   <td>{receipt.reference}</td>
// //                   <td>{receipt.preparedBy}</td>
// //                   <td>{receipt.remarks}</td>
// //                 </tr>
// //               ))
// //             ) : (
// //               <tr>
// //                 <td colSpan="10" className="no-data">
// //                   {activeSearch
// //                     ? `No results found for "${activeSearch}"`
// //                     : `No Job Receipts found for ${selectedYear}`}
// //                 </td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>

// //       {showModal && (
// //         <AddReceiptModal
// //           onClose={() => setShowModal(false)}
// //           onSave={handleSave}
// //           formData={formData}
// //           onChange={handleChange}
// //           onOpenLookup={() => setShowLookup(true)}
// //           onOpenJobNumber={handleOpenJobNumber}
// //           onEditJobNumber={handleEditJobNumber}
// //           user={user}
// //           jobNumbers={jobNumbers}
// //         />
// //       )}

// //       {showLookup && (
// //         <CustomerLookupModal
// //           onClose={() => setShowLookup(false)}
// //           onSelect={handleSelectCustomer}
// //         />
// //       )}

// //       {showJobModal && (
// //         <JobNumberModal
// //           onClose={() => {
// //             setShowJobModal(false);
// //             setEditingJobIndex(null);
// //           }}
// //           onSave={handleSaveJobNumber}
// //           onCancel={handleCancelJobNumber}
// //           jobForm={jobForm}
// //           onJobChange={handleJobChange}
// //           onJobTypeChange={handleJobTypeChange}
// //           jobReceiptID={formData.jrId}
// //           onOpenInstrumentList={() => setShowInstrumentList(true)}
// //           onOpenRecall={() => setShowRecall(true)}
// //           isEditing={editingJobIndex !== null}
// //         />
// //       )}

// //       {showInstrumentList && (
// //         <InstrumentListModal
// //           onClose={() => setShowInstrumentList(false)}
// //           onSelect={handleSelectInstrument}
// //         />
// //       )}

// //       {showRecall && (
// //         <RecallJobModal
// //           onClose={() => setShowRecall(false)}
// //           onUseDetails={handleUseDetails}
// //           savedJobNumbers={allJobNumbers}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default JobReceipt;
// import React, { useState, useEffect, useMemo } from "react";
// import "../jobreceipt.css";
// import AddReceiptModal from "./AddReceiptModal";
// import CustomerLookupModal from "./CustomerLookupModal";
// import JobNumberModal from "./JobNumberModal";
// import InstrumentListModal from "./InstrumentListModal";
// import RecallJobModal from "./RecallJobModal";

// const API = import.meta.env.VITE_API_URL;

// export const emptyForm = {
//   jrId: "",
//   date: new Date().toISOString().split("T")[0],
//   customerID: "",
//   companyName: "",
//   companyAddress: "",
//   contactInfo: "",
//   vat: "",
//   reference: "",
//   contactName: "",
//   preparedBy: "",
//   remarks: "",
// };

// export const emptyJobForm = {
//   jobNumber: "",
//   jobReceiptID: "",
//   type: "",
//   description: "",
//   brand: "",
//   model: "",
//   serialNo: "",
//   remarks: "",
//   concern: "",
//   range: "",
//   uncertainty: "",
//   contactCert: "",
//   frequency: "1 Year",
//   eta: new Date().toISOString().split("T")[0],
//   evalBy: "",
//   priority: "Normal",
//   voltage: "-",
// };

// const currentYear = new Date().getFullYear();
// const yearOptions = Array.from({ length: 5 }, (_, i) =>
//   (currentYear - i).toString(),
// );

// const searchKeyMap = {
//   "Company Name": "companyName",
//   "JR ID": "jrId",
//   "Contact Name": "contactName",
//   "Prepared By": "preparedBy",
// };

// const JobReceipt = () => {
//   const [receipts, setReceipts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [showLookup, setShowLookup] = useState(false);
//   const [showJobModal, setShowJobModal] = useState(false);
//   const [showInstrumentList, setShowInstrumentList] = useState(false);
//   const [showRecall, setShowRecall] = useState(false);
//   const [formData, setFormData] = useState(emptyForm);
//   const [jobForm, setJobForm] = useState(emptyJobForm);
//   const [jobNumbers, setJobNumbers] = useState([]);
//   const [allJobNumbers, setAllJobNumbers] = useState([]);
//   const [editingJobIndex, setEditingJobIndex] = useState(null);
//   const [reservingNumber, setReservingNumber] = useState(false);

//   const [searchBy, setSearchBy] = useState("Company Name");
//   const [searchInput, setSearchInput] = useState("");
//   const [activeSearch, setActiveSearch] = useState("");
//   const [selectedYear, setSelectedYear] = useState(currentYear.toString());

//   const user = sessionStorage.getItem("name") || "";

//   useEffect(() => {
//     fetchReceipts();
//     fetchAllJobNumbers();
//   }, []);

//   const fetchReceipts = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/jobreceipts`);
//       const data = await res.json();
//       setReceipts(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch receipts", err);
//       setReceipts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAllJobNumbers = async () => {
//     try {
//       const res = await fetch(`${API}/api/jobnumbers`);
//       const data = await res.json();
//       setAllJobNumbers(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch job numbers", err);
//       setAllJobNumbers([]);
//     }
//   };

//   const filteredReceipts = useMemo(() => {
//     const yr = selectedYear.slice(-2);
//     return receipts.filter((r) => {
//       const jrParts = r.jrId?.split("/");
//       const receiptYear = jrParts?.[2];
//       if (receiptYear !== yr) return false;
//       if (activeSearch.trim()) {
//         const key = searchKeyMap[searchBy];
//         return r[key]
//           ?.toString()
//           .toLowerCase()
//           .includes(activeSearch.toLowerCase());
//       }
//       return true;
//     });
//   }, [receipts, selectedYear, activeSearch, searchBy]);

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleJobChange = (e) =>
//     setJobForm({ ...jobForm, [e.target.name]: e.target.value });

//   // TYPE CHANGE — reserves a real job number from the server for the chosen type
//   const handleJobTypeChange = async (e) => {
//     const newType = e.target.value;

//     // reflect the radio selection immediately
//     setJobForm((prev) => ({ ...prev, type: newType }));

//     // don't re-reserve a number when editing an already-saved job
//     if (editingJobIndex !== null) return;

//     setReservingNumber(true);
//     try {
//       const res = await fetch(`${API}/api/jobnumbers/reserve`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ type: newType }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setJobForm((prev) => ({ ...prev, jobNumber: data.jobNumber }));
//       } else {
//         console.error("Failed to reserve job number:", data.message);
//       }
//     } catch (err) {
//       console.error("Failed to reserve job number:", err);
//     } finally {
//       setReservingNumber(false);
//     }
//   };

//   const handleSelectCustomer = (customer) => {
//     setFormData((prev) => ({
//       ...prev,
//       customerID: customer.customerID,
//       companyName: customer.companyName,
//       companyAddress: customer.companyAddress,
//       contactInfo: customer.phoneNumber || "",
//       vat: customer.vat || "",
//       contactName: customer.contactNames?.[0] || "",
//     }));
//     setShowLookup(false);
//   };

//   const handleSelectInstrument = (instrument) => {
//     setJobForm((prev) => ({
//       ...prev,
//       description: instrument.description || "",
//       range: instrument.range || "",
//       uncertainty: instrument.uncertainty || "",
//       remarks: instrument.remarks || "",
//     }));
//     setShowInstrumentList(false);
//   };

//   const handleUseDetails = (job) => {
//     setJobForm((prev) => ({
//       ...prev,
//       description: job.description || "",
//       brand: job.brand || "",
//       model: job.model || "",
//       serialNo: job.serialNo || "",
//       remarks: job.remarks || "",
//       concern: job.concern || "",
//       range: job.range || "",
//       uncertainty: job.uncertainty || "",
//       contactCert: job.contactCert || "",
//       frequency: job.frequency || "1 Year",
//       evalBy: job.evalBy || "",
//       priority: job.priority || "Normal",
//       voltage: job.voltage || "-",
//     }));
//     setShowRecall(false);
//   };

//   // OPEN NEW JOB NUMBER — blank type, blank job number until user picks a type
//   const handleOpenJobNumber = () => {
//     setEditingJobIndex(null);
//     setJobForm({
//       ...emptyJobForm,
//       eta: new Date().toISOString().split("T")[0],
//     });
//     setShowJobModal(true);
//   };

//   // OPEN EXISTING JOB NUMBER FOR EDITING
//   const handleEditJobNumber = (index) => {
//     setEditingJobIndex(index);
//     setJobForm({ ...jobNumbers[index] });
//     setShowJobModal(true);
//   };

//   // SAVE JOB NUMBER - update existing or add new
//   const handleSaveJobNumber = () => {
//     if (editingJobIndex !== null) {
//       setJobNumbers((prev) =>
//         prev.map((job, i) => (i === editingJobIndex ? { ...jobForm } : job)),
//       );
//       setEditingJobIndex(null);
//     } else {
//       setJobNumbers((prev) => [...prev, { ...jobForm }]);
//     }
//     setShowJobModal(false);
//   };

//   // CANCEL (REMOVE) JOB NUMBER FROM LIST
//   const handleCancelJobNumber = () => {
//     if (editingJobIndex === null) return;
//     setJobNumbers((prev) => prev.filter((_, i) => i !== editingJobIndex));
//     setEditingJobIndex(null);
//     setShowJobModal(false);
//   };

//   // OPEN ADD RECEIPT MODAL
//   const handleOpenModal = async () => {
//     try {
//       const res = await fetch(`${API}/api/jobreceipts/next-id`);
//       const data = await res.json();
//       setFormData({
//         ...emptyForm,
//         jrId: data.nextJrId,
//         date: new Date().toISOString().split("T")[0],
//         preparedBy: user,
//       });
//     } catch {
//       const yr = new Date().getFullYear().toString().slice(-2);
//       setFormData({
//         ...emptyForm,
//         jrId: `JR/????/${yr}`,
//         date: new Date().toISOString().split("T")[0],
//         preparedBy: user,
//       });
//     }
//     setJobNumbers([]);
//     setEditingJobIndex(null);
//     setShowModal(true);
//   };

//   // SAVE RECEIPT + ALL JOB NUMBERS
//   const handleSave = async () => {
//     try {
//       const res = await fetch(`${API}/api/jobreceipts`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...formData, jobNumbers: [] }),
//       });
//       if (!res.ok) throw new Error("Failed to save receipt");
//       const data = await res.json();

//       if (data.success) {
//         const savedJrId = data.jrId;
//         const savedJobs = [];

//         for (const job of jobNumbers) {
//           const jobRes = await fetch(`${API}/api/jobnumbers`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               ...job,
//               jobReceiptID: savedJrId,
//               type: job.type,
//             }),
//           });
//           const jobData = await jobRes.json();
//           if (jobData.success) {
//             savedJobs.push({ ...job, jobNumber: jobData.jobNumber });
//           }
//         }

//         setAllJobNumbers((prev) => [...prev, ...savedJobs]);
//         await fetchReceipts();
//         setFormData(emptyForm);
//         setJobNumbers([]);
//         setShowModal(false);
//       }
//     } catch (err) {
//       console.error("Failed to save receipt and job numbers:", err);
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
//     fetchReceipts();
//   };

//   return (
//     <div className="receipt-container">
//       <div className="receipt-header">
//         <h2>JOB RECEIPT</h2>
//       </div>

//       <div className="receipt-tabs">
//         <button className="active">Job Receipt List</button>
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

//         <button onClick={handleOpenModal}>Add New</button>
//         <button onClick={handleRefresh}>Refresh</button>
//       </div>

//       <div className="search-results-info">
//         <span>
//           Showing <strong>{filteredReceipts.length}</strong> of{" "}
//           <strong>{receipts.length}</strong> records for{" "}
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

//       <div className="table-wrapper">
//         <table className="receipt-table">
//           <thead>
//             <tr>
//               <th>JR ID</th>
//               <th>Date</th>
//               <th>Company Name</th>
//               <th>Company Address</th>
//               <th>Contact Info</th>
//               <th>Contact Name</th>
//               <th>VAT</th>
//               <th>Reference</th>
//               <th>Prepared By</th>
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
//             ) : filteredReceipts.length > 0 ? (
//               filteredReceipts.map((receipt, index) => (
//                 <tr key={receipt._id || index} className="clickable-row">
//                   <td>{receipt.jrId}</td>
//                   <td>{receipt.date}</td>
//                   <td>{receipt.companyName}</td>
//                   <td>{receipt.companyAddress}</td>
//                   <td>{receipt.contactInfo}</td>
//                   <td>{receipt.contactName}</td>
//                   <td>{receipt.vat}</td>
//                   <td>{receipt.reference}</td>
//                   <td>{receipt.preparedBy}</td>
//                   <td>{receipt.remarks}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="10" className="no-data">
//                   {activeSearch
//                     ? `No results found for "${activeSearch}"`
//                     : `No Job Receipts found for ${selectedYear}`}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showModal && (
//         <AddReceiptModal
//           onClose={() => setShowModal(false)}
//           onSave={handleSave}
//           formData={formData}
//           onChange={handleChange}
//           onOpenLookup={() => setShowLookup(true)}
//           onOpenJobNumber={handleOpenJobNumber}
//           onEditJobNumber={handleEditJobNumber}
//           user={user}
//           jobNumbers={jobNumbers}
//         />
//       )}

//       {showLookup && (
//         <CustomerLookupModal
//           onClose={() => setShowLookup(false)}
//           onSelect={handleSelectCustomer}
//         />
//       )}

//       {showJobModal && (
//         <JobNumberModal
//           onClose={() => {
//             setShowJobModal(false);
//             setEditingJobIndex(null);
//           }}
//           onSave={handleSaveJobNumber}
//           onCancel={handleCancelJobNumber}
//           jobForm={jobForm}
//           onJobChange={handleJobChange}
//           onJobTypeChange={handleJobTypeChange}
//           jobReceiptID={formData.jrId}
//           onOpenInstrumentList={() => setShowInstrumentList(true)}
//           onOpenRecall={() => setShowRecall(true)}
//           isEditing={editingJobIndex !== null}
//           reservingNumber={reservingNumber}
//         />
//       )}

//       {showInstrumentList && (
//         <InstrumentListModal
//           onClose={() => setShowInstrumentList(false)}
//           onSelect={handleSelectInstrument}
//         />
//       )}

//       {showRecall && (
//         <RecallJobModal
//           onClose={() => setShowRecall(false)}
//           onUseDetails={handleUseDetails}
//           savedJobNumbers={allJobNumbers}
//         />
//       )}
//     </div>
//   );
// };

// export default JobReceipt;
import React, { useState, useEffect, useMemo } from "react";
import "../jobreceipt.css";
import AddReceiptModal from "./AddReceiptModal";
import CustomerLookupModal from "./CustomerLookupModal";
import JobNumberModal from "./JobNumberModal";
import InstrumentListModal from "./InstrumentListModal";
import RecallJobModal from "./RecallJobModal";

const API = import.meta.env.VITE_API_URL;

export const emptyForm = {
  jrId: "",
  date: new Date().toISOString().split("T")[0],
  customerID: "",
  companyName: "",
  companyAddress: "",
  contactInfo: "",
  vat: "",
  reference: "",
  contactName: "",
  preparedBy: "",
  remarks: "",
};

export const emptyJobForm = {
  jobNumber: "",
  jobReceiptID: "",
  type: "",
  description: "",
  brand: "",
  model: "",
  serialNo: "",
  remarks: "",
  concern: "",
  range: "",
  uncertainty: "",
  contactCert: "",
  frequency: "1 Year",
  eta: new Date().toISOString().split("T")[0],
  evalBy: "",
  priority: "Normal",
  voltage: "-",
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) =>
  (currentYear - i).toString(),
);

const searchKeyMap = {
  "Company Name": "companyName",
  "JR ID": "jrId",
  "Contact Name": "contactName",
  "Prepared By": "preparedBy",
};

const JobReceipt = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showInstrumentList, setShowInstrumentList] = useState(false);
  const [showRecall, setShowRecall] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [jobNumbers, setJobNumbers] = useState([]);
  const [allJobNumbers, setAllJobNumbers] = useState([]);
  const [editingJobIndex, setEditingJobIndex] = useState(null);
  const [reservingNumber, setReservingNumber] = useState(false);
  const [contactOptions, setContactOptions] = useState([]);

  const [searchBy, setSearchBy] = useState("Company Name");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const user = sessionStorage.getItem("name") || "";

  useEffect(() => {
    fetchReceipts();
    fetchAllJobNumbers();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/jobreceipts`);
      const data = await res.json();
      setReceipts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch receipts", err);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllJobNumbers = async () => {
    try {
      const res = await fetch(`${API}/api/jobnumbers`);
      const data = await res.json();
      setAllJobNumbers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch job numbers", err);
      setAllJobNumbers([]);
    }
  };

  // FETCH A CUSTOMER'S CONTACT LIST BY CUSTOMER ID (used when typed manually)
  const fetchContactsByCustomerID = async (customerID) => {
    if (!customerID?.trim()) {
      setContactOptions([]);
      return;
    }
    try {
      const res = await fetch(
        `${API}/api/customers/${encodeURIComponent(customerID)}`,
      );
      if (!res.ok) {
        setContactOptions([]);
        return;
      }
      const customer = await res.json();
      const contacts = customer?.contactNames || [];
      setContactOptions(contacts);
      setFormData((prev) => ({
        ...prev,
        contactName: contacts.includes(prev.contactName)
          ? prev.contactName
          : contacts[0] || "",
      }));
    } catch (err) {
      console.error("Failed to fetch customer contacts:", err);
      setContactOptions([]);
    }
  };

  const filteredReceipts = useMemo(() => {
    const yr = selectedYear.slice(-2);
    return receipts.filter((r) => {
      const jrParts = r.jrId?.split("/");
      const receiptYear = jrParts?.[2];
      if (receiptYear !== yr) return false;
      if (activeSearch.trim()) {
        const key = searchKeyMap[searchBy];
        return r[key]
          ?.toString()
          .toLowerCase()
          .includes(activeSearch.toLowerCase());
      }
      return true;
    });
  }, [receipts, selectedYear, activeSearch, searchBy]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleJobChange = (e) =>
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });

  // TYPE CHANGE — reserves a real job number from the server for the chosen type
  const handleJobTypeChange = async (e) => {
    const newType = e.target.value;

    setJobForm((prev) => ({ ...prev, type: newType }));

    if (editingJobIndex !== null) return;

    setReservingNumber(true);
    try {
      const res = await fetch(`${API}/api/jobnumbers/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType }),
      });
      const data = await res.json();
      if (data.success) {
        setJobForm((prev) => ({ ...prev, jobNumber: data.jobNumber }));
      } else {
        console.error("Failed to reserve job number:", data.message);
      }
    } catch (err) {
      console.error("Failed to reserve job number:", err);
    } finally {
      setReservingNumber(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    const contacts = customer.contactNames || [];
    setFormData((prev) => ({
      ...prev,
      customerID: customer.customerID,
      companyName: customer.companyName,
      companyAddress: customer.companyAddress,
      contactInfo: customer.phoneNumber || "",
      vat: customer.vat || "",
      contactName: contacts[0] || "",
    }));
    setContactOptions(contacts);
    setShowLookup(false);
  };

  const handleSelectInstrument = (instrument) => {
    setJobForm((prev) => ({
      ...prev,
      description: instrument.description || "",
      range: instrument.range || "",
      uncertainty: instrument.uncertainty || "",
      remarks: instrument.remarks || "",
    }));
    setShowInstrumentList(false);
  };

  const handleUseDetails = (job) => {
    setJobForm((prev) => ({
      ...prev,
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
      evalBy: job.evalBy || "",
      priority: job.priority || "Normal",
      voltage: job.voltage || "-",
    }));
    setShowRecall(false);
  };

  // OPEN NEW JOB NUMBER — blank type, blank job number until user picks a type
  const handleOpenJobNumber = () => {
    setEditingJobIndex(null);
    setJobForm({
      ...emptyJobForm,
      eta: new Date().toISOString().split("T")[0],
    });
    setShowJobModal(true);
  };

  // OPEN EXISTING JOB NUMBER FOR EDITING
  const handleEditJobNumber = (index) => {
    setEditingJobIndex(index);
    setJobForm({ ...jobNumbers[index] });
    setShowJobModal(true);
  };

  // SAVE JOB NUMBER - update existing or add new
  const handleSaveJobNumber = () => {
    if (editingJobIndex !== null) {
      setJobNumbers((prev) =>
        prev.map((job, i) => (i === editingJobIndex ? { ...jobForm } : job)),
      );
      setEditingJobIndex(null);
    } else {
      setJobNumbers((prev) => [...prev, { ...jobForm }]);
    }
    setShowJobModal(false);
  };

  // CANCEL (REMOVE) JOB NUMBER FROM LIST
  const handleCancelJobNumber = () => {
    if (editingJobIndex === null) return;
    setJobNumbers((prev) => prev.filter((_, i) => i !== editingJobIndex));
    setEditingJobIndex(null);
    setShowJobModal(false);
  };

  // OPEN ADD RECEIPT MODAL
  const handleOpenModal = async () => {
    try {
      const res = await fetch(`${API}/api/jobreceipts/next-id`);
      const data = await res.json();
      setFormData({
        ...emptyForm,
        jrId: data.nextJrId,
        date: new Date().toISOString().split("T")[0],
        preparedBy: user,
      });
    } catch {
      const yr = new Date().getFullYear().toString().slice(-2);
      setFormData({
        ...emptyForm,
        jrId: `JR/????/${yr}`,
        date: new Date().toISOString().split("T")[0],
        preparedBy: user,
      });
    }
    setJobNumbers([]);
    setEditingJobIndex(null);
    setContactOptions([]);
    setShowModal(true);
  };

  // SAVE RECEIPT + ALL JOB NUMBERS
  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/api/jobreceipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, jobNumbers: [] }),
      });
      if (!res.ok) throw new Error("Failed to save receipt");
      const data = await res.json();

      if (data.success) {
        const savedJrId = data.jrId;
        const savedJobs = [];

        for (const job of jobNumbers) {
          const jobRes = await fetch(`${API}/api/jobnumbers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...job,
              jobReceiptID: savedJrId,
              type: job.type,
            }),
          });
          const jobData = await jobRes.json();
          if (jobData.success) {
            savedJobs.push({ ...job, jobNumber: jobData.jobNumber });
          }
        }

        setAllJobNumbers((prev) => [...prev, ...savedJobs]);
        await fetchReceipts();
        setFormData(emptyForm);
        setJobNumbers([]);
        setContactOptions([]);
        setShowModal(false);
      }
    } catch (err) {
      console.error("Failed to save receipt and job numbers:", err);
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
    fetchReceipts();
  };

  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <h2>JOB RECEIPT</h2>
      </div>

      <div className="receipt-tabs">
        <button className="active">Job Receipt List</button>
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

        <button onClick={handleOpenModal}>Add New</button>
        <button onClick={handleRefresh}>Refresh</button>
      </div>

      <div className="search-results-info">
        <span>
          Showing <strong>{filteredReceipts.length}</strong> of{" "}
          <strong>{receipts.length}</strong> records for{" "}
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

      <div className="table-wrapper">
        <table className="receipt-table">
          <thead>
            <tr>
              <th>JR ID</th>
              <th>Date</th>
              <th>Company Name</th>
              <th>Company Address</th>
              <th>Contact Info</th>
              <th>Contact Name</th>
              <th>VAT</th>
              <th>Reference</th>
              <th>Prepared By</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="no-data">
                  Loading...
                </td>
              </tr>
            ) : filteredReceipts.length > 0 ? (
              filteredReceipts.map((receipt, index) => (
                <tr key={receipt._id || index} className="clickable-row">
                  <td>{receipt.jrId}</td>
                  <td>{receipt.date}</td>
                  <td>{receipt.companyName}</td>
                  <td>{receipt.companyAddress}</td>
                  <td>{receipt.contactInfo}</td>
                  <td>{receipt.contactName}</td>
                  <td>{receipt.vat}</td>
                  <td>{receipt.reference}</td>
                  <td>{receipt.preparedBy}</td>
                  <td>{receipt.remarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  {activeSearch
                    ? `No results found for "${activeSearch}"`
                    : `No Job Receipts found for ${selectedYear}`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddReceiptModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          formData={formData}
          onChange={handleChange}
          onOpenLookup={() => setShowLookup(true)}
          onOpenJobNumber={handleOpenJobNumber}
          onEditJobNumber={handleEditJobNumber}
          user={user}
          jobNumbers={jobNumbers}
          contactOptions={contactOptions}
          onCustomerIDBlur={fetchContactsByCustomerID}
        />
      )}

      {showLookup && (
        <CustomerLookupModal
          onClose={() => setShowLookup(false)}
          onSelect={handleSelectCustomer}
        />
      )}

      {showJobModal && (
        <JobNumberModal
          onClose={() => {
            setShowJobModal(false);
            setEditingJobIndex(null);
          }}
          onSave={handleSaveJobNumber}
          onCancel={handleCancelJobNumber}
          jobForm={jobForm}
          onJobChange={handleJobChange}
          onJobTypeChange={handleJobTypeChange}
          jobReceiptID={formData.jrId}
          onOpenInstrumentList={() => setShowInstrumentList(true)}
          onOpenRecall={() => setShowRecall(true)}
          isEditing={editingJobIndex !== null}
          reservingNumber={reservingNumber}
        />
      )}

      {showInstrumentList && (
        <InstrumentListModal
          onClose={() => setShowInstrumentList(false)}
          onSelect={handleSelectInstrument}
        />
      )}

      {showRecall && (
        <RecallJobModal
          onClose={() => setShowRecall(false)}
          onUseDetails={handleUseDetails}
          savedJobNumbers={allJobNumbers}
        />
      )}
    </div>
  );
};

export default JobReceipt;
