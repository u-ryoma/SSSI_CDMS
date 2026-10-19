// import React, { useState, useEffect, useRef, useMemo } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import CustomerLookupModal from "../jobreceipt/CustomerLookupModal";
// import AddContactSubModal from "../jobreceipt/AddContactSubModal";
// import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
// import ViewFilesModal from "./ViewFilesModal";
// import QuotationPreviewModal from "./QuotationPreviewModal";
// import { normalizeContent } from "./quotationTemplateDefaults";
// import { fetchPreparerSignatureUrl } from "./quotationSignatures";
// import "./AddQuotationModal.css";

// const API = import.meta.env.VITE_API_URL;

// // Small red asterisk shown next to every required field's label.
// const Required = () => <span className="cdms-required-mark">*</span>;

// // Every field on this form is required except the three read-only /
// // auto-filled ones (Quotation ID, Date, Prepared By), which the user
// // never types into. Keyed the same as `form` so validateForm() can
// // walk it directly.
// const REQUIRED_FIELDS = [
//   { key: "customerId", label: "Customer ID" },
//   { key: "companyName", label: "Company Name" },
//   { key: "address", label: "Address" },
//   { key: "contactInfo", label: "Contact Info" },
//   { key: "contactName", label: "Contact Name" },
//   { key: "reference", label: "Reference" },
//   { key: "poNumber", label: "Purchase Order" },
//   { key: "remarks", label: "Remarks" },
// ];

// /**
//  * AddQuotationModal
//  *
//  * "Add New Quotation" / "Edit Quotation" pop-up (see the previous version's
//  * notes for the form layout, admin lock and Upload PDF behaviour — those
//  * are unchanged).
//  *
//  * WHAT CHANGED — the Word template is gone from this screen:
//  * "Download Template" and "Re-upload Template" were replaced by a single
//  * "Edit Quotation" button that opens QuotationPreviewModal: the quotation
//  * rendered exactly like the Word template (logo, header boxes, instruments
//  * table, notes, conditions, signature block) with every piece of text
//  * editable in place.
//  *
//  *  - Edits are staged in `quotationContent` (state) when the user clicks
//  *    "Apply Changes" in the preview. Nothing is sent to the server at that
//  *    point.
//  *  - Save persists `quotationContent` together with the rest of the form
//  *    (as part of the normal POST / PUT payload). It replaces the old
//  *    "attach the template before saving" rule: Save is enabled once the
//  *    quotation has been prepared in the preview (or already was when the
//  *    record was opened).
//  *  - The header-block values in the preview (company name, address, attn,
//  *    reference) are two-way: they start from this form, and edits made in
//  *    the preview are copied back into the form on Apply.
//  *  - The PDF is NOT created here. It is generated from the saved
//  *    `quotationContent` when the quotation moves to "For Sending" — see
//  *    quotationPdf.jsx (renderQuotationPdfBlob / uploadQuotationPdf).
//  *
//  * Props: unchanged (currentUser, quotationId, initialData, isEditMode,
//  * onClose, onSave, onQuotationUpdated).
//  */
// const AddQuotationModal = ({
//   onClose,
//   onSave,
//   onQuotationUpdated,
//   currentUser = { name: "Guest User" },
//   quotationId = "QTN/????/26",
//   initialData = null,
//   isEditMode = false,
// }) => {
//   const [form, setForm] = useState({
//     customerId: initialData?.customerId || "",
//     companyName: initialData?.companyName || "",
//     address: initialData?.address || "",
//     contactInfo: initialData?.contactInfo || "",
//     reference: initialData?.reference || "",
//     contactName: initialData?.contactName || "",
//     poNumber: initialData?.poNumber || "",
//     remarks: initialData?.remarks || "",
//   });

//   // Use the saved date when editing, otherwise today's date for a new quotation
//   const [date] = useState(
//     initialData?.date ? new Date(initialData.date) : new Date(),
//   );

//   // Preserve who originally prepared it — only defaults to the current
//   // user for a brand-new quotation. Editing a record should never
//   // overwrite the original preparer.
//   const [preparedBy] = useState(
//     isEditMode ? initialData?.preparedBy || "" : currentUser?.name || "",
//   );

//   const [showCustomerLookup, setShowCustomerLookup] = useState(false);

//   // Contacts for the currently selected customer, used to populate the
//   // Contact Name dropdown.
//   const [contacts, setContacts] = useState([]);
//   const [showAddContact, setShowAddContact] = useState(false);

//   // Validation — maps field key -> true when that field is currently
//   // missing. Populated by validateForm() right before Save.
//   const [errors, setErrors] = useState({});

//   // --- Admin lock ---------------------------------------------------
//   const [adminVerified, setAdminVerified] = useState(!isEditMode);
//   const [showAdminModal, setShowAdminModal] = useState(false);
//   const fieldsLocked = isEditMode && !adminVerified;

//   // --- Record state ---------------------------------------------------
//   const [saving, setSaving] = useState(false);
//   // The real, permanent ID once this record exists in the DB. Starts as
//   // the prop (already real if isEditMode, only a preview otherwise) and
//   // gets replaced with the server-generated ID the first time a new
//   // quotation is created.
//   const [localQuotationId, setLocalQuotationId] = useState(quotationId);
//   // Whether a DB record for this quotation actually exists yet.
//   const [persisted, setPersisted] = useState(isEditMode);

//   // --- Editable quotation (replaces Download / Re-upload Template) ----
//   // The edited quotation text, or null if the user hasn't opened the
//   // preview yet. Seeded from the saved record when editing.
//   const [quotationContent, setQuotationContent] = useState(
//     initialData?.quotationContent || null,
//   );
//   const [showPreview, setShowPreview] = useState(false);

//   // Cloudinary URL of the preparer's signature. Empty until the first Save
//   // (that's when "Prepared by" gets signed); seeded when editing a record
//   // that was already signed.
//   const [clerkSignatureUrl, setClerkSignatureUrl] = useState(
//     initialData?.clerkSignatureUrl || "",
//   );

//   // Legacy / finalized files, only used by View Files below.
//   const staffFileUrl = initialData?.staffFileUrl || "";
//   const staffFileName = initialData?.staffFileName || "";

//   // --- Upload PDF: client-proof document (staged locally, OPTIONAL,
//   // fires on Save, never gates Save) ---------------------------------
//   const pdfInputRef = useRef(null);
//   const [pendingClientProofFile, setPendingClientProofFile] = useState(null);
//   const [hasClientProof, setHasClientProof] = useState(
//     Boolean(initialData?.clientProofUrl),
//   );
//   const [clientProofUrl, setClientProofUrl] = useState(
//     initialData?.clientProofUrl || "",
//   );
//   const [clientProofName, setClientProofName] = useState(
//     initialData?.clientProofName || "",
//   );

