// import React, { useState, useEffect } from "react";
// import { createPortal } from "react-dom";
// import "./jobreceipt.css";

// const API = import.meta.env.VITE_API_URL;

// const emptyForm = {
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
//   type: "mechanical",
// };

// const emptyJobForm = {
//   jobNumber: "",
//   jobReceiptID: "",
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

// // =====================
// // RECALL JOB NUMBER MODAL
// // =====================
// const RecallJobModal = ({ onClose, onUseDetails, savedJobNumbers }) => {
//   const currentYr = new Date().getFullYear();
//   const yearOptions = Array.from({ length: 6 }, (_, i) =>
//     (currentYr - i).toString().slice(-2),
//   );

//   const [prefix, setPrefix] = useState("SSS");
//   const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
//   const [jobNumberInput, setJobNumberInput] = useState("");
//   const [selectedJob, setSelectedJob] = useState(null);

//   // Filter saved job numbers by prefix and year
//   const filtered = savedJobNumbers.filter((job) => {
//     const parts = job.jobNumber?.split("/");
//     if (!parts || parts.length < 3) return false;
//     return parts[0] === prefix && parts[2] === selectedYear;
//   });

//   const handleRowClick = (job) => {
//     setSelectedJob(job);
//     setJobNumberInput(job.jobNumber);
//   };

//   const handleUseDetails = () => {
//     if (!selectedJob) return;
//     onUseDetails(selectedJob);
//   };

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <div
//         className="recall-modal-wrapper"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* FIXED HEADER */}
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">RECALL JOB NUMBER</span>
//               <span className="jr-modal-title-sub">
//                 SCIENTIFIC STANDARDS SERVICES
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         {/* CONTENT */}
//         <div className="recall-content">
//           {/* FILTER ROW */}
//           <div className="recall-filter-row">
//             {/* PREFIX DROPDOWN */}
//             <select
//               className="recall-select"
//               value={prefix}
//               onChange={(e) => {
//                 setPrefix(e.target.value);
//                 setSelectedJob(null);
//                 setJobNumberInput("");
//               }}
//             >
//               <option value="SSS">SSS</option>
//               <option value="SSE">SSE</option>
//             </select>

//             {/* JOB NUMBER INPUT */}
//             <input
//               type="text"
//               className="recall-input"
//               placeholder="Job number..."
//               value={jobNumberInput}
//               onChange={(e) => setJobNumberInput(e.target.value)}
//             />

//             {/* YEAR DROPDOWN */}
//             <select
//               className="recall-select"
//               value={selectedYear}
//               onChange={(e) => {
//                 setSelectedYear(e.target.value);
//                 setSelectedJob(null);
//                 setJobNumberInput("");
//               }}
//             >
//               {yearOptions.map((yr) => (
//                 <option key={yr} value={yr}>
//                   {yr}
//                 </option>
//               ))}
//             </select>

//             {/* SEARCH BUTTON */}
//             <button className="recall-search-btn" title="Search">
//               🔍
//             </button>
//           </div>

