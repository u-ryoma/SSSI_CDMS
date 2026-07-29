// import React, { useState } from "react";
// import { createPortal } from "react-dom";
// import "./ForTypingDetailsModal.css";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import JobFolderModal from "./JobFolderModal";

// const STANDARD_COLUMNS = ["item1", "item2"];
// const STANDARD_ROW_COUNT = 5;

// const emptyStandardRow = () => ({ item1: "", item2: "" });

// /**
//  * ForTypingDetailsModal
//  *
//  * Read-only "draft report" review screen. Originally built for
//  * ForTyping.jsx, but reused across other post-calibration report stages
//  * (e.g. ForCheckingOIC.jsx) via the `title` / button-label props below,
//  * since the layout (read-only snapshot of a job's calibration details,
//  * plus Calibration Standard grid) is identical at each stage — only the
//  * header title and footer action labels change.
//  */
// const ForTypingDetailsModal = ({
//   jobForm,
//   onClose,
//   onOpenCamera,
//   onOpenFolder,
//   onOpenAndUpdateReport,
//   onSaveAndAutoBackup,
//   onOpenCalStandardLookup,
//   onOpenCalProcedureLookup,
//   title = "DRAFT REPORT FOR TYPING",
//   primaryButtonLabel = "Download and Update Report",
//   secondaryButtonLabel = "Upload and Auto Backup",
// }) => {
//   const calibrationStandards =
//     jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
//       ? jobForm.calibrationStandards
//       : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

//   // OPEN FOLDER — shows every file (equipment photos + documents)
//   // already stored under this job number's Cloudinary folder, same
//   // JobFolderModal design used from JobNumberModal's "Open Folder"
//   // button elsewhere in the app. onOpenFolder (if passed in) still
//   // fires first, in case the parent screen needs to do something of
//   // its own (e.g. logging/analytics) — but showing the modal no longer
//   // depends on the parent actually doing anything with it.
//   const [showFolder, setShowFolder] = useState(false);

//   const handleOpenFolderClick = () => {
//     onOpenFolder?.();
//     setShowFolder(true);
//   };

//   return (
//     <>
//       {createPortal(
//         <div className="ftd-modal-overlay" onClick={onClose}>
//           <div
//             className="ftd-modal-wrapper"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <CdmsModalHeader
//               title={title}
//               subtitleBottom={jobForm.companyName}
//               onClose={onClose}
//             />

//             <div className="ftd-modal-scroll">
//               <div className="ftd-top-meta">
//                 <div className="ftd-meta-row">
//                   <label>Job Number</label>
//                   <input type="text" value={jobForm.jobNumber || ""} disabled />
//                 </div>
//                 <div className="ftd-meta-row">
//                   <label>Date Received</label>
//                   <input type="text" value={jobForm.dateRec || ""} disabled />
//                 </div>
//               </div>

//               <div className="ftd-body">
//                 {/* LEFT COLUMN */}
//                 <div className="ftd-col ftd-col-left">
//                   <div className="ftd-field">
//                     <label>Company</label>
//                     <textarea
//                       value={jobForm.companyName || ""}
//                       rows={2}
//                       disabled
//                     />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Description</label>
//                     <div className="ftd-input-with-btn">
//                       <textarea
//                         value={jobForm.description || ""}
//                         rows={2}
//                         disabled
//                       />
//                       <button type="button" className="ftd-lookup-btn" disabled>
//                         🔍
//                       </button>
//                     </div>
//                   </div>
//                   <div className="ftd-field">
//                     <label>Brand</label>
//                     <input type="text" value={jobForm.brand || ""} disabled />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Model</label>
//                     <input type="text" value={jobForm.model || ""} disabled />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Serial No</label>
//                     <input
//                       type="text"
//                       value={jobForm.serialNo || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Remarks</label>
//                     <textarea value={jobForm.remarks || ""} rows={2} disabled />
//                   </div>
//                 </div>

