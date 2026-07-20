// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
// import CustomerLookupModal from "../jobreceipt/CustomerLookupModal"; // adjust path to wherever this actually lives
// import ConfirmDialog from "../../components/ConfirmDialog";
// import "./DeliveryReceiptModals.css";
// import ReleaseUnitModal from "./ReleaseUnitModal";

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
// // jobs (forDeliveryTagged === true, not yet delivered) belonging to
// // that same customer. Saving posts to /api/deliveryreceipts, which
// // generates the DRID server-side (atomic counter), then flags every
// // used job as delivered so it can't be released again.
// //
// // Prepared By is always the currently logged-in user (sessionStorage
// // "name", set at login - see Login.jsx) and is not editable here.
// const DeliveryReceiptUnitModal = ({
//   isOpen,
//   onClose,
//   onSaved,
//   jobReceiptID,
//   type,
// }) => {
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [items, setItems] = useState([]);
//   const [contactNameOptions, setContactNameOptions] = useState([]);
//   const [showCustomerLookup, setShowCustomerLookup] = useState(false);
//   const [showReleaseUnit, setShowReleaseUnit] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [saveError, setSaveError] = useState("");

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

//   useEffect(() => {
//     if (!isOpen) return;
//     fetchNextDeliveryReceiptId();
//     setForm((prev) => ({
//       ...prev,
//       date: new Date().toISOString().slice(0, 10),
//       preparedBy: sessionStorage.getItem("name") || "",
//     }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen]);

//   // Preview only - the server assigns the real, authoritative DRID via
//   // an atomic counter increment when the receipt is actually saved
//   // (see handleSave), so this can never collide with another user's
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
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleCustomerLookup = () => setShowCustomerLookup(true);

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

//   const handleLoadOldSystem = () => {
//     console.log("Load Old System");
//   };

//   const handleOpenCamera = () => {
//     console.log("Open Camera");
//   };

//   const handleOpenFolder = () => {
//     console.log("Open Folder");
//   };

//   const handlePrint = () => {
//     console.log("Print delivery receipt");
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

//       // Flag every job that was logged into this receipt so it drops
//       // out of the "completed, not yet delivered" pool in
//       // ReleaseUnitModal and can't be released twice.
//       await Promise.all(
//         items.map((item) =>
//           fetch(`${API}/api/jobnumbers/update-details`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               jobNumber: item.jobNumber,
//               delivered: true,
//             }),
//           }),
//         ),
//       );

//       if (onSaved) onSaved(data);
//       performClose();
//     } catch (err) {
//       console.error("Failed to save delivery receipt:", err);
//       setSaveError("Failed to save delivery receipt. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveClick = () => {
//     showConfirm(
//       "Confirm Save",
//       `Are you sure you want to save Delivery Receipt ${form.deliveryReceiptId}? This will mark ${items.length} job(s) as delivered.`,
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
//     if (items.length === 0) {
//       // nothing logged yet, nothing to lose - just close directly
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

//   if (!isOpen) return null;

//   return (
//     <>
//       {ReactDOM.createPortal(
//         <div className="dr-modal-overlay">
//           <div className="dr-modal dr-modal--large">
//             <CdmsModalHeader
//               title="DELIVERY RECEIPT (UNIT)"
//               onClose={handleExitClick}
//             />

//             <div className="dr-modal-body">
//               <div className="dr-form-grid">
//                 <div className="dr-form-col">
//                   <div className="dr-field dr-field--inline">
//                     <label>Customer ID</label>
//                     <input
//                       type="text"
//                       value={form.customerId}
//                       onChange={handleChange("customerId")}
//                     />
//                     <button
//                       type="button"
//                       className="dr-icon-btn"
//                       onClick={handleCustomerLookup}
//                       aria-label="Search customer"
//                     >
//                       🔍
//                     </button>
//                   </div>

//                   <div className="dr-field">
//                     <label>Company Name</label>
//                     <textarea
//                       rows={4}
//                       value={form.companyName}
//                       onChange={handleChange("companyName")}
//                     />
//                   </div>

