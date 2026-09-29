// import React, { useState, useEffect, useRef } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import QuotationFilesModal from "./QuotationFilesModal";
// import "./QuotationDetailsModal.css";

// const API = import.meta.env.VITE_API_URL;

// /**
//  * QuotationDetailsModal — "Quotation Information Details" popup.
//  *
//  * READ-ONLY: every data field (Quotation ID, Date, Customer ID, Company
//  * Name, Address, Contact Info, Contact Name, Prepared By, Reference,
//  * Purchase Order, Remarks) is a plain display value straight off the
//  * `quotation` prop — no local form state, no onChange handlers, no
//  * validation. This modal's job is reviewing a quotation and moving it
//  * through the pipeline (uploading the checked/signed file, approving,
//  * marking sent), not editing its text fields. The Customer ID "search"
//  * and Contact Name "add contact" icon buttons from the old editable
//  * version are removed since there's nothing left for them to do here.
//  *
//  * IMPORTANT: quotationId values look like "QTN/0001/26" — they contain
//  * slashes. Every URL built from quotation.quotationId MUST go through
//  * `idPath` (encodeURIComponent) below, or Express sees extra path
//  * segments and 404s (server does decodeURIComponent on every route,
//  * confirming it expects the encoded form).
//  *
//  * Reused across every stage of the pipeline (Qtn For Check, Qtn For
//  * Send, ...). Which stage it's opened from is passed in via the
//  * `stage` prop, which drives STAGE_CONFIG below — that's what decides
//  * which file field to display/download, what "Re-upload + Save" does,
//  * and whether the "Mark as Sent" / "Save" actions show up.
//  *
//  * Pipeline (per real backend routes):
//  *   AddQuotation (create + attach template) -> status "For Checking"
//  *     staffFileUrl/staffFileName set by PUT /:id/upload-template.
//  *     This is a ONE-TIME docxtemplater render — the "Approved by" tags
//  *     in the master template use [[ ]] delimiters specifically so this
//  *     first render (which uses default { } delimiters) does NOT touch
//  *     them, leaving them alive for a later second pass.
//  *   Qtn For Check:
//  *     - Download Template here fetches the REAL uploaded file as-is
//  *       (staffFileUrl / signedFileUrl) — never re-rendered — so
//  *       whatever the staff actually typed into the table/fields is
//  *       what you see. No signature yet unless already approved.
//  *     - Re-upload Template + Save: manual override path, uploads
//  *       whatever file you pick via PUT /:id/upload-signed -> status
//  *       "For Sending". Still supported for cases where the checker
//  *       wants to hand-edit the file themselves. Since text fields are
//  *       no longer editable here, Save now does ONLY this upload — it's
//  *       disabled unless a file has actually been staged.
//  *     - "Approve & Generate Signed Copy" (new): picks up whichever
//  *       file currently represents the real content (signedFileUrl if
//  *       it exists, otherwise staffFileUrl), runs a SECOND docxtemplater
//  *       pass using [[ ]] delimiters against just the approvedBy /
//  *       adminSignature tags, and re-uploads the result — so the real
//  *       content the staff typed stays completely untouched while the
//  *       approver's name + signature get inserted automatically.
//  *       PUT /:id/apply-approval -> status "For Sending".
//  *   Qtn For Send: "Mark as Sent" -> status "Sent"
//  *     PUT /:id/mark-sent, body { sentBy } -> sets sentBy + sentAt
//  *     There's nothing to Save on this stage (no file re-upload, no
//  *     editable fields), so the Save button doesn't render here at all
//  *     (see STAGE_CONFIG.showSave).
//  *
//  * Approver selection (check stage only): the checker doesn't have to be
//  * the one whose name/signature appears as "Approved by" on the final
//  * document. GET /api/users is fetched and filtered down to admin +
//  * technician accounts; whichever one is selected is used either by
//  * "Approve & Generate Signed Copy" (apply-approval route) or, if a file
//  * is staged via Re-upload Template, sent along with that upload as
//  * approverUsername/approverName so the server stores those as
//  * checkedBy/checkedByUsername too. Assumes GET /api/users returns
//  * objects shaped like { username, name, role } — matches the actual
//  * users collection schema (confirmed via authRoutes.js's /register).
//  *
//  * "View Files" — there is no GET /:id/files route on the server. All
//  * file URLs already live directly on the quotation document
//  * (staffFileUrl, signedFileUrl, clientProofUrl), so this reads those
//  * off the prop instead of fetching anything. Shown via QuotationFilesModal.
//  *
//  * Download filenames: prefer the real extension from staffFileName /
//  * signedFileName (saved server-side as of this version). Falls back to
//  * parsing the extension off the file URL for older records that predate
//  * signedFileName existing — those may still come through
//  * extension-less if the original Cloudinary asset itself has none.
//  *
//  * Logged-in user info lives in sessionStorage (confirmed keys):
//  *   userRole  -> "admin" | "clerk" | ... (sent as x-user-role header)
//  *   username  -> e.g. "admin1"           (sent as x-user-name header /
//  *                                          used as sentBy on mark-sent)
//  */

// const STAGE_CONFIG = {
//   check: {
//     displayFileField: "staffFileUrl",
//     displayFileNameField: "staffFileName",
//     uploadRoute: "upload-signed",
//     uploadField: "file",
//     requiresRoleHeader: true,
//     savingLabel: "Save & Move to Sending",
//     showMarkSent: false,
//     showSave: true,
//   },
//   send: {
//     displayFileField: "signedFileUrl",
//     displayFileNameField: "signedFileName",
//     uploadRoute: null,
//     uploadField: null,
//     requiresRoleHeader: false,
//     savingLabel: "Save",
//     showMarkSent: true,
//     // No editable fields and no upload route on this stage — nothing
//     // for a Save action to do, so it isn't shown at all.
//     showSave: false,
//   },
// };