//                 {/* MIDDLE COLUMN */}
//                 <div className="ftd-col ftd-col-mid">
//                   <div className="ftd-inline-field">
//                     <label>OIC</label>
//                     <input type="text" value={jobForm.oicBy || ""} disabled />
//                   </div>
//                   <div className="ftd-inline-field">
//                     <label>SIG</label>
//                     <input type="text" value={jobForm.sig || ""} disabled />
//                   </div>
//                   <div className="ftd-inline-field">
//                     <label>Frequency</label>
//                     <input
//                       type="text"
//                       value={jobForm.frequency || ""}
//                       disabled
//                     />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Con Cert</label>
//                     <div className="ftd-input-with-btn">
//                       <input
//                         type="text"
//                         value={jobForm.contactCert || ""}
//                         disabled
//                       />
//                       <button type="button" className="ftd-lookup-btn" disabled>
//                         🔍
//                       </button>
//                     </div>
//                   </div>
//                   <div className="ftd-field">
//                     <label>Uncertainty</label>
//                     <textarea
//                       value={jobForm.uncertainty || ""}
//                       rows={2}
//                       disabled
//                     />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Range</label>
//                     <textarea value={jobForm.range || ""} rows={2} disabled />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Concern</label>
//                     <textarea value={jobForm.concern || ""} rows={2} disabled />
//                   </div>
//                 </div>

//                 {/* DATE / PRIORITY COLUMN */}
//                 <div className="ftd-col ftd-col-dates">
//                   <div className="ftd-inline-field">
//                     <label>Date Cal</label>
//                     <input type="text" value={jobForm.dateCal || ""} disabled />
//                   </div>
//                   <div className="ftd-inline-field">
//                     <label>Date Due</label>
//                     <input type="text" value={jobForm.dateDue || ""} disabled />
//                   </div>
//                   <div className="ftd-inline-field">
//                     <label>Priority</label>
//                     <input
//                       type="text"
//                       value={jobForm.priority || ""}
//                       disabled
//                     />
//                   </div>
//                 </div>

//                 {/* CALIBRATION STANDARD */}
//                 <div className="ftd-col ftd-col-standard">
//                   <div className="ftd-box-title">Calibration Standard</div>
//                   <div className="ftd-standard-grid">
//                     {calibrationStandards.map((row, idx) => (
//                       <div className="ftd-standard-row" key={idx}>
//                         {STANDARD_COLUMNS.map((col) => (
//                           <div className="ftd-standard-cell" key={col}>
//                             <input
//                               type="text"
//                               value={row[col] || "-"}
//                               disabled
//                             />
//                             <button
//                               type="button"
//                               className="ftd-lookup-btn"
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

//                   <div className="ftd-camera-actions">
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
//               <div className="ftd-mid-section">
//                 <div className="ftd-accreditation-box">
//                   <div className="ftd-box-title">Accreditation Logo</div>
//                   <label className="ftd-radio-label">
//                     <input
//                       type="radio"
//                       checked={jobForm.accreditationLogo === "with"}
//                       disabled
//                       readOnly
//                     />{" "}
//                     With PAB Logo
//                   </label>
//                   <label className="ftd-radio-label">
//                     <input
//                       type="radio"
//                       checked={jobForm.accreditationLogo === "none"}
//                       disabled
//                       readOnly
//                     />{" "}
//                     No PAB Logo
//                   </label>
//                 </div>

