// import React, { useState, useRef } from "react";
// import { createPortal } from "react-dom";
// import "./ForCheckingOICDetailsModal.css";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
// // Adjust this path to wherever CameraCaptureModal actually lives in your
// // tree (same component IncomingCalibDetailsModal / ForTypingDetailsModal
// // use).
// import CameraCaptureModal from "../jobreceipt/CameraCaptureModal";

// const API = import.meta.env.VITE_API_URL;

// const STANDARD_COLUMNS = ["item1", "item2"];
// const STANDARD_ROW_COUNT = 5;

// const emptyStandardRow = () => ({ item1: "", item2: "" });

// // Converts a base64 dataURL (what CameraCaptureModal produces, from
// // either canvas.toDataURL or FileReader.readAsDataURL) into a Blob, so it
// // can be sent as multipart/form-data to the equipment-photo upload route.
// const dataUrlToBlob = async (dataUrl) => {
//   const res = await fetch(dataUrl);
//   return res.blob();
// };

// /**
//  * ForCheckingOICDetailsModal
//  *
//  * Read-only "draft report" review screen shown when a row is clicked in
//  * ForCheckingOIC.jsx. Dedicated component (not shared with
//  * ForTypingDetailsModal) so this stage's specific actions — e.g.
//  * approving the report, flagging a concern back to the typist, etc. —
//  * can evolve independently without affecting the ForTyping screen.
//  *
//  * "Check and Sign Report" downloads the job's latest uploaded report
//  * (the file ForTyping's "Upload and Auto Backup" saved) with the OIC's
//  * saved signature stamped onto it — see POST /api/uploads/check-and-sign,
//  * which finds the report, finds the OIC's signature image, and returns
//  * a signed copy without touching the stored original.
//  *
//  * "Update" now requires re-uploading the (presumably reviewed/edited)
//  * template before it actually moves the job forward — same
//  * upload-then-confirm pattern ForTypingDetailsModal uses for its
//  * "Upload and Auto Backup" button.
//  */
// const ForCheckingOICDetailsModal = ({
//   jobForm,
//   onClose,
//   onOpenCamera,
//   onOpenFolder,
//   onCheckAndSignReport,
//   onUpdate,
//   onLogForRetyping,
//   onOpenCalStandardLookup, // (rowIndex, columnKey) => void
//   onOpenCalProcedureLookup,
//   isUpdateEnabled = false,
// }) => {
//   const calibrationStandards =
//     jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
//       ? jobForm.calibrationStandards
//       : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

//   // ---- Confirm / error dialog (same pattern as IncomingCalibDetailsModal) ----
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

//   const showConfirm = (title, message, onConfirm, type = "default") => {
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

//   // Reused for plain info/error messages (single OK button, no Cancel),
//   // same shape as ForTypingDetailsModal's showError.
//   const showError = (title, message) => {
//     setDialog({
//       show: true,
//       title,
//       message,
//       onConfirm: hideDialog,
//       onCancel: null,
//       confirmLabel: "OK",
//       cancelLabel: "Cancel",
//       type: "danger",
//     });
//   };

//   // --- Check and Sign: fetch the job's report already signed --------
//   // Calls POST /api/uploads/check-and-sign/:jobNumber, which finds this
//   // job's latest uploaded .xlsx report, finds the OIC's saved signature
//   // image (keyed by jobForm.oicBy under cdms/Signatures/oic-signature/),
//   // stamps it onto the "Front Page" and "Calib Data 1" sheets, and
//   // streams back the signed copy. The stored original in Cloudinary is
//   // never modified — the signed file only exists in this response.
//   const [isDownloading, setIsDownloading] = useState(false);

//   const handleCheckAndSignDownload = async () => {
//     if (!jobForm.jobNumber) {
//       showError(
//         "No Job Number",
//         "This record has no job number yet, so no file can be downloaded.",
//       );
//       return false;
//     }
//     if (!jobForm.oicBy) {
//       showError(
//         "No OIC Assigned",
//         "This record has no OIC assigned yet, so a signature can't be applied.",
//       );
//       return false;
//     }

//     setIsDownloading(true);
//     try {
//       const filename = `${jobForm.jobNumber} - Signed by OIC.xlsx`;
//       const res = await fetch(
//         `${API}/api/uploads/check-and-sign/${encodeURIComponent(
//           jobForm.jobNumber,
//         )}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ username: jobForm.oicBy, filename }),
//         },
//       );

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.message || `Signing failed with ${res.status}`);
//       }

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);