// const QuotationDetailsModal = ({
//   quotation,
//   onClose,
//   onSaved,
//   stage = "check",
// }) => {
//   const config = STAGE_CONFIG[stage] || STAGE_CONFIG.check;

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const [pendingTemplateFile, setPendingTemplateFile] = useState(null);
//   const [downloadingTemplate, setDownloadingTemplate] = useState(false);
//   const [showFiles, setShowFiles] = useState(false);
//   const [markingSent, setMarkingSent] = useState(false);

//   // --- Approver selection (check stage only) --------------------------
//   // Who actually gets credited/signed as "Approved by" on the final
//   // document — not necessarily whoever is logged in doing the upload.
//   const [approvers, setApprovers] = useState([]);
//   const [loadingApprovers, setLoadingApprovers] = useState(false);
//   const [selectedApproverUsername, setSelectedApproverUsername] = useState("");

//   // --- Approve & Generate Signed Copy (second render pass) -----------
//   const [approving, setApproving] = useState(false);

//   const templateInputRef = useRef(null);

//   // Fetch accounts eligible to approve (admin + technician roles), only
//   // needed on the "check" stage where the checker picks who's signing.
//   useEffect(() => {
//     if (stage !== "check") return;
//     const fetchApprovers = async () => {
//       setLoadingApprovers(true);
//       try {
//         const res = await fetch(`${API}/api/users`);
//         if (!res.ok) throw new Error("Failed to load approvers");
//         const all = await res.json();
//         const eligible = (Array.isArray(all) ? all : []).filter(
//           (u) => u.role === "admin" || u.role === "technician",
//         );
//         setApprovers(eligible);
//       } catch (err) {
//         console.error("Failed to fetch approvers:", err);
//         setApprovers([]);
//       } finally {
//         setLoadingApprovers(false);
//       }
//     };
//     fetchApprovers();
//   }, [stage]);

//   useEffect(() => {
//     if (!quotation) return;
//     setPendingTemplateFile(null);
//     setError("");
//     // Pre-select if this record was already checked before (re-opening
//     // a "For Sending" record), otherwise starts blank.
//     setSelectedApproverUsername(quotation.checkedByUsername || "");
//   }, [quotation]);

//   if (!quotation) return null;

//   const idPath = encodeURIComponent(quotation.quotationId);

//   const displayFileUrl = quotation[config.displayFileField] || "";
//   const displayFileName = quotation[config.displayFileNameField] || "";
//   const templateUploaded = Boolean(displayFileUrl);

//   const selectedApprover = approvers.find(
//     (a) => a.username === selectedApproverUsername,
//   );

//   const knownFiles = [
//     {
//       url: quotation.staffFileUrl,
//       filename: quotation.staffFileName || "Staff Template",
//       label: "Quotation Template",
//     },
//     {
//       url: quotation.signedFileUrl,
//       filename: quotation.signedFileName || "Signed File",
//       label: "Signed Quotation",
//     },
//     {
//       url: quotation.clientProofUrl,
//       filename: quotation.clientProofName || "Client Proof",
//       label: "Client Proof",
//     },
//   ].filter((f) => f.url);

//   const handleReuploadTemplate = () => {
//     templateInputRef.current?.click();
//   };

//   const handleTemplateFileSelected = (e) => {
//     const file = e.target.files?.[0];
//     e.target.value = "";
//     if (!file) return;
//     setPendingTemplateFile(file);
//     setError("");
//   };

//   // Save now does ONLY the file upload — there are no editable text
//   // fields left to persist. Disabled entirely unless a file has been
//   // staged via Re-upload Template (see the button's `disabled` prop).
//   const handleSave = async () => {
//     if (!pendingTemplateFile || !config.uploadRoute) return;

//     if (stage === "check" && !selectedApproverUsername) {
//       setError("Please select who is approving this quotation before saving.");
//       return;
//     }

//     setSaving(true);
//     setError("");
//     try {
//       const formData = new FormData();
//       formData.append(config.uploadField, pendingTemplateFile);

//       if (selectedApprover) {
//         formData.append("approverUsername", selectedApprover.username);
//         formData.append(
//           "approverName",
//           selectedApprover.name || selectedApprover.username,
//         );
//       }

//       const headers = {};
//       if (config.requiresRoleHeader) {
//         headers["x-user-role"] = sessionStorage.getItem("userRole") || "";
//         headers["x-user-name"] = sessionStorage.getItem("username") || "";
//       }

//       const uploadRes = await fetch(
//         `${API}/api/quotations/${idPath}/${config.uploadRoute}`,
//         { method: "PUT", headers, body: formData },
//       );
//       if (!uploadRes.ok) {
//         if (uploadRes.status === 403) {
//           throw new Error("Checker role required to upload the signed file.");
//         }
//         throw new Error("Failed to upload file");
//       }
//       const uploadResult = await uploadRes.json();
//       if (!uploadResult.success) throw new Error("Failed to upload file");

//       setPendingTemplateFile(null);
//       onSaved?.(uploadResult.quotation);
//       onClose();
//     } catch (err) {
//       console.error("Failed to save quotation:", err);
//       setError(err.message || "Failed to save changes. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Runs the second docxtemplater pass (server-side) against whichever
//   // file currently holds the real content, inserting only the selected
//   // approver's name + signature via [[ ]]-delimited tags. Leaves
//   // everything the staff typed completely untouched.
//   const handleApprove = async () => {
//     if (!selectedApprover) {
//       setError("Please select who is approving this quotation.");
//       return;
//     }
//     setApproving(true);
//     setError("");
//     try {
//       const res = await fetch(
//         `${API}/api/quotations/${idPath}/apply-approval`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             approverUsername: selectedApprover.username,
//             approverName: selectedApprover.name || selectedApprover.username,
//           }),
//         },
//       );
//       if (!res.ok) throw new Error("Failed to apply approval");
//       const result = await res.json();
//       if (!result.success)
//         throw new Error(result.message || "Failed to apply approval");

