// import React, { useState, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";
// import "./IncomingCalibDetailsModal.css";
// import CdmsModalHeader from "./CdmsModalHeader";
// import CalibrationStandardLookupModal from "./CalibrationStandardLookUpModal";
// import CalibrationProcedureLookupModal from "./CalibrationProcedureLookupModal";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import JobFilesModal from "./JobFilesModal";

// const ROW_COUNT = 5;

// const emptyStandardRow = () => ({ item1: "", item2: "", item3: "" });

// const CONTACT_CERT_OPTIONS = ["SA", "JPR", "MCJ"];

// const FREQUENCY_MONTHS = {
//   "6 Months": 6,
//   "1 Year": 12,
//   "2 Years": 24,
//   "3 Years": 36,
// };

// const toISODate = (date) => {
//   const d = new Date(date);
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// };

// const addMonths = (isoDateStr, months) => {
//   const d = new Date(isoDateStr);
//   d.setMonth(d.getMonth() + months);
//   return toISODate(d);
// };

// // Builds the URL for the backend's raw template-download proxy route (see
// // routes/uploadRoutes.js -> GET /api/uploads/templates/download). Needs
// // the template's Cloudinary publicId, which only exists once a template
// // has actually been picked via CalibrationProcedureLookupModal.
// //
// // This is the UNFILLED, as-stored copy of the template — still used by
// // JobFilesModal's version-history downloads (an audit trail of past
// // template edits, which should stay exactly as they were uploaded, not
// // have the current job's data stamped into them). The Download button
// // in this modal uses handleDownloadClick below instead, which fetches a
// // job-data-filled copy from a separate route.
// const buildTemplateDownloadUrl = (template) => {
//   if (!template?.publicId) return null;
//   const filename = template.format
//     ? `${template.code}.${template.format}`
//     : template.code;
//   return `/api/uploads/templates/download?publicId=${encodeURIComponent(
//     template.publicId,
//   )}&filename=${encodeURIComponent(filename)}`;
// };

// const IncomingCalibDetailsModal = ({
//   jobForm,
//   onClose,
//   onUpdate,
//   onOpenCamera,
//   onLoadTemplate,
//   onLoadAndConnect,
//   onOpenCalProcedureLookup,
//   onOpenCalStandardLookup,
//   title = "INCOMING CALIBRATION DETAILS",
// }) => {
//   const [form, setForm] = useState(() => ({
//     jobNumber: jobForm.jobNumber || "",
//     dateRec: jobForm.dateRec || "",
//     companyName: jobForm.companyName || "",
//     // Company address lives on the job receipt record, not entered here
//     // — carried through so the filled-template download can stamp the
//     // CDMS sheet's COMPANY ADDRESS cell with it.
//     companyAddress: jobForm.companyAddress || "",
//     description: jobForm.description || "",
//     brand: jobForm.brand || "",
//     model: jobForm.model || "",
//     serialNo: jobForm.serialNo || "",
//     remarks: jobForm.remarks || "",
//     concern: jobForm.concern || "",
//     range: jobForm.range || "",
//     uncertainty: jobForm.uncertainty || "",
//     contactCert: jobForm.contactCert || "",
//     frequency: jobForm.frequency || "1 Year",
//     priority: jobForm.priority || "Normal",
//     oicBy: sessionStorage.getItem("username") || "",

//     sig: jobForm.sig || "",
//     dateCal: jobForm.dateCal || toISODate(new Date()),
//     dateDue: jobForm.dateDue || "",
//     accreditationLogo: jobForm.accreditationLogo || "with",
//     calibrationProcedure: jobForm.calibrationProcedure || "",
//     // Full template record (publicId, code, format, fileUrl, etc.) for
//     // whatever was picked via the lookup modal — separate from
//     // calibrationProcedure (just the display text) so the Download
//     // button below has what it needs.
//     calibrationProcedureTemplate: jobForm.calibrationProcedureTemplate || null,
//     calibrationStandards:
//       jobForm.calibrationStandards?.length === ROW_COUNT
//         ? jobForm.calibrationStandards
//         : Array.from({ length: ROW_COUNT }, emptyStandardRow),
//     photoUrl: jobForm.photoUrl || "",
//   }));

//   useEffect(() => {
//     if (!form.dateCal) return;
//     const months = FREQUENCY_MONTHS[form.frequency] ?? 12;
//     const computedDue = addMonths(form.dateCal, months);
//     setForm((prev) =>
//       prev.dateDue === computedDue ? prev : { ...prev, dateDue: computedDue },
//     );
//   }, [form.dateCal, form.frequency]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleStandardChange = (rowIndex, columnKey, value) => {
//     setForm((prev) => {
//       const next = [...prev.calibrationStandards];
//       next[rowIndex] = { ...next[rowIndex], [columnKey]: value };
//       return { ...prev, calibrationStandards: next };
//     });
//   };

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

//   // Validation-style dialog — just an OK button, no Cancel, since
//   // there's nothing to confirm/undo, only something to acknowledge.
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

//   // Acknowledgment dialog for successful actions (e.g. a completed
//   // re-upload) — OK only, no Cancel, and not styled as danger/error.
//   const showInfo = (title, message) => {
//     setDialog({
//       show: true,
//       title,
//       message,
//       onConfirm: hideDialog,
//       onCancel: null,
//       confirmLabel: "OK",
//       cancelLabel: "Cancel",
//       type: "default",
//     });
//   };

//   const handleUpdateClick = () => {
//     if (!hasReuploadedThisSession) {
//       showError(
//         "Re-upload Required",
//         "You must re-upload the edited calibration procedure template before you can update this job. Use the Re-upload button next to Calibration Procedure.",
//       );
//       return;
//     }

//     showConfirm(
//       "Confirm Update",
//       `Are you sure you want to update Job Number ${form.jobNumber}? This will save the calibration details you've entered.`,
//       () => {
//         hideDialog();
//         onUpdate?.(form);
//       },
//       "default",
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

//   const [standardLookupTarget, setStandardLookupTarget] = useState(null);

//   const openStandardLookup = (rowIndex, columnKey) => {
//     setStandardLookupTarget({ rowIndex, columnKey });
//     onOpenCalStandardLookup?.(rowIndex, columnKey);
//   };

//   const handleUseStandard = (standardRecord) => {
//     if (!standardLookupTarget) return;
//     handleStandardChange(
//       standardLookupTarget.rowIndex,
//       standardLookupTarget.columnKey,
//       standardRecord.code,
//     );
//     setStandardLookupTarget(null);
//   };

