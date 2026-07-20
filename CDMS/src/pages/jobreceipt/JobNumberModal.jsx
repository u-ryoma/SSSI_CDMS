// import React, { useState } from "react";
// import { createPortal } from "react-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import AdminPasswordModal from "./AdminPasswordModal";
// import CameraCaptureModal from "./CameraCaptureModal";
// import AddContactSubModal from "./AddContactSubModal";

// const JobNumberModal = ({
//   onClose,
//   onSave,
//   onCancel,
//   jobForm,
//   onJobChange,
//   onOnSiteChange,
//   onJobTypeChange,
//   jobReceiptID,
//   onOpenInstrumentList,
//   onOpenRecall,
//   isEditing,
//   reservingNumber,
//   customerID,
//   contactOptions,
//   onContactAdded,
// }) => {
//   const [errors, setErrors] = useState({});

//   // FIELD LOCK — existing job numbers open locked; a correct admin password
//   // unlocks all fields for the rest of this modal session. New job numbers
//   // (isEditing === false) are never locked.
//   const [locked, setLocked] = useState(isEditing);
//   const [showAdminPrompt, setShowAdminPrompt] = useState(false);

//   // EQUIPMENT PHOTO — captured here via the "Open Camera" button, but NOT
//   // previewed/shown in this modal. It's stored on jobForm.photoUrl (same
//   // field name IncomingCalibDetailsModal already reads from), so it just
//   // shows up there automatically once the job reaches Incoming/On-Going
//   // Calibration. This modal only needs to trigger the capture.
//   const [showCamera, setShowCamera] = useState(false);

//   // ADD CONTACT — Contact Cert reuses the same contact list (and Add
//   // Contact modal) as AddReceiptModal's Contact Name field, keyed off the
//   // same customerID.
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

//   // VALIDATE JOB NUMBER FIELDS — every field is required
//   const validate = () => {
//     const newErrors = {};

//     if (!jobForm.type)
//       newErrors.type = "Please select Mechanical or Electrical.";
//     if (!jobForm.description?.trim())
//       newErrors.description = "Description is required.";
//     if (!jobForm.brand?.trim()) newErrors.brand = "Brand is required.";
//     if (!jobForm.model?.trim()) newErrors.model = "Model is required.";
//     if (!jobForm.serialNo?.trim())
//       newErrors.serialNo = "Serial No. is required.";
//     if (!jobForm.remarks?.trim()) newErrors.remarks = "Remarks is required.";
//     if (!jobForm.concern?.trim()) newErrors.concern = "Concern is required.";
//     if (!jobForm.range?.trim()) newErrors.range = "Range is required.";
//     if (!jobForm.uncertainty?.trim())
//       newErrors.uncertainty = "Uncertainty is required.";
//     if (!jobForm.contactCert?.trim())
//       newErrors.contactCert = "Contact Cert is required.";
//     if (!jobForm.frequency?.trim())
//       newErrors.frequency = "Frequency is required.";
//     if (!jobForm.eta?.trim()) newErrors.eta = "ETA is required.";
//     else {
//       const today = new Date().toISOString().split("T")[0];
//       if (jobForm.eta < today)
//         newErrors.eta = "ETA must be today or a future date.";
//     }
//     if (!jobForm.evalBy?.trim()) newErrors.evalBy = "Eval By is required.";
//     if (!jobForm.priority?.trim()) newErrors.priority = "Priority is required.";
//     if (!jobForm.voltage?.trim() || jobForm.voltage === "-")
//       newErrors.voltage = "Voltage is required.";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveClick = () => {
//     if (!validate()) {
//       showSuccess(
//         "Incomplete Form",
//         "Please fill in all required fields before saving.",
//         hideDialog,
//       );
//       return;
//     }
//     showConfirm(
//       "Confirm Save",
//       `Are you sure you want to save Job Number ${jobForm.jobNumber}?`,
//       () => {
//         hideDialog();
//         onSave();
//       },
//       "default",
//     );
//   };

