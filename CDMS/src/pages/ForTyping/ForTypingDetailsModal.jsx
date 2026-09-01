// import React, { useState, useRef, useEffect } from "react";
// import { createPortal } from "react-dom";
// import "./ForTypingDetailsModal.css";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
// import ConfirmDialog from "../../components/ConfirmDialog";

// // Base backend URL — needed here (unlike before) now that this modal
// // actually calls the backend directly to build the filled-template
// // download, instead of just delegating to onOpenAndUpdateReport.
// const API = import.meta.env.VITE_API_URL;

// const STANDARD_COLUMNS = ["item1", "item2"];
// const STANDARD_ROW_COUNT = 5;

// const emptyStandardRow = () => ({ item1: "", item2: "" });

// // SIG has no real signatory data source wired up yet — placeholder list
// // so the dropdown is usable in the meantime. Swap for a real fetch
// // (e.g. an accounts role, or a dedicated signatories collection) once
// // that's decided.
// const SAMPLE_SIG_OPTIONS = ["JJP", "ARB", "MCL"];

// const FREQUENCY_OPTIONS = ["1 Year", "6 Months", "3 Months", "2 Years"];

// const todayISO = () => new Date().toISOString().slice(0, 10);

// // Adds one calendar month to an ISO "YYYY-MM-DD" date string, used to
// // auto-compute Date Due from Date Cal for Site Calibration jobs. Clamps
// // to the last valid day of the target month (e.g. Jan 31 -> Feb 28) so
// // this never silently rolls over into the month after.
// const addOneMonthISO = (isoDate) => {
//   if (!isoDate) return "";
//   const [year, month, day] = isoDate.split("-").map(Number);
//   if (!year || !month || !day) return "";
//   const targetMonthIndex = month; // month is 1-indexed, so this IS "next month" 0-indexed
//   const daysInTargetMonth = new Date(year, targetMonthIndex + 1, 0).getDate();
//   const clampedDay = Math.min(day, daysInTargetMonth);
//   const result = new Date(year, targetMonthIndex, clampedDay);
//   const yyyy = result.getFullYear();
//   const mm = String(result.getMonth() + 1).padStart(2, "0");
//   const dd = String(result.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// };

// /**
//  * ForTypingDetailsModal
//  *
//  * Read-only "draft report" review screen. Originally built for
//  * ForTyping.jsx, but reused across other post-calibration report stages
//  * (e.g. ForCheckingOIC.jsx) via the `title` / button-label props below,
//  * since the layout (read-only snapshot of a job's calibration details,
//  * plus Calibration Standard grid) is identical at each stage — only the
//  * header title and footer action labels change.
//  *
//  * EXCEPTION: jobs that originated from Site Calibration (identified by
//  * jobForm.scId being present) skip Incoming Calibration and On-Going
//  * Calibration entirely, so this is the FIRST screen where their details
//  * are ever reviewed/entered. For those jobs, the fields below are
//  * editable instead of disabled, and edits are pushed back up to the
//  * parent via onFieldChange so ForTyping.jsx can persist them.
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
//   onFieldChange,
//   title = "DRAFT REPORT FOR TYPING",
//   primaryButtonLabel = "Download and Update Report",
//   secondaryButtonLabel = "Upload and Auto Backup",
//   // Appended to the downloaded filled-template filename, e.g.
//   // "SSS-0001-26 - For Typing.xlsx". Left blank by default so a caller
//   // that doesn't pass one gets the plain job-number filename. Each
//   // stage's parent screen passes its own label in (see ForTyping.jsx).
//   downloadLabel = "",
// }) => {
//   // Site Calibration jobs carry an scId (stamped on save in
//   // AddSiteCalibrationModal.jsx) and never pass through Incoming/
//   // On-Going Calibration, so this screen is their first chance to have
//   // these fields filled in — hence editable here, unlike the normal
//   // read-only review flow.
//   const isSiteCalibrationJob = Boolean(jobForm.scId);

//   const handleChange = (field) => (e) => {
//     onFieldChange?.(field, e.target.value);
//   };

//   // OIC options — accounts with a technician role, same fetch pattern as
//   // AddSiteCalibrationModal.jsx's fetchTechnicians. Only fetched for
//   // Site Calibration jobs since that's the only case OIC becomes a
//   // dropdown instead of a disabled input.
//   const [technicianOptions, setTechnicianOptions] = useState([]);

//   useEffect(() => {
//     if (!isSiteCalibrationJob) return;
//     let cancelled = false;

