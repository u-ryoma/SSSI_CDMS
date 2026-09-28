// import React, { useState } from "react";
// import { createPortal } from "react-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import AdminPasswordModal from "./AdminPasswordModal";
// import AddContactSubModal from "./AddContactSubModal";
// import ReceiptFolderModal from "./ReceiptFolderModal";

// // =====================
// // MAIN ADD / EDIT RECEIPT MODAL
// // =====================
// const AddReceiptModal = ({
//   onClose,
//   onSave,
//   onPrint,
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

//   // OPEN FOLDER — shows every file (equipment photos + documents) stored
//   // under each job number attached to this receipt, grouped by job
//   // number. Reuses the same /api/uploads/job-folder/:jobNumber/files
//   // route that JobNumberModal's per-job "Open Folder" already calls —
//   // this just loops it across every job number in `jobNumbers`.
//   const [showReceiptFolder, setShowReceiptFolder] = useState(false);

//   // FIELD LOCK — existing receipts (isEditMode) open locked; a correct admin
//   // password unlocks the receipt detail fields for the rest of this modal
//   // session. Brand-new receipts are never locked.
//   const [locked, setLocked] = useState(isEditMode);
//   const [showAdminPrompt, setShowAdminPrompt] = useState(false);

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

//   // VALIDATE JOB RECEIPT FIELDS — every field is required
//   const validate = () => {
//     const newErrors = {};

//     if (!formData.customerID?.trim())
//       newErrors.customerID = "Customer ID is required.";
//     if (!formData.companyName?.trim())
//       newErrors.companyName = "Company Name is required.";
//     if (!formData.companyAddress?.trim())
//       newErrors.companyAddress = "Address is required.";
//     if (!formData.contactInfo?.trim())
//       newErrors.contactInfo = "Contact Info is required.";
//     if (!formData.vat?.trim()) newErrors.vat = "VAT is required.";
//     if (!formData.contactName?.trim())
//       newErrors.contactName = "Contact Name is required.";
//     if (!formData.reference?.trim())
//       newErrors.reference = "Reference is required.";
//     if (!formData.remarks?.trim()) newErrors.remarks = "Remarks are required.";
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

//   const handleAdminVerified = () => {
//     setShowAdminPrompt(false);
//     setLocked(false);
//   };

//   // PRINT — only meaningful once at least one job number exists; a brand
//   // new, empty receipt has nothing worth previewing yet.
//   const handlePrintClick = () => {
//     if (jobNumbers.length === 0) {
//       showSuccess(
//         "Nothing to Print",
//         "Add at least one Job Number before printing a preview.",
//         hideDialog,
//       );
//       return;
//     }
//     onPrint?.();
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

//             {locked && (
//               <div className="jn-lock-banner">
//                 🔒 Fields are locked. Click anywhere below to enter the admin
//                 password and enable editing.
//               </div>
//             )}

//             {/* LOCKABLE SECTION — top row + form body */}
//             <div style={{ position: "relative" }}>
//               {locked && (
//                 <div
//                   className="jn-lock-overlay"
//                   onClick={() => setShowAdminPrompt(true)}
//                   title="Click to unlock editing (admin password required)"
//                   style={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     zIndex: 50,
//                     cursor: "pointer",
//                     background: "rgba(0, 0, 0, 0.03)",
//                   }}
//                 />
//               )}

//               {/* TOP ROW */}
//               <div className="jr-top-row">
//                 <div className="jr-top-field">
//                   <label>Job Receipt ID</label>
//                   <input
//                     type="text"
//                     value={formData.jrId}
//                     disabled
//                     className="jr-input-auto"
//                   />
//                 </div>
//                 <div className="jr-top-field">
//                   <label>
//                     Date{" "}
//                     {errors.date && (
//                       <span className="jr-error">*{errors.date}</span>
//                     )}
//                   </label>
//                   <input
//                     type="date"
//                     name="date"
//                     value={formData.date}
//                     onChange={onChange}
//                     className={errors.date ? "jr-input-error" : ""}
//                   />
//                 </div>
//                 <div className="jr-top-field">
//                   <label>
//                     Customer ID{" "}
//                     {errors.customerID && (
//                       <span className="jr-error">*{errors.customerID}</span>
//                     )}
//                   </label>
//                   <div className="jr-input-with-btn">
//                     <input
//                       type="text"
//                       name="customerID"
//                       value={formData.customerID}
//                       onChange={onChange}
//                       onBlur={(e) => onCustomerIDBlur(e.target.value)}
//                       placeholder="Type or search..."
//                       className={errors.customerID ? "jr-input-error" : ""}
//                     />
//                     <button
//                       className="jr-lookup-btn"
//                       title="Lookup Customer"
//                       onClick={onOpenLookup}
//                     >
//                       🔍
//                     </button>
//                   </div>
//                 </div>
//                 {/* <button className="jr-pdf-btn">Upload PDF</button> */}
//               </div>

