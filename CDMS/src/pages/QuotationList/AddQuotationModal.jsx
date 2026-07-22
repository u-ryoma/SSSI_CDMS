// import React, { useState, useEffect } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import CustomerLookupModal from "../jobreceipt/CustomerLookupModal";
// import AddContactSubModal from "../jobreceipt/AddContactSubModal";
// import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
// import "./AddQuotationModal.css";

// const API = import.meta.env.VITE_API_URL;

// /**
//  * AddQuotationModal
//  *
//  * "Add New Quotation" / "Edit Quotation" pop-up. Uses CdmsModalHeader for
//  * the branded title bar, with a light, flat form body (matching the Job
//  * Receipt screen's layout): a top row with Quotation ID / Date / Customer
//  * ID search, then a two-column field grid below.
//  *
//  * Admin lock: when editing an existing quotation (isEditMode), every
//  * field starts locked. The first attempt to interact with any field pops
//  * AdminPasswordModal; once verified, all fields unlock for the rest of
//  * this modal session. Buttons (Save, Cancel, Upload/View Files, Print,
//  * Back, Exit, the customer lookup/add-contact buttons) are never gated.
//  * New quotations are never gated — nothing saved exists yet to protect.
//  *
//  * Props:
//  * - currentUser: the logged-in user, e.g. { name: "Avelyn G. Que-loy" }.
//  *   Used to fill "Prepared By" for brand-new quotations only.
//  * - quotationId: for a new quotation this is the previewed next ID; for
//  *   an existing one it's the real, permanent ID (passed down from
//  *   QuotationList.jsx either way).
//  * - initialData: the full saved quotation record when opened by clicking
//  *   an existing row (null for "Add New").
//  * - isEditMode: true when initialData is a real saved record.
//  *
//  * Contact list is fetched the same way as AddReceiptModal/JobReceipt.jsx:
//  * GET /api/customers/:customerID -> { ...customer, contactNames: string[] }.
//  * Contacts are plain strings, not {contactID, contactName} objects.
//  */
// const AddQuotationModal = ({
//   onClose,
//   onSave,
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

//   // --- Admin lock ---------------------------------------------------
//   // Fields are locked only when editing a saved quotation. New
//   // quotations are always "verified" (i.e. unlocked).
//   const [adminVerified, setAdminVerified] = useState(!isEditMode);
//   const [showAdminModal, setShowAdminModal] = useState(false);
//   const fieldsLocked = isEditMode && !adminVerified;

//   // Attach to onFocus for inputs/textareas, and onMouseDown + onFocus for
//   // selects (mousedown stops the dropdown from opening on click; focus
//   // covers keyboard/tab access). Blurs the field so it doesn't retain
//   // focus behind the admin modal.
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
//   // as JobReceipt.jsx's fetchContactsByCustomerID, so both modals stay
//   // in sync with the same source of truth.
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

//   const update = (field) => (e) =>
//     setForm((f) => ({ ...f, [field]: e.target.value }));

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
//               <input value={quotationId} readOnly className="cdms-readonly" />
//             </div>

//             <div className="cdms-top-field cdms-top-field-date">
//               <label>Date</label>
//               <input value={formattedDate} readOnly className="cdms-readonly" />
//             </div>

//             <div className="cdms-top-field cdms-top-field-customer">
//               <label>Customer ID</label>
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
//                 />
//                 {/* Lookup button is a button — left ungated per requirements */}
//                 <button
//                   type="button"
//                   className="cdms-search-btn"
//                   title="Look up customer"
//                   onClick={() => setShowCustomerLookup(true)}
//                 >
//                   🔍
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Two-column field grid */}
//           <div className="cdms-form-columns">
//             <div className="cdms-column">
//               <div className="cdms-field">
//                 <label>Company Name</label>
//                 <input
//                   value={form.companyName}
//                   onChange={update("companyName")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Address</label>
//                 <textarea
//                   rows={3}
//                   value={form.address}
//                   onChange={update("address")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Contact Info</label>
//                 <textarea
//                   rows={3}
//                   value={form.contactInfo}
//                   onChange={update("contactInfo")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Contact Name</label>
//                 <div className="cdms-select-row">
//                   <select
//                     name="contactName"
//                     value={form.contactName}
//                     onChange={update("contactName")}
//                     onMouseDown={guardField}
//                     onFocus={guardField}
//                     disabled={contacts.length === 0}
//                   >
//                     <option value="">
//                       {contacts.length === 0
//                         ? "-- No customer selected --"
//                         : "-- Select Contact --"}
//                     </option>
//                     {contacts.map((name, idx) => (
//                       <option key={idx} value={name}>
//                         {name}
//                       </option>
//                     ))}
//                   </select>
//                   {/* Add-contact button — left ungated per requirements */}
//                   <button
//                     type="button"
//                     className="cdms-add-btn"
//                     title="Add contact"
//                     disabled={!form.customerId?.trim()}
//                     onClick={() => setShowAddContact(true)}
//                   >
//                     +
//                   </button>
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
//                 <label>Reference</label>
//                 <input
//                   value={form.reference}
//                   onChange={update("reference")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Purchase Order</label>
//                 <input
//                   value={form.poNumber}
//                   onChange={update("poNumber")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Remarks</label>
//                 <textarea
//                   rows={6}
//                   value={form.remarks}
//                   onChange={update("remarks")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="cdms-modal-footer">
//           <div className="cdms-footer-left">
//             <button
//               className="cdms-btn cdms-btn-primary"
//               onClick={() =>
//                 onSave({
//                   ...form,
//                   quotationId,
//                   date: date.toISOString().slice(0, 10),
//                   preparedBy,
//                 })
//               }
//             >
//               Save
//             </button>
//             <div className="cdms-field">
//               <div className="cdms-select-row">
//                 <button
//                   type="button"
//                   className="cdms-btn"
//                   onClick={() => console.log("TODO: upload file")}
//                 >
//                   Upload File
//                 </button>
//                 <button
//                   type="button"
//                   className="cdms-btn"
//                   onClick={() => console.log("TODO: view files")}
//                 >
//                   View Files
//                 </button>
//               </div>
//             </div>
//             <button className="cdms-btn" onClick={onClose}>
//               Cancel
//             </button>
//             <button className="cdms-btn">Print</button>
//           </div>
//           <div className="cdms-footer-right">
//             <button className="cdms-btn">Back</button>
//             <button className="cdms-btn" onClick={onClose}>
//               Exit
//             </button>
//           </div>
//         </div>
//       </div>

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
//     </div>
//   );
// };