//                   <div className="dr-field">
//                     <label>Contact Info</label>
//                     <textarea
//                       rows={4}
//                       value={form.contactInfo}
//                       onChange={handleChange("contactInfo")}
//                     />
//                   </div>
//                 </div>

//                 <div className="dr-form-col">
//                   <div className="dr-field dr-field--inline dr-field--right">
//                     <label>Delivery Receipt ID</label>
//                     <input
//                       type="text"
//                       value={form.deliveryReceiptId}
//                       readOnly
//                     />
//                   </div>

//                   <div className="dr-field dr-field--inline dr-field--right">
//                     <label>Date</label>
//                     <input
//                       type="date"
//                       value={form.date}
//                       onChange={handleChange("date")}
//                     />
//                   </div>

//                   <div className="dr-field">
//                     <label>Address</label>
//                     <textarea
//                       rows={4}
//                       value={form.address}
//                       onChange={handleChange("address")}
//                     />
//                   </div>

//                   <div className="dr-field dr-field--inline dr-field--right">
//                     <label>Reference</label>
//                     <input
//                       type="text"
//                       value={form.reference}
//                       onChange={handleChange("reference")}
//                     />
//                   </div>

//                   <div className="dr-field dr-field--inline dr-field--right">
//                     <label>Contact Name</label>
//                     <select
//                       value={form.contactName}
//                       onChange={handleChange("contactName")}
//                     >
//                       <option value="">---</option>
//                       {contactNameOptions.map((c) => (
//                         <option key={c._id || c} value={c.name || c}>
//                           {c.name || c}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="dr-field dr-field--inline dr-field--right">
//                     <label>Prepared By</label>
//                     <input type="text" value={form.preparedBy} disabled />
//                   </div>
//                 </div>
//               </div>

//               <div className="dr-modal-actions">
//                 <button className="dr-btn" onClick={handleAddItem}>
//                   Add
//                 </button>
//                 <button className="dr-btn" onClick={handleLoadOldSystem}>
//                   Load Old System
//                 </button>
//               </div>

//               <div className="dr-table-wrapper">
//                 <table className="dr-table">
//                   <tbody>
//                     {items.length > 0 ? (
//                       items.map((item, idx) => (
//                         <tr key={item.id}>
//                           <td>
//                             <input
//                               type="text"
//                               value={item.value}
//                               onChange={(e) => {
//                                 const val = e.target.value;
//                                 setItems((prev) =>
//                                   prev.map((it, i) =>
//                                     i === idx ? { ...it, value: val } : it,
//                                   ),
//                                 );
//                               }}
//                             />
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className="no-data">No items added</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="dr-field">
//                 <label>Remarks</label>
//                 <textarea
//                   rows={3}
//                   value={form.remarks}
//                   onChange={handleChange("remarks")}
//                 />
//               </div>

//               {saveError && (
//                 <p className="dr-error-text" role="alert">
//                   {saveError}
//                 </p>
//               )}
//             </div>