//               {/* FORM BODY */}
//               <div className="jr-form-body">
//                 <div className="jr-form-left">
//                   <div className="jr-field-row">
//                     <label>
//                       Company Name{" "}
//                       {errors.companyName && (
//                         <span className="jr-error">*required</span>
//                       )}
//                     </label>
//                     <input
//                       type="text"
//                       name="companyName"
//                       value={formData.companyName}
//                       onChange={onChange}
//                       className={errors.companyName ? "jr-input-error" : ""}
//                     />
//                   </div>
//                   <div className="jr-field-row">
//                     <label>
//                       Address{" "}
//                       {errors.companyAddress && (
//                         <span className="jr-error">*required</span>
//                       )}
//                     </label>
//                     <textarea
//                       name="companyAddress"
//                       value={formData.companyAddress}
//                       onChange={onChange}
//                       className={errors.companyAddress ? "jr-input-error" : ""}
//                     />
//                   </div>
//                   <div className="jr-field-row">
//                     <label>
//                       Contact Info{" "}
//                       {errors.contactInfo && (
//                         <span className="jr-error">*required</span>
//                       )}
//                     </label>
//                     <textarea
//                       name="contactInfo"
//                       value={formData.contactInfo}
//                       onChange={onChange}
//                       className={errors.contactInfo ? "jr-input-error" : ""}
//                     />
//                   </div>
//                   <div className="jr-field-row">
//                     <label>
//                       VAT{" "}
//                       {errors.vat && (
//                         <span className="jr-error">*required</span>
//                       )}
//                     </label>
//                     <input
//                       type="text"
//                       name="vat"
//                       value={formData.vat}
//                       onChange={onChange}
//                       className={errors.vat ? "jr-input-error" : ""}
//                     />
//                   </div>
//                   <div className="jr-field-row">
//                     <label>
//                       Contact Name{" "}
//                       {errors.contactName && (
//                         <span className="jr-error">*required</span>
//                       )}
//                     </label>
//                     <div className="jr-input-with-btn" style={{ flex: 1 }}>
//                       <select
//                         name="contactName"
//                         value={formData.contactName}
//                         onChange={onChange}
//                         style={{ flex: 1 }}
//                         className={errors.contactName ? "jr-input-error" : ""}
//                         disabled={contactOptions.length === 0}
//                       >
//                         <option value="">
//                           {contactOptions.length === 0
//                             ? "-- No customer selected --"
//                             : "-- Select Contact --"}
//                         </option>
//                         {contactOptions.map((name, idx) => (
//                           <option key={idx} value={name}>
//                             {name}
//                           </option>
//                         ))}
//                       </select>
//                       <button
//                         className="jr-lookup-btn"
//                         title="Add Contact"
//                         onClick={() => setShowAddContact(true)}
//                         disabled={!formData.customerID?.trim()}
//                       >
//                         📋
//                       </button>
//                     </div>
//                   </div>
//                   <div className="jr-field-row">
//                     <label>Prepared By</label>
//                     <input
//                       type="text"
//                       name="preparedBy"
//                       value={
//                         isEditMode
//                           ? formData.preparedBy
//                           : user || formData.preparedBy
//                       }
//                       disabled
//                       className="jr-input-auto"
//                     />
//                   </div>
//                 </div>

//                 <div className="jr-form-right">
//                   <div className="jr-field-row">
//                     <label>
//                       Reference{" "}
//                       {errors.reference && (
//                         <span className="jr-error">*required</span>
//                       )}
//                     </label>
//                     <input
//                       type="text"
//                       name="reference"
//                       value={formData.reference}
//                       onChange={onChange}
//                       className={errors.reference ? "jr-input-error" : ""}
//                     />
//                   </div>
//                   <div className="jr-field-row">
//                     <label>
//                       Remarks{" "}
//                       {errors.remarks && (
//                         <span className="jr-error">*required</span>
//                       )}
//                     </label>
//                     <textarea
//                       name="remarks"
//                       value={formData.remarks}
//                       onChange={onChange}
//                       className={errors.remarks ? "jr-input-error" : ""}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* END LOCKABLE SECTION */}