//       return true;
//     } catch (err) {
//       console.error("Failed to sign and download report:", err);
//       showError(
//         "Signing Failed",
//         err.message ||
//           "The report could not be signed and downloaded. Please try again.",
//       );
//       return false;
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const handleCheckAndSignReportClick = () => {
//     showConfirm(
//       "Check and Sign Report",
//       `Are you sure you want to check and sign the report for Job Number ${jobForm.jobNumber}? This will download the report with the OIC's signature applied.`,
//       async () => {
//         hideDialog();
//         const downloaded = await handleCheckAndSignDownload();
//         // Only unlock Update if the signed download actually went through.
//         if (downloaded) {
//           onCheckAndSignReport?.();
//         }
//       },
//       "default",
//     );
//   };

//   // --- Update: re-upload the edited/reviewed template, then confirm --
//   // Clicking "Update" no longer jumps straight to the confirm dialog —
//   // it first opens a hidden file input (same pattern as
//   // ForTypingDetailsModal's Upload button). The picked file is uploaded
//   // to this job's documents folder via the same
//   // POST /api/uploads/job-document/:jobNumber route ForTyping uses.
//   // Only once that upload succeeds does the "Confirm Update" dialog
//   // appear, and only confirming that actually calls onUpdate (which
//   // moves the job on to Checking SIG).
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const handleUpdateButtonClick = () => {
//     if (!jobForm.jobNumber) {
//       showError(
//         "No Job Number",
//         "This record has no job number yet, so a file can't be uploaded.",
//       );
//       return;
//     }
//     fileInputRef.current?.click();
//   };

//   const handleFileSelected = async (e) => {
//     const file = e.target.files?.[0];
//     // Reset immediately so selecting the same file again later (e.g.
//     // after a failed upload) still fires onChange.
//     e.target.value = "";
//     if (!file) return;

//     // Enforce .xlsx only — `accept` on the <input> can be bypassed via
//     // "All Files" in the OS picker, so this is the real gate.
//     const isXlsx =
//       file.name?.toLowerCase().endsWith(".xlsx") ||
//       file.type ===
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
//     if (!isXlsx) {
//       showError(
//         "Invalid File Type",
//         "Only .xlsx files are accepted for the reviewed report.",
//       );
//       return;
//     }

//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await fetch(
//         `${API}/api/uploads/job-document/${encodeURIComponent(
//           jobForm.jobNumber,
//         )}`,
//         {
//           method: "POST",
//           body: formData,
//         },
//       );

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok || !data.success) {
//         throw new Error(data.message || `Upload failed with ${res.status}`);
//       }

//       // Upload succeeded — now ask for confirmation before actually
//       // moving the job to Checking SIG.
//       showConfirm(
//         "Confirm Update",
//         `Are you sure you want to update Job Number ${jobForm.jobNumber}?`,
//         () => {
//           hideDialog();
//           onUpdate?.();
//         },
//         "default",
//       );
//     } catch (err) {
//       console.error("Failed to upload edited template:", err);
//       showError(
//         "Upload Failed",
//         "The edited template could not be uploaded. Please try again.",
//       );
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleLogForRetypingClick = () => {
//     showConfirm(
//       "Log for Re-Typing",
//       `Are you sure you want to send Job Number ${jobForm.jobNumber} back for re-typing? This will return it to the typist.`,
//       () => {
//         hideDialog();
//         onLogForRetyping?.();
//       },
//       "danger",
//     );
//   };

//   const handleExitClick = () => {
//     showConfirm(
//       "Confirm Exit",
//       "Are you sure you want to exit this report?",
//       () => {
//         hideDialog();
//         onClose();
//       },
//     );
//   };

//   // OPEN FOLDER — shows every file (equipment photos + documents)
//   // already stored under this job number's Cloudinary folder, same
//   // JobFolderModal used from ForTypingDetailsModal's "Open Folder"
//   // button and JobNumberModal's. onOpenFolder (if passed in) still
//   // fires first, in case the parent screen needs to do something of
//   // its own (e.g. logging/analytics) — but showing the modal no longer
//   // depends on the parent actually doing anything with it.
//   const [showFolder, setShowFolder] = useState(false);

//   const handleOpenFolderClick = () => {
//     onOpenFolder?.();
//     setShowFolder(true);
//   };

//   // --- Equipment photo capture ---------------------------------------
//   // Same fix applied to ForTypingDetailsModal: the "Open Camera" button
//   // used to call onOpenCamera directly as its onClick — no await, no
//   // result handling, no camera UI rendered anywhere in this file — so
//   // whether anything happened at all depended entirely on the parent
//   // (ForCheckingOIC.jsx) implementing the full open -> capture -> upload
//   // chain itself. This modal now owns that chain directly: it opens
//   // CameraCaptureModal itself, and on capture, uploads each photo
//   // straight to POST /api/uploads/equipment-photo/:jobNumber (same
//   // route IncomingCalibDetailsModal and ForTypingDetailsModal use), so
//   // photos are saved server-side immediately regardless of what the
//   // user does afterward. onOpenCamera is still called first, if passed,
//   // purely so a parent that wants to know "camera was opened" (e.g. for
//   // logging) still can. No local photoUrls array is kept here — this
//   // screen has no photo carousel of its own, captured photos are only
//   // ever viewed via "Open Folder" above.
//   const [showCamera, setShowCamera] = useState(false);
//   const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

//   const handleOpenCameraClick = () => {
//     onOpenCamera?.();

//     if (!jobForm.jobNumber) {
//       showError(
//         "No Job Number",
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
//             jobForm.jobNumber,
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
//       showError(
//         "Upload Failed",
//         "One or more captured photos could not be saved. Please try taking the photo again.",
//       );
//     } finally {
//       setIsUploadingPhotos(false);
//     }
//   };

//   const handleCameraClose = () => {
//     setShowCamera(false);
//   };

//   return (
//     <>
//       {createPortal(
//         <div className="foc-modal-overlay" onClick={handleExitClick}>
//           <div
//             className="foc-modal-wrapper"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <CdmsModalHeader
//               title="DRAFT REPORT FOR CHECKING OIC"
//               subtitleBottom={jobForm.companyName}
//               onClose={handleExitClick}
//             />

//             <div className="foc-modal-scroll">
//               <div className="foc-top-meta">
//                 <div className="foc-meta-row">
//                   <label>Job Number</label>
//                   <input type="text" value={jobForm.jobNumber || ""} disabled />
//                 </div>
//                 <div className="foc-meta-row">
//                   <label>Date Received</label>
//                   <input type="text" value={jobForm.dateRec || ""} disabled />
//                 </div>
//               </div>

//               <div className="foc-body">
//                 {/* LEFT COLUMN */}
//                 <div className="foc-col foc-col-left">
//                   <div className="foc-field">
//                     <label>Company</label>
//                     <textarea
//                       value={jobForm.companyName || ""}
//                       rows={2}
//                       disabled
//                     />
//                   </div>
//                   <div className="foc-field">
//                     <label>Description</label>
//                     <div className="foc-input-with-btn">
//                       <textarea
//                         value={jobForm.description || ""}
//                         rows={2}
//                         disabled
//                       />
//                       <button type="button" className="foc-lookup-btn" disabled>
//                         🔍
//                       </button>
//                     </div>
//                   </div>
//                   <div className="foc-field">
//                     <label>Brand</label>
//                     <input type="text" value={jobForm.brand || ""} disabled />
//                   </div>
//                   <div className="foc-field">
//                     <label>Model</label>
//                     <input type="text" value={jobForm.model || ""} disabled />
//                   </div>
//                   <div className="foc-field">
//                     <label>Serial No</label>
//                     <input
//                       type="text"
//                       value={jobForm.serialNo || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="foc-field">
//                     <label>Remarks</label>
//                     <textarea value={jobForm.remarks || ""} rows={2} disabled />
//                   </div>
//                 </div>

//                 {/* MIDDLE COLUMN */}
//                 <div className="foc-col foc-col-mid">
//                   <div className="foc-inline-field">
//                     <label>OIC</label>
//                     <input type="text" value={jobForm.oicBy || ""} disabled />
//                   </div>
//                   <div className="foc-inline-field">
//                     <label>SIG</label>
//                     <input type="text" value={jobForm.sig || ""} disabled />
//                   </div>
//                   <div className="foc-inline-field">
//                     <label>Frequency</label>
//                     <input
//                       type="text"
//                       value={jobForm.frequency || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="foc-field">
//                     <label>Con Cert</label>
//                     <div className="foc-input-with-btn">
//                       <input
//                         type="text"
//                         value={jobForm.contactCert || ""}
//                         disabled
//                       />
//                       <button type="button" className="foc-lookup-btn" disabled>
//                         🔍
//                       </button>
//                     </div>
//                   </div>
//                   <div className="foc-field">
//                     <label>Uncertainty</label>
//                     <textarea
//                       value={jobForm.uncertainty || ""}
//                       rows={2}
//                       disabled
//                     />
//                   </div>
//                   <div className="foc-field">
//                     <label>Range</label>
//                     <textarea value={jobForm.range || ""} rows={2} disabled />
//                   </div>
//                   <div className="foc-field">
//                     <label>Concern</label>
//                     <textarea value={jobForm.concern || ""} rows={2} disabled />
//                   </div>
//                 </div>

//                 {/* DATE / PRIORITY COLUMN */}
//                 <div className="foc-col foc-col-dates">
//                   <div className="foc-inline-field">
//                     <label>Date Cal</label>
//                     <input type="text" value={jobForm.dateCal || ""} disabled />
//                   </div>
//                   <div className="foc-inline-field">
//                     <label>Date Due</label>
//                     <input type="text" value={jobForm.dateDue || ""} disabled />
//                   </div>
//                   <div className="foc-inline-field">
//                     <label>Priority</label>
//                     <input
//                       type="text"
//                       value={jobForm.priority || ""}
//                       disabled
//                     />
//                   </div>
//                 </div>

//                 {/* CALIBRATION STANDARD */}
//                 <div className="foc-col foc-col-standard">
//                   <div className="foc-box-title">Calibration Standard</div>
//                   <div className="foc-standard-grid">
//                     {calibrationStandards.map((row, idx) => (
//                       <div className="foc-standard-row" key={idx}>
//                         {STANDARD_COLUMNS.map((col) => (
//                           <div className="foc-standard-cell" key={col}>
//                             <input
//                               type="text"
//                               value={row[col] || "-"}
//                               disabled
//                             />
//                             <button
//                               type="button"
//                               className="foc-lookup-btn"
//                               onClick={() =>
//                                 onOpenCalStandardLookup?.(idx, col)
//                               }
//                             >
//                               🔍
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     ))}
//                   </div>