//   // --- View Files -----------------------------------------------------
//   const [showFiles, setShowFiles] = useState(false);

//   // Attach to onFocus for inputs/textareas, and onMouseDown + onFocus for
//   // selects. Blurs the field so it doesn't retain focus behind the admin
//   // modal.
//   const guardField = (e) => {
//     if (!fieldsLocked) return;
//     e.preventDefault();
//     e.target.blur();
//     setShowAdminModal(true);
//   };

//   useEffect(() => {
//     if (!form.customerId?.trim()) {
//       setContacts([]);
//       return;
//     }
//     fetchContactsByCustomerID(form.customerId);
//     // Run once on mount so editing an existing quotation immediately loads
//     // that customer's contacts too (not just when the field changes).
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // FETCH A CUSTOMER'S CONTACT LIST BY CUSTOMER ID — same endpoint/shape
//   // as JobReceipt.jsx's fetchContactsByCustomerID.
//   const fetchContactsByCustomerID = async (customerID) => {
//     try {
//       const res = await fetch(
//         `${API}/api/customers/${encodeURIComponent(customerID)}`,
//       );
//       if (!res.ok) {
//         setContacts([]);
//         return;
//       }
//       const customer = await res.json();
//       const contactNames = customer?.contactNames || [];
//       setContacts(contactNames);
//       setForm((f) => ({
//         ...f,
//         contactName: contactNames.includes(f.contactName)
//           ? f.contactName
//           : contactNames[0] || "",
//       }));
//     } catch (err) {
//       console.error("Failed to fetch customer contacts:", err);
//       setContacts([]);
//     }
//   };

//   const update = (field) => (e) => {
//     setForm((f) => ({ ...f, [field]: e.target.value }));
//     setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     let hasMissing = false;

//     REQUIRED_FIELDS.forEach(({ key }) => {
//       const value = form[key];
//       if (!value || !String(value).trim()) {
//         newErrors[key] = true;
//         hasMissing = true;
//       }
//     });

//     setErrors(newErrors);
//     return !hasMissing;
//   };

//   const handleContactAdded = (newContact) => {
//     const name = newContact.contactName;
//     setContacts((prev) => (prev.includes(name) ? prev : [...prev, name]));
//     setForm((f) => ({ ...f, contactName: name }));
//   };

//   const handleUseCustomer = (customer) => {
//     const contactNames = customer.contactNames || [];
//     setForm((f) => ({
//       ...f,
//       customerId: customer.customerID || "",
//       companyName: customer.companyName || "",
//       address: customer.companyAddress || "",
//       contactInfo: customer.phoneNumber || "",
//       contactName: contactNames[0] || "",
//     }));
//     setContacts(contactNames);
//     setShowCustomerLookup(false);
//   };

//   const formattedDate = date.toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   });

//   // A quotation that is being saved for the first time (or is still
//   // "Creating") moves to "For Checking" — that's what makes it appear on the
//   // Quotation For Check list. Records already further along keep their status.
//   const nextStatus =
//     !initialData?.status || initialData.status === "Creating"
//       ? "For Checking"
//       : initialData.status;

//   const buildPayload = (idForRecord, signatureUrl = clerkSignatureUrl) => ({
//     ...form,
//     quotationId: idForRecord,
//     date: date.toISOString().slice(0, 10),
//     preparedBy,
//     preparedByUsername: isEditMode
//       ? initialData?.preparedByUsername || ""
//       : currentUser?.username || "",
//     quotationContent,
//     clerkSignatureUrl: signatureUrl,
//     status: nextStatus,
//   });

//   // Silently POSTs the current form as a new quotation record, without
//   // closing the modal. Returns the server-generated quotationId. Used by
//   // Save when nothing has been saved yet.
//   const createQuotationRecord = async (signatureUrl) => {
//     const res = await fetch(`${API}/api/quotations`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(buildPayload(localQuotationId, signatureUrl)),
//     });
//     if (!res.ok) throw new Error("Failed to save quotation");
//     const result = await res.json();
//     if (!result.success || !result.quotationId) {
//       throw new Error("Failed to save quotation");
//     }
//     return result.quotationId;
//   };

//   // --- Edit Quotation (preview) ---------------------------------------
//   // The values that show in the preview's header block always come from the
//   // current form, so it can never show stale company/contact details.
//   const previewFields = {
//     companyName: form.companyName,
//     companyAddress: form.address,
//     contactName: form.contactName,
//     reference: form.reference,
//   };

