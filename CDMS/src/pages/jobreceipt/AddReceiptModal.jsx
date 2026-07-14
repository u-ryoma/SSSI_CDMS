// // import React, { useState, useEffect } from "react";
// // import { createPortal } from "react-dom";
// // import ConfirmDialog from "../../components/ConfirmDialog";

// // const API = import.meta.env.VITE_API_URL;

// // // =====================
// // // INLINE ADD CONTACT MODAL
// // // =====================
// // const AddContactSubModal = ({ customerID, onClose, onContactAdded }) => {
// //   const [contactID, setContactID] = useState("");
// //   const [reserving, setReserving] = useState(true);
// //   const [contactName, setContactName] = useState("");
// //   const [contactType, setContactType] = useState("");
// //   const [remarks, setRemarks] = useState("");
// //   const [error, setError] = useState("");
// //   const [saving, setSaving] = useState(false);

// //   useEffect(() => {
// //     reserveContactID();
// //   }, []);

// //   const reserveContactID = async () => {
// //     setReserving(true);
// //     try {
// //       const res = await fetch(`${API}/api/contacts/reserve`, {
// //         method: "POST",
// //       });
// //       const data = await res.json();
// //       if (data.success) {
// //         setContactID(data.contactID);
// //       } else {
// //         setError("Failed to reserve a Contact ID.");
// //       }
// //     } catch (err) {
// //       console.error("Failed to reserve contact ID:", err);
// //       setError("Failed to reserve a Contact ID.");
// //     } finally {
// //       setReserving(false);
// //     }
// //   };

// //   const handleSave = async () => {
// //     if (!contactName.trim()) {
// //       setError("Contact Name is required.");
// //       return;
// //     }
// //     if (!contactType) {
// //       setError("Contact Type is required.");
// //       return;
// //     }
// //     setError("");
// //     setSaving(true);

// //     try {
// //       const res = await fetch(`${API}/api/contacts`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           contactID,
// //           customerID,
// //           contactName,
// //           contactType,
// //           remarks,
// //         }),
// //       });
// //       const data = await res.json();