//           {/* JOB LIST TABLE */}
//           <div className="recall-table-wrapper">
//             <table className="recall-table">
//               <thead>
//                 <tr>
//                   <th>Job Number</th>
//                   <th>Description</th>
//                   <th>Brand</th>
//                   <th>Model</th>
//                   <th>Serial No.</th>
//                   <th>Range</th>
//                   <th>Uncertainty</th>
//                   <th>Remarks</th>
//                   <th>Priority</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.length > 0 ? (
//                   filtered.map((job, index) => (
//                     <tr
//                       key={index}
//                       className={`recall-row ${selectedJob?.jobNumber === job.jobNumber ? "recall-row-selected" : ""}`}
//                       onClick={() => handleRowClick(job)}
//                     >
//                       <td>{job.jobNumber}</td>
//                       <td>{job.description}</td>
//                       <td>{job.brand}</td>
//                       <td>{job.model}</td>
//                       <td>{job.serialNo}</td>
//                       <td>{job.range}</td>
//                       <td>{job.uncertainty}</td>
//                       <td>{job.remarks}</td>
//                       <td>{job.priority}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="9" className="jr-no-data">
//                       No job numbers found for {prefix}/{selectedYear}.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* SELECTED JOB DETAILS PREVIEW */}
//           {selectedJob && (
//             <div className="recall-preview">
//               <div className="recall-preview-title">
//                 Selected: {selectedJob.jobNumber}
//               </div>
//               <div className="recall-preview-grid">
//                 <div>
//                   <span>Description:</span> {selectedJob.description}
//                 </div>
//                 <div>
//                   <span>Brand:</span> {selectedJob.brand}
//                 </div>
//                 <div>
//                   <span>Model:</span> {selectedJob.model}
//                 </div>
//                 <div>
//                   <span>Serial No.:</span> {selectedJob.serialNo}
//                 </div>
//                 <div>
//                   <span>Range:</span> {selectedJob.range}
//                 </div>
//                 <div>
//                   <span>Uncertainty:</span> {selectedJob.uncertainty}
//                 </div>
//                 <div>
//                   <span>Frequency:</span> {selectedJob.frequency}
//                 </div>
//                 <div>
//                   <span>Priority:</span> {selectedJob.priority}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* FOOTER ACTIONS */}
//           <div className="recall-footer">
//             <button
//               className={`jr-save-btn ${!selectedJob ? "recall-btn-disabled" : ""}`}
//               onClick={handleUseDetails}
//               disabled={!selectedJob}
//             >
//               Use Details
//             </button>
//             <button className="jr-action-btn" onClick={onClose}>
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// // =====================
// // INSTRUMENT LIST MODAL
// // =====================
// const InstrumentListModal = ({ onClose, onSelect }) => {
//   const [instruments, setInstruments] = useState([]);
//   const [search, setSearch] = useState("");
//   const [searchBy, setSearchBy] = useState("description");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchInstruments();
//   }, []);

//   const fetchInstruments = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/instruments`);
//       const data = await res.json();
//       setInstruments(data);
//     } catch (err) {
//       console.error("Failed to fetch instruments", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtered = instruments.filter((item) =>
//     item[searchBy]?.toLowerCase().includes(search.toLowerCase()),
//   );

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <div className="il-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">INSTRUMENT LIST</span>
//               <span className="jr-modal-title-sub">
//                 SCIENTIFIC STANDARDS SERVICES
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         <div className="il-content">
//           <div className="il-search-row">
//             <input
//               type="text"
//               placeholder="Search..."
//               className="il-search-input"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               autoFocus
//             />
//             <select
//               className="il-search-select"
//               value={searchBy}
//               onChange={(e) => setSearchBy(e.target.value)}
//             >
//               <option value="description">Description</option>
//               <option value="type">Type</option>
//               <option value="range">Range</option>
//             </select>
//           </div>

//           <div className="il-table-wrapper">
//             {loading ? (
//               <p className="il-no-data">Loading instruments...</p>
//             ) : (
//               <table className="il-table">
//                 <thead>
//                   <tr>
//                     <th>Description</th>
//                     <th>Range</th>
//                     <th>Uncertainty</th>
//                     <th>Remarks</th>
//                     <th>Unit Price</th>
//                     <th>Date Due</th>
//                     <th>Type</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.length > 0 ? (
//                     filtered.map((item, index) => (
//                       <tr
//                         key={index}
//                         className="il-row"
//                         onClick={() => onSelect(item)}
//                       >
//                         <td>{item.description}</td>
//                         <td>{item.range}</td>
//                         <td>{item.uncertainty}</td>
//                         <td>{item.remarks}</td>
//                         <td>{item.unitPrice}</td>
//                         <td>{item.dateDue}</td>
//                         <td>{item.type}</td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" className="il-no-data">
//                         No instruments found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           <div className="il-footer">
//             <button className="jr-action-btn">Add New</button>
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