//   const [showProcedureLookup, setShowProcedureLookup] = useState(false);

//   const openProcedureLookup = () => {
//     setShowProcedureLookup(true);
//     onOpenCalProcedureLookup?.();
//   };

//   const handleSelectTemplate = (template) => {
//     // Selecting a template fills the text field AND keeps the full
//     // template record around (publicId etc.) so the Download button
//     // below can actually build a working download link.
//     setForm((prev) => ({
//       ...prev,
//       calibrationProcedure: template.name,
//       calibrationProcedureTemplate: template,
//     }));
//     setShowProcedureLookup(false);
//   };

//   // Recovers calibrationProcedureTemplate for records that only have the
//   // plain text code saved (e.g. typed by hand, or saved before this
//   // field existed) — without this, the Download button silently stays
//   // hidden even though the text field shows a valid-looking code, since
//   // it has no publicId to build a download link from. Runs once, only
//   // when there's a code to match but no template object already
//   // attached to it.
//   useEffect(() => {
//     if (form.calibrationProcedureTemplate || !form.calibrationProcedure) {
//       return;
//     }
//     let cancelled = false;

//     (async () => {
//       try {
//         const res = await fetch("/api/uploads/templates");
//         const data = await res.json();
//         if (cancelled || !res.ok || data.success === false) return;

//         const match = (data.templates || []).find(
//           (t) =>
//             t.code?.toLowerCase() === form.calibrationProcedure.toLowerCase(),
//         );
//         if (match) {
//           setForm((prev) =>
//             prev.calibrationProcedureTemplate
//               ? prev
//               : { ...prev, calibrationProcedureTemplate: match },
//           );
//         }
//       } catch (err) {
//         console.error("Failed to recover calibration procedure template:", err);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleOpenCamera = async () => {
//     const result = await onOpenCamera?.();
//     if (result) setForm((prev) => ({ ...prev, photoUrl: result }));
//   };

//   const contactCertOptions = CONTACT_CERT_OPTIONS.includes(form.contactCert)
//     ? CONTACT_CERT_OPTIONS
//     : [form.contactCert, ...CONTACT_CERT_OPTIONS].filter(Boolean);

//   // --- View Files modal --------------------------------------------
//   // Lists the job's unit photo, the full version history of the
//   // calibration procedure template, AND everything actually stored in
//   // this job number's Cloudinary folder (equipment photos + uploaded
//   // documents — same data JobFolderModal's standalone "Open Folder"
//   // shows, via GET /api/uploads/job-folder/:jobNumber/files), since the
//   // template now cycles through repeated download -> edit -> re-upload
//   // steps as the job moves through each process stage.
//   const [showViewFiles, setShowViewFiles] = useState(false);
//   const [templateVersionHistory, setTemplateVersionHistory] = useState([]);
//   const [isLoadingFileHistory, setIsLoadingFileHistory] = useState(false);

//   const [jobFiles, setJobFiles] = useState([]);
//   const [isLoadingJobFiles, setIsLoadingJobFiles] = useState(false);
//   const [jobFilesError, setJobFilesError] = useState("");

//   const fetchJobFiles = async () => {
//     if (!form.jobNumber) {
//       setJobFiles([]);
//       return;
//     }
//     setIsLoadingJobFiles(true);
//     setJobFilesError("");
//     try {
//       const res = await fetch(
//         `/api/uploads/job-folder/${encodeURIComponent(form.jobNumber)}/files`,
//       );
//       const data = await res.json();
//       if (res.ok && data.success !== false) {
//         setJobFiles(data.files || []);
//       } else {
//         setJobFilesError(data.message || "Failed to load job folder files.");
//       }
//     } catch (err) {
//       console.error("Failed to load job folder files:", err);
//       setJobFilesError("Failed to load job folder files.");
//     } finally {
//       setIsLoadingJobFiles(false);
//     }
//   };

//   const handleViewFilesClick = async () => {
//     setShowViewFiles(true);

//     // Fires alongside the template version fetch below rather than
//     // waiting on it — the two lists are independent, so there's no
//     // reason to serialize them.
//     fetchJobFiles();

//     const code =
//       form.calibrationProcedureTemplate?.code || form.calibrationProcedure;
//     if (!code) return;

//     setIsLoadingFileHistory(true);
//     try {
//       // Expected backend contract (see routes/uploadRoutes.js):
//       // GET /api/uploads/templates/versions?code=<code>
//       // -> { success, versions: [{ publicId, code, format, version, uploadedAt, uploadedBy }, ...] }
//       // sorted newest-first.
//       const res = await fetch(
//         `/api/uploads/templates/versions?code=${encodeURIComponent(code)}`,
//       );
//       const data = await res.json();
//       if (res.ok && data.success !== false) {
//         setTemplateVersionHistory(data.versions || []);
//       }
//     } catch (err) {
//       console.error("Failed to load template file history:", err);
//     } finally {
//       setIsLoadingFileHistory(false);
//     }
//   };

//   // --- Re-upload the edited template --------------------------------
//   // Each process stage downloads the current template, edits it
//   // offline, then re-uploads it here as the new current version before
//   // moving to the next stage. Every re-upload creates a new version
//   // (rather than overwriting) so the full edit history stays visible
//   // in View Files.
//   const reuploadInputRef = useRef(null);
//   const [isReuploading, setIsReuploading] = useState(false);
//   // Gates the Update button: the workflow requires the edited template to
//   // be re-uploaded (via handleReuploadFileChange below) at least once
//   // during this session before the job's details can be saved — Update
//   // should never go through on a template that's still the old,
//   // unedited version. Resets to false every time this modal is opened
//   // fresh (it's not persisted onto the job record itself).
//   const [hasReuploadedThisSession, setHasReuploadedThisSession] =
//     useState(false);

//   const handleReuploadClick = () => {
//     if (!form.calibrationProcedure?.trim()) {
//       showError(
//         "Missing Calibration Procedure",
//         "Select or enter a Calibration Procedure before uploading a revised template.",
//       );
//       return;
//     }
//     reuploadInputRef.current?.click();
//   };

//   const handleReuploadFileChange = async (e) => {
//     const file = e.target.files?.[0];
//     e.target.value = ""; // allow re-selecting the same filename next time
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("jobNumber", form.jobNumber);
//     formData.append(
//       "code",
//       form.calibrationProcedureTemplate?.code || form.calibrationProcedure,
//     );
//     if (form.calibrationProcedureTemplate?.publicId) {
//       formData.append(
//         "previousPublicId",
//         form.calibrationProcedureTemplate.publicId,
//       );
//     }

