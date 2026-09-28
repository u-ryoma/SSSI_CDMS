// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader"; // adjust path as needed
// import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
// import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
// // Adjust this path to wherever CameraCaptureModal actually lives in your
// // tree (same component the other stage modals use).
// import CameraCaptureModal from "../jobreceipt/CameraCaptureModal";
// import "./JobNumberDetailsModal.css";

// const API = import.meta.env.VITE_API_URL;

// // Converts a base64 dataURL (what CameraCaptureModal produces, from
// // either canvas.toDataURL or FileReader.readAsDataURL) into a Blob, so it
// // can be sent as multipart/form-data to the equipment-photo upload route.
// const dataUrlToBlob = async (dataUrl) => {
//   const res = await fetch(dataUrl);
//   return res.blob();
// };

// // Determine MOR (mode of receipt / "Reception") based on the dedicated
// // onSite flag (set in JobNumberModal / stamped true by default for every
// // job added from Site Calibration — see AddSiteCalibrationModal.jsx's
// // handleOpenJobNumber). NOT `tagged`, which only tracks pipeline-stage
// // progress and is always true for Site Calibration jobs regardless of
// // reception type — using it here previously made every SC job show
// // "In House" even when it was actually On-Site.
// const getMOR = (job) => {
//   if (job.onSite === true) return "On-Site";
//   if (job.onSite === false) return "In House";
//   return "Waiting for Update";
// };

// // Determine job status label based on the most advanced flag set to true
// const getJobStatus = (job) => {
//   // Checked first — RWOC is a terminal state set from Outgoing Concern's
//   // "Log RWOC" button (see ConcernOutgoing.jsx's handleLogRwoc) and
//   // should always win over whatever earlier-stage flags the job still
//   // carries (concernTagged, ongoingTagged, etc. are never cleared by
//   // RWOC, only concernTagged/outgoingConcernTagged are).
//   if (job.rwocTagged) return "Job Number Finished (RWOC)";
//   if (job.unitDelivered && job.certificateDelivered)
//     return "Job Number Finished";
//   if (job.forDeliveryTagged) return "For Delivery";
//   if (job.forPrintFinalTagged) return "Print Final Certificate";
//   if (job.forCheckingSigTagged) return "For Checking SIG";
//   if (job.forCheckingOICTagged) return "For Checking OIC";
//   if (job.forTypingTagged) return "For Typing";
//   if (job.ongoingTagged) return "On-Going Calibration";
//   if (job.tagged && job.concernTagged) return "Incoming Concern";
//   if (job.tagged) return "Incoming Calibration";
//   return "Waiting for Update";
// };

// const formatTimestamp = (iso) => {
//   if (!iso) return "";
//   const d = new Date(iso);
//   if (isNaN(d.getTime())) return iso;
//   return d.toLocaleString();
// };

// const JobNumberDetailsModal = ({
//   job,
//   onClose,
//   onUpdate,
//   onShowCalibrationDetails,
// }) => {
//   const [form, setForm] = useState(job || {});
//   const [saving, setSaving] = useState(false);

//   // FIELD LOCK — opens locked every time; a correct admin password
//   // unlocks editing for the rest of this modal session. Resets to
//   // locked whenever a different job is opened.
//   const [locked, setLocked] = useState(true);
//   const [showAdminPrompt, setShowAdminPrompt] = useState(false);

//   // OPEN FOLDER — shows every file (equipment photos + documents)
//   // already stored under this job number's Cloudinary folder, via the
//   // same JobFolderModal used on ForTyping / ForCheckingOIC /
//   // ForCheckingSig / ForPrintFinal.
//   const [showFolder, setShowFolder] = useState(false);

//   useEffect(() => {
//     setForm(job || {});
//     setLocked(true);
//   }, [job]);

//   if (!job) return null;

