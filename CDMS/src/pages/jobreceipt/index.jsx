// import React, { useState, useEffect, useMemo } from "react";
// import "../jobreceipt.css";
// import AddReceiptModal from "./AddReceiptModal";
// import CustomerLookupModal from "./CustomerLookupModal";
// import JobNumberModal from "./JobNumberModal";
// import InstrumentListModal from "./InstrumentListModal";
// import RecallJobModal from "./RecallJobModal";
// import PrintReceiptModal from "./PrintReceiptModal";

// const API = import.meta.env.VITE_API_URL;

// // Default ETA for a new job: one month from today, minus one day.
// const getDefaultEta = () => {
//   const d = new Date();
//   d.setMonth(d.getMonth() + 1);
//   d.setDate(d.getDate() - 1);
//   return d.toISOString().split("T")[0];
// };

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
//   eta: getDefaultEta(),
//   evalBy: "",
//   priority: "Normal",
//   voltage: "-",
//   onSite: false, // mode of receipt: false = In-house (default), true = On-Site. Set once via the checkbox and unrelated to pipeline stage.
//   tagged: false, // pipeline-stage flag: becomes true only once the job actually passes Instrument Tagging. Must NOT default to true, or every new job skips straight to Incoming Calibration.
//   photoUrl: "", // base64 data URL of the equipment photo, captured via camera in JobNumberModal
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
//   const [contactOptions, setContactOptions] = useState([]);

//   // EDIT MODE — true when the modal was opened by clicking an existing row
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [rowLoading, setRowLoading] = useState(false);

//   // PRINT COPY — holds the saved receipt + job numbers snapshot shown in
//   // PrintReceiptModal. Populated either right after a successful save, or
//   // on-demand via the "Print" button inside AddReceiptModal.
//   const [showPrintModal, setShowPrintModal] = useState(false);
//   const [printData, setPrintData] = useState(null);

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

//   // FETCH A CUSTOMER'S CONTACT LIST BY CUSTOMER ID (used when typed manually)
//   const fetchContactsByCustomerID = async (customerID) => {
//     if (!customerID?.trim()) {
//       setContactOptions([]);
//       return;
//     }
//     try {
//       const res = await fetch(
//         `${API}/api/customers/${encodeURIComponent(customerID)}`,
//       );
//       if (!res.ok) {
//         setContactOptions([]);
//         return;
//       }
//       const customer = await res.json();
//       const contacts = customer?.contactNames || [];
//       setContactOptions(contacts);
//       setFormData((prev) => ({
//         ...prev,
//         contactName: contacts.includes(prev.contactName)
//           ? prev.contactName
//           : contacts[0] || "",
//       }));
//     } catch (err) {
//       console.error("Failed to fetch customer contacts:", err);
//       setContactOptions([]);
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

//   // ON-SITE TOGGLE CHANGE — sets the mode-of-receipt flag (`onSite`) that
//   // JobNumber.jsx's getMOR() reads. This is intentionally independent of
//   // `tagged`, which is a separate pipeline-stage flag set elsewhere (e.g.
//   // when the job passes through Instrument Tagging).
//   const handleOnSiteChange = (e) => {
//     setJobForm((prev) => ({ ...prev, onSite: e.target.checked }));
//   };

//   // TYPE CHANGE — reserves a real job number from the server for the chosen type
//   const handleJobTypeChange = async (e) => {
//     const newType = e.target.value;

//     setJobForm((prev) => ({ ...prev, type: newType }));

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
//     const contacts = customer.contactNames || [];
//     setFormData((prev) => ({
//       ...prev,
//       customerID: customer.customerID,
//       companyName: customer.companyName,
//       companyAddress: customer.companyAddress,
//       contactInfo: customer.phoneNumber || "",
//       vat: customer.vat || "",
//       contactName: contacts[0] || "",
//     }));
//     setContactOptions(contacts);
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
//       onSite: job.onSite ?? false,
//       tagged: job.tagged ?? false,
//       photoUrl: job.photoUrl || "",
//     }));
//     setShowRecall(false);
//   };

//   // OPEN NEW JOB NUMBER — blank type, blank job number until user picks a type.
//   // eta is left as-is from emptyJobForm, which already defaults to
//   // getDefaultEta() (one month from today, minus one day).
//   const handleOpenJobNumber = () => {
//     setEditingJobIndex(null);
//     setJobForm({ ...emptyJobForm });
//     setShowJobModal(true);
//   };