//       // Immediately download the newly generated signed copy so there's
//       // a visible result instead of the modal just quietly closing.
//       const signedUrl = result.quotation?.signedFileUrl;
//       if (signedUrl) {
//         const fileRes = await fetch(signedUrl);
//         if (fileRes.ok) {
//           const blob = await fileRes.blob();
//           const blobUrl = window.URL.createObjectURL(blob);
//           const link = document.createElement("a");
//           link.href = blobUrl;
//           link.download = `${quotation.quotationId.replace(/\//g, "-")}-SIGNED.docx`;
//           document.body.appendChild(link);
//           link.click();
//           link.remove();
//           window.URL.revokeObjectURL(blobUrl);
//         }
//       }

//       onSaved?.(result.quotation);
//       onClose();
//     } catch (err) {
//       console.error("Failed to apply approval:", err);
//       setError(err.message || "Failed to apply approval. Please try again.");
//     } finally {
//       setApproving(false);
//     }
//   };

//   // Prefer the real extension from the saved original filename.
//   // Falls back to parsing the file URL for older records that predate
//   // staffFileName/signedFileName being stored.
//   const buildDownloadFilename = () => {
//     const idPart = (quotation.quotationId || "quotation").replace(/\//g, "-");
//     const statusPart = (quotation.status || "").toUpperCase();
//     const base = statusPart ? `${idPart}-${statusPart}` : idPart;

//     let ext = "";
//     if (displayFileName) {
//       const dot = displayFileName.lastIndexOf(".");
//       if (dot !== -1) ext = displayFileName.slice(dot);
//     }
//     if (!ext) {
//       const match = displayFileUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
//       ext = match ? `.${match[1]}` : "";
//     }

//     return `${base}${ext}`;
//   };

//   // Downloads the REAL uploaded file as-is (staffFileUrl / signedFileUrl)
//   // — never re-rendered here — so whatever the staff actually typed
//   // into the document is exactly what you get. Signature only appears
//   // once "Approve & Generate Signed Copy" has actually run.
//   const handleDownloadTemplate = async () => {
//     if (!displayFileUrl) {
//       setError("No file has been uploaded for this quotation yet.");
//       return;
//     }
//     setDownloadingTemplate(true);
//     setError("");
//     try {
//       const check = await fetch(displayFileUrl, { method: "GET" });
//       if (!check.ok) {
//         const body = await check.text().catch(() => "");
//         console.error("Cloudinary error body:", body);
//         throw new Error(`Cloudinary returned ${check.status}`);
//       }
//       const blob = await check.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = buildDownloadFilename();
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Failed to download file:", err);
//       setError(
//         "Failed to download file. Check the browser console for details.",
//       );
//     } finally {
//       setDownloadingTemplate(false);
//     }
//   };

//   const handleMarkAsSent = async () => {
//     setMarkingSent(true);
//     setError("");
//     try {
//       const userName = sessionStorage.getItem("username") || "";
//       const res = await fetch(`${API}/api/quotations/${idPath}/mark-sent`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ sentBy: userName }),
//       });
//       if (!res.ok) throw new Error("Failed to mark as sent");
//       const result = await res.json();
//       if (!result.success) throw new Error("Failed to mark as sent");
//       onSaved?.(result.quotation);
//       onClose();
//     } catch (err) {
//       console.error("Failed to mark as sent:", err);
//       setError("Failed to mark as sent. Please try again.");
//     } finally {
//       setMarkingSent(false);
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <div className="qtn-modal-overlay">
//       <div className="qtn-modal">
//         <CdmsModalHeader
//           title="QUOTATION INFORMATION DETAILS"
//           onClose={onClose}
//         />

//         <div className="qtn-modal-body">
//           {error && <div className="qtn-modal-error">{error}</div>}

//           <div className="qtn-details-top-row">
//             <div className="qtn-field">
//               <label>Quotation ID</label>
//               <input type="text" value={quotation.quotationId || ""} readOnly />
//             </div>
//             <div className="qtn-field">
//               <label>Date</label>
//               <input type="text" value={quotation.date || ""} readOnly />
//             </div>
//             <div className="qtn-field">
//               <label>Customer ID</label>
//               <input type="text" value={quotation.customerId || ""} readOnly />
//             </div>
//           </div>

//           <div className="qtn-details-columns">
//             <div className="qtn-details-col">
//               <div className="qtn-field">
//                 <label>Company Name</label>
//                 <input
//                   type="text"
//                   value={quotation.companyName || ""}
//                   readOnly
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Address</label>
//                 <input type="text" value={quotation.address || ""} readOnly />
//               </div>
//               <div className="qtn-field">
//                 <label>Contact Info</label>
//                 <input
//                   type="text"
//                   value={quotation.contactInfo || ""}
//                   readOnly
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Contact Name</label>
//                 <input
//                   type="text"
//                   value={quotation.contactName || ""}
//                   readOnly
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Prepared By</label>
//                 <input
//                   type="text"
//                   value={quotation.preparedBy || ""}
//                   readOnly
//                 />
//               </div>