//   const handleChange = (field) => (e) => {
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleAdminVerified = () => {
//     setShowAdminPrompt(false);
//     setLocked(false);
//   };

//   const handleOpenFolderClick = () => {
//     setShowFolder(true);
//   };

//   // --- Equipment photo capture ---------------------------------------
//   // Same pattern as ForCheckingSigDetailsModal / ForPrintFinalDetails-
//   // Modal: this modal owns the full open -> capture -> upload chain
//   // itself. Unlike those two, this screen has no ConfirmDialog/showError
//   // component wired up (only AdminPasswordModal), so errors here fall
//   // back to window.alert — swap in a real dialog if/when one gets added
//   // to this modal. No local photoUrls array is kept here — captured
//   // photos are only ever viewed via "Open Folder" above.
//   const [showCamera, setShowCamera] = useState(false);
//   const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

//   const handleOpenCameraClick = () => {
//     if (!job.jobNumber) {
//       window.alert(
//         "This record has no job number yet, so a photo can't be saved.",
//       );
//       return;
//     }
//     setShowCamera(true);
//   };

//   const handleCameraCapture = async (photos) => {
//     setShowCamera(false);
//     if (!photos || photos.length === 0) return;

//     setIsUploadingPhotos(true);
//     try {
//       for (const dataUrl of photos) {
//         const blob = await dataUrlToBlob(dataUrl);
//         const formData = new FormData();
//         formData.append("photo", blob, `photo_${Date.now()}.jpg`);

//         const res = await fetch(
//           `${API}/api/uploads/equipment-photo/${encodeURIComponent(
//             job.jobNumber,
//           )}`,
//           { method: "POST", body: formData },
//         );
//         const data = await res.json().catch(() => ({}));
//         if (!res.ok || data.success === false) {
//           throw new Error(data?.message || "Photo upload failed");
//         }
//       }
//     } catch (err) {
//       console.error("Failed to upload captured photo(s):", err);
//       window.alert(
//         "One or more captured photos could not be saved. Please try taking the photo again.",
//       );
//     } finally {
//       setIsUploadingPhotos(false);
//     }
//   };

//   const handleCameraClose = () => {
//     setShowCamera(false);
//   };

//   const handleUpdateClick = async () => {
//     if (!onUpdate) return;
//     setSaving(true);
//     try {
//       // Only send fields that are confirmed to exist on the jobnumbers
//       // collection today. Joined/read-only fields (companyName,
//       // customerID, companyAddress, contactInfo, contactRec, dateRec,
//       // evalBy, evalOut, DO Unit/Cert info, oicBy, oicCheckedBy) are
//       // intentionally excluded — they're sourced from receipts/delivery
//       // receipts/earlier pipeline stages, not editable here.
//       await onUpdate({
//         jobNumber: job.jobNumber,
//         description: form.description,
//         brand: form.brand,
//         model: form.model,
//         serialNo: form.serialNo,
//         range: form.range,
//         uncertainty: form.uncertainty,
//         remarks: form.remarks,
//         concern: form.concern,
//         contactCert: form.contactCert,
//         frequency: form.frequency,
//         eta: form.eta,
//         priority: form.priority,
//         voltage: form.voltage,
//         dateCal: form.dateCal,
//         dateDue: form.dateDue,
//         sig: form.sig,
//         typedBy: form.typedBy,
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <>
//       {ReactDOM.createPortal(
//         <div className="jnd-modal-overlay" onClick={onClose}>
//           <div
//             className="jnd-modal-wrapper"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <CdmsModalHeader title="JOB NUMBER DETAILS" onClose={onClose} />

//             {locked && (
//               <div className="jnd-lock-banner">
//                 🔒 Fields are locked. Click anywhere below to enter the admin
//                 password and enable editing.
//               </div>
//             )}

//             <div className="jnd-modal-body" style={{ position: "relative" }}>
//               {locked && (
//                 <div
//                   className="jnd-lock-overlay"
//                   onClick={() => setShowAdminPrompt(true)}
//                   title="Click to unlock editing (admin password required)"
//                 />
//               )}

//               <div className="jnd-grid">
//                 {/* LEFT COLUMN */}
//                 <div className="jnd-col">
//                   <div className="jnd-box">
//                     <div className="jnd-field">
//                       <label>Description</label>
//                       <textarea
//                         rows={3}
//                         value={form.description || ""}
//                         onChange={handleChange("description")}
//                         disabled={locked}
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Brand</label>
//                       <input
//                         type="text"
//                         value={form.brand || ""}
//                         onChange={handleChange("brand")}
//                         disabled={locked}
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Model</label>
//                       <input
//                         type="text"
//                         value={form.model || ""}
//                         onChange={handleChange("model")}
//                         disabled={locked}
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Serial No.</label>
//                       <input
//                         type="text"
//                         value={form.serialNo || ""}
//                         onChange={handleChange("serialNo")}
//                         disabled={locked}
//                       />
//                     </div>
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         {/* GUESS — no confirmed field for Unit Price yet */}
//                         <label>Unit Price</label>
//                         <input
//                           type="text"
//                           value={form.unitPrice || ""}
//                           onChange={handleChange("unitPrice")}
//                           disabled={locked}
//                         />
//                       </div>
//                       <div className="jnd-field">
//                         <label>Freq</label>
//                         <select
//                           value={form.frequency || "1 Year"}
//                           onChange={handleChange("frequency")}
//                           disabled={locked}
//                         >
//                           <option>6 Months</option>
//                           <option>1 Year</option>
//                           <option>2 Years</option>
//                           <option>3 Years</option>
//                         </select>
//                       </div>
//                     </div>
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         {/* Joined — whoever prepared the parent job receipt */}
//                         <label>Eval By</label>
//                         <input type="text" value={job.evalBy || ""} disabled />
//                       </div>
//                       <div className="jnd-field">
//                         <label>ETA</label>
//                         <input
//                           type="date"
//                           value={form.eta || ""}
//                           onChange={handleChange("eta")}
//                           disabled={locked}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* EVAL OUT / DO SECTION — boxed group, fills the space
//                       beneath the job detail box above */}
//                   <div className="jnd-box">
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         <label>Eval Out</label>
//                         <input type="text" value={job.evalOut || ""} disabled />
//                       </div>
//                     </div>
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         <label>DO Unit No</label>
//                         <input
//                           type="text"
//                           value={job.doUnitNo || ""}
//                           disabled
//                         />
//                       </div>
//                       <div className="jnd-field">
//                         <label>DO Cert No</label>
//                         <input
//                           type="text"
//                           value={job.doCertNo || ""}
//                           disabled
//                         />
//                       </div>
//                     </div>
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         <label>DO Unit Date</label>
//                         <input
//                           type="text"
//                           value={job.doUnitDate || ""}
//                           disabled
//                         />
//                       </div>
//                       <div className="jnd-field">
//                         <label>DO Cert Date</label>
//                         <input
//                           type="text"
//                           value={job.doCertDate || ""}
//                           disabled
//                         />
//                       </div>
//                     </div>
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         <label>DO Unit By</label>
//                         <input
//                           type="text"
//                           value={job.doUnitBy || ""}
//                           disabled
//                         />
//                       </div>
//                       <div className="jnd-field">
//                         <label>DO Cert By</label>
//                         <input
//                           type="text"
//                           value={job.doCertBy || ""}
//                           disabled
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* MIDDLE COLUMN */}
//                 <div className="jnd-col">
//                   <div className="jnd-box">
//                     <div className="jnd-field">
//                       <label>Range</label>
//                       <textarea
//                         rows={2}
//                         value={form.range || ""}
//                         onChange={handleChange("range")}
//                         disabled={locked}
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Std Uncert</label>
//                       <input
//                         type="text"
//                         value={form.uncertainty || ""}
//                         onChange={handleChange("uncertainty")}
//                         disabled={locked}
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Remarks</label>
//                       <textarea
//                         rows={2}
//                         value={form.remarks || ""}
//                         onChange={handleChange("remarks")}
//                         disabled={locked}
//                       />
//                     </div>
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         <label>Date Cal</label>
//                         <input
//                           type="date"
//                           value={form.dateCal || ""}
//                           onChange={handleChange("dateCal")}
//                           disabled={locked}
//                         />
//                       </div>
//                       <div className="jnd-field">
//                         <label>Date Due</label>
//                         <input
//                           type="date"
//                           value={form.dateDue || ""}
//                           onChange={handleChange("dateDue")}
//                           disabled={locked}
//                         />
//                       </div>
//                     </div>