//   // OPEN EXISTING JOB NUMBER FOR EDITING (within the job-number sub-modal)
//   const handleEditJobNumber = (index) => {
//     setEditingJobIndex(index);
//     setJobForm({ ...jobNumbers[index] });
//     setShowJobModal(true);
//   };

//   // SAVE JOB NUMBER - update existing or add new (in local jobNumbers list)
//   const handleSaveJobNumber = () => {
//     if (editingJobIndex !== null) {
//       setJobNumbers((prev) =>
//         prev.map((job, i) => (i === editingJobIndex ? { ...jobForm } : job)),
//       );
//       setEditingJobIndex(null);
//     } else {
//       // mark brand-new jobs so handleSave knows to POST instead of PUT
//       setJobNumbers((prev) => [...prev, { ...jobForm, _isNew: true }]);
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

//   // OPEN ADD RECEIPT MODAL (brand new receipt)
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
//     setContactOptions([]);
//     setIsEditMode(false);
//     setShowModal(true);
//   };

//   // OPEN EXISTING RECEIPT (row click) — loads data from the database into the modal
//   const handleRowClick = async (receipt) => {
//     setRowLoading(true);
//     try {
//       // Prefer a fresh single-record fetch so the modal always shows the
//       // latest saved data, not just whatever's cached in the list state.
//       let fullReceipt = receipt;
//       try {
//         const res = await fetch(
//           `${API}/api/jobreceipts/${encodeURIComponent(receipt.jrId)}`,
//         );
//         if (res.ok) {
//           const data = await res.json();
//           if (data) fullReceipt = data;
//         }
//       } catch (err) {
//         console.warn(
//           "Falling back to cached row data (single-fetch failed):",
//           err,
//         );
//       }

//       setFormData({ ...emptyForm, ...fullReceipt });
//       setIsEditMode(true);
//       setEditingJobIndex(null);

//       // Try to get this receipt's job numbers from a dedicated endpoint first;
//       // fall back to filtering the already-fetched allJobNumbers list.
//       let relatedJobs = [];
//       try {
//         const jobsRes = await fetch(
//           `${API}/api/jobnumbers?jobReceiptID=${encodeURIComponent(
//             fullReceipt.jrId,
//           )}`,
//         );
//         if (jobsRes.ok) {
//           const jobsData = await jobsRes.json();
//           relatedJobs = Array.isArray(jobsData) ? jobsData : [];
//         }
//       } catch (err) {
//         console.warn("Job numbers endpoint failed, using cached list:", err);
//       }

//       // SAFETY NET: enforce the JR ID match client-side regardless of what
//       // the endpoint returned. This guarantees only job numbers actually
//       // registered under this JR ID ever show up in the modal, even if the
//       // backend route ignores the query param or returns stale/extra rows.
//       relatedJobs = relatedJobs.filter(
//         (job) => job.jobReceiptID === fullReceipt.jrId,
//       );

//       if (relatedJobs.length === 0) {
//         relatedJobs = allJobNumbers.filter(
//           (job) => job.jobReceiptID === fullReceipt.jrId,
//         );
//       }
//       setJobNumbers(relatedJobs);

//       // Load contact dropdown options for this customer
//       if (fullReceipt.customerID) {
//         await fetchContactsByCustomerID(fullReceipt.customerID);
//       } else {
//         setContactOptions([]);
//       }

//       setShowModal(true);
//     } finally {
//       setRowLoading(false);
//     }
//   };

//   // SAVE RECEIPT + ALL JOB NUMBERS (handles both create and update)
//   const handleSave = async () => {
//     try {
//       const url = isEditMode
//         ? `${API}/api/jobreceipts/${encodeURIComponent(formData.jrId)}`
//         : `${API}/api/jobreceipts`;
//       const method = isEditMode ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...formData, jobNumbers: [] }),
//       });
//       if (!res.ok) throw new Error("Failed to save receipt");
//       const data = await res.json();

//       if (data.success) {
//         const savedJrId = data.jrId || formData.jrId;
//         const savedJobs = [];

//         for (const job of jobNumbers) {
//           // Existing jobs (loaded from DB, not flagged _isNew) get updated;
//           // newly added jobs in this session get created.
//           const isExistingJob = Boolean(job._id) && !job._isNew;
//           const jobUrl = isExistingJob
//             ? `${API}/api/jobnumbers/${job._id}`
//             : `${API}/api/jobnumbers`;
//           const jobMethod = isExistingJob ? "PUT" : "POST";

