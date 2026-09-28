// import React, { useState, useRef } from "react";
// import { createPortal } from "react-dom";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import AdminPasswordModal from "./AdminPasswordModal";
// import CameraCaptureModal from "./CameraCaptureModal";
// import AddContactSubModal from "./AddContactSubModal";
// import ReceiptFolderModal from "./ReceiptFolderModal"; // was JobFolderModal — retired, see ReceiptFolderModal.jsx

// const API = import.meta.env.VITE_API_URL;

// const JobNumberModal = ({
//   onClose,
//   onSave,
//   onCancel,
//   jobForm,
//   onJobChange,
//   onOnSiteChange,
//   onJobTypeChange,
//   parentId, // was: jobReceiptID — generic so any parent (Job Receipt, Site Calibration) can supply its own ID
//   parentLabel = "Job Receipt ID", // NEW — lets callers relabel this field
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

//   // EQUIPMENT PHOTOS — captured here via the "Open Camera" button.
//   // CameraCaptureModal now hands back an ARRAY of dataURLs (one per shot
//   // taken during that camera session, since it supports multi-photo
//   // capture). Each one is uploaded to Cloudinary via the backend's
//   // /api/uploads/equipment-photo/:jobNumber route; the returned
//   // secure_urls accumulate on jobForm.photoUrls (an array), while
//   // jobForm.photoUrl keeps pointing at the FIRST photo ever taken for
//   // any older code (e.g. IncomingCalibDetailsModal's original single-
//   // image field) still reading the singular value.
//   //
//   // IMPORTANT: Save is disabled while uploadingPhoto is true (see the Save
//   // button below). Without this, clicking Save while the upload is still
//   // in flight snapshots jobForm BEFORE onJobChange sets photoUrls, so the
//   // saved job silently ends up without the photo even though it uploaded
//   // successfully to Cloudinary.
//   const [showCamera, setShowCamera] = useState(false);
//   const [uploadingPhoto, setUploadingPhoto] = useState(false);
//   const [photoError, setPhotoError] = useState("");

//   // EQUIPMENT DOCUMENTS (PDFs, etc.) — uploaded via a hidden file input
//   // triggered by the "Upload PDF" button. Not previewed or tracked on
//   // jobForm the way photoUrls is; the file goes straight to Cloudinary
//   // under this job number's folder and is viewed later via Open Folder.
//   const fileInputRef = useRef(null);
//   const [uploadingDoc, setUploadingDoc] = useState(false);
//   const [docError, setDocError] = useState("");

//   // OPEN FOLDER — shows every file (photos + documents) stored under this
//   // job number's Cloudinary folder, fetched fresh each time it's opened.
//   // Now backed by the shared ReceiptFolderModal master component.
//   const [showFolder, setShowFolder] = useState(false);

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
//     // Guard against saving while a photo or document upload is still in
//     // flight — the button is also disabled below, but this blocks any
//     // other path that might still call handleSaveClick (e.g. a stray
//     // keyboard submit).
//     if (uploadingPhoto || uploadingDoc) return;

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

//   // EQUIPMENT PHOTO CAPTURE — receives an ARRAY of base64 dataURLs from
//   // CameraCaptureModal (one per shot taken this session). Uploads each to
//   // Cloudinary individually (the backend route only accepts one file per
//   // request), collects the returned secure_urls into jobForm.photoUrls,
//   // and keeps jobForm.photoUrl pointed at the FIRST photo ever taken for
//   // any older code still reading the old singular field.
//   const handlePhotoCapture = async (dataUrls) => {
//     setPhotoError("");
//     setUploadingPhoto(true);

//     const uploaded = [];
//     const failures = [];

//     try {
//       for (const dataUrl of dataUrls) {
//         try {
//           const blob = await (await fetch(dataUrl)).blob();

//           const formData = new FormData();
//           formData.append("photo", blob, "equipment.jpg");