//     const fetchTechnicians = async () => {
//       try {
//         const res = await fetch(`${API}/api/accounts`);
//         if (!res.ok) return;
//         const accounts = await res.json();
//         const technicians = (Array.isArray(accounts) ? accounts : []).filter(
//           (acc) => acc.role === "technician",
//         );
//         if (!cancelled) setTechnicianOptions(technicians);
//       } catch (err) {
//         console.error("Failed to fetch technicians:", err);
//         if (!cancelled) setTechnicianOptions([]);
//       }
//     };

//     fetchTechnicians();
//     return () => {
//       cancelled = true;
//     };
//   }, [isSiteCalibrationJob]);

//   // Site Calibration jobs default Date Cal to today and Date Due to one
//   // month later — only when those fields are still empty, so this never
//   // clobbers a value already saved on the record.
//   useEffect(() => {
//     if (!isSiteCalibrationJob) return;
//     if (!jobForm.dateCal) {
//       const today = todayISO();
//       onFieldChange?.("dateCal", today);
//       if (!jobForm.dateDue) {
//         onFieldChange?.("dateDue", addOneMonthISO(today));
//       }
//     }
//     // Only re-run when the job itself changes (not on every keystroke) —
//     // deliberately omitting jobForm.dateCal/onFieldChange from deps.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isSiteCalibrationJob, jobForm.jobNumber]);

//   // Date Cal has its own handler (rather than the generic handleChange)
//   // since editing it also recomputes Date Due to one month later. Date
//   // Due itself keeps using the generic handler, so the user can still
//   // freely override the computed value afterward.
//   const handleDateCalChange = (e) => {
//     const value = e.target.value;
//     onFieldChange?.("dateCal", value);
//     onFieldChange?.("dateDue", addOneMonthISO(value));
//   };

//   // Con Cert options — contact names for this job's company, fetched the
//   // same way AddSiteCalibrationModal.jsx does. Requires customerId to be
//   // carried through onto the job record (see ForTyping.jsx's mapping).
//   const [contactOptions, setContactOptions] = useState([]);

//   useEffect(() => {
//     if (!isSiteCalibrationJob || !jobForm.customerId) return;
//     let cancelled = false;

//     const fetchContacts = async () => {
//       try {
//         const res = await fetch(
//           `${API}/api/customers/${encodeURIComponent(
//             jobForm.customerId,
//           )}/contacts/full`,
//         );
//         if (!res.ok) return;
//         const contacts = await res.json();
//         if (!cancelled)
//           setContactOptions(Array.isArray(contacts) ? contacts : []);
//       } catch (err) {
//         console.error("Failed to fetch contacts for customer:", err);
//         if (!cancelled) setContactOptions([]);
//       }
//     };

//     fetchContacts();
//     return () => {
//       cancelled = true;
//     };
//   }, [isSiteCalibrationJob, jobForm.customerId]);

//   const calibrationStandards =
//     jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
//       ? jobForm.calibrationStandards
//       : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

//   const handleStandardChange = (idx, col) => (e) => {
//     if (!onFieldChange) return;
//     const next = calibrationStandards.map((row, i) =>
//       i === idx ? { ...row, [col]: e.target.value } : row,
//     );
//     onFieldChange("calibrationStandards", next);
//   };

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

//   // --- Validation / info dialog --------------------------------------
//   // Lightweight local dialog, same shape/behavior as the one in
//   // IncomingCalibDetailsModal, just scoped to this modal's own
//   // download/upload validation (missing fields, missing template,
//   // failed download, wrong file type, failed upload) since this modal
//   // doesn't otherwise need a confirm/cancel flow of its own.
//   const [dialog, setDialog] = useState({
//     show: false,
//     title: "",
//     message: "",
//   });

//   const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

//   const showError = (title, message) => {
//     setDialog({ show: true, title, message });
//   };

//   // --- Download the template, filled with this job's data -----------
//   // Pulls whichever template is currently attached to the job record as
//   // calibrationProcedureTemplate — i.e. the LAST version re-uploaded
//   // during an earlier stage (Incoming Calibration / On-Going
//   // Calibration), since each re-upload there overwrites that field with
//   // the new version before the job is saved forward. This modal never
//   // re-uploads anything itself; it only reads whatever was carried over
//   // by the parent screen's fetch (see ForTyping.jsx), so there's no
//   // "old vs new" ambiguity to resolve here — there's exactly one
//   // template on the record, and it's always the most recent one.
//   const [isDownloading, setIsDownloading] = useState(false);

//   const handleDownloadClick = async () => {
//     const missing = [];

//     if (!jobForm.calibrationProcedure?.trim()) {
//       missing.push("Calibration Procedure");
//     }

//     const hasStandard = calibrationStandards.some((row) =>
//       Object.values(row).some((v) => v?.trim()),
//     );
//     if (!hasStandard) {
//       missing.push("Calibration Standard");
//     }