//     setIsReuploading(true);
//     try {
//       // Expected backend contract (see routes/uploadRoutes.js):
//       // POST /api/uploads/templates/reupload (multipart/form-data)
//       // -> { success, template: { publicId, code, format, name, version, uploadedAt, uploadedBy } }
//       const res = await fetch("/api/uploads/templates/reupload", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       if (!res.ok || data.success === false) {
//         throw new Error(data?.message || "Upload failed");
//       }

//       const newVersion = data.template;
//       setForm((prev) => ({
//         ...prev,
//         calibrationProcedureTemplate: newVersion,
//         calibrationProcedure: newVersion?.name || prev.calibrationProcedure,
//       }));
//       setTemplateVersionHistory((prev) => [newVersion, ...prev]);
//       setHasReuploadedThisSession(true);

//       showInfo(
//         "Template Uploaded",
//         newVersion?.version
//           ? `Version ${newVersion.version} of the template has been uploaded and is now the current version.`
//           : "The revised template has been uploaded and is now the current version.",
//       );
//     } catch (err) {
//       console.error("Failed to re-upload template:", err);
//       showError(
//         "Upload Failed",
//         "The revised template could not be uploaded. Please try again.",
//       );
//     } finally {
//       setIsReuploading(false);
//     }
//   };

//   // --- Download the template, filled with this job's data -----------
//   // Gate: requires a calibration procedure AND at least one filled-in
//   // calibration standard cell before a download is allowed. Clicking
//   // without these shows a validation error via the shared ConfirmDialog
//   // instead of silently doing nothing / hiding.
//   //
//   // Unlike the old version (which just opened
//   // buildTemplateDownloadUrl(template) in a new tab), this POSTs the
//   // job's current form data to the backend, which loads the stored
//   // .xlsx template, writes the data into its CDMS input sheet (the
//   // sheet every other tab in the workbook pulls from via formulas), and
//   // streams back the filled copy. That's why this has to go through
//   // fetch + blob + a synthetic <a download> instead of window.open — a
//   // plain GET link can't carry a JSON body.
//   const [isDownloading, setIsDownloading] = useState(false);

//   const handleDownloadClick = async () => {
//     const missing = [];

//     if (!form.calibrationProcedure?.trim()) {
//       missing.push("Calibration Procedure");
//     }

//     const hasStandard = form.calibrationStandards.some((row) =>
//       Object.values(row).some((v) => v?.trim()),
//     );
//     if (!hasStandard) {
//       missing.push("Calibration Standard");
//     }

//     if (missing.length > 0) {
//       showError(
//         "Missing Information",
//         `Please fill out the ${missing.join(" and ")} before downloading the template.`,
//       );
//       return;
//     }

//     const template = form.calibrationProcedureTemplate;
//     if (!template?.publicId) {
//       showError(
//         "Template Not Found",
//         "No downloadable file is linked to this calibration procedure. Please select one from the lookup.",
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
//     const safeJobNumber = (form.jobNumber || "job").replace(/[\\/]/g, "-");
//     const filename = `${safeJobNumber}${ext}`;

//     setIsDownloading(true);
//     try {
//       const res = await fetch("/api/uploads/templates/download-filled", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           publicId: template.publicId,
//           filename,
//           jobData: {
//             jobNumber: form.jobNumber,
//             companyName: form.companyName,
//             companyAddress: form.companyAddress,
//             description: form.description,
//             brand: form.brand,
//             model: form.model,
//             serialNo: form.serialNo,
//             dateRec: form.dateRec,
//             dateCal: form.dateCal,
//             dateDue: form.dateDue,
//             contactCert: form.contactCert,
//             oicBy: form.oicBy,
//             sig: form.sig,
//             calibrationStandards: form.calibrationStandards,
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

//   return createPortal(
//     <div className="icd-modal-overlay" onClick={handleExitClick}>
//       <div className="icd-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         <CdmsModalHeader
//           title={title}
//           subtitleBottom={form.companyName}
//           onClose={handleExitClick}
//         />

//         <div className="icd-modal-scroll">
//           <div className="icd-body">
//             <div className="icd-col icd-col-left">
//               <div className="icd-field">
//                 <label>Company</label>
//                 <textarea
//                   name="companyName"
//                   value={form.companyName}
//                   onChange={handleChange}
//                   rows={3}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Description</label>
//                 <div className="icd-input-with-btn">
//                   <textarea
//                     name="description"
//                     value={form.description}
//                     onChange={handleChange}
//                     rows={3}
//                   />
//                   <button type="button" className="icd-lookup-btn">
//                     🔍
//                   </button>
//                 </div>
//               </div>

//               <div className="icd-field">
//                 <label>Brand</label>
//                 <input
//                   type="text"
//                   name="brand"
//                   value={form.brand}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Model</label>
//                 <input
//                   type="text"
//                   name="model"
//                   value={form.model}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Serial No.</label>
//                 <input
//                   type="text"
//                   name="serialNo"
//                   value={form.serialNo}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Remarks</label>
//                 <textarea
//                   name="remarks"
//                   value={form.remarks}
//                   onChange={handleChange}
//                   rows={2}
//                 />
//               </div>
//             </div>

//             <div className="icd-col icd-col-mid">
//               <div className="icd-inline-field">
//                 <label>OIC</label>
//                 <input type="text" value={form.oicBy} disabled />
//               </div>

//               <div className="icd-inline-field">
//                 <label>SIG</label>
//                 <select name="sig" value={form.sig} onChange={handleChange}>
//                   <option value="">-- Select --</option>
//                   <option>MCJ</option>
//                 </select>
//               </div>

//               <div className="icd-inline-field">
//                 <label>Frequency</label>
//                 <select
//                   name="frequency"
//                   value={form.frequency}
//                   onChange={handleChange}
//                 >
//                   <option>6 Months</option>
//                   <option>1 Year</option>
//                   <option>2 Years</option>
//                   <option>3 Years</option>
//                 </select>
//               </div>

//               <div className="icd-inline-field">
//                 <label>Con Cert</label>
//                 <select
//                   name="contactCert"
//                   value={form.contactCert}
//                   onChange={handleChange}
//                 >
//                   <option value="">-- Select --</option>
//                   {contactCertOptions.map((opt) => (
//                     <option key={opt} value={opt}>
//                       {opt}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="icd-field">
//                 <label>Uncertainty</label>
//                 <textarea
//                   name="uncertainty"
//                   value={form.uncertainty}
//                   onChange={handleChange}
//                   rows={2}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Range</label>
//                 <textarea
//                   name="range"
//                   value={form.range}
//                   onChange={handleChange}
//                   rows={3}
//                 />
//               </div>

