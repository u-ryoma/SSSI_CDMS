// import React, { useEffect, useState, useCallback } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// // Reused as-is from the Job Receipt flow — it already groups files by
// // job number over a `jobNumbers` array, so a single job is just a
// // one-item array. TODO: confirm this relative path matches where
// // ReceiptFolderModal actually lives in your tree (it's imported as
// // "./ReceiptFolderModal" from AddReceiptModal).
// import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
// // TODO: confirm this relative path matches where CameraCaptureModal
// // actually lives in your tree (mirrors the ReceiptFolderModal import
// // above — adjust if it's not under jobreceipt/).
// import CameraCaptureModal from "../jobreceipt/CameraCaptureModal";
// import "./ConcernInDetailModal.css";

// // Base backend URL — same pattern as IncomingCalibDetailsModal.jsx /
// // OnGoingCalib.jsx / JobReceipt.jsx. Needed here for the job-folder
// // photo fetch below.
// const API = import.meta.env.VITE_API_URL;

// /**
//  * JobDetailsModal
//  *
//  * Reproduces the legacy "JOB NUMBER DETAILS" desktop screen as a modal:
//  * Company / OIC / SIG / Date Cal, Description / Frequency / Priority,
//  * Con Cert / Date Due, Brand / Uncertainty, Model / Range,
//  * Serial No / Concern, Remarks, a photo box, address/contact block,
//  * and the action button row.
//  *
//  * Field mapping notes:
//  * - OIC is populated from `record.oicBy`, the staff member assigned to
//  *   the job. It's intentionally blank for concerns that came straight
//  *   from Instrument Tagging, since oicBy only gets set once a job is
//  *   opened in Incoming Calibration Details.
//  * - Con Cert is populated from `record.contactName` — the company's own
//  *   contact person, who the calibration certificate is addressed to.
//  * - Phone Number and Email Address come from the linked Customer record
//  *   (via the receipt's customerID), not the job receipt itself.
//  * - SIG, Date Cal, Uncertainty, Range, Company Address, Fax Number, VAT
//  *   are not returned by the current /api/jobnumbers + /api/jobreceipts
//  *   merge — they render as "--" until those fields are added to the
//  *   API/record.
//  *
//  * OIC / SIG VISIBILITY — a job's concern can be flagged from two
//  * different places (see concernSource, set server-side by
//  * PUT /api/jobnumbers/tag):
//  *   - "instrumentTag" -> flagged straight from Instrument Tagging's
//  *     "Concern / PIC Taken" checkbox. The job never passed through
//  *     Incoming Calibration Details, so it has no real OIC/SIG yet —
//  *     these fields are hidden entirely rather than shown as "--".
//  *   - "calibration" (or anything else / missing, for jobs saved before
//  *     this field existed) -> flagged via "Job Number With Concern"
//  *     inside Incoming Calibration Details, or the job is on the regular
//  *     Incoming/On-Going Calibration path — OIC/SIG are shown normally.
//  *
//  * PHOTO BOX — now a carousel, same pattern as
//  * IncomingCalibDetailsModal.jsx's icd-image-viewer. Seeded from
//  * record.photoUrl (if present), then topped up on mount with every
//  * equipment photo found under this job number's Cloudinary folder via
//  * GET /api/uploads/job-folder/:jobNumber/files — the same endpoint
//  * ReceiptFolderModal's "View Files" uses — filtered by
//  * resourceType === "image" (NOT the job's `folder` string or a publicId
//  * extension regex: Cloudinary image uploads don't carry their extension
//  * in publicId, and on Dynamic Folder mode accounts the Search API's
//  * `folder` string can come back missing/inconsistent even for real
//  * equipment-photos files — resourceType is the field that's actually
//  * reliable here).
//  *
//  * "View Files" (previously "Open Folder") reuses ReceiptFolderModal —
//  * the same component AddReceiptModal's "Open Folder" uses — passed a
//  * single-item `jobNumbers` array so it fetches and displays just this
//  * job's files via GET /api/uploads/job-folder/:jobNumber/files.
//  *
//  * "Log RWOC" (Return Without Calibration) — only rendered when the
//  * parent passes an `onLogRwoc` handler. Currently that's just
//  * ConcernOutgoing.jsx; every other place this modal is reused (e.g.
//  * ConcernIncoming.jsx) leaves onLogRwoc undefined, so the button simply
//  * doesn't render there — no extra flag needed on this component.
//  */
// const JobDetailsModal = ({
//   record,
//   onClose,
//   onUpdate,
//   onOpenCamera,
//   onPrintAgreement,
//   // Only passed in from ConcernOutgoing.jsx — undefined (and therefore
//   // hidden, see jd-actions-row2 below) everywhere else this modal is
//   // reused, e.g. Incoming Concern.
//   onLogRwoc,
//   // Was hardcoded to "Incoming Concern" — now a prop so ConcernOutgoing
//   // (or any future stage that reuses this same modal) can pass its own
//   // label instead of showing the wrong stage name.
//   subtitleBottom = "Incoming Concern",
// }) => {
//   const [showViewFiles, setShowViewFiles] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);