// export default AddQuotationModal;
// import React, { useState, useEffect } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import CustomerLookupModal from "../jobreceipt/CustomerLookupModal";
// import AddContactSubModal from "../jobreceipt/AddContactSubModal";
// import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
// import "./AddQuotationModal.css";

// const API = import.meta.env.VITE_API_URL;

// /**
//  * AddQuotationModal
//  *
//  * "Add New Quotation" / "Edit Quotation" pop-up. Uses CdmsModalHeader for
//  * the branded title bar, with a light, flat form body (matching the Job
//  * Receipt screen's layout): a top row with Quotation ID / Date / Customer
//  * ID search, then a two-column field grid below.
//  *
//  * Admin lock: when editing an existing quotation (isEditMode), every
//  * field starts locked. The first attempt to interact with any field pops
//  * AdminPasswordModal; once verified, all fields unlock for the rest of
//  * this modal session. Buttons (Save, Cancel, Upload/View Files, Print,
//  * Back, Exit, the customer lookup/add-contact buttons) are never gated.
//  * New quotations are never gated — nothing saved exists yet to protect.
//  *
//  * Download Template: enabled for both new and existing quotations. The
//  * backend route renders the .docx from a saved DB record, so a brand-new
//  * quotation (nothing persisted yet) is silently POSTed first — same
//  * payload Save would send — before the template is fetched. The real
//  * generated quotationId returned by that POST is then kept in local
//  * state (`localQuotationId` / `persisted`) so:
//  *   - a second Download Template click reuses the same record instead of
//  *     creating another one, and
//  *   - clicking Save afterward PUTs that same record instead of letting
//  *     the parent's onSave POST a duplicate.
//  * This local state resets naturally because QuotationList.jsx remounts
//  * this component (via `key={selectedQuotation?.quotationId || "new"}")
//  * every time the modal is reopened.
//  *
//  * Props:
//  * - currentUser: the logged-in user, e.g. { name: "Avelyn G. Que-loy" }.
//  *   Used to fill "Prepared By" for brand-new quotations only.
//  * - quotationId: for a new quotation this is the previewed next ID; for
//  *   an existing one it's the real, permanent ID (passed down from
//  *   QuotationList.jsx either way).
//  * - initialData: the full saved quotation record when opened by clicking
//  *   an existing row (null for "Add New").
//  * - isEditMode: true when initialData is a real saved record.
//  * - onQuotationUpdated: optional; called with the updated record after a
//  *   PUT that happens outside the normal onSave flow (i.e. Save after an
//  *   auto-create-on-download). Falls back to onClose if not provided.
//  *
//  * Contact list is fetched the same way as AddReceiptModal/JobReceipt.jsx:
//  * GET /api/customers/:customerID -> { ...customer, contactNames: string[] }.
//  * Contacts are plain strings, not {contactID, contactName} objects.
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

//   // --- Admin lock ---------------------------------------------------
//   // Fields are locked only when editing a saved quotation. New
//   // quotations are always "verified" (i.e. unlocked). Note this stays
//   // true even after an auto-create-on-download flips `persisted` to
//   // true below, so the user is never unexpectedly re-locked out of a
//   // form they were already filling in.
//   const [adminVerified, setAdminVerified] = useState(!isEditMode);
//   const [showAdminModal, setShowAdminModal] = useState(false);
//   const fieldsLocked = isEditMode && !adminVerified;

//   // --- Download template / auto-create ------------------------------
//   const [downloading, setDownloading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   // The real, permanent ID once this record exists in the DB. Starts as
//   // the prop (already real if isEditMode, only a preview otherwise) and
//   // gets replaced with the server-generated ID the first time a new
//   // quotation is auto-created via Download Template.
//   const [localQuotationId, setLocalQuotationId] = useState(quotationId);
//   // Whether a DB record for this quotation actually exists yet.
//   const [persisted, setPersisted] = useState(isEditMode);

//   // Attach to onFocus for inputs/textareas, and onMouseDown + onFocus for
//   // selects (mousedown stops the dropdown from opening on click; focus
//   // covers keyboard/tab access). Blurs the field so it doesn't retain
//   // focus behind the admin modal.
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
//   // as JobReceipt.jsx's fetchContactsByCustomerID, so both modals stay
//   // in sync with the same source of truth.
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

