// import React, { useState, useRef } from "react";
// import { createPortal } from "react-dom";
// import "./ForCheckingSigDetailsModal.css";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";

// const API = import.meta.env.VITE_API_URL;

// const STANDARD_COLUMNS = ["item1", "item2"];
// const STANDARD_ROW_COUNT = 5;

// const emptyStandardRow = () => ({ item1: "", item2: "" });

// /**
//  * ForCheckingSigDetailsModal
//  *
//  * Read-only "draft report" review screen shown when a row is clicked in
//  * ForCheckingSig.jsx. Dedicated component (not shared with
//  * ForCheckingOICDetailsModal) so this stage's specific actions can
//  * evolve independently, even though the layout/footer currently mirror
//  * the OIC-checking stage.
//  *
//  * "Check and Sign Report" downloads the job's latest uploaded report
//  * (by this stage, whatever OIC's "Update" step re-uploaded) with the
//  * SIG's saved signature stamped onto it — see POST
//  * /api/uploads/check-and-sign-sig, which finds the report, finds the
//  * SIG's signature image, and returns a signed copy without touching the
//  * stored original. Mirrors ForCheckingOICDetailsModal's Check and Sign
//  * flow, just keyed to jobForm.sig and the SIG signature folder/cell
//  * instead of OIC's.
//  *
//  * "Update" now requires re-uploading the (presumably reviewed/edited)
//  * file before it actually moves the job forward — same
//  * upload-then-confirm pattern ForCheckingOICDetailsModal's "Update" and
//  * ForTypingDetailsModal's "Upload and Auto Backup" use.
//  *
//  * NOTE ON IMPORT PATHS: this assumes ForCheckingSigDetailsModal.jsx sits
//  * flat in src/pages/, alongside ForCheckingSig.jsx (same folder as
//  * ForCheckingOIC.jsx originally was). If your project instead has
//  * ForCheckingSig.jsx living in its own subfolder, adjust the
//  * CdmsModalHeader and ConfirmDialog import paths below accordingly —
//  * same troubleshooting as the last several import errors.
//  */
// const ForCheckingSigDetailsModal = ({
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

//   // ---- Confirm / error dialog (same pattern as ForCheckingOICDetailsModal) ----
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
//   // same shape as ForCheckingOICDetailsModal's showError.
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
//   // Calls POST /api/uploads/check-and-sign-sig/:jobNumber, which finds
//   // this job's latest uploaded .xlsx report, finds the SIG's saved
//   // signature image (keyed by jobForm.sig under
//   // cdms/Signatures/sig-signature/), stamps it onto "Front Page" and
//   // "Calib Data 1" at the SIG name cell, and streams back the signed
//   // copy. The stored original in Cloudinary is never modified — the
//   // signed file only exists in this response.
//   const [isDownloading, setIsDownloading] = useState(false);

//   const handleCheckAndSignDownload = async () => {
//     if (!jobForm.jobNumber) {
//       showError(
//         "No Job Number",
//         "This record has no job number yet, so no file can be downloaded.",
//       );
//       return false;
//     }
//     if (!jobForm.sig) {
//       showError(
//         "No SIG Assigned",
//         "This record has no SIG assigned yet, so a signature can't be applied.",
//       );
//       return false;
//     }

//     setIsDownloading(true);
//     try {
//       const filename = `${jobForm.jobNumber} - Signed by SIG.xlsx`;
//       const res = await fetch(
//         `${API}/api/uploads/check-and-sign-sig/${encodeURIComponent(
//           jobForm.jobNumber,
//         )}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ username: jobForm.sig, filename }),
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
//       `Are you sure you want to check and sign the report for Job Number ${jobForm.jobNumber}? This will download the report with the SIG's signature applied.`,
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

//   // --- Update: re-upload the edited/reviewed file, then confirm ------
//   // Clicking "Update" no longer jumps straight to the confirm dialog —
//   // it first opens a hidden file input (same pattern as
//   // ForCheckingOICDetailsModal's Update button). The picked file is
//   // uploaded to this job's documents folder via the same
//   // POST /api/uploads/job-document/:jobNumber route For Typing and OIC
//   // use. Only once that upload succeeds does the "Confirm Update"
//   // dialog appear, and only confirming that actually calls onUpdate.
//   //
//   // Restricted to .xlsx only — everything downstream (this modal's own
//   // Check and Sign, and the OIC stage before it) reads this file back
//   // with ExcelJS, which can't reliably round-trip legacy .xls or other
//   // formats. The picker itself is filtered via `accept`, but that's
//   // advisory only, so the extension is checked again below before
//   // anything is uploaded.
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