//   const handleCancelClick = () => {
//     showConfirm(
//       "Cancel Job Number",
//       `Are you sure you want to cancel/remove Job Number ${jobForm.jobNumber}? This cannot be undone.`,
//       () => {
//         hideDialog();
//         onCancel();
//       },
//     );
//   };

//   const handleExitClick = () => {
//     showConfirm(
//       "Confirm Exit",
//       "Are you sure you want to exit? Any unsaved changes will be lost.",
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

//   // EQUIPMENT PHOTO CAPTURE — stores straight to jobForm.photoUrl, no
//   // preview shown here. Display happens in IncomingCalibDetailsModal.
//   const handlePhotoCapture = (dataUrl) => {
//     onJobChange({ target: { name: "photoUrl", value: dataUrl } });
//   };

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={handleExitClick}>
//       <div className="jn-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         {/* FIXED HEADER */}
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">JOB NUMBER DETAILS</span>
//               <span className="jr-modal-title-sub">
//                 {jobForm.jobNumber || "Select a type to assign a number"}
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={handleExitClick}>
//             ✕
//           </button>
//         </div>

//         {/* SCROLLABLE CONTENT */}
//         <div className="jn-modal-scroll">
//           <div className="jn-top-row">
//             <div className="jn-top-right">
//               <div className="jn-info-row">
//                 <label>Job Number</label>
//                 <input
//                   type="text"
//                   value={
//                     reservingNumber ? "Reserving..." : jobForm.jobNumber || ""
//                   }
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

//           {locked && (
//             <div className="jn-lock-banner">
//               🔒 Fields are locked. Click anywhere below to enter the admin
//               password and enable editing.
//             </div>
//           )}

//           <div className="jn-form-body" style={{ position: "relative" }}>
//             {locked && (
//               <div
//                 className="jn-lock-overlay"
//                 onClick={() => setShowAdminPrompt(true)}
//                 title="Click to unlock editing (admin password required)"
//                 style={{
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   right: 0,
//                   bottom: 0,
//                   zIndex: 50,
//                   cursor: "pointer",
//                   background: "rgba(0, 0, 0, 0.03)",
//                 }}
//               />
//             )}

//             <div className="jn-form-left">
//               <div className="jr-field-row">
//                 <label>
//                   Description{" "}
//                   {errors.description && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <div
//                   className="jr-input-with-btn"
//                   style={{ flex: 1, minWidth: 0 }}
//                 >
//                   <textarea
//                     name="description"
//                     value={jobForm.description}
//                     onChange={onJobChange}
//                     style={{ flex: 1, minHeight: "60px", minWidth: 0 }}
//                     className={errors.description ? "jr-input-error" : ""}
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
//                 <label>
//                   Brand{" "}
//                   {errors.brand && <span className="jr-error">*required</span>}
//                 </label>
//                 <input
//                   type="text"
//                   name="brand"
//                   value={jobForm.brand}
//                   onChange={onJobChange}
//                   className={errors.brand ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>
//                   Model{" "}
//                   {errors.model && <span className="jr-error">*required</span>}
//                 </label>
//                 <input
//                   type="text"
//                   name="model"
//                   value={jobForm.model}
//                   onChange={onJobChange}
//                   className={errors.model ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>
//                   Serial No.{" "}
//                   {errors.serialNo && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <input
//                   type="text"
//                   name="serialNo"
//                   value={jobForm.serialNo}
//                   onChange={onJobChange}
//                   className={errors.serialNo ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>
//                   Remarks{" "}
//                   {errors.remarks && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <textarea
//                   name="remarks"
//                   value={jobForm.remarks}
//                   onChange={onJobChange}
//                   style={{ minHeight: "50px" }}
//                   className={errors.remarks ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>
//                   Concern{" "}
//                   {errors.concern && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <textarea
//                   name="concern"
//                   value={jobForm.concern}
//                   onChange={onJobChange}
//                   style={{ minHeight: "50px" }}
//                   className={errors.concern ? "jr-input-error" : ""}
//                 />
//               </div>
//             </div>