//               {stage === "check" && (
//                 <div className="qtn-field">
//                   <label>Approved By</label>
//                   <select
//                     value={selectedApproverUsername}
//                     onChange={(e) =>
//                       setSelectedApproverUsername(e.target.value)
//                     }
//                     disabled={loadingApprovers}
//                   >
//                     <option value="">
//                       {loadingApprovers
//                         ? "Loading..."
//                         : "-- Select approver --"}
//                     </option>
//                     {approvers.map((a) => (
//                       <option key={a.username} value={a.username}>
//                         {a.name || a.username} ({a.role})
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//             </div>

//             <div className="qtn-details-divider" />

//             <div className="qtn-details-col">
//               <div className="qtn-field">
//                 <label>Reference</label>
//                 <input
//                   type="text"
//                   value={quotation.reference || ""}
//                   readOnly
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Purchase Order</label>
//                 <input
//                   type="text"
//                   value={quotation.poNumber || ""}
//                   readOnly
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Remarks</label>
//                 <textarea
//                   className="qtn-remarks"
//                   value={quotation.remarks || ""}
//                   readOnly
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <input
//           type="file"
//           ref={templateInputRef}
//           style={{ display: "none" }}
//           accept=".doc,.docx,.pdf"
//           onChange={handleTemplateFileSelected}
//         />

//         {/* FOOTER — qtn-toolbar layout: primary actions (Save / Approve /
//             Mark as Sent) pinned left, file actions pinned right, matching
//             the same gray action-bar pattern as AddQuotationModal */}
//         <div className="qtn-modal-footer qtn-toolbar">
//           <div className="qtn-toolbar-left">
//             {config.showSave && (
//               <button
//                 className="qtn-btn qtn-btn-primary"
//                 onClick={handleSave}
//                 disabled={
//                   saving ||
//                   !pendingTemplateFile ||
//                   (stage === "check" && !selectedApproverUsername)
//                 }
//                 title={
//                   !pendingTemplateFile
//                     ? "Re-upload a file first — there's nothing else to save"
//                     : undefined
//                 }
//               >
//                 {saving ? "Saving..." : config.savingLabel}
//               </button>
//             )}

//             {stage === "check" && (
//               <button
//                 className="qtn-btn qtn-btn-primary"
//                 onClick={handleApprove}
//                 disabled={approving || !selectedApproverUsername}
//                 title={
//                   !selectedApproverUsername
//                     ? "Select an approver first"
//                     : "Insert the approver's name and signature into the uploaded file"
//                 }
//               >
//                 {approving ? "Approving..." : "Approve & Generate Signed Copy"}
//               </button>
//             )}

//             {config.showMarkSent && (
//               <button
//                 className="qtn-btn qtn-btn-primary"
//                 onClick={handleMarkAsSent}
//                 disabled={markingSent}
//               >
//                 {markingSent ? "Marking..." : "Mark as Sent"}
//               </button>
//             )}
//           </div>

//           <div className="qtn-toolbar-right">
//             <button className="qtn-btn" onClick={() => setShowFiles(true)}>
//               View Files
//             </button>

//             <button
//               className="qtn-btn"
//               onClick={handleDownloadTemplate}
//               disabled={downloadingTemplate || !displayFileUrl}
//               title={
//                 !displayFileUrl
//                   ? "No file uploaded yet"
//                   : "Download the current file for this stage"
//               }
//             >
//               {downloadingTemplate ? "Downloading..." : "Download Template"}
//             </button>

//             <button className="qtn-btn" onClick={handleReuploadTemplate}>
//               Re-upload Template
//             </button>

//             {pendingTemplateFile && (
//               <span className="qtn-template-pending">
//                 📎 {pendingTemplateFile.name} — will upload on Save
//               </span>
//             )}
//             {templateUploaded && !pendingTemplateFile && (
//               <span className="qtn-template-uploaded">✓ Template uploaded</span>
//             )}
//           </div>

//           {/* <button className="qtn-btn" onClick={onClose}>
//             Cancel
//           </button>
//           <button className="qtn-btn" onClick={handlePrint}>
//             Print
//           </button>
//           <button className="qtn-btn" onClick={onClose}>
//             Back
//           </button>
//           <button className="qtn-btn" onClick={onClose}>
//             Exit
//           </button> */}
//         </div>
//       </div>

//       {showFiles && (
//         <QuotationFilesModal
//           files={knownFiles}
//           onClose={() => setShowFiles(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default QuotationDetailsModal;
import React, { useState, useEffect, useRef } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import QuotationFilesModal from "./QuotationFilesModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import "./QuotationDetailsModal.css";

const API = import.meta.env.VITE_API_URL;