//             <div className="dr-modal-footer">
//               <button className="dr-btn dr-btn--link" disabled>
//                 Modification History
//               </button>
//               <button className="dr-btn" onClick={handleOpenCamera}>
//                 Open Camera
//               </button>
//               <button className="dr-btn" onClick={handleOpenFolder}>
//                 Open Folder
//               </button>
//               <div className="dr-modal-footer-spacer" />
//               <button className="dr-btn" onClick={handlePrint} disabled>
//                 Print
//               </button>
//               <button
//                 className="dr-btn dr-btn--primary"
//                 onClick={handleSaveClick}
//                 disabled={saving || items.length === 0}
//               >
//                 {saving ? "Saving..." : "Save"}
//               </button>
//               <button className="dr-btn" onClick={handleExitClick}>
//                 Exit
//               </button>
//             </div>
//           </div>
//         </div>,
//         document.body,
//       )}

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
const DeliveryReceiptUnitModal = ({
  isOpen,
  onClose,
  onSaved,
  jobReceiptID,
  type,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [contactNameOptions, setContactNameOptions] = useState([]);
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [showReleaseUnit, setShowReleaseUnit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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

  useEffect(() => {
    if (!isOpen) return;
    fetchNextDeliveryReceiptId();
    setForm((prev) => ({
      ...prev,
      date: new Date().toISOString().slice(0, 10),
      preparedBy: sessionStorage.getItem("username") || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCustomerLookup = () => setShowCustomerLookup(true);

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
    const val = e.target.value;
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)),
    );
  };

  const handleLoadOldSystem = () => {
    console.log("Load Old System");
  };

  const handleOpenCamera = () => {
    console.log("Open Camera");
  };

  const handleOpenFolder = () => {
    console.log("Open Folder");
  };

  const handlePrint = () => {
    console.log("Print delivery receipt");
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
      performClose();
    } catch (err) {
      console.error("Failed to save delivery receipt:", err);
      setSaveError("Failed to save delivery receipt. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
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
    onClose();
  };

  const handleExitClick = () => {
    hideDialog();
    if (items.length === 0) {
      // nothing logged yet, nothing to lose - just close directly
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

  if (!isOpen) return null;

  return (
    <>
      {ReactDOM.createPortal(
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
                    />
                    <button
                      type="button"
                      className="dr-icon-btn"
                      onClick={handleCustomerLookup}
                      aria-label="Search customer"
                    >
                      🔍
                    </button>
                  </div>

                  <div className="dr-field">
                    <label>Company Name</label>
                    <textarea
                      rows={4}
                      value={form.companyName}
                      onChange={handleChange("companyName")}
                    />
                  </div>

                  <div className="dr-field">
                    <label>Contact Info</label>
                    <textarea
                      rows={4}
                      value={form.contactInfo}
                      onChange={handleChange("contactInfo")}
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
                    />
                  </div>

                  <div className="dr-field">
                    <label>Address</label>
                    <textarea
                      rows={4}
                      value={form.address}
                      onChange={handleChange("address")}
                    />
                  </div>

                  <div className="dr-field dr-field--inline dr-field--right">
                    <label>Reference</label>
                    <input
                      type="text"
                      value={form.reference}
                      onChange={handleChange("reference")}
                    />
                  </div>

                  <div className="dr-field dr-field--inline dr-field--right">
                    <label>Contact Name</label>
                    <select
                      value={form.contactName}
                      onChange={handleChange("contactName")}
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

              <div className="dr-modal-actions">
                <button className="dr-btn" onClick={handleAddItem}>
                  Add
                </button>
                <button className="dr-btn" onClick={handleLoadOldSystem}>
                  Load Old System
                </button>
              </div>

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
                      items.map((item, idx) => (
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
                              onChange={handleItemFieldChange(idx, "serialNo")}
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
                              onChange={handleItemFieldChange(idx, "frequency")}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.remarks || ""}
                              onChange={handleItemFieldChange(idx, "remarks")}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.concern || ""}
                              onChange={handleItemFieldChange(idx, "concern")}
                            />
                          </td>
                        </tr>
                      ))
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
                />
              </div>

              {saveError && (
                <p className="dr-error-text" role="alert">
                  {saveError}
                </p>
              )}
            </div>

            <div className="dr-modal-footer">
              <button className="dr-btn dr-btn--link" disabled>
                Modification History
              </button>
              <button className="dr-btn" onClick={handleOpenCamera}>
                Open Camera
              </button>
              <button className="dr-btn" onClick={handleOpenFolder}>
                Open Folder
              </button>
              <div className="dr-modal-footer-spacer" />
              <button className="dr-btn" onClick={handlePrint} disabled>
                Print
              </button>
              <button
                className="dr-btn dr-btn--primary"
                onClick={handleSaveClick}
                disabled={saving || items.length === 0}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="dr-btn" onClick={handleExitClick}>
                Exit
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
    </>
  );
};

export default DeliveryReceiptUnitModal;