//                 <div className="ftd-procedure-box">
//                   <div className="ftd-box-title">Calibration Procedure :</div>
//                   <div className="ftd-input-with-btn">
//                     <input
//                       type="text"
//                       value={jobForm.calibrationProcedure || ""}
//                       disabled
//                     />
//                     <button
//                       type="button"
//                       className="ftd-lookup-btn"
//                       onClick={onOpenCalProcedureLookup}
//                     >
//                       🔍
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* FOOTER ACTIONS */}
//               <div className="ftd-footer">
//                 <button
//                   type="button"
//                   className="ftd-primary-btn"
//                   onClick={onOpenAndUpdateReport}
//                 >
//                   {primaryButtonLabel}
//                 </button>
//                 <div className="ftd-footer-right">
//                   <button type="button" onClick={onSaveAndAutoBackup}>
//                     {secondaryButtonLabel}
//                   </button>
//                   <button type="button" onClick={onClose}>
//                     Exit
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>,
//         document.body,
//       )}

//       {/* JOB FOLDER MODAL — lists every file Cloudinary has for this job
//           number (equipment photos + documents), fetched fresh on open. */}
//       {showFolder && jobForm.jobNumber && (
//         <JobFolderModal
//           jobNumber={jobForm.jobNumber}
//           onClose={() => setShowFolder(false)}
//         />
//       )}
//     </>
//   );
// };

// export default ForTypingDetailsModal;
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import "./ForTypingDetailsModal.css";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import JobFolderModal from "./JobFolderModal";
import ConfirmDialog from "../../components/ConfirmDialog";

// Base backend URL — needed here (unlike before) now that this modal
// actually calls the backend directly to build the filled-template
// download, instead of just delegating to onOpenAndUpdateReport.
const API = import.meta.env.VITE_API_URL;

const STANDARD_COLUMNS = ["item1", "item2"];
const STANDARD_ROW_COUNT = 5;

const emptyStandardRow = () => ({ item1: "", item2: "" });

/**
 * ForTypingDetailsModal
 *
 * Read-only "draft report" review screen. Originally built for
 * ForTyping.jsx, but reused across other post-calibration report stages
 * (e.g. ForCheckingOIC.jsx) via the `title` / button-label props below,
 * since the layout (read-only snapshot of a job's calibration details,
 * plus Calibration Standard grid) is identical at each stage — only the
 * header title and footer action labels change.
 */