/**
 * QuotationDetailsModal — "Quotation Information Details" popup.
 *
 * READ-ONLY: every data field (Quotation ID, Date, Customer ID, Company
 * Name, Address, Contact Info, Contact Name, Prepared By, Reference,
 * Purchase Order, Remarks) is a plain display value straight off the
 * `quotation` prop — no local form state, no onChange handlers, no
 * validation. This modal's job is reviewing a quotation and moving it
 * through the pipeline (uploading the checked/signed file, approving,
 * sending), not editing its text fields.
 *
 * IMPORTANT: quotationId values look like "QTN/0001/26" — they contain
 * slashes. Every URL built from quotation.quotationId MUST go through
 * `idPath` (encodeURIComponent) below, or Express sees extra path
 * segments and 404s (server does decodeURIComponent on every route,
 * confirming it expects the encoded form).
 *
 * Reused across every stage of the pipeline (Qtn For Check, Qtn For
 * Send, ...). Which stage it's opened from is passed in via the
 * `stage` prop, which drives STAGE_CONFIG below — that's what decides
 * which file field to display/download, what "Re-upload + Save" does,
 * and whether the "Send" / "Mark as Sent" / "Save" actions show up.
 *
 * Pipeline (per real backend routes):
 *   AddQuotation (create + attach template) -> status "For Checking"
 *     staffFileUrl/staffFileName set by PUT /:id/upload-template.
 *   Qtn For Check:
 *     - Download Template fetches the REAL uploaded file as-is.
 *     - "Approve & Generate Signed Copy": second docxtemplater pass
 *       ([[ ]] delimiters) inserting the approver's name + signature.
 *       PUT /:id/apply-approval. The signed copy is only STORED — the
 *       status stays "For Checking" and the modal stays open (the copy
 *       is also downloaded so it can be reviewed).
 *     - "Save & Move to Sending": the step that actually advances the
 *       quotation to "For Sending". If a file was staged via Re-upload
 *       Template it is uploaded (PUT /:id/upload-signed, manual
 *       override); otherwise the existing signed copy is used
 *       (PUT /:id/move-to-sending). Enabled once either exists.
 *   Qtn For Send:
 *     - "Send": opens an in-app confirmation dialog, then POST /:id/send.
 *       The SERVER looks up the company email from the customers
 *       collection and emails the signed file as an attachment. The
 *       status is NOT changed and the modal stays open — the record
 *       just gets emailSentTo/emailSentBy/emailSentAt, shown in the
 *       modal. The user then clicks "Mark as Sent" to finish.
 *       The recipient shown in the modal comes from GET /:id/recipient
 *       (display only — the browser never chooses the address).
 *     - "Mark as Sent": PUT /:id/mark-sent, body { sentBy }. Flips the
 *       status to "Sent". Also works on its own for quotations
 *       delivered outside the system (by hand, messaging app, etc.).
 *
 * Logged-in user info lives in sessionStorage:
 *   userRole  -> "admin" | "clerk" | ... (sent as x-user-role header)
 *   username  -> e.g. "admin1"           (sent as x-user-name header /
 *                                          used as sentBy)
 */

const STAGE_CONFIG = {
  check: {
    displayFileField: "staffFileUrl",
    displayFileNameField: "staffFileName",
    uploadRoute: "upload-signed",
    uploadField: "file",
    requiresRoleHeader: true,
    savingLabel: "Save & Move to Sending",
    showSend: false,
    showMarkSent: false,
    showSave: true,
  },
  send: {
    displayFileField: "signedFileUrl",
    displayFileNameField: "signedFileName",
    uploadRoute: null,
    uploadField: null,
    requiresRoleHeader: false,
    savingLabel: "Save",
    showSend: true,
    showMarkSent: true,
    // No editable fields and no upload route on this stage — nothing
    // for a Save action to do, so it isn't shown at all.
    showSave: false,
  },
};