//           const jobRes = await fetch(jobUrl, {
//             method: jobMethod,
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               ...job,
//               jobReceiptID: savedJrId,
//               type: job.type,
//             }),
//           });
//           const jobData = await jobRes.json();
//           if (jobData.success) {
//             const { _isNew, ...cleanJob } = job;
//             savedJobs.push({
//               ...cleanJob,
//               jobNumber: jobData.jobNumber || job.jobNumber,
//               _id: jobData._id || job._id,
//             });
//           }
//         }

//         // Replace any previously-cached jobs for this receipt with the fresh saved set
//         setAllJobNumbers((prev) => {
//           const withoutOld = prev.filter((j) => j.jobReceiptID !== savedJrId);
//           return [...withoutOld, ...savedJobs];
//         });

//         await fetchReceipts();

//         // PRINT COPY — snapshot the just-saved receipt + its saved job
//         // numbers (with server-generated job number IDs) and open the
//         // printable receipt automatically so there's a physical/PDF copy
//         // on hand right after saving.
//         setPrintData({
//           ...formData,
//           jrId: savedJrId,
//           jobNumbers: savedJobs,
//         });
//         setShowPrintModal(true);

//         setFormData(emptyForm);
//         setJobNumbers([]);
//         setContactOptions([]);
//         setIsEditMode(false);
//         setShowModal(false);
//       }
//     } catch (err) {
//       console.error("Failed to save receipt and job numbers:", err);
//     }
//   };

//   // PRINT PREVIEW ON DEMAND — lets the user open the printable receipt from
//   // inside AddReceiptModal (via its "Print" button) without saving first.
//   // Useful for reprinting an already-saved receipt while it's open in edit mode.
//   const handlePrintPreview = () => {
//     setPrintData({ ...formData, jobNumbers });
//     setShowPrintModal(true);
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
//                 <tr
//                   key={receipt._id || index}
//                   className="clickable-row"
//                   onClick={() => handleRowClick(receipt)}
//                 >
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

//       {rowLoading && (
//         <div className="jr-row-loading-overlay">
//           <span>Loading receipt...</span>
//         </div>
//       )}

//       {showModal && (
//         <AddReceiptModal
//           onClose={() => {
//             setShowModal(false);
//             setIsEditMode(false);
//           }}
//           onSave={handleSave}
//           onPrint={handlePrintPreview}
//           formData={formData}
//           onChange={handleChange}
//           onOpenLookup={() => setShowLookup(true)}
//           onOpenJobNumber={handleOpenJobNumber}
//           onEditJobNumber={handleEditJobNumber}
//           user={user}
//           jobNumbers={jobNumbers}
//           contactOptions={contactOptions}
//           onCustomerIDBlur={fetchContactsByCustomerID}
//           onContactAdded={(newContactName) => {
//             setContactOptions((prev) =>
//               prev.includes(newContactName) ? prev : [...prev, newContactName],
//             );
//             setFormData((prev) => ({ ...prev, contactName: newContactName }));
//           }}
//           isEditMode={isEditMode}
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
//           onOnSiteChange={handleOnSiteChange}
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

//       {showPrintModal && printData && (
//         <PrintReceiptModal
//           receipt={printData}
//           onClose={() => {
//             setShowPrintModal(false);
//             setPrintData(null);
//           }}
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
import PrintReceiptModal from "./PrintReceiptModal";

const API = import.meta.env.VITE_API_URL;