//   const update = (field) => (e) =>
//     setForm((f) => ({ ...f, [field]: e.target.value }));

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

//   const buildPayload = (idForRecord) => ({
//     ...form,
//     quotationId: idForRecord,
//     date: date.toISOString().slice(0, 10),
//     preparedBy,
//   });

//   // Silently POSTs the current form as a new quotation record, without
//   // closing the modal or touching the parent's selectedQuotation state.
//   // Returns the server-generated quotationId. Used by Download Template
//   // when nothing has been saved yet.
//   const createQuotationRecord = async () => {
//     const res = await fetch(`${API}/api/quotations`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(buildPayload(localQuotationId)),
//     });
//     if (!res.ok) throw new Error("Failed to save quotation");
//     const result = await res.json();
//     if (!result.success || !result.quotationId) {
//       throw new Error("Failed to save quotation");
//     }
//     return result.quotationId;
//   };

//   // Fetches the filled-in Word template from the server
//   // (GET /api/quotations/:quotationId/download-template) and triggers a
//   // browser download of the returned .docx. If the quotation hasn't been
//   // saved yet, it's created first (see createQuotationRecord above) so
//   // the template always has real data to render.
//   const handleDownloadTemplate = async () => {
//     if (downloading) return;
//     setDownloading(true);
//     try {
//       let idToUse = localQuotationId;
//       if (!persisted) {
//         idToUse = await createQuotationRecord();
//         setLocalQuotationId(idToUse);
//         setPersisted(true);
//       }