//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         {/* OIC — the assigned OIC who processed Incoming/
//                             On-Going Calibration (oicBy). NOT oicCheckedBy,
//                             which is who later reviewed the report — that's
//                             shown separately below under "Draft Checked OIC
//                             by". */}
//                         <label>OIC</label>
//                         <input type="text" value={job.oicBy || ""} disabled />
//                       </div>
//                       <div className="jnd-field">
//                         <label>SIG</label>
//                         <input
//                           type="text"
//                           value={form.sig || ""}
//                           onChange={handleChange("sig")}
//                           disabled={locked}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* REPORT TRACKING SECTION — its own box */}
//                   <div className="jnd-box">
//                     <div className="jnd-field">
//                       <label>Report Typed By</label>
//                       <input type="text" value={form.typedBy || ""} disabled />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Draft Report Typed</label>
//                       <input
//                         type="text"
//                         value={formatTimestamp(job.draftReportTypedAt)}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Draft Checked OIC by</label>

//                       <input
//                         type="text"
//                         value={job.oicCheckedBy || ""}
//                         disabled
//                       />
//                       <label>Draft Checked OIC Date</label>
//                       <input
//                         type="text"
//                         value={formatTimestamp(job.draftCheckedOICAt)}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Cert Checked OIC</label>
//                       <input
//                         type="text"
//                         value={formatTimestamp(job.certCheckedOICAt)}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Draft Check Signatory by</label>
//                       <input
//                         type="text"
//                         value={job.sigCheckedBy || ""}
//                         disabled
//                       />
//                       <label>Draft Check Date</label>
//                       <input
//                         type="text"
//                         value={formatTimestamp(job.draftCheckedSIGAt)}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Cert Checked SIG</label>
//                       <input
//                         type="text"
//                         value={formatTimestamp(job.certCheckedSIGAt)}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Printed By</label>
//                       <input
//                         type="text"
//                         value={job.finalCertPrintedBy || ""}
//                         disabled
//                       />
//                       <label>Final Cert Printed</label>
//                       <input
//                         type="text"
//                         value={formatTimestamp(job.finalCertPrintedAt)}
//                         disabled
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* RIGHT COLUMN */}
//                 <div className="jnd-col jnd-col-right">
//                   <div className="jnd-box">
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         <label>JR ID</label>
//                         <input
//                           type="text"
//                           value={job.jobReceiptID || ""}
//                           disabled
//                         />
//                       </div>
//                       <div className="jnd-field">
//                         <label>Job Number</label>
//                         <input
//                           type="text"
//                           value={job.jobNumber || ""}
//                           disabled
//                         />
//                       </div>
//                     </div>
//                     <div className="jnd-field-row">
//                       {/* Populated for jobs created from Site Calibration
//                           (see AddSiteCalibrationModal.jsx) — blank for
//                           jobs created via regular Job Receipt. */}
//                       <div className="jnd-field">
//                         <label>SC ID</label>
//                         <input type="text" value={job.scId || ""} disabled />
//                       </div>
//                       <div className="jnd-field">
//                         <label>Date Rec</label>
//                         <input type="text" value={job.dateRec || ""} disabled />
//                       </div>
//                     </div>
//                     <div className="jnd-field-row">
//                       {/* Who created this job number — stamped as
//                           job.recBy at creation time. Currently only wired
//                           up for Site Calibration jobs (see
//                           AddSiteCalibrationModal.jsx's handleUpdate, which
//                           sends the logged-in preparedBy as recBy). Jobs
//                           created via the regular Job Receipt flow won't
//                           have this set until that flow stamps it too. */}
//                       <div className="jnd-field">
//                         <label>Rec By</label>
//                         <input type="text" value={job.recBy || ""} disabled />
//                       </div>
//                       <div className="jnd-field">
//                         <label>Reception</label>
//                         <input type="text" value={getMOR(job)} disabled />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="jnd-box">
//                     {/* Joined from the parent job receipt (see JobNumber.jsx
//                         fetchJobs) — read-only here since editing wouldn't
//                         update the source receipt. */}
//                     <div className="jnd-field">
//                       <label>CustomerID</label>
//                       <input
//                         type="text"
//                         value={job.customerID || ""}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Company Name</label>
//                       <textarea
//                         rows={2}
//                         value={job.companyName || ""}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Address</label>
//                       <textarea
//                         rows={2}
//                         value={job.companyAddress || ""}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Contact Info</label>
//                       <textarea
//                         rows={2}
//                         value={job.contactInfo || ""}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Contact Rec</label>
//                       <input
//                         type="text"
//                         value={job.contactRec || ""}
//                         disabled
//                       />
//                     </div>
//                     <div className="jnd-field">
//                       <label>Contact Cert</label>
//                       <input
//                         type="text"
//                         value={form.contactCert || ""}
//                         onChange={handleChange("contactCert")}
//                         disabled={locked}
//                       />
//                     </div>
//                   </div>