//     if (!file.name.toLowerCase().endsWith(".xlsx")) {
//       const ext = file.name.match(/\.[^/.]+$/)?.[0] || "this format";
//       showError(
//         "Wrong File Type",
//         `"${file.name}" is ${ext}, not .xlsx. When saving in Excel, make sure the format is set to "Excel Workbook (.xlsx)" — not "Excel 97-2003 Workbook (.xls)" — then try uploading again.`,
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
//       // moving the job forward.
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
//       console.error("Failed to upload edited file:", err);
//       showError(
//         "Upload Failed",
//         "The edited file could not be uploaded. Please try again.",
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
//   // already stored under this job number's Cloudinary folder, via the
//   // same JobFolderModal used on ForTyping / ForCheckingOIC / JobNumber.
//   // onOpenFolder (if passed in) still fires first, in case the parent
//   // screen needs to do something of its own (e.g. logging/analytics) —
//   // but showing the modal no longer depends on the parent actually
//   // doing anything with it.
//   const [showFolder, setShowFolder] = useState(false);

//   const handleOpenFolderClick = () => {
//     onOpenFolder?.();
//     setShowFolder(true);
//   };

//   return (
//     <>
//       {createPortal(
//         <div className="fcs-modal-overlay" onClick={handleExitClick}>
//           <div
//             className="fcs-modal-wrapper"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <CdmsModalHeader
//               title="DRAFT REPORT FOR CHECKING SIG"
//               subtitleBottom={jobForm.companyName}
//               onClose={handleExitClick}
//             />

//             <div className="fcs-modal-scroll">
//               <div className="fcs-top-meta">
//                 <div className="fcs-meta-row">
//                   <label>Job Number</label>
//                   <input type="text" value={jobForm.jobNumber || ""} disabled />
//                 </div>
//                 <div className="fcs-meta-row">
//                   <label>Date Received</label>
//                   <input type="text" value={jobForm.dateRec || ""} disabled />
//                 </div>
//               </div>

//               <div className="fcs-body">
//                 {/* LEFT COLUMN */}
//                 <div className="fcs-col fcs-col-left">
//                   <div className="fcs-field">
//                     <label>Company</label>
//                     <textarea
//                       value={jobForm.companyName || ""}
//                       rows={2}
//                       disabled
//                     />
//                   </div>
//                   <div className="fcs-field">
//                     <label>Description</label>
//                     <div className="fcs-input-with-btn">
//                       <textarea
//                         value={jobForm.description || ""}
//                         rows={2}
//                         disabled
//                       />
//                       <button type="button" className="fcs-lookup-btn" disabled>
//                         🔍
//                       </button>
//                     </div>
//                   </div>
//                   <div className="fcs-field">
//                     <label>Brand</label>
//                     <input type="text" value={jobForm.brand || ""} disabled />
//                   </div>
//                   <div className="fcs-field">
//                     <label>Model</label>
//                     <input type="text" value={jobForm.model || ""} disabled />
//                   </div>
//                   <div className="fcs-field">
//                     <label>Serial No</label>
//                     <input
//                       type="text"
//                       value={jobForm.serialNo || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="fcs-field">
//                     <label>Remarks</label>
//                     <textarea value={jobForm.remarks || ""} rows={2} disabled />
//                   </div>
//                 </div>