//   // --- Photo carousel state -------------------------------------------
//   const [photoUrls, setPhotoUrls] = useState(() =>
//     record?.photoUrls?.length
//       ? record.photoUrls
//       : record?.photoUrl
//         ? [record.photoUrl]
//         : [],
//   );
//   const [activePhotoIndex, setActivePhotoIndex] = useState(0);

//   // Keep the active index in range whenever the photo list changes.
//   useEffect(() => {
//     setActivePhotoIndex((i) => Math.min(i, Math.max(photoUrls.length - 1, 0)));
//   }, [photoUrls.length]);

//   const goToPrevPhoto = useCallback(() => {
//     setActivePhotoIndex((i) => (i - 1 + photoUrls.length) % photoUrls.length);
//   }, [photoUrls.length]);

//   const goToNextPhoto = useCallback(() => {
//     setActivePhotoIndex((i) => (i + 1) % photoUrls.length);
//   }, [photoUrls.length]);

//   // Fetch every equipment photo saved for this job number (across all
//   // stages, not just record.photoUrl) and merge into the carousel.
//   useEffect(() => {
//     if (!record?.jobNumber) return;
//     let cancelled = false;

//     (async () => {
//       try {
//         const res = await fetch(
//           `${API}/api/uploads/job-folder/${encodeURIComponent(record.jobNumber)}/files`,
//         );
//         const data = await res.json();
//         if (cancelled || !res.ok || data.success === false) return;

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

//         setPhotoUrls((prev) => {
//           const merged = Array.from(new Set([...prev, ...remotePhotoUrls]));
//           return merged.length === prev.length ? prev : merged;
//         });
//       } catch (err) {
//         console.error("Failed to fetch job equipment photos:", err);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [record?.jobNumber]);

//   useEffect(() => {
//     const onKeyDown = (e) => {
//       if (e.key === "Escape") onClose?.();
//     };
//     document.addEventListener("keydown", onKeyDown);
//     return () => document.removeEventListener("keydown", onKeyDown);
//   }, [onClose]);

//   // CameraCaptureModal hands back an array of dataURLs (one per shot in
//   // the session, batched — see its own onCapture(photos) contract) and
//   // is only called at all if at least one photo was taken. Each one gets
//   // uploaded to this job's equipment-photos Cloudinary folder via the
//   // same POST /api/uploads/equipment-photo/:jobNumber route the rest of
//   // the app uses, then the resulting URLs are merged straight into the
//   // carousel — same pattern as IncomingCalibDetailsModal's
//   // handleOpenCamera, just self-contained here instead of delegated to
//   // a parent-supplied onOpenCamera.
//   const handlePhotosCaptured = async (dataUrls) => {
//     setShowCamera(false);
//     if (!dataUrls?.length) return;

//     if (!record?.jobNumber) {
//       console.error(
//         "Cannot upload equipment photo: job number is missing on this record.",
//       );
//       return;
//     }

//     const uploadedUrls = [];
//     for (const dataUrl of dataUrls) {
//       try {
//         const blob = await (await fetch(dataUrl)).blob();
//         const formData = new FormData();
//         formData.append("photo", blob, `photo_${Date.now()}.jpg`);

//         const res = await fetch(
//           `${API}/api/uploads/equipment-photo/${encodeURIComponent(record.jobNumber)}`,
//           { method: "POST", body: formData },
//         );
//         const data = await res.json();
//         if (res.ok && data.success !== false && data.url) {
//           uploadedUrls.push(data.url);
//         } else {
//           console.error("Equipment photo upload failed:", data);
//         }
//       } catch (err) {
//         console.error("Failed to upload captured photo:", err);
//       }
//     }

//     if (uploadedUrls.length === 0) return;

//     setPhotoUrls((prev) => {
//       const merged = Array.from(new Set([...prev, ...uploadedUrls]));
//       if (merged.length > prev.length) {
//         setActivePhotoIndex(prev.length); // jump to first newly added photo
//       }
//       return merged;
//     });

//     // Let the parent know new photos landed, in case it wants to persist
//     // them onto the job record itself (e.g. alongside the next Update
//     // save) — mirrors what onOpenCamera used to be called with directly.
//     onOpenCamera?.(uploadedUrls);
//   };

//   if (!record) return null;

//   const val = (v) => (v === undefined || v === null || v === "" ? "--" : v);

//   // Only hide OIC/SIG when we know FOR CERTAIN this concern came
//   // straight from Instrument Tagging (no calibration stage yet, so no
//   // real OIC/SIG exists). Any other value — "calibration", undefined,
//   // or a job that isn't a concern at all — shows them as usual.
//   const showOicSig = record.concernSource !== "instrumentTag";

