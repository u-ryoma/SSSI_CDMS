// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { createPortal } from "react-dom";
// import "./IncomingCalibDetailsModal.css";
// import CdmsModalHeader from "./CdmsModalHeader";
// import CalibrationStandardLookupModal from "./CalibrationStandardLookUpModal";
// import CalibrationProcedureLookupModal from "./CalibrationProcedureLookUpModal";
// import ConfirmDialog from "../../components/ConfirmDialog";
// import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";

// // Base backend URL — every /api/... fetch in this file must be prefixed
// // with this (same pattern as OnGoingCalib.jsx / JobReceipt.jsx), or the
// // request goes to the frontend's own origin (e.g. the Vite dev server)
// // instead of the actual backend, and 404s with "Cannot POST /api/..."
// // whenever the two aren't on the same host/port.
// const API = import.meta.env.VITE_API_URL;

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
// const buildTemplateDownloadUrl = (template) => {
//   if (!template?.publicId) return null;
//   const filename = template.format
//     ? `${template.code}.${template.format}`
//     : template.code;
//   return `${API}/api/uploads/templates/download?publicId=${encodeURIComponent(
//     template.publicId,
//   )}&filename=${encodeURIComponent(filename)}`;
// };

// const IncomingCalibDetailsModal = ({
//   jobForm,
//   onClose,
//   onUpdate,
//   onConcernFlagged,
//   onOpenCamera,
//   onLoadTemplate,
//   onLoadAndConnect,
//   onOpenCalProcedureLookup,
//   onOpenCalStandardLookup,
//   title = "INCOMING CALIBRATION DETAILS",
//   downloadLabel = "",
// }) => {
//   const [form, setForm] = useState(() => ({
//     jobNumber: jobForm.jobNumber || "",
//     dateRec: jobForm.dateRec || "",
//     companyName: jobForm.companyName || "",
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
//     calibrationProcedureTemplate: jobForm.calibrationProcedureTemplate || null,
//     calibrationStandards:
//       jobForm.calibrationStandards?.length === ROW_COUNT
//         ? jobForm.calibrationStandards
//         : Array.from({ length: ROW_COUNT }, emptyStandardRow),

//     // PHOTOS — the job may have several equipment photos captured across
//     // sessions (CameraCaptureModal supports multi-shot capture). Prefers
//     // jobForm.photoUrls (the array); falls back to wrapping the older
//     // singular jobForm.photoUrl in a one-item array so records saved
//     // before this change still display their photo. This is only the
//     // INITIAL seed — the useEffect below (fetch job-folder files) tops
//     // this up with every equipment photo saved under this job number
//     // across every stage, not just what jobForm happened to carry.
//     photoUrls: jobForm.photoUrls?.length
//       ? jobForm.photoUrls
//       : jobForm.photoUrl
//         ? [jobForm.photoUrl]
//         : [],
//   }));

//   const stageLabel = downloadLabel || "Incoming Calib";

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

//   // --- Job Number With Concern ---------------------------------------
//   // Flags this job as a concern via the existing PUT /api/jobnumbers/tag
//   // route (same one InstrumentTag.jsx presumably calls to move a job
//   // into Incoming Calibration in the first place). Sending
//   // concernTagged: true here is what the dashboard analytics aggregation
//   // in server.js already reads as the "Concern" stage (tagged: true,
//   // concernTagged: true, ongoingTagged not true) — so this job will show
//   // up in the Incoming Concern list without needing any new backend
//   // route. tagged: true is sent alongside it since this job already
//   // reached Incoming Calibration, so it should already be tagged, but
//   // it's included explicitly rather than assumed.
//   //
//   // concernSource: "calibration" — marks that this concern was flagged
//   // from HERE (Incoming Calibration Details), not straight from
//   // Instrument Tagging, so this job already has a real OIC/SIG on it.
//   // JobDetailsModal / ConcernIncoming.jsx use this to decide whether to
//   // show the OIC/SIG fields. See InstrumentTag.jsx for the other source.
//   //
//   // onConcernFlagged — lets the parent screen (e.g. OnGoingCalib.jsx)
//   // remove this job from ITS list immediately on success, rather than
//   // relying on the parent's next refetch to notice concernTagged flipped
//   // to true. Parents that don't need this (e.g. plain Incoming
//   // Calibration, if it doesn't render concern-tagged jobs anyway) can
//   // simply not pass the prop — it's optional and a no-op if omitted.
//   const [isMarkingConcern, setIsMarkingConcern] = useState(false);