//             <div className="jn-form-right">
//               <div className="jr-field-row">
//                 <label>
//                   Range{" "}
//                   {errors.range && <span className="jr-error">*required</span>}
//                 </label>
//                 <textarea
//                   name="range"
//                   value={jobForm.range}
//                   onChange={onJobChange}
//                   style={{ minHeight: "60px" }}
//                   className={errors.range ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>
//                   Uncertainty{" "}
//                   {errors.uncertainty && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <input
//                   type="text"
//                   name="uncertainty"
//                   value={jobForm.uncertainty}
//                   onChange={onJobChange}
//                   className={errors.uncertainty ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jr-field-row">
//                 <label>
//                   Contact Cert{" "}
//                   {errors.contactCert && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <div
//                   className="jr-input-with-btn"
//                   style={{ flex: 1, minWidth: 0 }}
//                 >
//                   <select
//                     name="contactCert"
//                     value={jobForm.contactCert}
//                     onChange={onJobChange}
//                     style={{ flex: 1 }}
//                     className={errors.contactCert ? "jr-input-error" : ""}
//                     disabled={!contactOptions || contactOptions.length === 0}
//                   >
//                     <option value="">
//                       {!contactOptions || contactOptions.length === 0
//                         ? "-- No customer selected --"
//                         : "-- Select Contact --"}
//                     </option>
//                     {contactOptions?.map((name, idx) => (
//                       <option key={idx} value={name}>
//                         {name}
//                       </option>
//                     ))}
//                   </select>
//                   <button
//                     className="jr-lookup-btn"
//                     title="Add Contact"
//                     onClick={() => setShowAddContact(true)}
//                     disabled={!customerID?.trim()}
//                   >
//                     📋
//                   </button>
//                 </div>
//               </div>
//               <div className="jn-inline-row">
//                 <label>
//                   Frequency{" "}
//                   {errors.frequency && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <select
//                   name="frequency"
//                   value={jobForm.frequency}
//                   onChange={onJobChange}
//                   className={errors.frequency ? "jr-input-error" : ""}
//                 >
//                   <option value="">-- Select --</option>
//                   <option>6 Months</option>
//                   <option>1 Year</option>
//                   <option>2 Years</option>
//                   <option>3 Years</option>
//                 </select>
//                 <label>
//                   ETA{" "}
//                   {errors.eta && (
//                     <span className="jr-error">*{errors.eta}</span>
//                   )}
//                 </label>
//                 <input
//                   type="date"
//                   name="eta"
//                   value={jobForm.eta}
//                   onChange={onJobChange}
//                   className={errors.eta ? "jr-input-error" : ""}
//                 />
//               </div>
//               <div className="jn-inline-row">
//                 <label>
//                   Eval By{" "}
//                   {errors.evalBy && <span className="jr-error">*required</span>}
//                 </label>
//                 <select
//                   name="evalBy"
//                   value={jobForm.evalBy}
//                   onChange={onJobChange}
//                   className={errors.evalBy ? "jr-input-error" : ""}
//                 >
//                   <option value="">-- Select --</option>
//                   <option>CPGP</option>
//                   <option>SSSI</option>
//                 </select>
//                 <label>
//                   Priority{" "}
//                   {errors.priority && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <select
//                   name="priority"
//                   value={jobForm.priority}
//                   onChange={onJobChange}
//                   className={errors.priority ? "jr-input-error" : ""}
//                 >
//                   <option value="">-- Select --</option>
//                   <option>Normal</option>
//                   <option>Rush</option>
//                   <option>On Hold</option>
//                 </select>
//               </div>
//               <div className="jn-inline-row">
//                 <label>
//                   Voltage{" "}
//                   {errors.voltage && (
//                     <span className="jr-error">*required</span>
//                   )}
//                 </label>
//                 <select
//                   name="voltage"
//                   value={jobForm.voltage}
//                   onChange={onJobChange}
//                   className={errors.voltage ? "jr-input-error" : ""}
//                 >
//                   <option value="-">-- Select --</option>
//                   <option>110V</option>
//                   <option>220V</option>
//                 </select>
//               </div>
//               {/* TYPE SELECTOR */}
//               <div className="jn-type-row">
//                 <label className="jr-radio-label">
//                   <input
//                     type="radio"
//                     name="jobType"
//                     value="mechanical"
//                     checked={jobForm.type === "mechanical"}
//                     onChange={onJobTypeChange}
//                     disabled={reservingNumber}
//                   />{" "}
//                   Mechanical (SSS)
//                 </label>
//                 <label className="jr-radio-label">
//                   <input
//                     type="radio"
//                     name="jobType"
//                     value="electrical"
//                     checked={jobForm.type === "electrical"}
//                     onChange={onJobTypeChange}
//                     disabled={reservingNumber}
//                   />{" "}
//                   Electrical (SSE)
//                 </label>
//                 {errors.type && (
//                   <span className="jr-error">*{errors.type}</span>
//                 )}
//               </div>