//                   <div className="foc-camera-actions">
//                     <button
//                       type="button"
//                       onClick={handleOpenCameraClick}
//                       disabled={isUploadingPhotos}
//                     >
//                       {isUploadingPhotos ? "Saving Photo..." : "Open Camera"}
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleOpenFolderClick}
//                       disabled={!jobForm.jobNumber}
//                       title={
//                         !jobForm.jobNumber
//                           ? "No job number on this record yet"
//                           : undefined
//                       }
//                       style={
//                         !jobForm.jobNumber
//                           ? { opacity: 0.5, cursor: "not-allowed" }
//                           : {}
//                       }
//                     >
//                       Open Folder
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* ACCREDITATION LOGO + CALIBRATION PROCEDURE */}
//               <div className="foc-mid-section">
//                 <div className="foc-accreditation-box">
//                   <div className="foc-box-title">Accreditation Logo</div>
//                   <label className="foc-radio-label">
//                     <input
//                       type="radio"
//                       checked={jobForm.accreditationLogo === "with"}
//                       disabled
//                       readOnly
//                     />{" "}
//                     With PAB Logo
//                   </label>
//                   <label className="foc-radio-label">
//                     <input
//                       type="radio"
//                       checked={jobForm.accreditationLogo === "none"}
//                       disabled
//                       readOnly
//                     />{" "}
//                     No PAB Logo
//                   </label>
//                 </div>