//               <div className="icd-field">
//                 <label>Concern</label>
//                 <textarea
//                   name="concern"
//                   value={form.concern}
//                   onChange={handleChange}
//                   rows={3}
//                 />
//               </div>
//             </div>

//             <div className="icd-col icd-col-dates">
//               <div className="icd-inline-field">
//                 <label>Date Cal</label>
//                 <input
//                   type="date"
//                   name="dateCal"
//                   value={form.dateCal}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-inline-field">
//                 <label>Date Due</label>
//                 <input
//                   type="date"
//                   name="dateDue"
//                   value={form.dateDue}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-inline-field">
//                 <label>Priority</label>
//                 <select
//                   name="priority"
//                   value={form.priority}
//                   onChange={handleChange}
//                 >
//                   <option>Normal</option>
//                   <option>Rush</option>
//                   <option>On Hold</option>
//                 </select>
//               </div>
//             </div>

//             <div className="icd-col icd-col-image">
//               <div className="icd-meta-row">
//                 <label>Job Number</label>
//                 <input type="text" value={form.jobNumber} disabled />
//               </div>
//               <div className="icd-meta-row">
//                 <label>Date Received</label>
//                 <input
//                   type="text"
//                   name="dateRec"
//                   value={form.dateRec}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="icd-image-viewer">
//                 {form.photoUrl ? (
//                   <img src={form.photoUrl} alt="Unit" />
//                 ) : (
//                   <div className="icd-image-placeholder">No Image</div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="icd-mid-section">
//             <div className="icd-accreditation-box">
//               <div className="icd-box-title">Accreditation Logo</div>
//               <label className="icd-radio-label">
//                 <input
//                   type="radio"
//                   name="accreditationLogo"
//                   value="with"
//                   checked={form.accreditationLogo === "with"}
//                   onChange={handleChange}
//                 />{" "}
//                 With PAB Logo
//               </label>
//               <label className="icd-radio-label">
//                 <input
//                   type="radio"
//                   name="accreditationLogo"
//                   value="none"
//                   checked={form.accreditationLogo === "none"}
//                   onChange={handleChange}
//                 />{" "}
//                 No PAB Logo
//               </label>
//             </div>

//             <div className="icd-procedure-box">
//               <div className="icd-box-title">Calibration Procedure :</div>
//               <div className="icd-procedure-row">
//                 <input
//                   type="text"
//                   name="calibrationProcedure"
//                   value={form.calibrationProcedure}
//                   onChange={handleChange}
//                   className="icd-procedure-input"
//                 />
//                 <div className="icd-procedure-btn-col">
//                   <button
//                     type="button"
//                     className="icd-lookup-btn"
//                     onClick={openProcedureLookup}
//                   >
//                     🔍
//                   </button>
//                   <button
//                     type="button"
//                     className="icd-download-btn"
//                     onClick={handleDownloadClick}
//                     disabled={isDownloading}
//                     title="Download the selected calibration procedure template, filled with this job's data"
//                   >
//                     {isDownloading ? "Preparing..." : "⬇ Download"}
//                   </button>
//                   <button
//                     type="button"
//                     className="icd-reupload-btn"
//                     onClick={handleReuploadClick}
//                     disabled={isReuploading}
//                     title="Upload the edited template as the new current version"
//                   >
//                     {isReuploading ? "Uploading..." : "⤴ Re-upload"}
//                   </button>
//                   <input
//                     type="file"
//                     ref={reuploadInputRef}
//                     className="icd-hidden-file-input"
//                     onChange={handleReuploadFileChange}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="icd-standard-section">
//             <div className="icd-box-title">Calibration Standard</div>
//             <div className="icd-standard-grid">
//               {(() => {
//                 const columns = ["item1", "item2", "item3"];
//                 const flatValues = form.calibrationStandards.flatMap((row) =>
//                   columns.map((col) => row[col]),
//                 );

//                 return form.calibrationStandards.map((row, idx) => (
//                   <div className="icd-standard-row" key={idx}>
//                     {columns.map((col, colIdx) => {
//                       const flatIndex = idx * columns.length + colIdx;
//                       const isLocked =
//                         flatIndex > 0 && !flatValues[flatIndex - 1]?.trim();
//                       return (
//                         <div className="icd-standard-cell" key={col}>
//                           <input
//                             type="text"
//                             value={row[col]}
//                             disabled={isLocked}
//                             onChange={(e) =>
//                               handleStandardChange(idx, col, e.target.value)
//                             }
//                           />
//                           <button
//                             type="button"
//                             className="icd-lookup-btn"
//                             disabled={isLocked}
//                             onClick={() => openStandardLookup(idx, col)}
//                           >
//                             🔍
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ));
//               })()}
//             </div>
//           </div>

//           <div className="icd-footer">
//             <div className="icd-footer-left">
//               <button type="button" onClick={handleOpenCamera}>
//                 Open Camera
//               </button>
//               <button type="button" onClick={handleViewFilesClick}>
//                 View Files
//               </button>
//             </div>
//             <div className="icd-footer-right">
//               <button type="button">Job Number With Concern</button>
//               <button
//                 type="button"
//                 className="icd-update-btn"
//                 onClick={handleUpdateClick}
//                 disabled={!hasReuploadedThisSession}
//                 title={
//                   hasReuploadedThisSession
//                     ? undefined
//                     : "Re-upload the edited calibration procedure template before updating"
//                 }
//               >
//                 Update
//               </button>
//               <button type="button" onClick={handleExitClick}>
//                 Exit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {standardLookupTarget && (
//         <CalibrationStandardLookupModal
//           onCancel={() => setStandardLookupTarget(null)}
//           onUseStandard={handleUseStandard}
//         />
//       )}
//       {showProcedureLookup && (
//         <CalibrationProcedureLookupModal
//           onCancel={() => setShowProcedureLookup(false)}
//           onSelectTemplate={handleSelectTemplate}
//         />
//       )}
//       {showViewFiles && (
//         <JobFilesModal
//           jobNumber={form.jobNumber}
//           onClose={() => setShowViewFiles(false)}
//           photoUrl={form.photoUrl}
//           jobFiles={jobFiles}
//           isLoadingJobFiles={isLoadingJobFiles}
//           jobFilesError={jobFilesError}
//           templateVersionHistory={templateVersionHistory}
//           isLoadingFileHistory={isLoadingFileHistory}
//           currentTemplatePublicId={form.calibrationProcedureTemplate?.publicId}
//           buildTemplateDownloadUrl={buildTemplateDownloadUrl}
//         />
//       )}

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
//     </div>,
//     document.body,
//   );
// };