//                   <div className="jnd-box">
//                     {/* GUESS — SI ID / OR ID not confirmed yet */}
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         <label>SI ID</label>
//                         <input type="text" value={form.siId || ""} disabled />
//                       </div>
//                       <div className="jnd-field">
//                         <label>Tag</label>
//                         <input
//                           type="text"
//                           value={formatTimestamp(job.taggedAt)}
//                           disabled
//                         />
//                       </div>
//                     </div>
//                     <div className="jnd-field-row">
//                       <div className="jnd-field">
//                         <label>OR ID</label>
//                         <input type="text" value={form.orId || ""} disabled />
//                       </div>
//                       <div className="jnd-field">
//                         <label>Priority</label>
//                         <select
//                           value={form.priority || "Normal"}
//                           onChange={handleChange("priority")}
//                           disabled={locked}
//                         >
//                           <option>Normal</option>
//                           <option>Rush</option>
//                           <option>On Hold</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="jnd-field">
//                 <label>Remarks Re...</label>
//                 <textarea
//                   rows={2}
//                   value={form.remarksRe || ""}
//                   onChange={handleChange("remarksRe")}
//                   disabled={locked}
//                 />
//               </div>

//               {/* JOB CONCERNS + STATUS */}

//               <div className="jnd-bottom-row">
//                 <div className="jnd-field jnd-field-concerns">
//                   <label>Job Concerns</label>
//                   <textarea
//                     rows={3}
//                     className="jnd-concerns-box"
//                     value={form.concern || ""}
//                     onChange={handleChange("concern")}
//                     disabled={locked}
//                   />
//                 </div>
//                 {onShowCalibrationDetails && (
//                   <button
//                     className="jnd-btn"
//                     onClick={() => onShowCalibrationDetails(job)}
//                   >
//                     Show Calibration Details
//                   </button>
//                 )}
//               </div>

//               <div className="jnd-status-row">
//                 <input type="text" value={getJobStatus(job)} disabled />
//               </div>
//             </div>

//             {/* FOOTER */}
//             <div className="jnd-modal-footer">
//               {/* <button className="jnd-btn" disabled>
//                 Modification History
//               </button> */}
//               {/* <button className="jnd-btn">Mark Job Number as PRIORITY</button> */}
//               <div className="jnd-footer-spacer" />
//               {/* <button className="jnd-btn">Print Tag</button> */}
//               <button
//                 className="jnd-btn"
//                 onClick={handleOpenFolderClick}
//                 disabled={!job.jobNumber}
//                 title={
//                   !job.jobNumber
//                     ? "No job number on this record yet"
//                     : undefined
//                 }
//               >
//                 Open Folder
//               </button>
//               <button
//                 className="jnd-btn"
//                 onClick={handleOpenCameraClick}
//                 disabled={isUploadingPhotos}
//               >
//                 {isUploadingPhotos ? "Saving Photo..." : "Open Camera"}
//               </button>
//               {/* <button className="jnd-btn">Print Folder</button>
//               <button className="jnd-btn">Open Report</button> */}
//               <button
//                 className="jnd-btn jnd-btn-primary"
//                 onClick={handleUpdateClick}
//                 disabled={saving || locked}
//               >
//                 {saving ? "Updating..." : "Update"}
//               </button>
//               <button className="jnd-btn" onClick={onClose}>
//                 Exit
//               </button>
//             </div>
//           </div>

//           {/* ADMIN PASSWORD PROMPT — unlocks all fields for this session on success */}
//           {showAdminPrompt && (
//             <AdminPasswordModal
//               onClose={() => setShowAdminPrompt(false)}
//               onVerified={handleAdminVerified}
//             />
//           )}
//         </div>,
//         document.body,
//       )}

//       {/* JOB FOLDER MODAL — lists every file Cloudinary has for this job
//           number (equipment photos + documents), fetched fresh on open. */}
//       {showFolder && job.jobNumber && (
//         <ReceiptFolderModal
//           jobNumber={job.jobNumber}
//           onClose={() => setShowFolder(false)}
//         />
//       )}

//       {/* CAMERA MODAL — captures 1+ photos, each uploaded straight to
//           this job's Cloudinary equipment-photos folder on capture (see
//           handleCameraCapture above). Captured photos are visible
//           afterward via "Open Folder" above. */}
//       {showCamera && (
//         <CameraCaptureModal
//           onClose={handleCameraClose}
//           onCapture={handleCameraCapture}
//           contextLabel={job.jobNumber}
//         />
//       )}
//     </>
//   );
// };