// //       if (data.success) {
// //         onContactAdded(data.contact);
// //         onClose();
// //       } else {
// //         setError(data.message || "Failed to save contact.");
// //       }
// //     } catch (err) {
// //       console.error("Failed to save contact:", err);
// //       setError("Failed to save contact.");
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   return createPortal(
// //     <div className="jr-modal-overlay" onClick={onClose}>
// //       <div className="ac-modal-wrapper" onClick={(e) => e.stopPropagation()}>
// //         <div className="jr-modal-header">
// //           <div className="jr-modal-header-left">
// //             <div className="jr-cdms-logo">CDMS</div>
// //             <div className="jr-modal-title">
// //               <span className="jr-modal-title-main">
// //                 CONTACT INFORMATION DETAILS
// //               </span>
// //             </div>
// //           </div>
// //           <button className="jr-modal-close" onClick={onClose}>
// //             ✕
// //           </button>
// //         </div>

// //         <div className="ac-content">
// //           <div className="ac-id-row">
// //             <div className="ac-id-field">
// //               <label>Contact ID</label>
// //               <input
// //                 type="text"
// //                 value={reserving ? "Reserving..." : contactID}
// //                 disabled
// //                 className="jr-input-auto"
// //               />
// //             </div>
// //             <div className="ac-id-field">
// //               <label>Customer ID</label>
// //               <input
// //                 type="text"
// //                 value={customerID}
// //                 disabled
// //                 className="jr-input-auto"
// //               />
// //             </div>
// //           </div>

// //           {error && <p className="ac-error">{error}</p>}

// //           <div className="ac-field-row">
// //             <label>Contact Name</label>
// //             <input
// //               type="text"
// //               value={contactName}
// //               onChange={(e) => setContactName(e.target.value)}
// //               autoFocus
// //             />
// //           </div>

// //           <div className="ac-field-row">
// //             <label>Contact Type</label>
// //             <select
// //               value={contactType}
// //               onChange={(e) => setContactType(e.target.value)}
// //             >
// //               <option value="">-- Select --</option>
// //               <option value="Primary">Primary</option>
// //               <option value="Billing">Billing</option>
// //               <option value="Technical">Technical</option>
// //               <option value="Other">Other</option>
// //             </select>
// //           </div>

// //           <div className="ac-field-row ac-field-row-textarea">
// //             <label>Remarks</label>
// //             <textarea
// //               rows={4}
// //               value={remarks}
// //               onChange={(e) => setRemarks(e.target.value)}
// //             />
// //           </div>

// //           <div className="ac-footer">
// //             <button
// //               className="jr-save-btn"
// //               onClick={handleSave}
// //               disabled={saving || reserving}
// //             >
// //               {saving ? "Saving..." : "Save"}
// //             </button>
// //             <button
// //               className="jr-action-btn"
// //               onClick={onClose}
// //               disabled={saving}
// //             >
// //               Exit
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>,
// //     document.body,
// //   );
// // };

// // // =====================
// // // MAIN ADD RECEIPT MODAL
// // // =====================
// // const AddReceiptModal = ({
// //   onClose,
// //   onSave,
// //   formData,
// //   onChange,
// //   onOpenLookup,
// //   onOpenJobNumber,
// //   onEditJobNumber,
// //   user,
// //   jobNumbers,
// //   contactOptions,
// //   onCustomerIDBlur,
// //   onContactAdded,
// // }) => {
// //   const [errors, setErrors] = useState({});
// //   const [showAddContact, setShowAddContact] = useState(false);
// //   const [dialog, setDialog] = useState({
// //     show: false,
// //     title: "",
// //     message: "",
// //     onConfirm: null,
// //     onCancel: null,
// //     confirmLabel: "Confirm",
// //     cancelLabel: "Cancel",
// //     type: "default",
// //   });

// //   const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

// //   const showConfirm = (title, message, onConfirm, type = "danger") => {
// //     setDialog({
// //       show: true,
// //       title,
// //       message,
// //       onConfirm,
// //       onCancel: hideDialog,
// //       confirmLabel: "Confirm",
// //       cancelLabel: "Cancel",
// //       type,
// //     });
// //   };

// //   const showSuccess = (title, message, onConfirm) => {
// //     setDialog({
// //       show: true,
// //       title,
// //       message,
// //       onConfirm: onConfirm || hideDialog,
// //       onCancel: null,
// //       confirmLabel: "OK",
// //       cancelLabel: null,
// //       type: "default",
// //     });
// //   };

// //   // VALIDATE JOB RECEIPT FIELDS
// //   const validate = () => {
// //     const newErrors = {};

// //     if (!formData.customerID?.trim())
// //       newErrors.customerID = "Customer ID is required.";
// //     if (!formData.companyName?.trim())
// //       newErrors.companyName = "Company Name is required.";
// //     if (!formData.companyAddress?.trim())
// //       newErrors.companyAddress = "Address is required.";
// //     if (!formData.contactName?.trim())
// //       newErrors.contactName = "Contact Name is required.";
// //     if (!formData.date?.trim()) newErrors.date = "Date is required.";
// //     if (jobNumbers.length === 0)
// //       newErrors.jobNumbers = "At least one Job Number must be added.";

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleSaveClick = () => {
// //     if (!validate()) {
// //       showSuccess(
// //         "Incomplete Form",
// //         "Please fill in all required fields and add at least one job number before saving.",
// //         hideDialog,
// //       );
// //       return;
// //     }
// //     showConfirm(
// //       "Confirm Save",
// //       "Are you sure you want to save this Job Receipt?",
// //       () => {
// //         hideDialog();
// //         onSave();
// //       },
// //       "default",
// //     );
// //   };

// //   const handleCloseClick = () => {
// //     showConfirm(
// //       "Confirm Cancel",
// //       "Are you sure you want to cancel? All unsaved data will be lost.",
// //       () => {
// //         hideDialog();
// //         onClose();
// //       },
// //     );
// //   };

// //   return (
// //     <>
// //       {createPortal(
// //         <div className="jr-modal-overlay" onClick={handleCloseClick}>
// //           <div
// //             className="jr-modal-wrapper"
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             {/* FIXED HEADER */}
// //             <div className="jr-modal-header">
// //               <div className="jr-modal-header-left">
// //                 <div className="jr-cdms-logo">CDMS</div>
// //                 <div className="jr-modal-title">
// //                   <span className="jr-modal-title-sub">
// //                     CALIBRATION DATABASE AND MONITORING SYSTEM
// //                   </span>
// //                   <span className="jr-modal-title-main">
// //                     JOB RECEIPT DETAILS
// //                   </span>
// //                   <span className="jr-modal-title-sub">
// //                     SCIENTIFIC STANDARDS SERVICES
// //                   </span>
// //                 </div>
// //               </div>
// //               <button className="jr-modal-close" onClick={handleCloseClick}>
// //                 ✕
// //               </button>
// //             </div>

// //             {/* TOP ROW */}
// //             <div className="jr-top-row">
// //               <div className="jr-top-field">
// //                 <label>Job Receipt ID</label>
// //                 <input
// //                   type="text"
// //                   value={formData.jrId}
// //                   disabled
// //                   className="jr-input-auto"
// //                 />
// //               </div>
// //               <div className="jr-top-field">
// //                 <label>
// //                   Date{" "}
// //                   {errors.date && (
// //                     <span className="jr-error">*{errors.date}</span>
// //                   )}
// //                 </label>
// //                 <input
// //                   type="date"
// //                   name="date"
// //                   value={formData.date}
// //                   onChange={onChange}
// //                   className={errors.date ? "jr-input-error" : ""}
// //                 />
// //               </div>
// //               <div className="jr-top-field">
// //                 <label>
// //                   Customer ID{" "}
// //                   {errors.customerID && (
// //                     <span className="jr-error">*{errors.customerID}</span>
// //                   )}
// //                 </label>
// //                 <div className="jr-input-with-btn">
// //                   <input
// //                     type="text"
// //                     name="customerID"
// //                     value={formData.customerID}
// //                     onChange={onChange}
// //                     onBlur={(e) => onCustomerIDBlur(e.target.value)}
// //                     placeholder="Type or search..."
// //                     className={errors.customerID ? "jr-input-error" : ""}
// //                   />
// //                   <button
// //                     className="jr-lookup-btn"
// //                     title="Lookup Customer"
// //                     onClick={onOpenLookup}
// //                   >
// //                     🔍
// //                   </button>
// //                 </div>
// //               </div>
// //               <button className="jr-pdf-btn">Upload PDF</button>
// //             </div>

// //             {/* FORM BODY */}
// //             <div className="jr-form-body">
// //               <div className="jr-form-left">
// //                 <div className="jr-field-row">
// //                   <label>
// //                     Company Name{" "}
// //                     {errors.companyName && (
// //                       <span className="jr-error">*required</span>
// //                     )}
// //                   </label>
// //                   <input
// //                     type="text"
// //                     name="companyName"
// //                     value={formData.companyName}
// //                     onChange={onChange}
// //                     className={errors.companyName ? "jr-input-error" : ""}
// //                   />
// //                 </div>
// //                 <div className="jr-field-row">
// //                   <label>
// //                     Address{" "}
// //                     {errors.companyAddress && (
// //                       <span className="jr-error">*required</span>
// //                     )}
// //                   </label>
// //                   <textarea
// //                     name="companyAddress"
// //                     value={formData.companyAddress}
// //                     onChange={onChange}
// //                     className={errors.companyAddress ? "jr-input-error" : ""}
// //                   />
// //                 </div>
// //                 <div className="jr-field-row">
// //                   <label>Contact Info</label>
// //                   <textarea
// //                     name="contactInfo"
// //                     value={formData.contactInfo}
// //                     onChange={onChange}
// //                   />
// //                 </div>
// //                 <div className="jr-field-row">
// //                   <label>VAT</label>
// //                   <input
// //                     type="text"
// //                     name="vat"
// //                     value={formData.vat}
// //                     onChange={onChange}
// //                   />
// //                 </div>
// //                 <div className="jr-field-row">
// //                   <label>
// //                     Contact Name{" "}
// //                     {errors.contactName && (
// //                       <span className="jr-error">*required</span>
// //                     )}
// //                   </label>
// //                   <div className="jr-input-with-btn" style={{ flex: 1 }}>
// //                     <select
// //                       name="contactName"
// //                       value={formData.contactName}
// //                       onChange={onChange}
// //                       style={{ flex: 1 }}
// //                       className={errors.contactName ? "jr-input-error" : ""}
// //                       disabled={contactOptions.length === 0}
// //                     >
// //                       <option value="">
// //                         {contactOptions.length === 0
// //                           ? "-- No customer selected --"
// //                           : "-- Select Contact --"}
// //                       </option>
// //                       {contactOptions.map((name, idx) => (
// //                         <option key={idx} value={name}>
// //                           {name}
// //                         </option>
// //                       ))}
// //                     </select>
// //                     <button
// //                       className="jr-lookup-btn"
// //                       title="Add Contact"
// //                       onClick={() => setShowAddContact(true)}
// //                       disabled={!formData.customerID?.trim()}
// //                     >
// //                       📋
// //                     </button>
// //                   </div>
// //                 </div>
// //                 <div className="jr-field-row">
// //                   <label>Prepared By</label>
// //                   <input
// //                     type="text"
// //                     name="preparedBy"
// //                     value={user || formData.preparedBy}
// //                     disabled
// //                     className="jr-input-auto"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="jr-form-right">
// //                 <div className="jr-field-row">
// //                   <label>Reference</label>
// //                   <input
// //                     type="text"
// //                     name="reference"
// //                     value={formData.reference}
// //                     onChange={onChange}
// //                   />
// //                 </div>
// //                 <div className="jr-field-row">
// //                   <label>Remarks</label>
// //                   <textarea
// //                     name="remarks"
// //                     value={formData.remarks}
// //                     onChange={onChange}
// //                   />
// //                 </div>
// //               </div>
// //             </div>

// //             {/* BOTTOM ACTIONS */}
// //             <div className="jr-modal-actions">
// //               <div className="jr-modal-actions-left">
// //                 <button className="jr-add-btn" onClick={onOpenJobNumber}>
// //                   Add
// //                 </button>
// //                 <button className="jr-reserve-btn">Reserve Job Numbers</button>
// //               </div>
// //               <div className="jr-modal-actions-right">
// //                 <button className="jr-action-btn" disabled>
// //                   Modification History
// //                 </button>
// //                 <button className="jr-action-btn">Open Camera</button>
// //                 <button className="jr-action-btn">Open Folder</button>
// //                 <button className="jr-action-btn">Print</button>
// //                 <button className="jr-save-btn" onClick={handleSaveClick}>
// //                   Save
// //                 </button>
// //               </div>
// //             </div>

// //             {/* JOB NUMBER TABLE */}
// //             <div className="jr-job-table-wrapper">
// //               {errors.jobNumbers && (
// //                 <div className="jr-table-error">{errors.jobNumbers}</div>
// //               )}
// //               <table className="jr-job-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Job Number</th>
// //                     <th>Type</th>
// //                     <th>Description</th>
// //                     <th>Brand</th>
// //                     <th>Model</th>
// //                     <th>Serial No.</th>
// //                     <th>Remarks</th>
// //                     <th>Concern</th>
// //                     <th>Priority</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {jobNumbers.length > 0 ? (
// //                     jobNumbers.map((job, index) => (
// //                       <tr
// //                         key={index}
// //                         className="clickable-row"
// //                         onClick={() => onEditJobNumber(index)}
// //                       >
// //                         <td>{job.jobNumber}</td>
// //                         <td>
// //                           {job.type === "electrical"
// //                             ? "Electrical"
// //                             : "Mechanical"}
// //                         </td>
// //                         <td>{job.description}</td>
// //                         <td>{job.brand}</td>
// //                         <td>{job.model}</td>
// //                         <td>{job.serialNo}</td>
// //                         <td>{job.remarks}</td>
// //                         <td>{job.concern}</td>
// //                         <td>{job.priority}</td>
// //                       </tr>
// //                     ))
// //                   ) : (
// //                     <tr>
// //                       <td colSpan="9" className="jr-no-data">
// //                         No job numbers added yet.
// //                       </td>
// //                     </tr>
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>

// //           {/* CONFIRM DIALOG */}
// //           {dialog.show && (
// //             <ConfirmDialog
// //               title={dialog.title}
// //               message={dialog.message}
// //               onConfirm={dialog.onConfirm}
// //               onCancel={dialog.onCancel}
// //               confirmLabel={dialog.confirmLabel}
// //               cancelLabel={dialog.cancelLabel}
// //               type={dialog.type}
// //             />
// //           )}
// //         </div>,
// //         document.body,
// //       )}

// //       {/* ADD CONTACT MODAL (inline sub-component, separate portal) */}
// //       {showAddContact && (
// //         <AddContactSubModal
// //           customerID={formData.customerID}
// //           onClose={() => setShowAddContact(false)}
// //           onContactAdded={(newContact) => {
// //             onContactAdded(newContact.contactName);
// //           }}
// //         />
// //       )}
// //     </>
// //   );
// // };

// // export default AddReceiptModal;
// import React, { useState, useEffect } from "react";
// import { createPortal } from "react-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";

// const API = import.meta.env.VITE_API_URL;

// // =====================
// // INLINE ADD CONTACT MODAL
// // =====================
// const AddContactSubModal = ({ customerID, onClose, onContactAdded }) => {
//   const [contactID, setContactID] = useState("");
//   const [reserving, setReserving] = useState(true);
//   const [contactName, setContactName] = useState("");
//   const [contactType, setContactType] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     reserveContactID();
//   }, []);

//   const reserveContactID = async () => {
//     setReserving(true);
//     try {
//       const res = await fetch(`${API}/api/contacts/reserve`, {
//         method: "POST",
//       });
//       const data = await res.json();
//       if (data.success) {
//         setContactID(data.contactID);
//       } else {
//         setError("Failed to reserve a Contact ID.");
//       }
//     } catch (err) {
//       console.error("Failed to reserve contact ID:", err);
//       setError("Failed to reserve a Contact ID.");
//     } finally {
//       setReserving(false);
//     }
//   };

//   const handleSave = async () => {
//     if (!contactName.trim()) {
//       setError("Contact Name is required.");
//       return;
//     }
//     if (!contactType) {
//       setError("Contact Type is required.");
//       return;
//     }
//     setError("");
//     setSaving(true);

//     try {
//       const res = await fetch(`${API}/api/contacts`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contactID,
//           customerID,
//           contactName,
//           contactType,
//           remarks,
//         }),
//       });
//       const data = await res.json();

//       if (data.success) {
//         onContactAdded(data.contact);
//         onClose();
//       } else {
//         setError(data.message || "Failed to save contact.");
//       }
//     } catch (err) {
//       console.error("Failed to save contact:", err);
//       setError("Failed to save contact.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <div className="ac-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-main">
//                 CONTACT INFORMATION DETAILS
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         <div className="ac-content">
//           <div className="ac-id-row">
//             <div className="ac-id-field">
//               <label>Contact ID</label>
//               <input
//                 type="text"
//                 value={reserving ? "Reserving..." : contactID}
//                 disabled
//                 className="jr-input-auto"
//               />
//             </div>
//             <div className="ac-id-field">
//               <label>Customer ID</label>
//               <input
//                 type="text"
//                 value={customerID}
//                 disabled
//                 className="jr-input-auto"
//               />
//             </div>
//           </div>

//           {error && <p className="ac-error">{error}</p>}

//           <div className="ac-field-row">
//             <label>Contact Name</label>
//             <input
//               type="text"
//               value={contactName}
//               onChange={(e) => setContactName(e.target.value)}
//               autoFocus
//             />
//           </div>

//           <div className="ac-field-row">
//             <label>Contact Type</label>
//             <select
//               value={contactType}
//               onChange={(e) => setContactType(e.target.value)}
//             >
//               <option value="">-- Select --</option>
//               <option value="Primary">Primary</option>
//               <option value="Billing">Billing</option>
//               <option value="Technical">Technical</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           <div className="ac-field-row ac-field-row-textarea">
//             <label>Remarks</label>
//             <textarea
//               rows={4}
//               value={remarks}
//               onChange={(e) => setRemarks(e.target.value)}
//             />
//           </div>

//           <div className="ac-footer">
//             <button
//               className="jr-save-btn"
//               onClick={handleSave}
//               disabled={saving || reserving}
//             >
//               {saving ? "Saving..." : "Save"}
//             </button>
//             <button
//               className="jr-action-btn"
//               onClick={onClose}
//               disabled={saving}
//             >
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
// // MAIN ADD / EDIT RECEIPT MODAL
// // =====================
// const AddReceiptModal = ({
//   onClose,
//   onSave,
//   formData,
//   onChange,
//   onOpenLookup,
//   onOpenJobNumber,
//   onEditJobNumber,
//   user,
//   jobNumbers,
//   contactOptions,
//   onCustomerIDBlur,
//   onContactAdded,
//   isEditMode = false,
// }) => {
//   const [errors, setErrors] = useState({});
//   const [showAddContact, setShowAddContact] = useState(false);
//   const [dialog, setDialog] = useState({
//     show: false,
//     title: "",
//     message: "",
//     onConfirm: null,
//     onCancel: null,
//     confirmLabel: "Confirm",
//     cancelLabel: "Cancel",
//     type: "default",
//   });

//   const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

//   const showConfirm = (title, message, onConfirm, type = "danger") => {
//     setDialog({
//       show: true,
//       title,
//       message,
//       onConfirm,
//       onCancel: hideDialog,
//       confirmLabel: "Confirm",
//       cancelLabel: "Cancel",
//       type,
//     });
//   };

//   const showSuccess = (title, message, onConfirm) => {
//     setDialog({
//       show: true,
//       title,
//       message,
//       onConfirm: onConfirm || hideDialog,
//       onCancel: null,
//       confirmLabel: "OK",
//       cancelLabel: null,
//       type: "default",
//     });
//   };

//   // VALIDATE JOB RECEIPT FIELDS
//   const validate = () => {
//     const newErrors = {};

//     if (!formData.customerID?.trim())
//       newErrors.customerID = "Customer ID is required.";
//     if (!formData.companyName?.trim())
//       newErrors.companyName = "Company Name is required.";
//     if (!formData.companyAddress?.trim())
//       newErrors.companyAddress = "Address is required.";
//     if (!formData.contactName?.trim())
//       newErrors.contactName = "Contact Name is required.";
//     if (!formData.date?.trim()) newErrors.date = "Date is required.";
//     if (jobNumbers.length === 0)
//       newErrors.jobNumbers = "At least one Job Number must be added.";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveClick = () => {
//     if (!validate()) {
//       showSuccess(
//         "Incomplete Form",
//         "Please fill in all required fields and add at least one job number before saving.",
//         hideDialog,
//       );
//       return;
//     }
//     showConfirm(
//       "Confirm Save",
//       isEditMode
//         ? "Save changes to this Job Receipt?"
//         : "Are you sure you want to save this Job Receipt?",
//       () => {
//         hideDialog();
//         onSave();
//       },
//       "default",
//     );
//   };

//   const handleCloseClick = () => {
//     showConfirm(
//       "Confirm Cancel",
//       isEditMode
//         ? "Discard unsaved changes to this Job Receipt?"
//         : "Are you sure you want to cancel? All unsaved data will be lost.",
//       () => {
//         hideDialog();
//         onClose();
//       },
//     );
//   };

//   return (
//     <>
//       {createPortal(
//         <div className="jr-modal-overlay" onClick={handleCloseClick}>
//           <div
//             className="jr-modal-wrapper"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* FIXED HEADER */}
//             <div className="jr-modal-header">
//               <div className="jr-modal-header-left">
//                 <div className="jr-cdms-logo">CDMS</div>
//                 <div className="jr-modal-title">
//                   <span className="jr-modal-title-sub">
//                     CALIBRATION DATABASE AND MONITORING SYSTEM
//                   </span>
//                   <span className="jr-modal-title-main">
//                     {isEditMode
//                       ? "JOB RECEIPT DETAILS (EDIT)"
//                       : "JOB RECEIPT DETAILS"}
//                   </span>
//                   <span className="jr-modal-title-sub">
//                     SCIENTIFIC STANDARDS SERVICES
//                   </span>
//                 </div>
//               </div>
//               <button className="jr-modal-close" onClick={handleCloseClick}>
//                 ✕
//               </button>
//             </div>

//             {/* TOP ROW */}
//             <div className="jr-top-row">
//               <div className="jr-top-field">
//                 <label>Job Receipt ID</label>
//                 <input
//                   type="text"
//                   value={formData.jrId}
//                   disabled
//                   className="jr-input-auto"
//                 />
//               </div>
//               <div className="jr-top-field">
//                 <label>
//                   Date{" "}
//                   {errors.date && (
//                     <span className="jr-error">*{errors.date}</span>
//                   )}
//                 </label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={onChange}
//                   className={errors.date ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-top-field">
//                 <label>
//                   Customer ID{" "}
//                   {errors.customerID && (
//                     <span className="jr-error">*{errors.customerID}</span>
//                   )}
//                 </label>
//                 <div className="jr-input-with-btn">
//                   <input
//                     type="text"
//                     name="customerID"
//                     value={formData.customerID}
//                     onChange={onChange}
//                     onBlur={(e) => onCustomerIDBlur(e.target.value)}
//                     placeholder="Type or search..."
//                     className={errors.customerID ? "jr-input-error" : ""}
//                   />
//                   <button
//                     className="jr-lookup-btn"
//                     title="Lookup Customer"
//                     onClick={onOpenLookup}
//                   >
//                     🔍
//                   </button>
//                 </div>
//               </div>
//               <button className="jr-pdf-btn">Upload PDF</button>
//             </div>

//             {/* FORM BODY */}
//             <div className="jr-form-body">
//               <div className="jr-form-left">
//                 <div className="jr-field-row">
//                   <label>
//                     Company Name{" "}
//                     {errors.companyName && (
//                       <span className="jr-error">*required</span>
//                     )}
//                   </label>
//                   <input
//                     type="text"
//                     name="companyName"
//                     value={formData.companyName}
//                     onChange={onChange}
//                     className={errors.companyName ? "jr-input-error" : ""}
//                   />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>
//                     Address{" "}
//                     {errors.companyAddress && (
//                       <span className="jr-error">*required</span>
//                     )}
//                   </label>
//                   <textarea
//                     name="companyAddress"
//                     value={formData.companyAddress}
//                     onChange={onChange}
//                     className={errors.companyAddress ? "jr-input-error" : ""}
//                   />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Contact Info</label>
//                   <textarea
//                     name="contactInfo"
//                     value={formData.contactInfo}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>VAT</label>
//                   <input
//                     type="text"
//                     name="vat"
//                     value={formData.vat}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>
//                     Contact Name{" "}
//                     {errors.contactName && (
//                       <span className="jr-error">*required</span>
//                     )}
//                   </label>
//                   <div className="jr-input-with-btn" style={{ flex: 1 }}>
//                     <select
//                       name="contactName"
//                       value={formData.contactName}
//                       onChange={onChange}
//                       style={{ flex: 1 }}
//                       className={errors.contactName ? "jr-input-error" : ""}
//                       disabled={contactOptions.length === 0}
//                     >
//                       <option value="">
//                         {contactOptions.length === 0
//                           ? "-- No customer selected --"
//                           : "-- Select Contact --"}
//                       </option>
//                       {contactOptions.map((name, idx) => (
//                         <option key={idx} value={name}>
//                           {name}
//                         </option>
//                       ))}
//                     </select>
//                     <button
//                       className="jr-lookup-btn"
//                       title="Add Contact"
//                       onClick={() => setShowAddContact(true)}
//                       disabled={!formData.customerID?.trim()}
//                     >
//                       📋
//                     </button>
//                   </div>
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Prepared By</label>
//                   <input
//                     type="text"
//                     name="preparedBy"
//                     value={
//                       isEditMode
//                         ? formData.preparedBy
//                         : user || formData.preparedBy
//                     }
//                     disabled
//                     className="jr-input-auto"
//                   />
//                 </div>
//               </div>

//               <div className="jr-form-right">
//                 <div className="jr-field-row">
//                   <label>Reference</label>
//                   <input
//                     type="text"
//                     name="reference"
//                     value={formData.reference}
//                     onChange={onChange}
//                   />
//                 </div>
//                 <div className="jr-field-row">
//                   <label>Remarks</label>
//                   <textarea
//                     name="remarks"
//                     value={formData.remarks}
//                     onChange={onChange}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* BOTTOM ACTIONS */}
//             <div className="jr-modal-actions">
//               <div className="jr-modal-actions-left">
//                 <button className="jr-add-btn" onClick={onOpenJobNumber}>
//                   Add
//                 </button>
//                 <button className="jr-reserve-btn">Reserve Job Numbers</button>
//               </div>
//               <div className="jr-modal-actions-right">
//                 <button className="jr-action-btn" disabled>
//                   Modification History
//                 </button>
//                 <button className="jr-action-btn">Open Camera</button>
//                 <button className="jr-action-btn">Open Folder</button>
//                 <button className="jr-action-btn">Print</button>
//                 <button className="jr-save-btn" onClick={handleSaveClick}>
//                   {isEditMode ? "Update" : "Save"}
//                 </button>
//               </div>
//             </div>

//             {/* JOB NUMBER TABLE */}
//             <div className="jr-job-table-wrapper">
//               {errors.jobNumbers && (
//                 <div className="jr-table-error">{errors.jobNumbers}</div>
//               )}
//               <table className="jr-job-table">
//                 <thead>
//                   <tr>
//                     <th>Job Number</th>
//                     <th>Type</th>
//                     <th>Description</th>
//                     <th>Brand</th>
//                     <th>Model</th>
//                     <th>Serial No.</th>
//                     <th>Remarks</th>
//                     <th>Concern</th>
//                     <th>Priority</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {jobNumbers.length > 0 ? (
//                     jobNumbers.map((job, index) => (
//                       <tr
//                         key={job._id || index}
//                         className="clickable-row"
//                         onClick={() => onEditJobNumber(index)}
//                       >
//                         <td>{job.jobNumber}</td>
//                         <td>
//                           {job.type === "electrical"
//                             ? "Electrical"
//                             : "Mechanical"}
//                         </td>
//                         <td>{job.description}</td>
//                         <td>{job.brand}</td>
//                         <td>{job.model}</td>
//                         <td>{job.serialNo}</td>
//                         <td>{job.remarks}</td>
//                         <td>{job.concern}</td>
//                         <td>{job.priority}</td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="9" className="jr-no-data">
//                         No job numbers added yet.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* CONFIRM DIALOG */}
//           {dialog.show && (
//             <ConfirmDialog
//               title={dialog.title}
//               message={dialog.message}
//               onConfirm={dialog.onConfirm}
//               onCancel={dialog.onCancel}
//               confirmLabel={dialog.confirmLabel}
//               cancelLabel={dialog.cancelLabel}
//               type={dialog.type}
//             />
//           )}
//         </div>,
//         document.body,
//       )}

//       {/* ADD CONTACT MODAL (inline sub-component, separate portal) */}
//       {showAddContact && (
//         <AddContactSubModal
//           customerID={formData.customerID}
//           onClose={() => setShowAddContact(false)}
//           onContactAdded={(newContact) => {
//             onContactAdded(newContact.contactName);
//           }}
//         />
//       )}
//     </>
//   );
// };

// export default AddReceiptModal;
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import AdminPasswordModal from "./AdminPasswordModal";

const API = import.meta.env.VITE_API_URL;

// =====================
// INLINE ADD CONTACT MODAL
// =====================
const AddContactSubModal = ({ customerID, onClose, onContactAdded }) => {
  const [contactID, setContactID] = useState("");
  const [reserving, setReserving] = useState(true);
  const [contactName, setContactName] = useState("");
  const [contactType, setContactType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    reserveContactID();
  }, []);

  const reserveContactID = async () => {
    setReserving(true);
    try {
      const res = await fetch(`${API}/api/contacts/reserve`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setContactID(data.contactID);
      } else {
        setError("Failed to reserve a Contact ID.");
      }
    } catch (err) {
      console.error("Failed to reserve contact ID:", err);
      setError("Failed to reserve a Contact ID.");
    } finally {
      setReserving(false);
    }
  };

  const handleSave = async () => {
    if (!contactName.trim()) {
      setError("Contact Name is required.");
      return;
    }
    if (!contactType) {
      setError("Contact Type is required.");
      return;
    }
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`${API}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactID,
          customerID,
          contactName,
          contactType,
          remarks,
        }),
      });
      const data = await res.json();

      if (data.success) {
        onContactAdded(data.contact);
        onClose();
      } else {
        setError(data.message || "Failed to save contact.");
      }
    } catch (err) {
      console.error("Failed to save contact:", err);
      setError("Failed to save contact.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <div className="ac-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-main">
                CONTACT INFORMATION DETAILS
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ac-content">
          <div className="ac-id-row">
            <div className="ac-id-field">
              <label>Contact ID</label>
              <input
                type="text"
                value={reserving ? "Reserving..." : contactID}
                disabled
                className="jr-input-auto"
              />
            </div>
            <div className="ac-id-field">
              <label>Customer ID</label>
              <input
                type="text"
                value={customerID}
                disabled
                className="jr-input-auto"
              />
            </div>
          </div>

          {error && <p className="ac-error">{error}</p>}

          <div className="ac-field-row">
            <label>Contact Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="ac-field-row">
            <label>Contact Type</label>
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="Primary">Primary</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="ac-field-row ac-field-row-textarea">
            <label>Remarks</label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="ac-footer">
            <button
              className="jr-save-btn"
              onClick={handleSave}
              disabled={saving || reserving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className="jr-action-btn"
              onClick={onClose}
              disabled={saving}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// =====================
// MAIN ADD / EDIT RECEIPT MODAL
// =====================
const AddReceiptModal = ({
  onClose,
  onSave,
  formData,
  onChange,
  onOpenLookup,
  onOpenJobNumber,
  onEditJobNumber,
  user,
  jobNumbers,
  contactOptions,
  onCustomerIDBlur,
  onContactAdded,
  isEditMode = false,
}) => {
  const [errors, setErrors] = useState({});
  const [showAddContact, setShowAddContact] = useState(false);

  // FIELD LOCK — existing receipts (isEditMode) open locked; a correct admin
  // password unlocks the receipt detail fields for the rest of this modal
  // session. Brand-new receipts are never locked.
  const [locked, setLocked] = useState(isEditMode);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    type: "default",
  });

  const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

  const showConfirm = (title, message, onConfirm, type = "danger") => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm,
      onCancel: hideDialog,
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      type,
    });
  };

  const showSuccess = (title, message, onConfirm) => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm: onConfirm || hideDialog,
      onCancel: null,
      confirmLabel: "OK",
      cancelLabel: null,
      type: "default",
    });
  };

  // VALIDATE JOB RECEIPT FIELDS
  const validate = () => {
    const newErrors = {};

    if (!formData.customerID?.trim())
      newErrors.customerID = "Customer ID is required.";
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company Name is required.";
    if (!formData.companyAddress?.trim())
      newErrors.companyAddress = "Address is required.";
    if (!formData.contactName?.trim())
      newErrors.contactName = "Contact Name is required.";
    if (!formData.date?.trim()) newErrors.date = "Date is required.";
    if (jobNumbers.length === 0)
      newErrors.jobNumbers = "At least one Job Number must be added.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (!validate()) {
      showSuccess(
        "Incomplete Form",
        "Please fill in all required fields and add at least one job number before saving.",
        hideDialog,
      );
      return;
    }
    showConfirm(
      "Confirm Save",
      isEditMode
        ? "Save changes to this Job Receipt?"
        : "Are you sure you want to save this Job Receipt?",
      () => {
        hideDialog();
        onSave();
      },
      "default",
    );
  };

  const handleCloseClick = () => {
    showConfirm(
      "Confirm Cancel",
      isEditMode
        ? "Discard unsaved changes to this Job Receipt?"
        : "Are you sure you want to cancel? All unsaved data will be lost.",
      () => {
        hideDialog();
        onClose();
      },
    );
  };

  const handleAdminVerified = () => {
    setShowAdminPrompt(false);
    setLocked(false);
  };

  return (
    <>
      {createPortal(
        <div className="jr-modal-overlay" onClick={handleCloseClick}>
          <div
            className="jr-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            {/* FIXED HEADER */}
            <div className="jr-modal-header">
              <div className="jr-modal-header-left">
                <div className="jr-cdms-logo">CDMS</div>
                <div className="jr-modal-title">
                  <span className="jr-modal-title-sub">
                    CALIBRATION DATABASE AND MONITORING SYSTEM
                  </span>
                  <span className="jr-modal-title-main">
                    {isEditMode
                      ? "JOB RECEIPT DETAILS (EDIT)"
                      : "JOB RECEIPT DETAILS"}
                  </span>
                  <span className="jr-modal-title-sub">
                    SCIENTIFIC STANDARDS SERVICES
                  </span>
                </div>
              </div>
              <button className="jr-modal-close" onClick={handleCloseClick}>
                ✕
              </button>
            </div>

            {locked && (
              <div className="jn-lock-banner">
                🔒 Fields are locked. Click anywhere below to enter the admin
                password and enable editing.
              </div>
            )}

            {/* LOCKABLE SECTION — top row + form body */}
            <div style={{ position: "relative" }}>
              {locked && (
                <div
                  className="jn-lock-overlay"
                  onClick={() => setShowAdminPrompt(true)}
                  title="Click to unlock editing (admin password required)"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 50,
                    cursor: "pointer",
                    background: "rgba(0, 0, 0, 0.03)",
                  }}
                />
              )}

              {/* TOP ROW */}
              <div className="jr-top-row">
                <div className="jr-top-field">
                  <label>Job Receipt ID</label>
                  <input
                    type="text"
                    value={formData.jrId}
                    disabled
                    className="jr-input-auto"
                  />
                </div>
                <div className="jr-top-field">
                  <label>
                    Date{" "}
                    {errors.date && (
                      <span className="jr-error">*{errors.date}</span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={onChange}
                    className={errors.date ? "jr-input-error" : ""}
                  />
                </div>
                <div className="jr-top-field">
                  <label>
                    Customer ID{" "}
                    {errors.customerID && (
                      <span className="jr-error">*{errors.customerID}</span>
                    )}
                  </label>
                  <div className="jr-input-with-btn">
                    <input
                      type="text"
                      name="customerID"
                      value={formData.customerID}
                      onChange={onChange}
                      onBlur={(e) => onCustomerIDBlur(e.target.value)}
                      placeholder="Type or search..."
                      className={errors.customerID ? "jr-input-error" : ""}
                    />
                    <button
                      className="jr-lookup-btn"
                      title="Lookup Customer"
                      onClick={onOpenLookup}
                    >
                      🔍
                    </button>
                  </div>
                </div>
                <button className="jr-pdf-btn">Upload PDF</button>
              </div>

              {/* FORM BODY */}
              <div className="jr-form-body">
                <div className="jr-form-left">
                  <div className="jr-field-row">
                    <label>
                      Company Name{" "}
                      {errors.companyName && (
                        <span className="jr-error">*required</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={onChange}
                      className={errors.companyName ? "jr-input-error" : ""}
                    />
                  </div>
                  <div className="jr-field-row">
                    <label>
                      Address{" "}
                      {errors.companyAddress && (
                        <span className="jr-error">*required</span>
                      )}
                    </label>
                    <textarea
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={onChange}
                      className={errors.companyAddress ? "jr-input-error" : ""}
                    />
                  </div>
                  <div className="jr-field-row">
                    <label>Contact Info</label>
                    <textarea
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={onChange}
                    />
                  </div>
                  <div className="jr-field-row">
                    <label>VAT</label>
                    <input
                      type="text"
                      name="vat"
                      value={formData.vat}
                      onChange={onChange}
                    />
                  </div>
                  <div className="jr-field-row">
                    <label>
                      Contact Name{" "}
                      {errors.contactName && (
                        <span className="jr-error">*required</span>
                      )}
                    </label>
                    <div className="jr-input-with-btn" style={{ flex: 1 }}>
                      <select
                        name="contactName"
                        value={formData.contactName}
                        onChange={onChange}
                        style={{ flex: 1 }}
                        className={errors.contactName ? "jr-input-error" : ""}
                        disabled={contactOptions.length === 0}
                      >
                        <option value="">
                          {contactOptions.length === 0
                            ? "-- No customer selected --"
                            : "-- Select Contact --"}
                        </option>
                        {contactOptions.map((name, idx) => (
                          <option key={idx} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="jr-lookup-btn"
                        title="Add Contact"
                        onClick={() => setShowAddContact(true)}
                        disabled={!formData.customerID?.trim()}
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  <div className="jr-field-row">
                    <label>Prepared By</label>
                    <input
                      type="text"
                      name="preparedBy"
                      value={
                        isEditMode
                          ? formData.preparedBy
                          : user || formData.preparedBy
                      }
                      disabled
                      className="jr-input-auto"
                    />
                  </div>
                </div>

                <div className="jr-form-right">
                  <div className="jr-field-row">
                    <label>Reference</label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={onChange}
                    />
                  </div>
                  <div className="jr-field-row">
                    <label>Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={onChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* END LOCKABLE SECTION */}

            {/* BOTTOM ACTIONS */}
            <div className="jr-modal-actions">
              <div className="jr-modal-actions-left">
                <button className="jr-add-btn" onClick={onOpenJobNumber}>
                  Add
                </button>
                <button className="jr-reserve-btn">Reserve Job Numbers</button>
              </div>
              <div className="jr-modal-actions-right">
                <button className="jr-action-btn" disabled>
                  Modification History
                </button>
                <button className="jr-action-btn">Open Camera</button>
                <button className="jr-action-btn">Open Folder</button>
                <button className="jr-action-btn">Print</button>
                <button className="jr-save-btn" onClick={handleSaveClick}>
                  {isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </div>

            {/* JOB NUMBER TABLE */}
            <div className="jr-job-table-wrapper">
              {errors.jobNumbers && (
                <div className="jr-table-error">{errors.jobNumbers}</div>
              )}
              <table className="jr-job-table">
                <thead>
                  <tr>
                    <th>Job Number</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Serial No.</th>
                    <th>Remarks</th>
                    <th>Concern</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {jobNumbers.length > 0 ? (
                    jobNumbers.map((job, index) => (
                      <tr
                        key={job._id || index}
                        className="clickable-row"
                        onClick={() => onEditJobNumber(index)}
                      >
                        <td>{job.jobNumber}</td>
                        <td>
                          {job.type === "electrical"
                            ? "Electrical"
                            : "Mechanical"}
                        </td>
                        <td>{job.description}</td>
                        <td>{job.brand}</td>
                        <td>{job.model}</td>
                        <td>{job.serialNo}</td>
                        <td>{job.remarks}</td>
                        <td>{job.concern}</td>
                        <td>{job.priority}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="jr-no-data">
                        No job numbers added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CONFIRM DIALOG */}
          {dialog.show && (
            <ConfirmDialog
              title={dialog.title}
              message={dialog.message}
              onConfirm={dialog.onConfirm}
              onCancel={dialog.onCancel}
              confirmLabel={dialog.confirmLabel}
              cancelLabel={dialog.cancelLabel}
              type={dialog.type}
            />
          )}

          {/* ADMIN PASSWORD PROMPT — unlocks receipt fields for this session on success */}
          {showAdminPrompt && (
            <AdminPasswordModal
              onClose={() => setShowAdminPrompt(false)}
              onVerified={handleAdminVerified}
            />
          )}
        </div>,
        document.body,
      )}

      {/* ADD CONTACT MODAL (inline sub-component, separate portal) */}
      {showAddContact && (
        <AddContactSubModal
          customerID={formData.customerID}
          onClose={() => setShowAddContact(false)}
          onContactAdded={(newContact) => {
            onContactAdded(newContact.contactName);
          }}
        />
      )}
    </>
  );
};

export default AddReceiptModal;