//   const handleMarkAsConcernClick = () => {
//     showConfirm(
//       "Job Number With Concern",
//       `Are you sure you want to flag Job Number ${form.jobNumber} as a concern? It will move to the Incoming Concern list.`,
//       async () => {
//         hideDialog();
//         setIsMarkingConcern(true);
//         try {
//           const res = await fetch(`${API}/api/jobnumbers/tag`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               jobNumber: form.jobNumber,
//               tagged: true,
//               concernTagged: true,
//               concernSource: "calibration",
//               // Without these, the OIC/SIG typed into this form were
//               // never actually persisted to the job document — only
//               // clicking "Update" saved them (via onUpdate), and "Job
//               // Number With Concern" bypasses that entirely. This is
//               // why the Incoming Concern table showed OIC blank even
//               // when it was visibly filled in on screen.
//               oicBy: form.oicBy,
//               sig: form.sig,
//             }),
//           });
//           const data = await res.json();
//           if (!res.ok || data.success === false) {
//             throw new Error(data?.message || "Failed to flag job as concern");
//           }
//           onConcernFlagged?.(form.jobNumber);
//           onClose();
//         } catch (err) {
//           console.error("Failed to mark job as concern:", err);
//           showError(
//             "Update Failed",
//             "This job could not be flagged as a concern. Please try again.",
//           );
//         } finally {
//           setIsMarkingConcern(false);
//         }
//       },
//       "default",
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
//     setForm((prev) => ({
//       ...prev,
//       calibrationProcedure: template.name,
//       calibrationProcedureTemplate: template,
//     }));
//     setShowProcedureLookup(false);
//   };

//   useEffect(() => {
//     if (form.calibrationProcedureTemplate || !form.calibrationProcedure) {
//       return;
//     }
//     let cancelled = false;

//     (async () => {
//       try {
//         const res = await fetch(`${API}/api/uploads/templates`);
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

//   // --- Fetch valid SIG signers (technicians + admins) ----------------
//   // The SIG field is a code (initials) looked up against
//   // calculations!H86:H93 in the downloaded template — it must be one of
//   // the actual technician/admin account usernames, not a fixed value.
//   // GET /api/accounts returns every account with no role filter, so
//   // filter down to role === "technician" OR "admin" here — both roles
//   // are eligible signers (this used to be technician-only, which wrongly
//   // excluded admin accounts from the dropdown even though the backend's
//   // resolved-name lookup and the rest of the system treat admins as
//   // valid signers too). Each option's value is the username (the
//   // initials code the template lookup expects); the label shows the
//   // full name for readability.
//   const [signerOptions, setSignerOptions] = useState([]);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const res = await fetch(`${API}/api/accounts`);
//         const accounts = await res.json();
//         if (cancelled || !Array.isArray(accounts)) return;
//         const eligible = accounts.filter(
//           (u) => u.role === "technician" || u.role === "admin",
//         );
//         setSignerOptions(eligible);
//       } catch (err) {
//         console.error("Failed to fetch signer options:", err);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // --- Fetch ALL equipment photos saved for this job number ----------
//   // jobForm.photoUrls/photoUrl only covers what THIS stage's camera flow
//   // captured. Other stages (e.g. JobNumberModal) may have added more
//   // photos into the same Cloudinary folder
//   // (cdms/job-numbers/<jobNumber>/equipment-photos/). On mount, pull the
//   // job's full file listing — the same GET /job-folder/:jobNumber/files
//   // endpoint ReceiptFolderModal's "View Files" already uses — and merge
//   // in just the photo subset, so the carousel shows every equipment
//   // photo saved under this job number, regardless of which stage
//   // uploaded it, not just this stage's local subset.
//   useEffect(() => {
//     if (!form.jobNumber) return;
//     let cancelled = false;

//     (async () => {
//       try {
//         const res = await fetch(
//           `${API}/api/uploads/job-folder/${encodeURIComponent(form.jobNumber)}/files`,
//         );
//         const data = await res.json();
//         if (cancelled || !res.ok || data.success === false) return;

