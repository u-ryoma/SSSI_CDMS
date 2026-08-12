// import React, { useState, useEffect } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import CustomerLookupModal from "../jobreceipt/CustomerLookupModal";
// import JobNumberModal from "../jobreceipt/JobNumberModal";
// import InstrumentListModal from "../jobreceipt/InstrumentListModal";
// import RecallJobModal from "../jobreceipt/RecallJobModal";
// import PrintReceiptModalOnSite from "./PrintTermsConditionOnsite"; // adjust path if this actually lives elsewhere (e.g. ../jobreceipt/PrintReceiptModalOnSite)
// import { emptyJobForm } from "../jobreceipt/index";
// import "../jobreceipt.css"; // JobNumberModal's styles (jr-*, jn-*)
// import "./AddSiteCalibrationModal.css";

// const API = import.meta.env.VITE_API_URL;

// const AddSiteCalibrationModal = ({ isOpen, onClose, onSaved, editingScId }) => {
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);

//   // Header identifiers
//   const [scId, setScId] = useState("");
//   const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

//   // Customer block
//   const [customerId, setCustomerId] = useState("");
//   const [vat, setVat] = useState("0 VAT");
//   const [companyName, setCompanyName] = useState("");
//   const [address, setAddress] = useState("");

//   // Contact block
//   const [contactInfo, setContactInfo] = useState("");
//   const [reference, setReference] = useState("---");
//   const [contactName, setContactName] = useState("");
//   const [contactOptions, setContactOptions] = useState([]); // [{ contactName, contactID, ... }]
//   const [preparedBy, setPreparedBy] = useState("");

//   // Job table — each row is a FULL job number record (same shape as
//   // JobNumberModal's jobForm), not a trimmed display-only shape.
//   const [jobRows, setJobRows] = useState([]);
//   const [jobForm, setJobForm] = useState(emptyJobForm);
//   const [showJobModal, setShowJobModal] = useState(false);
//   const [editingJobIndex, setEditingJobIndex] = useState(null);
//   const [reservingNumber, setReservingNumber] = useState(false);
//   const [showInstrumentList, setShowInstrumentList] = useState(false);
//   const [showRecall, setShowRecall] = useState(false);
//   const [allJobNumbers, setAllJobNumbers] = useState([]); // for Recall modal

//   // Remarks
//   const [remarks, setRemarks] = useState("---");

//   // Technicians — populated from registered accounts with a technician role
//   const [technicianOptions, setTechnicianOptions] = useState([]);
//   const [selectedTechnicianIds, setSelectedTechnicianIds] = useState([]);
//   const [showTechnicianDropdown, setShowTechnicianDropdown] = useState(false);

//   // Picker modal stubs
//   const [showCustomerPicker, setShowCustomerPicker] = useState(false);
//   const [showContactPicker, setShowContactPicker] = useState(false);

//   // Print — Conditions of Calibration (on-site form)
//   const [showPrintModal, setShowPrintModal] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       fetchTechnicians();
//       fetchAllJobNumbers();
//       if (editingScId) {
//         loadExistingRecord(editingScId);
//       } else {
//         resetForm();
//         fetchNextId();
//         applyLoggedInUserAsPreparedBy();
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, editingScId]);

//   const getInitials = (name = "") =>
//     name
//       .trim()
//       .split(/\s+/)
//       .map((part) => part[0])
//       .join("")
//       .toUpperCase();

//   const fetchTechnicians = async () => {
//     try {
//       const res = await fetch(`${API}/api/accounts`);
//       if (!res.ok) return;
//       const accounts = await res.json();
//       const technicians = (Array.isArray(accounts) ? accounts : []).filter(
//         (acc) => acc.role === "technician",
//       );
//       setTechnicianOptions(technicians);
//     } catch (err) {
//       console.error("Failed to fetch technicians:", err);
//       setTechnicianOptions([]);
//     }
//   };

//   // Fetched so Recall Job Number (inside JobNumberModal) has something to
//   // search — same global list JobReceipt.jsx uses. Also used client-side
//   // to filter down to this record's own jobs when loading an existing one
//   // (GET /api/jobnumbers has no server-side filtering).
//   const fetchAllJobNumbers = async () => {
//     try {
//       const res = await fetch(`${API}/api/jobnumbers`);
//       const data = await res.json();
//       setAllJobNumbers(Array.isArray(data) ? data : []);
//       return Array.isArray(data) ? data : [];
//     } catch (err) {
//       console.error("Failed to fetch job numbers:", err);
//       setAllJobNumbers([]);
//       return [];
//     }
//   };

//   const toggleTechnician = (id) => {
//     setSelectedTechnicianIds((prev) =>
//       prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
//     );
//   };

//   const technicians = selectedTechnicianIds
//     .map((id) => {
//       const acc = technicianOptions.find((t) => (t._id || t.username) === id);
//       return acc ? getInitials(acc.name || acc.username) : "";
//     })
//     .filter(Boolean)
//     .join("/");

//   const applyLoggedInUserAsPreparedBy = () => {
//     const loggedInName =
//       sessionStorage.getItem("name") ||
//       sessionStorage.getItem("fullName") ||
//       sessionStorage.getItem("username") ||
//       "";
//     setPreparedBy(loggedInName);
//   };

