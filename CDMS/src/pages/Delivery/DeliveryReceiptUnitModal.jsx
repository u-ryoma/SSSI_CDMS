// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader"; // adjust path to wherever this actually lives
// import CustomerLookupModal from "../jobreceipt/CustomerLookupModal"; // adjust path to wherever this actually lives
// import ConfirmDialog from "../../components/ConfirmDialog";
// import "./DeliveryReceiptModals.css";
// import ReleaseUnitModal from "./ReleaseUnitModal";
// import PrintDeliveryReceiptModal from "./PrintDeliveryReceiptModal";

// const API = import.meta.env.VITE_API_URL;

// const EMPTY_FORM = {
//   deliveryReceiptId: "",
//   date: "",
//   customerId: "",
//   companyName: "",
//   address: "",
//   contactInfo: "",
//   reference: "",
//   contactName: "",
//   preparedBy: "",
//   remarks: "",
// };

// // Step 2 modal (shown after "Release Instrument" is chosen in
// // DeliveryTypeModal). Customer lookup picks the customer; the items
// // table is filled in from ReleaseUnitModal, which only shows completed
// // jobs (forDeliveryTagged === true, not yet unit-delivered) belonging
// // to that same customer. The items table mirrors ReleaseUnitModal's
// // columns exactly (Job Number/Description/Brand/Model/Serial/ETA/
// // Frequency/Remarks/Concern) since each item already carries that full
// // detail from the database. Saving posts to /api/deliveryreceipts,
// // which generates the DRID server-side (atomic counter), then flags
// // every used job as unitDelivered - a separate flag from
// // certificateDelivered, so the same job can still be released for
// // certificate afterward (or vice versa) without colliding.
// //
// // Prepared By is always the currently logged-in user (sessionStorage
// // "name", set at login - see Login.jsx) and is not editable here.
// //
// // viewRecord: when the parent passes an existing deliveryreceipts doc
// // here (row-click from the "List of Delivered" table), this modal
// // switches into a read-only "details" mode instead of the create flow
// // - form/items are prefilled straight from that record, no new DRID is
// // generated, and every input/Add/Save is locked down since there's
// // nothing to submit.
// //
// // On successful save, a printable "Equipment Tags" view (one tag per
// // item, DRID in place of JR ID) opens automatically via
// // PrintDeliveryReceiptModal, populated from the server's response
// // (data.receipt) - decoupled from the form/items state, which is reset
// // as part of performClose() at the same time.
// //
// // IMPORTANT: the main form portal and the print modal are two
// // independent pieces of UI. The form portal is gated on `isOpen`
// // (parent-controlled), the print modal is gated on `printReceipt`
// // (this component's own state). They must NOT share a single early
// // `return null` guard, or closing the form (which performSave does
// // right after setting printReceipt) will also prevent the print modal
// // from ever rendering.
// const DeliveryReceiptUnitModal = ({
//   isOpen,
//   onClose,
//   onSaved,
//   jobReceiptID,
//   type,
//   viewRecord,
// }) => {
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [items, setItems] = useState([]);
//   const [contactNameOptions, setContactNameOptions] = useState([]);
//   const [showCustomerLookup, setShowCustomerLookup] = useState(false);
//   const [showReleaseUnit, setShowReleaseUnit] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [saveError, setSaveError] = useState("");
//   const [printReceipt, setPrintReceipt] = useState(null);

//   const readOnly = !!viewRecord;

//   // ---- Confirm dialog (same pattern as the other stage modals) ----
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

//   const showConfirm = (title, message, onConfirm, dialogType = "default") => {
//     setDialog({
//       show: true,
//       title,
//       message,
//       onConfirm,
//       onCancel: hideDialog,
//       confirmLabel: "Confirm",
//       cancelLabel: "Cancel",
//       type: dialogType,
//     });
//   };

//   useEffect(() => {
//     if (!isOpen) return;

//     if (viewRecord) {
//       // Details mode: show exactly what's on the saved record, don't
//       // touch the DRID counter or the logged-in user's name.
//       setForm({
//         deliveryReceiptId: viewRecord.deliveryReceiptId || "",
//         date: viewRecord.date || "",
//         customerId: viewRecord.customerId || "",
//         companyName: viewRecord.companyName || "",
//         address: viewRecord.address || "",
//         contactInfo: viewRecord.contactInfo || "",
//         reference: viewRecord.reference || "",
//         contactName: viewRecord.contactName || "",
//         preparedBy: viewRecord.preparedBy || "",
//         remarks: viewRecord.remarks || "",
//       });
//       setItems(Array.isArray(viewRecord.items) ? viewRecord.items : []);
//       setContactNameOptions(
//         viewRecord.contactName ? [viewRecord.contactName] : [],
//       );
//       return;
//     }

