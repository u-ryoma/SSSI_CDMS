import React, { useState, useEffect, useRef } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import "./QuotationDetailsModal.css";

const API = import.meta.env.VITE_API_URL;

/**
 * Real backend routes (confirmed from server code):
 *   PUT  /api/quotations/:id/upload-template   (multipart field "file")
 *        -> { success, quotation } — sets status "For Checking", stores
 *           quotation.staffFileUrl (Cloudinary URL)
 *   PUT  /api/quotations/:id/upload-signed     (multipart field "file")
 *        -> { success, quotation } — requires header x-user-role to be
 *           "admin" or "clerk", sets status "For Sending", stores
 *           quotation.signedFileUrl. This is what "Upload PDF" maps to
 *           in the checker flow.
 *
 * "Download Template" here is NOT the docx-generation route
 * (GET /:id/download-template, which renders a fresh docx from the
 * master template) — that route belongs to the "preview/generate a
 * blank-ish quotation doc" flow. What this modal needs instead is the
 * ACTUAL file the staff attached via AddQuotationModal's "Re-upload
 * Template" -> Save flow, which already lives on the record as
 * quotation.staffFileUrl. So Download Template just serves that
 * Cloudinary URL directly — no backend call needed at all.
 *
 * "View Files" doesn't need a fetch either — staffFileUrl/signedFileUrl
 * already live on the quotation object passed into this modal.
 *
 * NOTE: x-user-role / x-user-name below are read from localStorage as a
 * placeholder — swap in however your app actually stores the logged-in
 * user/role (context, auth hook, etc).
 */

/**
 * QuotationDetailsModal — "Quotation Information Details" popup.
 *
 * Opened by clicking a row in QtnForCheck (or any other quotation list).
 * Receives the already-fetched quotation row as a prop, so no extra
 * network round-trip is needed just to open it.
 *
 * Fields mirror the quotation schema referenced in QtnForCheck:
 * quotationId, date, customerId, companyName, address, contactInfo,
 * contactName, reference, poNumber, remarks, preparedBy (+ checkedBy,
 * sentBy which live elsewhere in the flow and aren't edited here).
 *
 * Quotation ID / Date / Prepared By are shown read-only (grey, like the
 * mock) since those are set when the quotation was first created.
 * Everything else is editable so the checker can correct details before
 * saving.
 */