//   const resetForm = () => {
//     setIsEditMode(false);
//     setCustomerId("");
//     setVat("0 VAT");
//     setCompanyName("");
//     setAddress("");
//     setContactInfo("");
//     setReference("---");
//     setContactName("");
//     setContactOptions([]);
//     setSelectedTechnicianIds([]);
//     setJobRows([]);
//     setJobForm(emptyJobForm);
//     setEditingJobIndex(null);
//     setRemarks("---");
//     setDate(new Date().toISOString().slice(0, 10));
//   };

//   const fetchNextId = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/sitecalibrations/next-id`);
//       if (res.ok) {
//         const data = await res.json();
//         setScId(data.nextScId || "");
//       }
//     } catch (err) {
//       console.error("Failed to fetch next Site Calibration ID:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // LOAD EXISTING — fetches the site calibration record, then filters the
//   // already-fetched job numbers list client-side by scId (mirrors
//   // JobReceipt.jsx's handleRowClick, since /api/jobnumbers has no
//   // server-side filter to rely on).
//   const loadExistingRecord = async (id) => {
//     setLoading(true);
//     setIsEditMode(true);
//     setEditingJobIndex(null);
//     try {
//       const res = await fetch(
//         `${API}/api/sitecalibrations/${encodeURIComponent(id)}`,
//       );
//       if (!res.ok) throw new Error("Failed to load site calibration");
//       const record = await res.json();

//       setScId(record.scId || id);
//       setDate(record.date || new Date().toISOString().slice(0, 10));
//       setCustomerId(record.customerId || "");
//       setVat(record.vat || "0 VAT");
//       setCompanyName(record.companyName || "");
//       setAddress(record.companyAddress || "");
//       setContactInfo(record.contactInfo || "");
//       setReference(record.refNo || "---");
//       setContactName(record.contactName || "");
//       setPreparedBy(record.preparedBy || "");
//       setSelectedTechnicianIds(record.technicianIds || []);
//       setRemarks(record.remarks || "---");

//       if (record.customerId) {
//         await fetchContactsForCustomer(record.customerId);
//       } else {
//         setContactOptions([]);
//       }

//       // Job numbers aren't stored on the record itself — fetch + filter,
//       // same normalized pattern as job receipts.
//       const allJobs = await fetchAllJobNumbers();
//       const relatedJobs = allJobs.filter(
//         (job) => job.scId === (record.scId || id),
//       );
//       setJobRows(relatedJobs);
//     } catch (err) {
//       console.error("Failed to load site calibration:", err);
//       alert("Failed to load Site Calibration record.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenCustomerPicker = () => setShowCustomerPicker(true);

//   const handleSelectCustomer = (customer) => {
//     setCustomerId(customer.customerID || "");
//     setCompanyName(customer.companyName || "");
//     setAddress(customer.companyAddress || "");
//     setContactInfo(customer.phoneNumber || "");
//     setVat(customer.vat || "0 VAT");
//     setContactName("");
//     setShowCustomerPicker(false);

//     setContactOptions(
//       (customer.contactNames || []).map((name) => ({ contactName: name })),
//     );
//     if (customer.customerID) {
//       fetchContactsForCustomer(customer.customerID);
//     }
//   };

//   const fetchContactsForCustomer = async (customerID) => {
//     try {
//       const res = await fetch(
//         `${API}/api/customers/${encodeURIComponent(customerID)}/contacts/full`,
//       );
//       if (!res.ok) return;
//       const contacts = await res.json();
//       if (Array.isArray(contacts) && contacts.length > 0) {
//         setContactOptions(contacts);
//       }
//     } catch (err) {
//       console.error("Failed to fetch contacts for customer:", err);
//     }
//   };

//   const handleOpenContactPicker = () => setShowContactPicker(true);

//   const handleContactAdded = (newContactName) => {
//     setContactOptions((prev) =>
//       prev.some((c) => c.contactName === newContactName)
//         ? prev
//         : [...prev, { contactName: newContactName }],
//     );
//     setContactName(newContactName);
//   };

//   // ===== Job number handlers (mirrors JobReceipt.jsx) =====

//   const handleJobChange = (e) =>
//     setJobForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//   const handleOnSiteChange = (e) => {
//     const checked = e.target.checked;
//     setJobForm((prev) => ({ ...prev, onSite: checked, tagged: checked }));
//   };

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
//       photoUrl: job.photoUrl || "",
//       // onSite/tagged intentionally NOT overwritten from the recalled job —
//       // this record belongs to a Site Calibration, so it stays on-site.
//     }));
//     setShowRecall(false);
//   };

//   // "Add" — opens a blank job, defaulted to on-site since every job added
//   // here belongs to a Site Calibration. Date and Company are pulled from
//   // the parent SC record so they travel with the job into the
//   // jobnumbers collection (and show correctly in Incoming Calibration /
//   // the Job Number list, instead of being blank there).
//   const handleOpenJobNumber = () => {
//     setEditingJobIndex(null);
//     setJobForm({
//       ...emptyJobForm,
//       onSite: true,
//       tagged: true,
//       date,
//       companyName,
//       customerId,
//     });
//     setShowJobModal(true);
//   };

//   const handleEditJobNumber = (index) => {
//     setEditingJobIndex(index);
//     setJobForm({ ...jobRows[index] });
//     setShowJobModal(true);
//   };

//   // Re-stamp date/companyName from the current SC record on every save,
//   // so edited jobs always match this record even if the SC's date or
//   // company changed after the job was first added.
//   const handleSaveJobNumber = () => {
//     const stamped = { ...jobForm, date, companyName, customerId };