// export default IncomingCalibDetailsModal;
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./IncomingCalibDetailsModal.css";
import CdmsModalHeader from "./CdmsModalHeader";
import CalibrationStandardLookupModal from "./CalibrationStandardLookUpModal";
import CalibrationProcedureLookupModal from "./CalibrationProcedureLookuPModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import JobFilesModal from "./JobFilesModal";

// Base backend URL — every /api/... fetch in this file must be prefixed
// with this (same pattern as OnGoingCalib.jsx / JobReceipt.jsx), or the
// request goes to the frontend's own origin (e.g. the Vite dev server)
// instead of the actual backend, and 404s with "Cannot POST /api/..."
// whenever the two aren't on the same host/port.
const API = import.meta.env.VITE_API_URL;

const ROW_COUNT = 5;

const emptyStandardRow = () => ({ item1: "", item2: "", item3: "" });

const CONTACT_CERT_OPTIONS = ["SA", "JPR", "MCJ"];

const FREQUENCY_MONTHS = {
  "6 Months": 6,
  "1 Year": 12,
  "2 Years": 24,
  "3 Years": 36,
};

const toISODate = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const addMonths = (isoDateStr, months) => {
  const d = new Date(isoDateStr);
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
};

// Builds the URL for the backend's raw template-download proxy route (see
// routes/uploadRoutes.js -> GET /api/uploads/templates/download). Needs
// the template's Cloudinary publicId, which only exists once a template
// has actually been picked via CalibrationProcedureLookupModal.
//
// This is the UNFILLED, as-stored copy of whatever publicId is passed in
// — still used by JobFilesModal's file-list downloads (raw copies of
// this job's own saved calibration-procedure files, or the master, as
// stored — an audit trail, not something that should have job data
// stamped into it). The Download button in this modal uses
// handleDownloadClick below instead, which POSTs to a separate route
// that both resolves the right base file AND fills in the job's data.
const buildTemplateDownloadUrl = (template) => {
  if (!template?.publicId) return null;
  const filename = template.format
    ? `${template.code}.${template.format}`
    : template.code;
  return `${API}/api/uploads/templates/download?publicId=${encodeURIComponent(
    template.publicId,
  )}&filename=${encodeURIComponent(filename)}`;
};