//     if (missing.length > 0) {
//       showError(
//         "Missing Information",
//         `The ${missing.join(" and ")} ${
//           missing.length > 1 ? "are" : "is"
//         } missing from this job's record, so a template can't be downloaded.`,
//       );
//       return;
//     }

//     const template = jobForm.calibrationProcedureTemplate;
//     if (!template?.publicId) {
//       showError(
//         "Template Not Found",
//         "No downloadable file is linked to this calibration procedure.",
//       );
//       return;
//     }

//     // Filename is the job number, not the template's code — e.g.
//     // "SSS-0001-26.xlsx" instead of "SSS-CP-020.xlsx". Slashes are
//     // swapped for dashes since job numbers are often formatted like
//     // "SSS/0001/26", and a raw "/" would both break the filename and
//     // corrupt the Content-Disposition header. Extension comes from the
//     // template so the downloaded file still opens correctly.
//     const ext = template.format ? `.${template.format}` : "";
//     const safeJobNumber = (jobForm.jobNumber || "job").replace(/[\\/]/g, "-");
//     const baseName = downloadLabel
//       ? `${safeJobNumber} - ${downloadLabel}`
//       : safeJobNumber;
//     const filename = `${baseName}${ext}`;

//     setIsDownloading(true);
//     try {
//       const res = await fetch(`${API}/api/uploads/templates/download-filled`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           publicId: template.publicId,
//           filename,
//           jobData: {
//             jobNumber: jobForm.jobNumber,
//             companyName: jobForm.companyName,
//             companyAddress: jobForm.companyAddress,
//             description: jobForm.description,
//             brand: jobForm.brand,
//             model: jobForm.model,
//             serialNo: jobForm.serialNo,
//             dateRec: jobForm.dateRec,
//             dateCal: jobForm.dateCal,
//             dateDue: jobForm.dateDue,
//             contactCert: jobForm.contactCert,
//             oicBy: jobForm.oicBy,
//             sig: jobForm.sig,
//             calibrationStandards,
//           },
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.message || `Download failed with ${res.status}`);
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