//           // If the job number hasn't been reserved yet (user hasn't picked
//           // Mechanical/Electrical), fall back to a pending key so the
//           // upload still has somewhere to go — matches the
//           // "pending_<timestamp>" convention noted in the backend's
//           // uploadRoutes.js.
//           const folderKey = jobForm.jobNumber || `pending_${Date.now()}`;

//           const res = await fetch(
//             `${API}/api/uploads/equipment-photo/${encodeURIComponent(folderKey)}`,
//             { method: "POST", body: formData },
//           );
//           const data = await res.json();

//           if (data.success) {
//             uploaded.push(data.url);
//           } else {
//             console.error("Photo upload failed:", data.message);
//             failures.push(data.message || "Photo upload failed.");
//           }
//         } catch (err) {
//           console.error("Photo upload error:", err);
//           failures.push("Photo upload failed.");
//         }
//       }

//       if (uploaded.length > 0) {
//         const nextPhotoUrls = [...(jobForm.photoUrls || []), ...uploaded];
//         onJobChange({ target: { name: "photoUrls", value: nextPhotoUrls } });
//         // Keep the singular field pointed at the first photo ever taken,
//         // for any older code still reading jobForm.photoUrl directly.
//         if (!jobForm.photoUrl) {
//           onJobChange({
//             target: { name: "photoUrl", value: nextPhotoUrls[0] },
//           });
//         }
//       }

//       if (failures.length > 0) {
//         setPhotoError(
//           `${failures.length} of ${dataUrls.length} photo(s) failed to upload. Please retake them.`,
//         );
//       }
//     } finally {
//       setUploadingPhoto(false);
//     }
//   };

//   // DOCUMENT UPLOAD (PDF, etc.) — triggered by the hidden file input
//   // below, itself triggered by the visible "Upload PDF" button. Uses the
//   // same folder-key convention as photo capture (real job number once
//   // reserved, or "pending_<timestamp>" as a fallback), though in practice
//   // the button is disabled until a job number exists (see the button
//   // below) so the pending fallback shouldn't normally get hit here.
//   //
//   // Unlike photoUrls, the uploaded document's URL is NOT written back onto
//   // jobForm — documents aren't tracked on the job record itself, only
//   // viewable afterward via Open Folder, which lists everything Cloudinary
//   // actually has for this job number.
//   const handleDocumentSelect = async (e) => {
//     const file = e.target.files?.[0];
//     // Reset the input so selecting the same file again still fires onChange
//     e.target.value = "";
//     if (!file) return;

//     setDocError("");
//     setUploadingDoc(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file, file.name);

//       const folderKey = jobForm.jobNumber || `pending_${Date.now()}`;

//       const res = await fetch(
//         `${API}/api/uploads/job-document/${encodeURIComponent(folderKey)}`,
//         { method: "POST", body: formData },
//       );
//       const data = await res.json();

//       if (!data.success) {
//         console.error("Document upload failed:", data.message);
//         setDocError(data.message || "Document upload failed.");
//       }
//     } catch (err) {
//       console.error("Document upload error:", err);
//       setDocError("Document upload failed. Please try again.");
//     } finally {
//       setUploadingDoc(false);
//     }
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
//                 <label>{parentLabel}</label>
//                 <input
//                   type="text"
//                   value={parentId}
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

//               {/* ON-SITE STATUS — no manual checkbox here anymore. Whether
//                   a job is in-house or on-site is now decided entirely by
//                   which flow opened this modal, not by a toggle a user
//                   could accidentally flip mid-edit:
//                     - Opened from Job Receipt (JobReceipt.jsx)  -> in-house
//                       (jobForm.onSite defaults to false via emptyJobForm,
//                       and nothing in that flow ever sets it true).
//                     - Opened from Site Calibration
//                       (AddSiteCalibrationModal.jsx) -> on-site
//                       (handleOpenJobNumber force-sets onSite: true,
//                       tagged: true before this modal even opens).
//                   onOnSiteChange is still accepted as a prop for backward
//                   compatibility but is no longer wired to any control in
//                   this modal. */}
//             </div>
//           </div>

//           {photoError && (
//             <div className="jr-error" style={{ padding: "0 16px" }}>
//               {photoError}
//             </div>
//           )}