const IncomingCalibDetailsModal = ({
  jobForm,
  onClose,
  onUpdate,
  onOpenCamera,
  onLoadTemplate,
  onLoadAndConnect,
  onOpenCalProcedureLookup,
  onOpenCalStandardLookup,
  title = "INCOMING CALIBRATION DETAILS",
  // Appended to the downloaded filled-template filename, e.g.
  // "SSS-0001-26 - On-Going Calib.xlsx". Left blank by default so
  // Incoming Calibration's downloads keep their original plain
  // job-number filename. Each stage's parent component passes its own
  // label in (see OnGoingCalib.jsx).
  downloadLabel = "",
}) => {
  const [form, setForm] = useState(() => ({
    jobNumber: jobForm.jobNumber || "",
    dateRec: jobForm.dateRec || "",
    companyName: jobForm.companyName || "",
    // Company address lives on the job receipt record, not entered here
    // — carried through so the filled-template download can stamp the
    // CDMS sheet's COMPANY ADDRESS cell with it.
    companyAddress: jobForm.companyAddress || "",
    description: jobForm.description || "",
    brand: jobForm.brand || "",
    model: jobForm.model || "",
    serialNo: jobForm.serialNo || "",
    remarks: jobForm.remarks || "",
    concern: jobForm.concern || "",
    range: jobForm.range || "",
    uncertainty: jobForm.uncertainty || "",
    contactCert: jobForm.contactCert || "",
    frequency: jobForm.frequency || "1 Year",
    priority: jobForm.priority || "Normal",
    oicBy: sessionStorage.getItem("username") || "",

    sig: jobForm.sig || "",
    dateCal: jobForm.dateCal || toISODate(new Date()),
    dateDue: jobForm.dateDue || "",
    accreditationLogo: jobForm.accreditationLogo || "with",
    calibrationProcedure: jobForm.calibrationProcedure || "",
    // Full template record (publicId, code, format, fileUrl, etc.) for
    // whatever was picked via the lookup modal — this always identifies
    // the CANONICAL MASTER, never a job-scoped re-upload. Re-uploading
    // (see handleReuploadFileChange below) intentionally does NOT touch
    // this — it only ever saves a copy scoped to this job, and the
    // backend resolves which base file to fill on Download without
    // needing this field repointed. Kept around so the lookup modal and
    // the procedure text field stay accurate.
    calibrationProcedureTemplate: jobForm.calibrationProcedureTemplate || null,
    calibrationStandards:
      jobForm.calibrationStandards?.length === ROW_COUNT
        ? jobForm.calibrationStandards
        : Array.from({ length: ROW_COUNT }, emptyStandardRow),
    photoUrl: jobForm.photoUrl || "",
  }));

  // Label used to name this stage's re-uploaded template copy in the
  // job's own Cloudinary folder, e.g. "SSS-0001-26 - Incoming Calib.xlsx"
  // or "SSS-0001-26 - On-Going Calib.xlsx" for later stages. Falls back
  // to "Incoming Calib" when the parent screen doesn't pass a
  // downloadLabel (which stays blank by default for this stage so the
  // *download* filename remains unchanged/backwards-compatible) — the
  // re-upload save name still needs SOME stage label, so it defaults
  // here instead.
  const stageLabel = downloadLabel || "Incoming Calib";

  useEffect(() => {
    if (!form.dateCal) return;
    const months = FREQUENCY_MONTHS[form.frequency] ?? 12;
    const computedDue = addMonths(form.dateCal, months);
    setForm((prev) =>
      prev.dateDue === computedDue ? prev : { ...prev, dateDue: computedDue },
    );
  }, [form.dateCal, form.frequency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStandardChange = (rowIndex, columnKey, value) => {
    setForm((prev) => {
      const next = [...prev.calibrationStandards];
      next[rowIndex] = { ...next[rowIndex], [columnKey]: value };
      return { ...prev, calibrationStandards: next };
    });
  };

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

  // Validation-style dialog — just an OK button, no Cancel, since
  // there's nothing to confirm/undo, only something to acknowledge.
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

  // Acknowledgment dialog for successful actions (e.g. a completed
  // re-upload) — OK only, no Cancel, and not styled as danger/error.
  const showInfo = (title, message) => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm: hideDialog,
      onCancel: null,
      confirmLabel: "OK",
      cancelLabel: "Cancel",
      type: "default",
    });
  };

  const handleUpdateClick = () => {
    if (!hasReuploadedThisSession) {
      showError(
        "Re-upload Required",
        "You must re-upload the edited calibration procedure template before you can update this job. Use the Re-upload button next to Calibration Procedure.",
      );
      return;
    }

    showConfirm(
      "Confirm Update",
      `Are you sure you want to update Job Number ${form.jobNumber}? This will save the calibration details you've entered.`,
      () => {
        hideDialog();
        onUpdate?.(form);
      },
      "default",
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

  const [standardLookupTarget, setStandardLookupTarget] = useState(null);

  const openStandardLookup = (rowIndex, columnKey) => {
    setStandardLookupTarget({ rowIndex, columnKey });
    onOpenCalStandardLookup?.(rowIndex, columnKey);
  };

  const handleUseStandard = (standardRecord) => {
    if (!standardLookupTarget) return;
    handleStandardChange(
      standardLookupTarget.rowIndex,
      standardLookupTarget.columnKey,
      standardRecord.code,
    );
    setStandardLookupTarget(null);
  };

  const [showProcedureLookup, setShowProcedureLookup] = useState(false);

  const openProcedureLookup = () => {
    setShowProcedureLookup(true);
    onOpenCalProcedureLookup?.();
  };

  const handleSelectTemplate = (template) => {
    // Selecting a template fills the text field AND keeps the full
    // template record around (publicId etc.) so the Download button
    // below can identify the right procedure code, and the lookup list
    // stays accurate.
    setForm((prev) => ({
      ...prev,
      calibrationProcedure: template.name,
      calibrationProcedureTemplate: template,
    }));
    setShowProcedureLookup(false);
  };

  // Recovers calibrationProcedureTemplate for records that only have the
  // plain text code saved (e.g. typed by hand, or saved before this
  // field existed) — without this, Download has no `code` to search
  // with. Runs once, only when there's a code to match but no template
  // object already attached to it.
  useEffect(() => {
    if (form.calibrationProcedureTemplate || !form.calibrationProcedure) {
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API}/api/uploads/templates`);
        const data = await res.json();
        if (cancelled || !res.ok || data.success === false) return;

        const match = (data.templates || []).find(
          (t) =>
            t.code?.toLowerCase() === form.calibrationProcedure.toLowerCase(),
        );
        if (match) {
          setForm((prev) =>
            prev.calibrationProcedureTemplate
              ? prev
              : { ...prev, calibrationProcedureTemplate: match },
          );
        }
      } catch (err) {
        console.error("Failed to recover calibration procedure template:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCamera = async () => {
    const result = await onOpenCamera?.();
    if (result) setForm((prev) => ({ ...prev, photoUrl: result }));
  };

  const contactCertOptions = CONTACT_CERT_OPTIONS.includes(form.contactCert)
    ? CONTACT_CERT_OPTIONS
    : [form.contactCert, ...CONTACT_CERT_OPTIONS].filter(Boolean);

  // --- View Files modal --------------------------------------------
  // Lists the job's unit photo AND everything actually stored in this
  // job number's Cloudinary folder (equipment photos, uploaded
  // documents, and each stage's own re-uploaded calibration procedure
  // copy), via GET /api/uploads/job-folder/:jobNumber/files. This is the
  // same data JobFolderModal's standalone "Open Folder" shows.
  //
  // There's no separate template "version history" list anymore: since
  // re-uploads save directly into this job's own folder (named
  // "<jobNumber> - <stage>", overwritten per-stage on each re-upload
  // rather than accumulating), every stage's saved copy already shows up
  // in jobFiles below without a dedicated fetch — this is also how a
  // person can see all of a job's re-uploaded versions at once, even
  // though Download itself (see handleDownloadClick) only ever pulls the
  // single most recent one automatically.
  const [showViewFiles, setShowViewFiles] = useState(false);

  const [jobFiles, setJobFiles] = useState([]);
  const [isLoadingJobFiles, setIsLoadingJobFiles] = useState(false);
  const [jobFilesError, setJobFilesError] = useState("");

  const fetchJobFiles = async () => {
    if (!form.jobNumber) {
      setJobFiles([]);
      return;
    }
    setIsLoadingJobFiles(true);
    setJobFilesError("");
    try {
      const res = await fetch(
        `${API}/api/uploads/job-folder/${encodeURIComponent(form.jobNumber)}/files`,
      );
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setJobFiles(data.files || []);
      } else {
        setJobFilesError(data.message || "Failed to load job folder files.");
      }
    } catch (err) {
      console.error("Failed to load job folder files:", err);
      setJobFilesError("Failed to load job folder files.");
    } finally {
      setIsLoadingJobFiles(false);
    }
  };

  const handleViewFilesClick = async () => {
    setShowViewFiles(true);
    fetchJobFiles();
  };

  // --- Re-upload the edited template --------------------------------
  // Each process stage downloads the current template, edits it
  // offline, then re-uploads it here as the new current version before
  // moving to the next stage.
  //
  // A re-upload saves ONE file scoped to THIS job number, named
  // "<jobNumber> - <stageLabel>" (e.g. "SSS-0001-26 - Incoming
  // Calib.xlsx") — re-uploading again for the same job+stage overwrites
  // that same file rather than accumulating a history.
  //
  // IMPORTANT: this does NOT touch the canonical master template in
  // Cloudinary's templates-for-calibration folder — that file is
  // maintained by hand and must always stay the pristine blank form
  // shown in the calibration procedure lookup list. Instead, Download
  // (see handleDownloadClick below) automatically finds and uses this
  // job's latest re-upload across ALL stages on its own, so nothing here
  // needs to update calibrationProcedureTemplate/publicId for Download
  // to work correctly.
  const reuploadInputRef = useRef(null);
  const [isReuploading, setIsReuploading] = useState(false);
  // Gates the Update button: the workflow requires the edited template to
  // be re-uploaded (via handleReuploadFileChange below) at least once
  // during this session before the job's details can be saved — Update
  // should never go through on a template that's still the old,
  // unedited version. Resets to false every time this modal is opened
  // fresh (it's not persisted onto the job record itself).
  const [hasReuploadedThisSession, setHasReuploadedThisSession] =
    useState(false);

  const handleReuploadClick = () => {
    if (!form.calibrationProcedure?.trim()) {
      showError(
        "Missing Calibration Procedure",
        "Select or enter a Calibration Procedure before uploading a revised template.",
      );
      return;
    }
    reuploadInputRef.current?.click();
  };

  const handleReuploadFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same filename next time
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobNumber", form.jobNumber);
    formData.append(
      "code",
      form.calibrationProcedureTemplate?.code || form.calibrationProcedure,
    );
    // Stage label for naming the job-scoped saved copy, e.g.
    // "Incoming Calib" or "On-Going Calib" — see stageLabel above.
    formData.append("stageLabel", stageLabel);

    setIsReuploading(true);
    try {
      // Expected backend contract (see routes/uploadRoutes.js):
      // POST /api/uploads/templates/reupload (multipart/form-data)
      // -> { success, template: { code, format, savedAs, jobCopyPublicId, uploadedAt, uploadedBy } }
      // Note there's no canonical publicId in this response anymore —
      // this route only ever saves a copy scoped to this job.
      const res = await fetch(`${API}/api/uploads/templates/reupload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data?.message || "Upload failed");
      }

      const newTemplate = data.template;
      // Deliberately NOT updating calibrationProcedureTemplate or
      // calibrationProcedure here — those identify the canonical master
      // for the lookup list/text field, and this re-upload never
      // touched the master. Download will automatically prefer this
      // job's latest re-upload over the master on its own (see the
      // backend's base-file resolution order), without the form needing
      // to point at it.
      setHasReuploadedThisSession(true);

      showInfo(
        "Template Uploaded",
        newTemplate?.savedAs
          ? `The revised template has been saved for this job as "${newTemplate.savedAs}". Downloads for this job will now use this version.`
          : "The revised template has been saved for this job.",
      );
    } catch (err) {
      console.error("Failed to re-upload template:", err);
      showError(
        "Upload Failed",
        "The revised template could not be uploaded. Please try again.",
      );
    } finally {
      setIsReuploading(false);
    }
  };

  // --- Download the template, filled with this job's data -----------
  // Gate: requires a calibration procedure AND at least one filled-in
  // calibration standard cell before a download is allowed. Clicking
  // without these shows a validation error via the shared ConfirmDialog
  // instead of silently doing nothing / hiding.
  //
  // POSTs the job's current form data (plus the procedure `code` and
  // `jobNumber`) to the backend, which resolves the right BASE file to
  // fill — this job's latest re-upload across all stages if one exists,
  // otherwise the untouched canonical master — loads it with ExcelJS,
  // writes the data into its CDMS input sheet (the sheet every other tab
  // in the workbook pulls from via formulas), and streams back the
  // filled copy. That's why this has to go through fetch + blob + a
  // synthetic <a download> instead of window.open — a plain GET link
  // can't carry a JSON body.
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = async () => {
    const missing = [];

    if (!form.calibrationProcedure?.trim()) {
      missing.push("Calibration Procedure");
    }

    const hasStandard = form.calibrationStandards.some((row) =>
      Object.values(row).some((v) => v?.trim()),
    );
    if (!hasStandard) {
      missing.push("Calibration Standard");
    }

    if (missing.length > 0) {
      showError(
        "Missing Information",
        `Please fill out the ${missing.join(" and ")} before downloading the template.`,
      );
      return;
    }

    const template = form.calibrationProcedureTemplate;
    // The backend resolves the actual base file itself (this job's
    // latest re-upload, else the canonical master) — it just needs a
    // procedure `code` to search with. `template.publicId` is sent too,
    // as a last-resort fallback only, but is no longer required, since a
    // hand-typed procedure code with no matched template record should
    // still be able to search by code.
    const code = template?.code || form.calibrationProcedure?.trim();
    if (!code) {
      showError(
        "Template Not Found",
        "No calibration procedure code is set. Please select one from the lookup.",
      );
      return;
    }

    // Filename is the job number, not the template's code — e.g.
    // "SSS-0001-26.xlsx" instead of "SSS-CP-020.xlsx". Slashes are
    // swapped for dashes since job numbers are often formatted like
    // "SSS/0001/26", and a raw "/" would both break the filename and
    // corrupt the Content-Disposition header. Extension defaults to
    // .xlsx (the only format ExcelJS/the backend can actually fill)
    // when there's no matched template record to read a format from.
    //
    // downloadLabel (passed in per-stage by the parent screen, e.g.
    // "On-Going Calib") is appended after the job number so each stage's
    // download is distinguishable, e.g. "SSS-0001-26 - On-Going Calib.xlsx".
    // Left blank for stages that don't pass one (e.g. Incoming
    // Calibration), which keeps their filenames exactly as before.
    const ext = template?.format ? `.${template.format}` : ".xlsx";
    const safeJobNumber = (form.jobNumber || "job").replace(/[\\/]/g, "-");
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
          publicId: template?.publicId,
          code,
          filename,
          jobData: {
            jobNumber: form.jobNumber,
            companyName: form.companyName,
            companyAddress: form.companyAddress,
            description: form.description,
            brand: form.brand,
            model: form.model,
            serialNo: form.serialNo,
            dateRec: form.dateRec,
            dateCal: form.dateCal,
            dateDue: form.dateDue,
            contactCert: form.contactCert,
            oicBy: form.oicBy,
            sig: form.sig,
            calibrationStandards: form.calibrationStandards,
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

  return createPortal(
    <div className="icd-modal-overlay" onClick={handleExitClick}>
      <div className="icd-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title={title}
          subtitleBottom={form.companyName}
          onClose={handleExitClick}
        />

        <div className="icd-modal-scroll">
          <div className="icd-body">
            <div className="icd-col icd-col-left">
              <div className="icd-field">
                <label>Company</label>
                <textarea
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="icd-field">
                <label>Description</label>
                <div className="icd-input-with-btn">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                  <button type="button" className="icd-lookup-btn">
                    🔍
                  </button>
                </div>
              </div>

              <div className="icd-field">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-field">
                <label>Model</label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-field">
                <label>Serial No.</label>
                <input
                  type="text"
                  name="serialNo"
                  value={form.serialNo}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-field">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            <div className="icd-col icd-col-mid">
              <div className="icd-inline-field">
                <label>OIC</label>
                <input type="text" value={form.oicBy} disabled />
              </div>

              <div className="icd-inline-field">
                <label>SIG</label>
                <select name="sig" value={form.sig} onChange={handleChange}>
                  <option value="">-- Select --</option>
                  <option>MCJ</option>
                </select>
              </div>

              <div className="icd-inline-field">
                <label>Frequency</label>
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                >
                  <option>6 Months</option>
                  <option>1 Year</option>
                  <option>2 Years</option>
                  <option>3 Years</option>
                </select>
              </div>

              <div className="icd-inline-field">
                <label>Con Cert</label>
                <select
                  name="contactCert"
                  value={form.contactCert}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {contactCertOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="icd-field">
                <label>Uncertainty</label>
                <textarea
                  name="uncertainty"
                  value={form.uncertainty}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              <div className="icd-field">
                <label>Range</label>
                <textarea
                  name="range"
                  value={form.range}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="icd-field">
                <label>Concern</label>
                <textarea
                  name="concern"
                  value={form.concern}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="icd-col icd-col-dates">
              <div className="icd-inline-field">
                <label>Date Cal</label>
                <input
                  type="date"
                  name="dateCal"
                  value={form.dateCal}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-inline-field">
                <label>Date Due</label>
                <input
                  type="date"
                  name="dateDue"
                  value={form.dateDue}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-inline-field">
                <label>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option>Normal</option>
                  <option>Rush</option>
                  <option>On Hold</option>
                </select>
              </div>
            </div>

            <div className="icd-col icd-col-image">
              <div className="icd-meta-row">
                <label>Job Number</label>
                <input type="text" value={form.jobNumber} disabled />
              </div>
              <div className="icd-meta-row">
                <label>Date Received</label>
                <input
                  type="text"
                  name="dateRec"
                  value={form.dateRec}
                  onChange={handleChange}
                />
              </div>

              <div className="icd-image-viewer">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="Unit" />
                ) : (
                  <div className="icd-image-placeholder">No Image</div>
                )}
              </div>
            </div>
          </div>

          <div className="icd-mid-section">
            <div className="icd-accreditation-box">
              <div className="icd-box-title">Accreditation Logo</div>
              <label className="icd-radio-label">
                <input
                  type="radio"
                  name="accreditationLogo"
                  value="with"
                  checked={form.accreditationLogo === "with"}
                  onChange={handleChange}
                />{" "}
                With PAB Logo
              </label>
              <label className="icd-radio-label">
                <input
                  type="radio"
                  name="accreditationLogo"
                  value="none"
                  checked={form.accreditationLogo === "none"}
                  onChange={handleChange}
                />{" "}
                No PAB Logo
              </label>
            </div>

            <div className="icd-procedure-box">
              <div className="icd-box-title">Calibration Procedure :</div>
              <div className="icd-procedure-row">
                <input
                  type="text"
                  name="calibrationProcedure"
                  value={form.calibrationProcedure}
                  onChange={handleChange}
                  className="icd-procedure-input"
                />
                <div className="icd-procedure-btn-col">
                  <button
                    type="button"
                    className="icd-lookup-btn"
                    onClick={openProcedureLookup}
                  >
                    🔍
                  </button>
                  <button
                    type="button"
                    className="icd-download-btn"
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    title="Download the calibration procedure template (this job's latest re-upload if one exists, otherwise the blank master), filled with this job's data"
                  >
                    {isDownloading ? "Preparing..." : "⬇ Download"}
                  </button>
                  <button
                    type="button"
                    className="icd-reupload-btn"
                    onClick={handleReuploadClick}
                    disabled={isReuploading}
                    title="Upload the edited template as this job's current version"
                  >
                    {isReuploading ? "Uploading..." : "⤴ Re-upload"}
                  </button>
                  <input
                    type="file"
                    ref={reuploadInputRef}
                    className="icd-hidden-file-input"
                    onChange={handleReuploadFileChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="icd-standard-section">
            <div className="icd-box-title">Calibration Standard</div>
            <div className="icd-standard-grid">
              {(() => {
                const columns = ["item1", "item2", "item3"];
                const flatValues = form.calibrationStandards.flatMap((row) =>
                  columns.map((col) => row[col]),
                );

                return form.calibrationStandards.map((row, idx) => (
                  <div className="icd-standard-row" key={idx}>
                    {columns.map((col, colIdx) => {
                      const flatIndex = idx * columns.length + colIdx;
                      const isLocked =
                        flatIndex > 0 && !flatValues[flatIndex - 1]?.trim();
                      return (
                        <div className="icd-standard-cell" key={col}>
                          <input
                            type="text"
                            value={row[col]}
                            disabled={isLocked}
                            onChange={(e) =>
                              handleStandardChange(idx, col, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="icd-lookup-btn"
                            disabled={isLocked}
                            onClick={() => openStandardLookup(idx, col)}
                          >
                            🔍
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="icd-footer">
            <div className="icd-footer-left">
              <button type="button" onClick={handleOpenCamera}>
                Open Camera
              </button>
              <button type="button" onClick={handleViewFilesClick}>
                View Files
              </button>
            </div>
            <div className="icd-footer-right">
              <button type="button">Job Number With Concern</button>
              <button
                type="button"
                className="icd-update-btn"
                onClick={handleUpdateClick}
                disabled={!hasReuploadedThisSession}
                title={
                  hasReuploadedThisSession
                    ? undefined
                    : "Re-upload the edited calibration procedure template before updating"
                }
              >
                Update
              </button>
              <button type="button" onClick={handleExitClick}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {standardLookupTarget && (
        <CalibrationStandardLookupModal
          onCancel={() => setStandardLookupTarget(null)}
          onUseStandard={handleUseStandard}
        />
      )}
      {showProcedureLookup && (
        <CalibrationProcedureLookupModal
          onCancel={() => setShowProcedureLookup(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
      {showViewFiles && (
        <JobFilesModal
          jobNumber={form.jobNumber}
          onClose={() => setShowViewFiles(false)}
          photoUrl={form.photoUrl}
          jobFiles={jobFiles}
          isLoadingJobFiles={isLoadingJobFiles}
          jobFilesError={jobFilesError}
          currentTemplatePublicId={form.calibrationProcedureTemplate?.publicId}
          buildTemplateDownloadUrl={buildTemplateDownloadUrl}
        />
      )}

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
  );
};

export default IncomingCalibDetailsModal;