//         // resourceType is the reliable signal here — Cloudinary image
//         // uploads don't carry their extension in publicId (that's a
//         // separate `format` field, so the old extension regex never
//         // matched), and on Dynamic Folder mode accounts the Search API's
//         // legacy `folder` string can come back empty/inconsistent even
//         // for files that really do live under .../equipment-photos/. The
//         // backend's job-folder/files route already returns resourceType
//         // per file (set at upload time to "image" for equipment photos,
//         // "raw" for PDFs/documents/templates), so filter on that first.
//         const files = data.files || [];
//         const remotePhotoUrls = files
//           .filter(
//             (f) =>
//               f.resourceType === "image" ||
//               f.folder?.includes("/equipment-photos") ||
//               /\.(jpe?g|png|gif|webp)$/i.test(f.publicId || ""),
//           )
//           .map((f) => f.url);

//         if (remotePhotoUrls.length === 0) return;

//         setForm((prev) => {
//           const merged = Array.from(
//             new Set([...prev.photoUrls, ...remotePhotoUrls]),
//           );
//           return merged.length === prev.photoUrls.length
//             ? prev
//             : { ...prev, photoUrls: merged };
//         });
//       } catch (err) {
//         console.error("Failed to fetch job equipment photos:", err);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [form.jobNumber]);

//   // OPEN CAMERA — onOpenCamera is expected to resolve either a single
//   // dataURL/uploaded-URL (older callers) or an ARRAY of them (multi-shot
//   // capture, matching CameraCaptureModal's onCapture(photos) contract).
//   // Either way, results are APPENDED to form.photoUrls rather than
//   // replacing it, so previously captured photos stay in the carousel.
//   const handleOpenCamera = async () => {
//     const result = await onOpenCamera?.();
//     if (!result) return;
//     const newPhotos = Array.isArray(result) ? result : [result];
//     if (newPhotos.length === 0) return;
//     setForm((prev) => ({
//       ...prev,
//       photoUrls: [...prev.photoUrls, ...newPhotos],
//     }));
//     setActivePhotoIndex(form.photoUrls.length); // jump to first newly added photo
//   };

//   const contactCertOptions = CONTACT_CERT_OPTIONS.includes(form.contactCert)
//     ? CONTACT_CERT_OPTIONS
//     : [form.contactCert, ...CONTACT_CERT_OPTIONS].filter(Boolean);

//   // --- Photo carousel (inline, in the icd-image-viewer box) ----------
//   const [activePhotoIndex, setActivePhotoIndex] = useState(0);

//   // Keep the active index in range whenever the photo list changes
//   // (e.g. new photos captured, or a record loads with fewer photos).
//   useEffect(() => {
//     setActivePhotoIndex((i) =>
//       Math.min(i, Math.max(form.photoUrls.length - 1, 0)),
//     );
//   }, [form.photoUrls.length]);

//   const goToPrevPhoto = useCallback(() => {
//     setActivePhotoIndex(
//       (i) => (i - 1 + form.photoUrls.length) % form.photoUrls.length,
//     );
//   }, [form.photoUrls.length]);

//   const goToNextPhoto = useCallback(() => {
//     setActivePhotoIndex((i) => (i + 1) % form.photoUrls.length);
//   }, [form.photoUrls.length]);

//   // --- View Files modal --------------------------------------------
//   const [showViewFiles, setShowViewFiles] = useState(false);

//   const handleViewFilesClick = () => {
//     setShowViewFiles(true);
//   };

//   // --- Re-upload the edited template --------------------------------
//   const reuploadInputRef = useRef(null);
//   const [isReuploading, setIsReuploading] = useState(false);
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
//     e.target.value = "";
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("jobNumber", form.jobNumber);
//     formData.append(
//       "code",
//       form.calibrationProcedureTemplate?.code || form.calibrationProcedure,
//     );
//     formData.append("stageLabel", stageLabel);

//     setIsReuploading(true);
//     try {
//       const res = await fetch(`${API}/api/uploads/templates/reupload`, {
//         method: "POST",
//         body: formData,
//       });
//       const data = await res.json();
//       if (!res.ok || data.success === false) {
//         throw new Error(data?.message || "Upload failed");
//       }

//       const newTemplate = data.template;
//       setHasReuploadedThisSession(true);

//       showInfo(
//         "Template Uploaded",
//         newTemplate?.savedAs
//           ? `The revised template has been saved for this job as "${newTemplate.savedAs}". Downloads for this job will now use this version.`
//           : "The revised template has been saved for this job.",
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
//     const code = template?.code || form.calibrationProcedure?.trim();
//     if (!code) {
//       showError(
//         "Template Not Found",
//         "No calibration procedure code is set. Please select one from the lookup.",
//       );
//       return;
//     }