//     if (editingJobIndex !== null) {
//       setJobRows((prev) =>
//         prev.map((job, i) => (i === editingJobIndex ? stamped : job)),
//       );
//       setEditingJobIndex(null);
//     } else {
//       setJobRows((prev) => [...prev, { ...stamped, _isNew: true }]);
//     }
//     setShowJobModal(false);
//   };

//   const handleCancelJobNumber = () => {
//     if (editingJobIndex === null) return;
//     setJobRows((prev) => prev.filter((_, i) => i !== editingJobIndex));
//     setEditingJobIndex(null);
//     setShowJobModal(false);
//   };

//   // ===== Save the whole Site Calibration =====

//   const handleUpdate = async () => {
//     setSaving(true);
//     try {
//       const payload = {
//         scId,
//         date,
//         customerId,
//         vat,
//         companyName,
//         companyAddress: address,
//         contactInfo,
//         refNo: reference,
//         contactName,
//         preparedBy,
//         technicians,
//         technicianIds: selectedTechnicianIds,
//         jobs: [], // jobs live in the jobnumbers collection, linked via scId — not duplicated here
//         remarks,
//       };

//       const url = isEditMode
//         ? `${API}/api/sitecalibrations/${encodeURIComponent(scId)}`
//         : `${API}/api/sitecalibrations`;
//       const method = isEditMode ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Failed to save site calibration");
//       const saved = await res.json();
//       const savedScId = saved.scId || scId;

//       for (const job of jobRows) {
//         const isExistingJob = Boolean(job._id) && !job._isNew;
//         const jobUrl = isExistingJob
//           ? `${API}/api/jobnumbers/${job._id}`
//           : `${API}/api/jobnumbers`;
//         const jobMethod = isExistingJob ? "PUT" : "POST";

//         const { _isNew, ...cleanJob } = job;

//         // Always send the SC record's current date/companyName, so the
//         // job number record carries them for other modules (Incoming
//         // Calibration, Job Number list) to display.
//         const jobRes = await fetch(jobUrl, {
//           method: jobMethod,
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             ...cleanJob,
//             scId: savedScId,
//             date,
//             dateRec: date,
//             companyName,
//             customerId,
//             // Site Calibration jobs skip Incoming Calibration and
//             // On-Going Calibration and go straight to For Typing.
//             // Must be marked as having PASSED those stages (tagged: true,
//             // ongoingTagged: true) rather than tagged: false — the
//             // dashboard's stage logic (server.js /api/stats/*) treats
//             // tagged !== true as "Pending Tagging" / not-yet-instrument-
//             // tagged, which would be wrong for these jobs.
//             tagged: true,
//             ongoingTagged: true,
//             forTypingTagged: true,
//           }),
//         });
//         const jobData = await jobRes.json();

//         if (jobData.success && !isExistingJob) {
//           // Fire-and-forget, same as JobReceipt.jsx — don't block save on Cloudinary.
//           fetch(
//             `${API}/api/uploads/job-folder/${encodeURIComponent(
//               jobData.jobNumber || job.jobNumber,
//             )}`,
//             { method: "POST" },
//           ).catch((err) =>
//             console.warn("Failed to pre-create Cloudinary folder:", err),
//           );
//         }
//       }

//       onSaved?.(saved);
//       onClose();
//       setIsEditMode(false);
//     } catch (err) {
//       console.error("Failed to save site calibration:", err);
//       alert("Failed to save Site Calibration record. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Opens the Conditions of Calibration (on-site) print modal. Every job
//   // row added on this screen already carries onSite: true (stamped in
//   // handleOpenJobNumber), so PrintReceiptModalOnSite's own
//   // `jobNumbers.find(j => j.onSite)?.jobNumber || jrId` fallback resolves
//   // correctly whether or not any jobs have been added yet.
//   const handlePrint = () => setShowPrintModal(true);
//   const handleModificationHistory = () =>
//     console.log("Modification History clicked");
//   const handleOpenSiteFolder = () => console.log("Open Folder clicked");

//   if (!isOpen) return null;

//   return (
//     <div className="scm-overlay">
//       <div className="scm-modal">
//         <CdmsModalHeader
//           title={
//             isEditMode
//               ? "SITE CALIBRATION DETAILS (EDIT)"
//               : "SITE CALIBRATION DETAILS"
//           }
//           subtitleBottom="SCIENTIFIC STANDARDS SERVICES"
//           onClose={onClose}
//         />

//         <div className="scm-body">
//           <div className="scm-top-grid">
//             {/* Left column */}
//             <div className="scm-col">
//               <div className="scm-field">
//                 <label className="scm-label">Customer ID</label>
//                 <div className="scm-inline-group">
//                   <input
//                     type="text"
//                     value={customerId}
//                     onChange={(e) => setCustomerId(e.target.value)}
//                   />
//                   <button
//                     type="button"
//                     className="scm-icon-btn"
//                     onClick={handleOpenCustomerPicker}
//                     title="Look up customer"
//                   >
//                     🔍
//                   </button>
//                 </div>
//               </div>

//               <div className="scm-field">
//                 <label className="scm-label">Company Name</label>
//                 <textarea
//                   rows={2}
//                   value={companyName}
//                   onChange={(e) => setCompanyName(e.target.value)}
//                 />
//               </div>

//               <div className="scm-field">
//                 <label className="scm-label">Address</label>
//                 <textarea
//                   rows={2}
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                 />
//               </div>