//                 <div className="foc-procedure-box">
//                   <div className="foc-box-title">Calibration Procedure :</div>
//                   <div className="foc-input-with-btn">
//                     <input
//                       type="text"
//                       value={jobForm.calibrationProcedure || ""}
//                       disabled
//                     />
//                     <button
//                       type="button"
//                       className="foc-lookup-btn"
//                       onClick={onOpenCalProcedureLookup}
//                     >
//                       🔍
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* FOOTER ACTIONS */}
//               <div className="foc-footer">
//                 <div className="foc-footer-row">
//                   <button
//                     type="button"
//                     className="foc-primary-btn"
//                     onClick={handleCheckAndSignReportClick}
//                     disabled={isDownloading}
//                     title="Downloads the uploaded report with the OIC's signature stamped on, then unlocks Update"
//                   >
//                     {isDownloading ? "Signing..." : "Check and Sign Report"}
//                   </button>

//                   {/* Hidden file input — opened by the visible Update
//                       button below via fileInputRef, so the actual OS
//                       file picker UI stays native instead of building a
//                       custom one. */}
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileSelected}
//                     accept=".xlsx"
//                     style={{ display: "none" }}
//                   />
//                   <button
//                     type="button"
//                     onClick={handleUpdateButtonClick}
//                     disabled={!isUpdateEnabled || isUploading}
//                     title="Upload the reviewed/edited report, then confirm to send it to Checking SIG"
//                   >
//                     {isUploading ? "Uploading..." : "Update"}
//                   </button>
//                   <button type="button" onClick={handleExitClick}>
//                     Exit
//                   </button>
//                 </div>
//                 <div className="foc-footer-row foc-footer-row-secondary">
//                   {/* <button type="button" onClick={handleLogForRetypingClick}>
//                     Log for Re-Typing
//                   </button> */}
//                 </div>
//               </div>
//             </div>
//           </div>

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

//       {/* JOB FOLDER MODAL — lists every file Cloudinary has for this job
//           number (equipment photos + documents), fetched fresh on open. */}
//       {showFolder && jobForm.jobNumber && (
//         <ReceiptFolderModal
//           jobNumber={jobForm.jobNumber}
//           onClose={() => setShowFolder(false)}
//         />
//       )}