//                 {/* MIDDLE COLUMN */}
//                 <div className="fcs-col fcs-col-mid">
//                   <div className="fcs-inline-field">
//                     <label>OIC</label>
//                     <input type="text" value={jobForm.evalBy || ""} disabled />
//                   </div>
//                   <div className="fcs-inline-field">
//                     <label>SIG</label>
//                     <input type="text" value={jobForm.sig || ""} disabled />
//                   </div>
//                   <div className="fcs-inline-field">
//                     <label>Frequency</label>
//                     <input
//                       type="text"
//                       value={jobForm.frequency || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="fcs-field">
//                     <label>Con Cert</label>
//                     <div className="fcs-input-with-btn">
//                       <input
//                         type="text"
//                         value={jobForm.contactCert || ""}
//                         disabled
//                       />
//                       <button type="button" className="fcs-lookup-btn" disabled>
//                         🔍
//                       </button>
//                     </div>
//                   </div>
//                   <div className="fcs-field">
//                     <label>Uncertainty</label>
//                     <textarea
//                       value={jobForm.uncertainty || ""}
//                       rows={2}
//                       disabled
//                     />
//                   </div>
//                   <div className="fcs-field">
//                     <label>Range</label>
//                     <textarea value={jobForm.range || ""} rows={2} disabled />
//                   </div>
//                   <div className="fcs-field">
//                     <label>Concern</label>
//                     <textarea value={jobForm.concern || ""} rows={2} disabled />
//                   </div>
//                 </div>

//                 {/* DATE / PRIORITY COLUMN */}
//                 <div className="fcs-col fcs-col-dates">
//                   <div className="fcs-inline-field">
//                     <label>Date Cal</label>
//                     <input type="text" value={jobForm.dateCal || ""} disabled />
//                   </div>
//                   <div className="fcs-inline-field">
//                     <label>Date Due</label>
//                     <input type="text" value={jobForm.dateDue || ""} disabled />
//                   </div>
//                   <div className="fcs-inline-field">
//                     <label>Priority</label>
//                     <input
//                       type="text"
//                       value={jobForm.priority || ""}
//                       disabled
//                     />
//                   </div>
//                 </div>

//                 {/* CALIBRATION STANDARD */}
//                 <div className="fcs-col fcs-col-standard">
//                   <div className="fcs-box-title">Calibration Standard</div>
//                   <div className="fcs-standard-grid">
//                     {calibrationStandards.map((row, idx) => (
//                       <div className="fcs-standard-row" key={idx}>
//                         {STANDARD_COLUMNS.map((col) => (
//                           <div className="fcs-standard-cell" key={col}>
//                             <input
//                               type="text"
//                               value={row[col] || "-"}
//                               disabled
//                             />
//                             <button
//                               type="button"
//                               className="fcs-lookup-btn"
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

//                   <div className="fcs-camera-actions">
//                     <button type="button" onClick={onOpenCamera}>
//                       Open Camera
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
//               <div className="fcs-mid-section">
//                 <div className="fcs-accreditation-box">
//                   <div className="fcs-box-title">Accreditation Logo</div>
//                   <label className="fcs-radio-label">
//                     <input
//                       type="radio"
//                       checked={jobForm.accreditationLogo === "with"}
//                       disabled
//                       readOnly
//                     />{" "}
//                     With PAB Logo
//                   </label>
//                   <label className="fcs-radio-label">
//                     <input
//                       type="radio"
//                       checked={jobForm.accreditationLogo === "none"}
//                       disabled
//                       readOnly
//                     />{" "}
//                     No PAB Logo
//                   </label>
//                 </div>

//                 <div className="fcs-procedure-box">
//                   <div className="fcs-box-title">Calibration Procedure :</div>
//                   <div className="fcs-input-with-btn">
//                     <input
//                       type="text"
//                       value={jobForm.calibrationProcedure || ""}
//                       disabled
//                     />
//                     <button
//                       type="button"
//                       className="fcs-lookup-btn"
//                       onClick={onOpenCalProcedureLookup}
//                     >
//                       🔍
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* FOOTER ACTIONS */}
//               <div className="fcs-footer">
//                 <div className="fcs-footer-row">
//                   <button
//                     type="button"
//                     className="fcs-primary-btn"
//                     onClick={handleCheckAndSignReportClick}
//                     disabled={isDownloading}
//                     title="Downloads the uploaded report with the SIG's signature stamped on, then unlocks Update"
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
//                     title="Upload the reviewed/edited report, then confirm to update"
//                   >
//                     {isUploading ? "Uploading..." : "Update"}
//                   </button>
//                   <button type="button" onClick={handleExitClick}>
//                     Exit
//                   </button>
//                 </div>
//                 <div className="fcs-footer-row fcs-footer-row-secondary">
//                   <button type="button" onClick={handleLogForRetypingClick}>
//                     Log for Re-Typing
//                   </button>
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
//     </>
//   );
// };