// // =====================
// // CUSTOMER LOOKUP
// // =====================
// const CustomerLookupTable = ({ onSelect }) => {
//   const [customers, setCustomers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const fetchCustomers = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/customers`);
//       const data = await res.json();
//       setCustomers(data);
//     } catch (err) {
//       console.error("Failed to fetch customers", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtered = customers.filter(
//     (c) =>
//       c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
//       c.customerID?.toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <div>
//       <div className="lookup-search">
//         <input
//           type="text"
//           placeholder="Search by company name or customer ID..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           autoFocus
//         />
//       </div>
//       {loading ? (
//         <p className="lookup-loading">Loading customers...</p>
//       ) : (
//         <div className="lookup-table-wrapper">
//           <table className="lookup-table">
//             <thead>
//               <tr>
//                 <th>Customer ID</th>
//                 <th>Company Name</th>
//                 <th>Address</th>
//                 <th>Contact</th>
//                 <th>Phone</th>
//                 <th>VAT</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.length > 0 ? (
//                 filtered.map((customer) => (
//                   <tr
//                     key={customer.customerID}
//                     className="lookup-row"
//                     onClick={() => onSelect(customer)}
//                   >
//                     <td>{customer.customerID}</td>
//                     <td>{customer.companyName}</td>
//                     <td>{customer.companyAddress}</td>
//                     <td>{customer.contactNames?.join(", ")}</td>
//                     <td>{customer.phoneNumber}</td>
//                     <td>{customer.vat}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="jr-no-data">
//                     No customers found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// const CustomerLookupModal = ({ onClose, onSelect }) =>
//   createPortal(
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="lookup-modal-box" onClick={(e) => e.stopPropagation()}>
//         <div className="lookup-modal-header">
//           <h2>Select Customer</h2>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>
//         <CustomerLookupTable onSelect={onSelect} />
//       </div>
//     </div>,
//     document.body,
//   );

// // =====================
// // JOB NUMBER MODAL
// // =====================
// const JobNumberModal = ({
//   onClose,
//   onSave,
//   jobForm,
//   onJobChange,
//   jobReceiptID,
//   onOpenInstrumentList,
//   onOpenRecall,
// }) =>
//   createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <div className="jn-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">JOB NUMBER DETAILS</span>
//               <span className="jr-modal-title-sub">{jobForm.jobNumber}</span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         <div className="jn-modal-scroll">
//           <div className="jn-top-row">
//             <div className="jn-top-right">
//               <div className="jn-info-row">
//                 <label>Job Number</label>
//                 <input
//                   type="text"
//                   value={jobForm.jobNumber}
//                   disabled
//                   className="jr-input-auto"
//                 />
//               </div>
//               <div className="jn-info-row">
//                 <label>Job Receipt ID</label>
//                 <input
//                   type="text"
//                   value={jobReceiptID}
//                   disabled
//                   className="jr-input-auto"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="jn-form-body">
//             <div className="jn-form-left">
//               <div className="jr-field-row">
//                 <label>Description</label>
//                 <div
//                   className="jr-input-with-btn"
//                   style={{ flex: 1, minWidth: 0 }}
//                 >
//                   <textarea
//                     name="description"
//                     value={jobForm.description}
//                     onChange={onJobChange}
//                     style={{ flex: 1, minHeight: "60px", minWidth: 0 }}
//                   />
//                   <button
//                     className="jr-lookup-btn"
//                     title="Instrument List"
//                     onClick={onOpenInstrumentList}
//                   >
//                     📋
//                   </button>
//                 </div>
//               </div>
//               <div className="jr-field-row">
//                 <label>Brand</label>
//                 <input
//                   type="text"
//                   name="brand"
//                   value={jobForm.brand}
//                   onChange={onJobChange}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Model</label>
//                 <input
//                   type="text"
//                   name="model"
//                   value={jobForm.model}
//                   onChange={onJobChange}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Serial No.</label>
//                 <input
//                   type="text"
//                   name="serialNo"
//                   value={jobForm.serialNo}
//                   onChange={onJobChange}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Remarks</label>
//                 <textarea
//                   name="remarks"
//                   value={jobForm.remarks}
//                   onChange={onJobChange}
//                   style={{ minHeight: "50px" }}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Concern</label>
//                 <textarea
//                   name="concern"
//                   value={jobForm.concern}
//                   onChange={onJobChange}
//                   style={{ minHeight: "50px" }}
//                 />
//               </div>
//             </div>