//               <div className="scm-field">
//                 <label className="scm-label">Contact Info</label>
//                 <textarea
//                   rows={2}
//                   value={contactInfo}
//                   onChange={(e) => setContactInfo(e.target.value)}
//                 />
//               </div>

//               <div className="scm-field">
//                 <label className="scm-label">VAT</label>
//                 <input
//                   type="text"
//                   value={vat}
//                   onChange={(e) => setVat(e.target.value)}
//                 />
//               </div>

//               <div className="scm-field">
//                 <label className="scm-label">Contact Name</label>
//                 <div className="scm-inline-group">
//                   <select
//                     value={contactName}
//                     onChange={(e) => setContactName(e.target.value)}
//                   >
//                     <option value="">
//                       {contactOptions.length > 0
//                         ? "Select contact..."
//                         : "No contacts for this customer"}
//                     </option>
//                     {contactOptions.map((c, idx) => (
//                       <option
//                         key={c.contactID || c.contactName || idx}
//                         value={c.contactName}
//                       >
//                         {c.contactName}
//                       </option>
//                     ))}
//                   </select>
//                   <button
//                     type="button"
//                     className="scm-icon-btn"
//                     onClick={handleOpenContactPicker}
//                     title="Manage contacts"
//                   >
//                     📋
//                   </button>
//                 </div>
//               </div>

//               <div className="scm-field">
//                 <label className="scm-label">Prepared By</label>
//                 <input
//                   type="text"
//                   className="scm-readonly"
//                   value={preparedBy || "Loading..."}
//                   readOnly
//                 />
//               </div>
//             </div>

//             {/* Right column */}
//             <div className="scm-col">
//               <div className="scm-row-inline">
//                 <div className="scm-field scm-field-grow">
//                   <label className="scm-label">Site Calibration ID</label>
//                   <input
//                     type="text"
//                     className="scm-readonly"
//                     value={loading ? "Loading..." : scId}
//                     readOnly
//                   />
//                 </div>
//                 <div className="scm-field">
//                   <label className="scm-label">Date</label>
//                   <input
//                     type="date"
//                     value={date}
//                     onChange={(e) => setDate(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <div className="scm-field">
//                 <label className="scm-label">Reference</label>
//                 <input
//                   type="text"
//                   value={reference}
//                   onChange={(e) => setReference(e.target.value)}
//                 />
//               </div>

//               <div className="scm-field">
//                 <label className="scm-label">Remarks</label>
//                 <textarea
//                   rows={2}
//                   value={remarks}
//                   onChange={(e) => setRemarks(e.target.value)}
//                 />
//               </div>

//               <div className="scm-field scm-technician-field">
//                 <label className="scm-label">Technicians</label>
//                 <div className="scm-technician-picker">
//                   <button
//                     type="button"
//                     className="scm-technician-trigger"
//                     onClick={() => setShowTechnicianDropdown((v) => !v)}
//                   >
//                     {technicians || "Select technicians..."}
//                     <span className="scm-technician-caret">▾</span>
//                   </button>
//                   {showTechnicianDropdown && (
//                     <div className="scm-technician-dropdown">
//                       {technicianOptions.length > 0 ? (
//                         technicianOptions.map((tech) => {
//                           const id = tech._id || tech.username;
//                           return (
//                             <label key={id} className="scm-technician-option">
//                               <input
//                                 type="checkbox"
//                                 checked={selectedTechnicianIds.includes(id)}
//                                 onChange={() => toggleTechnician(id)}
//                               />
//                               {tech.name || tech.username}{" "}
//                               <span className="scm-technician-initials">
//                                 ({getInitials(tech.name || tech.username)})
//                               </span>
//                             </label>
//                           );
//                         })
//                       ) : (
//                         <div className="scm-technician-empty">
//                           No registered technicians found.
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="scm-jobs-toolbar">
//             <button
//               type="button"
//               className="scm-add-btn"
//               onClick={handleOpenJobNumber}
//             >
//               Add
//             </button>

//             <div className="scm-jobs-toolbar-spacer" />

//             <button
//               type="button"
//               className="scm-ghost-btn"
//               onClick={handleModificationHistory}
//             >
//               Modification History
//             </button>
//             <button
//               type="button"
//               className="scm-ghost-btn"
//               onClick={handleOpenSiteFolder}
//             >
//               Open Folder
//             </button>
//             <button
//               type="button"
//               className="scm-ghost-btn"
//               onClick={handlePrint}
//             >
//               Print
//             </button>
//             <button
//               type="button"
//               className="scm-update-btn"
//               onClick={handleUpdate}
//               disabled={saving}
//             >
//               {saving ? "Saving..." : isEditMode ? "Update" : "Save"}
//             </button>
//           </div>