// export default ForCheckingSigDetailsModal;
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import "./ForCheckingSigDetailsModal.css";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
// Adjust this path to wherever CameraCaptureModal actually lives in your
// tree (same component IncomingCalibDetailsModal / ForTypingDetailsModal /
// ForCheckingOICDetailsModal use).
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

/**
 * ForCheckingSigDetailsModal
 *
 * Read-only "draft report" review screen shown when a row is clicked in
 * ForCheckingSig.jsx. Dedicated component (not shared with
 * ForCheckingOICDetailsModal) so this stage's specific actions can
 * evolve independently, even though the layout/footer currently mirror
 * the OIC-checking stage.
 *
 * "Check and Sign Report" downloads the job's latest uploaded report
 * (by this stage, whatever OIC's "Update" step re-uploaded) with the
 * SIG's saved signature stamped onto it — see POST
 * /api/uploads/check-and-sign-sig, which finds the report, finds the
 * SIG's signature image, and returns a signed copy without touching the
 * stored original. Mirrors ForCheckingOICDetailsModal's Check and Sign
 * flow, just keyed to jobForm.sig and the SIG signature folder/cell
 * instead of OIC's.
 *
 * "Update" now requires re-uploading the (presumably reviewed/edited)
 * file before it actually moves the job forward — same
 * upload-then-confirm pattern ForCheckingOICDetailsModal's "Update" and
 * ForTypingDetailsModal's "Upload and Auto Backup" use.
 *
 * NOTE ON IMPORT PATHS: this assumes ForCheckingSigDetailsModal.jsx sits
 * flat in src/pages/, alongside ForCheckingSig.jsx (same folder as
 * ForCheckingOIC.jsx originally was). If your project instead has
 * ForCheckingSig.jsx living in its own subfolder, adjust the
 * CdmsModalHeader and ConfirmDialog import paths below accordingly —
 * same troubleshooting as the last several import errors.
 */