//   // Recomputed each time the modal opens (showPreview flips to true).
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const previewContent = useMemo(
//     () => normalizeContent(quotationContent, previewFields),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [showPreview],
//   );

//   const handleEditQuotation = () => {
//     // Same admin gate as the form fields: an existing quotation can't be
//     // changed until the admin password has been verified.
//     if (fieldsLocked) {
//       setShowAdminModal(true);
//       return;
//     }
//     setShowPreview(true);
//   };

//   // Receives the edited content from the preview. Stages it locally and
//   // copies the header-block values back into the form so both stay in sync.
//   const handleApplyContent = (content) => {
//     setQuotationContent(content);
//     setForm((f) => ({
//       ...f,
//       companyName: content.fields.companyName,
//       address: content.fields.companyAddress,
//       contactName: content.fields.contactName,
//       reference: content.fields.reference,
//     }));
//     setErrors((prev) => ({
//       ...prev,
//       companyName: false,
//       address: false,
//       contactName: false,
//       reference: false,
//     }));
//     setShowPreview(false);
//   };

//   // --- Upload PDF (client proof) --------------------------------------
//   const handleUploadPdfClick = () => {
//     pdfInputRef.current?.click();
//   };

//   const handleClientProofFileSelected = (e) => {
//     const file = e.target.files?.[0];
//     e.target.value = "";
//     if (!file) return;
//     setPendingClientProofFile(file);
//   };

//   const handleViewFiles = () => {
//     setShowFiles(true);
//   };

//   // Save does everything in one user-facing action:
//   //   1. If this quotation record doesn't exist in the DB yet, create it
//   //      (needed so a staged client-proof file has a record to attach to).
//   //   2. If a client-proof PDF was staged via Upload PDF, upload it
//   //      (PUT .../upload-client-proof). Optional — skipped if not staged.
//   //   3. Persist the form's fields + the edited quotation content — either
//   //      via a local PUT (record created this session, not a true edit-mode
//   //      record) or by deferring to the parent's onSave (true edit mode).
//   const handleSaveClick = async () => {
//     if (!validateForm()) return;
//     setSaving(true);
//     try {
//       let idToUse = localQuotationId;

//       // Step 0: sign "Prepared by". The preparer's signature image is
//       // fetched from their user record (Cloudinary) and saved on the
//       // quotation so it prints on the document.
//       let signatureUrl = clerkSignatureUrl;
//       if (!signatureUrl) {
//         const preparerUsername = isEditMode
//           ? initialData?.preparedByUsername
//           : currentUser?.username;
//         signatureUrl = await fetchPreparerSignatureUrl(API, preparerUsername);
//         if (!signatureUrl) {
//           const goOn = window.confirm(
//             'No signature is on file for the preparer, so "Prepared by" will be unsigned. Save anyway?',
//           );
//           if (!goOn) return; // finally{} below re-enables the button
//         }
//         setClerkSignatureUrl(signatureUrl);
//       }

//       // Step 1
//       if (!persisted) {
//         idToUse = await createQuotationRecord(signatureUrl);
//         setLocalQuotationId(idToUse);
//         setPersisted(true);
//       }

//       // Step 2
//       let latestClientProofUrl = clientProofUrl;
//       let latestClientProofName = clientProofName;
//       if (pendingClientProofFile) {
//         const proofFormData = new FormData();
//         proofFormData.append("file", pendingClientProofFile);

//         const proofRes = await fetch(
//           `${API}/api/quotations/${encodeURIComponent(idToUse)}/upload-client-proof`,
//           { method: "PUT", body: proofFormData },
//         );
//         if (!proofRes.ok) throw new Error("Failed to upload client proof PDF");
//         const proofResult = await proofRes.json();
//         if (!proofResult.success) {
//           throw new Error("Failed to upload client proof PDF");
//         }

//         latestClientProofUrl = proofResult.quotation.clientProofUrl;
//         latestClientProofName =
//           proofResult.quotation.clientProofName || pendingClientProofFile.name;
//         setClientProofUrl(latestClientProofUrl);
//         setClientProofName(latestClientProofName);
//         setHasClientProof(true);
//         setPendingClientProofFile(null);
//       }

//       // Step 3
//       if (!isEditMode) {
//         const res = await fetch(
//           `${API}/api/quotations/${encodeURIComponent(idToUse)}`,
//           {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(buildPayload(idToUse, signatureUrl)),
//           },
//         );
//         if (!res.ok) throw new Error("Failed to save quotation");
//         const result = await res.json();
//         if (result.success) {
//           if (onQuotationUpdated) {
//             // wait for the parent to refresh its list, then close so the
//             // user lands back on the list (the record now lives under
//             // "Quotation For Check")
//             await onQuotationUpdated({
//               ...buildPayload(idToUse, signatureUrl),
//               clientProofUrl: latestClientProofUrl,
//               clientProofName: latestClientProofName,
//             });
//           }
//           onClose();
//         }
//       } else {
//         onSave({
//           ...buildPayload(idToUse, signatureUrl),
//           clientProofUrl: latestClientProofUrl,
//           clientProofName: latestClientProofName,
//         });
//       }
//     } catch (err) {
//       console.error("Failed to save quotation:", err);
//       alert("Failed to save quotation. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Files known to this modal, ready to render in the ViewFilesModal.
//   // Built directly from local state / the loaded record — no backend call.
//   const attachedFiles = [
//     // finalized PDF generated when the quotation went to "For Sending"
//     initialData?.quotationPdfUrl && {
//       label: "Quotation PDF",
//       name: initialData.quotationPdfName || "quotation.pdf",
//       url: initialData.quotationPdfUrl,
//     },
//     // quotations created before the in-app editor existed
//     staffFileUrl && {
//       label: "Quotation Template",
//       name: staffFileName || "template file",
//       url: staffFileUrl,
//     },
//     initialData?.signedFileUrl && {
//       label: "Signed Quotation",
//       name: initialData.signedFileName || "signed file",
//       url: initialData.signedFileUrl,
//     },
//     clientProofUrl && {
//       label: "Client Proof",
//       name: clientProofName || "client proof file",
//       url: clientProofUrl,
//     },
//   ].filter(Boolean);

//   // Save stays disabled until the quotation has been prepared in the preview
//   // (replaces the old "attach the filled-in template" requirement).
//   const quotationReady = Boolean(quotationContent);

//   return (
//     <div className="cdms-overlay" role="dialog" aria-modal="true">
//       <div className="cdms-modal">
//         <CdmsModalHeader
//           title="QUOTATION INFORMATION DETAILS"
//           onClose={onClose}
//         />

//         <div className="cdms-modal-body">
//           {/* Top row: Quotation ID / Date / Customer ID search */}
//           <div className="cdms-top-row">
//             <div className="cdms-top-field cdms-top-field-id">
//               <label>Quotation ID</label>
//               <input
//                 value={localQuotationId}
//                 readOnly
//                 className="cdms-readonly"
//               />
//             </div>

//             <div className="cdms-top-field cdms-top-field-date">
//               <label>Date</label>
//               <input value={formattedDate} readOnly className="cdms-readonly" />
//             </div>

//             <div className="cdms-top-field cdms-top-field-customer">
//               <label>
//                 Customer ID <Required />
//               </label>
//               <div className="cdms-search-row">
//                 <input
//                   value={form.customerId}
//                   onChange={update("customerId")}
//                   onFocus={guardField}
//                   onBlur={(e) =>
//                     !fieldsLocked && fetchContactsByCustomerID(e.target.value)
//                   }
//                   readOnly={fieldsLocked}
//                   placeholder="Type or search..."
//                   className={errors.customerId ? "cdms-input-error" : ""}
//                 />
//                 <button
//                   type="button"
//                   className="cdms-search-btn"
//                   title="Look up customer"
//                   onClick={() => setShowCustomerLookup(true)}
//                 >
//                   🔍
//                 </button>
//               </div>
//               {errors.customerId && (
//                 <span className="cdms-field-error-text">
//                   This field is required.
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Two-column field grid */}
//           <div className="cdms-form-columns">
//             <div className="cdms-column">
//               <div className="cdms-field">
//                 <label>
//                   Company Name <Required />
//                 </label>
//                 <div className="cdms-field-control">
//                   <input
//                     value={form.companyName}
//                     onChange={update("companyName")}
//                     onFocus={guardField}
//                     readOnly={fieldsLocked}
//                     className={errors.companyName ? "cdms-input-error" : ""}
//                   />
//                   {errors.companyName && (
//                     <span className="cdms-field-error-text">
//                       This field is required.
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="cdms-field">
//                 <label>
//                   Address <Required />
//                 </label>
//                 <div className="cdms-field-control">
//                   <input
//                     value={form.address}
//                     onChange={update("address")}
//                     onFocus={guardField}
//                     readOnly={fieldsLocked}
//                     className={errors.address ? "cdms-input-error" : ""}
//                   />
//                   {errors.address && (
//                     <span className="cdms-field-error-text">
//                       This field is required.
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="cdms-field">
//                 <label>
//                   Contact Info <Required />
//                 </label>
//                 <div className="cdms-field-control">
//                   <input
//                     value={form.contactInfo}
//                     onChange={update("contactInfo")}
//                     onFocus={guardField}
//                     readOnly={fieldsLocked}
//                     className={errors.contactInfo ? "cdms-input-error" : ""}
//                   />
//                   {errors.contactInfo && (
//                     <span className="cdms-field-error-text">
//                       This field is required.
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="cdms-field">
//                 <label>
//                   Contact Name <Required />
//                 </label>
//                 <div className="cdms-field-control">
//                   <div className="cdms-select-row">
//                     <select
//                       name="contactName"
//                       value={form.contactName}
//                       onChange={update("contactName")}
//                       onMouseDown={guardField}
//                       onFocus={guardField}
//                       disabled={contacts.length === 0}
//                       className={errors.contactName ? "cdms-input-error" : ""}
//                     >
//                       <option value="">
//                         {contacts.length === 0
//                           ? "-- No customer selected --"
//                           : "-- Select Contact --"}
//                       </option>
//                       {contacts.map((name, idx) => (
//                         <option key={idx} value={name}>
//                           {name}
//                         </option>
//                       ))}
//                     </select>
//                     <button
//                       type="button"
//                       className="cdms-add-btn"
//                       title="Add contact"
//                       disabled={!form.customerId?.trim()}
//                       onClick={() => setShowAddContact(true)}
//                     >
//                       +
//                     </button>
//                   </div>
//                   {errors.contactName && (
//                     <span className="cdms-field-error-text">
//                       This field is required.
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="cdms-field">
//                 <label>Prepared By</label>
//                 <input value={preparedBy} readOnly className="cdms-readonly" />
//               </div>
//             </div>

