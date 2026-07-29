// import React, { useState, useEffect, useRef } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
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
//  *     staffFileUrl/staffFileName set by PUT /:id/upload-template
//  *   Qtn For Check: re-upload signed file + Save -> status "For Sending"
//  *     signedFileUrl/signedFileName set by PUT /:id/upload-signed
//  *     (requires x-user-role: admin|clerk; server reads x-user-name
//  *     into checkedBy)
//  *   Qtn For Send: "Mark as Sent" -> status "Sent"
//  *     PUT /:id/mark-sent, body { sentBy } -> sets sentBy + sentAt
//  *
//  * NOTE: PUT /api/quotations/:id (plain field save) only returns
//  * { success, quotationId } — NOT the updated document — per server
//  * code. So after a plain save (no file involved) we merge `form` into
//  * the existing `quotation` locally before calling onSaved. When a file
//  * upload route fires instead, ITS response body is the full updated
//  * document, so that's used directly.
//  *
//  * "View Files" — there is no GET /:id/files route on the server. All
//  * file URLs already live directly on the quotation document
//  * (staffFileUrl, signedFileUrl, clientProofUrl), so this reads those
//  * off the prop instead of fetching anything.
//  *
//  * Download filenames: prefer the real extension from staffFileName /
//  * signedFileName (saved server-side as of this version). Falls back to
//  * parsing the extension off the file URL for older records uploaded
//  * before signedFileName existed — those may still come through
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

//   const templateInputRef = useRef(null);

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
//   }, [quotation]);

//   if (!quotation) return null;

//   const idPath = encodeURIComponent(quotation.quotationId);

//   const displayFileUrl = quotation[config.displayFileField] || "";
//   const displayFileName = quotation[config.displayFileNameField] || "";
//   const templateUploaded = Boolean(displayFileUrl);

//   const knownFiles = [
//     {
//       url: quotation.staffFileUrl,
//       name: quotation.staffFileName || "Staff Template",
//     },
//     {
//       url: quotation.signedFileUrl,
//       name: quotation.signedFileName || "Signed File",
//     },
//     {
//       url: quotation.clientProofUrl,
//       name: quotation.clientProofName || "Client Proof",
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

//         {showFiles && (
//           <div className="qtn-files-panel">
//             {knownFiles.length === 0 && (
//               <div>No files attached to this quotation.</div>
//             )}
//             {knownFiles.length > 0 && (
//               <ul>
//                 {knownFiles.map((f, idx) => (
//                   <li key={f.url || idx}>
//                     <a href={f.url} target="_blank" rel="noreferrer">
//                       {f.name}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}

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
//             disabled={saving}
//           >
//             {saving
//               ? "Saving..."
//               : pendingTemplateFile
//                 ? config.savingLabel
//                 : "Save"}
//           </button>

//           {config.showMarkSent && (
//             <button
//               className="qtn-btn qtn-btn-primary"
//               onClick={handleMarkAsSent}
//               disabled={markingSent}
//             >
//               {markingSent ? "Marking..." : "Mark as Sent"}
//             </button>
//           )}

//           <button className="qtn-btn" onClick={() => setShowFiles((v) => !v)}>
//             {showFiles ? "Hide Files" : "View Files"}
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
 *     staffFileUrl/staffFileName set by PUT /:id/upload-template
 *   Qtn For Check: re-upload signed file + Save -> status "For Sending"
 *     signedFileUrl/signedFileName set by PUT /:id/upload-signed
 *     (requires x-user-role: admin|clerk; server reads x-user-name
 *     into checkedBy)
 *   Qtn For Send: "Mark as Sent" -> status "Sent"
 *     PUT /:id/mark-sent, body { sentBy } -> sets sentBy + sentAt
 *
 * NOTE: PUT /api/quotations/:id (plain field save) only returns
 * { success, quotationId } — NOT the updated document — per server
 * code. So after a plain save (no file involved) we merge `form` into
 * the existing `quotation` locally before calling onSaved. When a file
 * upload route fires instead, ITS response body is the full updated
 * document, so that's used directly.
 *
 * "View Files" — there is no GET /:id/files route on the server. All
 * file URLs already live directly on the quotation document
 * (staffFileUrl, signedFileUrl, clientProofUrl), so this reads those
 * off the prop instead of fetching anything. Shown via QuotationFilesModal.
 *
 * Download filenames: prefer the real extension from staffFileName /
 * signedFileName (saved server-side as of this version). Falls back to
 * parsing the extension off the file URL for older records uploaded
 * before signedFileName existed — those may still come through
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

  const templateInputRef = useRef(null);

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
  }, [quotation]);

  if (!quotation) return null;

  const idPath = encodeURIComponent(quotation.quotationId);

  const displayFileUrl = quotation[config.displayFileField] || "";
  const displayFileName = quotation[config.displayFileNameField] || "";
  const templateUploaded = Boolean(displayFileUrl);

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

        <div className="qtn-modal-footer">
          <button
            className="qtn-btn qtn-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : pendingTemplateFile
                ? config.savingLabel
                : "Save"}
          </button>

          {config.showMarkSent && (
            <button
              className="qtn-btn qtn-btn-primary"
              onClick={handleMarkAsSent}
              disabled={markingSent}
            >
              {markingSent ? "Marking..." : "Mark as Sent"}
            </button>
          )}

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