//             <div className="jn-form-right">
//               <div className="jr-field-row">
//                 <label>Range</label>
//                 <textarea
//                   name="range"
//                   value={jobForm.range}
//                   onChange={onJobChange}
//                   style={{ minHeight: "60px" }}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Uncertainty</label>
//                 <input
//                   type="text"
//                   name="uncertainty"
//                   value={jobForm.uncertainty}
//                   onChange={onJobChange}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>Contact Cert</label>
//                 <div
//                   className="jr-input-with-btn"
//                   style={{ flex: 1, minWidth: 0 }}
//                 >
//                   <input
//                     type="text"
//                     name="contactCert"
//                     value={jobForm.contactCert}
//                     onChange={onJobChange}
//                     style={{ flex: 1 }}
//                   />
//                   <button className="jr-lookup-btn">📋</button>
//                 </div>
//               </div>
//               <div className="jn-inline-row">
//                 <label>Frequency</label>
//                 <select
//                   name="frequency"
//                   value={jobForm.frequency}
//                   onChange={onJobChange}
//                 >
//                   <option>6 Months</option>
//                   <option>1 Year</option>
//                   <option>2 Years</option>
//                   <option>3 Years</option>
//                 </select>
//                 <label>ETA</label>
//                 <input
//                   type="date"
//                   name="eta"
//                   value={jobForm.eta}
//                   onChange={onJobChange}
//                 />
//               </div>
//               <div className="jn-inline-row">
//                 <label>Eval By</label>
//                 <select
//                   name="evalBy"
//                   value={jobForm.evalBy}
//                   onChange={onJobChange}
//                 >
//                   <option value="">-- Select --</option>
//                   <option>CPGP</option>
//                   <option>SSSI</option>
//                 </select>
//                 <label>Priority</label>
//                 <select
//                   name="priority"
//                   value={jobForm.priority}
//                   onChange={onJobChange}
//                 >
//                   <option>Normal</option>
//                   <option>Rush</option>
//                   <option>On Hold</option>
//                 </select>
//               </div>
//               <div className="jn-inline-row">
//                 <label>Voltage</label>
//                 <select
//                   name="voltage"
//                   value={jobForm.voltage}
//                   onChange={onJobChange}
//                 >
//                   <option>-</option>
//                   <option>110V</option>
//                   <option>220V</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="jn-modal-actions">
//             <div className="jr-modal-actions-left">
//               <button className="jr-action-btn">Open Camera</button>
//               <button className="jr-action-btn">Open Folder</button>
//             </div>
//             <div className="jr-modal-actions-right">
//               <button className="jr-action-btn" onClick={onOpenRecall}>
//                 Recall Job Number
//               </button>
//               <button className="jr-action-btn" disabled>
//                 Cancel Job Number
//               </button>
//               <button className="jr-save-btn" onClick={onSave}>
//                 Save
//               </button>
//               <button className="jr-action-btn" onClick={onClose}>
//                 Exit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );

// // =====================
// // ADD RECEIPT MODAL
// // =====================
// const AddReceiptModal = ({
//   onClose,
//   onSave,
//   formData,
//   onChange,
//   onOpenLookup,
//   onOpenJobNumber,
//   onTypeChange,
//   user,
//   jobNumbers,
// }) =>
//   createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <div className="jr-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">JOB RECEIPT DETAILS</span>
//               <span className="jr-modal-title-sub">
//                 SCIENTIFIC STANDARDS SERVICES
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         <div className="jr-top-row">
//           <div className="jr-top-field">
//             <label>Job Receipt ID</label>
//             <input
//               type="text"
//               value={formData.jrId}
//               disabled
//               className="jr-input-auto"
//             />
//           </div>
//           <div className="jr-top-field">
//             <label>Date</label>
//             <input
//               type="date"
//               name="date"
//               value={formData.date}
//               onChange={onChange}
//             />
//           </div>
//           <div className="jr-top-field">
//             <label>Customer ID</label>
//             <div className="jr-input-with-btn">
//               <input
//                 type="text"
//                 name="customerID"
//                 value={formData.customerID}
//                 onChange={onChange}
//                 placeholder="Type or search..."
//               />
//               <button
//                 className="jr-lookup-btn"
//                 title="Lookup Customer"
//                 onClick={onOpenLookup}
//               >
//                 🔍
//               </button>
//             </div>
//           </div>
//           <button className="jr-pdf-btn">Open PDF</button>
//         </div>