//   const handleOverlayClick = (e) => {
//     if (e.target === e.currentTarget) onClose?.();
//   };

//   return (
//     <div className="jd-modal-overlay" onMouseDown={handleOverlayClick}>
//       <div className="jd-modal">
//         <CdmsModalHeader
//           title="JOB NUMBER DETAILS"
//           subtitleBottom={subtitleBottom}
//           onClose={onClose}
//         />

//         <div className="jd-body">
//           <div className="jd-panel">
//             <div className="jd-top-row">
//               <div className="jd-top-fields">
//                 <div className="jd-field-inline">
//                   <label>Job Number</label>
//                   <div className="jd-input jd-input-static">
//                     {val(record.jobNumber)}
//                   </div>
//                 </div>
//                 <div className="jd-field-inline">
//                   <label>Date Received</label>
//                   <div className="jd-select-like">
//                     <span>{val(record.dateRec)}</span>
//                     <span className="jd-caret">▾</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="jd-main">
//               <div className="jd-grid">
//                 <label className="jd-label" style={{ gridArea: "compLbl" }}>
//                   Company
//                 </label>
//                 <div className="jd-select-like" style={{ gridArea: "compVal" }}>
//                   <span className="jd-ellipsis">{val(record.companyName)}</span>
//                   <span className="jd-caret">▾</span>
//                 </div>

//                 {/* OIC / SIG — hidden entirely for concerns flagged
//                     straight from Instrument Tagging (showOicSig above),
//                     since those jobs never got a real OIC/SIG assigned. */}
//                 {showOicSig && (
//                   <>
//                     <label className="jd-label" style={{ gridArea: "oicLbl" }}>
//                       OIC
//                     </label>
//                     <div
//                       className="jd-select-like"
//                       style={{ gridArea: "oicVal" }}
//                     >
//                       {/* Assigned staff member — stays blank for concerns
//                           that came straight from Instrument Tagging, since
//                           oicBy only gets set once a job is opened in
//                           Incoming Calibration Details. */}
//                       <span>{val(record.oicBy)}</span>
//                       <span className="jd-caret">▾</span>
//                     </div>

//                     <label className="jd-label" style={{ gridArea: "sigLbl" }}>
//                       SIG
//                     </label>
//                     <div
//                       className="jd-select-like"
//                       style={{ gridArea: "sigVal" }}
//                     >
//                       <span>{val(record.sig)}</span>
//                       <span className="jd-caret">▾</span>
//                     </div>
//                   </>
//                 )}

//                 <label className="jd-label" style={{ gridArea: "dcalLbl" }}>
//                   Date Cal
//                 </label>
//                 <div className="jd-select-like" style={{ gridArea: "dcalVal" }}>
//                   <span>{val(record.dateCal)}</span>
//                   <span className="jd-caret">▾</span>
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "descLbl" }}>
//                   Description
//                 </label>
//                 <div
//                   className="jd-input-with-icon"
//                   style={{ gridArea: "descVal" }}
//                 >
//                   <div className="jd-input">{val(record.description)}</div>
//                   <button type="button" className="jd-icon-btn" title="Lookup">
//                     🔍
//                   </button>
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "freqLbl" }}>
//                   Frequency
//                 </label>
//                 <div className="jd-select-like" style={{ gridArea: "freqVal" }}>
//                   <span>{val(record.frequency)}</span>
//                   <span className="jd-caret">▾</span>
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "priLbl" }}>
//                   Priority
//                 </label>
//                 <div className="jd-select-like" style={{ gridArea: "priVal" }}>
//                   <span>{val(record.priority)}</span>
//                   <span className="jd-caret">▾</span>
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "ccertLbl" }}>
//                   Con Cert
//                 </label>
//                 <div
//                   className="jd-input-with-icon"
//                   style={{ gridArea: "ccertVal" }}
//                 >
//                   <div className="jd-select-like">
//                     {/* Who the certificate is addressed to — the
//                         company's own contact person, not a staff field. */}
//                     <span>{val(record.contactName)}</span>
//                     <span className="jd-caret">▾</span>
//                   </div>
//                   <button
//                     type="button"
//                     className="jd-icon-btn"
//                     title="Certificate"
//                   >
//                     🖶
//                   </button>
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "ddueLbl" }}>
//                   Date Due
//                 </label>
//                 <div className="jd-select-like" style={{ gridArea: "ddueVal" }}>
//                   <span>{val(record.eta || record.dateDue)}</span>
//                   <span className="jd-caret">▾</span>
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "brandLbl" }}>
//                   Brand
//                 </label>
//                 <div className="jd-input" style={{ gridArea: "brandVal" }}>
//                   {val(record.brand)}
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "uncLbl" }}>
//                   Uncertainty
//                 </label>
//                 <div className="jd-input" style={{ gridArea: "uncVal" }}>
//                   {val(record.uncertainty)}
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "modelLbl" }}>
//                   Model
//                 </label>
//                 <div className="jd-input" style={{ gridArea: "modelVal" }}>
//                   {val(record.model)}
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "rangeLbl" }}>
//                   Range
//                 </label>
//                 <div className="jd-input" style={{ gridArea: "rangeVal" }}>
//                   {val(record.range)}
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "snLbl" }}>
//                   Serial No.
//                 </label>
//                 <div className="jd-input" style={{ gridArea: "snVal" }}>
//                   {val(record.serialNo)}
//                 </div>