//             {/* BOTTOM ACTIONS */}
//             <div className="jr-modal-actions">
//               <div className="jr-modal-actions-left">
//                 <button className="jr-add-btn" onClick={onOpenJobNumber}>
//                   Add
//                 </button>
//                 {/* <button className="jr-reserve-btn">Reserve Job Numbers</button> */}
//               </div>
//               <div className="jr-modal-actions-right">
//                 {/* <button className="jr-action-btn" disabled>
//                     Modification History
//                   </button> */}
//                 {/* <button className="jr-action-btn">Open Camera</button> */}

//                 {/* OPEN FOLDER — shows every file (equipment photos +
//                     documents) uploaded under every job number attached to
//                     this receipt, grouped by job number. Disabled until at
//                     least one job number has been added, since there's
//                     nothing to show otherwise. */}
//                 <button
//                   className="jr-action-btn"
//                   onClick={() => setShowReceiptFolder(true)}
//                   disabled={jobNumbers.length === 0}
//                   title={
//                     jobNumbers.length === 0
//                       ? "Add at least one Job Number first"
//                       : "View files for all job numbers on this receipt"
//                   }
//                   style={
//                     jobNumbers.length === 0
//                       ? { opacity: 0.5, cursor: "not-allowed" }
//                       : {}
//                   }
//                 >
//                   Open Folder
//                 </button>

//                 <button
//                   className="jr-action-btn"
//                   onClick={handlePrintClick}
//                   disabled={!isEditMode}
//                   title={
//                     !isEditMode
//                       ? "Save this Job Receipt first to enable printing"
//                       : "Print this Job Receipt"
//                   }
//                   style={
//                     !isEditMode ? { opacity: 0.5, cursor: "not-allowed" } : {}
//                   }
//                 >
//                   Print
//                 </button>
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

//           {/* ADMIN PASSWORD PROMPT — unlocks receipt fields for this session on success */}
//           {showAdminPrompt && (
//             <AdminPasswordModal
//               onClose={() => setShowAdminPrompt(false)}
//               onVerified={handleAdminVerified}
//             />
//           )}
//         </div>,
//         document.body,
//       )}

//       {/* ADD CONTACT MODAL (shared component, separate portal) */}
//       {showAddContact && (
//         <AddContactSubModal
//           customerID={formData.customerID}
//           onClose={() => setShowAddContact(false)}
//           onContactAdded={(newContact) => {
//             onContactAdded(newContact.contactName);
//           }}
//         />
//       )}

//       {/* RECEIPT FOLDER MODAL — shows files for every job number on this
//           receipt, grouped by job number */}
//       {showReceiptFolder && (
//         <ReceiptFolderModal
//           jobNumbers={jobNumbers}
//           onClose={() => setShowReceiptFolder(false)}
//         />
//       )}
//     </>
//   );
// };