const QuotationDetailsModal = ({ quotation, onClose, onSaved }) => {
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

  // Real source of truth for "has a template been uploaded" — the file
  // URL staff attached via AddQuotationModal's Re-upload Template flow
  // (PUT .../upload-template), not a nonexistent `templateUploaded` flag.
  const [staffFileUrl, setStaffFileUrl] = useState(
    quotation?.staffFileUrl || "",
  );
  const templateUploaded = Boolean(staffFileUrl);

  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [files, setFiles] = useState(null); // null = not fetched yet
  const [showFiles, setShowFiles] = useState(false);

  const templateInputRef = useRef(null);
  const pdfInputRef = useRef(null);

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
    setStaffFileUrl(quotation.staffFileUrl || "");
  }, [quotation]);

  if (!quotation) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/api/quotations/${quotation.quotationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (!res.ok) throw new Error("Failed to save quotation");
      const updated = await res.json();
      onSaved?.(updated);
      onClose();
    } catch (err) {
      console.error("Failed to save quotation:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Re-upload Template: clicking the button just opens the hidden file
  // picker; the actual PUT fires once a file is chosen below.
  const handleReuploadTemplate = () => {
    templateInputRef.current?.click();
  };

  const handleTemplateFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same filename later
    if (!file) return;

    setUploadingTemplate(true);
    setError("");
    try {
      const formData = new FormData();
      // Field name must be "file" — matches upload.single("file") on the
      // backend. (Previously sent as "template", which the backend
      // never reads, so the upload would silently 400 on req.file.)
      formData.append("file", file);

      const res = await fetch(
        `${API}/api/quotations/${quotation.quotationId}/upload-template`,
        { method: "PUT", body: formData },
      );
      if (!res.ok) throw new Error("Failed to upload template");
      const result = await res.json();
      if (!result.success) throw new Error("Failed to upload template");

      // Response shape is { success, quotation }, not the quotation
      // itself — unwrap it before reading staffFileUrl / passing it up.
      setStaffFileUrl(result.quotation.staffFileUrl);
      onSaved?.(result.quotation);
    } catch (err) {
      console.error("Failed to upload template:", err);
      setError("Failed to upload template. Please try again.");
    } finally {
      setUploadingTemplate(false);
    }
  };

  // Downloads the exact file the staff attached (quotation.staffFileUrl),
  // NOT a freshly-generated docx. There's no backend call here — the URL
  // already lives on the record after upload-template runs; we just force
  // Cloudinary to serve it as an attachment instead of opening inline.
  const handleDownloadTemplate = () => {
    if (!staffFileUrl) {
      setError("No template has been uploaded for this quotation yet.");
      return;
    }
    setDownloadingTemplate(true);
    setError("");
    try {
      const attachmentUrl = staffFileUrl.replace(
        "/upload/",
        "/upload/fl_attachment/",
      );
      const link = document.createElement("a");
      link.href = attachmentUrl;
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleUploadPdf = () => {
    pdfInputRef.current?.click();
  };

  const handlePdfFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingPdf(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const res = await fetch(
        `${API}/api/quotations/${quotation.quotationId}/upload-pdf`,
        { method: "POST", body: formData },
      );
      if (!res.ok) throw new Error("Failed to upload PDF");
      const updated = await res.json().catch(() => null);
      if (updated) onSaved?.(updated);
    } catch (err) {
      console.error("Failed to upload PDF:", err);
      setError("Failed to upload PDF. Please try again.");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleViewFiles = async () => {
    // Toggle closed if already open and already loaded.
    if (showFiles) {
      setShowFiles(false);
      return;
    }
    setShowFiles(true);
    setLoadingFiles(true);
    setError("");
    try {
      const res = await fetch(
        `${API}/api/quotations/${quotation.quotationId}/files`,
      );
      if (!res.ok) throw new Error("Failed to load files");
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setError("Failed to load files for this quotation.");
      setFiles([]);
    } finally {
      setLoadingFiles(false);
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

        {showFiles && (
          <div className="qtn-files-panel">
            {loadingFiles && <div>Loading files...</div>}
            {!loadingFiles && files && files.length === 0 && (
              <div>No files attached to this quotation.</div>
            )}
            {!loadingFiles && files && files.length > 0 && (
              <ul>
                {files.map((f, idx) => (
                  <li key={f.url || idx}>
                    <a href={f.url} target="_blank" rel="noreferrer">
                      {f.name || `File ${idx + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <input
          type="file"
          ref={templateInputRef}
          style={{ display: "none" }}
          accept=".doc,.docx,.pdf"
          onChange={handleTemplateFileSelected}
        />
        <input
          type="file"
          accept="application/pdf"
          ref={pdfInputRef}
          style={{ display: "none" }}
          onChange={handlePdfFileSelected}
        />

        <div className="qtn-modal-footer">
          <button
            className="qtn-btn qtn-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            className="qtn-btn"
            onClick={handleUploadPdf}
            disabled={uploadingPdf}
          >
            {uploadingPdf ? "Uploading..." : "Upload PDF"}
          </button>
          <button
            className="qtn-btn"
            onClick={handleViewFiles}
            disabled={loadingFiles}
          >
            {loadingFiles ? "Loading..." : "View Files"}
          </button>
          <button
            className="qtn-btn"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate || !staffFileUrl}
            title={
              !staffFileUrl
                ? "No template uploaded yet"
                : "Download the staff-uploaded template"
            }
          >
            {downloadingTemplate ? "Downloading..." : "Download Template"}
          </button>
          <button
            className="qtn-btn"
            onClick={handleReuploadTemplate}
            disabled={uploadingTemplate}
          >
            {uploadingTemplate ? "Uploading..." : "Re-upload Template"}
          </button>
          {templateUploaded && (
            <span className="qtn-template-uploaded">✓ Template uploaded</span>
          )}
          <button className="qtn-btn" onClick={onClose}>
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailsModal;
// import React, { useState, useEffect, useRef } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import "./QuotationDetailsModal.css";

// const API = import.meta.env.VITE_API_URL;

// /**
//  * Real backend routes (confirmed from server code):
//  *   PUT  /api/quotations/:id/upload-template   (multipart field "file")
//  *        -> { success, quotation } — sets status "For Checking", stores
//  *           quotation.staffFileUrl (Cloudinary URL, with extension baked
//  *           into the public_id server-side) and quotation.staffFileName
//  *           (original filename, kept for reference).
//  *   PUT  /api/quotations/:id/upload-signed     (multipart field "file")
//  *        -> { success, quotation } — requires header x-user-role to be
//  *           "admin" or "clerk", sets status "For Sending", stores
//  *           quotation.signedFileUrl. This is what "Upload PDF" maps to
//  *           in the checker flow.
//  *
//  * "Download Template" here is NOT the docx-generation route
//  * (GET /:id/download-template, which renders a fresh docx from the
//  * master template) — that route belongs to a separate "preview/generate
//  * a blank-ish quotation doc" flow. What this modal needs instead is the
//  * ACTUAL file staff attached via AddQuotationModal's "Re-upload
//  * Template" -> Save flow, which already lives on the record as
//  * quotation.staffFileUrl. So Download Template just serves that
//  * Cloudinary URL directly — no backend call needed at all — and renames
//  * it on the fly via Cloudinary's fl_attachment:<filename> transform to
//  * something like "QTN-0005-26-FOR CHECKING.docx".
//  *
//  * "View Files" doesn't need a fetch either — staffFileUrl/signedFileUrl
//  * already live on the quotation object passed into this modal.
//  *
//  * NOTE: x-user-role / x-user-name below are read from localStorage as a
//  * placeholder — swap in however your app actually stores the logged-in
//  * user/role (context, auth hook, etc).
//  */

// /**
//  * QuotationDetailsModal — "Quotation Information Details" popup.
//  *
//  * Opened by clicking a row in QtnForCheck (or any other quotation list).
//  * Receives the already-fetched quotation row as a prop, so no extra
//  * network round-trip is needed just to open it.
//  *
//  * Fields mirror the quotation schema referenced in QtnForCheck:
//  * quotationId, date, customerId, companyName, address, contactInfo,
//  * contactName, reference, poNumber, remarks, preparedBy (+ checkedBy,
//  * sentBy which live elsewhere in the flow and aren't edited here).
//  *
//  * Quotation ID / Date / Prepared By are shown read-only (grey, like the
//  * mock) since those are set when the quotation was first created.
//  * Everything else is editable so the checker can correct details before
//  * saving.
//  */
// const QuotationDetailsModal = ({ quotation, onClose, onSaved }) => {
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

//   // Real source of truth for "has a template been uploaded" — the file
//   // URL staff attached via AddQuotationModal's Re-upload Template flow
//   // (PUT .../upload-template), not a nonexistent `templateUploaded` flag.
//   const [staffFileUrl, setStaffFileUrl] = useState(
//     quotation?.staffFileUrl || "",
//   );
//   const templateUploaded = Boolean(staffFileUrl);

//   const [uploadingTemplate, setUploadingTemplate] = useState(false);
//   const [uploadingPdf, setUploadingPdf] = useState(false);
//   const [downloadingTemplate, setDownloadingTemplate] = useState(false);
//   const [loadingFiles, setLoadingFiles] = useState(false);
//   const [files, setFiles] = useState(null); // null = not fetched yet
//   const [showFiles, setShowFiles] = useState(false);

//   const templateInputRef = useRef(null);
//   const pdfInputRef = useRef(null);

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
//     setStaffFileUrl(quotation.staffFileUrl || "");
//   }, [quotation]);

//   if (!quotation) return null;

//   const handleChange = (field) => (e) =>
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));

//   const handleSave = async () => {
//     setSaving(true);
//     setError("");
//     try {
//       const res = await fetch(
//         `${API}/api/quotations/${quotation.quotationId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(form),
//         },
//       );
//       if (!res.ok) throw new Error("Failed to save quotation");
//       const updated = await res.json();
//       onSaved?.(updated);
//       onClose();
//     } catch (err) {
//       console.error("Failed to save quotation:", err);
//       setError("Failed to save changes. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Re-upload Template: clicking the button just opens the hidden file
//   // picker; the actual PUT fires once a file is chosen below.
//   const handleReuploadTemplate = () => {
//     templateInputRef.current?.click();
//   };

//   const handleTemplateFileSelected = async (e) => {
//     const file = e.target.files?.[0];
//     e.target.value = ""; // allow re-selecting the same filename later
//     if (!file) return;

//     setUploadingTemplate(true);
//     setError("");
//     try {
//       const formData = new FormData();
//       // Field name must be "file" — matches upload.single("file") on the
//       // backend.
//       formData.append("file", file);

//       const res = await fetch(
//         `${API}/api/quotations/${quotation.quotationId}/upload-template`,
//         { method: "PUT", body: formData },
//       );
//       if (!res.ok) throw new Error("Failed to upload template");
//       const result = await res.json();
//       if (!result.success) throw new Error("Failed to upload template");

//       // Response shape is { success, quotation }, not the quotation
//       // itself — unwrap it before reading staffFileUrl / passing it up.
//       setStaffFileUrl(result.quotation.staffFileUrl);
//       onSaved?.(result.quotation);
//     } catch (err) {
//       console.error("Failed to upload template:", err);
//       setError("Failed to upload template. Please try again.");
//     } finally {
//       setUploadingTemplate(false);
//     }
//   };

//   // Builds "QTN-0005-26-FOR CHECKING" from the quotation's real ID/status,
//   // so the downloaded filename always matches what's actually being
//   // checked instead of Cloudinary's raw timestamp-based public_id.
//   const buildDownloadFilename = () => {
//     const idPart = (quotation.quotationId || "quotation").replace(/\//g, "-");
//     const statusPart = (quotation.status || "FOR CHECKING").toUpperCase();
//     return `${idPart}-${statusPart}`;
//   };

//   // Downloads the exact file the staff attached (quotation.staffFileUrl).
//   // fl_attachment:<filename> tells Cloudinary to rename the download on
//   // the fly — it still appends the correct extension automatically, so
//   // this doesn't depend on the stored public_id having one.
//   const handleDownloadTemplate = () => {
//     if (!staffFileUrl) {
//       setError("No template has been uploaded for this quotation yet.");
//       return;
//     }
//     setDownloadingTemplate(true);
//     setError("");
//     try {
//       const filename = encodeURIComponent(buildDownloadFilename());
//       const attachmentUrl = staffFileUrl.replace(
//         "/upload/",
//         `/upload/fl_attachment:${filename}/`,
//       );
//       const link = document.createElement("a");
//       link.href = attachmentUrl;
//       link.rel = "noopener noreferrer";
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } finally {
//       setDownloadingTemplate(false);
//     }
//   };

//   const handleUploadPdf = () => {
//     pdfInputRef.current?.click();
//   };

//   const handlePdfFileSelected = async (e) => {
//     const file = e.target.files?.[0];
//     e.target.value = "";
//     if (!file) return;

//     setUploadingPdf(true);
//     setError("");
//     try {
//       const formData = new FormData();
//       formData.append("pdf", file);

//       const res = await fetch(
//         `${API}/api/quotations/${quotation.quotationId}/upload-pdf`,
//         { method: "POST", body: formData },
//       );
//       if (!res.ok) throw new Error("Failed to upload PDF");
//       const updated = await res.json().catch(() => null);
//       if (updated) onSaved?.(updated);
//     } catch (err) {
//       console.error("Failed to upload PDF:", err);
//       setError("Failed to upload PDF. Please try again.");
//     } finally {
//       setUploadingPdf(false);
//     }
//   };

//   const handleViewFiles = async () => {
//     // Toggle closed if already open and already loaded.
//     if (showFiles) {
//       setShowFiles(false);
//       return;
//     }
//     setShowFiles(true);
//     setLoadingFiles(true);
//     setError("");
//     try {
//       const res = await fetch(
//         `${API}/api/quotations/${quotation.quotationId}/files`,
//       );
//       if (!res.ok) throw new Error("Failed to load files");
//       const data = await res.json();
//       setFiles(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch files:", err);
//       setError("Failed to load files for this quotation.");
//       setFiles([]);
//     } finally {
//       setLoadingFiles(false);
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
//             {loadingFiles && <div>Loading files...</div>}
//             {!loadingFiles && files && files.length === 0 && (
//               <div>No files attached to this quotation.</div>
//             )}
//             {!loadingFiles && files && files.length > 0 && (
//               <ul>
//                 {files.map((f, idx) => (
//                   <li key={f.url || idx}>
//                     <a href={f.url} target="_blank" rel="noreferrer">
//                       {f.name || `File ${idx + 1}`}
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
//         <input
//           type="file"
//           accept="application/pdf"
//           ref={pdfInputRef}
//           style={{ display: "none" }}
//           onChange={handlePdfFileSelected}
//         />

//         <div className="qtn-modal-footer">
//           <button
//             className="qtn-btn qtn-btn-primary"
//             onClick={handleSave}
//             disabled={saving}
//           >
//             {saving ? "Saving..." : "Save"}
//           </button>
//           <button
//             className="qtn-btn"
//             onClick={handleUploadPdf}
//             disabled={uploadingPdf}
//           >
//             {uploadingPdf ? "Uploading..." : "Upload PDF"}
//           </button>
//           <button
//             className="qtn-btn"
//             onClick={handleViewFiles}
//             disabled={loadingFiles}
//           >
//             {loadingFiles ? "Loading..." : "View Files"}
//           </button>
//           <button
//             className="qtn-btn"
//             onClick={handleDownloadTemplate}
//             disabled={downloadingTemplate || !staffFileUrl}
//             title={
//               !staffFileUrl
//                 ? "No template uploaded yet"
//                 : "Download the staff-uploaded template"
//             }
//           >
//             {downloadingTemplate ? "Downloading..." : "Download Template"}
//           </button>
//           <button
//             className="qtn-btn"
//             onClick={handleReuploadTemplate}
//             disabled={uploadingTemplate}
//           >
//             {uploadingTemplate ? "Uploading..." : "Re-upload Template"}
//           </button>
//           {templateUploaded && (
//             <span className="qtn-template-uploaded">✓ Template uploaded</span>
//           )}
//           <button className="qtn-btn" onClick={onClose}>
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
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuotationDetailsModal;