//                 <label
//                   className="jd-label jd-label-top"
//                   style={{ gridArea: "conLbl" }}
//                 >
//                   Concern
//                 </label>
//                 <div className="jd-textarea" style={{ gridArea: "conVal" }}>
//                   {val(record.concern)}
//                 </div>

//                 <label className="jd-label" style={{ gridArea: "remLbl" }}>
//                   Remarks
//                 </label>
//                 <div className="jd-input" style={{ gridArea: "remVal" }}>
//                   {val(record.remarks)}
//                 </div>
//               </div>

//               {/* PHOTO BOX — now a carousel over photoUrls (seeded from
//                   record.photoUrl/photoUrls, then topped up with every
//                   equipment photo found under this job number via the
//                   job-folder fetch above). Shows ‹ › nav buttons and a
//                   counter whenever there's more than one photo. */}
//               <div className="jd-photo-box" style={{ position: "relative" }}>
//                 {photoUrls.length > 0 ? (
//                   <>
//                     <img
//                       src={photoUrls[activePhotoIndex]}
//                       alt={`Unit photo ${activePhotoIndex + 1} of ${photoUrls.length}`}
//                       className="jd-photo-img"
//                     />
//                     {photoUrls.length > 1 && (
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
//                           {activePhotoIndex + 1} / {photoUrls.length}
//                         </div>
//                       </>
//                     )}
//                   </>
//                 ) : (
//                   <div className="jd-photo-placeholder" />
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="jd-field-block">
//             <label>Company Address</label>
//             <div className="jd-textarea jd-textarea-wide">
//               {val(record.companyAddress)}
//             </div>
//           </div>

//           <div className="jd-contact-row">
//             <div className="jd-field-block jd-field-grow">
//               <label>Phone Number</label>
//               <div className="jd-textarea jd-textarea-med">
//                 {val(record.phoneNumber)}
//               </div>
//             </div>
//             <div className="jd-field-block jd-field-narrow">
//               <label>Fax Number</label>
//               <div className="jd-input">{val(record.faxNumber)}</div>
//             </div>
//           </div>

//           <div className="jd-contact-row">
//             <div className="jd-field-block jd-field-grow">
//               <label>Email Address</label>
//               <div className="jd-input">{val(record.email)}</div>
//             </div>
//             <div className="jd-field-block jd-field-narrow">
//               <label>VAT</label>
//               <div className="jd-select-like">
//                 <span>{val(record.vat || "0 VAT")}</span>
//                 <span className="jd-caret">▾</span>
//               </div>
//             </div>
//           </div>

//           <div className="jd-actions">
//             <button
//               type="button"
//               className="jd-btn jd-btn-print"
//               onClick={onPrintAgreement}
//             >
//               Print Agreement
//             </button>
//             <div className="jd-actions-row2">
//               <button
//                 type="button"
//                 className="jd-btn"
//                 onClick={() => setShowCamera(true)}
//               >
//                 Open Camera
//               </button>
//               <button
//                 type="button"
//                 className="jd-btn"
//                 onClick={() => setShowViewFiles(true)}
//               >
//                 View Files
//               </button>

//               {/* Log RWOC — Return Without Calibration. Only rendered
//                   when the parent (ConcernOutgoing.jsx) supplies
//                   onLogRwoc; hidden everywhere else this modal is used.
//                   Inline styling here on purpose, so this button doesn't
//                   depend on a CSS class you'd otherwise have to add to
//                   ConcernInDetailModal.css. */}
//               {onLogRwoc && (
//                 <button
//                   type="button"
//                   className="jd-btn"
//                   onClick={() => onLogRwoc(record)}
//                   title="Return Without Calibration — closes this job out without it going through calibration"
//                   style={{
//                     backgroundColor: "#b3261e",
//                     color: "#fff",
//                     borderColor: "#b3261e",
//                   }}
//                 >
//                   Log RWOC
//                 </button>
//               )}

//               <button
//                 type="button"
//                 className="jd-btn jd-btn-primary"
//                 onClick={() => onUpdate?.(record)}
//               >
//                 Update
//               </button>
//               <button type="button" className="jd-btn" onClick={onClose}>
//                 Exit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {showViewFiles && (
//         <ReceiptFolderModal
//           jobNumbers={[{ jobNumber: record.jobNumber }]}
//           onClose={() => setShowViewFiles(false)}
//         />
//       )}