const QuotationDetailsModal = ({
  quotation,
  onClose,
  onSaved,
  stage = "check",
}) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.check;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [pendingTemplateFile, setPendingTemplateFile] = useState(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);

  // --- Send by email (send stage only) --------------------------------
  const [sending, setSending] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loadingRecipient, setLoadingRecipient] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  // Filled from the record (already emailed before) or after a
  // successful send in this session.
  const [emailSent, setEmailSent] = useState(null); // { to, at } | null

  // --- Approver selection (check stage only) --------------------------
  const [approvers, setApprovers] = useState([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [selectedApproverUsername, setSelectedApproverUsername] = useState("");

  // --- Approve & Generate Signed Copy (second render pass) -----------
  const [approving, setApproving] = useState(false);
  // Signed copy generated during this session (the `quotation` prop is
  // not refreshed by the parent until the list reloads).
  const [signedCopy, setSignedCopy] = useState(null); // { url, name, approver }

  const templateInputRef = useRef(null);

  // Fetch accounts eligible to approve (admin + technician roles), only
  // needed on the "check" stage where the checker picks who's signing.
  useEffect(() => {
    if (stage !== "check") return;
    const fetchApprovers = async () => {
      setLoadingApprovers(true);
      try {
        const res = await fetch(`${API}/api/users`);
        if (!res.ok) throw new Error("Failed to load approvers");
        const all = await res.json();
        const eligible = (Array.isArray(all) ? all : []).filter(
          (u) => u.role === "admin" || u.role === "technician",
        );
        setApprovers(eligible);
      } catch (err) {
        console.error("Failed to fetch approvers:", err);
        setApprovers([]);
      } finally {
        setLoadingApprovers(false);
      }
    };
    fetchApprovers();
  }, [stage]);

  // Fetch the company email (looked up server-side from the customers
  // collection) so the user can see where the quotation will be sent.
  useEffect(() => {
    if (stage !== "send" || !quotation) return;
    let cancelled = false;
    const fetchRecipient = async () => {
      setLoadingRecipient(true);
      try {
        const res = await fetch(
          `${API}/api/quotations/${encodeURIComponent(quotation.quotationId)}/recipient`,
        );
        const data = await res.json();
        if (!cancelled) setRecipientEmail(data.email || "");
      } catch (err) {
        console.error("Failed to fetch recipient:", err);
        if (!cancelled) setRecipientEmail("");
      } finally {
        if (!cancelled) setLoadingRecipient(false);
      }
    };
    fetchRecipient();
    return () => {
      cancelled = true;
    };
  }, [stage, quotation]);

  useEffect(() => {
    if (!quotation) return;
    setPendingTemplateFile(null);
    setError("");
    // Pre-select if this record was already checked before (re-opening
    // a "For Sending" record), otherwise starts blank.
    setSelectedApproverUsername(quotation.checkedByUsername || "");
    setShowSendConfirm(false);
    setSignedCopy(null);
    setEmailSent(
      quotation.emailSentAt
        ? { to: quotation.emailSentTo || "", at: quotation.emailSentAt }
        : null,
    );
  }, [quotation]);

  if (!quotation) return null;

  const idPath = encodeURIComponent(quotation.quotationId);

  const displayFileUrl = quotation[config.displayFileField] || "";
  const displayFileName = quotation[config.displayFileNameField] || "";
  const templateUploaded = Boolean(displayFileUrl);

  const selectedApprover = approvers.find(
    (a) => a.username === selectedApproverUsername,
  );

  // Signed copy = one generated this session, or one already on the record.
  const signedUrl = signedCopy?.url || quotation.signedFileUrl || "";
  const signedName =
    signedCopy?.name || quotation.signedFileName || "Signed File";
  const signedApprover = signedCopy?.approver || quotation.checkedBy || "";
  const hasSignedCopy = Boolean(signedUrl);

  const knownFiles = [
    {
      url: quotation.staffFileUrl,
      filename: quotation.staffFileName || "Staff Template",
      label: "Quotation Template",
    },
    {
      url: signedUrl,
      filename: signedName,
      label: "Signed Quotation",
    },
    {
      url: quotation.clientProofUrl,
      filename: quotation.clientProofName || "Client Proof",
      label: "Client Proof",
    },
  ].filter((f) => f.url);

  const handleReuploadTemplate = () => {
    templateInputRef.current?.click();
  };

  const handleTemplateFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingTemplateFile(file);
    setError("");
  };

  // "Save & Move to Sending" — the step that advances the quotation.
  //  - If a file was staged via Re-upload Template: upload it
  //    (PUT upload-signed), which also sets "For Sending".
  //  - Otherwise: use the signed copy already generated by
  //    "Approve & Generate Signed Copy" (PUT move-to-sending).
  const handleSave = async () => {
    if (!config.uploadRoute) return;
    if (!pendingTemplateFile && !hasSignedCopy) return;

    if (stage === "check" && !selectedApproverUsername) {
      setError("Please select who is approving this quotation before saving.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const roleHeaders = {
        "x-user-role": sessionStorage.getItem("userRole") || "",
        "x-user-name": sessionStorage.getItem("username") || "",
      };
      const approverName = selectedApprover
        ? selectedApprover.name || selectedApprover.username
        : "";

      let result;
      if (pendingTemplateFile) {
        const formData = new FormData();
        formData.append(config.uploadField, pendingTemplateFile);
        if (selectedApprover) {
          formData.append("approverUsername", selectedApprover.username);
          formData.append("approverName", approverName);
        }
        const uploadRes = await fetch(
          `${API}/api/quotations/${idPath}/${config.uploadRoute}`,
          {
            method: "PUT",
            headers: config.requiresRoleHeader ? roleHeaders : {},
            body: formData,
          },
        );
        if (!uploadRes.ok) {
          if (uploadRes.status === 403) {
            throw new Error("Checker role required to upload the signed file.");
          }
          throw new Error("Failed to upload file");
        }
        result = await uploadRes.json();
        if (!result.success) throw new Error("Failed to upload file");
      } else {
        const moveRes = await fetch(
          `${API}/api/quotations/${idPath}/move-to-sending`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...roleHeaders },
            body: JSON.stringify({
              approverUsername: selectedApprover?.username || "",
              approverName,
            }),
          },
        );
        result = await moveRes.json().catch(() => ({}));
        if (!moveRes.ok || !result.success) {
          if (moveRes.status === 403) {
            throw new Error("Checker role required to move this quotation.");
          }
          throw new Error(result.message || "Failed to move to sending");
        }
      }

      setPendingTemplateFile(null);
      onSaved?.(result.quotation);
      onClose();
    } catch (err) {
      console.error("Failed to save quotation:", err);
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Runs the second docxtemplater pass (server-side), inserting the
  // selected approver's name + signature, and STORES the result as the
  // signed copy. Does NOT close the modal or change the status — the
  // user reviews the copy, then clicks "Save & Move to Sending".
  const handleApprove = async () => {
    if (!selectedApprover) {
      setError("Please select who is approving this quotation.");
      return;
    }
    setApproving(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/api/quotations/${idPath}/apply-approval`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approverUsername: selectedApprover.username,
            approverName: selectedApprover.name || selectedApprover.username,
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to apply approval");
      const result = await res.json();
      if (!result.success)
        throw new Error(result.message || "Failed to apply approval");

      const newSignedUrl = result.quotation?.signedFileUrl;
      setSignedCopy({
        url: newSignedUrl,
        name: result.quotation?.signedFileName,
        approver:
          result.quotation?.checkedBy ||
          selectedApprover.name ||
          selectedApprover.username,
      });
      // The generated copy replaces any file staged via Re-upload.
      setPendingTemplateFile(null);

      // Download the generated copy so there's something to review.
      if (newSignedUrl) {
        const fileRes = await fetch(newSignedUrl);
        if (fileRes.ok) {
          const blob = await fileRes.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `${quotation.quotationId.replace(/\//g, "-")}-SIGNED.docx`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(blobUrl);
        }
      }

      // Keep the parent list in sync (status is unchanged, so the row
      // stays in "For Checking"). Modal intentionally stays open.
      onSaved?.(result.quotation);
    } catch (err) {
      console.error("Failed to apply approval:", err);
      setError(err.message || "Failed to apply approval. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  // Prefer the real extension from the saved original filename.
  // Falls back to parsing the file URL for older records that predate
  // staffFileName/signedFileName being stored.
  const buildDownloadFilename = () => {
    const idPart = (quotation.quotationId || "quotation").replace(/\//g, "-");
    const statusPart = (quotation.status || "").toUpperCase();
    const base = statusPart ? `${idPart}-${statusPart}` : idPart;

    let ext = "";
    if (displayFileName) {
      const dot = displayFileName.lastIndexOf(".");
      if (dot !== -1) ext = displayFileName.slice(dot);
    }
    if (!ext) {
      const match = displayFileUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      ext = match ? `.${match[1]}` : "";
    }

    return `${base}${ext}`;
  };

  // Downloads the REAL uploaded file as-is (staffFileUrl / signedFileUrl)
  // — never re-rendered here.
  const handleDownloadTemplate = async () => {
    if (!displayFileUrl) {
      setError("No file has been uploaded for this quotation yet.");
      return;
    }
    setDownloadingTemplate(true);
    setError("");
    try {
      const check = await fetch(displayFileUrl, { method: "GET" });
      if (!check.ok) {
        const body = await check.text().catch(() => "");
        console.error("Cloudinary error body:", body);
        throw new Error(`Cloudinary returned ${check.status}`);
      }
      const blob = await check.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildDownloadFilename();
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file:", err);
      setError(
        "Failed to download file. Check the browser console for details.",
      );
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // Step 1: validate, then open the in-app confirmation dialog.
  const handleSendClick = () => {
    if (!displayFileUrl) {
      setError("No signed file available to send.");
      return;
    }
    if (!recipientEmail) {
      setError("This customer has no email on record.");
      return;
    }
    setError("");
    setShowSendConfirm(true);
  };

  // Step 2 (dialog's confirm button): email the signed file. The server
  // resolves the recipient itself. The modal stays open afterwards —
  // the user still has to click "Mark as Sent".
  const handleConfirmSend = async () => {
    if (sending) return; // ConfirmDialog's button can't be disabled
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/quotations/${idPath}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": sessionStorage.getItem("userRole") || "",
          "x-user-name": sessionStorage.getItem("username") || "",
        },
        body: JSON.stringify({
          sentBy: sessionStorage.getItem("username") || "",
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to send email");
      }
      setEmailSent({
        to: result.quotation?.emailSentTo || recipientEmail,
        at: result.quotation?.emailSentAt || new Date().toISOString(),
      });
      setShowSendConfirm(false);
      onSaved?.(result.quotation); // keeps the list row in sync (status unchanged)
    } catch (err) {
      console.error("Failed to send quotation:", err);
      setShowSendConfirm(false);
      setError(err.message || "Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsSent = async () => {
    setMarkingSent(true);
    setError("");
    try {
      const userName = sessionStorage.getItem("username") || "";
      const res = await fetch(`${API}/api/quotations/${idPath}/mark-sent`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentBy: userName }),
      });
      if (!res.ok) throw new Error("Failed to mark as sent");
      const result = await res.json();
      if (!result.success) throw new Error("Failed to mark as sent");
      onSaved?.(result.quotation);
      onClose();
    } catch (err) {
      console.error("Failed to mark as sent:", err);
      setError("Failed to mark as sent. Please try again.");
    } finally {
      setMarkingSent(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="qtn-modal-overlay">
      <div className="qtn-modal">
        <CdmsModalHeader
          title="QUOTATION INFORMATION DETAILS"
          onClose={onClose}
        />

        <div className="qtn-modal-body">
          {error && <div className="qtn-modal-error">{error}</div>}

          {stage === "check" && hasSignedCopy && (
            <div
              style={{
                background: "#e8f5e9",
                border: "1px solid #a5d6a7",
                color: "#1b5e20",
                padding: "8px 12px",
                borderRadius: 4,
                marginBottom: 10,
                fontSize: 13,
              }}
            >
              ✓ Signed copy ready
              {signedApprover ? (
                <>
                  {" "}
                  (approved by <strong>{signedApprover}</strong>)
                </>
              ) : null}
              . Click <strong>Save &amp; Move to Sending</strong> to send it to
              the next stage.
            </div>
          )}

          {config.showSend && emailSent && (
            <div
              style={{
                background: "#e8f5e9",
                border: "1px solid #a5d6a7",
                color: "#1b5e20",
                padding: "8px 12px",
                borderRadius: 4,
                marginBottom: 10,
                fontSize: 13,
              }}
            >
              ✓ Email sent to <strong>{emailSent.to}</strong> on{" "}
              {new Date(emailSent.at).toLocaleString()}. Click{" "}
              <strong>Mark as Sent</strong> to complete this quotation.
            </div>
          )}

          <div className="qtn-details-top-row">
            <div className="qtn-field">
              <label>Quotation ID</label>
              <input type="text" value={quotation.quotationId || ""} readOnly />
            </div>
            <div className="qtn-field">
              <label>Date</label>
              <input type="text" value={quotation.date || ""} readOnly />
            </div>
            <div className="qtn-field">
              <label>Customer ID</label>
              <input type="text" value={quotation.customerId || ""} readOnly />
            </div>
          </div>

          <div className="qtn-details-columns">
            <div className="qtn-details-col">
              <div className="qtn-field">
                <label>Company Name</label>
                <input
                  type="text"
                  value={quotation.companyName || ""}
                  readOnly
                />
              </div>
              <div className="qtn-field">
                <label>Address</label>
                <input type="text" value={quotation.address || ""} readOnly />
              </div>
              <div className="qtn-field">
                <label>Contact Info</label>
                <input
                  type="text"
                  value={quotation.contactInfo || ""}
                  readOnly
                />
              </div>
              <div className="qtn-field">
                <label>Contact Name</label>
                <input
                  type="text"
                  value={quotation.contactName || ""}
                  readOnly
                />
              </div>
              <div className="qtn-field">
                <label>Prepared By</label>
                <input
                  type="text"
                  value={quotation.preparedBy || ""}
                  readOnly
                />
              </div>

              {stage === "check" && (
                <div className="qtn-field">
                  <label>Approved By</label>
                  <select
                    value={selectedApproverUsername}
                    onChange={(e) =>
                      setSelectedApproverUsername(e.target.value)
                    }
                    disabled={loadingApprovers}
                  >
                    <option value="">
                      {loadingApprovers
                        ? "Loading..."
                        : "-- Select approver --"}
                    </option>
                    {approvers.map((a) => (
                      <option key={a.username} value={a.username}>
                        {a.name || a.username} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="qtn-details-divider" />

            <div className="qtn-details-col">
              <div className="qtn-field">
                <label>Reference</label>
                <input type="text" value={quotation.reference || ""} readOnly />
              </div>
              <div className="qtn-field">
                <label>Purchase Order</label>
                <input type="text" value={quotation.poNumber || ""} readOnly />
              </div>
              <div className="qtn-field">
                <label>Remarks</label>
                <textarea
                  className="qtn-remarks"
                  value={quotation.remarks || ""}
                  readOnly
                />
              </div>

              {config.showSend && (
                <div className="qtn-field">
                  <label>Send To (Company Email)</label>
                  <input
                    type="text"
                    value={
                      loadingRecipient
                        ? "Loading..."
                        : recipientEmail || "No email on customer record"
                    }
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={templateInputRef}
          style={{ display: "none" }}
          accept=".doc,.docx,.pdf"
          onChange={handleTemplateFileSelected}
        />

        {/* FOOTER — qtn-toolbar layout: primary actions (Save / Approve /
            Send / Mark as Sent) pinned left, file actions pinned right,
            matching the same gray action-bar pattern as AddQuotationModal */}
        <div className="qtn-modal-footer qtn-toolbar">
          <div className="qtn-toolbar-left">
            {config.showSave && (
              <button
                className="qtn-btn qtn-btn-primary"
                onClick={handleSave}
                disabled={
                  saving ||
                  (!pendingTemplateFile && !hasSignedCopy) ||
                  (stage === "check" && !selectedApproverUsername)
                }
                title={
                  !pendingTemplateFile && !hasSignedCopy
                    ? "Generate a signed copy (or re-upload a file) first"
                    : "Move this quotation to the For Sending stage"
                }
              >
                {saving ? "Saving..." : config.savingLabel}
              </button>
            )}

            {stage === "check" && (
              <button
                className="qtn-btn qtn-btn-primary"
                onClick={handleApprove}
                disabled={approving || !selectedApproverUsername}
                title={
                  !selectedApproverUsername
                    ? "Select an approver first"
                    : "Insert the approver's name and signature into the uploaded file"
                }
              >
                {approving ? "Approving..." : "Approve & Generate Signed Copy"}
              </button>
            )}

            {config.showSend && (
              <button
                className="qtn-btn qtn-btn-primary"
                onClick={handleSendClick}
                disabled={
                  sending ||
                  markingSent ||
                  loadingRecipient ||
                  !displayFileUrl ||
                  !recipientEmail
                }
                title={
                  !recipientEmail
                    ? "Add an email to this customer's record first"
                    : "Email the signed quotation to the company"
                }
              >
                {sending ? "Sending..." : emailSent ? "Resend" : "Send"}
              </button>
            )}

            {config.showMarkSent && (
              <button
                className={emailSent ? "qtn-btn qtn-btn-primary" : "qtn-btn"}
                onClick={handleMarkAsSent}
                disabled={markingSent || sending}
                title={
                  emailSent
                    ? "Complete this quotation and move it to Sent"
                    : "Use this if you already sent the file outside the system"
                }
              >
                {markingSent ? "Marking..." : "Mark as Sent"}
              </button>
            )}
          </div>

          <div className="qtn-toolbar-right">
            <button className="qtn-btn" onClick={() => setShowFiles(true)}>
              View Files
            </button>

            <button
              className="qtn-btn"
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate || !displayFileUrl}
              title={
                !displayFileUrl
                  ? "No file uploaded yet"
                  : "Download the current file for this stage"
              }
            >
              {downloadingTemplate ? "Downloading..." : "Download Template"}
            </button>

            <button className="qtn-btn" onClick={handleReuploadTemplate}>
              Re-upload Template
            </button>

            {pendingTemplateFile && (
              <span className="qtn-template-pending">
                📎 {pendingTemplateFile.name} — will upload on Save
              </span>
            )}
            {templateUploaded && !pendingTemplateFile && (
              <span className="qtn-template-uploaded">✓ Template uploaded</span>
            )}
          </div>

          {/* <button className="qtn-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="qtn-btn" onClick={handlePrint}>
            Print
          </button>
          <button className="qtn-btn" onClick={onClose}>
            Back
          </button>
          <button className="qtn-btn" onClick={onClose}>
            Exit
          </button> */}
        </div>
      </div>

      {showSendConfirm && (
        <ConfirmDialog
          title={emailSent ? "Resend Quotation" : "Send Quotation"}
          message={
            `Email ${quotation.quotationId} to ${recipientEmail}? ` +
            `The signed file will be attached.` +
            (emailSent ? " This quotation was already emailed once." : "")
          }
          confirmLabel={sending ? "Sending..." : "Yes, Send"}
          cancelLabel="Cancel"
          onConfirm={handleConfirmSend}
          // Ignore cancel / overlay clicks while the email is in flight.
          onCancel={() => {
            if (!sending) setShowSendConfirm(false);
          }}
        />
      )}

      {showFiles && (
        <QuotationFilesModal
          files={knownFiles}
          onClose={() => setShowFiles(false)}
        />
      )}
    </div>
  );
};

export default QuotationDetailsModal;