//           {docError && (
//             <div className="jr-error" style={{ padding: "0 16px" }}>
//               {docError}
//             </div>
//           )}

//           {uploadingPhoto && (
//             <div
//               className="jr-modal-hint"
//               style={{ padding: "0 16px", color: "#555" }}
//             >
//               Uploading equipment photo(s)... Save is disabled until this
//               finishes.
//             </div>
//           )}

//           {uploadingDoc && (
//             <div
//               className="jr-modal-hint"
//               style={{ padding: "0 16px", color: "#555" }}
//             >
//               Uploading document... Save is disabled until this finishes.
//             </div>
//           )}

//           <div className="jn-modal-actions">
//             <div className="jr-modal-actions-left">
//               <button
//                 className="jr-action-btn"
//                 onClick={() => setShowCamera(true)}
//                 disabled={uploadingPhoto || uploadingDoc}
//               >
//                 {uploadingPhoto
//                   ? "Uploading..."
//                   : jobForm.photoUrls?.length
//                     ? `Add More Photos (${jobForm.photoUrls.length})`
//                     : "Open Camera"}
//               </button>

//               {/* UPLOAD PDF — hidden file input triggered by this button,
//                   using the same folder-key convention as equipment photos.
//                   Disabled until a job number has been reserved (picking
//                   Mechanical/Electrical first), since uploading before that
//                   would create an orphaned "pending_..." Cloudinary folder
//                   disconnected from the job's real folder created on Save. */}
//               <button
//                 className="jr-action-btn"
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={uploadingPhoto || uploadingDoc || !jobForm.jobNumber}
//                 title={
//                   !jobForm.jobNumber
//                     ? "Select Mechanical or Electrical first to assign a job number"
//                     : undefined
//                 }
//                 style={
//                   !jobForm.jobNumber
//                     ? { opacity: 0.5, cursor: "not-allowed" }
//                     : {}
//                 }
//               >
//                 {uploadingDoc ? "Uploading..." : "Upload PDF"}
//               </button>
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 ref={fileInputRef}
//                 onChange={handleDocumentSelect}
//                 style={{ display: "none" }}
//               />

//               {/* OPEN FOLDER — lists every file already stored under this
//                   job number's Cloudinary folder (photos + documents), via
//                   the shared ReceiptFolderModal master component. Disabled
//                   until a job number exists, for the same reason as Upload
//                   PDF above. */}
//               <button
//                 className="jr-action-btn"
//                 onClick={() => setShowFolder(true)}
//                 disabled={!jobForm.jobNumber}
//                 title={
//                   !jobForm.jobNumber
//                     ? "Select Mechanical or Electrical first to assign a job number"
//                     : undefined
//                 }
//                 style={
//                   !jobForm.jobNumber
//                     ? { opacity: 0.5, cursor: "not-allowed" }
//                     : {}
//                 }
//               >
//                 Open Folder
//               </button>
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
//               <button
//                 className="jr-save-btn"
//                 onClick={handleSaveClick}
//                 disabled={uploadingPhoto || uploadingDoc}
//                 title={
//                   uploadingPhoto
//                     ? "Please wait for the photo upload to finish"
//                     : uploadingDoc
//                       ? "Please wait for the document upload to finish"
//                       : undefined
//                 }
//                 style={
//                   uploadingPhoto || uploadingDoc
//                     ? { opacity: 0.5, cursor: "not-allowed" }
//                     : {}
//                 }
//               >
//                 {uploadingPhoto
//                   ? "Uploading Photo(s)..."
//                   : uploadingDoc
//                     ? "Uploading Document..."
//                     : "Save"}
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

//       {/* EQUIPMENT PHOTO CAMERA MODAL — hands back an array of dataURLs;
//           each is uploaded to Cloudinary in handlePhotoCapture above, no
//           preview shown here (the thumbnail strip lives inside
//           CameraCaptureModal itself during capture). */}
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