//       {showCamera && (
//         <CameraCaptureModal
//           onClose={() => setShowCamera(false)}
//           onCapture={handlePhotosCaptured}
//         />
//       )}
//     </div>
//   );
// };

// export default JobDetailsModal;
import React, { useEffect, useState, useCallback } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// Reused as-is from the Job Receipt flow — it already groups files by
// job number over a `jobNumbers` array, so a single job is just a
// one-item array. TODO: confirm this relative path matches where
// ReceiptFolderModal actually lives in your tree (it's imported as
// "./ReceiptFolderModal" from AddReceiptModal).
import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal";
// TODO: confirm this relative path matches where CameraCaptureModal
// actually lives in your tree (mirrors the ReceiptFolderModal import
// above — adjust if it's not under jobreceipt/).
import CameraCaptureModal from "../jobreceipt/CameraCaptureModal";
// Printable "Conditions of Calibration" agreement sheet, opened by the
// "Print Agreement" button below. Adjust this path if you save
// PrintAgreementModal.jsx somewhere other than alongside this file.
import PrintAgreementModal from "./PrintAgreementModal";
import "./ConcernInDetailModal.css";

// Base backend URL — same pattern as IncomingCalibDetailsModal.jsx /
// OnGoingCalib.jsx / JobReceipt.jsx. Needed here for the job-folder
// photo fetch below.
const API = import.meta.env.VITE_API_URL;

/**
 * JobDetailsModal
 *
 * Reproduces the legacy "JOB NUMBER DETAILS" desktop screen as a modal:
 * Company / OIC / SIG / Date Cal, Description / Frequency / Priority,
 * Con Cert / Date Due, Brand / Uncertainty, Model / Range,
 * Serial No / Concern, Remarks, a photo box, address/contact block,
 * and the action button row.
 *
 * Field mapping notes:
 * - OIC is populated from `record.oicBy`, the staff member assigned to
 *   the job. It's intentionally blank for concerns that came straight
 *   from Instrument Tagging, since oicBy only gets set once a job is
 *   opened in Incoming Calibration Details.
 * - Con Cert is populated from `record.contactName` — the company's own
 *   contact person, who the calibration certificate is addressed to.
 * - Phone Number and Email Address come from the linked Customer record
 *   (via the receipt's customerID), not the job receipt itself.
 * - SIG, Date Cal, Uncertainty, Range, Company Address, Fax Number, VAT
 *   are not returned by the current /api/jobnumbers + /api/jobreceipts
 *   merge — they render as "--" until those fields are added to the
 *   API/record.
 *
 * OIC / SIG VISIBILITY — a job's concern can be flagged from two
 * different places (see concernSource, set server-side by
 * PUT /api/jobnumbers/tag):
 *   - "instrumentTag" -> flagged straight from Instrument Tagging's
 *     "Concern / PIC Taken" checkbox. The job never passed through
 *     Incoming Calibration Details, so it has no real OIC/SIG yet —
 *     these fields are hidden entirely rather than shown as "--".
 *   - "calibration" (or anything else / missing, for jobs saved before
 *     this field existed) -> flagged via "Job Number With Concern"
 *     inside Incoming Calibration Details, or the job is on the regular
 *     Incoming/On-Going Calibration path — OIC/SIG are shown normally.
 *
 * PHOTO BOX — now a carousel, same pattern as
 * IncomingCalibDetailsModal.jsx's icd-image-viewer. Seeded from
 * record.photoUrl (if present), then topped up on mount with every
 * equipment photo found under this job number's Cloudinary folder via
 * GET /api/uploads/job-folder/:jobNumber/files — the same endpoint
 * ReceiptFolderModal's "View Files" uses — filtered by
 * resourceType === "image" (NOT the job's `folder` string or a publicId
 * extension regex: Cloudinary image uploads don't carry their extension
 * in publicId, and on Dynamic Folder mode accounts the Search API's
 * `folder` string can come back missing/inconsistent even for real
 * equipment-photos files — resourceType is the field that's actually
 * reliable here).
 *
 * "View Files" (previously "Open Folder") reuses ReceiptFolderModal —
 * the same component AddReceiptModal's "Open Folder" uses — passed a
 * single-item `jobNumbers` array so it fetches and displays just this
 * job's files via GET /api/uploads/job-folder/:jobNumber/files.
 *
 * "Print Agreement" opens PrintAgreementModal — a printable
 * "Conditions of Calibration" agreement sheet for this job/customer.
 * Any `onPrintAgreement` prop the parent supplies still fires alongside
 * it (e.g. for logging), but is no longer required for the modal to
 * open.
 *
 * "Log RWOC" (Return Without Calibration) — only rendered when the
 * parent passes an `onLogRwoc` handler. Currently that's just
 * ConcernOutgoing.jsx; every other place this modal is reused (e.g.
 * ConcernIncoming.jsx) leaves onLogRwoc undefined, so the button simply
 * doesn't render there — no extra flag needed on this component.
 */