//       // Let the parent screen react to a completed download (e.g. any
//       // logging/analytics it wants to attach to this stage) without
//       // this modal needing to know what that is.
//       onOpenAndUpdateReport?.();
//     } catch (err) {
//       console.error("Failed to download filled template:", err);
//       showError(
//         "Download Failed",
//         "The template could not be downloaded. Please try again.",
//       );
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   // --- Upload the filled-in template back, then hand off to the parent
//   // screen's move-to-next-stage flow --------------------------------
//   // "Upload and Auto Backup" now does two things in sequence:
//   //   1. Uploads the file the user picks (the template they downloaded
//   //      via Download, presumably filled in / signed) into this job's
//   //      Cloudinary documents folder — cdms/job-numbers/<jobNumber>/
//   //      documents — using the same POST /api/uploads/job-document/:jobNumber
//   //      route JobNumberModal's "Upload PDF" button uses. That folder is
//   //      exactly what JobFolderModal (Open Folder / View Files) reads
//   //      from, so the uploaded copy shows up there automatically — no
//   //      extra field needs to be saved on the job record for it to be
//   //      visible.
//   //   2. Only once that upload succeeds does it call onSaveAndAutoBackup
//   //      (unchanged from before) — which is what actually triggers the
//   //      parent screen's confirm dialog and the update-details PUT that
//   //      moves the job on to For Checking OIC (see ForTyping.jsx).
//   // If the upload fails, onSaveAndAutoBackup is never called, so a
//   // failed backup can't silently still move the job forward.
//   //
//   // Restricted to .xlsx only — every downstream stage (this modal's own
//   // download-filled, and For Checking OIC's Check and Sign Report) reads
//   // this file back with ExcelJS, which can't open legacy .xls, and
//   // .doc/.docx/.pdf were never actually usable here either. The picker
//   // itself is filtered via `accept`, but that's advisory only (some OS
//   // file dialogs let the user override it), so the extension is checked
//   // again below before anything is uploaded.
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const handleUploadButtonClick = () => {
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

//       // Upload succeeded — proceed to the existing "move to For
//       // Checking OIC" confirmation flow in the parent screen.
//       onSaveAndAutoBackup?.();
//     } catch (err) {
//       console.error("Failed to upload backup file:", err);
//       showError(
//         "Upload Failed",
//         "The file could not be uploaded. Please try again.",
//       );
//     } finally {
//       setIsUploading(false);
//     }
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
//                         disabled={!isSiteCalibrationJob}
//                         onChange={handleChange("description")}
//                       />
//                       <button
//                         type="button"
//                         className="ftd-lookup-btn"
//                         disabled={!isSiteCalibrationJob}
//                       >
//                         🔍
//                       </button>
//                     </div>
//                   </div>
//                   <div className="ftd-field">
//                     <label>Brand</label>
//                     <input
//                       type="text"
//                       value={jobForm.brand || ""}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleChange("brand")}
//                     />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Model</label>
//                     <input
//                       type="text"
//                       value={jobForm.model || ""}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleChange("model")}
//                     />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Serial No</label>
//                     <input
//                       type="text"
//                       value={jobForm.serialNo || ""}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleChange("serialNo")}
//                     />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Remarks</label>
//                     <textarea
//                       value={jobForm.remarks || ""}
//                       rows={2}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleChange("remarks")}
//                     />
//                   </div>
//                 </div>

//                 {/* MIDDLE COLUMN */}
//                 <div className="ftd-col ftd-col-mid">
//                   <div className="ftd-inline-field">
//                     <label>OIC</label>
//                     {isSiteCalibrationJob ? (
//                       <select
//                         value={jobForm.oicBy || ""}
//                         onChange={handleChange("oicBy")}
//                       >
//                         <option value="">
//                           {technicianOptions.length > 0
//                             ? "Select technician..."
//                             : "No technicians found"}
//                         </option>
//                         {technicianOptions.map((tech) => {
//                           const label = tech.name || tech.username;
//                           return (
//                             <option
//                               key={tech._id || tech.username}
//                               value={label}
//                             >
//                               {label}
//                             </option>
//                           );
//                         })}
//                       </select>
//                     ) : (
//                       <input type="text" value={jobForm.oicBy || ""} disabled />
//                     )}
//                   </div>
//                   <div className="ftd-inline-field">
//                     <label>SIG</label>
//                     {isSiteCalibrationJob ? (
//                       <select
//                         value={jobForm.sig || ""}
//                         onChange={handleChange("sig")}
//                       >
//                         <option value="">Select...</option>
//                         {SAMPLE_SIG_OPTIONS.map((name) => (
//                           <option key={name} value={name}>
//                             {name}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <input type="text" value={jobForm.sig || ""} disabled />
//                     )}
//                   </div>
//                   <div className="ftd-inline-field">
//                     <label>Frequency</label>
//                     {isSiteCalibrationJob ? (
//                       <select
//                         value={jobForm.frequency || ""}
//                         onChange={handleChange("frequency")}
//                       >
//                         <option value="">Select...</option>
//                         {FREQUENCY_OPTIONS.map((f) => (
//                           <option key={f} value={f}>
//                             {f}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <input
//                         type="text"
//                         value={jobForm.frequency || ""}
//                         disabled
//                       />
//                     )}
//                   </div>
//                   <div className="ftd-field">
//                     <label>Con Cert</label>
//                     {isSiteCalibrationJob ? (
//                       <select
//                         value={jobForm.contactCert || ""}
//                         onChange={handleChange("contactCert")}
//                       >
//                         <option value="">
//                           {contactOptions.length > 0
//                             ? "Select contact..."
//                             : "No contacts found"}
//                         </option>
//                         {contactOptions.map((c, idx) => (
//                           <option
//                             key={c.contactID || c.contactName || idx}
//                             value={c.contactName}
//                           >
//                             {c.contactName}
//                           </option>
//                         ))}
//                       </select>
//                     ) : (
//                       <div className="ftd-input-with-btn">
//                         <input
//                           type="text"
//                           value={jobForm.contactCert || ""}
//                           disabled
//                         />
//                         <button
//                           type="button"
//                           className="ftd-lookup-btn"
//                           disabled
//                         >
//                           🔍
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                   <div className="ftd-field">
//                     <label>Uncertainty</label>
//                     <textarea
//                       value={jobForm.uncertainty || ""}
//                       rows={2}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleChange("uncertainty")}
//                     />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Range</label>
//                     <textarea
//                       value={jobForm.range || ""}
//                       rows={2}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleChange("range")}
//                     />
//                   </div>
//                   <div className="ftd-field">
//                     <label>Concern</label>
//                     <textarea
//                       value={jobForm.concern || ""}
//                       rows={2}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleChange("concern")}
//                     />
//                   </div>
//                 </div>

//                 {/* DATE / PRIORITY COLUMN */}
//                 <div className="ftd-col ftd-col-dates">
//                   <div className="ftd-inline-field">
//                     <label>Date Cal</label>
//                     <input
//                       type="date"
//                       value={jobForm.dateCal || ""}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleDateCalChange}
//                     />
//                   </div>
//                   <div className="ftd-inline-field">
//                     <label>Date Due</label>
//                     <input
//                       type="date"
//                       value={jobForm.dateDue || ""}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleChange("dateDue")}
//                     />
//                   </div>
//                   <div className="ftd-inline-field">
//                     <label>Priority</label>
//                     <input
//                       type="text"
//                       value={jobForm.priority || ""}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={handleChange("priority")}
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
//                               value={
//                                 row[col] || (isSiteCalibrationJob ? "" : "-")
//                               }
//                               disabled={!isSiteCalibrationJob}
//                               onChange={handleStandardChange(idx, col)}
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
//                       name="ftd-accreditation-logo"
//                       checked={jobForm.accreditationLogo === "with"}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={() =>
//                         onFieldChange?.("accreditationLogo", "with")
//                       }
//                       readOnly={!isSiteCalibrationJob}
//                     />{" "}
//                     With PAB Logo
//                   </label>
//                   <label className="ftd-radio-label">
//                     <input
//                       type="radio"
//                       name="ftd-accreditation-logo"
//                       checked={jobForm.accreditationLogo === "none"}
//                       disabled={!isSiteCalibrationJob}
//                       onChange={() =>
//                         onFieldChange?.("accreditationLogo", "none")
//                       }
//                       readOnly={!isSiteCalibrationJob}
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
//                   onClick={handleDownloadClick}
//                   disabled={isDownloading || isSiteCalibrationJob}
//                   title={
//                     isSiteCalibrationJob
//                       ? "Not available for jobs from Site Calibration"
//                       : "Download the calibration procedure template (last re-uploaded version), filled with this job's data"
//                   }
//                   style={
//                     isSiteCalibrationJob
//                       ? { opacity: 0.5, cursor: "not-allowed" }
//                       : {}
//                   }
//                 >
//                   {isDownloading ? "Preparing..." : primaryButtonLabel}
//                 </button>
//                 <div className="ftd-footer-right">
//                   {/* Hidden file input — opened by the visible button
//                       below via fileInputRef, so the actual OS file
//                       picker UI stays native instead of building a
//                       custom one. Restricted to .xlsx — see the comment
//                       above handleFileSelected. */}
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileSelected}
//                     accept=".xlsx"
//                     style={{ display: "none" }}
//                   />
//                   <button
//                     type="button"
//                     onClick={handleUploadButtonClick}
//                     disabled={isUploading}
//                     title="Upload the filled-in template as this job's backup copy, then send it to For Checking OIC"
//                   >
//                     {isUploading ? "Uploading..." : secondaryButtonLabel}
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
//         <ReceiptFolderModal
//           jobNumber={jobForm.jobNumber}
//           onClose={() => setShowFolder(false)}
//         />
//       )}