//       {/* JOB FOLDER — lists every file Cloudinary has for this job number
//           (equipment photos + documents), fetched fresh on open. Backed by
//           the shared master component (formerly JobFolderModal.jsx). */}
//       {showFolder && jobForm.jobNumber && (
//         <ReceiptFolderModal
//           jobNumber={jobForm.jobNumber}
//           title="JOB FOLDER"
//           onClose={() => setShowFolder(false)}
//         />
//       )}
//     </div>,
//     document.body,
//   );
// };

// export default JobNumberModal;
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import AdminPasswordModal from "./AdminPasswordModal";
import CameraCaptureModal from "./CameraCaptureModal";
import AddContactSubModal from "./AddContactSubModal";
import ReceiptFolderModal from "./ReceiptFolderModal"; // was JobFolderModal — retired, see ReceiptFolderModal.jsx

const API = import.meta.env.VITE_API_URL;

// Small red asterisk shown next to every required field's label.
const Required = () => <span className="jr-required-mark">*</span>;

const JobNumberModal = ({
  onClose,
  onSave,
  onCancel,
  jobForm,
  onJobChange,
  onOnSiteChange,
  onJobTypeChange,
  parentId, // was: jobReceiptID — generic so any parent (Job Receipt, Site Calibration) can supply its own ID
  parentLabel = "Job Receipt ID", // NEW — lets callers relabel this field
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

  // EQUIPMENT PHOTOS — captured here via the "Open Camera" button.
  // CameraCaptureModal now hands back an ARRAY of dataURLs (one per shot
  // taken during that camera session, since it supports multi-photo
  // capture). Each one is uploaded to Cloudinary via the backend's
  // /api/uploads/equipment-photo/:jobNumber route; the returned
  // secure_urls accumulate on jobForm.photoUrls (an array), while
  // jobForm.photoUrl keeps pointing at the FIRST photo ever taken for
  // any older code (e.g. IncomingCalibDetailsModal's original single-
  // image field) still reading the singular value.
  //
  // IMPORTANT: Save is disabled while uploadingPhoto is true (see the Save
  // button below). Without this, clicking Save while the upload is still
  // in flight snapshots jobForm BEFORE onJobChange sets photoUrls, so the
  // saved job silently ends up without the photo even though it uploaded
  // successfully to Cloudinary.
  const [showCamera, setShowCamera] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // EQUIPMENT DOCUMENTS (PDFs, etc.) — uploaded via a hidden file input
  // triggered by the "Upload PDF" button. Not previewed or tracked on
  // jobForm the way photoUrls is; the file goes straight to Cloudinary
  // under this job number's folder and is viewed later via Open Folder.
  const fileInputRef = useRef(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState("");

  // OPEN FOLDER — shows every file (photos + documents) stored under this
  // job number's Cloudinary folder, fetched fresh each time it's opened.
  // Now backed by the shared ReceiptFolderModal master component.
  const [showFolder, setShowFolder] = useState(false);

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
    // Guard against saving while a photo or document upload is still in
    // flight — the button is also disabled below, but this blocks any
    // other path that might still call handleSaveClick (e.g. a stray
    // keyboard submit).
    if (uploadingPhoto || uploadingDoc) return;

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

  // EQUIPMENT PHOTO CAPTURE — receives an ARRAY of base64 dataURLs from
  // CameraCaptureModal (one per shot taken this session). Uploads each to
  // Cloudinary individually (the backend route only accepts one file per
  // request), collects the returned secure_urls into jobForm.photoUrls,
  // and keeps jobForm.photoUrl pointed at the FIRST photo ever taken for
  // any older code still reading the old singular field.
  const handlePhotoCapture = async (dataUrls) => {
    setPhotoError("");
    setUploadingPhoto(true);

    const uploaded = [];
    const failures = [];

    try {
      for (const dataUrl of dataUrls) {
        try {
          const blob = await (await fetch(dataUrl)).blob();

          const formData = new FormData();
          formData.append("photo", blob, "equipment.jpg");

          // If the job number hasn't been reserved yet (user hasn't picked
          // Mechanical/Electrical), fall back to a pending key so the
          // upload still has somewhere to go — matches the
          // "pending_<timestamp>" convention noted in the backend's
          // uploadRoutes.js.
          const folderKey = jobForm.jobNumber || `pending_${Date.now()}`;

          const res = await fetch(
            `${API}/api/uploads/equipment-photo/${encodeURIComponent(folderKey)}`,
            { method: "POST", body: formData },
          );
          const data = await res.json();

          if (data.success) {
            uploaded.push(data.url);
          } else {
            console.error("Photo upload failed:", data.message);
            failures.push(data.message || "Photo upload failed.");
          }
        } catch (err) {
          console.error("Photo upload error:", err);
          failures.push("Photo upload failed.");
        }
      }

      if (uploaded.length > 0) {
        const nextPhotoUrls = [...(jobForm.photoUrls || []), ...uploaded];
        onJobChange({ target: { name: "photoUrls", value: nextPhotoUrls } });
        // Keep the singular field pointed at the first photo ever taken,
        // for any older code still reading jobForm.photoUrl directly.
        if (!jobForm.photoUrl) {
          onJobChange({
            target: { name: "photoUrl", value: nextPhotoUrls[0] },
          });
        }
      }

      if (failures.length > 0) {
        setPhotoError(
          `${failures.length} of ${dataUrls.length} photo(s) failed to upload. Please retake them.`,
        );
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  // DOCUMENT UPLOAD (PDF, etc.) — triggered by the hidden file input
  // below, itself triggered by the visible "Upload PDF" button. Uses the
  // same folder-key convention as photo capture (real job number once
  // reserved, or "pending_<timestamp>" as a fallback), though in practice
  // the button is disabled until a job number exists (see the button
  // below) so the pending fallback shouldn't normally get hit here.
  //
  // Unlike photoUrls, the uploaded document's URL is NOT written back onto
  // jobForm — documents aren't tracked on the job record itself, only
  // viewable afterward via Open Folder, which lists everything Cloudinary
  // actually has for this job number.
  const handleDocumentSelect = async (e) => {
    const file = e.target.files?.[0];
    // Reset the input so selecting the same file again still fires onChange
    e.target.value = "";
    if (!file) return;

    setDocError("");
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const folderKey = jobForm.jobNumber || `pending_${Date.now()}`;

      const res = await fetch(
        `${API}/api/uploads/job-document/${encodeURIComponent(folderKey)}`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (!data.success) {
        console.error("Document upload failed:", data.message);
        setDocError(data.message || "Document upload failed.");
      }
    } catch (err) {
      console.error("Document upload error:", err);
      setDocError("Document upload failed. Please try again.");
    } finally {
      setUploadingDoc(false);
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
                <label>{parentLabel}</label>
                <input
                  type="text"
                  value={parentId}
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
                  Description <Required />{" "}
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
                  Brand <Required />{" "}
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
                  Model <Required />{" "}
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
                  Serial No. <Required />{" "}
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
                  Remarks <Required />{" "}
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
                  Concern <Required />{" "}
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
                  Range <Required />{" "}
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
                  Uncertainty <Required />{" "}
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
                  Contact Cert <Required />{" "}
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
                  Frequency <Required />{" "}
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
                  ETA <Required />{" "}
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
                  Eval By <Required />{" "}
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
                  Priority <Required />{" "}
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
                  Voltage <Required />{" "}
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
                <span className="jr-type-label">
                  Type <Required />
                </span>
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

              {/* ON-SITE STATUS — no manual checkbox here anymore. Whether
                  a job is in-house or on-site is now decided entirely by
                  which flow opened this modal, not by a toggle a user
                  could accidentally flip mid-edit:
                    - Opened from Job Receipt (JobReceipt.jsx)  -> in-house
                      (jobForm.onSite defaults to false via emptyJobForm,
                      and nothing in that flow ever sets it true).
                    - Opened from Site Calibration
                      (AddSiteCalibrationModal.jsx) -> on-site
                      (handleOpenJobNumber force-sets onSite: true,
                      tagged: true before this modal even opens).
                  onOnSiteChange is still accepted as a prop for backward
                  compatibility but is no longer wired to any control in
                  this modal. */}
            </div>
          </div>

          {photoError && (
            <div className="jr-error" style={{ padding: "0 16px" }}>
              {photoError}
            </div>
          )}

          {docError && (
            <div className="jr-error" style={{ padding: "0 16px" }}>
              {docError}
            </div>
          )}

          {uploadingPhoto && (
            <div
              className="jr-modal-hint"
              style={{ padding: "0 16px", color: "#555" }}
            >
              Uploading equipment photo(s)... Save is disabled until this
              finishes.
            </div>
          )}

          {uploadingDoc && (
            <div
              className="jr-modal-hint"
              style={{ padding: "0 16px", color: "#555" }}
            >
              Uploading document... Save is disabled until this finishes.
            </div>
          )}

          <div className="jn-modal-actions">
            <div className="jr-modal-actions-left">
              <button
                className="jr-action-btn"
                onClick={() => setShowCamera(true)}
                disabled={uploadingPhoto || uploadingDoc}
              >
                {uploadingPhoto
                  ? "Uploading..."
                  : jobForm.photoUrls?.length
                    ? `Add More Photos (${jobForm.photoUrls.length})`
                    : "Open Camera"}
              </button>

              {/* UPLOAD PDF — hidden file input triggered by this button,
                  using the same folder-key convention as equipment photos.
                  Disabled until a job number has been reserved (picking
                  Mechanical/Electrical first), since uploading before that
                  would create an orphaned "pending_..." Cloudinary folder
                  disconnected from the job's real folder created on Save. */}
              <button
                className="jr-action-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto || uploadingDoc || !jobForm.jobNumber}
                title={
                  !jobForm.jobNumber
                    ? "Select Mechanical or Electrical first to assign a job number"
                    : undefined
                }
                style={
                  !jobForm.jobNumber
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : {}
                }
              >
                {uploadingDoc ? "Uploading..." : "Upload PDF"}
              </button>
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleDocumentSelect}
                style={{ display: "none" }}
              />

              {/* OPEN FOLDER — lists every file already stored under this
                  job number's Cloudinary folder (photos + documents), via
                  the shared ReceiptFolderModal master component. Disabled
                  until a job number exists, for the same reason as Upload
                  PDF above. */}
              <button
                className="jr-action-btn"
                onClick={() => setShowFolder(true)}
                disabled={!jobForm.jobNumber}
                title={
                  !jobForm.jobNumber
                    ? "Select Mechanical or Electrical first to assign a job number"
                    : undefined
                }
                style={
                  !jobForm.jobNumber
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : {}
                }
              >
                Open Folder
              </button>
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
              <button
                className="jr-save-btn"
                onClick={handleSaveClick}
                disabled={uploadingPhoto || uploadingDoc}
                title={
                  uploadingPhoto
                    ? "Please wait for the photo upload to finish"
                    : uploadingDoc
                      ? "Please wait for the document upload to finish"
                      : undefined
                }
                style={
                  uploadingPhoto || uploadingDoc
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : {}
                }
              >
                {uploadingPhoto
                  ? "Uploading Photo(s)..."
                  : uploadingDoc
                    ? "Uploading Document..."
                    : "Save"}
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

      {/* EQUIPMENT PHOTO CAMERA MODAL — hands back an array of dataURLs;
          each is uploaded to Cloudinary in handlePhotoCapture above, no
          preview shown here (the thumbnail strip lives inside
          CameraCaptureModal itself during capture). */}
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

      {/* JOB FOLDER — lists every file Cloudinary has for this job number
          (equipment photos + documents), fetched fresh on open. Backed by
          the shared master component (formerly JobFolderModal.jsx). */}
      {showFolder && jobForm.jobNumber && (
        <ReceiptFolderModal
          jobNumber={jobForm.jobNumber}
          title="JOB FOLDER"
          onClose={() => setShowFolder(false)}
        />
      )}
    </div>,
    document.body,
  );
};

export default JobNumberModal;