//     const ext = template?.format ? `.${template.format}` : ".xlsx";
//     const safeJobNumber = (form.jobNumber || "job").replace(/[\\/]/g, "-");
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
//           publicId: template?.publicId,
//           code,
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
//             // The template's OIC/SIG cells (ws!B7/B8) are the acronym
//             // lookup INPUT cells the workbook itself is built around:
//             // calculations!B84/H84 — which Front Page!B55/W55 and Calib
//             // Data 1!B55/W55 both read from — do
//             // MATCH(ws!B7 or ws!B8, ...) against the acronym tables at
//             // calculations!B86:C93 / H86:I93 to resolve the full name.
//             // So we send the acronym (username), NOT the full name,
//             // here: ws ends up showing the initials, and Front Page /
//             // Calib Data 1 end up showing the resolved full name
//             // automatically via that lookup. form.oicBy and form.sig
//             // are already usernames/initials (see the OIC field's
//             // initial state and the SIG <select>'s option values
//             // above), so they're sent through as-is.
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
//                   {signerOptions.map((u) => (
//                     <option key={u.username} value={u.username}>
//                       {u.username} — {u.name}
//                     </option>
//                   ))}
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

//               {/* IMAGE VIEWER — carousel over form.photoUrls (seeded from
//                   jobForm, then topped up with every equipment photo
//                   found under this job number via the job-folder fetch
//                   above). Shows the currently active photo with ‹ › nav
//                   buttons and a counter whenever there's more than one. */}
//               <div
//                 className="icd-image-viewer"
//                 style={{ position: "relative" }}
//               >
//                 {form.photoUrls.length > 0 ? (
//                   <>
//                     <img
//                       src={form.photoUrls[activePhotoIndex]}
//                       alt={`Unit photo ${activePhotoIndex + 1} of ${form.photoUrls.length}`}
//                     />
//                     {form.photoUrls.length > 1 && (
//                       <>
//                         <button
//                           type="button"
//                           onClick={goToPrevPhoto}
//                           title="Previous photo"
//                           style={{
//                             position: "absolute",
//                             top: "50%",
//                             left: 4,
//                             transform: "translateY(-50%)",
//                             width: 28,
//                             height: 28,
//                             borderRadius: "50%",
//                             border: "1px solid #999",
//                             background: "rgba(255,255,255,0.85)",
//                             cursor: "pointer",
//                             fontSize: 14,
//                             lineHeight: 1,
//                           }}
//                         >
//                           &lsaquo;
//                         </button>
//                         <button
//                           type="button"
//                           onClick={goToNextPhoto}
//                           title="Next photo"
//                           style={{
//                             position: "absolute",
//                             top: "50%",
//                             right: 4,
//                             transform: "translateY(-50%)",
//                             width: 28,
//                             height: 28,
//                             borderRadius: "50%",
//                             border: "1px solid #999",
//                             background: "rgba(255,255,255,0.85)",
//                             cursor: "pointer",
//                             fontSize: 14,
//                             lineHeight: 1,
//                           }}
//                         >
//                           &rsaquo;
//                         </button>
//                         <div
//                           style={{
//                             position: "absolute",
//                             bottom: 4,
//                             left: "50%",
//                             transform: "translateX(-50%)",
//                             background: "rgba(0,0,0,0.6)",
//                             color: "#fff",
//                             fontSize: 11,
//                             padding: "1px 6px",
//                             borderRadius: 10,
//                           }}
//                         >
//                           {activePhotoIndex + 1} / {form.photoUrls.length}
//                         </div>
//                       </>
//                     )}
//                   </>
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
//                     title="Download the calibration procedure template (this job's latest re-upload if one exists, otherwise the blank master), filled with this job's data"
//                   >
//                     {isDownloading ? "Preparing..." : "⬇ Download"}
//                   </button>
//                   <button
//                     type="button"
//                     className="icd-reupload-btn"
//                     onClick={handleReuploadClick}
//                     disabled={isReuploading}
//                     title="Upload the edited template as this job's current version"
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
//                 {form.photoUrls.length > 0
//                   ? `Add More Photos (${form.photoUrls.length})`
//                   : "Open Camera"}
//               </button>
//               <button type="button" onClick={handleViewFilesClick}>
//                 View Files
//               </button>
//             </div>
//             <div className="icd-footer-right">
//               <button
//                 type="button"
//                 onClick={handleMarkAsConcernClick}
//                 disabled={isMarkingConcern}
//               >
//                 {isMarkingConcern ? "Flagging..." : "Job Number With Concern"}
//               </button>
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

