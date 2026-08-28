// import React, { useState, useEffect, useRef } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import QuotationFilesModal from "./QuotationFilesModal";
// import "./QuotationDetailsModal.css";

// const API = import.meta.env.VITE_API_URL;

// /**
//  * QuotationDetailsModal — "Quotation Information Details" popup.
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
//  * and whether the "Mark as Sent" action shows up.
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
//  *       wants to hand-edit the file themselves.
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
//  *
//  * NOTE: PUT /api/quotations/:id (plain field save) only returns
//  * { success, quotationId } — NOT the updated document — per server
//  * code. So after a plain save (no file involved) we merge `form` into
//  * the existing `quotation` locally before calling onSaved. When a file
//  * upload / apply-approval route fires instead, ITS response body is
//  * the full updated document, so that's used directly.
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
//   },
//   send: {
//     displayFileField: "signedFileUrl",
//     displayFileNameField: "signedFileName",
//     uploadRoute: null,
//     uploadField: null,
//     requiresRoleHeader: false,
//     savingLabel: "Save",
//     showMarkSent: true,
//   },
// };

// const QuotationDetailsModal = ({
//   quotation,
//   onClose,
//   onSaved,
//   stage = "check",
// }) => {
//   const config = STAGE_CONFIG[stage] || STAGE_CONFIG.check;

//   const [form, setForm] = useState({
//     customerId: "",
//     companyName: "",
//     address: "",
//     contactInfo: "",
//     contactName: "",
//     reference: "",
//     poNumber: "",
//     remarks: "",
//   });
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
//     setForm({
//       customerId: quotation.customerId || "",
//       companyName: quotation.companyName || "",
//       address: quotation.address || "",
//       contactInfo: quotation.contactInfo || "",
//       contactName: quotation.contactName || "",
//       reference: quotation.reference || "",
//       poNumber: quotation.poNumber || "",
//       remarks: quotation.remarks || "",
//     });
//     setPendingTemplateFile(null);
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

//   const handleChange = (field) => (e) =>
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));

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

//   const handleSave = async () => {
//     setSaving(true);
//     setError("");

//     // On the check stage, an approver must be picked before the signed
//     // file goes up — that's who the "Approved by" name/signature on the
//     // final document will be.
//     if (stage === "check" && pendingTemplateFile && !selectedApproverUsername) {
//       setError("Please select who is approving this quotation before saving.");
//       setSaving(false);
//       return;
//     }

//     try {
//       const res = await fetch(`${API}/api/quotations/${idPath}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) throw new Error("Failed to save quotation");
//       let updated = { ...quotation, ...form };

//       if (pendingTemplateFile && config.uploadRoute) {
//         const formData = new FormData();
//         formData.append(config.uploadField, pendingTemplateFile);

//         if (selectedApprover) {
//           formData.append("approverUsername", selectedApprover.username);
//           formData.append(
//             "approverName",
//             selectedApprover.name || selectedApprover.username,
//           );
//         }

//         const headers = {};
//         if (config.requiresRoleHeader) {
//           headers["x-user-role"] = sessionStorage.getItem("userRole") || "";
//           headers["x-user-name"] = sessionStorage.getItem("username") || "";
//         }

//         const uploadRes = await fetch(
//           `${API}/api/quotations/${idPath}/${config.uploadRoute}`,
//           { method: "PUT", headers, body: formData },
//         );
//         if (!uploadRes.ok) {
//           if (uploadRes.status === 403) {
//             throw new Error("Checker role required to upload the signed file.");
//           }
//           throw new Error("Failed to upload file");
//         }
//         const uploadResult = await uploadRes.json();
//         if (!uploadResult.success) throw new Error("Failed to upload file");

//         updated = uploadResult.quotation;
//         setPendingTemplateFile(null);
//       }

//       onSaved?.(updated);
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
//               <div className="qtn-field-with-icon">
//                 <input
//                   type="text"
//                   value={form.customerId}
//                   onChange={handleChange("customerId")}
//                 />
//                 <button
//                   type="button"
//                   className="qtn-icon-btn"
//                   title="Search customer"
//                 >
//                   🔍
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="qtn-details-columns">
//             <div className="qtn-details-col">
//               <div className="qtn-field">
//                 <label>Company Name</label>
//                 <input
//                   type="text"
//                   value={form.companyName}
//                   onChange={handleChange("companyName")}
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Address</label>
//                 <textarea
//                   value={form.address}
//                   onChange={handleChange("address")}
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Contact Info</label>
//                 <textarea
//                   value={form.contactInfo}
//                   onChange={handleChange("contactInfo")}
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Contact Name</label>
//                 <div className="qtn-field-with-icon">
//                   <select
//                     value={form.contactName}
//                     onChange={handleChange("contactName")}
//                   >
//                     {form.contactName && (
//                       <option value={form.contactName}>
//                         {form.contactName}
//                       </option>
//                     )}
//                   </select>
//                   <button
//                     type="button"
//                     className="qtn-icon-btn"
//                     title="Add contact"
//                   >
//                     +
//                   </button>
//                 </div>
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
//                   value={form.reference}
//                   onChange={handleChange("reference")}
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Purchase Order</label>
//                 <input
//                   type="text"
//                   value={form.poNumber}
//                   onChange={handleChange("poNumber")}
//                 />
//               </div>
//               <div className="qtn-field">
//                 <label>Remarks</label>
//                 <textarea
//                   className="qtn-remarks"
//                   value={form.remarks}
//                   onChange={handleChange("remarks")}
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