// Default ETA for a new job: one month from today, minus one day.
const getDefaultEta = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

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
  eta: getDefaultEta(),
  evalBy: "",
  priority: "Normal",
  voltage: "-",
  onSite: false, // mode of receipt: false = In-house (default), true = On-Site. Set once via the checkbox and unrelated to pipeline stage.
  tagged: false, // pipeline-stage flag: becomes true only once the job actually passes Instrument Tagging. Must NOT default to true, or every new job skips straight to Incoming Calibration.
  photoUrl: "", // base64 data URL of the equipment photo, captured via camera in JobNumberModal
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

  // EDIT MODE — true when the modal was opened by clicking an existing row
  const [isEditMode, setIsEditMode] = useState(false);
  const [rowLoading, setRowLoading] = useState(false);

  // PRINT COPY — holds the saved receipt + job numbers snapshot shown in
  // PrintReceiptModal. Populated either right after a successful save, or
  // on-demand via the "Print" button inside AddReceiptModal.
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState(null);

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

  // ON-SITE TOGGLE CHANGE — sets the mode-of-receipt flag (`onSite`) that
  // JobNumber.jsx's getMOR() reads. This is intentionally independent of
  // `tagged`, which is a separate pipeline-stage flag set elsewhere (e.g.
  // when the job passes through Instrument Tagging).
  const handleOnSiteChange = (e) => {
    setJobForm((prev) => ({ ...prev, onSite: e.target.checked }));
  };

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
      onSite: job.onSite ?? false,
      tagged: job.tagged ?? false,
      photoUrl: job.photoUrl || "",
    }));
    setShowRecall(false);
  };

  // OPEN NEW JOB NUMBER — blank type, blank job number until user picks a type.
  // eta is left as-is from emptyJobForm, which already defaults to
  // getDefaultEta() (one month from today, minus one day).
  const handleOpenJobNumber = () => {
    setEditingJobIndex(null);
    setJobForm({ ...emptyJobForm });
    setShowJobModal(true);
  };

  // OPEN EXISTING JOB NUMBER FOR EDITING (within the job-number sub-modal)
  const handleEditJobNumber = (index) => {
    setEditingJobIndex(index);
    setJobForm({ ...jobNumbers[index] });
    setShowJobModal(true);
  };

  // SAVE JOB NUMBER - update existing or add new (in local jobNumbers list)
  const handleSaveJobNumber = () => {
    if (editingJobIndex !== null) {
      setJobNumbers((prev) =>
        prev.map((job, i) => (i === editingJobIndex ? { ...jobForm } : job)),
      );
      setEditingJobIndex(null);
    } else {
      // mark brand-new jobs so handleSave knows to POST instead of PUT
      setJobNumbers((prev) => [...prev, { ...jobForm, _isNew: true }]);
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

  // OPEN ADD RECEIPT MODAL (brand new receipt)
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
    setIsEditMode(false);
    setShowModal(true);
  };

  // OPEN EXISTING RECEIPT (row click) — loads data from the database into the modal
  const handleRowClick = async (receipt) => {
    setRowLoading(true);
    try {
      // Prefer a fresh single-record fetch so the modal always shows the
      // latest saved data, not just whatever's cached in the list state.
      let fullReceipt = receipt;
      try {
        const res = await fetch(
          `${API}/api/jobreceipts/${encodeURIComponent(receipt.jrId)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data) fullReceipt = data;
        }
      } catch (err) {
        console.warn(
          "Falling back to cached row data (single-fetch failed):",
          err,
        );
      }

      setFormData({ ...emptyForm, ...fullReceipt });
      setIsEditMode(true);
      setEditingJobIndex(null);

      // Try to get this receipt's job numbers from a dedicated endpoint first;
      // fall back to filtering the already-fetched allJobNumbers list.
      let relatedJobs = [];
      try {
        const jobsRes = await fetch(
          `${API}/api/jobnumbers?jobReceiptID=${encodeURIComponent(
            fullReceipt.jrId,
          )}`,
        );
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          relatedJobs = Array.isArray(jobsData) ? jobsData : [];
        }
      } catch (err) {
        console.warn("Job numbers endpoint failed, using cached list:", err);
      }

      // SAFETY NET: enforce the JR ID match client-side regardless of what
      // the endpoint returned. This guarantees only job numbers actually
      // registered under this JR ID ever show up in the modal, even if the
      // backend route ignores the query param or returns stale/extra rows.
      relatedJobs = relatedJobs.filter(
        (job) => job.jobReceiptID === fullReceipt.jrId,
      );

      if (relatedJobs.length === 0) {
        relatedJobs = allJobNumbers.filter(
          (job) => job.jobReceiptID === fullReceipt.jrId,
        );
      }
      setJobNumbers(relatedJobs);

      // Load contact dropdown options for this customer
      if (fullReceipt.customerID) {
        await fetchContactsByCustomerID(fullReceipt.customerID);
      } else {
        setContactOptions([]);
      }

      setShowModal(true);
    } finally {
      setRowLoading(false);
    }
  };

  // SAVE RECEIPT + ALL JOB NUMBERS (handles both create and update)
  const handleSave = async () => {
    try {
      const url = isEditMode
        ? `${API}/api/jobreceipts/${encodeURIComponent(formData.jrId)}`
        : `${API}/api/jobreceipts`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, jobNumbers: [] }),
      });
      if (!res.ok) throw new Error("Failed to save receipt");
      const data = await res.json();

      if (data.success) {
        const savedJrId = data.jrId || formData.jrId;
        const savedJobs = [];

        for (const job of jobNumbers) {
          // Existing jobs (loaded from DB, not flagged _isNew) get updated;
          // newly added jobs in this session get created.
          const isExistingJob = Boolean(job._id) && !job._isNew;
          const jobUrl = isExistingJob
            ? `${API}/api/jobnumbers/${job._id}`
            : `${API}/api/jobnumbers`;
          const jobMethod = isExistingJob ? "PUT" : "POST";

          const jobRes = await fetch(jobUrl, {
            method: jobMethod,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...job,
              jobReceiptID: savedJrId,
              type: job.type,
            }),
          });
          const jobData = await jobRes.json();
          if (jobData.success) {
            const { _isNew, ...cleanJob } = job;
            savedJobs.push({
              ...cleanJob,
              jobNumber: jobData.jobNumber || job.jobNumber,
              _id: jobData._id || job._id,
            });
          }
        }

        // Replace any previously-cached jobs for this receipt with the fresh saved set
        setAllJobNumbers((prev) => {
          const withoutOld = prev.filter((j) => j.jobReceiptID !== savedJrId);
          return [...withoutOld, ...savedJobs];
        });

        await fetchReceipts();

        // PRINT COPY — snapshot the just-saved receipt + its saved job
        // numbers (with server-generated job number IDs) and open the
        // printable receipt automatically so there's a physical/PDF copy
        // on hand right after saving.
        setPrintData({
          ...formData,
          jrId: savedJrId,
          jobNumbers: savedJobs,
        });
        setShowPrintModal(true);

        setFormData(emptyForm);
        setJobNumbers([]);
        setContactOptions([]);
        setIsEditMode(false);
        setShowModal(false);
      }
    } catch (err) {
      console.error("Failed to save receipt and job numbers:", err);
    }
  };

  // PRINT PREVIEW ON DEMAND — lets the user open the printable receipt from
  // inside AddReceiptModal (via its "Print" button) without saving first.
  // Useful for reprinting an already-saved receipt while it's open in edit mode.
  const handlePrintPreview = () => {
    setPrintData({ ...formData, jobNumbers });
    setShowPrintModal(true);
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

  // ADD CONTACT (shared) — called from either AddReceiptModal or
  // JobNumberModal's "Add Contact" flow. Keeps the dropdown list and the
  // receipt's selected Contact Name in sync no matter which modal added it.
  const handleContactAdded = (newContactName) => {
    setContactOptions((prev) =>
      prev.includes(newContactName) ? prev : [...prev, newContactName],
    );
    setFormData((prev) => ({ ...prev, contactName: newContactName }));
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
                <tr
                  key={receipt._id || index}
                  className="clickable-row"
                  onClick={() => handleRowClick(receipt)}
                >
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

      {rowLoading && (
        <div className="jr-row-loading-overlay">
          <span>Loading receipt...</span>
        </div>
      )}

      {showModal && (
        <AddReceiptModal
          onClose={() => {
            setShowModal(false);
            setIsEditMode(false);
          }}
          onSave={handleSave}
          onPrint={handlePrintPreview}
          formData={formData}
          onChange={handleChange}
          onOpenLookup={() => setShowLookup(true)}
          onOpenJobNumber={handleOpenJobNumber}
          onEditJobNumber={handleEditJobNumber}
          user={user}
          jobNumbers={jobNumbers}
          contactOptions={contactOptions}
          onCustomerIDBlur={fetchContactsByCustomerID}
          onContactAdded={handleContactAdded}
          isEditMode={isEditMode}
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
          onOnSiteChange={handleOnSiteChange}
          onJobTypeChange={handleJobTypeChange}
          jobReceiptID={formData.jrId}
          onOpenInstrumentList={() => setShowInstrumentList(true)}
          onOpenRecall={() => setShowRecall(true)}
          isEditing={editingJobIndex !== null}
          reservingNumber={reservingNumber}
          customerID={formData.customerID}
          contactOptions={contactOptions}
          onContactAdded={handleContactAdded}
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

      {showPrintModal && printData && (
        <PrintReceiptModal
          receipt={printData}
          onClose={() => {
            setShowPrintModal(false);
            setPrintData(null);
          }}
        />
      )}
    </div>
  );
};

export default JobReceipt;