// export default AddReceiptModal;
import React, { useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import AdminPasswordModal from "./AdminPasswordModal";
import AddContactSubModal from "./AddContactSubModal";
import ReceiptFolderModal from "./ReceiptFolderModal";

// Small red asterisk shown next to every required field's label.
const Required = () => <span className="jr-required-mark">*</span>;

// =====================
// MAIN ADD / EDIT RECEIPT MODAL
// =====================
const AddReceiptModal = ({
  onClose,
  onSave,
  onPrint,
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

  // OPEN FOLDER — shows every file (equipment photos + documents) stored
  // under each job number attached to this receipt, grouped by job
  // number. Reuses the same /api/uploads/job-folder/:jobNumber/files
  // route that JobNumberModal's per-job "Open Folder" already calls —
  // this just loops it across every job number in `jobNumbers`.
  const [showReceiptFolder, setShowReceiptFolder] = useState(false);

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

  // VALIDATE JOB RECEIPT FIELDS — every field is required
  const validate = () => {
    const newErrors = {};

    if (!formData.customerID?.trim())
      newErrors.customerID = "Customer ID is required.";
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company Name is required.";
    if (!formData.companyAddress?.trim())
      newErrors.companyAddress = "Address is required.";
    if (!formData.contactInfo?.trim())
      newErrors.contactInfo = "Contact Info is required.";
    if (!formData.vat?.trim()) newErrors.vat = "VAT is required.";
    if (!formData.contactName?.trim())
      newErrors.contactName = "Contact Name is required.";
    if (!formData.reference?.trim())
      newErrors.reference = "Reference is required.";
    if (!formData.remarks?.trim()) newErrors.remarks = "Remarks are required.";
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

  // PRINT — only meaningful once at least one job number exists; a brand
  // new, empty receipt has nothing worth previewing yet.
  const handlePrintClick = () => {
    if (jobNumbers.length === 0) {
      showSuccess(
        "Nothing to Print",
        "Add at least one Job Number before printing a preview.",
        hideDialog,
      );
      return;
    }
    onPrint?.();
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
                    Date <Required />{" "}
                    {errors.date && (
                      <span className="jr-error">{errors.date}</span>
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
                    Customer ID <Required />{" "}
                    {errors.customerID && (
                      <span className="jr-error">{errors.customerID}</span>
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
                {/* <button className="jr-pdf-btn">Upload PDF</button> */}
              </div>

              {/* FORM BODY */}
              <div className="jr-form-body">
                <div className="jr-form-left">
                  <div className="jr-field-row">
                    <label>
                      Company Name <Required />{" "}
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
                      Address <Required />{" "}
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
                    <label>
                      Contact Info <Required />{" "}
                      {errors.contactInfo && (
                        <span className="jr-error">*required</span>
                      )}
                    </label>
                    <textarea
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={onChange}
                      className={errors.contactInfo ? "jr-input-error" : ""}
                    />
                  </div>
                  <div className="jr-field-row">
                    <label>
                      VAT <Required />{" "}
                      {errors.vat && (
                        <span className="jr-error">*required</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="vat"
                      value={formData.vat}
                      onChange={onChange}
                      className={errors.vat ? "jr-input-error" : ""}
                    />
                  </div>
                  <div className="jr-field-row">
                    <label>
                      Contact Name <Required />{" "}
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
                    <label>
                      Reference <Required />{" "}
                      {errors.reference && (
                        <span className="jr-error">*required</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={onChange}
                      className={errors.reference ? "jr-input-error" : ""}
                    />
                  </div>
                  <div className="jr-field-row">
                    <label>
                      Remarks <Required />{" "}
                      {errors.remarks && (
                        <span className="jr-error">*required</span>
                      )}
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={onChange}
                      className={errors.remarks ? "jr-input-error" : ""}
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
                {/* <button className="jr-reserve-btn">Reserve Job Numbers</button> */}
              </div>
              <div className="jr-modal-actions-right">
                {/* <button className="jr-action-btn" disabled>
                    Modification History
                  </button> */}
                {/* <button className="jr-action-btn">Open Camera</button> */}

                {/* OPEN FOLDER — shows every file (equipment photos +
                    documents) uploaded under every job number attached to
                    this receipt, grouped by job number. Disabled until at
                    least one job number has been added, since there's
                    nothing to show otherwise. */}
                <button
                  className="jr-action-btn"
                  onClick={() => setShowReceiptFolder(true)}
                  disabled={jobNumbers.length === 0}
                  title={
                    jobNumbers.length === 0
                      ? "Add at least one Job Number first"
                      : "View files for all job numbers on this receipt"
                  }
                  style={
                    jobNumbers.length === 0
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  Open Folder
                </button>

                <button
                  className="jr-action-btn"
                  onClick={handlePrintClick}
                  disabled={!isEditMode}
                  title={
                    !isEditMode
                      ? "Save this Job Receipt first to enable printing"
                      : "Print this Job Receipt"
                  }
                  style={
                    !isEditMode ? { opacity: 0.5, cursor: "not-allowed" } : {}
                  }
                >
                  Print
                </button>
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

      {/* ADD CONTACT MODAL (shared component, separate portal) */}
      {showAddContact && (
        <AddContactSubModal
          customerID={formData.customerID}
          onClose={() => setShowAddContact(false)}
          onContactAdded={(newContact) => {
            onContactAdded(newContact.contactName);
          }}
        />
      )}

      {/* RECEIPT FOLDER MODAL — shows files for every job number on this
          receipt, grouped by job number */}
      {showReceiptFolder && (
        <ReceiptFolderModal
          jobNumbers={jobNumbers}
          onClose={() => setShowReceiptFolder(false)}
        />
      )}
    </>
  );
};

export default AddReceiptModal;