const ForTypingDetailsModal = ({
  jobForm,
  onClose,
  onOpenCamera,
  onOpenFolder,
  onOpenAndUpdateReport,
  onSaveAndAutoBackup,
  onOpenCalStandardLookup,
  onOpenCalProcedureLookup,
  title = "DRAFT REPORT FOR TYPING",
  primaryButtonLabel = "Download and Update Report",
  secondaryButtonLabel = "Upload and Auto Backup",
  // Appended to the downloaded filled-template filename, e.g.
  // "SSS-0001-26 - For Typing.xlsx". Left blank by default so a caller
  // that doesn't pass one gets the plain job-number filename. Each
  // stage's parent screen passes its own label in (see ForTyping.jsx).
  downloadLabel = "",
}) => {
  const calibrationStandards =
    jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
      ? jobForm.calibrationStandards
      : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

  // OPEN FOLDER — shows every file (equipment photos + documents)
  // already stored under this job number's Cloudinary folder, same
  // JobFolderModal design used from JobNumberModal's "Open Folder"
  // button elsewhere in the app. onOpenFolder (if passed in) still
  // fires first, in case the parent screen needs to do something of
  // its own (e.g. logging/analytics) — but showing the modal no longer
  // depends on the parent actually doing anything with it.
  const [showFolder, setShowFolder] = useState(false);

  const handleOpenFolderClick = () => {
    onOpenFolder?.();
    setShowFolder(true);
  };

  // --- Validation / info dialog --------------------------------------
  // Lightweight local dialog, same shape/behavior as the one in
  // IncomingCalibDetailsModal, just scoped to this modal's own
  // download/upload validation (missing fields, missing template,
  // failed download, failed upload) since this modal doesn't otherwise
  // need a confirm/cancel flow of its own.
  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: "",
  });

  const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

  const showError = (title, message) => {
    setDialog({ show: true, title, message });
  };

  // --- Download the template, filled with this job's data -----------
  // Pulls whichever template is currently attached to the job record as
  // calibrationProcedureTemplate — i.e. the LAST version re-uploaded
  // during an earlier stage (Incoming Calibration / On-Going
  // Calibration), since each re-upload there overwrites that field with
  // the new version before the job is saved forward. This modal never
  // re-uploads anything itself; it only reads whatever was carried over
  // by the parent screen's fetch (see ForTyping.jsx), so there's no
  // "old vs new" ambiguity to resolve here — there's exactly one
  // template on the record, and it's always the most recent one.
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = async () => {
    const missing = [];

    if (!jobForm.calibrationProcedure?.trim()) {
      missing.push("Calibration Procedure");
    }

    const hasStandard = calibrationStandards.some((row) =>
      Object.values(row).some((v) => v?.trim()),
    );
    if (!hasStandard) {
      missing.push("Calibration Standard");
    }

    if (missing.length > 0) {
      showError(
        "Missing Information",
        `The ${missing.join(" and ")} ${
          missing.length > 1 ? "are" : "is"
        } missing from this job's record, so a template can't be downloaded.`,
      );
      return;
    }

    const template = jobForm.calibrationProcedureTemplate;
    if (!template?.publicId) {
      showError(
        "Template Not Found",
        "No downloadable file is linked to this calibration procedure.",
      );
      return;
    }

    // Filename is the job number, not the template's code — e.g.
    // "SSS-0001-26.xlsx" instead of "SSS-CP-020.xlsx". Slashes are
    // swapped for dashes since job numbers are often formatted like
    // "SSS/0001/26", and a raw "/" would both break the filename and
    // corrupt the Content-Disposition header. Extension comes from the
    // template so the downloaded file still opens correctly.
    const ext = template.format ? `.${template.format}` : "";
    const safeJobNumber = (jobForm.jobNumber || "job").replace(/[\\/]/g, "-");
    const baseName = downloadLabel
      ? `${safeJobNumber} - ${downloadLabel}`
      : safeJobNumber;
    const filename = `${baseName}${ext}`;

    setIsDownloading(true);
    try {
      const res = await fetch(`${API}/api/uploads/templates/download-filled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId: template.publicId,
          filename,
          jobData: {
            jobNumber: jobForm.jobNumber,
            companyName: jobForm.companyName,
            companyAddress: jobForm.companyAddress,
            description: jobForm.description,
            brand: jobForm.brand,
            model: jobForm.model,
            serialNo: jobForm.serialNo,
            dateRec: jobForm.dateRec,
            dateCal: jobForm.dateCal,
            dateDue: jobForm.dateDue,
            contactCert: jobForm.contactCert,
            oicBy: jobForm.oicBy,
            sig: jobForm.sig,
            calibrationStandards,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Download failed with ${res.status}`);
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

      // Let the parent screen react to a completed download (e.g. any
      // logging/analytics it wants to attach to this stage) without
      // this modal needing to know what that is.
      onOpenAndUpdateReport?.();
    } catch (err) {
      console.error("Failed to download filled template:", err);
      showError(
        "Download Failed",
        "The template could not be downloaded. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Upload the filled-in template back, then hand off to the parent
  // screen's move-to-next-stage flow --------------------------------
  // "Upload and Auto Backup" now does two things in sequence:
  //   1. Uploads the file the user picks (the template they downloaded
  //      via Download, presumably filled in / signed) into this job's
  //      Cloudinary documents folder — cdms/job-numbers/<jobNumber>/
  //      documents — using the same POST /api/uploads/job-document/:jobNumber
  //      route JobNumberModal's "Upload PDF" button uses. That folder is
  //      exactly what JobFolderModal (Open Folder / View Files) reads
  //      from, so the uploaded copy shows up there automatically — no
  //      extra field needs to be saved on the job record for it to be
  //      visible.
  //   2. Only once that upload succeeds does it call onSaveAndAutoBackup
  //      (unchanged from before) — which is what actually triggers the
  //      parent screen's confirm dialog and the update-details PUT that
  //      moves the job on to For Checking OIC (see ForTyping.jsx).
  // If the upload fails, onSaveAndAutoBackup is never called, so a
  // failed backup can't silently still move the job forward.
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadButtonClick = () => {
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

      // Upload succeeded — proceed to the existing "move to For
      // Checking OIC" confirmation flow in the parent screen.
      onSaveAndAutoBackup?.();
    } catch (err) {
      console.error("Failed to upload backup file:", err);
      showError(
        "Upload Failed",
        "The file could not be uploaded. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {createPortal(
        <div className="ftd-modal-overlay" onClick={onClose}>
          <div
            className="ftd-modal-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <CdmsModalHeader
              title={title}
              subtitleBottom={jobForm.companyName}
              onClose={onClose}
            />

            <div className="ftd-modal-scroll">
              <div className="ftd-top-meta">
                <div className="ftd-meta-row">
                  <label>Job Number</label>
                  <input type="text" value={jobForm.jobNumber || ""} disabled />
                </div>
                <div className="ftd-meta-row">
                  <label>Date Received</label>
                  <input type="text" value={jobForm.dateRec || ""} disabled />
                </div>
              </div>

              <div className="ftd-body">
                {/* LEFT COLUMN */}
                <div className="ftd-col ftd-col-left">
                  <div className="ftd-field">
                    <label>Company</label>
                    <textarea
                      value={jobForm.companyName || ""}
                      rows={2}
                      disabled
                    />
                  </div>
                  <div className="ftd-field">
                    <label>Description</label>
                    <div className="ftd-input-with-btn">
                      <textarea
                        value={jobForm.description || ""}
                        rows={2}
                        disabled
                      />
                      <button type="button" className="ftd-lookup-btn" disabled>
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="ftd-field">
                    <label>Brand</label>
                    <input type="text" value={jobForm.brand || ""} disabled />
                  </div>
                  <div className="ftd-field">
                    <label>Model</label>
                    <input type="text" value={jobForm.model || ""} disabled />
                  </div>
                  <div className="ftd-field">
                    <label>Serial No</label>
                    <input
                      type="text"
                      value={jobForm.serialNo || ""}
                      disabled
                    />
                  </div>
                  <div className="ftd-field">
                    <label>Remarks</label>
                    <textarea value={jobForm.remarks || ""} rows={2} disabled />
                  </div>
                </div>

                {/* MIDDLE COLUMN */}
                <div className="ftd-col ftd-col-mid">
                  <div className="ftd-inline-field">
                    <label>OIC</label>
                    <input type="text" value={jobForm.oicBy || ""} disabled />
                  </div>
                  <div className="ftd-inline-field">
                    <label>SIG</label>
                    <input type="text" value={jobForm.sig || ""} disabled />
                  </div>
                  <div className="ftd-inline-field">
                    <label>Frequency</label>
                    <input
                      type="text"
                      value={jobForm.frequency || ""}
                      disabled
                    />
                  </div>
                  <div className="ftd-field">
                    <label>Con Cert</label>
                    <div className="ftd-input-with-btn">
                      <input
                        type="text"
                        value={jobForm.contactCert || ""}
                        disabled
                      />
                      <button type="button" className="ftd-lookup-btn" disabled>
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="ftd-field">
                    <label>Uncertainty</label>
                    <textarea
                      value={jobForm.uncertainty || ""}
                      rows={2}
                      disabled
                    />
                  </div>
                  <div className="ftd-field">
                    <label>Range</label>
                    <textarea value={jobForm.range || ""} rows={2} disabled />
                  </div>
                  <div className="ftd-field">
                    <label>Concern</label>
                    <textarea value={jobForm.concern || ""} rows={2} disabled />
                  </div>
                </div>

                {/* DATE / PRIORITY COLUMN */}
                <div className="ftd-col ftd-col-dates">
                  <div className="ftd-inline-field">
                    <label>Date Cal</label>
                    <input type="text" value={jobForm.dateCal || ""} disabled />
                  </div>
                  <div className="ftd-inline-field">
                    <label>Date Due</label>
                    <input type="text" value={jobForm.dateDue || ""} disabled />
                  </div>
                  <div className="ftd-inline-field">
                    <label>Priority</label>
                    <input
                      type="text"
                      value={jobForm.priority || ""}
                      disabled
                    />
                  </div>
                </div>

                {/* CALIBRATION STANDARD */}
                <div className="ftd-col ftd-col-standard">
                  <div className="ftd-box-title">Calibration Standard</div>
                  <div className="ftd-standard-grid">
                    {calibrationStandards.map((row, idx) => (
                      <div className="ftd-standard-row" key={idx}>
                        {STANDARD_COLUMNS.map((col) => (
                          <div className="ftd-standard-cell" key={col}>
                            <input
                              type="text"
                              value={row[col] || "-"}
                              disabled
                            />
                            <button
                              type="button"
                              className="ftd-lookup-btn"
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

                  <div className="ftd-camera-actions">
                    <button type="button" onClick={onOpenCamera}>
                      Open Camera
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

              {/* ACCREDITATION LOGO + CALIBRATION PROCEDURE */}
              <div className="ftd-mid-section">
                <div className="ftd-accreditation-box">
                  <div className="ftd-box-title">Accreditation Logo</div>
                  <label className="ftd-radio-label">
                    <input
                      type="radio"
                      checked={jobForm.accreditationLogo === "with"}
                      disabled
                      readOnly
                    />{" "}
                    With PAB Logo
                  </label>
                  <label className="ftd-radio-label">
                    <input
                      type="radio"
                      checked={jobForm.accreditationLogo === "none"}
                      disabled
                      readOnly
                    />{" "}
                    No PAB Logo
                  </label>
                </div>

                <div className="ftd-procedure-box">
                  <div className="ftd-box-title">Calibration Procedure :</div>
                  <div className="ftd-input-with-btn">
                    <input
                      type="text"
                      value={jobForm.calibrationProcedure || ""}
                      disabled
                    />
                    <button
                      type="button"
                      className="ftd-lookup-btn"
                      onClick={onOpenCalProcedureLookup}
                    >
                      🔍
                    </button>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="ftd-footer">
                <button
                  type="button"
                  className="ftd-primary-btn"
                  onClick={handleDownloadClick}
                  disabled={isDownloading}
                  title="Download the calibration procedure template (last re-uploaded version), filled with this job's data"
                >
                  {isDownloading ? "Preparing..." : primaryButtonLabel}
                </button>
                <div className="ftd-footer-right">
                  {/* Hidden file input — opened by the visible button
                      below via fileInputRef, so the actual OS file
                      picker UI stays native instead of building a
                      custom one. */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    accept=".xlsx,.xls,.doc,.docx,.pdf"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={handleUploadButtonClick}
                    disabled={isUploading}
                    title="Upload the filled-in template as this job's backup copy, then send it to For Checking OIC"
                  >
                    {isUploading ? "Uploading..." : secondaryButtonLabel}
                  </button>
                  <button type="button" onClick={onClose}>
                    Exit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* JOB FOLDER MODAL — lists every file Cloudinary has for this job
          number (equipment photos + documents), fetched fresh on open. */}
      {showFolder && jobForm.jobNumber && (
        <JobFolderModal
          jobNumber={jobForm.jobNumber}
          onClose={() => setShowFolder(false)}
        />
      )}

      {dialog.show && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmLabel="OK"
          type="danger"
          onConfirm={hideDialog}
          onCancel={null}
        />
      )}
    </>
  );
};

export default ForTypingDetailsModal;