//               {/* ON-SITE TOGGLE — bound to the independent `onSite` field
//                   (mode of receipt), which JobNumber.jsx's getMOR() reads.
//                   This is deliberately separate from `tagged`, a pipeline-
//                   stage flag set elsewhere once the job passes Instrument
//                   Tagging. Checking this box only records how the unit was
//                   received; it does not by itself change what stage the
//                   job is in. */}
//               <div className="jn-type-row">
//                 <label className="jr-radio-label">
//                   <input
//                     type="checkbox"
//                     name="onSite"
//                     checked={!!jobForm.onSite}
//                     onChange={onOnSiteChange}
//                   />{" "}
//                   On-Site Calibration
//                 </label>
//               </div>
//             </div>
//           </div>

//           <div className="jn-modal-actions">
//             <div className="jr-modal-actions-left">
//               <button
//                 className="jr-action-btn"
//                 onClick={() => setShowCamera(true)}
//               >
//                 {jobForm.photoUrl ? "Retake Photo" : "Open Camera"}
//               </button>
//               <button className="jr-action-btn">Open Folder</button>
//             </div>
//             <div className="jr-modal-actions-right">
//               <button className="jr-action-btn" onClick={onOpenRecall}>
//                 Recall Job Number
//               </button>
//               <button
//                 className="jr-action-btn"
//                 onClick={isEditing ? handleCancelClick : undefined}
//                 disabled={!isEditing}
//                 style={
//                   !isEditing ? { opacity: 0.5, cursor: "not-allowed" } : {}
//                 }
//               >
//                 Cancel Job Number
//               </button>
//               <button className="jr-save-btn" onClick={handleSaveClick}>
//                 Save
//               </button>
//               <button className="jr-action-btn" onClick={handleExitClick}>
//                 Exit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CONFIRM DIALOG */}
//       {dialog.show && (
//         <ConfirmDialog
//           title={dialog.title}
//           message={dialog.message}
//           onConfirm={dialog.onConfirm}
//           onCancel={dialog.onCancel}
//           confirmLabel={dialog.confirmLabel}
//           cancelLabel={dialog.cancelLabel}
//           type={dialog.type}
//         />
//       )}

//       {/* ADMIN PASSWORD PROMPT — unlocks all fields for this session on success */}
//       {showAdminPrompt && (
//         <AdminPasswordModal
//           onClose={() => setShowAdminPrompt(false)}
//           onVerified={handleAdminVerified}
//         />
//       )}

//       {/* EQUIPMENT PHOTO CAMERA MODAL — capture only, no preview here */}
//       {showCamera && (
//         <CameraCaptureModal
//           onClose={() => setShowCamera(false)}
//           onCapture={handlePhotoCapture}
//         />
//       )}

//       {/* ADD CONTACT MODAL — same shared component/list as AddReceiptModal's
//           Contact Name field, so a contact added here shows up there too. */}
//       {showAddContact && (
//         <AddContactSubModal
//           customerID={customerID}
//           onClose={() => setShowAddContact(false)}
//           onContactAdded={(newContact) => {
//             onContactAdded?.(newContact.contactName);
//             onJobChange({
//               target: { name: "contactCert", value: newContact.contactName },
//             });
//           }}
//         />
//       )}
//     </div>,
//     document.body,
//   );
// };