//           <div className="scm-jobs-table-wrapper">
//             <table className="scm-jobs-table">
//               <thead>
//                 <tr>
//                   <th>Job Number</th>
//                   <th>Type</th>
//                   <th>Description</th>
//                   <th>Brand</th>
//                   <th>Model</th>
//                   <th>Serial No.</th>
//                   <th>Remarks</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {jobRows.length > 0 ? (
//                   jobRows.map((row, idx) => (
//                     <tr
//                       key={row._id || idx}
//                       className="scm-row-clickable"
//                       onClick={() => handleEditJobNumber(idx)}
//                     >
//                       <td>{row.jobNumber}</td>
//                       <td>
//                         {row.type === "electrical"
//                           ? "Electrical"
//                           : "Mechanical"}
//                       </td>
//                       <td>{row.description}</td>
//                       <td>{row.brand}</td>
//                       <td>{row.model}</td>
//                       <td>{row.serialNo}</td>
//                       <td>{row.remarks}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={7} className="scm-no-jobs">
//                       No jobs added yet. Click "Add" to add an on-site job.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {showCustomerPicker && (
//         <CustomerLookupModal
//           onClose={() => setShowCustomerPicker(false)}
//           onSelect={handleSelectCustomer}
//         />
//       )}
//       {showContactPicker && (
//         <div className="scm-picker-stub">
//           <p>
//             Contact picker goes here (wire to AddContactSubModal / shared
//             contact list).
//           </p>
//           <button onClick={() => setShowContactPicker(false)}>Close</button>
//         </div>
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
//           parentId={scId}
//           parentLabel="Site Calibration ID"
//           onOpenInstrumentList={() => setShowInstrumentList(true)}
//           onOpenRecall={() => setShowRecall(true)}
//           isEditing={editingJobIndex !== null}
//           reservingNumber={reservingNumber}
//           customerID={customerId}
//           contactOptions={contactOptions.map((c) => c.contactName)}
//           onContactAdded={handleContactAdded}
//           // No on-site toggle needed here — every job created via this
//           // modal already has onSite: true / tagged: true stamped on by
//           // handleOpenJobNumber above, before JobNumberModal ever opens.
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

//       {showPrintModal && (
//         <PrintReceiptModalOnSite
//           receipt={{
//             jrId: scId,
//             date,
//             customerID: customerId,
//             companyName,
//             companyAddress: address,
//             contactInfo,
//             vat,
//             reference,
//             contactName,
//             preparedBy,
//             remarks,
//             jobNumbers: jobRows,
//           }}
//           onClose={() => setShowPrintModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default AddSiteCalibrationModal;
import React, { useState, useEffect } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import CustomerLookupModal from "../jobreceipt/CustomerLookupModal";
import JobNumberModal from "../jobreceipt/JobNumberModal";
import InstrumentListModal from "../jobreceipt/InstrumentListModal";
import RecallJobModal from "../jobreceipt/RecallJobModal";
import PrintReceiptModalOnSite from "./PrintTermsConditionOnsite"; // adjust path if this actually lives elsewhere (e.g. ../jobreceipt/PrintReceiptModalOnSite)
import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal"; // adjust path if this actually lives elsewhere
import { emptyJobForm } from "../jobreceipt/index";
import "../jobreceipt.css"; // JobNumberModal's styles (jr-*, jn-*)
import "./AddSiteCalibrationModal.css";

const API = import.meta.env.VITE_API_URL;