//       const res = await fetch(
//         `${API}/api/quotations/${encodeURIComponent(idToUse)}/download-template`,
//       );
//       if (!res.ok) throw new Error("Failed to download template");

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${idToUse.replace(/\//g, "-")}.docx`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Failed to download template:", err);
//       alert("Failed to download template. Please try again.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   // If a record was already auto-created by Download Template (persisted
//   // is true but the modal was opened in "Add New" mode), Save must PUT
//   // that same record instead of letting the parent's onSave POST a
//   // duplicate. Otherwise defer to the parent as normal.
//   const handleSaveClick = async () => {
//     if (persisted && !isEditMode) {
//       setSaving(true);
//       try {
//         const res = await fetch(
//           `${API}/api/quotations/${encodeURIComponent(localQuotationId)}`,
//           {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(buildPayload(localQuotationId)),
//           },
//         );
//         if (!res.ok) throw new Error("Failed to save quotation");
//         const result = await res.json();
//         if (result.success) {
//           if (onQuotationUpdated) {
//             onQuotationUpdated({
//               ...buildPayload(localQuotationId),
//               status: "Creating",
//             });
//           } else {
//             onClose();
//           }
//         }
//       } catch (err) {
//         console.error("Failed to save quotation:", err);
//       } finally {
//         setSaving(false);
//       }
//       return;
//     }

//     onSave(buildPayload(localQuotationId));
//   };

//   const formattedDate = date.toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   });

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
//               <label>Customer ID</label>
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
//                 />
//                 {/* Lookup button is a button — left ungated per requirements */}
//                 <button
//                   type="button"
//                   className="cdms-search-btn"
//                   title="Look up customer"
//                   onClick={() => setShowCustomerLookup(true)}
//                 >
//                   🔍
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Two-column field grid */}
//           <div className="cdms-form-columns">
//             <div className="cdms-column">
//               <div className="cdms-field">
//                 <label>Company Name</label>
//                 <input
//                   value={form.companyName}
//                   onChange={update("companyName")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Address</label>
//                 <textarea
//                   rows={3}
//                   value={form.address}
//                   onChange={update("address")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Contact Info</label>
//                 <textarea
//                   rows={3}
//                   value={form.contactInfo}
//                   onChange={update("contactInfo")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Contact Name</label>
//                 <div className="cdms-select-row">
//                   <select
//                     name="contactName"
//                     value={form.contactName}
//                     onChange={update("contactName")}
//                     onMouseDown={guardField}
//                     onFocus={guardField}
//                     disabled={contacts.length === 0}
//                   >
//                     <option value="">
//                       {contacts.length === 0
//                         ? "-- No customer selected --"
//                         : "-- Select Contact --"}
//                     </option>
//                     {contacts.map((name, idx) => (
//                       <option key={idx} value={name}>
//                         {name}
//                       </option>
//                     ))}
//                   </select>
//                   {/* Add-contact button — left ungated per requirements */}
//                   <button
//                     type="button"
//                     className="cdms-add-btn"
//                     title="Add contact"
//                     disabled={!form.customerId?.trim()}
//                     onClick={() => setShowAddContact(true)}
//                   >
//                     +
//                   </button>
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
//                 <label>Reference</label>
//                 <input
//                   value={form.reference}
//                   onChange={update("reference")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Purchase Order</label>
//                 <input
//                   value={form.poNumber}
//                   onChange={update("poNumber")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Remarks</label>
//                 <textarea
//                   rows={6}
//                   value={form.remarks}
//                   onChange={update("remarks")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="cdms-modal-footer">
//           <div className="cdms-footer-left">
//             <button
//               className="cdms-btn cdms-btn-primary"
//               onClick={handleSaveClick}
//               disabled={saving}
//             >
//               {saving ? "Saving..." : "Save"}
//             </button>
//             <div className="cdms-field">
//               <div className="cdms-select-row">
//                 <button
//                   type="button"
//                   className="cdms-btn"
//                   onClick={() => console.log("TODO: upload file")}
//                 >
//                   Upload File
//                 </button>
//                 <button
//                   type="button"
//                   className="cdms-btn"
//                   onClick={() => console.log("TODO: view files")}
//                 >
//                   View Files
//                 </button>
//                 <button
//                   type="button"
//                   className="cdms-btn"
//                   onClick={handleDownloadTemplate}
//                   disabled={downloading}
//                   title="Download filled Word template"
//                 >
//                   {downloading ? "Downloading..." : "Download Template"}
//                 </button>
//               </div>
//             </div>
//             <button className="cdms-btn" onClick={onClose}>
//               Cancel
//             </button>
//             <button className="cdms-btn">Print</button>
//           </div>
//           <div className="cdms-footer-right">
//             <button className="cdms-btn">Back</button>
//             <button className="cdms-btn" onClick={onClose}>
//               Exit
//             </button>
//           </div>
//         </div>
//       </div>

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
//     </div>
//   );
// };

// export default AddQuotationModal;
// import React, { useState, useEffect } from "react";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import CustomerLookupModal from "../jobreceipt/CustomerLookupModal";
// import AddContactSubModal from "../jobreceipt/AddContactSubModal";
// import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
// import "./AddQuotationModal.css";

// const API = import.meta.env.VITE_API_URL;

// /**
//  * AddQuotationModal
//  *
//  * "Add New Quotation" / "Edit Quotation" pop-up. Uses CdmsModalHeader for
//  * the branded title bar, with a light, flat form body (matching the Job
//  * Receipt screen's layout): a top row with Quotation ID / Date / Customer
//  * ID search, then a two-column field grid below.
//  *
//  * Admin lock: when editing an existing quotation (isEditMode), every
//  * field starts locked. The first attempt to interact with any field pops
//  * AdminPasswordModal; once verified, all fields unlock for the rest of
//  * this modal session. Buttons (Save, Cancel, Upload/View Files, Print,
//  * Back, Exit, the customer lookup/add-contact buttons) are never gated.
//  * New quotations are never gated — nothing saved exists yet to protect.
//  *
//  * Download Template: enabled for both new and existing quotations. The
//  * backend route renders the .docx from a saved DB record, so a brand-new
//  * quotation (nothing persisted yet) is silently POSTed first — same
//  * payload Save would send — before the template is fetched. The real
//  * generated quotationId returned by that POST is then kept in local
//  * state (`localQuotationId` / `persisted`) so:
//  *   - a second Download Template click reuses the same record instead of
//  *     creating another one, and
//  *   - clicking Save afterward PUTs that same record instead of letting
//  *     the parent's onSave POST a duplicate.
//  * This local state resets naturally because QuotationList.jsx remounts
//  * this component (via `key={selectedQuotation?.quotationId || "new"}")
//  * every time the modal is reopened.
//  *
//  * Props:
//  * - currentUser: the logged-in user, e.g. { name: "Avelyn G. Que-loy" }.
//  *   Used to fill "Prepared By" for brand-new quotations only.
//  * - quotationId: for a new quotation this is the previewed next ID; for
//  *   an existing one it's the real, permanent ID (passed down from
//  *   QuotationList.jsx either way).
//  * - initialData: the full saved quotation record when opened by clicking
//  *   an existing row (null for "Add New").
//  * - isEditMode: true when initialData is a real saved record.
//  * - onQuotationUpdated: optional; called with the updated record after a
//  *   PUT that happens outside the normal onSave flow (i.e. Save after an
//  *   auto-create-on-download). Falls back to onClose if not provided.
//  *
//  * Contact list is fetched the same way as AddReceiptModal/JobReceipt.jsx:
//  * GET /api/customers/:customerID -> { ...customer, contactNames: string[] }.
//  * Contacts are plain strings, not {contactID, contactName} objects.
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

//   // --- Admin lock ---------------------------------------------------
//   // Fields are locked only when editing a saved quotation. New
//   // quotations are always "verified" (i.e. unlocked). Note this stays
//   // true even after an auto-create-on-download flips `persisted` to
//   // true below, so the user is never unexpectedly re-locked out of a
//   // form they were already filling in.
//   const [adminVerified, setAdminVerified] = useState(!isEditMode);
//   const [showAdminModal, setShowAdminModal] = useState(false);
//   const fieldsLocked = isEditMode && !adminVerified;

//   // --- Download template / auto-create ------------------------------
//   const [downloading, setDownloading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   // The real, permanent ID once this record exists in the DB. Starts as
//   // the prop (already real if isEditMode, only a preview otherwise) and
//   // gets replaced with the server-generated ID the first time a new
//   // quotation is auto-created via Download Template.
//   const [localQuotationId, setLocalQuotationId] = useState(quotationId);
//   // Whether a DB record for this quotation actually exists yet.
//   const [persisted, setPersisted] = useState(isEditMode);

//   // Attach to onFocus for inputs/textareas, and onMouseDown + onFocus for
//   // selects (mousedown stops the dropdown from opening on click; focus
//   // covers keyboard/tab access). Blurs the field so it doesn't retain
//   // focus behind the admin modal.
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
//   // as JobReceipt.jsx's fetchContactsByCustomerID, so both modals stay
//   // in sync with the same source of truth.
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

//   const update = (field) => (e) =>
//     setForm((f) => ({ ...f, [field]: e.target.value }));

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

//   const buildPayload = (idForRecord) => ({
//     ...form,
//     quotationId: idForRecord,
//     date: date.toISOString().slice(0, 10),
//     preparedBy,
//   });

//   // Silently POSTs the current form as a new quotation record, without
//   // closing the modal or touching the parent's selectedQuotation state.
//   // Returns the server-generated quotationId. Used by Download Template
//   // when nothing has been saved yet.
//   const createQuotationRecord = async () => {
//     const res = await fetch(`${API}/api/quotations`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(buildPayload(localQuotationId)),
//     });
//     if (!res.ok) throw new Error("Failed to save quotation");
//     const result = await res.json();
//     if (!result.success || !result.quotationId) {
//       throw new Error("Failed to save quotation");
//     }
//     return result.quotationId;
//   };

//   // Fetches the filled-in Word template from the server
//   // (GET /api/quotations/:quotationId/download-template) and triggers a
//   // browser download of the returned .docx. If the quotation hasn't been
//   // saved yet, it's created first (see createQuotationRecord above) so
//   // the template always has real data to render.
//   const handleDownloadTemplate = async () => {
//     if (downloading) return;
//     setDownloading(true);
//     try {
//       let idToUse = localQuotationId;
//       if (!persisted) {
//         idToUse = await createQuotationRecord();
//         setLocalQuotationId(idToUse);
//         setPersisted(true);
//       }

//       const res = await fetch(
//         `${API}/api/quotations/${encodeURIComponent(idToUse)}/download-template`,
//       );
//       if (!res.ok) throw new Error("Failed to download template");

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${idToUse.replace(/\//g, "-")}.docx`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Failed to download template:", err);
//       alert("Failed to download template. Please try again.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   // If a record was already auto-created by Download Template (persisted
//   // is true but the modal was opened in "Add New" mode), Save must PUT
//   // that same record instead of letting the parent's onSave POST a
//   // duplicate. Otherwise defer to the parent as normal.
//   const handleSaveClick = async () => {
//     if (persisted && !isEditMode) {
//       setSaving(true);
//       try {
//         const res = await fetch(
//           `${API}/api/quotations/${encodeURIComponent(localQuotationId)}`,
//           {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(buildPayload(localQuotationId)),
//           },
//         );
//         if (!res.ok) throw new Error("Failed to save quotation");
//         const result = await res.json();
//         if (result.success) {
//           if (onQuotationUpdated) {
//             onQuotationUpdated({
//               ...buildPayload(localQuotationId),
//               status: "Creating",
//             });
//           } else {
//             onClose();
//           }
//         }
//       } catch (err) {
//         console.error("Failed to save quotation:", err);
//       } finally {
//         setSaving(false);
//       }
//       return;
//     }

//     onSave(buildPayload(localQuotationId));
//   };

//   const formattedDate = date.toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   });

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
//               <label>Customer ID</label>
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
//                 />
//                 {/* Lookup button is a button — left ungated per requirements */}
//                 <button
//                   type="button"
//                   className="cdms-search-btn"
//                   title="Look up customer"
//                   onClick={() => setShowCustomerLookup(true)}
//                 >
//                   🔍
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Two-column field grid */}
//           <div className="cdms-form-columns">
//             <div className="cdms-column">
//               <div className="cdms-field">
//                 <label>Company Name</label>
//                 <input
//                   value={form.companyName}
//                   onChange={update("companyName")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Address</label>
//                 <textarea
//                   rows={3}
//                   value={form.address}
//                   onChange={update("address")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Contact Info</label>
//                 <textarea
//                   rows={3}
//                   value={form.contactInfo}
//                   onChange={update("contactInfo")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Contact Name</label>
//                 <div className="cdms-select-row">
//                   <select
//                     name="contactName"
//                     value={form.contactName}
//                     onChange={update("contactName")}
//                     onMouseDown={guardField}
//                     onFocus={guardField}
//                     disabled={contacts.length === 0}
//                   >
//                     <option value="">
//                       {contacts.length === 0
//                         ? "-- No customer selected --"
//                         : "-- Select Contact --"}
//                     </option>
//                     {contacts.map((name, idx) => (
//                       <option key={idx} value={name}>
//                         {name}
//                       </option>
//                     ))}
//                   </select>
//                   {/* Add-contact button — left ungated per requirements */}
//                   <button
//                     type="button"
//                     className="cdms-add-btn"
//                     title="Add contact"
//                     disabled={!form.customerId?.trim()}
//                     onClick={() => setShowAddContact(true)}
//                   >
//                     +
//                   </button>
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
//                 <label>Reference</label>
//                 <input
//                   value={form.reference}
//                   onChange={update("reference")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Purchase Order</label>
//                 <input
//                   value={form.poNumber}
//                   onChange={update("poNumber")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>

//               <div className="cdms-field">
//                 <label>Remarks</label>
//                 <textarea
//                   rows={6}
//                   value={form.remarks}
//                   onChange={update("remarks")}
//                   onFocus={guardField}
//                   readOnly={fieldsLocked}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="cdms-modal-footer">
//           <div className="cdms-footer-left">
//             <button
//               className="cdms-btn cdms-btn-primary"
//               onClick={handleSaveClick}
//               disabled={saving}
//             >
//               {saving ? "Saving..." : "Save"}
//             </button>
//             <div className="cdms-field">
//               <div className="cdms-select-row">
//                 <button
//                   type="button"
//                   className="cdms-btn"
//                   onClick={() => console.log("TODO: upload file")}
//                 >
//                   Upload PDF
//                 </button>
//                 <button
//                   type="button"
//                   className="cdms-btn"
//                   onClick={() => console.log("TODO: view files")}
//                 >
//                   View Files
//                 </button>
//                 <button
//                   type="button"
//                   className="cdms-btn"
//                   onClick={handleDownloadTemplate}
//                   disabled={downloading}
//                   title="Download filled Word template"
//                 >
//                   {downloading ? "Downloading..." : "Download Template"}
//                 </button>
//               </div>
//             </div>
//             <button className="cdms-btn" onClick={onClose}>
//               Cancel
//             </button>
//             <button className="cdms-btn">Print</button>
//           </div>
//           <div className="cdms-footer-right">
//             <button className="cdms-btn">Back</button>
//             <button className="cdms-btn" onClick={onClose}>
//               Exit
//             </button>
//           </div>
//         </div>
//       </div>

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
//     </div>
//   );
// };

// export default AddQuotationModal;
import React, { useState, useEffect, useRef } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import CustomerLookupModal from "../jobreceipt/CustomerLookupModal";
import AddContactSubModal from "../jobreceipt/AddContactSubModal";
import AdminPasswordModal from "../jobreceipt/AdminPasswordModal";
import "./AddQuotationModal.css";

const API = import.meta.env.VITE_API_URL;

/**
 * AddQuotationModal
 *
 * "Add New Quotation" / "Edit Quotation" pop-up. Uses CdmsModalHeader for
 * the branded title bar, with a light, flat form body (matching the Job
 * Receipt screen's layout): a top row with Quotation ID / Date / Customer
 * ID search, then a two-column field grid below.
 *
 * Admin lock: when editing an existing quotation (isEditMode), every
 * field starts locked. The first attempt to interact with any field pops
 * AdminPasswordModal; once verified, all fields unlock for the rest of
 * this modal session. Buttons (Save, Cancel, Upload/View Files, Print,
 * Back, Exit, the customer lookup/add-contact buttons) are never gated.
 * New quotations are never gated — nothing saved exists yet to protect.
 *
 * Download Template: enabled for both new and existing quotations. The
 * backend route renders the .docx from a saved DB record, so a brand-new
 * quotation (nothing persisted yet) is silently POSTed first — same
 * payload Save would send — before the template is fetched. The real
 * generated quotationId returned by that POST is then kept in local
 * state (`localQuotationId` / `persisted`) so:
 *   - a second Download Template click reuses the same record instead of
 *     creating another one, and
 *   - clicking Save afterward reuses that same record instead of letting
 *     the parent's onSave POST a duplicate.
 * This local state resets naturally because QuotationList.jsx remounts
 * this component (via `key={selectedQuotation?.quotationId || "new"}")
 * every time the modal is reopened.
 *
 * Re-upload Template — DEFERRED UPLOAD: "Re-upload Template" only opens
 * the native file picker and stages the chosen file in `pendingFile`
 * state. Nothing is sent to the server (and therefore nothing reaches
 * Cloudinary) at selection time. The actual
 * PUT /api/quotations/:id/upload-template call — the one the backend
 * forwards to Cloudinary and that flips status to "For Checking" — only
 * fires as part of handleSaveClick, right before the record's other
 * fields are saved. This means selecting a file and then closing the
 * modal without saving uploads nothing. `hasUploadedFile` seeds true
 * when editing a record that already has a staffFileUrl, so re-opening
 * an already "For Checking"+ quotation doesn't re-lock Save; Save is
 * enabled whenever there's either an already-uploaded file or a newly
 * staged one waiting to go up.
 *
 * Props:
 * - currentUser: the logged-in user, e.g. { name: "Avelyn G. Que-loy" }.
 *   Used to fill "Prepared By" for brand-new quotations only.
 * - quotationId: for a new quotation this is the previewed next ID; for
 *   an existing one it's the real, permanent ID (passed down from
 *   QuotationList.jsx either way).
 * - initialData: the full saved quotation record when opened by clicking
 *   an existing row (null for "Add New").
 * - isEditMode: true when initialData is a real saved record.
 * - onQuotationUpdated: optional; called with the updated record after a
 *   save/upload that happens outside the normal onSave flow (i.e. Save
 *   after an auto-create-on-download, or a same-session record created
 *   just to attach this Save's file). Falls back to onClose if not
 *   provided.
 *
 * Contact list is fetched the same way as AddReceiptModal/JobReceipt.jsx:
 * GET /api/customers/:customerID -> { ...customer, contactNames: string[] }.
 * Contacts are plain strings, not {contactID, contactName} objects.
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

  // --- Admin lock ---------------------------------------------------
  // Fields are locked only when editing a saved quotation. New
  // quotations are always "verified" (i.e. unlocked). Note this stays
  // true even after an auto-create-on-download flips `persisted` to
  // true below, so the user is never unexpectedly re-locked out of a
  // form they were already filling in.
  const [adminVerified, setAdminVerified] = useState(!isEditMode);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const fieldsLocked = isEditMode && !adminVerified;

  // --- Download template / auto-create ------------------------------
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  // The real, permanent ID once this record exists in the DB. Starts as
  // the prop (already real if isEditMode, only a preview otherwise) and
  // gets replaced with the server-generated ID the first time a new
  // quotation is auto-created via Download Template or via Save.
  const [localQuotationId, setLocalQuotationId] = useState(quotationId);
  // Whether a DB record for this quotation actually exists yet.
  const [persisted, setPersisted] = useState(isEditMode);

  // --- Re-upload Template (staged locally, gates & fires on Save) ----
  const fileInputRef = useRef(null);
  // The file the user picked, held in memory only. Nothing is uploaded
  // until Save runs. Cleared once Save successfully uploads it.
  const [pendingFile, setPendingFile] = useState(null);
  // True once a file has been uploaded in a PAST save, OR if this record
  // already had a staffFileUrl when opened (editing an existing "For
  // Checking"+ quotation shouldn't re-lock Save every time it's opened).
  const [hasUploadedFile, setHasUploadedFile] = useState(
    Boolean(initialData?.staffFileUrl),
  );
  const [staffFileUrl, setStaffFileUrl] = useState(
    initialData?.staffFileUrl || "",
  );

  // Attach to onFocus for inputs/textareas, and onMouseDown + onFocus for
  // selects (mousedown stops the dropdown from opening on click; focus
  // covers keyboard/tab access). Blurs the field so it doesn't retain
  // focus behind the admin modal.
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
  // as JobReceipt.jsx's fetchContactsByCustomerID, so both modals stay
  // in sync with the same source of truth.
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

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

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

  const buildPayload = (idForRecord) => ({
    ...form,
    quotationId: idForRecord,
    date: date.toISOString().slice(0, 10),
    preparedBy,
  });

  // Silently POSTs the current form as a new quotation record, without
  // closing the modal or touching the parent's selectedQuotation state.
  // Returns the server-generated quotationId. Used by Download Template
  // and by Save when nothing has been saved yet (e.g. a new quotation
  // with a file staged and ready to go up).
  const createQuotationRecord = async () => {
    const res = await fetch(`${API}/api/quotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(localQuotationId)),
    });
    if (!res.ok) throw new Error("Failed to save quotation");
    const result = await res.json();
    if (!result.success || !result.quotationId) {
      throw new Error("Failed to save quotation");
    }
    return result.quotationId;
  };

  // Fetches the filled-in Word template from the server
  // (GET /api/quotations/:quotationId/download-template) and triggers a
  // browser download of the returned .docx. If the quotation hasn't been
  // saved yet, it's created first (see createQuotationRecord above) so
  // the template always has real data to render.
  const handleDownloadTemplate = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      let idToUse = localQuotationId;
      if (!persisted) {
        idToUse = await createQuotationRecord();
        setLocalQuotationId(idToUse);
        setPersisted(true);
      }

      const res = await fetch(
        `${API}/api/quotations/${encodeURIComponent(idToUse)}/download-template`,
      );
      if (!res.ok) throw new Error("Failed to download template");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${idToUse.replace(/\//g, "-")}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download template:", err);
      alert("Failed to download template. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Opens the native file picker. Nothing is uploaded here — see
  // handleFileSelected.
  const handleReuploadClick = () => {
    fileInputRef.current?.click();
  };

  // Just stages the chosen file in memory. No network call, no
  // Cloudinary upload — that only happens inside handleSaveClick.
  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    // Reset now so re-selecting the same filename later still fires onChange
    e.target.value = "";
    if (!file) return;
    setPendingFile(file);
  };

  // Save now does everything in one user-facing action:
  //   1. If this quotation record doesn't exist in the DB yet, create it
  //      (needed so a staged file has a real record to attach to).
  //   2. If a file was staged via Re-upload Template, upload it now
  //      (PUT .../upload-template — this is the Cloudinary-backed call,
  //      and it's what flips status to "For Checking" server-side).
  //   3. Persist the form's text fields — either via a local PUT (when
  //      this record was only just created/auto-created and isn't a
  //      true edit-mode record) or by deferring to the parent's onSave
  //      (true edit-mode, where the parent owns the PUT).
  const handleSaveClick = async () => {
    setSaving(true);
    try {
      let idToUse = localQuotationId;

      // Step 1: make sure a real record exists before attaching a file
      // or saving fields against it.
      if (!persisted) {
        idToUse = await createQuotationRecord();
        setLocalQuotationId(idToUse);
        setPersisted(true);
      }

      // Step 2: upload the staged file, if any. This is the only place
      // in the component that talks to the upload-template endpoint.
      let latestStaffFileUrl = staffFileUrl;
      if (pendingFile) {
        const formData = new FormData();
        formData.append("file", pendingFile);

        const uploadRes = await fetch(
          `${API}/api/quotations/${encodeURIComponent(idToUse)}/upload-template`,
          { method: "PUT", body: formData },
        );
        if (!uploadRes.ok) throw new Error("Failed to upload template");
        const uploadResult = await uploadRes.json();
        if (!uploadResult.success) throw new Error("Failed to upload template");

        latestStaffFileUrl = uploadResult.quotation.staffFileUrl;
        setStaffFileUrl(latestStaffFileUrl);
        setHasUploadedFile(true);
        setPendingFile(null);
      }

      // Step 3: persist the text fields.
      if (!isEditMode) {
        // Either brand-new-and-just-created above, or auto-created
        // earlier this session by Download Template — either way this
        // record was never a true edit-mode record, so PUT it directly
        // here rather than letting the parent's onSave POST a duplicate.
        const res = await fetch(
          `${API}/api/quotations/${encodeURIComponent(idToUse)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildPayload(idToUse)),
          },
        );
        if (!res.ok) throw new Error("Failed to save quotation");
        const result = await res.json();
        if (result.success) {
          if (onQuotationUpdated) {
            onQuotationUpdated({
              ...buildPayload(idToUse),
              status: "For Checking",
              staffFileUrl: latestStaffFileUrl,
            });
          } else {
            onClose();
          }
        }
      } else {
        // True edit mode — defer to the parent's normal save flow.
        onSave(buildPayload(idToUse));
      }
    } catch (err) {
      console.error("Failed to save quotation:", err);
      alert("Failed to save quotation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

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
              <label>Customer ID</label>
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
                />
                {/* Lookup button is a button — left ungated per requirements */}
                <button
                  type="button"
                  className="cdms-search-btn"
                  title="Look up customer"
                  onClick={() => setShowCustomerLookup(true)}
                >
                  🔍
                </button>
              </div>
            </div>
          </div>

          {/* Two-column field grid */}
          <div className="cdms-form-columns">
            <div className="cdms-column">
              <div className="cdms-field">
                <label>Company Name</label>
                <input
                  value={form.companyName}
                  onChange={update("companyName")}
                  onFocus={guardField}
                  readOnly={fieldsLocked}
                />
              </div>

              <div className="cdms-field">
                <label>Address</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={update("address")}
                  onFocus={guardField}
                  readOnly={fieldsLocked}
                />
              </div>

              <div className="cdms-field">
                <label>Contact Info</label>
                <textarea
                  rows={3}
                  value={form.contactInfo}
                  onChange={update("contactInfo")}
                  onFocus={guardField}
                  readOnly={fieldsLocked}
                />
              </div>

              <div className="cdms-field">
                <label>Contact Name</label>
                <div className="cdms-select-row">
                  <select
                    name="contactName"
                    value={form.contactName}
                    onChange={update("contactName")}
                    onMouseDown={guardField}
                    onFocus={guardField}
                    disabled={contacts.length === 0}
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
                  {/* Add-contact button — left ungated per requirements */}
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
              </div>

              <div className="cdms-field">
                <label>Prepared By</label>
                <input value={preparedBy} readOnly className="cdms-readonly" />
              </div>
            </div>

            <div className="cdms-column-divider" />

            <div className="cdms-column">
              <div className="cdms-field">
                <label>Reference</label>
                <input
                  value={form.reference}
                  onChange={update("reference")}
                  onFocus={guardField}
                  readOnly={fieldsLocked}
                />
              </div>

              <div className="cdms-field">
                <label>Purchase Order</label>
                <input
                  value={form.poNumber}
                  onChange={update("poNumber")}
                  onFocus={guardField}
                  readOnly={fieldsLocked}
                />
              </div>

              <div className="cdms-field">
                <label>Remarks</label>
                <textarea
                  rows={6}
                  value={form.remarks}
                  onChange={update("remarks")}
                  onFocus={guardField}
                  readOnly={fieldsLocked}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="cdms-modal-footer">
          <div className="cdms-footer-left">
            <button
              className="cdms-btn cdms-btn-primary"
              onClick={handleSaveClick}
              disabled={saving || (!hasUploadedFile && !pendingFile)}
              title={
                !hasUploadedFile && !pendingFile
                  ? "Attach the filled-in template before saving"
                  : undefined
              }
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <div className="cdms-field">
              <div className="cdms-select-row">
                <button
                  type="button"
                  className="cdms-btn"
                  onClick={() => console.log("TODO: upload file")}
                >
                  Upload PDF
                </button>
                <button
                  type="button"
                  className="cdms-btn"
                  onClick={() => console.log("TODO: view files")}
                >
                  View Files
                </button>
                <button
                  type="button"
                  className="cdms-btn"
                  onClick={handleDownloadTemplate}
                  disabled={downloading}
                  title="Download filled Word template"
                >
                  {downloading ? "Downloading..." : "Download Template"}
                </button>
                <button
                  type="button"
                  className="cdms-btn"
                  onClick={handleReuploadClick}
                  disabled={saving}
                  title="Attach the filled-in quotation template (uploads when you click Save)"
                >
                  {pendingFile ? "Change Selected File" : "Re-upload Template"}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".doc,.docx,.pdf"
                  onChange={handleFileSelected}
                />
                {pendingFile && (
                  <span className="cdms-upload-status" title={pendingFile.name}>
                    📎 {pendingFile.name} (will upload on Save)
                  </span>
                )}
                {!pendingFile && hasUploadedFile && (
                  <span className="cdms-upload-status" title={staffFileUrl}>
                    ✓ Template uploaded
                  </span>
                )}
              </div>
            </div>
            <button className="cdms-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="cdms-btn">Print</button>
          </div>
          <div className="cdms-footer-right">
            <button className="cdms-btn">Back</button>
            <button className="cdms-btn" onClick={onClose}>
              Exit
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default AddQuotationModal;