// export default JobNumberModal;
import React, { useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import AdminPasswordModal from "./AdminPasswordModal";
import CameraCaptureModal from "./CameraCaptureModal";
import AddContactSubModal from "./AddContactSubModal";

const API = import.meta.env.VITE_API_URL;

const JobNumberModal = ({
  onClose,
  onSave,
  onCancel,
  jobForm,
  onJobChange,
  onOnSiteChange,
  onJobTypeChange,
  jobReceiptID,
  onOpenInstrumentList,
  onOpenRecall,
  isEditing,
  reservingNumber,
  customerID,
  contactOptions,
  onContactAdded,
}) => {
  const [errors, setErrors] = useState({});

  // FIELD LOCK — existing job numbers open locked; a correct admin password
  // unlocks all fields for the rest of this modal session. New job numbers
  // (isEditing === false) are never locked.
  const [locked, setLocked] = useState(isEditing);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  // EQUIPMENT PHOTO — captured here via the "Open Camera" button, but NOT
  // previewed/shown in this modal. The captured image is uploaded to
  // Cloudinary via the backend's /api/uploads/equipment-photo/:jobNumber
  // route, and the returned secure_url is stored on jobForm.photoUrl (same
  // field name IncomingCalibDetailsModal already reads from), so it just
  // shows up there automatically once the job reaches Incoming/On-Going
  // Calibration. This modal only needs to trigger the capture + upload.
  const [showCamera, setShowCamera] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // ADD CONTACT — Contact Cert reuses the same contact list (and Add
  // Contact modal) as AddReceiptModal's Contact Name field, keyed off the
  // same customerID.
  const [showAddContact, setShowAddContact] = useState(false);

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

  // VALIDATE JOB NUMBER FIELDS — every field is required
  const validate = () => {
    const newErrors = {};

    if (!jobForm.type)
      newErrors.type = "Please select Mechanical or Electrical.";
    if (!jobForm.description?.trim())
      newErrors.description = "Description is required.";
    if (!jobForm.brand?.trim()) newErrors.brand = "Brand is required.";
    if (!jobForm.model?.trim()) newErrors.model = "Model is required.";
    if (!jobForm.serialNo?.trim())
      newErrors.serialNo = "Serial No. is required.";
    if (!jobForm.remarks?.trim()) newErrors.remarks = "Remarks is required.";
    if (!jobForm.concern?.trim()) newErrors.concern = "Concern is required.";
    if (!jobForm.range?.trim()) newErrors.range = "Range is required.";
    if (!jobForm.uncertainty?.trim())
      newErrors.uncertainty = "Uncertainty is required.";
    if (!jobForm.contactCert?.trim())
      newErrors.contactCert = "Contact Cert is required.";
    if (!jobForm.frequency?.trim())
      newErrors.frequency = "Frequency is required.";
    if (!jobForm.eta?.trim()) newErrors.eta = "ETA is required.";
    else {
      const today = new Date().toISOString().split("T")[0];
      if (jobForm.eta < today)
        newErrors.eta = "ETA must be today or a future date.";
    }
    if (!jobForm.evalBy?.trim()) newErrors.evalBy = "Eval By is required.";
    if (!jobForm.priority?.trim()) newErrors.priority = "Priority is required.";
    if (!jobForm.voltage?.trim() || jobForm.voltage === "-")
      newErrors.voltage = "Voltage is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (!validate()) {
      showSuccess(
        "Incomplete Form",
        "Please fill in all required fields before saving.",
        hideDialog,
      );
      return;
    }
    showConfirm(
      "Confirm Save",
      `Are you sure you want to save Job Number ${jobForm.jobNumber}?`,
      () => {
        hideDialog();
        onSave();
      },
      "default",
    );
  };

  const handleCancelClick = () => {
    showConfirm(
      "Cancel Job Number",
      `Are you sure you want to cancel/remove Job Number ${jobForm.jobNumber}? This cannot be undone.`,
      () => {
        hideDialog();
        onCancel();
      },
    );
  };

  const handleExitClick = () => {
    showConfirm(
      "Confirm Exit",
      "Are you sure you want to exit? Any unsaved changes will be lost.",
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

  // EQUIPMENT PHOTO CAPTURE — receives a base64 dataURL from
  // CameraCaptureModal (either the live-camera canvas snapshot or the
  // file-input fallback), converts it to a Blob, and uploads it to
  // Cloudinary via the backend. jobForm.photoUrl is only set to the
  // Cloudinary secure_url returned by the server — the raw base64 image
  // itself is never stored in Mongo.
  const handlePhotoCapture = async (dataUrl) => {
    setPhotoError("");
    setUploadingPhoto(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();

      const formData = new FormData();
      formData.append("photo", blob, "equipment.jpg");

      // If the job number hasn't been reserved yet (user hasn't picked
      // Mechanical/Electrical), fall back to a pending key so the upload
      // still has somewhere to go — matches the "pending_<timestamp>"
      // convention noted in the backend's uploadRoutes.js.
      const folderKey = jobForm.jobNumber || `pending_${Date.now()}`;

      const res = await fetch(
        `${API}/api/uploads/equipment-photo/${encodeURIComponent(folderKey)}`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (data.success) {
        onJobChange({ target: { name: "photoUrl", value: data.url } });
      } else {
        console.error("Photo upload failed:", data.message);
        setPhotoError(data.message || "Photo upload failed.");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      setPhotoError("Photo upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return createPortal(
    <div className="jr-modal-overlay" onClick={handleExitClick}>
      <div className="jn-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* FIXED HEADER */}
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">JOB NUMBER DETAILS</span>
              <span className="jr-modal-title-sub">
                {jobForm.jobNumber || "Select a type to assign a number"}
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={handleExitClick}>
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="jn-modal-scroll">
          <div className="jn-top-row">
            <div className="jn-top-right">
              <div className="jn-info-row">
                <label>Job Number</label>
                <input
                  type="text"
                  value={
                    reservingNumber ? "Reserving..." : jobForm.jobNumber || ""
                  }
                  disabled
                  className="jr-input-auto"
                />
              </div>
              <div className="jn-info-row">
                <label>Job Receipt ID</label>
                <input
                  type="text"
                  value={jobReceiptID}
                  disabled
                  className="jr-input-auto"
                />
              </div>
            </div>
          </div>

          {locked && (
            <div className="jn-lock-banner">
              🔒 Fields are locked. Click anywhere below to enter the admin
              password and enable editing.
            </div>
          )}

          <div className="jn-form-body" style={{ position: "relative" }}>
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

            <div className="jn-form-left">
              <div className="jr-field-row">
                <label>
                  Description{" "}
                  {errors.description && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <div
                  className="jr-input-with-btn"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <textarea
                    name="description"
                    value={jobForm.description}
                    onChange={onJobChange}
                    style={{ flex: 1, minHeight: "60px", minWidth: 0 }}
                    className={errors.description ? "jr-input-error" : ""}
                  />
                  <button
                    className="jr-lookup-btn"
                    title="Instrument List"
                    onClick={onOpenInstrumentList}
                  >
                    📋
                  </button>
                </div>
              </div>
              <div className="jr-field-row">
                <label>
                  Brand{" "}
                  {errors.brand && <span className="jr-error">*required</span>}
                </label>
                <input
                  type="text"
                  name="brand"
                  value={jobForm.brand}
                  onChange={onJobChange}
                  className={errors.brand ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>
                  Model{" "}
                  {errors.model && <span className="jr-error">*required</span>}
                </label>
                <input
                  type="text"
                  name="model"
                  value={jobForm.model}
                  onChange={onJobChange}
                  className={errors.model ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>
                  Serial No.{" "}
                  {errors.serialNo && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <input
                  type="text"
                  name="serialNo"
                  value={jobForm.serialNo}
                  onChange={onJobChange}
                  className={errors.serialNo ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>
                  Remarks{" "}
                  {errors.remarks && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <textarea
                  name="remarks"
                  value={jobForm.remarks}
                  onChange={onJobChange}
                  style={{ minHeight: "50px" }}
                  className={errors.remarks ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>
                  Concern{" "}
                  {errors.concern && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <textarea
                  name="concern"
                  value={jobForm.concern}
                  onChange={onJobChange}
                  style={{ minHeight: "50px" }}
                  className={errors.concern ? "jr-input-error" : ""}
                />
              </div>
            </div>

            <div className="jn-form-right">
              <div className="jr-field-row">
                <label>
                  Range{" "}
                  {errors.range && <span className="jr-error">*required</span>}
                </label>
                <textarea
                  name="range"
                  value={jobForm.range}
                  onChange={onJobChange}
                  style={{ minHeight: "60px" }}
                  className={errors.range ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>
                  Uncertainty{" "}
                  {errors.uncertainty && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <input
                  type="text"
                  name="uncertainty"
                  value={jobForm.uncertainty}
                  onChange={onJobChange}
                  className={errors.uncertainty ? "jr-input-error" : ""}
                />
              </div>
              <div className="jr-field-row">
                <label>
                  Contact Cert{" "}
                  {errors.contactCert && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <div
                  className="jr-input-with-btn"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <select
                    name="contactCert"
                    value={jobForm.contactCert}
                    onChange={onJobChange}
                    style={{ flex: 1 }}
                    className={errors.contactCert ? "jr-input-error" : ""}
                    disabled={!contactOptions || contactOptions.length === 0}
                  >
                    <option value="">
                      {!contactOptions || contactOptions.length === 0
                        ? "-- No customer selected --"
                        : "-- Select Contact --"}
                    </option>
                    {contactOptions?.map((name, idx) => (
                      <option key={idx} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="jr-lookup-btn"
                    title="Add Contact"
                    onClick={() => setShowAddContact(true)}
                    disabled={!customerID?.trim()}
                  >
                    📋
                  </button>
                </div>
              </div>
              <div className="jn-inline-row">
                <label>
                  Frequency{" "}
                  {errors.frequency && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <select
                  name="frequency"
                  value={jobForm.frequency}
                  onChange={onJobChange}
                  className={errors.frequency ? "jr-input-error" : ""}
                >
                  <option value="">-- Select --</option>
                  <option>6 Months</option>
                  <option>1 Year</option>
                  <option>2 Years</option>
                  <option>3 Years</option>
                </select>
                <label>
                  ETA{" "}
                  {errors.eta && (
                    <span className="jr-error">*{errors.eta}</span>
                  )}
                </label>
                <input
                  type="date"
                  name="eta"
                  value={jobForm.eta}
                  onChange={onJobChange}
                  className={errors.eta ? "jr-input-error" : ""}
                />
              </div>
              <div className="jn-inline-row">
                <label>
                  Eval By{" "}
                  {errors.evalBy && <span className="jr-error">*required</span>}
                </label>
                <select
                  name="evalBy"
                  value={jobForm.evalBy}
                  onChange={onJobChange}
                  className={errors.evalBy ? "jr-input-error" : ""}
                >
                  <option value="">-- Select --</option>
                  <option>CPGP</option>
                  <option>SSSI</option>
                </select>
                <label>
                  Priority{" "}
                  {errors.priority && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <select
                  name="priority"
                  value={jobForm.priority}
                  onChange={onJobChange}
                  className={errors.priority ? "jr-input-error" : ""}
                >
                  <option value="">-- Select --</option>
                  <option>Normal</option>
                  <option>Rush</option>
                  <option>On Hold</option>
                </select>
              </div>
              <div className="jn-inline-row">
                <label>
                  Voltage{" "}
                  {errors.voltage && (
                    <span className="jr-error">*required</span>
                  )}
                </label>
                <select
                  name="voltage"
                  value={jobForm.voltage}
                  onChange={onJobChange}
                  className={errors.voltage ? "jr-input-error" : ""}
                >
                  <option value="-">-- Select --</option>
                  <option>110V</option>
                  <option>220V</option>
                </select>
              </div>
              {/* TYPE SELECTOR */}
              <div className="jn-type-row">
                <label className="jr-radio-label">
                  <input
                    type="radio"
                    name="jobType"
                    value="mechanical"
                    checked={jobForm.type === "mechanical"}
                    onChange={onJobTypeChange}
                    disabled={reservingNumber}
                  />{" "}
                  Mechanical (SSS)
                </label>
                <label className="jr-radio-label">
                  <input
                    type="radio"
                    name="jobType"
                    value="electrical"
                    checked={jobForm.type === "electrical"}
                    onChange={onJobTypeChange}
                    disabled={reservingNumber}
                  />{" "}
                  Electrical (SSE)
                </label>
                {errors.type && (
                  <span className="jr-error">*{errors.type}</span>
                )}
              </div>

              {/* ON-SITE TOGGLE — bound to the independent `onSite` field
                  (mode of receipt), which JobNumber.jsx's getMOR() reads.
                  This is deliberately separate from `tagged`, a pipeline-
                  stage flag set elsewhere once the job passes Instrument
                  Tagging. Checking this box only records how the unit was
                  received; it does not by itself change what stage the
                  job is in. */}
              <div className="jn-type-row">
                <label className="jr-radio-label">
                  <input
                    type="checkbox"
                    name="onSite"
                    checked={!!jobForm.onSite}
                    onChange={onOnSiteChange}
                  />{" "}
                  On-Site Calibration
                </label>
              </div>
            </div>
          </div>

          {photoError && (
            <div className="jr-error" style={{ padding: "0 16px" }}>
              {photoError}
            </div>
          )}

          <div className="jn-modal-actions">
            <div className="jr-modal-actions-left">
              <button
                className="jr-action-btn"
                onClick={() => setShowCamera(true)}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto
                  ? "Uploading..."
                  : jobForm.photoUrl
                    ? "Retake Photo"
                    : "Open Camera"}
              </button>
              <button className="jr-action-btn">Open Folder</button>
            </div>
            <div className="jr-modal-actions-right">
              <button className="jr-action-btn" onClick={onOpenRecall}>
                Recall Job Number
              </button>
              <button
                className="jr-action-btn"
                onClick={isEditing ? handleCancelClick : undefined}
                disabled={!isEditing}
                style={
                  !isEditing ? { opacity: 0.5, cursor: "not-allowed" } : {}
                }
              >
                Cancel Job Number
              </button>
              <button className="jr-save-btn" onClick={handleSaveClick}>
                Save
              </button>
              <button className="jr-action-btn" onClick={handleExitClick}>
                Exit
              </button>
            </div>
          </div>
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

      {/* ADMIN PASSWORD PROMPT — unlocks all fields for this session on success */}
      {showAdminPrompt && (
        <AdminPasswordModal
          onClose={() => setShowAdminPrompt(false)}
          onVerified={handleAdminVerified}
        />
      )}

      {/* EQUIPMENT PHOTO CAMERA MODAL — capture only; the resulting dataURL
          is uploaded to Cloudinary in handlePhotoCapture above, no preview
          shown here. */}
      {showCamera && (
        <CameraCaptureModal
          onClose={() => setShowCamera(false)}
          onCapture={handlePhotoCapture}
        />
      )}

      {/* ADD CONTACT MODAL — same shared component/list as AddReceiptModal's
          Contact Name field, so a contact added here shows up there too. */}
      {showAddContact && (
        <AddContactSubModal
          customerID={customerID}
          onClose={() => setShowAddContact(false)}
          onContactAdded={(newContact) => {
            onContactAdded?.(newContact.contactName);
            onJobChange({
              target: { name: "contactCert", value: newContact.contactName },
            });
          }}
        />
      )}
    </div>,
    document.body,
  );
};

export default JobNumberModal;