// export default JobNumberDetailsModal;
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader"; // adjust path as needed
import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
// Adjust this path to wherever CameraCaptureModal actually lives in your
// tree (same component the other stage modals use).
import CameraCaptureModal from "../jobreceipt/CameraCaptureModal";
import "./JobNumberDetailsModal.css";

const API = import.meta.env.VITE_API_URL;

// Converts a base64 dataURL (what CameraCaptureModal produces, from
// either canvas.toDataURL or FileReader.readAsDataURL) into a Blob, so it
// can be sent as multipart/form-data to the equipment-photo upload route.
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return res.blob();
};

// Determine MOR (mode of receipt / "Reception") based on the dedicated
// onSite flag (set in JobNumberModal / stamped true by default for every
// job added from Site Calibration — see AddSiteCalibrationModal.jsx's
// handleOpenJobNumber). NOT `tagged`, which only tracks pipeline-stage
// progress and is always true for Site Calibration jobs regardless of
// reception type — using it here previously made every SC job show
// "In House" even when it was actually On-Site.
const getMOR = (job) => {
  if (job.onSite === true) return "On-Site";
  if (job.onSite === false) return "In House";
  return "Waiting for Update";
};

// Determine job status label based on the most advanced flag set to true
const getJobStatus = (job) => {
  // Checked first — RWOC is a terminal state set from Outgoing Concern's
  // "Log RWOC" button (see ConcernOutgoing.jsx's handleLogRwoc) and
  // should always win over whatever earlier-stage flags the job still
  // carries (concernTagged, ongoingTagged, etc. are never cleared by
  // RWOC, only concernTagged/outgoingConcernTagged are).
  if (job.rwocTagged) return "Job Number Finished (RWOC)";
  if (job.unitDelivered && job.certificateDelivered)
    return "Job Number Finished";
  if (job.forDeliveryTagged) return "For Delivery";
  if (job.forPrintFinalTagged) return "Print Final Certificate";
  if (job.forCheckingSigTagged) return "For Checking SIG";
  if (job.forCheckingOICTagged) return "For Checking OIC";
  if (job.forTypingTagged) return "For Typing";
  if (job.ongoingTagged) return "On-Going Calibration";
  if (job.tagged && job.concernTagged) return "Incoming Concern";
  if (job.tagged) return "Incoming Calibration";
  return "Waiting for Update";
};

const formatTimestamp = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

// Collapsible field-group wrapper. Click the header to expand/collapse.
// defaultOpen controls initial state per-section — primary/edit-heavy
// sections default open, secondary/read-only sections default closed
// to shorten the initial scroll on mobile.
const CollapsibleBox = ({ title, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="jnd-box">
      <button
        type="button"
        className="jnd-box-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={`jnd-box-chevron ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && <div className="jnd-box-content">{children}</div>}
    </div>
  );
};