//       {/* CAMERA MODAL — captures 1+ photos, each uploaded straight to
//           this job's Cloudinary equipment-photos folder on capture (see
//           handleCameraCapture above). Nothing here needs to hold onto
//           the returned URLs locally since this screen has no photo
//           carousel of its own — captured photos are visible afterward
//           via "Open Folder" above. */}
//       {showCamera && (
//         <CameraCaptureModal
//           onClose={handleCameraClose}
//           onCapture={handleCameraCapture}
//           contextLabel={jobForm.jobNumber}
//         />
//       )}
//     </>
//   );
// };

// export default ForCheckingOICDetailsModal;
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./ForCheckingOICDetailsModal.css";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import CalibrationDataModal from "../IncomingCalibration/CalibrationDataModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
// Adjust this path to wherever CameraCaptureModal actually lives in your
// tree (same component IncomingCalibDetailsModal / ForTypingDetailsModal
// use).
import CameraCaptureModal from "../jobreceipt/CameraCaptureModal";

const API = import.meta.env.VITE_API_URL;

const STANDARD_COLUMNS = ["item1", "item2"];
const STANDARD_ROW_COUNT = 5;

const emptyStandardRow = () => ({ item1: "", item2: "" });

// Converts a base64 dataURL (what CameraCaptureModal produces, from
// either canvas.toDataURL or FileReader.readAsDataURL) into a Blob, so it
// can be sent as multipart/form-data to the equipment-photo upload route.
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return res.blob();
};

// Looks up a user's saved signature image on Cloudinary
// (cdms/Signatures/<role>-signature/<username>/) through
// GET /api/uploads/signature/:role/:username. Throws with the server's
// message if there isn't one.
const fetchSignatureUrl = async (role, username) => {
  const res = await fetch(
    `${API}/api/uploads/signature/${role}/${encodeURIComponent(username)}`,
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(
      data.message || `Signature lookup failed with ${res.status}`,
    );
  }
  return data.url;
};

/**
 * ForCheckingOICDetailsModal
 *
 * Read-only "draft report" review screen shown when a row is clicked in
 * ForCheckingOIC.jsx. Dedicated component (not shared with
 * ForTypingDetailsModal) so this stage's specific actions — e.g.
 * approving the report, flagging a concern back to the typist, etc. —
 * can evolve independently without affecting the ForTyping screen.
 *
 * "Check and Sign Report" has two paths, depending on what ForTyping
 * produced for the job:
 *
 *  1. The job has calibrationData (every in-house job, and Site
 *     Calibration jobs whose data was entered in ForTyping). The
 *     certificate preview (CalibrationDataModal in read-only mode)
 *     opens with the OIC's saved Cloudinary signature drawn above the OIC
 *     name on both pages. Clicking "Sign & Approve" there unlocks Update.
 *
 *  2. No calibrationData — a Site Calibration job whose report was
 *     uploaded as an .xlsx in ForTyping. The OIC's signature is stamped
 *     onto that workbook and the signed copy downloads (POST
 *     /api/uploads/check-and-sign/:jobNumber); the stored original is
 *     never modified.
 *
 * "Update" asks for confirmation and then moves the job on to Checking
 * SIG (through the parent's onUpdate).
 */