const JobDetailsModal = ({
  record,
  onClose,
  onUpdate,
  onOpenCamera,
  onPrintAgreement,
  // Only passed in from ConcernOutgoing.jsx — undefined (and therefore
  // hidden, see jd-actions-row2 below) everywhere else this modal is
  // reused, e.g. Incoming Concern.
  onLogRwoc,
  // Was hardcoded to "Incoming Concern" — now a prop so ConcernOutgoing
  // (or any future stage that reuses this same modal) can pass its own
  // label instead of showing the wrong stage name.
  subtitleBottom = "Incoming Concern",
}) => {
  const [showViewFiles, setShowViewFiles] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  // Controls the printable "Conditions of Calibration" agreement sheet
  // opened by the "Print Agreement" button below.
  const [showPrintAgreement, setShowPrintAgreement] = useState(false);

  // --- Photo carousel state -------------------------------------------
  const [photoUrls, setPhotoUrls] = useState(() =>
    record?.photoUrls?.length
      ? record.photoUrls
      : record?.photoUrl
        ? [record.photoUrl]
        : [],
  );
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Keep the active index in range whenever the photo list changes.
  useEffect(() => {
    setActivePhotoIndex((i) => Math.min(i, Math.max(photoUrls.length - 1, 0)));
  }, [photoUrls.length]);

  const goToPrevPhoto = useCallback(() => {
    setActivePhotoIndex((i) => (i - 1 + photoUrls.length) % photoUrls.length);
  }, [photoUrls.length]);

  const goToNextPhoto = useCallback(() => {
    setActivePhotoIndex((i) => (i + 1) % photoUrls.length);
  }, [photoUrls.length]);

  // Fetch every equipment photo saved for this job number (across all
  // stages, not just record.photoUrl) and merge into the carousel.
  useEffect(() => {
    if (!record?.jobNumber) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${API}/api/uploads/job-folder/${encodeURIComponent(record.jobNumber)}/files`,
        );
        const data = await res.json();
        if (cancelled || !res.ok || data.success === false) return;

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

        setPhotoUrls((prev) => {
          const merged = Array.from(new Set([...prev, ...remotePhotoUrls]));
          return merged.length === prev.length ? prev : merged;
        });
      } catch (err) {
        console.error("Failed to fetch job equipment photos:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.jobNumber]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // CameraCaptureModal hands back an array of dataURLs (one per shot in
  // the session, batched — see its own onCapture(photos) contract) and
  // is only called at all if at least one photo was taken. Each one gets
  // uploaded to this job's equipment-photos Cloudinary folder via the
  // same POST /api/uploads/equipment-photo/:jobNumber route the rest of
  // the app uses, then the resulting URLs are merged straight into the
  // carousel — same pattern as IncomingCalibDetailsModal's
  // handleOpenCamera, just self-contained here instead of delegated to
  // a parent-supplied onOpenCamera.
  const handlePhotosCaptured = async (dataUrls) => {
    setShowCamera(false);
    if (!dataUrls?.length) return;

    if (!record?.jobNumber) {
      console.error(
        "Cannot upload equipment photo: job number is missing on this record.",
      );
      return;
    }

    const uploadedUrls = [];
    for (const dataUrl of dataUrls) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const formData = new FormData();
        formData.append("photo", blob, `photo_${Date.now()}.jpg`);

        const res = await fetch(
          `${API}/api/uploads/equipment-photo/${encodeURIComponent(record.jobNumber)}`,
          { method: "POST", body: formData },
        );
        const data = await res.json();
        if (res.ok && data.success !== false && data.url) {
          uploadedUrls.push(data.url);
        } else {
          console.error("Equipment photo upload failed:", data);
        }
      } catch (err) {
        console.error("Failed to upload captured photo:", err);
      }
    }

    if (uploadedUrls.length === 0) return;

    setPhotoUrls((prev) => {
      const merged = Array.from(new Set([...prev, ...uploadedUrls]));
      if (merged.length > prev.length) {
        setActivePhotoIndex(prev.length); // jump to first newly added photo
      }
      return merged;
    });

    // Let the parent know new photos landed, in case it wants to persist
    // them onto the job record itself (e.g. alongside the next Update
    // save) — mirrors what onOpenCamera used to be called with directly.
    onOpenCamera?.(uploadedUrls);
  };

  if (!record) return null;

  const val = (v) => (v === undefined || v === null || v === "" ? "--" : v);

  // Only hide OIC/SIG when we know FOR CERTAIN this concern came
  // straight from Instrument Tagging (no calibration stage yet, so no
  // real OIC/SIG exists). Any other value — "calibration", undefined,
  // or a job that isn't a concern at all — shows them as usual.
  const showOicSig = record.concernSource !== "instrumentTag";

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="jd-modal-overlay" onMouseDown={handleOverlayClick}>
      <div className="jd-modal">
        <CdmsModalHeader
          title="JOB NUMBER DETAILS"
          subtitleBottom={subtitleBottom}
          onClose={onClose}
        />

        <div className="jd-body">
          <div className="jd-panel">
            <div className="jd-top-row">
              <div className="jd-top-fields">
                <div className="jd-field-inline">
                  <label>Job Number</label>
                  <div className="jd-input jd-input-static">
                    {val(record.jobNumber)}
                  </div>
                </div>
                <div className="jd-field-inline">
                  <label>Date Received</label>
                  <div className="jd-select-like">
                    <span>{val(record.dateRec)}</span>
                    <span className="jd-caret">▾</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="jd-main">
              <div className="jd-grid">
                <label className="jd-label" style={{ gridArea: "compLbl" }}>
                  Company
                </label>
                <div className="jd-select-like" style={{ gridArea: "compVal" }}>
                  <span className="jd-ellipsis">{val(record.companyName)}</span>
                  <span className="jd-caret">▾</span>
                </div>

                {/* OIC / SIG — hidden entirely for concerns flagged
                    straight from Instrument Tagging (showOicSig above),
                    since those jobs never got a real OIC/SIG assigned. */}
                {showOicSig && (
                  <>
                    <label className="jd-label" style={{ gridArea: "oicLbl" }}>
                      OIC
                    </label>
                    <div
                      className="jd-select-like"
                      style={{ gridArea: "oicVal" }}
                    >
                      {/* Assigned staff member — stays blank for concerns
                          that came straight from Instrument Tagging, since
                          oicBy only gets set once a job is opened in
                          Incoming Calibration Details. */}
                      <span>{val(record.oicBy)}</span>
                      <span className="jd-caret">▾</span>
                    </div>

                    <label className="jd-label" style={{ gridArea: "sigLbl" }}>
                      SIG
                    </label>
                    <div
                      className="jd-select-like"
                      style={{ gridArea: "sigVal" }}
                    >
                      <span>{val(record.sig)}</span>
                      <span className="jd-caret">▾</span>
                    </div>
                  </>
                )}

                <label className="jd-label" style={{ gridArea: "dcalLbl" }}>
                  Date Cal
                </label>
                <div className="jd-select-like" style={{ gridArea: "dcalVal" }}>
                  <span>{val(record.dateCal)}</span>
                  <span className="jd-caret">▾</span>
                </div>

                <label className="jd-label" style={{ gridArea: "descLbl" }}>
                  Description
                </label>
                <div
                  className="jd-input-with-icon"
                  style={{ gridArea: "descVal" }}
                >
                  <div className="jd-input">{val(record.description)}</div>
                  <button type="button" className="jd-icon-btn" title="Lookup">
                    🔍
                  </button>
                </div>

                <label className="jd-label" style={{ gridArea: "freqLbl" }}>
                  Frequency
                </label>
                <div className="jd-select-like" style={{ gridArea: "freqVal" }}>
                  <span>{val(record.frequency)}</span>
                  <span className="jd-caret">▾</span>
                </div>

                <label className="jd-label" style={{ gridArea: "priLbl" }}>
                  Priority
                </label>
                <div className="jd-select-like" style={{ gridArea: "priVal" }}>
                  <span>{val(record.priority)}</span>
                  <span className="jd-caret">▾</span>
                </div>

                <label className="jd-label" style={{ gridArea: "ccertLbl" }}>
                  Con Cert
                </label>
                <div
                  className="jd-input-with-icon"
                  style={{ gridArea: "ccertVal" }}
                >
                  <div className="jd-select-like">
                    {/* Who the certificate is addressed to — the
                        company's own contact person, not a staff field. */}
                    <span>{val(record.contactName)}</span>
                    <span className="jd-caret">▾</span>
                  </div>
                  <button
                    type="button"
                    className="jd-icon-btn"
                    title="Certificate"
                  >
                    🖶
                  </button>
                </div>

                <label className="jd-label" style={{ gridArea: "ddueLbl" }}>
                  Date Due
                </label>
                <div className="jd-select-like" style={{ gridArea: "ddueVal" }}>
                  <span>{val(record.eta || record.dateDue)}</span>
                  <span className="jd-caret">▾</span>
                </div>

                <label className="jd-label" style={{ gridArea: "brandLbl" }}>
                  Brand
                </label>
                <div className="jd-input" style={{ gridArea: "brandVal" }}>
                  {val(record.brand)}
                </div>

                <label className="jd-label" style={{ gridArea: "uncLbl" }}>
                  Uncertainty
                </label>
                <div className="jd-input" style={{ gridArea: "uncVal" }}>
                  {val(record.uncertainty)}
                </div>

                <label className="jd-label" style={{ gridArea: "modelLbl" }}>
                  Model
                </label>
                <div className="jd-input" style={{ gridArea: "modelVal" }}>
                  {val(record.model)}
                </div>

                <label className="jd-label" style={{ gridArea: "rangeLbl" }}>
                  Range
                </label>
                <div className="jd-input" style={{ gridArea: "rangeVal" }}>
                  {val(record.range)}
                </div>

                <label className="jd-label" style={{ gridArea: "snLbl" }}>
                  Serial No.
                </label>
                <div className="jd-input" style={{ gridArea: "snVal" }}>
                  {val(record.serialNo)}
                </div>

                <label
                  className="jd-label jd-label-top"
                  style={{ gridArea: "conLbl" }}
                >
                  Concern
                </label>
                <div className="jd-textarea" style={{ gridArea: "conVal" }}>
                  {val(record.concern)}
                </div>

                <label className="jd-label" style={{ gridArea: "remLbl" }}>
                  Remarks
                </label>
                <div className="jd-input" style={{ gridArea: "remVal" }}>
                  {val(record.remarks)}
                </div>
              </div>

              {/* PHOTO BOX — now a carousel over photoUrls (seeded from
                  record.photoUrl/photoUrls, then topped up with every
                  equipment photo found under this job number via the
                  job-folder fetch above). Shows ‹ › nav buttons and a
                  counter whenever there's more than one photo. */}
              <div className="jd-photo-box" style={{ position: "relative" }}>
                {photoUrls.length > 0 ? (
                  <>
                    <img
                      src={photoUrls[activePhotoIndex]}
                      alt={`Unit photo ${activePhotoIndex + 1} of ${photoUrls.length}`}
                      className="jd-photo-img"
                    />
                    {photoUrls.length > 1 && (
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
                          {activePhotoIndex + 1} / {photoUrls.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="jd-photo-placeholder" />
                )}
              </div>
            </div>
          </div>

          <div className="jd-field-block">
            <label>Company Address</label>
            <div className="jd-textarea jd-textarea-wide">
              {val(record.companyAddress)}
            </div>
          </div>

          <div className="jd-contact-row">
            <div className="jd-field-block jd-field-grow">
              <label>Phone Number</label>
              <div className="jd-textarea jd-textarea-med">
                {val(record.phoneNumber)}
              </div>
            </div>
            <div className="jd-field-block jd-field-narrow">
              <label>Fax Number</label>
              <div className="jd-input">{val(record.faxNumber)}</div>
            </div>
          </div>

          <div className="jd-contact-row">
            <div className="jd-field-block jd-field-grow">
              <label>Email Address</label>
              <div className="jd-input">{val(record.email)}</div>
            </div>
            <div className="jd-field-block jd-field-narrow">
              <label>VAT</label>
              <div className="jd-select-like">
                <span>{val(record.vat || "0 VAT")}</span>
                <span className="jd-caret">▾</span>
              </div>
            </div>
          </div>

          <div className="jd-actions">
            <button
              type="button"
              className="jd-btn jd-btn-print"
              onClick={() => {
                // Opens the printable "Conditions of Calibration" sheet
                // (PrintAgreementModal). The parent's onPrintAgreement,
                // if supplied, still fires alongside it in case it does
                // its own thing (logging, analytics, etc.) — harmless
                // if the parent left it undefined.
                setShowPrintAgreement(true);
                onPrintAgreement?.(record);
              }}
            >
              Print Agreement
            </button>
            <div className="jd-actions-row2">
              <button
                type="button"
                className="jd-btn"
                onClick={() => setShowCamera(true)}
              >
                Open Camera
              </button>
              <button
                type="button"
                className="jd-btn"
                onClick={() => setShowViewFiles(true)}
              >
                View Files
              </button>

              {/* Log RWOC — Return Without Calibration. Only rendered
                  when the parent (ConcernOutgoing.jsx) supplies
                  onLogRwoc; hidden everywhere else this modal is used.
                  Inline styling here on purpose, so this button doesn't
                  depend on a CSS class you'd otherwise have to add to
                  ConcernInDetailModal.css. */}
              {onLogRwoc && (
                <button
                  type="button"
                  className="jd-btn"
                  onClick={() => onLogRwoc(record)}
                  title="Return Without Calibration — closes this job out without it going through calibration"
                  style={{
                    backgroundColor: "#b3261e",
                    color: "#fff",
                    borderColor: "#b3261e",
                  }}
                >
                  Log RWOC
                </button>
              )}

              <button
                type="button"
                className="jd-btn jd-btn-primary"
                onClick={() => onUpdate?.(record)}
              >
                Update
              </button>
              <button type="button" className="jd-btn" onClick={onClose}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {showViewFiles && (
        <ReceiptFolderModal
          jobNumbers={[{ jobNumber: record.jobNumber }]}
          onClose={() => setShowViewFiles(false)}
        />
      )}

      {showCamera && (
        <CameraCaptureModal
          onClose={() => setShowCamera(false)}
          onCapture={handlePhotosCaptured}
        />
      )}

      {showPrintAgreement && (
        <PrintAgreementModal
          record={record}
          onClose={() => setShowPrintAgreement(false)}
        />
      )}
    </div>
  );
};

export default JobDetailsModal;