//         <div className="qtn-modal-footer">
//           <button
//             className="qtn-btn qtn-btn-primary"
//             onClick={handleSave}
//             disabled={
//               saving ||
//               (stage === "check" &&
//                 pendingTemplateFile &&
//                 !selectedApproverUsername)
//             }
//           >
//             {saving
//               ? "Saving..."
//               : pendingTemplateFile
//                 ? config.savingLabel
//                 : "Save"}
//           </button>

//           {stage === "check" && (
//             <button
//               className="qtn-btn qtn-btn-primary"
//               onClick={handleApprove}
//               disabled={approving || !selectedApproverUsername}
//               title={
//                 !selectedApproverUsername
//                   ? "Select an approver first"
//                   : "Insert the approver's name and signature into the uploaded file"
//               }
//             >
//               {approving ? "Approving..." : "Approve & Generate Signed Copy"}
//             </button>
//           )}

//           {config.showMarkSent && (
//             <button
//               className="qtn-btn qtn-btn-primary"
//               onClick={handleMarkAsSent}
//               disabled={markingSent}
//             >
//               {markingSent ? "Marking..." : "Mark as Sent"}
//             </button>
//           )}

//           <button className="qtn-btn" onClick={() => setShowFiles(true)}>
//             View Files
//           </button>

//           <button
//             className="qtn-btn"
//             onClick={handleDownloadTemplate}
//             disabled={downloadingTemplate || !displayFileUrl}
//             title={
//               !displayFileUrl
//                 ? "No file uploaded yet"
//                 : "Download the current file for this stage"
//             }
//           >
//             {downloadingTemplate ? "Downloading..." : "Download Template"}
//           </button>

//           <button className="qtn-btn" onClick={handleReuploadTemplate}>
//             Re-upload Template
//           </button>

//           {pendingTemplateFile && (
//             <span className="qtn-template-pending">
//               📎 {pendingTemplateFile.name} — will upload on Save
//             </span>
//           )}
//           {templateUploaded && !pendingTemplateFile && (
//             <span className="qtn-template-uploaded">✓ Template uploaded</span>
//           )}

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
import "./QuotationDetailsModal.css";

const API = import.meta.env.VITE_API_URL;

/**
 * QuotationDetailsModal — "Quotation Information Details" popup.
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
 * and whether the "Mark as Sent" action shows up.
 *
 * Pipeline (per real backend routes):
 *   AddQuotation (create + attach template) -> status "For Checking"
 *     staffFileUrl/staffFileName set by PUT /:id/upload-template.
 *     This is a ONE-TIME docxtemplater render — the "Approved by" tags
 *     in the master template use [[ ]] delimiters specifically so this
 *     first render (which uses default { } delimiters) does NOT touch
 *     them, leaving them alive for a later second pass.
 *   Qtn For Check:
 *     - Download Template here fetches the REAL uploaded file as-is
 *       (staffFileUrl / signedFileUrl) — never re-rendered — so
 *       whatever the staff actually typed into the table/fields is
 *       what you see. No signature yet unless already approved.
 *     - Re-upload Template + Save: manual override path, uploads
 *       whatever file you pick via PUT /:id/upload-signed -> status
 *       "For Sending". Still supported for cases where the checker
 *       wants to hand-edit the file themselves.
 *     - "Approve & Generate Signed Copy" (new): picks up whichever
 *       file currently represents the real content (signedFileUrl if
 *       it exists, otherwise staffFileUrl), runs a SECOND docxtemplater
 *       pass using [[ ]] delimiters against just the approvedBy /
 *       adminSignature tags, and re-uploads the result — so the real
 *       content the staff typed stays completely untouched while the
 *       approver's name + signature get inserted automatically.
 *       PUT /:id/apply-approval -> status "For Sending".
 *   Qtn For Send: "Mark as Sent" -> status "Sent"
 *     PUT /:id/mark-sent, body { sentBy } -> sets sentBy + sentAt
 *
 * NOTE: PUT /api/quotations/:id (plain field save) only returns
 * { success, quotationId } — NOT the updated document — per server
 * code. So after a plain save (no file involved) we merge `form` into
 * the existing `quotation` locally before calling onSaved. When a file
 * upload / apply-approval route fires instead, ITS response body is
 * the full updated document, so that's used directly.
 *
 * Approver selection (check stage only): the checker doesn't have to be
 * the one whose name/signature appears as "Approved by" on the final
 * document. GET /api/users is fetched and filtered down to admin +
 * technician accounts; whichever one is selected is used either by
 * "Approve & Generate Signed Copy" (apply-approval route) or, if a file
 * is staged via Re-upload Template, sent along with that upload as
 * approverUsername/approverName so the server stores those as
 * checkedBy/checkedByUsername too. Assumes GET /api/users returns
 * objects shaped like { username, name, role } — matches the actual
 * users collection schema (confirmed via authRoutes.js's /register).
 *
 * "View Files" — there is no GET /:id/files route on the server. All
 * file URLs already live directly on the quotation document
 * (staffFileUrl, signedFileUrl, clientProofUrl), so this reads those
 * off the prop instead of fetching anything. Shown via QuotationFilesModal.
 *
 * Download filenames: prefer the real extension from staffFileName /
 * signedFileName (saved server-side as of this version). Falls back to
 * parsing the extension off the file URL for older records that predate
 * signedFileName existing — those may still come through
 * extension-less if the original Cloudinary asset itself has none.
 *
 * Logged-in user info lives in sessionStorage (confirmed keys):
 *   userRole  -> "admin" | "clerk" | ... (sent as x-user-role header)
 *   username  -> e.g. "admin1"           (sent as x-user-name header /
 *                                          used as sentBy on mark-sent)
 */