const JobNumberDetailsModal = ({
  job,
  onClose,
  onUpdate,
  onShowCalibrationDetails,
}) => {
  const [form, setForm] = useState(job || {});
  const [saving, setSaving] = useState(false);

  // FIELD LOCK — opens locked every time; a correct admin password
  // unlocks editing for the rest of this modal session. Resets to
  // locked whenever a different job is opened.
  const [locked, setLocked] = useState(true);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  // OPEN FOLDER — shows every file (equipment photos + documents)
  // already stored under this job number's Cloudinary folder, via the
  // same JobFolderModal used on ForTyping / ForCheckingOIC /
  // ForCheckingSig / ForPrintFinal.
  const [showFolder, setShowFolder] = useState(false);

  useEffect(() => {
    setForm(job || {});
    setLocked(true);
  }, [job]);

  if (!job) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAdminVerified = () => {
    setShowAdminPrompt(false);
    setLocked(false);
  };

  const handleOpenFolderClick = () => {
    setShowFolder(true);
  };

  // --- Equipment photo capture ---------------------------------------
  // Same pattern as ForCheckingSigDetailsModal / ForPrintFinalDetails-
  // Modal: this modal owns the full open -> capture -> upload chain
  // itself. Unlike those two, this screen has no ConfirmDialog/showError
  // component wired up (only AdminPasswordModal), so errors here fall
  // back to window.alert — swap in a real dialog if/when one gets added
  // to this modal. No local photoUrls array is kept here — captured
  // photos are only ever viewed via "Open Folder" above.
  const [showCamera, setShowCamera] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const handleOpenCameraClick = () => {
    if (!job.jobNumber) {
      window.alert(
        "This record has no job number yet, so a photo can't be saved.",
      );
      return;
    }
    setShowCamera(true);
  };

  const handleCameraCapture = async (photos) => {
    setShowCamera(false);
    if (!photos || photos.length === 0) return;

    setIsUploadingPhotos(true);
    try {
      for (const dataUrl of photos) {
        const blob = await dataUrlToBlob(dataUrl);
        const formData = new FormData();
        formData.append("photo", blob, `photo_${Date.now()}.jpg`);

        const res = await fetch(
          `${API}/api/uploads/equipment-photo/${encodeURIComponent(
            job.jobNumber,
          )}`,
          { method: "POST", body: formData },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(data?.message || "Photo upload failed");
        }
      }
    } catch (err) {
      console.error("Failed to upload captured photo(s):", err);
      window.alert(
        "One or more captured photos could not be saved. Please try taking the photo again.",
      );
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  const handleUpdateClick = async () => {
    if (!onUpdate) return;
    setSaving(true);
    try {
      // Only send fields that are confirmed to exist on the jobnumbers
      // collection today. Joined/read-only fields (companyName,
      // customerID, companyAddress, contactInfo, contactRec, dateRec,
      // evalBy, evalOut, DO Unit/Cert info, oicBy, oicCheckedBy) are
      // intentionally excluded — they're sourced from receipts/delivery
      // receipts/earlier pipeline stages, not editable here.
      await onUpdate({
        jobNumber: job.jobNumber,
        description: form.description,
        brand: form.brand,
        model: form.model,
        serialNo: form.serialNo,
        range: form.range,
        uncertainty: form.uncertainty,
        remarks: form.remarks,
        concern: form.concern,
        contactCert: form.contactCert,
        frequency: form.frequency,
        eta: form.eta,
        priority: form.priority,
        voltage: form.voltage,
        dateCal: form.dateCal,
        dateDue: form.dateDue,
        sig: form.sig,
        typedBy: form.typedBy,
        // Staff-entered identifiers — confirm the backend PATCH/PUT
        // route for jobnumbers accepts and persists these two fields.
        siId: form.siId,
        orId: form.orId,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {ReactDOM.createPortal(
        <div className="jnd-modal-overlay" onClick={onClose}>
          <div
            className="jnd-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <CdmsModalHeader title="JOB NUMBER DETAILS" onClose={onClose} />

            {locked && (
              <div className="jnd-lock-banner">
                🔒 Fields are locked. Click anywhere below to enter the admin
                password and enable editing.
              </div>
            )}

            <div className="jnd-modal-body" style={{ position: "relative" }}>
              {locked && (
                <div
                  className="jnd-lock-overlay"
                  onClick={() => setShowAdminPrompt(true)}
                  title="Click to unlock editing (admin password required)"
                />
              )}

              <div className="jnd-grid">
                {/* LEFT COLUMN */}
                <div className="jnd-col">
                  <CollapsibleBox title="Job Details" defaultOpen={true}>
                    <div className="jnd-field">
                      <label>Description</label>
                      <textarea
                        rows={3}
                        value={form.description || ""}
                        onChange={handleChange("description")}
                        disabled={locked}
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Brand</label>
                      <input
                        type="text"
                        value={form.brand || ""}
                        onChange={handleChange("brand")}
                        disabled={locked}
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Model</label>
                      <input
                        type="text"
                        value={form.model || ""}
                        onChange={handleChange("model")}
                        disabled={locked}
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Serial No.</label>
                      <input
                        type="text"
                        value={form.serialNo || ""}
                        onChange={handleChange("serialNo")}
                        disabled={locked}
                      />
                    </div>
                    <div className="jnd-field-row">
                      <div className="jnd-field">
                        {/* GUESS — no confirmed field for Unit Price yet */}
                        <label>Unit Price</label>
                        <input
                          type="text"
                          value={form.unitPrice || ""}
                          onChange={handleChange("unitPrice")}
                          disabled={locked}
                        />
                      </div>
                      <div className="jnd-field">
                        <label>Freq</label>
                        <select
                          value={form.frequency || "1 Year"}
                          onChange={handleChange("frequency")}
                          disabled={locked}
                        >
                          <option>6 Months</option>
                          <option>1 Year</option>
                          <option>2 Years</option>
                          <option>3 Years</option>
                        </select>
                      </div>
                    </div>
                    <div className="jnd-field-row">
                      <div className="jnd-field">
                        {/* Joined — whoever prepared the parent job receipt */}
                        <label>Eval By</label>
                        <input type="text" value={job.evalBy || ""} disabled />
                      </div>
                      <div className="jnd-field">
                        <label>ETA</label>
                        <input
                          type="date"
                          value={form.eta || ""}
                          onChange={handleChange("eta")}
                          disabled={locked}
                        />
                      </div>
                    </div>
                  </CollapsibleBox>

                  {/* EVAL OUT / DO SECTION */}
                  <CollapsibleBox
                    title="Eval Out / DO Details"
                    defaultOpen={false}
                  >
                    <div className="jnd-field-row">
                      <div className="jnd-field">
                        <label>Eval Out</label>
                        <input type="text" value={job.evalOut || ""} disabled />
                      </div>
                    </div>
                    <div className="jnd-field-row">
                      <div className="jnd-field">
                        <label>DO Unit No</label>
                        <input
                          type="text"
                          value={job.doUnitNo || ""}
                          disabled
                        />
                      </div>
                      <div className="jnd-field">
                        <label>DO Cert No</label>
                        <input
                          type="text"
                          value={job.doCertNo || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="jnd-field-row">
                      <div className="jnd-field">
                        <label>DO Unit Date</label>
                        <input
                          type="text"
                          value={job.doUnitDate || ""}
                          disabled
                        />
                      </div>
                      <div className="jnd-field">
                        <label>DO Cert Date</label>
                        <input
                          type="text"
                          value={job.doCertDate || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="jnd-field-row">
                      <div className="jnd-field">
                        <label>DO Unit By</label>
                        <input
                          type="text"
                          value={job.doUnitBy || ""}
                          disabled
                        />
                      </div>
                      <div className="jnd-field">
                        <label>DO Cert By</label>
                        <input
                          type="text"
                          value={job.doCertBy || ""}
                          disabled
                        />
                      </div>
                    </div>
                  </CollapsibleBox>
                </div>

                {/* MIDDLE COLUMN */}
                <div className="jnd-col">
                  <CollapsibleBox
                    title="Calibration Details"
                    defaultOpen={true}
                  >
                    <div className="jnd-field">
                      <label>Range</label>
                      <textarea
                        rows={2}
                        value={form.range || ""}
                        onChange={handleChange("range")}
                        disabled={locked}
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Std Uncert</label>
                      <input
                        type="text"
                        value={form.uncertainty || ""}
                        onChange={handleChange("uncertainty")}
                        disabled={locked}
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Remarks</label>
                      <textarea
                        rows={2}
                        value={form.remarks || ""}
                        onChange={handleChange("remarks")}
                        disabled={locked}
                      />
                    </div>
                    <div className="jnd-field-row">
                      <div className="jnd-field">
                        <label>Date Cal</label>
                        <input
                          type="date"
                          value={form.dateCal || ""}
                          onChange={handleChange("dateCal")}
                          disabled={locked}
                        />
                      </div>
                      <div className="jnd-field">
                        <label>Date Due</label>
                        <input
                          type="date"
                          value={form.dateDue || ""}
                          onChange={handleChange("dateDue")}
                          disabled={locked}
                        />
                      </div>
                    </div>

                    <div className="jnd-field-row">
                      <div className="jnd-field">
                        {/* OIC — the assigned OIC who processed Incoming/
                            On-Going Calibration (oicBy). NOT oicCheckedBy,
                            which is who later reviewed the report — that's
                            shown separately below under "Draft Checked OIC
                            by". */}
                        <label>OIC</label>
                        <input type="text" value={job.oicBy || ""} disabled />
                      </div>
                      <div className="jnd-field">
                        <label>SIG</label>
                        <input
                          type="text"
                          value={form.sig || ""}
                          onChange={handleChange("sig")}
                          disabled={locked}
                        />
                      </div>
                    </div>
                  </CollapsibleBox>

                  {/* REPORT TRACKING SECTION */}
                  <CollapsibleBox title="Report Tracking" defaultOpen={false}>
                    <div className="jnd-field">
                      <label>Report Typed By</label>
                      <input type="text" value={form.typedBy || ""} disabled />
                    </div>
                    <div className="jnd-field">
                      <label>Draft Report Typed</label>
                      <input
                        type="text"
                        value={formatTimestamp(job.draftReportTypedAt)}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Draft Checked OIC by</label>

                      <input
                        type="text"
                        value={job.oicCheckedBy || ""}
                        disabled
                      />
                      <label>Draft Checked OIC Date</label>
                      <input
                        type="text"
                        value={formatTimestamp(job.draftCheckedOICAt)}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Cert Checked OIC</label>
                      <input
                        type="text"
                        value={formatTimestamp(job.certCheckedOICAt)}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Draft Check Signatory by</label>
                      <input
                        type="text"
                        value={job.sigCheckedBy || ""}
                        disabled
                      />
                      <label>Draft Check Date</label>
                      <input
                        type="text"
                        value={formatTimestamp(job.draftCheckedSIGAt)}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Cert Checked SIG</label>
                      <input
                        type="text"
                        value={formatTimestamp(job.certCheckedSIGAt)}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Printed By</label>
                      <input
                        type="text"
                        value={job.finalCertPrintedBy || ""}
                        disabled
                      />
                      <label>Final Cert Printed</label>
                      <input
                        type="text"
                        value={formatTimestamp(job.finalCertPrintedAt)}
                        disabled
                      />
                    </div>
                  </CollapsibleBox>
                </div>

                {/* RIGHT COLUMN */}
                <div className="jnd-col jnd-col-right">
                  <CollapsibleBox title="Job Info" defaultOpen={true}>
                    <div className="jnd-field-row">
                      <div className="jnd-field">
                        <label>JR ID</label>
                        <input
                          type="text"
                          value={job.jobReceiptID || ""}
                          disabled
                        />
                      </div>
                      <div className="jnd-field">
                        <label>Job Number</label>
                        <input
                          type="text"
                          value={job.jobNumber || ""}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="jnd-field-row">
                      {/* Populated for jobs created from Site Calibration
                          (see AddSiteCalibrationModal.jsx) — blank for
                          jobs created via regular Job Receipt. */}
                      <div className="jnd-field">
                        <label>SC ID</label>
                        <input type="text" value={job.scId || ""} disabled />
                      </div>
                      <div className="jnd-field">
                        <label>Date Rec</label>
                        <input type="text" value={job.dateRec || ""} disabled />
                      </div>
                    </div>
                    <div className="jnd-field-row">
                      {/* Who created this job number — stamped as
                          job.recBy at creation time. Currently only wired
                          up for Site Calibration jobs (see
                          AddSiteCalibrationModal.jsx's handleUpdate, which
                          sends the logged-in preparedBy as recBy). Jobs
                          created via the regular Job Receipt flow won't
                          have this set until that flow stamps it too. */}
                      <div className="jnd-field">
                        <label>Rec By</label>
                        <input type="text" value={job.recBy || ""} disabled />
                      </div>
                      <div className="jnd-field">
                        <label>Reception</label>
                        <input type="text" value={getMOR(job)} disabled />
                      </div>
                    </div>
                  </CollapsibleBox>

                  <CollapsibleBox title="Company Info" defaultOpen={false}>
                    {/* Joined from the parent job receipt (see JobNumber.jsx
                        fetchJobs) — read-only here since editing wouldn't
                        update the source receipt. */}
                    <div className="jnd-field">
                      <label>CustomerID</label>
                      <input
                        type="text"
                        value={job.customerID || ""}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Company Name</label>
                      <textarea
                        rows={2}
                        value={job.companyName || ""}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Address</label>
                      <textarea
                        rows={2}
                        value={job.companyAddress || ""}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Contact Info</label>
                      <textarea
                        rows={2}
                        value={job.contactInfo || ""}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Contact Rec</label>
                      <input
                        type="text"
                        value={job.contactRec || ""}
                        disabled
                      />
                    </div>
                    <div className="jnd-field">
                      <label>Contact Cert</label>
                      <input
                        type="text"
                        value={form.contactCert || ""}
                        onChange={handleChange("contactCert")}
                        disabled={locked}
                      />
                    </div>
                  </CollapsibleBox>

                  <CollapsibleBox title="SI/OR & Priority" defaultOpen={false}>
                    <div className="jnd-field-row">
                      <div className="jnd-field jnd-field-always-editable">
                        {/* Staff-entered identifier — editable regardless of the
        admin lock, since staff need to fill this in during normal
        workflow without requiring admin verification. */}
                        <label>SI ID</label>
                        <input
                          type="text"
                          value={form.siId || ""}
                          onChange={handleChange("siId")}
                        />
                      </div>
                      <div className="jnd-field">
                        {/* System timestamp — stays read-only */}
                        <label>Tag</label>
                        <input
                          type="text"
                          value={formatTimestamp(job.taggedAt)}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="jnd-field-row">
                      <div className="jnd-field jnd-field-always-editable">
                        {/* Staff-entered identifier — editable regardless of the
        admin lock */}
                        <label>OR ID</label>
                        <input
                          type="text"
                          value={form.orId || ""}
                          onChange={handleChange("orId")}
                        />
                      </div>
                      <div className="jnd-field">
                        <label>Priority</label>
                        <select
                          value={form.priority || "Normal"}
                          onChange={handleChange("priority")}
                          disabled={locked}
                        >
                          <option>Normal</option>
                          <option>Rush</option>
                          <option>On Hold</option>
                        </select>
                      </div>
                    </div>
                  </CollapsibleBox>
                </div>
              </div>

              <div className="jnd-field">
                <label>Remarks </label>
                <textarea
                  rows={2}
                  value={form.remarksRe || ""}
                  onChange={handleChange("remarksRe")}
                  disabled={locked}
                />
              </div>

              {/* JOB CONCERNS + STATUS */}

              <div className="jnd-bottom-row">
                <div className="jnd-field jnd-field-concerns">
                  <label>Job Concerns</label>
                  <textarea
                    rows={3}
                    className="jnd-concerns-box"
                    value={form.concern || ""}
                    onChange={handleChange("concern")}
                    disabled={locked}
                  />
                </div>
                {onShowCalibrationDetails && (
                  <button
                    className="jnd-btn"
                    onClick={() => onShowCalibrationDetails(job)}
                  >
                    Show Calibration Details
                  </button>
                )}
              </div>

              <div className="jnd-status-row">
                <input type="text" value={getJobStatus(job)} disabled />
              </div>
            </div>

            {/* FOOTER */}
            <div className="jnd-modal-footer">
              {/* <button className="jnd-btn" disabled>
                Modification History
              </button> */}
              {/* <button className="jnd-btn">Mark Job Number as PRIORITY</button> */}
              <div className="jnd-footer-spacer" />
              {/* <button className="jnd-btn">Print Tag</button> */}
              <button
                className="jnd-btn"
                onClick={handleOpenFolderClick}
                disabled={!job.jobNumber}
                title={
                  !job.jobNumber
                    ? "No job number on this record yet"
                    : undefined
                }
              >
                View Files
              </button>
              <button
                className="jnd-btn"
                onClick={handleOpenCameraClick}
                disabled={isUploadingPhotos}
              >
                {isUploadingPhotos ? "Saving Photo..." : "Open Camera"}
              </button>
              {/* <button className="jnd-btn">Print Folder</button>
              <button className="jnd-btn">Open Report</button> */}
              <button
                className="jnd-btn jnd-btn-primary"
                onClick={handleUpdateClick}
                disabled={saving || locked}
              >
                {saving ? "Updating..." : "Update"}
              </button>
              <button className="jnd-btn" onClick={onClose}>
                Exit
              </button>
            </div>
          </div>

          {/* ADMIN PASSWORD PROMPT — unlocks all fields for this session on success */}
          {showAdminPrompt && (
            <AdminPasswordModal
              onClose={() => setShowAdminPrompt(false)}
              onVerified={handleAdminVerified}
            />
          )}
        </div>,
        document.body,
      )}

      {/* JOB FOLDER MODAL — lists every file Cloudinary has for this job
          number (equipment photos + documents), fetched fresh on open. */}
      {showFolder && job.jobNumber && (
        <ReceiptFolderModal
          jobNumber={job.jobNumber}
          onClose={() => setShowFolder(false)}
        />
      )}

      {/* CAMERA MODAL — captures 1+ photos, each uploaded straight to
          this job's Cloudinary equipment-photos folder on capture (see
          handleCameraCapture above). Captured photos are visible
          afterward via "Open Folder" above. */}
      {showCamera && (
        <CameraCaptureModal
          onClose={handleCameraClose}
          onCapture={handleCameraCapture}
          contextLabel={job.jobNumber}
        />
      )}
    </>
  );
};

export default JobNumberDetailsModal;