//       {dialog.show && (
//         <ConfirmDialog
//           title={dialog.title}
//           message={dialog.message}
//           confirmLabel="OK"
//           type="danger"
//           onConfirm={hideDialog}
//           onCancel={null}
//         />
//       )}
//     </>
//   );
// };

// export default ForTypingDetailsModal;
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "./ForTypingDetailsModal.css";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
import ConfirmDialog from "../../components/ConfirmDialog";
// Adjust this path to wherever CameraCaptureModal actually lives in your
// tree (same component IncomingCalibDetailsModal / OnGoingCalib use).
import CameraCaptureModal from "../jobreceipt/CameraCaptureModal";

// Base backend URL — needed here (unlike before) now that this modal
// actually calls the backend directly to build the filled-template
// download, instead of just delegating to onOpenAndUpdateReport.
const API = import.meta.env.VITE_API_URL;

const STANDARD_COLUMNS = ["item1", "item2"];
const STANDARD_ROW_COUNT = 5;

const emptyStandardRow = () => ({ item1: "", item2: "" });

// SIG has no real signatory data source wired up yet — placeholder list
// so the dropdown is usable in the meantime. Swap for a real fetch
// (e.g. an accounts role, or a dedicated signatories collection) once
// that's decided.
const SAMPLE_SIG_OPTIONS = ["JJP", "ARB", "MCL"];

const FREQUENCY_OPTIONS = ["1 Year", "6 Months", "3 Months", "2 Years"];

const todayISO = () => new Date().toISOString().slice(0, 10);