const AddSiteCalibrationModal = ({ isOpen, onClose, onSaved, editingScId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Header identifiers
  const [scId, setScId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Customer block
  const [customerId, setCustomerId] = useState("");
  const [vat, setVat] = useState("0 VAT");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");

  // Contact block
  const [contactInfo, setContactInfo] = useState("");
  const [reference, setReference] = useState("---");
  const [contactName, setContactName] = useState("");
  const [contactOptions, setContactOptions] = useState([]); // [{ contactName, contactID, ... }]
  const [preparedBy, setPreparedBy] = useState("");

  // Job table — each row is a FULL job number record (same shape as
  // JobNumberModal's jobForm), not a trimmed display-only shape.
  const [jobRows, setJobRows] = useState([]);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobIndex, setEditingJobIndex] = useState(null);
  const [reservingNumber, setReservingNumber] = useState(false);
  const [showInstrumentList, setShowInstrumentList] = useState(false);
  const [showRecall, setShowRecall] = useState(false);
  const [allJobNumbers, setAllJobNumbers] = useState([]); // for Recall modal

  // Remarks
  const [remarks, setRemarks] = useState("---");

  // Technicians — populated from registered accounts with a technician role
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState([]);
  const [showTechnicianDropdown, setShowTechnicianDropdown] = useState(false);

  // Picker modal stubs
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);

  // Print — Conditions of Calibration (on-site form)
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Open Folder — shows Cloudinary files for every job on this record,
  // via the shared ReceiptFolderModal component.
  const [showSiteFolder, setShowSiteFolder] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTechnicians();
      fetchAllJobNumbers();
      if (editingScId) {
        loadExistingRecord(editingScId);
      } else {
        resetForm();
        fetchNextId();
        applyLoggedInUserAsPreparedBy();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingScId]);

  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API}/api/accounts`);
      if (!res.ok) return;
      const accounts = await res.json();
      const technicians = (Array.isArray(accounts) ? accounts : []).filter(
        (acc) => acc.role === "technician",
      );
      setTechnicianOptions(technicians);
    } catch (err) {
      console.error("Failed to fetch technicians:", err);
      setTechnicianOptions([]);
    }
  };

  // Fetched so Recall Job Number (inside JobNumberModal) has something to
  // search — same global list JobReceipt.jsx uses. Also used client-side
  // to filter down to this record's own jobs when loading an existing one
  // (GET /api/jobnumbers has no server-side filtering).
  const fetchAllJobNumbers = async () => {
    try {
      const res = await fetch(`${API}/api/jobnumbers`);
      const data = await res.json();
      setAllJobNumbers(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Failed to fetch job numbers:", err);
      setAllJobNumbers([]);
      return [];
    }
  };

  const toggleTechnician = (id) => {
    setSelectedTechnicianIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const technicians = selectedTechnicianIds
    .map((id) => {
      const acc = technicianOptions.find((t) => (t._id || t.username) === id);
      return acc ? getInitials(acc.name || acc.username) : "";
    })
    .filter(Boolean)
    .join("/");

  const applyLoggedInUserAsPreparedBy = () => {
    const loggedInName =
      sessionStorage.getItem("name") ||
      sessionStorage.getItem("fullName") ||
      sessionStorage.getItem("username") ||
      "";
    setPreparedBy(loggedInName);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setCustomerId("");
    setVat("0 VAT");
    setCompanyName("");
    setAddress("");
    setContactInfo("");
    setReference("---");
    setContactName("");
    setContactOptions([]);
    setSelectedTechnicianIds([]);
    setJobRows([]);
    setJobForm(emptyJobForm);
    setEditingJobIndex(null);
    setRemarks("---");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const fetchNextId = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/sitecalibrations/next-id`);
      if (res.ok) {
        const data = await res.json();
        setScId(data.nextScId || "");
      }
    } catch (err) {
      console.error("Failed to fetch next Site Calibration ID:", err);
    } finally {
      setLoading(false);
    }
  };

  // LOAD EXISTING — fetches the site calibration record, then filters the
  // already-fetched job numbers list client-side by scId (mirrors
  // JobReceipt.jsx's handleRowClick, since /api/jobnumbers has no
  // server-side filter to rely on).
  const loadExistingRecord = async (id) => {
    setLoading(true);
    setIsEditMode(true);
    setEditingJobIndex(null);
    try {
      const res = await fetch(
        `${API}/api/sitecalibrations/${encodeURIComponent(id)}`,
      );
      if (!res.ok) throw new Error("Failed to load site calibration");
      const record = await res.json();

      setScId(record.scId || id);
      setDate(record.date || new Date().toISOString().slice(0, 10));
      setCustomerId(record.customerId || "");
      setVat(record.vat || "0 VAT");
      setCompanyName(record.companyName || "");
      setAddress(record.companyAddress || "");
      setContactInfo(record.contactInfo || "");
      setReference(record.refNo || "---");
      setContactName(record.contactName || "");
      setPreparedBy(record.preparedBy || "");
      setSelectedTechnicianIds(record.technicianIds || []);
      setRemarks(record.remarks || "---");

      if (record.customerId) {
        await fetchContactsForCustomer(record.customerId);
      } else {
        setContactOptions([]);
      }

      // Job numbers aren't stored on the record itself — fetch + filter,
      // same normalized pattern as job receipts.
      const allJobs = await fetchAllJobNumbers();
      const relatedJobs = allJobs.filter(
        (job) => job.scId === (record.scId || id),
      );
      setJobRows(relatedJobs);
    } catch (err) {
      console.error("Failed to load site calibration:", err);
      alert("Failed to load Site Calibration record.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustomerPicker = () => setShowCustomerPicker(true);

  const handleSelectCustomer = (customer) => {
    setCustomerId(customer.customerID || "");
    setCompanyName(customer.companyName || "");
    setAddress(customer.companyAddress || "");
    setContactInfo(customer.phoneNumber || "");
    setVat(customer.vat || "0 VAT");
    setContactName("");
    setShowCustomerPicker(false);

    setContactOptions(
      (customer.contactNames || []).map((name) => ({ contactName: name })),
    );
    if (customer.customerID) {
      fetchContactsForCustomer(customer.customerID);
    }
  };

  const fetchContactsForCustomer = async (customerID) => {
    try {
      const res = await fetch(
        `${API}/api/customers/${encodeURIComponent(customerID)}/contacts/full`,
      );
      if (!res.ok) return;
      const contacts = await res.json();
      if (Array.isArray(contacts) && contacts.length > 0) {
        setContactOptions(contacts);
      }
    } catch (err) {
      console.error("Failed to fetch contacts for customer:", err);
    }
  };

  const handleOpenContactPicker = () => setShowContactPicker(true);

  const handleContactAdded = (newContactName) => {
    setContactOptions((prev) =>
      prev.some((c) => c.contactName === newContactName)
        ? prev
        : [...prev, { contactName: newContactName }],
    );
    setContactName(newContactName);
  };

  // ===== Job number handlers (mirrors JobReceipt.jsx) =====

  const handleJobChange = (e) =>
    setJobForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOnSiteChange = (e) => {
    const checked = e.target.checked;
    setJobForm((prev) => ({ ...prev, onSite: checked, tagged: checked }));
  };

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
      photoUrl: job.photoUrl || "",
      // onSite/tagged intentionally NOT overwritten from the recalled job —
      // this record belongs to a Site Calibration, so it stays on-site.
    }));
    setShowRecall(false);
  };

  // "Add" — opens a blank job, defaulted to on-site since every job added
  // here belongs to a Site Calibration. Date and Company are pulled from
  // the parent SC record so they travel with the job into the
  // jobnumbers collection (and show correctly in Incoming Calibration /
  // the Job Number list, instead of being blank there).
  const handleOpenJobNumber = () => {
    setEditingJobIndex(null);
    setJobForm({
      ...emptyJobForm,
      onSite: true,
      tagged: true,
      date,
      companyName,
      customerId,
    });
    setShowJobModal(true);
  };

  const handleEditJobNumber = (index) => {
    setEditingJobIndex(index);
    setJobForm({ ...jobRows[index] });
    setShowJobModal(true);
  };

  // Re-stamp date/companyName from the current SC record on every save,
  // so edited jobs always match this record even if the SC's date or
  // company changed after the job was first added.
  const handleSaveJobNumber = () => {
    const stamped = { ...jobForm, date, companyName, customerId };

    if (editingJobIndex !== null) {
      setJobRows((prev) =>
        prev.map((job, i) => (i === editingJobIndex ? stamped : job)),
      );
      setEditingJobIndex(null);
    } else {
      setJobRows((prev) => [...prev, { ...stamped, _isNew: true }]);
    }
    setShowJobModal(false);
  };

  const handleCancelJobNumber = () => {
    if (editingJobIndex === null) return;
    setJobRows((prev) => prev.filter((_, i) => i !== editingJobIndex));
    setEditingJobIndex(null);
    setShowJobModal(false);
  };

  // ===== Save the whole Site Calibration =====

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const payload = {
        scId,
        date,
        customerId,
        vat,
        companyName,
        companyAddress: address,
        contactInfo,
        refNo: reference,
        contactName,
        preparedBy,
        technicians,
        technicianIds: selectedTechnicianIds,
        jobs: [], // jobs live in the jobnumbers collection, linked via scId — not duplicated here
        remarks,
      };

      const url = isEditMode
        ? `${API}/api/sitecalibrations/${encodeURIComponent(scId)}`
        : `${API}/api/sitecalibrations`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save site calibration");
      const saved = await res.json();
      const savedScId = saved.scId || scId;

      for (const job of jobRows) {
        const isExistingJob = Boolean(job._id) && !job._isNew;
        const jobUrl = isExistingJob
          ? `${API}/api/jobnumbers/${job._id}`
          : `${API}/api/jobnumbers`;
        const jobMethod = isExistingJob ? "PUT" : "POST";

        const { _isNew, ...cleanJob } = job;

        // Always send the SC record's current date/companyName, so the
        // job number record carries them for other modules (Incoming
        // Calibration, Job Number list) to display.
        const jobRes = await fetch(jobUrl, {
          method: jobMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...cleanJob,
            scId: savedScId,
            date,
            dateRec: date,
            companyName,
            customerId,
            // Site Calibration jobs skip Incoming Calibration and
            // On-Going Calibration and go straight to For Typing.
            // Must be marked as having PASSED those stages (tagged: true,
            // ongoingTagged: true) rather than tagged: false — the
            // dashboard's stage logic (server.js /api/stats/*) treats
            // tagged !== true as "Pending Tagging" / not-yet-instrument-
            // tagged, which would be wrong for these jobs.
            tagged: true,
            ongoingTagged: true,
            forTypingTagged: true,
          }),
        });
        const jobData = await jobRes.json();

        if (jobData.success && !isExistingJob) {
          // Fire-and-forget, same as JobReceipt.jsx — don't block save on Cloudinary.
          fetch(
            `${API}/api/uploads/job-folder/${encodeURIComponent(
              jobData.jobNumber || job.jobNumber,
            )}`,
            { method: "POST" },
          ).catch((err) =>
            console.warn("Failed to pre-create Cloudinary folder:", err),
          );
        }
      }

      onSaved?.(saved);
      onClose();
      setIsEditMode(false);
    } catch (err) {
      console.error("Failed to save site calibration:", err);
      alert("Failed to save Site Calibration record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Opens the Conditions of Calibration (on-site) print modal. Every job
  // row added on this screen already carries onSite: true (stamped in
  // handleOpenJobNumber), so PrintReceiptModalOnSite's own
  // `jobNumbers.find(j => j.onSite)?.jobNumber || jrId` fallback resolves
  // correctly whether or not any jobs have been added yet.
  const handlePrint = () => setShowPrintModal(true);
  const handleModificationHistory = () =>
    console.log("Modification History clicked");

  // Opens the shared ReceiptFolderModal, scoped to every job number on
  // this Site Calibration (jobRows already carries the full job-form
  // shape, which ReceiptFolderModal's normalizeJobNumbers accepts
  // directly via its jobNumbers prop).
  const handleOpenSiteFolder = () => setShowSiteFolder(true);

  if (!isOpen) return null;

  return (
    <div className="scm-overlay">
      <div className="scm-modal">
        <CdmsModalHeader
          title={
            isEditMode
              ? "SITE CALIBRATION DETAILS (EDIT)"
              : "SITE CALIBRATION DETAILS"
          }
          subtitleBottom="SCIENTIFIC STANDARDS SERVICES"
          onClose={onClose}
        />

        <div className="scm-body">
          <div className="scm-top-grid">
            {/* Left column */}
            <div className="scm-col">
              <div className="scm-field">
                <label className="scm-label">Customer ID</label>
                <div className="scm-inline-group">
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  />
                  <button
                    type="button"
                    className="scm-icon-btn"
                    onClick={handleOpenCustomerPicker}
                    title="Look up customer"
                  >
                    🔍
                  </button>
                </div>
              </div>

              <div className="scm-field">
                <label className="scm-label">Company Name</label>
                <textarea
                  rows={2}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="scm-field">
                <label className="scm-label">Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="scm-field">
                <label className="scm-label">Contact Info</label>
                <textarea
                  rows={2}
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>

              <div className="scm-field">
                <label className="scm-label">VAT</label>
                <input
                  type="text"
                  value={vat}
                  onChange={(e) => setVat(e.target.value)}
                />
              </div>

              <div className="scm-field">
                <label className="scm-label">Contact Name</label>
                <div className="scm-inline-group">
                  <select
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  >
                    <option value="">
                      {contactOptions.length > 0
                        ? "Select contact..."
                        : "No contacts for this customer"}
                    </option>
                    {contactOptions.map((c, idx) => (
                      <option
                        key={c.contactID || c.contactName || idx}
                        value={c.contactName}
                      >
                        {c.contactName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="scm-icon-btn"
                    onClick={handleOpenContactPicker}
                    title="Manage contacts"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="scm-field">
                <label className="scm-label">Prepared By</label>
                <input
                  type="text"
                  className="scm-readonly"
                  value={preparedBy || "Loading..."}
                  readOnly
                />
              </div>
            </div>

            {/* Right column */}
            <div className="scm-col">
              <div className="scm-row-inline">
                <div className="scm-field scm-field-grow">
                  <label className="scm-label">Site Calibration ID</label>
                  <input
                    type="text"
                    className="scm-readonly"
                    value={loading ? "Loading..." : scId}
                    readOnly
                  />
                </div>
                <div className="scm-field">
                  <label className="scm-label">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="scm-field">
                <label className="scm-label">Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="scm-field">
                <label className="scm-label">Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="scm-field scm-technician-field">
                <label className="scm-label">Technicians</label>
                <div className="scm-technician-picker">
                  <button
                    type="button"
                    className="scm-technician-trigger"
                    onClick={() => setShowTechnicianDropdown((v) => !v)}
                  >
                    {technicians || "Select technicians..."}
                    <span className="scm-technician-caret">▾</span>
                  </button>
                  {showTechnicianDropdown && (
                    <div className="scm-technician-dropdown">
                      {technicianOptions.length > 0 ? (
                        technicianOptions.map((tech) => {
                          const id = tech._id || tech.username;
                          return (
                            <label key={id} className="scm-technician-option">
                              <input
                                type="checkbox"
                                checked={selectedTechnicianIds.includes(id)}
                                onChange={() => toggleTechnician(id)}
                              />
                              {tech.name || tech.username}{" "}
                              <span className="scm-technician-initials">
                                ({getInitials(tech.name || tech.username)})
                              </span>
                            </label>
                          );
                        })
                      ) : (
                        <div className="scm-technician-empty">
                          No registered technicians found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="scm-jobs-toolbar">
            <button
              type="button"
              className="scm-add-btn"
              onClick={handleOpenJobNumber}
            >
              Add
            </button>

            <div className="scm-jobs-toolbar-spacer" />

            <button
              type="button"
              className="scm-ghost-btn"
              onClick={handleModificationHistory}
            >
              Modification History
            </button>
            <button
              type="button"
              className="scm-ghost-btn"
              onClick={handleOpenSiteFolder}
            >
              Open Folder
            </button>
            <button
              type="button"
              className="scm-ghost-btn"
              onClick={handlePrint}
            >
              Print
            </button>
            <button
              type="button"
              className="scm-update-btn"
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? "Saving..." : isEditMode ? "Update" : "Save"}
            </button>
          </div>

          <div className="scm-jobs-table-wrapper">
            <table className="scm-jobs-table">
              <thead>
                <tr>
                  <th>Job Number</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Serial No.</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {jobRows.length > 0 ? (
                  jobRows.map((row, idx) => (
                    <tr
                      key={row._id || idx}
                      className="scm-row-clickable"
                      onClick={() => handleEditJobNumber(idx)}
                    >
                      <td>{row.jobNumber}</td>
                      <td>
                        {row.type === "electrical"
                          ? "Electrical"
                          : "Mechanical"}
                      </td>
                      <td>{row.description}</td>
                      <td>{row.brand}</td>
                      <td>{row.model}</td>
                      <td>{row.serialNo}</td>
                      <td>{row.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="scm-no-jobs">
                      No jobs added yet. Click "Add" to add an on-site job.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCustomerPicker && (
        <CustomerLookupModal
          onClose={() => setShowCustomerPicker(false)}
          onSelect={handleSelectCustomer}
        />
      )}
      {showContactPicker && (
        <div className="scm-picker-stub">
          <p>
            Contact picker goes here (wire to AddContactSubModal / shared
            contact list).
          </p>
          <button onClick={() => setShowContactPicker(false)}>Close</button>
        </div>
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
          parentId={scId}
          parentLabel="Site Calibration ID"
          onOpenInstrumentList={() => setShowInstrumentList(true)}
          onOpenRecall={() => setShowRecall(true)}
          isEditing={editingJobIndex !== null}
          reservingNumber={reservingNumber}
          customerID={customerId}
          contactOptions={contactOptions.map((c) => c.contactName)}
          onContactAdded={handleContactAdded}
          // No on-site toggle needed here — every job created via this
          // modal already has onSite: true / tagged: true stamped on by
          // handleOpenJobNumber above, before JobNumberModal ever opens.
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

      {showPrintModal && (
        <PrintReceiptModalOnSite
          receipt={{
            jrId: scId,
            date,
            customerID: customerId,
            companyName,
            companyAddress: address,
            contactInfo,
            vat,
            reference,
            contactName,
            preparedBy,
            remarks,
            jobNumbers: jobRows,
          }}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showSiteFolder && (
        <ReceiptFolderModal
          onClose={() => setShowSiteFolder(false)}
          jobNumbers={jobRows}
          title="SITE CALIBRATION FOLDER"
        />
      )}
    </div>
  );
};

export default AddSiteCalibrationModal;