//       {/* VIEW FILES — Cloudinary-fetched job files, plus this modal's own
//           locally-tracked photoUrls shown as an extra "Unit Photo" section
//           (with its own carousel/lightbox) up top. */}
//       {showViewFiles && (
//         <ReceiptFolderModal
//           jobNumber={form.jobNumber}
//           title="JOB FILES"
//           unitPhotoUrls={form.photoUrls}
//           onClose={() => setShowViewFiles(false)}
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
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "./IncomingCalibDetailsModal.css";
import CdmsModalHeader from "./CdmsModalHeader";
import CalibrationStandardLookupModal from "./CalibrationStandardLookUpModal";
import CalibrationProcedureLookupModal from "./CalibrationProcedureLookUpModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";

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
const buildTemplateDownloadUrl = (template) => {
  if (!template?.publicId) return null;
  const filename = template.format
    ? `${template.code}.${template.format}`
    : template.code;
  return `${API}/api/uploads/templates/download?publicId=${encodeURIComponent(
    template.publicId,
  )}&filename=${encodeURIComponent(filename)}`;
};

// Converts a base64 dataURL (what CameraCaptureModal produces, from
// either canvas.toDataURL or FileReader.readAsDataURL) into a Blob, so it
// can be sent as multipart/form-data to the equipment-photo upload route.
const dataUrlToBlob = async (dataUrl) => {
  const res = await fetch(dataUrl);
  return res.blob();
};