// Adds one calendar month to an ISO "YYYY-MM-DD" date string, used to
// auto-compute Date Due from Date Cal for Site Calibration jobs. Clamps
// to the last valid day of the target month (e.g. Jan 31 -> Feb 28) so
// this never silently rolls over into the month after.
const addOneMonthISO = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return "";
  const targetMonthIndex = month; // month is 1-indexed, so this IS "next month" 0-indexed
  const daysInTargetMonth = new Date(year, targetMonthIndex + 1, 0).getDate();
  const clampedDay = Math.min(day, daysInTargetMonth);
  const result = new Date(year, targetMonthIndex, clampedDay);
  const yyyy = result.getFullYear();
  const mm = String(result.getMonth() + 1).padStart(2, "0");
  const dd = String(result.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Converts a base64 dataURL (what CameraCaptureModal produces, from
// either canvas.toDataURL or FileReader.readAsDataURL) into a Blob, so it
// can be sent as multipart/form-data to the equipment-photo upload route.
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return res.blob();
};

/**
 * ForTypingDetailsModal
 *
 * Read-only "draft report" review screen. Originally built for
 * ForTyping.jsx, but reused across other post-calibration report stages
 * (e.g. ForCheckingOIC.jsx) via the `title` / button-label props below,
 * since the layout (read-only snapshot of a job's calibration details,
 * plus Calibration Standard grid) is identical at each stage — only the
 * header title and footer action labels change.
 *
 * EXCEPTION: jobs that originated from Site Calibration (identified by
 * jobForm.scId being present) skip Incoming Calibration and On-Going
 * Calibration entirely, so this is the FIRST screen where their details
 * are ever reviewed/entered. For those jobs, the fields below are
 * editable instead of disabled, and edits are pushed back up to the
 * parent via onFieldChange so ForTyping.jsx can persist them.
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
  onFieldChange,
  title = "DRAFT REPORT FOR TYPING",
  primaryButtonLabel = "Download and Update Report",
  secondaryButtonLabel = "Upload and Auto Backup",
  // Appended to the downloaded filled-template filename, e.g.
  // "SSS-0001-26 - For Typing.xlsx". Left blank by default so a caller
  // that doesn't pass one gets the plain job-number filename. Each
  // stage's parent screen passes its own label in (see ForTyping.jsx).
  downloadLabel = "",
}) => {
  // Site Calibration jobs carry an scId (stamped on save in
  // AddSiteCalibrationModal.jsx) and never pass through Incoming/
  // On-Going Calibration, so this screen is their first chance to have
  // these fields filled in — hence editable here, unlike the normal
  // read-only review flow.
  const isSiteCalibrationJob = Boolean(jobForm.scId);

  const handleChange = (field) => (e) => {
    onFieldChange?.(field, e.target.value);
  };

  // OIC options — accounts with a technician role, same fetch pattern as
  // AddSiteCalibrationModal.jsx's fetchTechnicians. Only fetched for
  // Site Calibration jobs since that's the only case OIC becomes a
  // dropdown instead of a disabled input.
  const [technicianOptions, setTechnicianOptions] = useState([]);

  useEffect(() => {
    if (!isSiteCalibrationJob) return;
    let cancelled = false;

    const fetchTechnicians = async () => {
      try {
        const res = await fetch(`${API}/api/accounts`);
        if (!res.ok) return;
        const accounts = await res.json();
        const technicians = (Array.isArray(accounts) ? accounts : []).filter(
          (acc) => acc.role === "technician",
        );
        if (!cancelled) setTechnicianOptions(technicians);
      } catch (err) {
        console.error("Failed to fetch technicians:", err);
        if (!cancelled) setTechnicianOptions([]);
      }
    };

    fetchTechnicians();
    return () => {
      cancelled = true;
    };
  }, [isSiteCalibrationJob]);

  // Site Calibration jobs default Date Cal to today and Date Due to one
  // month later — only when those fields are still empty, so this never
  // clobbers a value already saved on the record.
  useEffect(() => {
    if (!isSiteCalibrationJob) return;
    if (!jobForm.dateCal) {
      const today = todayISO();
      onFieldChange?.("dateCal", today);
      if (!jobForm.dateDue) {
        onFieldChange?.("dateDue", addOneMonthISO(today));
      }
    }
    // Only re-run when the job itself changes (not on every keystroke) —
    // deliberately omitting jobForm.dateCal/onFieldChange from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSiteCalibrationJob, jobForm.jobNumber]);

  // Date Cal has its own handler (rather than the generic handleChange)
  // since editing it also recomputes Date Due to one month later. Date
  // Due itself keeps using the generic handler, so the user can still
  // freely override the computed value afterward.
  const handleDateCalChange = (e) => {
    const value = e.target.value;
    onFieldChange?.("dateCal", value);
    onFieldChange?.("dateDue", addOneMonthISO(value));
  };

  // Con Cert options — contact names for this job's company, fetched the
  // same way AddSiteCalibrationModal.jsx does. Requires customerId to be
  // carried through onto the job record (see ForTyping.jsx's mapping).
  const [contactOptions, setContactOptions] = useState([]);

  useEffect(() => {
    if (!isSiteCalibrationJob || !jobForm.customerId) return;
    let cancelled = false;

    const fetchContacts = async () => {
      try {
        const res = await fetch(
          `${API}/api/customers/${encodeURIComponent(
            jobForm.customerId,
          )}/contacts/full`,
        );
        if (!res.ok) return;
        const contacts = await res.json();
        if (!cancelled)
          setContactOptions(Array.isArray(contacts) ? contacts : []);
      } catch (err) {
        console.error("Failed to fetch contacts for customer:", err);
        if (!cancelled) setContactOptions([]);
      }
    };

    fetchContacts();
    return () => {
      cancelled = true;
    };
  }, [isSiteCalibrationJob, jobForm.customerId]);

  const calibrationStandards =
    jobForm.calibrationStandards?.length === STANDARD_ROW_COUNT
      ? jobForm.calibrationStandards
      : Array.from({ length: STANDARD_ROW_COUNT }, emptyStandardRow);

  const handleStandardChange = (idx, col) => (e) => {
    if (!onFieldChange) return;
    const next = calibrationStandards.map((row, i) =>
      i === idx ? { ...row, [col]: e.target.value } : row,
    );
    onFieldChange("calibrationStandards", next);
  };

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
  // failed download, wrong file type, failed upload) since this modal
  // doesn't otherwise need a confirm/cancel flow of its own.
  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: "",
  });

  const hideDialog = () => setDialog((prev) => ({ ...prev, show: false }));

  const showError = (title, message) => {
    setDialog({ show: true, title, message });
  };

  // --- Equipment photo capture ---------------------------------------
  // Unlike IncomingCalibDetailsModal, this screen doesn't display a
  // photo carousel of its own — captured photos are only ever viewed
  // via "Open Folder" (ReceiptFolderModal, below). So this doesn't need
  // to track a photoUrls array in local state; it just needs the photo
  // to actually reach Cloudinary the moment it's taken.
  //
  // Previously the "Open Camera" button called onOpenCamera directly as
  // its onClick — no await, no result handling, and no camera UI
  // rendered anywhere in this file. Whether that did anything at all
  // depended entirely on ForTyping.jsx (the parent) implementing the
  // full open -> capture -> upload chain itself. This modal now owns
  // that chain directly instead: it opens CameraCaptureModal itself,
  // and on capture, uploads each photo straight to
  // POST /api/uploads/equipment-photo/:jobNumber (same route
  // IncomingCalibDetailsModal now uses) so photos are saved
  // server-side immediately, regardless of what the user does
  // afterward. onOpenCamera is still called first, if passed, purely
  // so a parent that wants to know "camera was opened" (e.g. for
  // logging) still can — but nothing here depends on it doing more
  // than that.
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
  //
  // Restricted to .xlsx only — every downstream stage (this modal's own
  // download-filled, and For Checking OIC's Check and Sign Report) reads
  // this file back with ExcelJS, which can't open legacy .xls, and
  // .doc/.docx/.pdf were never actually usable here either. The picker
  // itself is filtered via `accept`, but that's advisory only (some OS
  // file dialogs let the user override it), so the extension is checked
  // again below before anything is uploaded.
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
                        disabled={!isSiteCalibrationJob}
                        onChange={handleChange("description")}
                      />
                      <button
                        type="button"
                        className="ftd-lookup-btn"
                        disabled={!isSiteCalibrationJob}
                      >
                        🔍
                      </button>
                    </div>
                  </div>
                  <div className="ftd-field">
                    <label>Brand</label>
                    <input
                      type="text"
                      value={jobForm.brand || ""}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleChange("brand")}
                    />
                  </div>
                  <div className="ftd-field">
                    <label>Model</label>
                    <input
                      type="text"
                      value={jobForm.model || ""}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleChange("model")}
                    />
                  </div>
                  <div className="ftd-field">
                    <label>Serial No</label>
                    <input
                      type="text"
                      value={jobForm.serialNo || ""}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleChange("serialNo")}
                    />
                  </div>
                  <div className="ftd-field">
                    <label>Remarks</label>
                    <textarea
                      value={jobForm.remarks || ""}
                      rows={2}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleChange("remarks")}
                    />
                  </div>
                </div>

                {/* MIDDLE COLUMN */}
                <div className="ftd-col ftd-col-mid">
                  <div className="ftd-inline-field">
                    <label>OIC</label>
                    {isSiteCalibrationJob ? (
                      <select
                        value={jobForm.oicBy || ""}
                        onChange={handleChange("oicBy")}
                      >
                        <option value="">
                          {technicianOptions.length > 0
                            ? "Select technician..."
                            : "No technicians found"}
                        </option>
                        {technicianOptions.map((tech) => {
                          const label = tech.username;
                          return (
                            <option
                              key={tech._id || tech.username}
                              value={label}
                            >
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <input type="text" value={jobForm.oicBy || ""} disabled />
                    )}
                  </div>
                  <div className="ftd-inline-field">
                    <label>SIG</label>
                    {isSiteCalibrationJob ? (
                      <select
                        value={jobForm.sig || ""}
                        onChange={handleChange("sig")}
                      >
                        <option value="">Select...</option>
                        {SAMPLE_SIG_OPTIONS.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input type="text" value={jobForm.sig || ""} disabled />
                    )}
                  </div>
                  <div className="ftd-inline-field">
                    <label>Frequency</label>
                    {isSiteCalibrationJob ? (
                      <select
                        value={jobForm.frequency || ""}
                        onChange={handleChange("frequency")}
                      >
                        <option value="">Select...</option>
                        {FREQUENCY_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={jobForm.frequency || ""}
                        disabled
                      />
                    )}
                  </div>
                  <div className="ftd-field">
                    <label>Con Cert</label>
                    {isSiteCalibrationJob ? (
                      <select
                        value={jobForm.contactCert || ""}
                        onChange={handleChange("contactCert")}
                      >
                        <option value="">
                          {contactOptions.length > 0
                            ? "Select contact..."
                            : "No contacts found"}
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
                    ) : (
                      <div className="ftd-input-with-btn">
                        <input
                          type="text"
                          value={jobForm.contactCert || ""}
                          disabled
                        />
                        <button
                          type="button"
                          className="ftd-lookup-btn"
                          disabled
                        >
                          🔍
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="ftd-field">
                    <label>Uncertainty</label>
                    <textarea
                      value={jobForm.uncertainty || ""}
                      rows={2}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleChange("uncertainty")}
                    />
                  </div>
                  <div className="ftd-field">
                    <label>Range</label>
                    <textarea
                      value={jobForm.range || ""}
                      rows={2}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleChange("range")}
                    />
                  </div>
                  <div className="ftd-field">
                    <label>Concern</label>
                    <textarea
                      value={jobForm.concern || ""}
                      rows={2}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleChange("concern")}
                    />
                  </div>
                </div>

                {/* DATE / PRIORITY COLUMN */}
                <div className="ftd-col ftd-col-dates">
                  <div className="ftd-inline-field">
                    <label>Date Cal</label>
                    <input
                      type="date"
                      value={jobForm.dateCal || ""}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleDateCalChange}
                    />
                  </div>
                  <div className="ftd-inline-field">
                    <label>Date Due</label>
                    <input
                      type="date"
                      value={jobForm.dateDue || ""}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleChange("dateDue")}
                    />
                  </div>
                  <div className="ftd-inline-field">
                    <label>Priority</label>
                    <input
                      type="text"
                      value={jobForm.priority || ""}
                      disabled={!isSiteCalibrationJob}
                      onChange={handleChange("priority")}
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
                              value={
                                row[col] || (isSiteCalibrationJob ? "" : "-")
                              }
                              disabled={!isSiteCalibrationJob}
                              onChange={handleStandardChange(idx, col)}
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

              {/* ACCREDITATION LOGO + CALIBRATION PROCEDURE */}
              <div className="ftd-mid-section">
                <div className="ftd-accreditation-box">
                  <div className="ftd-box-title">Accreditation Logo</div>
                  <label className="ftd-radio-label">
                    <input
                      type="radio"
                      name="ftd-accreditation-logo"
                      checked={jobForm.accreditationLogo === "with"}
                      disabled={!isSiteCalibrationJob}
                      onChange={() =>
                        onFieldChange?.("accreditationLogo", "with")
                      }
                      readOnly={!isSiteCalibrationJob}
                    />{" "}
                    With PAB Logo
                  </label>
                  <label className="ftd-radio-label">
                    <input
                      type="radio"
                      name="ftd-accreditation-logo"
                      checked={jobForm.accreditationLogo === "none"}
                      disabled={!isSiteCalibrationJob}
                      onChange={() =>
                        onFieldChange?.("accreditationLogo", "none")
                      }
                      readOnly={!isSiteCalibrationJob}
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
                  disabled={isDownloading || isSiteCalibrationJob}
                  title={
                    isSiteCalibrationJob
                      ? "Not available for jobs from Site Calibration"
                      : "Download the calibration procedure template (last re-uploaded version), filled with this job's data"
                  }
                  style={
                    isSiteCalibrationJob
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  {isDownloading ? "Preparing..." : primaryButtonLabel}
                </button>
                <div className="ftd-footer-right">
                  {/* Hidden file input — opened by the visible button
                      below via fileInputRef, so the actual OS file
                      picker UI stays native instead of building a
                      custom one. Restricted to .xlsx — see the comment
                      above handleFileSelected. */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    accept=".xlsx"
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