const STAGE_CONFIG = {
  check: {
    displayFileField: "staffFileUrl",
    displayFileNameField: "staffFileName",
    uploadRoute: "upload-signed",
    uploadField: "file",
    requiresRoleHeader: true,
    savingLabel: "Save & Move to Sending",
    showMarkSent: false,
  },
  send: {
    displayFileField: "signedFileUrl",
    displayFileNameField: "signedFileName",
    uploadRoute: null,
    uploadField: null,
    requiresRoleHeader: false,
    savingLabel: "Save",
    showMarkSent: true,
  },
};

const QuotationDetailsModal = ({
  quotation,
  onClose,
  onSaved,
  stage = "check",
}) => {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.check;

  const [form, setForm] = useState({
    customerId: "",
    companyName: "",
    address: "",
    contactInfo: "",
    contactName: "",
    reference: "",
    poNumber: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [pendingTemplateFile, setPendingTemplateFile] = useState(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);

  // --- Approver selection (check stage only) --------------------------
  // Who actually gets credited/signed as "Approved by" on the final
  // document — not necessarily whoever is logged in doing the upload.
  const [approvers, setApprovers] = useState([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [selectedApproverUsername, setSelectedApproverUsername] = useState("");

  // --- Approve & Generate Signed Copy (second render pass) -----------
  const [approving, setApproving] = useState(false);

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

  useEffect(() => {
    if (!quotation) return;
    setForm({
      customerId: quotation.customerId || "",
      companyName: quotation.companyName || "",
      address: quotation.address || "",
      contactInfo: quotation.contactInfo || "",
      contactName: quotation.contactName || "",
      reference: quotation.reference || "",
      poNumber: quotation.poNumber || "",
      remarks: quotation.remarks || "",
    });
    setPendingTemplateFile(null);
    // Pre-select if this record was already checked before (re-opening
    // a "For Sending" record), otherwise starts blank.
    setSelectedApproverUsername(quotation.checkedByUsername || "");
  }, [quotation]);

  if (!quotation) return null;

  const idPath = encodeURIComponent(quotation.quotationId);

  const displayFileUrl = quotation[config.displayFileField] || "";
  const displayFileName = quotation[config.displayFileNameField] || "";
  const templateUploaded = Boolean(displayFileUrl);

  const selectedApprover = approvers.find(
    (a) => a.username === selectedApproverUsername,
  );

  const knownFiles = [
    {
      url: quotation.staffFileUrl,
      filename: quotation.staffFileName || "Staff Template",
      label: "Quotation Template",
    },
    {
      url: quotation.signedFileUrl,
      filename: quotation.signedFileName || "Signed File",
      label: "Signed Quotation",
    },
    {
      url: quotation.clientProofUrl,
      filename: quotation.clientProofName || "Client Proof",
      label: "Client Proof",
    },
  ].filter((f) => f.url);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

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

  const handleSave = async () => {
    setSaving(true);
    setError("");

    // On the check stage, an approver must be picked before the signed
    // file goes up — that's who the "Approved by" name/signature on the
    // final document will be.
    if (stage === "check" && pendingTemplateFile && !selectedApproverUsername) {
      setError("Please select who is approving this quotation before saving.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/quotations/${idPath}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save quotation");
      let updated = { ...quotation, ...form };

      if (pendingTemplateFile && config.uploadRoute) {
        const formData = new FormData();
        formData.append(config.uploadField, pendingTemplateFile);

        if (selectedApprover) {
          formData.append("approverUsername", selectedApprover.username);
          formData.append(
            "approverName",
            selectedApprover.name || selectedApprover.username,
          );
        }

        const headers = {};
        if (config.requiresRoleHeader) {
          headers["x-user-role"] = sessionStorage.getItem("userRole") || "";
          headers["x-user-name"] = sessionStorage.getItem("username") || "";
        }

        const uploadRes = await fetch(
          `${API}/api/quotations/${idPath}/${config.uploadRoute}`,
          { method: "PUT", headers, body: formData },
        );
        if (!uploadRes.ok) {
          if (uploadRes.status === 403) {
            throw new Error("Checker role required to upload the signed file.");
          }
          throw new Error("Failed to upload file");
        }
        const uploadResult = await uploadRes.json();
        if (!uploadResult.success) throw new Error("Failed to upload file");

        updated = uploadResult.quotation;
        setPendingTemplateFile(null);
      }

      onSaved?.(updated);
      onClose();
    } catch (err) {
      console.error("Failed to save quotation:", err);
      setError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Runs the second docxtemplater pass (server-side) against whichever
  // file currently holds the real content, inserting only the selected
  // approver's name + signature via [[ ]]-delimited tags. Leaves
  // everything the staff typed completely untouched.
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

      // Immediately download the newly generated signed copy so there's
      // a visible result instead of the modal just quietly closing.
      const signedUrl = result.quotation?.signedFileUrl;
      if (signedUrl) {
        const fileRes = await fetch(signedUrl);
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

      onSaved?.(result.quotation);
      onClose();
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
  // — never re-rendered here — so whatever the staff actually typed
  // into the document is exactly what you get. Signature only appears
  // once "Approve & Generate Signed Copy" has actually run.
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
              <div className="qtn-field-with-icon">
                <input
                  type="text"
                  value={form.customerId}
                  onChange={handleChange("customerId")}
                />
                <button
                  type="button"
                  className="qtn-icon-btn"
                  title="Search customer"
                >
                  🔍
                </button>
              </div>
            </div>
          </div>

          <div className="qtn-details-columns">
            <div className="qtn-details-col">
              <div className="qtn-field">
                <label>Company Name</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={handleChange("companyName")}
                />
              </div>
              <div className="qtn-field">
                <label>Address</label>
                <textarea
                  value={form.address}
                  onChange={handleChange("address")}
                />
              </div>
              <div className="qtn-field">
                <label>Contact Info</label>
                <textarea
                  value={form.contactInfo}
                  onChange={handleChange("contactInfo")}
                />
              </div>
              <div className="qtn-field">
                <label>Contact Name</label>
                <div className="qtn-field-with-icon">
                  <select
                    value={form.contactName}
                    onChange={handleChange("contactName")}
                  >
                    {form.contactName && (
                      <option value={form.contactName}>
                        {form.contactName}
                      </option>
                    )}
                  </select>
                  <button
                    type="button"
                    className="qtn-icon-btn"
                    title="Add contact"
                  >
                    +
                  </button>
                </div>
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
                <input
                  type="text"
                  value={form.reference}
                  onChange={handleChange("reference")}
                />
              </div>
              <div className="qtn-field">
                <label>Purchase Order</label>
                <input
                  type="text"
                  value={form.poNumber}
                  onChange={handleChange("poNumber")}
                />
              </div>
              <div className="qtn-field">
                <label>Remarks</label>
                <textarea
                  className="qtn-remarks"
                  value={form.remarks}
                  onChange={handleChange("remarks")}
                />
              </div>
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
            Mark as Sent) pinned left, file actions pinned right, matching
            the same gray action-bar pattern as AddQuotationModal */}
        <div className="qtn-modal-footer qtn-toolbar">
          <div className="qtn-toolbar-left">
            <button
              className="qtn-btn qtn-btn-primary"
              onClick={handleSave}
              disabled={
                saving ||
                (stage === "check" &&
                  pendingTemplateFile &&
                  !selectedApproverUsername)
              }
            >
              {saving
                ? "Saving..."
                : pendingTemplateFile
                  ? config.savingLabel
                  : "Save"}
            </button>

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

            {config.showMarkSent && (
              <button
                className="qtn-btn qtn-btn-primary"
                onClick={handleMarkAsSent}
                disabled={markingSent}
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