const IncomingCalibDetailsModal = ({
  jobForm,
  onClose,
  onUpdate,
  onConcernFlagged,
  onOpenCamera,
  onLoadTemplate,
  onLoadAndConnect,
  onOpenCalProcedureLookup,
  onOpenCalStandardLookup,
  title = "INCOMING CALIBRATION DETAILS",
  downloadLabel = "",
}) => {
  const [form, setForm] = useState(() => ({
    jobNumber: jobForm.jobNumber || "",
    dateRec: jobForm.dateRec || "",
    companyName: jobForm.companyName || "",
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
    calibrationProcedureTemplate: jobForm.calibrationProcedureTemplate || null,
    calibrationStandards:
      jobForm.calibrationStandards?.length === ROW_COUNT
        ? jobForm.calibrationStandards
        : Array.from({ length: ROW_COUNT }, emptyStandardRow),

    // PHOTOS — the job may have several equipment photos captured across
    // sessions (CameraCaptureModal supports multi-shot capture). Prefers
    // jobForm.photoUrls (the array); falls back to wrapping the older
    // singular jobForm.photoUrl in a one-item array so records saved
    // before this change still display their photo. This is only the
    // INITIAL seed — the useEffect below (fetch job-folder files) tops
    // this up with every equipment photo saved under this job number
    // across every stage, not just what jobForm happened to carry.
    photoUrls: jobForm.photoUrls?.length
      ? jobForm.photoUrls
      : jobForm.photoUrl
        ? [jobForm.photoUrl]
        : [],
  }));

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

  // --- Job Number With Concern ---------------------------------------
  // Flags this job as a concern via the existing PUT /api/jobnumbers/tag
  // route (same one InstrumentTag.jsx presumably calls to move a job
  // into Incoming Calibration in the first place). Sending
  // concernTagged: true here is what the dashboard analytics aggregation
  // in server.js already reads as the "Concern" stage (tagged: true,
  // concernTagged: true, ongoingTagged not true) — so this job will show
  // up in the Incoming Concern list without needing any new backend
  // route. tagged: true is sent alongside it since this job already
  // reached Incoming Calibration, so it should already be tagged, but
  // it's included explicitly rather than assumed.
  //
  // concernSource: "calibration" — marks that this concern was flagged
  // from HERE (Incoming Calibration Details), not straight from
  // Instrument Tagging, so this job already has a real OIC/SIG on it.
  // JobDetailsModal / ConcernIncoming.jsx use this to decide whether to
  // show the OIC/SIG fields. See InstrumentTag.jsx for the other source.
  //
  // onConcernFlagged — lets the parent screen (e.g. OnGoingCalib.jsx)
  // remove this job from ITS list immediately on success, rather than
  // relying on the parent's next refetch to notice concernTagged flipped
  // to true. Parents that don't need this (e.g. plain Incoming
  // Calibration, if it doesn't render concern-tagged jobs anyway) can
  // simply not pass the prop — it's optional and a no-op if omitted.
  const [isMarkingConcern, setIsMarkingConcern] = useState(false);

  const handleMarkAsConcernClick = () => {
    showConfirm(
      "Job Number With Concern",
      `Are you sure you want to flag Job Number ${form.jobNumber} as a concern? It will move to the Incoming Concern list.`,
      async () => {
        hideDialog();
        setIsMarkingConcern(true);
        try {
          const res = await fetch(`${API}/api/jobnumbers/tag`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobNumber: form.jobNumber,
              tagged: true,
              concernTagged: true,
              concernSource: "calibration",
              // Without these, the OIC/SIG typed into this form were
              // never actually persisted to the job document — only
              // clicking "Update" saved them (via onUpdate), and "Job
              // Number With Concern" bypasses that entirely. This is
              // why the Incoming Concern table showed OIC blank even
              // when it was visibly filled in on screen.
              oicBy: form.oicBy,
              sig: form.sig,
            }),
          });
          const data = await res.json();
          if (!res.ok || data.success === false) {
            throw new Error(data?.message || "Failed to flag job as concern");
          }
          onConcernFlagged?.(form.jobNumber);
          onClose();
        } catch (err) {
          console.error("Failed to mark job as concern:", err);
          showError(
            "Update Failed",
            "This job could not be flagged as a concern. Please try again.",
          );
        } finally {
          setIsMarkingConcern(false);
        }
      },
      "default",
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
    setForm((prev) => ({
      ...prev,
      calibrationProcedure: template.name,
      calibrationProcedureTemplate: template,
    }));
    setShowProcedureLookup(false);
  };

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

  // --- Fetch valid SIG signers (technicians + admins) ----------------
  // The SIG field is a code (initials) looked up against
  // calculations!H86:H93 in the downloaded template — it must be one of
  // the actual technician/admin account usernames, not a fixed value.
  // GET /api/accounts returns every account with no role filter, so
  // filter down to role === "technician" OR "admin" here — both roles
  // are eligible signers (this used to be technician-only, which wrongly
  // excluded admin accounts from the dropdown even though the backend's
  // resolved-name lookup and the rest of the system treat admins as
  // valid signers too). Each option's value is the username (the
  // initials code the template lookup expects); the label shows the
  // full name for readability.
  const [signerOptions, setSignerOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/accounts`);
        const accounts = await res.json();
        if (cancelled || !Array.isArray(accounts)) return;
        const eligible = accounts.filter(
          (u) => u.role === "technician" || u.role === "admin",
        );
        setSignerOptions(eligible);
      } catch (err) {
        console.error("Failed to fetch signer options:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Fetch ALL equipment photos saved for this job number ----------
  // jobForm.photoUrls/photoUrl only covers what THIS stage's camera flow
  // captured. Other stages (e.g. JobNumberModal) may have added more
  // photos into the same Cloudinary folder
  // (cdms/job-numbers/<jobNumber>/equipment-photos/). On mount, pull the
  // job's full file listing — the same GET /job-folder/:jobNumber/files
  // endpoint ReceiptFolderModal's "View Files" already uses — and merge
  // in just the photo subset, so the carousel shows every equipment
  // photo saved under this job number, regardless of which stage
  // uploaded it, not just this stage's local subset.
  useEffect(() => {
    if (!form.jobNumber) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${API}/api/uploads/job-folder/${encodeURIComponent(form.jobNumber)}/files`,
        );
        const data = await res.json();
        if (cancelled || !res.ok || data.success === false) return;

        // resourceType is the reliable signal here — Cloudinary image
        // uploads don't carry their extension in publicId (that's a
        // separate `format` field, so the old extension regex never
        // matched), and on Dynamic Folder mode accounts the Search API's
        // legacy `folder` string can come back empty/inconsistent even
        // for files that really do live under .../equipment-photos/. The
        // backend's job-folder/files route already returns resourceType
        // per file (set at upload time to "image" for equipment photos,
        // "raw" for PDFs/documents/templates), so filter on that first.
        const files = data.files || [];
        const remotePhotoUrls = files
          .filter(
            (f) =>
              f.resourceType === "image" ||
              f.folder?.includes("/equipment-photos") ||
              /\.(jpe?g|png|gif|webp)$/i.test(f.publicId || ""),
          )
          .map((f) => f.url);

        if (remotePhotoUrls.length === 0) return;

        setForm((prev) => {
          const merged = Array.from(
            new Set([...prev.photoUrls, ...remotePhotoUrls]),
          );
          return merged.length === prev.photoUrls.length
            ? prev
            : { ...prev, photoUrls: merged };
        });
      } catch (err) {
        console.error("Failed to fetch job equipment photos:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.jobNumber]);

  // OPEN CAMERA — onOpenCamera is expected to resolve either a single
  // dataURL/uploaded-URL (older callers) or an ARRAY of them (multi-shot
  // capture, matching CameraCaptureModal's onCapture(photos) contract).
  //
  // IMPORTANT: what CameraCaptureModal actually hands back are raw
  // base64 dataURLs — nothing has uploaded them to Cloudinary yet. Those
  // dataURLs are NOT stored directly into form.photoUrls (that used to
  // be the bug: photos never made it past local component state, so if
  // the session ended any other way than a successful "Update" — or
  // even after Update, since nothing ever actually persisted them to
  // Cloudinary — the photo just vanished and never showed up in the
  // "View Files" / job-folder listing on the next stage).
  //
  // So each dataURL is uploaded here, immediately, via
  // POST /api/uploads/equipment-photo/:jobNumber (see uploadRoutes.js),
  // and only the URL Cloudinary actually returns is appended to
  // form.photoUrls. That's what makes captured photos survive
  // regardless of what the user does afterwards (Update, Concern, or
  // just closing the modal) — they're already saved server-side the
  // moment they're taken, same as how the template Re-upload button
  // works.
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const handleOpenCamera = async () => {
    const result = await onOpenCamera?.();
    if (!result) return;
    const newDataUrls = Array.isArray(result) ? result : [result];
    if (newDataUrls.length === 0) return;

    if (!form.jobNumber) {
      showError(
        "Missing Job Number",
        "This job has no job number yet, so the photo can't be saved. Please try again once the job number is set.",
      );
      return;
    }

    setIsUploadingPhotos(true);
    try {
      const uploadedUrls = [];
      for (const dataUrl of newDataUrls) {
        const blob = await dataUrlToBlob(dataUrl);
        const formData = new FormData();
        formData.append("photo", blob, `photo_${Date.now()}.jpg`);

        const res = await fetch(
          `${API}/api/uploads/equipment-photo/${encodeURIComponent(form.jobNumber)}`,
          { method: "POST", body: formData },
        );
        const data = await res.json();
        if (!res.ok || data.success === false) {
          throw new Error(data?.message || "Photo upload failed");
        }
        uploadedUrls.push(data.url);
      }

      setForm((prev) => ({
        ...prev,
        photoUrls: [...prev.photoUrls, ...uploadedUrls],
      }));
      setActivePhotoIndex(form.photoUrls.length); // jump to first newly added photo
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

  const contactCertOptions = CONTACT_CERT_OPTIONS.includes(form.contactCert)
    ? CONTACT_CERT_OPTIONS
    : [form.contactCert, ...CONTACT_CERT_OPTIONS].filter(Boolean);

  // --- Photo carousel (inline, in the icd-image-viewer box) ----------
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Keep the active index in range whenever the photo list changes
  // (e.g. new photos captured, or a record loads with fewer photos).
  useEffect(() => {
    setActivePhotoIndex((i) =>
      Math.min(i, Math.max(form.photoUrls.length - 1, 0)),
    );
  }, [form.photoUrls.length]);

  const goToPrevPhoto = useCallback(() => {
    setActivePhotoIndex(
      (i) => (i - 1 + form.photoUrls.length) % form.photoUrls.length,
    );
  }, [form.photoUrls.length]);

  const goToNextPhoto = useCallback(() => {
    setActivePhotoIndex((i) => (i + 1) % form.photoUrls.length);
  }, [form.photoUrls.length]);

  // --- View Files modal --------------------------------------------
  const [showViewFiles, setShowViewFiles] = useState(false);

  const handleViewFilesClick = () => {
    setShowViewFiles(true);
  };

  // --- Re-upload the edited template --------------------------------
  const reuploadInputRef = useRef(null);
  const [isReuploading, setIsReuploading] = useState(false);
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
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobNumber", form.jobNumber);
    formData.append(
      "code",
      form.calibrationProcedureTemplate?.code || form.calibrationProcedure,
    );
    formData.append("stageLabel", stageLabel);

    setIsReuploading(true);
    try {
      const res = await fetch(`${API}/api/uploads/templates/reupload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data?.message || "Upload failed");
      }

      const newTemplate = data.template;
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
    const code = template?.code || form.calibrationProcedure?.trim();
    if (!code) {
      showError(
        "Template Not Found",
        "No calibration procedure code is set. Please select one from the lookup.",
      );
      return;
    }

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
            // The template's OIC/SIG cells (ws!B7/B8) are the acronym
            // lookup INPUT cells the workbook itself is built around:
            // calculations!B84/H84 — which Front Page!B55/W55 and Calib
            // Data 1!B55/W55 both read from — do
            // MATCH(ws!B7 or ws!B8, ...) against the acronym tables at
            // calculations!B86:C93 / H86:I93 to resolve the full name.
            // So we send the acronym (username), NOT the full name,
            // here: ws ends up showing the initials, and Front Page /
            // Calib Data 1 end up showing the resolved full name
            // automatically via that lookup. form.oicBy and form.sig
            // are already usernames/initials (see the OIC field's
            // initial state and the SIG <select>'s option values
            // above), so they're sent through as-is.
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
                  {signerOptions.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.username} — {u.name}
                    </option>
                  ))}
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

              {/* IMAGE VIEWER — carousel over form.photoUrls (seeded from
                  jobForm, then topped up with every equipment photo
                  found under this job number via the job-folder fetch
                  above). Shows the currently active photo with ‹ › nav
                  buttons and a counter whenever there's more than one. */}
              <div
                className="icd-image-viewer"
                style={{ position: "relative" }}
              >
                {form.photoUrls.length > 0 ? (
                  <>
                    <img
                      src={form.photoUrls[activePhotoIndex]}
                      alt={`Unit photo ${activePhotoIndex + 1} of ${form.photoUrls.length}`}
                    />
                    {form.photoUrls.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goToPrevPhoto}
                          title="Previous photo"
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: 4,
                            transform: "translateY(-50%)",
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            border: "1px solid #999",
                            background: "rgba(255,255,255,0.85)",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1,
                          }}
                        >
                          &lsaquo;
                        </button>
                        <button
                          type="button"
                          onClick={goToNextPhoto}
                          title="Next photo"
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: 4,
                            transform: "translateY(-50%)",
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            border: "1px solid #999",
                            background: "rgba(255,255,255,0.85)",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1,
                          }}
                        >
                          &rsaquo;
                        </button>
                        <div
                          style={{
                            position: "absolute",
                            bottom: 4,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            fontSize: 11,
                            padding: "1px 6px",
                            borderRadius: 10,
                          }}
                        >
                          {activePhotoIndex + 1} / {form.photoUrls.length}
                        </div>
                      </>
                    )}
                  </>
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
              <button
                type="button"
                onClick={handleOpenCamera}
                disabled={isUploadingPhotos}
              >
                {isUploadingPhotos
                  ? "Saving Photo..."
                  : form.photoUrls.length > 0
                    ? `Add More Photos (${form.photoUrls.length})`
                    : "Open Camera"}
              </button>
              <button type="button" onClick={handleViewFilesClick}>
                View Files
              </button>
            </div>
            <div className="icd-footer-right">
              <button
                type="button"
                onClick={handleMarkAsConcernClick}
                disabled={isMarkingConcern}
              >
                {isMarkingConcern ? "Flagging..." : "Job Number With Concern"}
              </button>
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

      {/* VIEW FILES — Cloudinary-fetched job files, plus this modal's own
          locally-tracked photoUrls shown as an extra "Unit Photo" section
          (with its own carousel/lightbox) up top. */}
      {showViewFiles && (
        <ReceiptFolderModal
          jobNumber={form.jobNumber}
          title="JOB FILES"
          unitPhotoUrls={form.photoUrls}
          onClose={() => setShowViewFiles(false)}
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