//             <div className="cdms-column-divider" />

//             <div className="cdms-column">
//               <div className="cdms-field">
//                 <label>
//                   Reference <Required />
//                 </label>
//                 <div className="cdms-field-control">
//                   <input
//                     value={form.reference}
//                     onChange={update("reference")}
//                     onFocus={guardField}
//                     readOnly={fieldsLocked}
//                     className={errors.reference ? "cdms-input-error" : ""}
//                   />
//                   {errors.reference && (
//                     <span className="cdms-field-error-text">
//                       This field is required.
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="cdms-field">
//                 <label>
//                   Purchase Order <Required />
//                 </label>
//                 <div className="cdms-field-control">
//                   <input
//                     value={form.poNumber}
//                     onChange={update("poNumber")}
//                     onFocus={guardField}
//                     readOnly={fieldsLocked}
//                     className={errors.poNumber ? "cdms-input-error" : ""}
//                   />
//                   {errors.poNumber && (
//                     <span className="cdms-field-error-text">
//                       This field is required.
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="cdms-field cdms-field--textarea">
//                 <label>
//                   Remarks <Required />
//                 </label>
//                 <div className="cdms-field-control">
//                   <textarea
//                     rows={6}
//                     value={form.remarks}
//                     onChange={update("remarks")}
//                     onFocus={guardField}
//                     readOnly={fieldsLocked}
//                     className={errors.remarks ? "cdms-input-error" : ""}
//                   />
//                   {errors.remarks && (
//                     <span className="cdms-field-error-text">
//                       This field is required.
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* FOOTER — Save pinned left, quotation/file actions + status
//             pinned right */}
//         <div className="cdms-modal-footer cdms-toolbar">
//           <div className="cdms-toolbar-left">
//             <button
//               className="cdms-btn cdms-btn-primary"
//               onClick={handleSaveClick}
//               disabled={saving || !quotationReady}
//               title={
//                 !quotationReady
//                   ? "Click Edit Quotation and apply your changes before saving"
//                   : undefined
//               }
//             >
//               {saving ? "Saving..." : "Save"}
//             </button>
//           </div>