const ForCheckingOICDetailsModal = ({
  jobForm,
  onClose,
  onOpenCamera,
  onOpenFolder,
  onCheckAndSignReport,
  onUpdate,
  onLogForRetyping,
  onOpenCalStandardLookup, // (rowIndex, columnKey) => void
  onOpenCalProcedureLookup,
  isUpdateEnabled = false,
}) => {
  const calibrationStandards =
    jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
      ? jobForm.calibrationStandards
      : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

  const hasCalibrationData = Boolean(jobForm.calibrationData?.savedAt);

  // ---- Confirm / error dialog (same pattern as IncomingCalibDetailsModal) ----
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

  const showConfirm = (title, message, onConfirm, type = "default") => {
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

  // Reused for plain info/error messages (single OK button, no Cancel),
  // same shape as ForTypingDetailsModal's showError.
  const showError = (title, message) => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm: hideDialog,
      onCancel: null,
      confirmLabel: "OK",
      cancelLabel: "Cancel",
      type: "danger",
    });
  };

  // --- Accounts ------------------------------------------------------
  // Needed by the certificate preview to turn the OIC / SIG initials
  // stored on the job into full names (same fetch ForTypingDetailsModal
  // does).
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/accounts`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
        if (!cancelled) setAccounts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Path 1: certificate preview with the OIC's signature ----------
  const [showCertificate, setShowCertificate] = useState(false);
  const [oicSignatureUrl, setOicSignatureUrl] = useState("");
  const [isLoadingSignature, setIsLoadingSignature] = useState(false);

  const openCertificateForSigning = async () => {
    setIsLoadingSignature(true);
    try {
      const url = await fetchSignatureUrl("oic", jobForm.oicBy);
      setOicSignatureUrl(url);
      setShowCertificate(true);
    } catch (err) {
      console.error("Failed to load OIC signature:", err);
      showError(
        "Signature Not Found",
        err.message ||
          "The OIC's saved signature could not be loaded. Please try again.",
      );
    } finally {
      setIsLoadingSignature(false);
    }
  };

  // "Sign & Approve" inside the certificate preview: the OIC has seen the
  // certificate with their signature on it, so unlock Update.
  const handleApproveCertificate = () => {
    setShowCertificate(false);
    onCheckAndSignReport?.();
  };

  // --- Path 2: sign an uploaded .xlsx report (no calibration data) ---
  // Calls POST /api/uploads/check-and-sign/:jobNumber, which finds this
  // job's latest uploaded .xlsx report, finds the OIC's saved signature
  // image (keyed by jobForm.oicBy under cdms/Signatures/oic-signature/),
  // stamps it onto the "Front Page" and "Calib Data 1" sheets, and
  // streams back the signed copy. The stored original in Cloudinary is
  // never modified — the signed file only exists in this response.
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCheckAndSignDownload = async () => {
    setIsDownloading(true);
    try {
      const filename = `${jobForm.jobNumber} - Signed by OIC.xlsx`;
      const res = await fetch(
        `${API}/api/uploads/check-and-sign/${encodeURIComponent(
          jobForm.jobNumber,
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: jobForm.oicBy, filename }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Signing failed with ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error("Failed to sign and download report:", err);
      showError(
        "Signing Failed",
        err.message ||
          "The report could not be signed and downloaded. Please try again.",
      );
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCheckAndSignReportClick = () => {
    if (!jobForm.jobNumber) {
      showError(
        "No Job Number",
        "This record has no job number yet, so it can't be checked and signed.",
      );
      return;
    }
    if (!jobForm.oicBy) {
      showError(
        "No OIC Assigned",
        "This record has no OIC assigned yet, so a signature can't be applied.",
      );
      return;
    }

    // Normal case: show the certificate with the OIC's signature on it.
    if (hasCalibrationData) {
      openCertificateForSigning();
      return;
    }

    // No calibration data: fall back to signing the uploaded .xlsx.
    showConfirm(
      "Check and Sign Report",
      `Are you sure you want to check and sign the report for Job Number ${jobForm.jobNumber}? This will download the uploaded report with the OIC's signature applied.`,
      async () => {
        hideDialog();
        const downloaded = await handleCheckAndSignDownload();
        // Only unlock Update if the signed download actually went through.
        if (downloaded) {
          onCheckAndSignReport?.();
        }
      },
      "default",
    );
  };

  // --- Update: confirm, then move the job on to Checking SIG ----------
  const handleUpdateButtonClick = () => {
    showConfirm(
      "Confirm Update",
      `Are you sure you want to update Job Number ${jobForm.jobNumber}? It will be sent to Checking SIG.`,
      () => {
        hideDialog();
        onUpdate?.();
      },
      "default",
    );
  };

  const handleLogForRetypingClick = () => {
    showConfirm(
      "Log for Re-Typing",
      `Are you sure you want to send Job Number ${jobForm.jobNumber} back for re-typing? This will return it to the typist.`,
      () => {
        hideDialog();
        onLogForRetyping?.();
      },
      "danger",
    );
  };

  const handleExitClick = () => {
    showConfirm(
      "Confirm Exit",
      "Are you sure you want to exit this report?",
      () => {
        hideDialog();
        onClose();
      },
    );
  };

  // OPEN FOLDER — shows every file (equipment photos + documents)
  // already stored under this job number's Cloudinary folder, same
  // JobFolderModal used from ForTypingDetailsModal's "Open Folder"
  // button and JobNumberModal's. onOpenFolder (if passed in) still
  // fires first, in case the parent screen needs to do something of
  // its own (e.g. logging/analytics) — but showing the modal no longer
  // depends on the parent actually doing anything with it.
  const [showFolder, setShowFolder] = useState(false);

  const handleOpenFolderClick = () => {
    onOpenFolder?.();
    setShowFolder(true);
  };

  // --- Equipment photo capture ---------------------------------------
  // This modal owns the open -> capture -> upload chain: it opens
  // CameraCaptureModal itself, and on capture, uploads each photo
  // straight to POST /api/uploads/equipment-photo/:jobNumber (same
  // route IncomingCalibDetailsModal and ForTypingDetailsModal use), so
  // photos are saved server-side immediately regardless of what the
  // user does afterward. onOpenCamera is still called first, if passed,
  // purely so a parent that wants to know "camera was opened" (e.g. for
  // logging) still can. No local photoUrls array is kept here — this
  // screen has no photo carousel of its own, captured photos are only
  // ever viewed via "Open Folder" above.
  const [showCamera, setShowCamera] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const handleOpenCameraClick = () => {
    onOpenCamera?.();

    if (!jobForm.jobNumber) {
      showError(
        "No Job Number",
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
            jobForm.jobNumber,
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
      showError(
        "Upload Failed",
        "One or more captured photos could not be saved. Please try taking the photo again.",
      );
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  return (
    <>
      {createPortal(
        <div className="foc-modal-overlay" onClick={handleExitClick}>
          <div
            className="foc-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <CdmsModalHeader
              title="DRAFT REPORT FOR CHECKING OIC"
              subtitleBottom={jobForm.companyName}
              onClose={handleExitClick}
            />

            <div className="foc-modal-scroll">
              <div className="foc-top-meta">
                <div className="foc-meta-row">
                  <label>Job Number</label>
                  <input type="text" value={jobForm.jobNumber || ""} disabled />
                </div>
                <div className="foc-meta-row">
                  <label>Date Received</label>
                  <input type="text" value={jobForm.dateRec || ""} disabled />
                </div>
              </div>

              <div className="foc-body">
                {/* LEFT COLUMN */}
                <div className="foc-col foc-col-left">
                  <div className="foc-field">
                    <label>Company</label>
                    <textarea
                      value={jobForm.companyName || ""}
                      rows={2}
                      disabled
                    />
                  </div>
                  <div className="foc-field">
                    <label>Description</label>
                    <div className="foc-input-with-btn">
                      <textarea
                        value={jobForm.description || ""}
                        rows={2}
                        disabled
                      />
                      <button type="button" className="foc-lookup-btn" disabled>
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="foc-field">
                    <label>Brand</label>
                    <input type="text" value={jobForm.brand || ""} disabled />
                  </div>
                  <div className="foc-field">
                    <label>Model</label>
                    <input type="text" value={jobForm.model || ""} disabled />
                  </div>
                  <div className="foc-field">
                    <label>Serial No</label>
                    <input
                      type="text"
                      value={jobForm.serialNo || ""}
                      disabled
                    />
                  </div>
                  <div className="foc-field">
                    <label>Remarks</label>
                    <textarea value={jobForm.remarks || ""} rows={2} disabled />
                  </div>
                </div>

                {/* MIDDLE COLUMN */}
                <div className="foc-col foc-col-mid">
                  <div className="foc-inline-field">
                    <label>OIC</label>
                    <input type="text" value={jobForm.oicBy || ""} disabled />
                  </div>
                  <div className="foc-inline-field">
                    <label>SIG</label>
                    <input type="text" value={jobForm.sig || ""} disabled />
                  </div>
                  <div className="foc-inline-field">
                    <label>Frequency</label>
                    <input
                      type="text"
                      value={jobForm.frequency || ""}
                      disabled
                    />
                  </div>
                  <div className="foc-field">
                    <label>Con Cert</label>
                    <div className="foc-input-with-btn">
                      <input
                        type="text"
                        value={jobForm.contactCert || ""}
                        disabled
                      />
                      <button type="button" className="foc-lookup-btn" disabled>
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="foc-field">
                    <label>Uncertainty</label>
                    <textarea
                      value={jobForm.uncertainty || ""}
                      rows={2}
                      disabled
                    />
                  </div>
                  <div className="foc-field">
                    <label>Range</label>
                    <textarea value={jobForm.range || ""} rows={2} disabled />
                  </div>
                  <div className="foc-field">
                    <label>Concern</label>
                    <textarea value={jobForm.concern || ""} rows={2} disabled />
                  </div>
                </div>

                {/* DATE / PRIORITY COLUMN */}
                <div className="foc-col foc-col-dates">
                  <div className="foc-inline-field">
                    <label>Date Cal</label>
                    <input type="text" value={jobForm.dateCal || ""} disabled />
                  </div>
                  <div className="foc-inline-field">
                    <label>Date Due</label>
                    <input type="text" value={jobForm.dateDue || ""} disabled />
                  </div>
                  <div className="foc-inline-field">
                    <label>Priority</label>
                    <input
                      type="text"
                      value={jobForm.priority || ""}
                      disabled
                    />
                  </div>
                </div>

                {/* CALIBRATION STANDARD */}
                <div className="foc-col foc-col-standard">
                  <div className="foc-box-title">Calibration Standard</div>
                  <div className="foc-standard-grid">
                    {calibrationStandards.map((row, idx) => (
                      <div className="foc-standard-row" key={idx}>
                        {STANDARD_COLUMNS.map((col) => (
                          <div className="foc-standard-cell" key={col}>
                            <input
                              type="text"
                              value={row[col] || "-"}
                              disabled
                            />
                            <button
                              type="button"
                              className="foc-lookup-btn"
                              onClick={() =>
                                onOpenCalStandardLookup?.(idx, col)
                              }
                            >
                              🔍
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="foc-camera-actions">
                    <button
                      type="button"
                      onClick={handleOpenCameraClick}
                      disabled={isUploadingPhotos}
                    >
                      {isUploadingPhotos ? "Saving Photo..." : "Open Camera"}
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenFolderClick}
                      disabled={!jobForm.jobNumber}
                      title={
                        !jobForm.jobNumber
                          ? "No job number on this record yet"
                          : undefined
                      }
                      style={
                        !jobForm.jobNumber
                          ? { opacity: 0.5, cursor: "not-allowed" }
                          : {}
                      }
                    >
                      View Files
                    </button>
                  </div>
                </div>
              </div>

              {/* ACCREDITATION LOGO + CALIBRATION PROCEDURE */}
              <div className="foc-mid-section">
                <div className="foc-accreditation-box">
                  <div className="foc-box-title">Accreditation Logo</div>
                  <label className="foc-radio-label">
                    <input
                      type="radio"
                      checked={jobForm.accreditationLogo === "with"}
                      disabled
                      readOnly
                    />{" "}
                    With PAB Logo
                  </label>
                  <label className="foc-radio-label">
                    <input
                      type="radio"
                      checked={jobForm.accreditationLogo === "none"}
                      disabled
                      readOnly
                    />{" "}
                    No PAB Logo
                  </label>
                </div>

                <div className="foc-procedure-box">
                  <div className="foc-box-title">Calibration Procedure :</div>
                  <div className="foc-input-with-btn">
                    <input
                      type="text"
                      value={jobForm.calibrationProcedure || ""}
                      disabled
                    />
                    <button
                      type="button"
                      className="foc-lookup-btn"
                      onClick={onOpenCalProcedureLookup}
                    >
                      🔍
                    </button>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="foc-footer">
                <div className="foc-footer-row">
                  <button
                    type="button"
                    className="foc-primary-btn"
                    onClick={handleCheckAndSignReportClick}
                    disabled={isDownloading || isLoadingSignature}
                    title={
                      hasCalibrationData
                        ? "Opens the certificate with the OIC's signature above the OIC name, then unlocks Update"
                        : "Downloads the uploaded report with the OIC's signature stamped on, then unlocks Update"
                    }
                  >
                    {isDownloading || isLoadingSignature
                      ? "Signing..."
                      : "Check and Sign Report"}
                  </button>

                  <button
                    type="button"
                    onClick={handleUpdateButtonClick}
                    disabled={!isUpdateEnabled}
                    title={
                      isUpdateEnabled
                        ? "Confirm and send this job to Checking SIG"
                        : "Check and sign the report first"
                    }
                  >
                    Update
                  </button>
                  <button type="button" onClick={handleExitClick}>
                    Exit
                  </button>
                </div>
                <div className="foc-footer-row foc-footer-row-secondary">
                  {/* <button type="button" onClick={handleLogForRetypingClick}>
                    Log for Re-Typing
                  </button> */}
                </div>
              </div>
            </div>
          </div>

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
        </div>,
        document.body,
      )}

      {/* CERTIFICATE PREVIEW (review mode) — the job's saved calibration
          data rendered as the certificate, with the OIC's signature from
          Cloudinary above the OIC name. "Sign & Approve" unlocks Update. */}
      {showCertificate && (
        <CalibrationDataModal
          job={jobForm}
          standards={jobForm.calibrationStandards || []}
          accounts={accounts}
          initialData={jobForm.calibrationData}
          readOnly
          signatures={{ oic: oicSignatureUrl }}
          confirmLabel="Sign & Approve"
          onConfirm={handleApproveCertificate}
          onCancel={() => setShowCertificate(false)}
        />
      )}

      {/* JOB FOLDER MODAL — lists every file Cloudinary has for this job
          number (equipment photos + documents), fetched fresh on open. */}
      {showFolder && jobForm.jobNumber && (
        <ReceiptFolderModal
          jobNumber={jobForm.jobNumber}
          onClose={() => setShowFolder(false)}
        />
      )}

      {/* CAMERA MODAL — captures 1+ photos, each uploaded straight to
          this job's Cloudinary equipment-photos folder on capture (see
          handleCameraCapture above). Nothing here needs to hold onto
          the returned URLs locally since this screen has no photo
          carousel of its own — captured photos are visible afterward
          via "Open Folder" above. */}
      {showCamera && (
        <CameraCaptureModal
          onClose={handleCameraClose}
          onCapture={handleCameraCapture}
          contextLabel={jobForm.jobNumber}
        />
      )}
    </>
  );
};

export default ForCheckingOICDetailsModal;