//     fetchNextDeliveryReceiptId();
//     setForm((prev) => ({
//       ...prev,
//       date: new Date().toISOString().slice(0, 10),
//       preparedBy: sessionStorage.getItem("username") || "",
//     }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, viewRecord]);

//   // Preview only - the server assigns the real, authoritative DRID via
//   // an atomic counter increment when the receipt is actually saved
//   // (see performSave), so this can never collide with another user's
//   // in-progress receipt.
//   const fetchNextDeliveryReceiptId = async () => {
//     try {
//       const res = await fetch(`${API}/api/deliveryreceipts/next-id`);
//       const data = await res.json();
//       setForm((prev) => ({
//         ...prev,
//         deliveryReceiptId: data.nextDrId || "",
//       }));
//     } catch (err) {
//       console.error("Failed to fetch next delivery receipt ID:", err);
//       setForm((prev) => ({ ...prev, deliveryReceiptId: "" }));
//     }
//   };

//   const handleChange = (field) => (e) => {
//     if (readOnly) return;
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleCustomerLookup = () => {
//     if (readOnly) return;
//     setShowCustomerLookup(true);
//   };

//   const handleCustomerSelected = (customer) => {
//     setForm((prev) => ({
//       ...prev,
//       customerId: customer.customerID || "",
//       companyName: customer.companyName || "",
//       address: customer.companyAddress || "",
//       contactInfo: customer.phoneNumber || "",
//       contactName: customer.contactNames?.[0] || "",
//     }));
//     setContactNameOptions(customer.contactNames || []);
//     // Switching customers invalidates whatever was already logged from
//     // the old customer's completed jobs.
//     setItems([]);
//     setShowCustomerLookup(false);
//   };

//   const handleAddItem = () => {
//     if (readOnly) return;
//     if (!form.customerId) {
//       setDialog({
//         show: true,
//         title: "No Customer Selected",
//         message: "Pick a customer first before logging a completed job.",
//         onConfirm: hideDialog,
//         onCancel: null,
//         confirmLabel: "OK",
//         cancelLabel: "Cancel",
//         type: "default",
//       });
//       return;
//     }
//     setShowReleaseUnit(true);
//   };

//   const handleReleaseUnitAdd = (item) => {
//     setItems((prev) => [...prev, item]);
//   };

//   // Edits a single field of a single logged item (e.g. tweaking Remarks
//   // before saving) without touching the rest of the row.
//   const handleItemFieldChange = (idx, field) => (e) => {
//     if (readOnly) return;
//     const val = e.target.value;
//     setItems((prev) =>
//       prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)),
//     );
//   };

//   const handleLoadOldSystem = () => {
//     console.log("Load Old System");
//   };

//   const handleOpenCamera = () => {
//     console.log("Open Camera");
//   };

//   const handleOpenFolder = () => {
//     console.log("Open Folder");
//   };

//   // Print is now available at any time while editing (as long as
//   // there's at least one item to put on a tag), not just after saving.
//   // It builds a receipt-shaped object from the current in-progress
//   // form/items and hands it to the same PrintDeliveryReceiptModal used
//   // post-save, so both flows render identically.
//   const handlePrint = () => {
//     setPrintReceipt({
//       deliveryReceiptId: form.deliveryReceiptId,
//       date: form.date,
//       companyName: form.companyName,
//       type: type || "unit",
//       items,
//     });
//   };

//   const performSave = async () => {
//     hideDialog();
//     setSaving(true);
//     setSaveError("");
//     try {
//       const res = await fetch(`${API}/api/deliveryreceipts`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...form,
//           deliveryReceiptId: undefined, // server assigns the real one
//           jobReceiptID,
//           type,
//           items,
//         }),
//       });
//       const data = await res.json();

//       if (!data.success) {
//         setSaveError("Failed to save delivery receipt. Please try again.");
//         return;
//       }

//       // Flag every job that was logged into this receipt as
//       // unit-delivered. Deliberately separate from certificateDelivered
//       // so a job released as an instrument here can still be released
//       // for certificate later, and vice versa.
//       await Promise.all(
//         items.map((item) =>
//           fetch(`${API}/api/jobnumbers/update-details`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               jobNumber: item.jobNumber,
//               unitDelivered: true,
//             }),
//           }),
//         ),
//       );

//       if (onSaved) onSaved(data);
//       // Set the print payload BEFORE closing the form. Because the
//       // print modal below is no longer nested under the `isOpen` early
//       // return, it will keep rendering after performClose() flips
//       // isOpen to false in the parent.
//       setPrintReceipt(data.receipt);
//       performClose();
//     } catch (err) {
//       console.error("Failed to save delivery receipt:", err);
//       setSaveError("Failed to save delivery receipt. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveClick = () => {
//     if (readOnly) return;
//     showConfirm(
//       "Confirm Save",
//       `Are you sure you want to save Delivery Receipt ${form.deliveryReceiptId}? This will mark ${items.length} job(s) as unit-delivered.`,
//       performSave,
//       "default",
//     );
//   };

//   const performClose = () => {
//     setForm(EMPTY_FORM);
//     setItems([]);
//     setContactNameOptions([]);
//     setShowReleaseUnit(false);
//     setSaveError("");
//     onClose();
//   };

//   const handleExitClick = () => {
//     hideDialog();
//     if (readOnly || items.length === 0) {
//       // Viewing an existing record, or nothing logged yet - nothing to
//       // lose, just close directly.
//       performClose();
//       return;
//     }
//     showConfirm(
//       "Confirm Exit",
//       "Are you sure you want to exit? Any items logged in this receipt will be lost.",
//       performClose,
//       "danger",
//     );
//   };

//   return (
//     <>
//       {isOpen &&
//         ReactDOM.createPortal(
//           <div className="dr-modal-overlay">
//             <div className="dr-modal dr-modal--large">
//               <CdmsModalHeader
//                 title="DELIVERY RECEIPT (UNIT)"
//                 onClose={handleExitClick}
//               />

//               <div className="dr-modal-body">
//                 <div className="dr-form-grid">
//                   <div className="dr-form-col">
//                     <div className="dr-field dr-field--inline">
//                       <label>Customer ID</label>
//                       <input
//                         type="text"
//                         value={form.customerId}
//                         onChange={handleChange("customerId")}
//                         disabled={readOnly}
//                       />
//                       {!readOnly && (
//                         <button
//                           type="button"
//                           className="dr-icon-btn"
//                           onClick={handleCustomerLookup}
//                           aria-label="Search customer"
//                         >
//                           🔍
//                         </button>
//                       )}
//                     </div>

//                     <div className="dr-field">
//                       <label>Company Name</label>
//                       <textarea
//                         rows={4}
//                         value={form.companyName}
//                         onChange={handleChange("companyName")}
//                         disabled={readOnly}
//                       />
//                     </div>

//                     <div className="dr-field">
//                       <label>Contact Info</label>
//                       <textarea
//                         rows={4}
//                         value={form.contactInfo}
//                         onChange={handleChange("contactInfo")}
//                         disabled={readOnly}
//                       />
//                     </div>
//                   </div>

//                   <div className="dr-form-col">
//                     <div className="dr-field dr-field--inline dr-field--right">
//                       <label>Delivery Receipt ID</label>
//                       <input
//                         type="text"
//                         value={form.deliveryReceiptId}
//                         readOnly
//                       />
//                     </div>

//                     <div className="dr-field dr-field--inline dr-field--right">
//                       <label>Date</label>
//                       <input
//                         type="date"
//                         value={form.date}
//                         onChange={handleChange("date")}
//                         disabled={readOnly}
//                       />
//                     </div>

//                     <div className="dr-field">
//                       <label>Address</label>
//                       <textarea
//                         rows={4}
//                         value={form.address}
//                         onChange={handleChange("address")}
//                         disabled={readOnly}
//                       />
//                     </div>

//                     <div className="dr-field dr-field--inline dr-field--right">
//                       <label>Reference</label>
//                       <input
//                         type="text"
//                         value={form.reference}
//                         onChange={handleChange("reference")}
//                         disabled={readOnly}
//                       />
//                     </div>

//                     <div className="dr-field dr-field--inline dr-field--right">
//                       <label>Contact Name</label>
//                       <select
//                         value={form.contactName}
//                         onChange={handleChange("contactName")}
//                         disabled={readOnly}
//                       >
//                         <option value="">---</option>
//                         {contactNameOptions.map((c) => (
//                           <option key={c._id || c} value={c.name || c}>
//                             {c.name || c}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="dr-field dr-field--inline dr-field--right">
//                       <label>Prepared By</label>
//                       <input type="text" value={form.preparedBy} disabled />
//                     </div>
//                   </div>
//                 </div>

//                 {!readOnly && (
//                   <div className="dr-modal-actions">
//                     <button className="dr-btn" onClick={handleAddItem}>
//                       Add
//                     </button>
//                     <button className="dr-btn" onClick={handleLoadOldSystem}>
//                       Load Old System
//                     </button>
//                   </div>
//                 )}

//                 <div className="dr-table-wrapper">
//                   <table className="dr-table">
//                     <thead>
//                       <tr>
//                         <th>Job Number</th>
//                         <th>Description</th>
//                         <th>Brand</th>
//                         <th>Model</th>
//                         <th>Serial No.</th>
//                         <th>ETA</th>
//                         <th>Frequency</th>
//                         <th>Remarks</th>
//                         <th>Concern</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {items.length > 0 ? (
//                         items.map((item, idx) =>
//                           readOnly ? (
//                             <tr key={item.id || item.jobNumber || idx}>
//                               <td>{item.jobNumber}</td>
//                               <td>{item.description || "—"}</td>
//                               <td>{item.brand || "—"}</td>
//                               <td>{item.model || "—"}</td>
//                               <td>{item.serialNo || "—"}</td>
//                               <td>{item.eta || "—"}</td>
//                               <td>{item.frequency || "—"}</td>
//                               <td>{item.remarks || "—"}</td>
//                               <td>{item.concern || "—"}</td>
//                             </tr>
//                           ) : (
//                             <tr key={item.id}>
//                               <td>{item.jobNumber}</td>
//                               <td>
//                                 <input
//                                   type="text"
//                                   value={item.description || ""}
//                                   onChange={handleItemFieldChange(
//                                     idx,
//                                     "description",
//                                   )}
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="text"
//                                   value={item.brand || ""}
//                                   onChange={handleItemFieldChange(idx, "brand")}
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="text"
//                                   value={item.model || ""}
//                                   onChange={handleItemFieldChange(idx, "model")}
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="text"
//                                   value={item.serialNo || ""}
//                                   onChange={handleItemFieldChange(
//                                     idx,
//                                     "serialNo",
//                                   )}
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="text"
//                                   value={item.eta || ""}
//                                   onChange={handleItemFieldChange(idx, "eta")}
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="text"
//                                   value={item.frequency || ""}
//                                   onChange={handleItemFieldChange(
//                                     idx,
//                                     "frequency",
//                                   )}
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="text"
//                                   value={item.remarks || ""}
//                                   onChange={handleItemFieldChange(
//                                     idx,
//                                     "remarks",
//                                   )}
//                                 />
//                               </td>
//                               <td>
//                                 <input
//                                   type="text"
//                                   value={item.concern || ""}
//                                   onChange={handleItemFieldChange(
//                                     idx,
//                                     "concern",
//                                   )}
//                                 />
//                               </td>
//                             </tr>
//                           ),
//                         )
//                       ) : (
//                         <tr>
//                           <td colSpan="9" className="no-data">
//                             No items added
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="dr-field">
//                   <label>Remarks</label>
//                   <textarea
//                     rows={3}
//                     value={form.remarks}
//                     onChange={handleChange("remarks")}
//                     disabled={readOnly}
//                   />
//                 </div>

//                 {saveError && (
//                   <p className="dr-error-text" role="alert">
//                     {saveError}
//                   </p>
//                 )}
//               </div>

//               <div className="dr-modal-footer">
//                 <button className="dr-btn dr-btn--link" disabled>
//                   Modification History
//                 </button>
//                 <button className="dr-btn" onClick={handleOpenCamera}>
//                   Open Camera
//                 </button>
//                 <button className="dr-btn" onClick={handleOpenFolder}>
//                   Open Folder
//                 </button>
//                 <div className="dr-modal-footer-spacer" />
//                 <button
//                   className="dr-btn"
//                   onClick={handlePrint}
//                   disabled={items.length === 0}
//                 >
//                   Print
//                 </button>
//                 {!readOnly && (
//                   <button
//                     className="dr-btn dr-btn--primary"
//                     onClick={handleSaveClick}
//                     disabled={saving || items.length === 0}
//                   >
//                     {saving ? "Saving..." : "Save"}
//                   </button>
//                 )}
//                 <button className="dr-btn" onClick={handleExitClick}>
//                   {readOnly ? "Close" : "Exit"}
//                 </button>
//               </div>
//             </div>
//           </div>,
//           document.body,
//         )}

//       {showCustomerLookup && (
//         <CustomerLookupModal
//           onClose={() => setShowCustomerLookup(false)}
//           onSelect={handleCustomerSelected}
//         />
//       )}

//       <ReleaseUnitModal
//         isOpen={showReleaseUnit}
//         onClose={() => setShowReleaseUnit(false)}
//         onAddItem={handleReleaseUnitAdd}
//         addedIds={items.map((it) => it.id)}
//         customerId={form.customerId}
//       />

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

//       {printReceipt && (
//         <PrintDeliveryReceiptModal
//           receipt={printReceipt}
//           onClose={() => setPrintReceipt(null)}
//         />
//       )}
//     </>
//   );
// };

// export default DeliveryReceiptUnitModal;
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader"; // adjust path to wherever this actually lives
import CustomerLookupModal from "../jobreceipt/CustomerLookupModal"; // adjust path to wherever this actually lives
import ConfirmDialog from "../../components/ConfirmDialog";
import "./DeliveryReceiptModals.css";
import ReleaseUnitModal from "./ReleaseUnitModal";
import PrintDeliveryReceiptModal from "./PrintDeliveryReceiptModal";
import CameraCaptureModal from "../jobreceipt/CameraCaptureModal"; // adjust path if it lives elsewhere
import ReceiptFolderModal from "../jobreceipt/ReceiptFolderModal"; // adjust path if it lives elsewhere

const API = import.meta.env.VITE_API_URL;

const EMPTY_FORM = {
  deliveryReceiptId: "",
  date: "",
  customerId: "",
  companyName: "",
  address: "",
  contactInfo: "",
  reference: "",
  contactName: "",
  preparedBy: "",
  remarks: "",
};

// Step 2 modal (shown after "Release Instrument" is chosen in
// DeliveryTypeModal). Customer lookup picks the customer; the items
// table is filled in from ReleaseUnitModal, which only shows completed
// jobs (forDeliveryTagged === true, not yet unit-delivered) belonging
// to that same customer. The items table mirrors ReleaseUnitModal's
// columns exactly (Job Number/Description/Brand/Model/Serial/ETA/
// Frequency/Remarks/Concern) since each item already carries that full
// detail from the database. Saving posts to /api/deliveryreceipts,
// which generates the DRID server-side (atomic counter), then flags
// every used job as unitDelivered - a separate flag from
// certificateDelivered, so the same job can still be released for
// certificate afterward (or vice versa) without colliding.
//
// Prepared By is always the currently logged-in user (sessionStorage
// "name", set at login - see Login.jsx) and is not editable here.
//
// viewRecord: when the parent passes an existing deliveryreceipts doc
// here (row-click from the "List of Delivered" table), this modal
// switches into a read-only "details" mode instead of the create flow
// - form/items are prefilled straight from that record, no new DRID is
// generated, and every input/Add/Save is locked down since there's
// nothing to submit.
//
// On successful save, a printable "Equipment Tags" view (one tag per
// item, DRID in place of JR ID) opens automatically via
// PrintDeliveryReceiptModal, populated from the server's response
// (data.receipt) - decoupled from the form/items state, which is reset
// as part of performClose() at the same time.
//
// IMPORTANT: the main form portal and the print modal are two
// independent pieces of UI. The form portal is gated on `isOpen`
// (parent-controlled), the print modal is gated on `printReceipt`
// (this component's own state). They must NOT share a single early
// `return null` guard, or closing the form (which performSave does
// right after setting printReceipt) will also prevent the print modal
// from ever rendering.
//
// CAMERA / FOLDER: "Open Camera" opens CameraCaptureModal with a
// contextLabel of "DELIVERY RECEIPT (UNIT) #<DRID>" so photos taken
// here are visibly distinguished from photos taken anywhere else in the
// app (job receipt, incoming calibration, certificate release, etc).
// Captured photos accumulate in `photos` state, ride along in the save
// payload, and are also handed to ReceiptFolderModal as
// `unitPhotoUrls` so "Open Folder" shows them alongside each logged
// job's existing Cloudinary files. Photos are session-only until Save;
// they're cleared in performClose() same as form/items.
//
// PHOTO UPLOAD FAILURES: the backend uploads each captured photo to
// Cloudinary before inserting the receipt; if some/all fail, the
// receipt still saves but the response carries a photoUploadWarning
// string. That's surfaced here via the same ConfirmDialog used
// elsewhere in this modal (info-style, single OK button) right after
// a successful save, so a partial photo failure isn't silently
// indistinguishable from a clean save.
const DeliveryReceiptUnitModal = ({
  isOpen,
  onClose,
  onSaved,
  jobReceiptID,
  type,
  viewRecord,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [contactNameOptions, setContactNameOptions] = useState([]);
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [showReleaseUnit, setShowReleaseUnit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [printReceipt, setPrintReceipt] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showFolder, setShowFolder] = useState(false);
  const [photos, setPhotos] = useState([]);

  const readOnly = !!viewRecord;

  // ---- Confirm dialog (same pattern as the other stage modals) ----
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

  const showConfirm = (title, message, onConfirm, dialogType = "default") => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm,
      onCancel: hideDialog,
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      type: dialogType,
    });
  };

  // Info/warning message, single OK button, no Cancel — used for the
  // post-save photoUploadWarning notice.
  const showNotice = (title, message) => {
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

  useEffect(() => {
    if (!isOpen) return;

    if (viewRecord) {
      // Details mode: show exactly what's on the saved record, don't
      // touch the DRID counter or the logged-in user's name.
      setForm({
        deliveryReceiptId: viewRecord.deliveryReceiptId || "",
        date: viewRecord.date || "",
        customerId: viewRecord.customerId || "",
        companyName: viewRecord.companyName || "",
        address: viewRecord.address || "",
        contactInfo: viewRecord.contactInfo || "",
        reference: viewRecord.reference || "",
        contactName: viewRecord.contactName || "",
        preparedBy: viewRecord.preparedBy || "",
        remarks: viewRecord.remarks || "",
      });
      setItems(Array.isArray(viewRecord.items) ? viewRecord.items : []);
      setContactNameOptions(
        viewRecord.contactName ? [viewRecord.contactName] : [],
      );
      setPhotos(Array.isArray(viewRecord.photos) ? viewRecord.photos : []);
      return;
    }

    fetchNextDeliveryReceiptId();
    setForm((prev) => ({
      ...prev,
      date: new Date().toISOString().slice(0, 10),
      preparedBy: sessionStorage.getItem("username") || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, viewRecord]);

  // Preview only - the server assigns the real, authoritative DRID via
  // an atomic counter increment when the receipt is actually saved
  // (see performSave), so this can never collide with another user's
  // in-progress receipt.
  const fetchNextDeliveryReceiptId = async () => {
    try {
      const res = await fetch(`${API}/api/deliveryreceipts/next-id`);
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        deliveryReceiptId: data.nextDrId || "",
      }));
    } catch (err) {
      console.error("Failed to fetch next delivery receipt ID:", err);
      setForm((prev) => ({ ...prev, deliveryReceiptId: "" }));
    }
  };

  const handleChange = (field) => (e) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCustomerLookup = () => {
    if (readOnly) return;
    setShowCustomerLookup(true);
  };

  const handleCustomerSelected = (customer) => {
    setForm((prev) => ({
      ...prev,
      customerId: customer.customerID || "",
      companyName: customer.companyName || "",
      address: customer.companyAddress || "",
      contactInfo: customer.phoneNumber || "",
      contactName: customer.contactNames?.[0] || "",
    }));
    setContactNameOptions(customer.contactNames || []);
    // Switching customers invalidates whatever was already logged from
    // the old customer's completed jobs.
    setItems([]);
    setShowCustomerLookup(false);
  };

  const handleAddItem = () => {
    if (readOnly) return;
    if (!form.customerId) {
      setDialog({
        show: true,
        title: "No Customer Selected",
        message: "Pick a customer first before logging a completed job.",
        onConfirm: hideDialog,
        onCancel: null,
        confirmLabel: "OK",
        cancelLabel: "Cancel",
        type: "default",
      });
      return;
    }
    setShowReleaseUnit(true);
  };

  const handleReleaseUnitAdd = (item) => {
    setItems((prev) => [...prev, item]);
  };

  // Edits a single field of a single logged item (e.g. tweaking Remarks
  // before saving) without touching the rest of the row.
  const handleItemFieldChange = (idx, field) => (e) => {
    if (readOnly) return;
    const val = e.target.value;
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)),
    );
  };

  const handleLoadOldSystem = () => {
    console.log("Load Old System");
  };

  // Opens CameraCaptureModal. Disabled in readOnly (viewRecord) mode -
  // there's nothing to attach newly captured photos to on a record
  // that's already saved and locked down.
  const handleOpenCamera = () => {
    if (readOnly) return;
    setShowCamera(true);
  };

  // Photos come back as an array of dataURLs (CameraCaptureModal's
  // onCapture contract) - append to whatever's already been captured
  // this session rather than replacing it.
  const handlePhotosCaptured = (dataUrls) => {
    setPhotos((prev) => [...prev, ...dataUrls]);
  };

  // Available whether or not there are items yet - useful to check
  // what's already on file for a customer/job before logging anything.
  const handleOpenFolder = () => {
    setShowFolder(true);
  };

  // Print is now available at any time while editing (as long as
  // there's at least one item to put on a tag), not just after saving.
  // It builds a receipt-shaped object from the current in-progress
  // form/items and hands it to the same PrintDeliveryReceiptModal used
  // post-save, so both flows render identically.
  const handlePrint = () => {
    setPrintReceipt({
      deliveryReceiptId: form.deliveryReceiptId,
      date: form.date,
      companyName: form.companyName,
      type: type || "unit",
      items,
    });
  };

  const performSave = async () => {
    hideDialog();
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${API}/api/deliveryreceipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryReceiptId: undefined, // server assigns the real one
          jobReceiptID,
          type,
          items,
          photos,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setSaveError("Failed to save delivery receipt. Please try again.");
        return;
      }

      // Flag every job that was logged into this receipt as
      // unit-delivered. Deliberately separate from certificateDelivered
      // so a job released as an instrument here can still be released
      // for certificate later, and vice versa.
      await Promise.all(
        items.map((item) =>
          fetch(`${API}/api/jobnumbers/update-details`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobNumber: item.jobNumber,
              unitDelivered: true,
            }),
          }),
        ),
      );

      if (onSaved) onSaved(data);
      // Set the print payload BEFORE closing the form. Because the
      // print modal below is no longer nested under the `isOpen` early
      // return, it will keep rendering after performClose() flips
      // isOpen to false in the parent.
      setPrintReceipt(data.receipt);
      performClose();

      // Surface a partial/total photo upload failure AFTER performClose
      // - the dialog's own `show` state is independent of the form
      // portal's `isOpen` gate, so it still renders on top of the print
      // modal that just opened.
      if (data.photoUploadWarning) {
        showNotice("Some Photos Weren't Saved", data.photoUploadWarning);
      }
    } catch (err) {
      console.error("Failed to save delivery receipt:", err);
      setSaveError("Failed to save delivery receipt. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (readOnly) return;
    showConfirm(
      "Confirm Save",
      `Are you sure you want to save Delivery Receipt ${form.deliveryReceiptId}? This will mark ${items.length} job(s) as unit-delivered.`,
      performSave,
      "default",
    );
  };

  const performClose = () => {
    setForm(EMPTY_FORM);
    setItems([]);
    setContactNameOptions([]);
    setShowReleaseUnit(false);
    setSaveError("");
    setPhotos([]);
    onClose();
  };

  const handleExitClick = () => {
    hideDialog();
    if (readOnly || items.length === 0) {
      // Viewing an existing record, or nothing logged yet - nothing to
      // lose, just close directly.
      performClose();
      return;
    }
    showConfirm(
      "Confirm Exit",
      "Are you sure you want to exit? Any items logged in this receipt will be lost.",
      performClose,
      "danger",
    );
  };

  // Shown in the camera header and used as the ReceiptFolderModal title
  // so it's unambiguous which flow the photos/files belong to.
  const contextLabel = `DELIVERY RECEIPT (UNIT)${
    form.deliveryReceiptId ? ` #${form.deliveryReceiptId}` : ""
  }`;

  return (
    <>
      {isOpen &&
        ReactDOM.createPortal(
          <div className="dr-modal-overlay">
            <div className="dr-modal dr-modal--large">
              <CdmsModalHeader
                title="DELIVERY RECEIPT (UNIT)"
                onClose={handleExitClick}
              />

              <div className="dr-modal-body">
                <div className="dr-form-grid">
                  <div className="dr-form-col">
                    <div className="dr-field dr-field--inline">
                      <label>Customer ID</label>
                      <input
                        type="text"
                        value={form.customerId}
                        onChange={handleChange("customerId")}
                        disabled={readOnly}
                      />
                      {!readOnly && (
                        <button
                          type="button"
                          className="dr-icon-btn"
                          onClick={handleCustomerLookup}
                          aria-label="Search customer"
                        >
                          🔍
                        </button>
                      )}
                    </div>

                    <div className="dr-field">
                      <label>Company Name</label>
                      <textarea
                        rows={4}
                        value={form.companyName}
                        onChange={handleChange("companyName")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="dr-field">
                      <label>Contact Info</label>
                      <textarea
                        rows={4}
                        value={form.contactInfo}
                        onChange={handleChange("contactInfo")}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="dr-form-col">
                    <div className="dr-field dr-field--inline dr-field--right">
                      <label>Delivery Receipt ID</label>
                      <input
                        type="text"
                        value={form.deliveryReceiptId}
                        readOnly
                      />
                    </div>

                    <div className="dr-field dr-field--inline dr-field--right">
                      <label>Date</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={handleChange("date")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="dr-field">
                      <label>Address</label>
                      <textarea
                        rows={4}
                        value={form.address}
                        onChange={handleChange("address")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="dr-field dr-field--inline dr-field--right">
                      <label>Reference</label>
                      <input
                        type="text"
                        value={form.reference}
                        onChange={handleChange("reference")}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="dr-field dr-field--inline dr-field--right">
                      <label>Contact Name</label>
                      <select
                        value={form.contactName}
                        onChange={handleChange("contactName")}
                        disabled={readOnly}
                      >
                        <option value="">---</option>
                        {contactNameOptions.map((c) => (
                          <option key={c._id || c} value={c.name || c}>
                            {c.name || c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="dr-field dr-field--inline dr-field--right">
                      <label>Prepared By</label>
                      <input type="text" value={form.preparedBy} disabled />
                    </div>
                  </div>
                </div>

                {!readOnly && (
                  <div className="dr-modal-actions">
                    <button className="dr-btn" onClick={handleAddItem}>
                      Add
                    </button>
                    {/* <button className="dr-btn" onClick={handleLoadOldSystem}>
                      Load Old System
                    </button> */}
                  </div>
                )}

                <div className="dr-table-wrapper">
                  <table className="dr-table">
                    <thead>
                      <tr>
                        <th>Job Number</th>
                        <th>Description</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Serial No.</th>
                        <th>ETA</th>
                        <th>Frequency</th>
                        <th>Remarks</th>
                        <th>Concern</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? (
                        items.map((item, idx) =>
                          readOnly ? (
                            <tr key={item.id || item.jobNumber || idx}>
                              <td>{item.jobNumber}</td>
                              <td>{item.description || "—"}</td>
                              <td>{item.brand || "—"}</td>
                              <td>{item.model || "—"}</td>
                              <td>{item.serialNo || "—"}</td>
                              <td>{item.eta || "—"}</td>
                              <td>{item.frequency || "—"}</td>
                              <td>{item.remarks || "—"}</td>
                              <td>{item.concern || "—"}</td>
                            </tr>
                          ) : (
                            <tr key={item.id}>
                              <td>{item.jobNumber}</td>
                              <td>
                                <input
                                  type="text"
                                  value={item.description || ""}
                                  onChange={handleItemFieldChange(
                                    idx,
                                    "description",
                                  )}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={item.brand || ""}
                                  onChange={handleItemFieldChange(idx, "brand")}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={item.model || ""}
                                  onChange={handleItemFieldChange(idx, "model")}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={item.serialNo || ""}
                                  onChange={handleItemFieldChange(
                                    idx,
                                    "serialNo",
                                  )}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={item.eta || ""}
                                  onChange={handleItemFieldChange(idx, "eta")}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={item.frequency || ""}
                                  onChange={handleItemFieldChange(
                                    idx,
                                    "frequency",
                                  )}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={item.remarks || ""}
                                  onChange={handleItemFieldChange(
                                    idx,
                                    "remarks",
                                  )}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={item.concern || ""}
                                  onChange={handleItemFieldChange(
                                    idx,
                                    "concern",
                                  )}
                                />
                              </td>
                            </tr>
                          ),
                        )
                      ) : (
                        <tr>
                          <td colSpan="9" className="no-data">
                            No items added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="dr-field">
                  <label>Remarks</label>
                  <textarea
                    rows={3}
                    value={form.remarks}
                    onChange={handleChange("remarks")}
                    disabled={readOnly}
                  />
                </div>

                {saveError && (
                  <p className="dr-error-text" role="alert">
                    {saveError}
                  </p>
                )}
              </div>

              <div className="dr-modal-footer">
                {/* <button className="dr-btn dr-btn--link" disabled>
                  Modification History
                </button> */}
                <button
                  className="dr-btn"
                  onClick={handleOpenCamera}
                  disabled={readOnly}
                  title={
                    readOnly
                      ? "Not available when viewing a saved record"
                      : undefined
                  }
                >
                  Open Camera{photos.length > 0 ? ` (${photos.length})` : ""}
                </button>
                <button className="dr-btn" onClick={handleOpenFolder}>
                  Open Folder
                </button>
                <div className="dr-modal-footer-spacer" />
                <button
                  className="dr-btn"
                  onClick={handlePrint}
                  disabled={items.length === 0}
                >
                  Print
                </button>
                {!readOnly && (
                  <button
                    className="dr-btn dr-btn--primary"
                    onClick={handleSaveClick}
                    disabled={saving || items.length === 0}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                )}
                <button className="dr-btn" onClick={handleExitClick}>
                  {readOnly ? "Close" : "Exit"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showCustomerLookup && (
        <CustomerLookupModal
          onClose={() => setShowCustomerLookup(false)}
          onSelect={handleCustomerSelected}
        />
      )}

      <ReleaseUnitModal
        isOpen={showReleaseUnit}
        onClose={() => setShowReleaseUnit(false)}
        onAddItem={handleReleaseUnitAdd}
        addedIds={items.map((it) => it.id)}
        customerId={form.customerId}
      />

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

      {printReceipt && (
        <PrintDeliveryReceiptModal
          receipt={printReceipt}
          onClose={() => setPrintReceipt(null)}
        />
      )}

      {showCamera && (
        <CameraCaptureModal
          onClose={() => setShowCamera(false)}
          onCapture={handlePhotosCaptured}
          contextLabel={contextLabel}
        />
      )}

      {showFolder && (
        <ReceiptFolderModal
          onClose={() => setShowFolder(false)}
          jobNumbers={items}
          unitPhotoUrls={photos}
          title={`${contextLabel} — FILES`}
        />
      )}
    </>
  );
};

export default DeliveryReceiptUnitModal;