//           <div className="cdms-toolbar-right">
//             <button
//               type="button"
//               className="cdms-btn"
//               onClick={handleUploadPdfClick}
//               disabled={saving}
//               title="Attach proof of client communication, e.g. a printed/scanned email (uploads when you click Save)"
//             >
//               {pendingClientProofFile ? "Change Selected PDF" : "Upload PDF"}
//             </button>
//             <button
//               type="button"
//               className="cdms-btn"
//               onClick={handleViewFiles}
//             >
//               View Files
//             </button>
//             <button
//               type="button"
//               className="cdms-btn"
//               onClick={handleEditQuotation}
//               disabled={saving}
//               title="Open the quotation as it will be printed, and edit it"
//             >
//               Edit Quotation
//             </button>
//             <input
//               type="file"
//               ref={pdfInputRef}
//               style={{ display: "none" }}
//               accept="application/pdf"
//               onChange={handleClientProofFileSelected}
//             />
//             {quotationReady ? (
//               <span className="cdms-upload-status">✓ Quotation prepared</span>
//             ) : (
//               <span className="cdms-upload-status">
//                 Quotation not yet prepared
//               </span>
//             )}
//             {pendingClientProofFile && (
//               <span
//                 className="cdms-upload-status"
//                 title={pendingClientProofFile.name}
//               >
//                 📎 {pendingClientProofFile.name} (will upload on Save)
//               </span>
//             )}
//             {!pendingClientProofFile && hasClientProof && (
//               <span className="cdms-upload-status" title={clientProofUrl}>
//                 ✓ Client proof uploaded
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {showPreview && (
//         <QuotationPreviewModal
//           quotation={{
//             quotationId: localQuotationId,
//             date: formattedDate,
//             preparedBy,
//             approvedBy: initialData?.approvedBy,
//             clerkSignatureUrl,
//             adminSignatureUrl: initialData?.adminSignatureUrl,
//           }}
//           content={previewContent}
//           onApply={handleApplyContent}
//           onClose={() => setShowPreview(false)}
//         />
//       )}

//       {showCustomerLookup && (
//         <CustomerLookupModal
//           onClose={() => setShowCustomerLookup(false)}
//           onSelect={handleUseCustomer}
//         />
//       )}

//       {showAddContact && (
//         <AddContactSubModal
//           customerID={form.customerId}
//           onClose={() => setShowAddContact(false)}
//           onContactAdded={handleContactAdded}
//         />
//       )}

//       {showAdminModal && (
//         <AdminPasswordModal
//           onClose={() => setShowAdminModal(false)}
//           onVerified={() => {
//             setAdminVerified(true);
//             setShowAdminModal(false);
//           }}
//         />
//       )}

//       {showFiles && (
//         <ViewFilesModal
//           files={attachedFiles}
//           onClose={() => setShowFiles(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default AddQuotationModal;
import React, { useState, useEffect, useRef, useMemo } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import CustomerLookupModal from "../jobreceipt/CustomerLookupModal";
import AddContactSubModal from "../jobreceipt/AddContactSubModal";
import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
import ViewFilesModal from "./ViewFilesModal";
import QuotationPreviewModal from "./QuotationPreviewModal";
import ConfirmDialog from "../../components/ConfirmDialog"; // CHANGED
import { normalizeContent } from "./quotationTemplateDefaults";
import { fetchPreparerSignatureUrl } from "./quotationSignatures";
import "./AddQuotationModal.css";

const API = import.meta.env.VITE_API_URL;

// Small red asterisk shown next to every required field's label.
const Required = () => <span className="cdms-required-mark">*</span>;

// Every field on this form is required except the three read-only /
// auto-filled ones (Quotation ID, Date, Prepared By), which the user
// never types into. Keyed the same as `form` so validateForm() can
// walk it directly.
const REQUIRED_FIELDS = [
  { key: "customerId", label: "Customer ID" },
  { key: "companyName", label: "Company Name" },
  { key: "address", label: "Address" },
  { key: "contactInfo", label: "Contact Info" },
  { key: "contactName", label: "Contact Name" },
  { key: "reference", label: "Reference" },
  { key: "poNumber", label: "Purchase Order" },
  { key: "remarks", label: "Remarks" },
];

/**
 * AddQuotationModal
 *
 * "Add New Quotation" / "Edit Quotation" pop-up (see the previous version's
 * notes for the form layout, admin lock and Upload PDF behaviour — those
 * are unchanged).
 *
 * WHAT CHANGED — the Word template is gone from this screen:
 * "Download Template" and "Re-upload Template" were replaced by a single
 * "Edit Quotation" button that opens QuotationPreviewModal: the quotation
 * rendered exactly like the Word template (logo, header boxes, instruments
 * table, notes, conditions, signature block) with every piece of text
 * editable in place.
 *
 *  - Edits are staged in `quotationContent` (state) when the user clicks
 *    "Apply Changes" in the preview. Nothing is sent to the server at that
 *    point.
 *  - Save persists `quotationContent` together with the rest of the form
 *    (as part of the normal POST / PUT payload). It replaces the old
 *    "attach the template before saving" rule: Save is enabled once the
 *    quotation has been prepared in the preview (or already was when the
 *    record was opened).
 *  - The header-block values in the preview (company name, address, attn,
 *    reference) are two-way: they start from this form, and edits made in
 *    the preview are copied back into the form on Apply.
 *  - The PDF is NOT created here. It is generated from the saved
 *    `quotationContent` when the quotation moves to "For Sending" — see
 *    quotationPdf.jsx (renderQuotationPdfBlob / uploadQuotationPdf).
 *
 * Props: unchanged (currentUser, quotationId, initialData, isEditMode,
 * onClose, onSave, onQuotationUpdated).
 */
const AddQuotationModal = ({
  onClose,
  onSave,
  onQuotationUpdated,
  currentUser = { name: "Guest User" },
  quotationId = "QTN/????/26",
  initialData = null,
  isEditMode = false,
}) => {
  const [form, setForm] = useState({
    customerId: initialData?.customerId || "",
    companyName: initialData?.companyName || "",
    address: initialData?.address || "",
    contactInfo: initialData?.contactInfo || "",
    reference: initialData?.reference || "",
    contactName: initialData?.contactName || "",
    poNumber: initialData?.poNumber || "",
    remarks: initialData?.remarks || "",
  });

  // Use the saved date when editing, otherwise today's date for a new quotation
  const [date] = useState(
    initialData?.date ? new Date(initialData.date) : new Date(),
  );

  // Preserve who originally prepared it — only defaults to the current
  // user for a brand-new quotation. Editing a record should never
  // overwrite the original preparer.
  const [preparedBy] = useState(
    isEditMode ? initialData?.preparedBy || "" : currentUser?.name || "",
  );

  const [showCustomerLookup, setShowCustomerLookup] = useState(false);

  // Contacts for the currently selected customer, used to populate the
  // Contact Name dropdown.
  const [contacts, setContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);

  // Validation — maps field key -> true when that field is currently
  // missing. Populated by validateForm() right before Save.
  const [errors, setErrors] = useState({});

  // --- Admin lock ---------------------------------------------------
  const [adminVerified, setAdminVerified] = useState(!isEditMode);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const fieldsLocked = isEditMode && !adminVerified;

  // --- Record state ---------------------------------------------------
  const [saving, setSaving] = useState(false);
  // The real, permanent ID once this record exists in the DB. Starts as
  // the prop (already real if isEditMode, only a preview otherwise) and
  // gets replaced with the server-generated ID the first time a new
  // quotation is created.
  const [localQuotationId, setLocalQuotationId] = useState(quotationId);
  // Whether a DB record for this quotation actually exists yet.
  const [persisted, setPersisted] = useState(isEditMode);

  // --- Editable quotation (replaces Download / Re-upload Template) ----
  // The edited quotation text, or null if the user hasn't opened the
  // preview yet. Seeded from the saved record when editing.
  const [quotationContent, setQuotationContent] = useState(
    initialData?.quotationContent || null,
  );
  const [showPreview, setShowPreview] = useState(false);

  // Cloudinary URL of the preparer's signature. Empty until the first Save
  // (that's when "Prepared by" gets signed); seeded when editing a record
  // that was already signed.
  const [clerkSignatureUrl, setClerkSignatureUrl] = useState(
    initialData?.clerkSignatureUrl || "",
  );

  // Legacy / finalized files, only used by View Files below.
  const staffFileUrl = initialData?.staffFileUrl || "";
  const staffFileName = initialData?.staffFileName || "";

  // --- Upload PDF: client-proof document (staged locally, OPTIONAL,
  // fires on Save, never gates Save) ---------------------------------
  const pdfInputRef = useRef(null);
  const [pendingClientProofFile, setPendingClientProofFile] = useState(null);
  const [hasClientProof, setHasClientProof] = useState(
    Boolean(initialData?.clientProofUrl),
  );
  const [clientProofUrl, setClientProofUrl] = useState(
    initialData?.clientProofUrl || "",
  );
  const [clientProofName, setClientProofName] = useState(
    initialData?.clientProofName || "",
  );

  // --- View Files -----------------------------------------------------
  const [showFiles, setShowFiles] = useState(false);

  // --- Confirm / alert dialog (replaces window.confirm / alert) -------
  // CHANGED
  const [dialog, setDialog] = useState(null);

  // Simple one-button error/info popup.
  const showAlert = (title, message) =>
    setDialog({
      title,
      message,
      type: "danger",
      confirmLabel: "OK",
      onConfirm: () => setDialog(null),
    });

  // Two-button question. Resolves true (confirmed) or false (cancelled),
  // so it can be awaited inside async handlers.
  const askConfirm = (opts) =>
    new Promise((resolve) => {
      setDialog({
        ...opts,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });

  // Attach to onFocus for inputs/textareas, and onMouseDown + onFocus for
  // selects. Blurs the field so it doesn't retain focus behind the admin
  // modal.
  const guardField = (e) => {
    if (!fieldsLocked) return;
    e.preventDefault();
    e.target.blur();
    setShowAdminModal(true);
  };

  useEffect(() => {
    if (!form.customerId?.trim()) {
      setContacts([]);
      return;
    }
    fetchContactsByCustomerID(form.customerId);
    // Run once on mount so editing an existing quotation immediately loads
    // that customer's contacts too (not just when the field changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FETCH A CUSTOMER'S CONTACT LIST BY CUSTOMER ID — same endpoint/shape
  // as JobReceipt.jsx's fetchContactsByCustomerID.
  const fetchContactsByCustomerID = async (customerID) => {
    try {
      const res = await fetch(
        `${API}/api/customers/${encodeURIComponent(customerID)}`,
      );
      if (!res.ok) {
        setContacts([]);
        return;
      }
      const customer = await res.json();
      const contactNames = customer?.contactNames || [];
      setContacts(contactNames);
      setForm((f) => ({
        ...f,
        contactName: contactNames.includes(f.contactName)
          ? f.contactName
          : contactNames[0] || "",
      }));
    } catch (err) {
      console.error("Failed to fetch customer contacts:", err);
      setContacts([]);
    }
  };

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
  };

  const validateForm = () => {
    const newErrors = {};
    let hasMissing = false;

    REQUIRED_FIELDS.forEach(({ key }) => {
      const value = form[key];
      if (!value || !String(value).trim()) {
        newErrors[key] = true;
        hasMissing = true;
      }
    });

    setErrors(newErrors);
    return !hasMissing;
  };

  const handleContactAdded = (newContact) => {
    const name = newContact.contactName;
    setContacts((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setForm((f) => ({ ...f, contactName: name }));
  };

  const handleUseCustomer = (customer) => {
    const contactNames = customer.contactNames || [];
    setForm((f) => ({
      ...f,
      customerId: customer.customerID || "",
      companyName: customer.companyName || "",
      address: customer.companyAddress || "",
      contactInfo: customer.phoneNumber || "",
      contactName: contactNames[0] || "",
    }));
    setContacts(contactNames);
    setShowCustomerLookup(false);
  };

  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // A quotation that is being saved for the first time (or is still
  // "Creating") moves to "For Checking" — that's what makes it appear on the
  // Quotation For Check list. Records already further along keep their status.
  const nextStatus =
    !initialData?.status || initialData.status === "Creating"
      ? "For Checking"
      : initialData.status;

  const buildPayload = (idForRecord, signatureUrl = clerkSignatureUrl) => ({
    ...form,
    quotationId: idForRecord,
    date: date.toISOString().slice(0, 10),
    preparedBy,
    preparedByUsername: isEditMode
      ? initialData?.preparedByUsername || ""
      : currentUser?.username || "",
    quotationContent,
    clerkSignatureUrl: signatureUrl,
    status: nextStatus,
  });

  // Silently POSTs the current form as a new quotation record, without
  // closing the modal. Returns the server-generated quotationId. Used by
  // Save when nothing has been saved yet.
  const createQuotationRecord = async (signatureUrl) => {
    const res = await fetch(`${API}/api/quotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(localQuotationId, signatureUrl)),
    });
    if (!res.ok) throw new Error("Failed to save quotation");
    const result = await res.json();
    if (!result.success || !result.quotationId) {
      throw new Error("Failed to save quotation");
    }
    return result.quotationId;
  };

  // --- Edit Quotation (preview) ---------------------------------------
  // The values that show in the preview's header block always come from the
  // current form, so it can never show stale company/contact details.
  const previewFields = {
    companyName: form.companyName,
    companyAddress: form.address,
    contactName: form.contactName,
    reference: form.reference,
  };

  // Recomputed each time the modal opens (showPreview flips to true).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const previewContent = useMemo(
    () => normalizeContent(quotationContent, previewFields),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showPreview],
  );

  const handleEditQuotation = () => {
    // Same admin gate as the form fields: an existing quotation can't be
    // changed until the admin password has been verified.
    if (fieldsLocked) {
      setShowAdminModal(true);
      return;
    }
    setShowPreview(true);
  };

  // Receives the edited content from the preview. Stages it locally and
  // copies the header-block values back into the form so both stay in sync.
  const handleApplyContent = (content) => {
    setQuotationContent(content);
    setForm((f) => ({
      ...f,
      companyName: content.fields.companyName,
      address: content.fields.companyAddress,
      contactName: content.fields.contactName,
      reference: content.fields.reference,
    }));
    setErrors((prev) => ({
      ...prev,
      companyName: false,
      address: false,
      contactName: false,
      reference: false,
    }));
    setShowPreview(false);
  };

  // --- Upload PDF (client proof) --------------------------------------
  const handleUploadPdfClick = () => {
    pdfInputRef.current?.click();
  };

  const handleClientProofFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingClientProofFile(file);
  };

  const handleViewFiles = () => {
    setShowFiles(true);
  };

  // Save does everything in one user-facing action:
  //   1. If this quotation record doesn't exist in the DB yet, create it
  //      (needed so a staged client-proof file has a record to attach to).
  //   2. If a client-proof PDF was staged via Upload PDF, upload it
  //      (PUT .../upload-client-proof). Optional — skipped if not staged.
  //   3. Persist the form's fields + the edited quotation content — either
  //      via a local PUT (record created this session, not a true edit-mode
  //      record) or by deferring to the parent's onSave (true edit mode).
  const handleSaveClick = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      let idToUse = localQuotationId;

      // Step 0: sign "Prepared by". The preparer's signature image is
      // fetched from their user record (Cloudinary) and saved on the
      // quotation so it prints on the document.
      let signatureUrl = clerkSignatureUrl;
      if (!signatureUrl) {
        const preparerUsername = isEditMode
          ? initialData?.preparedByUsername
          : currentUser?.username;
        signatureUrl = await fetchPreparerSignatureUrl(API, preparerUsername);
        if (!signatureUrl) {
          // CHANGED: was window.confirm(...)
          const goOn = await askConfirm({
            title: "No signature on file",
            message:
              'No signature is on file for the preparer, so "Prepared by" will be unsigned. Save anyway?',
            confirmLabel: "Save anyway",
            cancelLabel: "Cancel",
          });
          if (!goOn) return; // finally{} below re-enables the button
        }
        setClerkSignatureUrl(signatureUrl);
      }

      // Step 1
      if (!persisted) {
        idToUse = await createQuotationRecord(signatureUrl);
        setLocalQuotationId(idToUse);
        setPersisted(true);
      }

      // Step 2
      let latestClientProofUrl = clientProofUrl;
      let latestClientProofName = clientProofName;
      if (pendingClientProofFile) {
        const proofFormData = new FormData();
        proofFormData.append("file", pendingClientProofFile);

        const proofRes = await fetch(
          `${API}/api/quotations/${encodeURIComponent(idToUse)}/upload-client-proof`,
          { method: "PUT", body: proofFormData },
        );
        if (!proofRes.ok) throw new Error("Failed to upload client proof PDF");
        const proofResult = await proofRes.json();
        if (!proofResult.success) {
          throw new Error("Failed to upload client proof PDF");
        }

        latestClientProofUrl = proofResult.quotation.clientProofUrl;
        latestClientProofName =
          proofResult.quotation.clientProofName || pendingClientProofFile.name;
        setClientProofUrl(latestClientProofUrl);
        setClientProofName(latestClientProofName);
        setHasClientProof(true);
        setPendingClientProofFile(null);
      }

      // Step 3
      if (!isEditMode) {
        const res = await fetch(
          `${API}/api/quotations/${encodeURIComponent(idToUse)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildPayload(idToUse, signatureUrl)),
          },
        );
        if (!res.ok) throw new Error("Failed to save quotation");
        const result = await res.json();
        if (result.success) {
          if (onQuotationUpdated) {
            // wait for the parent to refresh its list, then close so the
            // user lands back on the list (the record now lives under
            // "Quotation For Check")
            await onQuotationUpdated({
              ...buildPayload(idToUse, signatureUrl),
              clientProofUrl: latestClientProofUrl,
              clientProofName: latestClientProofName,
            });
          }
          onClose();
        }
      } else {
        onSave({
          ...buildPayload(idToUse, signatureUrl),
          clientProofUrl: latestClientProofUrl,
          clientProofName: latestClientProofName,
        });
      }
    } catch (err) {
      console.error("Failed to save quotation:", err);
      // CHANGED: was alert(...)
      showAlert("Save failed", "Failed to save quotation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Files known to this modal, ready to render in the ViewFilesModal.
  // Built directly from local state / the loaded record — no backend call.
  const attachedFiles = [
    // finalized PDF generated when the quotation went to "For Sending"
    initialData?.quotationPdfUrl && {
      label: "Quotation PDF",
      name: initialData.quotationPdfName || "quotation.pdf",
      url: initialData.quotationPdfUrl,
    },
    // quotations created before the in-app editor existed
    staffFileUrl && {
      label: "Quotation Template",
      name: staffFileName || "template file",
      url: staffFileUrl,
    },
    initialData?.signedFileUrl && {
      label: "Signed Quotation",
      name: initialData.signedFileName || "signed file",
      url: initialData.signedFileUrl,
    },
    clientProofUrl && {
      label: "Client Proof",
      name: clientProofName || "client proof file",
      url: clientProofUrl,
    },
  ].filter(Boolean);

  // Save stays disabled until the quotation has been prepared in the preview
  // (replaces the old "attach the filled-in template" requirement).
  const quotationReady = Boolean(quotationContent);

  return (
    <div className="cdms-overlay" role="dialog" aria-modal="true">
      <div className="cdms-modal">
        <CdmsModalHeader
          title="QUOTATION INFORMATION DETAILS"
          onClose={onClose}
        />

        <div className="cdms-modal-body">
          {/* Top row: Quotation ID / Date / Customer ID search */}
          <div className="cdms-top-row">
            <div className="cdms-top-field cdms-top-field-id">
              <label>Quotation ID</label>
              <input
                value={localQuotationId}
                readOnly
                className="cdms-readonly"
              />
            </div>

            <div className="cdms-top-field cdms-top-field-date">
              <label>Date</label>
              <input value={formattedDate} readOnly className="cdms-readonly" />
            </div>

            <div className="cdms-top-field cdms-top-field-customer">
              <label>
                Customer ID <Required />
              </label>
              <div className="cdms-search-row">
                <input
                  value={form.customerId}
                  onChange={update("customerId")}
                  onFocus={guardField}
                  onBlur={(e) =>
                    !fieldsLocked && fetchContactsByCustomerID(e.target.value)
                  }
                  readOnly={fieldsLocked}
                  placeholder="Type or search..."
                  className={errors.customerId ? "cdms-input-error" : ""}
                />
                <button
                  type="button"
                  className="cdms-search-btn"
                  title="Look up customer"
                  onClick={() => setShowCustomerLookup(true)}
                >
                  🔍
                </button>
              </div>
              {errors.customerId && (
                <span className="cdms-field-error-text">
                  This field is required.
                </span>
              )}
            </div>
          </div>

          {/* Two-column field grid */}
          <div className="cdms-form-columns">
            <div className="cdms-column">
              <div className="cdms-field">
                <label>
                  Company Name <Required />
                </label>
                <div className="cdms-field-control">
                  <input
                    value={form.companyName}
                    onChange={update("companyName")}
                    onFocus={guardField}
                    readOnly={fieldsLocked}
                    className={errors.companyName ? "cdms-input-error" : ""}
                  />
                  {errors.companyName && (
                    <span className="cdms-field-error-text">
                      This field is required.
                    </span>
                  )}
                </div>
              </div>

              <div className="cdms-field">
                <label>
                  Address <Required />
                </label>
                <div className="cdms-field-control">
                  <input
                    value={form.address}
                    onChange={update("address")}
                    onFocus={guardField}
                    readOnly={fieldsLocked}
                    className={errors.address ? "cdms-input-error" : ""}
                  />
                  {errors.address && (
                    <span className="cdms-field-error-text">
                      This field is required.
                    </span>
                  )}
                </div>
              </div>

              <div className="cdms-field">
                <label>
                  Contact Info <Required />
                </label>
                <div className="cdms-field-control">
                  <input
                    value={form.contactInfo}
                    onChange={update("contactInfo")}
                    onFocus={guardField}
                    readOnly={fieldsLocked}
                    className={errors.contactInfo ? "cdms-input-error" : ""}
                  />
                  {errors.contactInfo && (
                    <span className="cdms-field-error-text">
                      This field is required.
                    </span>
                  )}
                </div>
              </div>

              <div className="cdms-field">
                <label>
                  Contact Name <Required />
                </label>
                <div className="cdms-field-control">
                  <div className="cdms-select-row">
                    <select
                      name="contactName"
                      value={form.contactName}
                      onChange={update("contactName")}
                      onMouseDown={guardField}
                      onFocus={guardField}
                      disabled={contacts.length === 0}
                      className={errors.contactName ? "cdms-input-error" : ""}
                    >
                      <option value="">
                        {contacts.length === 0
                          ? "-- No customer selected --"
                          : "-- Select Contact --"}
                      </option>
                      {contacts.map((name, idx) => (
                        <option key={idx} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="cdms-add-btn"
                      title="Add contact"
                      disabled={!form.customerId?.trim()}
                      onClick={() => setShowAddContact(true)}
                    >
                      +
                    </button>
                  </div>
                  {errors.contactName && (
                    <span className="cdms-field-error-text">
                      This field is required.
                    </span>
                  )}
                </div>
              </div>

              <div className="cdms-field">
                <label>Prepared By</label>
                <input value={preparedBy} readOnly className="cdms-readonly" />
              </div>
            </div>

            <div className="cdms-column-divider" />

            <div className="cdms-column">
              <div className="cdms-field">
                <label>
                  Reference <Required />
                </label>
                <div className="cdms-field-control">
                  <input
                    value={form.reference}
                    onChange={update("reference")}
                    onFocus={guardField}
                    readOnly={fieldsLocked}
                    className={errors.reference ? "cdms-input-error" : ""}
                  />
                  {errors.reference && (
                    <span className="cdms-field-error-text">
                      This field is required.
                    </span>
                  )}
                </div>
              </div>

              <div className="cdms-field">
                <label>
                  Purchase Order <Required />
                </label>
                <div className="cdms-field-control">
                  <input
                    value={form.poNumber}
                    onChange={update("poNumber")}
                    onFocus={guardField}
                    readOnly={fieldsLocked}
                    className={errors.poNumber ? "cdms-input-error" : ""}
                  />
                  {errors.poNumber && (
                    <span className="cdms-field-error-text">
                      This field is required.
                    </span>
                  )}
                </div>
              </div>

              <div className="cdms-field cdms-field--textarea">
                <label>
                  Remarks <Required />
                </label>
                <div className="cdms-field-control">
                  <textarea
                    rows={6}
                    value={form.remarks}
                    onChange={update("remarks")}
                    onFocus={guardField}
                    readOnly={fieldsLocked}
                    className={errors.remarks ? "cdms-input-error" : ""}
                  />
                  {errors.remarks && (
                    <span className="cdms-field-error-text">
                      This field is required.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER — Save pinned left, quotation/file actions + status
            pinned right */}
        <div className="cdms-modal-footer cdms-toolbar">
          <div className="cdms-toolbar-left">
            <button
              className="cdms-btn cdms-btn-primary"
              onClick={handleSaveClick}
              disabled={saving || !quotationReady}
              title={
                !quotationReady
                  ? "Click Edit Quotation and apply your changes before saving"
                  : undefined
              }
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="cdms-toolbar-right">
            <button
              type="button"
              className="cdms-btn"
              onClick={handleUploadPdfClick}
              disabled={saving}
              title="Attach proof of client communication, e.g. a printed/scanned email (uploads when you click Save)"
            >
              {pendingClientProofFile ? "Change Selected PDF" : "Upload PDF"}
            </button>
            <button
              type="button"
              className="cdms-btn"
              onClick={handleViewFiles}
            >
              View Files
            </button>
            <button
              type="button"
              className="cdms-btn"
              onClick={handleEditQuotation}
              disabled={saving}
              title="Open the quotation as it will be printed, and edit it"
            >
              Edit Quotation
            </button>
            <input
              type="file"
              ref={pdfInputRef}
              style={{ display: "none" }}
              accept="application/pdf"
              onChange={handleClientProofFileSelected}
            />
            {quotationReady ? (
              <span className="cdms-upload-status">✓ Quotation prepared</span>
            ) : (
              <span className="cdms-upload-status">
                Quotation not yet prepared
              </span>
            )}
            {pendingClientProofFile && (
              <span
                className="cdms-upload-status"
                title={pendingClientProofFile.name}
              >
                📎 {pendingClientProofFile.name} (will upload on Save)
              </span>
            )}
            {!pendingClientProofFile && hasClientProof && (
              <span className="cdms-upload-status" title={clientProofUrl}>
                ✓ Client proof uploaded
              </span>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <QuotationPreviewModal
          quotation={{
            quotationId: localQuotationId,
            date: formattedDate,
            preparedBy,
            approvedBy: initialData?.approvedBy,
            clerkSignatureUrl,
            adminSignatureUrl: initialData?.adminSignatureUrl,
          }}
          content={previewContent}
          onApply={handleApplyContent}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showCustomerLookup && (
        <CustomerLookupModal
          onClose={() => setShowCustomerLookup(false)}
          onSelect={handleUseCustomer}
        />
      )}

      {showAddContact && (
        <AddContactSubModal
          customerID={form.customerId}
          onClose={() => setShowAddContact(false)}
          onContactAdded={handleContactAdded}
        />
      )}

      {showAdminModal && (
        <AdminPasswordModal
          onClose={() => setShowAdminModal(false)}
          onVerified={() => {
            setAdminVerified(true);
            setShowAdminModal(false);
          }}
        />
      )}

      {showFiles && (
        <ViewFilesModal
          files={attachedFiles}
          onClose={() => setShowFiles(false)}
        />
      )}

      {/* CHANGED */}
      {dialog && <ConfirmDialog {...dialog} />}
    </div>
  );
};

export default AddQuotationModal;