//         <div className="jr-form-body">
//           <div className="jr-form-left">
//             <div className="jr-field-row">
//               <label>Company Name</label>
//               <input
//                 type="text"
//                 name="companyName"
//                 value={formData.companyName}
//                 onChange={onChange}
//               />
//             </div>
//             <div className="jr-field-row">
//               <label>Address</label>
//               <textarea
//                 name="companyAddress"
//                 value={formData.companyAddress}
//                 onChange={onChange}
//               />
//             </div>
//             <div className="jr-field-row">
//               <label>Contact Info</label>
//               <textarea
//                 name="contactInfo"
//                 value={formData.contactInfo}
//                 onChange={onChange}
//               />
//             </div>
//             <div className="jr-field-row">
//               <label>VAT</label>
//               <input
//                 type="text"
//                 name="vat"
//                 value={formData.vat}
//                 onChange={onChange}
//               />
//             </div>
//             <div className="jr-field-row">
//               <label>Contact Name</label>
//               <div className="jr-input-with-btn" style={{ flex: 1 }}>
//                 <input
//                   type="text"
//                   name="contactName"
//                   value={formData.contactName}
//                   onChange={onChange}
//                   style={{ flex: 1 }}
//                 />
//                 <button className="jr-lookup-btn" title="Add Contact">
//                   📋
//                 </button>
//               </div>
//             </div>
//             <div className="jr-field-row">
//               <label>Prepared By</label>
//               <input
//                 type="text"
//                 name="preparedBy"
//                 value={user || formData.preparedBy}
//                 disabled
//                 className="jr-input-auto"
//               />
//             </div>
//           </div>

//           <div className="jr-form-right">
//             <div className="jr-field-row">
//               <label>Reference</label>
//               <input
//                 type="text"
//                 name="reference"
//                 value={formData.reference}
//                 onChange={onChange}
//               />
//             </div>
//             <div className="jr-field-row">
//               <label>Remarks</label>
//               <textarea
//                 name="remarks"
//                 value={formData.remarks}
//                 onChange={onChange}
//               />
//             </div>
//           </div>
//         </div>

//         <div className="jr-modal-actions">
//           <div className="jr-modal-actions-left">
//             <button className="jr-add-btn" onClick={onOpenJobNumber}>
//               Add
//             </button>
//             <label className="jr-radio-label">
//               <input
//                 type="radio"
//                 name="type"
//                 value="mechanical"
//                 checked={formData.type === "mechanical"}
//                 onChange={onTypeChange}
//               />{" "}
//               Mechanical
//             </label>
//             <label className="jr-radio-label">
//               <input
//                 type="radio"
//                 name="type"
//                 value="electrical"
//                 checked={formData.type === "electrical"}
//                 onChange={onTypeChange}
//               />{" "}
//               Electrical
//             </label>
//             <button className="jr-reserve-btn">Reserve Job Numbers</button>
//           </div>
//           <div className="jr-modal-actions-right">
//             <button className="jr-action-btn" disabled>
//               Modification History
//             </button>
//             <button className="jr-action-btn">Open Camera</button>
//             <button className="jr-action-btn">Open Folder</button>
//             <button className="jr-action-btn">Print</button>
//             <button className="jr-save-btn" onClick={onSave}>
//               Save
//             </button>
//           </div>
//         </div>

//         <div className="jr-job-table-wrapper">
//           <table className="jr-job-table">
//             <thead>
//               <tr>
//                 <th>Job Number</th>
//                 <th>Description</th>
//                 <th>Brand</th>
//                 <th>Model</th>
//                 <th>Serial No.</th>
//                 <th>Remarks</th>
//                 <th>Concern</th>
//                 <th>Priority</th>
//               </tr>
//             </thead>
//             <tbody>
//               {jobNumbers.length > 0 ? (
//                 jobNumbers.map((job, index) => (
//                   <tr key={index}>
//                     <td>{job.jobNumber}</td>
//                     <td>{job.description}</td>
//                     <td>{job.brand}</td>
//                     <td>{job.model}</td>
//                     <td>{job.serialNo}</td>
//                     <td>{job.remarks}</td>
//                     <td>{job.concern}</td>
//                     <td>{job.priority}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="8" className="jr-no-data">
//                     No job numbers added yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );

// // =====================
// // MAIN COMPONENT
// // =====================
// const JobReceipt = () => {
//   const [receipts, setReceipts] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [showLookup, setShowLookup] = useState(false);
//   const [showJobModal, setShowJobModal] = useState(false);
//   const [showInstrumentList, setShowInstrumentList] = useState(false);
//   const [showRecall, setShowRecall] = useState(false);
//   const [formData, setFormData] = useState(emptyForm);
//   const [jobForm, setJobForm] = useState(emptyJobForm);
//   const [jobNumbers, setJobNumbers] = useState([]);
//   const [allJobNumbers, setAllJobNumbers] = useState([]);
//   const [jrCounter, setJrCounter] = useState(1);
//   const [jobCounter, setJobCounter] = useState(1);

//   const user = localStorage.getItem("name") || "";
//   const yr = new Date().getFullYear().toString().slice(-2);

//   const generateJrId = (counter) =>
//     `JR/${String(counter).padStart(4, "0")}/${yr}`;

//   const generateJobNumber = (counter, type) => {
//     const prefix = type === "electrical" ? "SSE" : "SSS";
//     return `${prefix}/${String(counter).padStart(4, "0")}/${yr}`;
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleTypeChange = (e) =>
//     setFormData({ ...formData, type: e.target.value });

//   const handleJobChange = (e) =>
//     setJobForm({ ...jobForm, [e.target.name]: e.target.value });

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

//   // USE DETAILS FROM RECALL - paste all fields into jobForm
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

//   const handleOpenJobNumber = () => {
//     const newJobNumber = generateJobNumber(jobCounter, formData.type);
//     setJobForm({
//       ...emptyJobForm,
//       jobNumber: newJobNumber,
//       eta: new Date().toISOString().split("T")[0],
//     });
//     setShowJobModal(true);
//   };

//   const handleSaveJobNumber = () => {
//     const savedJob = { ...jobForm };
//     setJobNumbers((prev) => [...prev, savedJob]);
//     setAllJobNumbers((prev) => [...prev, savedJob]);
//     setJobCounter((prev) => prev + 1);
//     setShowJobModal(false);
//   };

//   const handleOpenModal = () => {
//     const newJrId = generateJrId(jrCounter);
//     setFormData({
//       ...emptyForm,
//       jrId: newJrId,
//       date: new Date().toISOString().split("T")[0],
//       preparedBy: user,
//       type: "mechanical",
//     });
//     setJobNumbers([]);
//     setShowModal(true);
//   };

//   const handleSave = () => {
//     setReceipts((prev) => [...prev, { ...formData, jobNumbers }]);
//     setJrCounter((prev) => prev + 1);
//     setFormData(emptyForm);
//     setJobNumbers([]);
//     setShowModal(false);
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
//         <select>
//           <option>Company Name</option>
//           <option>JR ID</option>
//           <option>Contact Name</option>
//         </select>
//         <input type="text" placeholder="Search..." />
//         <button>Search</button>
//         <select>
//           <option>25</option>
//           <option>50</option>
//           <option>100</option>
//         </select>
//         <button onClick={handleOpenModal}>Add New</button>
//         <button>Refresh</button>
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
//             {receipts.length > 0 ? (
//               receipts.map((receipt, index) => (
//                 <tr key={index}>
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
//                   No Job Receipts Found
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
//           onTypeChange={handleTypeChange}
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
//           onClose={() => setShowJobModal(false)}
//           onSave={handleSaveJobNumber}
//           jobForm={jobForm}
//           onJobChange={handleJobChange}
//           jobReceiptID={formData.jrId}
//           onOpenInstrumentList={() => setShowInstrumentList(true)}
//           onOpenRecall={() => setShowRecall(true)}
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