const ForCheckingSigDetailsModal = ({
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

  // ---- Confirm / error dialog (same pattern as ForCheckingOICDetailsModal) ----
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
  // same shape as ForCheckingOICDetailsModal's showError.
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

  // --- Check and Sign: fetch the job's report already signed --------
  // Calls POST /api/uploads/check-and-sign-sig/:jobNumber, which finds
  // this job's latest uploaded .xlsx report, finds the SIG's saved
  // signature image (keyed by jobForm.sig under
  // cdms/Signatures/sig-signature/), stamps it onto "Front Page" and
  // "Calib Data 1" at the SIG name cell, and streams back the signed
  // copy. The stored original in Cloudinary is never modified — the
  // signed file only exists in this response.
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCheckAndSignDownload = async () => {
    if (!jobForm.jobNumber) {
      showError(
        "No Job Number",
        "This record has no job number yet, so no file can be downloaded.",
      );
      return false;
    }
    if (!jobForm.sig) {
      showError(
        "No SIG Assigned",
        "This record has no SIG assigned yet, so a signature can't be applied.",
      );
      return false;
    }

    setIsDownloading(true);
    try {
      const filename = `${jobForm.jobNumber} - Signed by SIG.xlsx`;
      const res = await fetch(
        `${API}/api/uploads/check-and-sign-sig/${encodeURIComponent(
          jobForm.jobNumber,
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: jobForm.sig, filename }),
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
    showConfirm(
      "Check and Sign Report",
      `Are you sure you want to check and sign the report for Job Number ${jobForm.jobNumber}? This will download the report with the SIG's signature applied.`,
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

  // --- Update: re-upload the edited/reviewed file, then confirm ------
  // Clicking "Update" no longer jumps straight to the confirm dialog —
  // it first opens a hidden file input (same pattern as
  // ForCheckingOICDetailsModal's Update button). The picked file is
  // uploaded to this job's documents folder via the same
  // POST /api/uploads/job-document/:jobNumber route For Typing and OIC
  // use. Only once that upload succeeds does the "Confirm Update"
  // dialog appear, and only confirming that actually calls onUpdate.
  //
  // Restricted to .xlsx only — everything downstream (this modal's own
  // Check and Sign, and the OIC stage before it) reads this file back
  // with ExcelJS, which can't reliably round-trip legacy .xls or other
  // formats. The picker itself is filtered via `accept`, but that's
  // advisory only, so the extension is checked again below before
  // anything is uploaded.
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpdateButtonClick = () => {
    if (!jobForm.jobNumber) {
      showError(
        "No Job Number",
        "This record has no job number yet, so a file can't be uploaded.",
      );
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    // Reset immediately so selecting the same file again later (e.g.
    // after a failed upload) still fires onChange.
    e.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      const ext = file.name.match(/\.[^/.]+$/)?.[0] || "this format";
      showError(
        "Wrong File Type",
        `"${file.name}" is ${ext}, not .xlsx. When saving in Excel, make sure the format is set to "Excel Workbook (.xlsx)" — not "Excel 97-2003 Workbook (.xls)" — then try uploading again.`,
      );
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${API}/api/uploads/job-document/${encodeURIComponent(
          jobForm.jobNumber,
        )}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Upload failed with ${res.status}`);
      }

      // Upload succeeded — now ask for confirmation before actually
      // moving the job forward.
      showConfirm(
        "Confirm Update",
        `Are you sure you want to update Job Number ${jobForm.jobNumber}?`,
        () => {
          hideDialog();
          onUpdate?.();
        },
        "default",
      );
    } catch (err) {
      console.error("Failed to upload edited file:", err);
      showError(
        "Upload Failed",
        "The edited file could not be uploaded. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
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
  // already stored under this job number's Cloudinary folder, via the
  // same JobFolderModal used on ForTyping / ForCheckingOIC / JobNumber.
  // onOpenFolder (if passed in) still fires first, in case the parent
  // screen needs to do something of its own (e.g. logging/analytics) —
  // but showing the modal no longer depends on the parent actually
  // doing anything with it.
  const [showFolder, setShowFolder] = useState(false);

  const handleOpenFolderClick = () => {
    onOpenFolder?.();
    setShowFolder(true);
  };

  // --- Equipment photo capture ---------------------------------------
  // Same fix applied to ForTypingDetailsModal / ForCheckingOICDetails-
  // Modal: the "Open Camera" button used to call onOpenCamera directly
  // as its onClick — no await, no result handling, no camera UI
  // rendered anywhere in this file — so whether anything happened at
  // all depended entirely on the parent (ForCheckingSig.jsx)
  // implementing the full open -> capture -> upload chain itself. This
  // modal now owns that chain directly: it opens CameraCaptureModal
  // itself, and on capture, uploads each photo straight to
  // POST /api/uploads/equipment-photo/:jobNumber (same route every
  // other stage modal now uses), so photos are saved server-side
  // immediately regardless of what the user does afterward.
  // onOpenCamera is still called first, if passed, purely so a parent
  // that wants to know "camera was opened" (e.g. for logging) still
  // can. No local photoUrls array is kept here — this screen has no
  // photo carousel of its own, captured photos are only ever viewed
  // via "Open Folder" above.
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
        <div className="fcs-modal-overlay" onClick={handleExitClick}>
          <div
            className="fcs-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <CdmsModalHeader
              title="DRAFT REPORT FOR CHECKING SIG"
              subtitleBottom={jobForm.companyName}
              onClose={handleExitClick}
            />

            <div className="fcs-modal-scroll">
              <div className="fcs-top-meta">
                <div className="fcs-meta-row">
                  <label>Job Number</label>
                  <input type="text" value={jobForm.jobNumber || ""} disabled />
                </div>
                <div className="fcs-meta-row">
                  <label>Date Received</label>
                  <input type="text" value={jobForm.dateRec || ""} disabled />
                </div>
              </div>

              <div className="fcs-body">
                {/* LEFT COLUMN */}
                <div className="fcs-col fcs-col-left">
                  <div className="fcs-field">
                    <label>Company</label>
                    <textarea
                      value={jobForm.companyName || ""}
                      rows={2}
                      disabled
                    />
                  </div>
                  <div className="fcs-field">
                    <label>Description</label>
                    <div className="fcs-input-with-btn">
                      <textarea
                        value={jobForm.description || ""}
                        rows={2}
                        disabled
                      />
                      <button type="button" className="fcs-lookup-btn" disabled>
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="fcs-field">
                    <label>Brand</label>
                    <input type="text" value={jobForm.brand || ""} disabled />
                  </div>
                  <div className="fcs-field">
                    <label>Model</label>
                    <input type="text" value={jobForm.model || ""} disabled />
                  </div>
                  <div className="fcs-field">
                    <label>Serial No</label>
                    <input
                      type="text"
                      value={jobForm.serialNo || ""}
                      disabled
                    />
                  </div>
                  <div className="fcs-field">
                    <label>Remarks</label>
                    <textarea value={jobForm.remarks || ""} rows={2} disabled />
                  </div>
                </div>

                {/* MIDDLE COLUMN */}
                <div className="fcs-col fcs-col-mid">
                  <div className="fcs-inline-field">
                    <label>OIC</label>
                    <input type="text" value={jobForm.evalBy || ""} disabled />
                  </div>
                  <div className="fcs-inline-field">
                    <label>SIG</label>
                    <input type="text" value={jobForm.sig || ""} disabled />
                  </div>
                  <div className="fcs-inline-field">
                    <label>Frequency</label>
                    <input
                      type="text"
                      value={jobForm.frequency || ""}
                      disabled
                    />
                  </div>
                  <div className="fcs-field">
                    <label>Con Cert</label>
                    <div className="fcs-input-with-btn">
                      <input
                        type="text"
                        value={jobForm.contactCert || ""}
                        disabled
                      />
                      <button type="button" className="fcs-lookup-btn" disabled>
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="fcs-field">
                    <label>Uncertainty</label>
                    <textarea
                      value={jobForm.uncertainty || ""}
                      rows={2}
                      disabled
                    />
                  </div>
                  <div className="fcs-field">
                    <label>Range</label>
                    <textarea value={jobForm.range || ""} rows={2} disabled />
                  </div>
                  <div className="fcs-field">
                    <label>Concern</label>
                    <textarea value={jobForm.concern || ""} rows={2} disabled />
                  </div>
                </div>

                {/* DATE / PRIORITY COLUMN */}
                <div className="fcs-col fcs-col-dates">
                  <div className="fcs-inline-field">
                    <label>Date Cal</label>
                    <input type="text" value={jobForm.dateCal || ""} disabled />
                  </div>
                  <div className="fcs-inline-field">
                    <label>Date Due</label>
                    <input type="text" value={jobForm.dateDue || ""} disabled />
                  </div>
                  <div className="fcs-inline-field">
                    <label>Priority</label>
                    <input
                      type="text"
                      value={jobForm.priority || ""}
                      disabled
                    />
                  </div>
                </div>

                {/* CALIBRATION STANDARD */}
                <div className="fcs-col fcs-col-standard">
                  <div className="fcs-box-title">Calibration Standard</div>
                  <div className="fcs-standard-grid">
                    {calibrationStandards.map((row, idx) => (
                      <div className="fcs-standard-row" key={idx}>
                        {STANDARD_COLUMNS.map((col) => (
                          <div className="fcs-standard-cell" key={col}>
                            <input
                              type="text"
                              value={row[col] || "-"}
                              disabled
                            />
                            <button
                              type="button"
                              className="fcs-lookup-btn"
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

                  <div className="fcs-camera-actions">
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
                      Open Folder
                    </button>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="fcs-footer">
                <div className="fcs-footer-row">
                  <button
                    type="button"
                    className="fcs-primary-btn"
                    onClick={handleCheckAndSignReportClick}
                    disabled={isDownloading}
                    title="Downloads the uploaded report with the SIG's signature stamped on, then unlocks Update"
                  >
                    {isDownloading ? "Signing..." : "Check and Sign Report"}
                  </button>

                  {/* Hidden file input — opened by the visible Update
                      button below via fileInputRef, so the actual OS
                      file picker UI stays native instead of building a
                      custom one. */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    accept=".xlsx"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={handleUpdateButtonClick}
                    disabled={!isUpdateEnabled || isUploading}
                    title="Upload the reviewed/edited report, then confirm to update"
                  >
                    {isUploading ? "Uploading..." : "Update"}
                  </button>
                  <button type="button" onClick={handleExitClick}>
                    Exit
                  </button>
                </div>
                <div className="fcs-footer-row fcs-footer-row-secondary">
                  <button type="button" onClick={handleLogForRetypingClick}>
                    Log for Re-Typing
                  </button>
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

export default ForCheckingSigDetailsModal;
