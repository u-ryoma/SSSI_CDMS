// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader"; // adjust path to wherever this actually lives
// import CustomerLookupModal from "../jobreceipt/CustomerLookupModal"; // adjust path to wherever this actually lives
// import ReleaseCertificateModal from "./ReleaseCertificateModal";
// import "./DeliveryReceiptModals.css";

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

// // Step 2 modal (shown after "Release Certificate" is chosen in
// // DeliveryTypeModal). Mirrors DeliveryReceiptUnitModal field-for-field
// // since there's no separate mockup yet for the certificate-release
// // screen - if the real screen differs (e.g. no item table, different
// // fields), update this file without needing to touch the Unit modal.
// //
// // jobReceiptID (optional) can be passed in from the list row that
// // triggered "Add New" so the form can prefill company/contact info from
// // the matching job receipt - wire that up once you decide how "Add New"
// // should associate to a specific job.
// const DeliveryReceiptCertificateModal = ({
//   isOpen,
//   onClose,
//   onSaved,
//   jobReceiptID,
// }) => {
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [items, setItems] = useState([]);
//   const [preparedByOptions, setPreparedByOptions] = useState([]);
//   const [contactNameOptions, setContactNameOptions] = useState([]);
//   const [showCustomerLookup, setShowCustomerLookup] = useState(false);
//   const [showReleaseCertificate, setShowReleaseCertificate] = useState(false);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (!isOpen) return;
//     fetchNextDeliveryReceiptId();
//     fetchPreparedByOptions();
//     setForm((prev) => ({
//       ...prev,
//       date: new Date().toISOString().slice(0, 10),
//     }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen]);

//   // Builds the next ID in the form DR/0001/26, DR/0002/26, ... scoped to
//   // the current year, same logic as the Unit modal. Since both share the
//   // same DR/xxxx/yy numbering sequence via /api/deliveryreceipts, this
//   // stays consistent whether the receipt is for a unit or a certificate.
//   const fetchNextDeliveryReceiptId = async () => {
//     const yy = String(new Date().getFullYear()).slice(-2);
//     try {
//       const res = await fetch(`${API}/api/deliveryreceipts`);
//       const data = await res.json();
//       const receipts = Array.isArray(data) ? data : [];

//       let maxSeq = 0;
//       receipts.forEach((r) => {
//         const match = r.deliveryReceiptId?.match(/^DR\/(\d{4})\/(\d{2})$/);
//         if (match && match[2] === yy) {
//           const seq = parseInt(match[1], 10);
//           if (seq > maxSeq) maxSeq = seq;
//         }
//       });

//       const nextSeq = String(maxSeq + 1).padStart(4, "0");
//       setForm((prev) => ({
//         ...prev,
//         deliveryReceiptId: `DR/${nextSeq}/${yy}`,
//       }));
//     } catch (err) {
//       console.error("Failed to fetch next delivery receipt ID:", err);
//       // Fall back to DR/0001/yy so the field isn't left blank.
//       setForm((prev) => ({ ...prev, deliveryReceiptId: `DR/0001/${yy}` }));
//     }
//   };

//   // TODO: confirm this is the right endpoint/shape for staff who can be
//   // selected as "Prepared By" (likely the same users collection used for
//   // admin/owner login).
//   const fetchPreparedByOptions = async () => {
//     try {
//       const res = await fetch(`${API}/api/users`);
//       const data = await res.json();
//       setPreparedByOptions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch prepared-by options:", err);
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
//     setShowCustomerLookup(false);
//   };

//   const handleAddItem = () => setShowReleaseCertificate(true);

//   const handleReleaseCertificateAdd = (item) => {
//     setItems((prev) => [...prev, item]);
//   };

//   // TODO: hook this up to whatever the "Load Old System" import flow does
//   // elsewhere in the app.
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

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const res = await fetch(`${API}/api/deliveryreceipts`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...form,
//           jobReceiptID,
//           items,
//           releaseType: "certificate",
//         }),
//       });
//       const data = await res.json();
//       if (onSaved) onSaved(data);
//       handleClose();
//     } catch (err) {
//       console.error("Failed to save delivery receipt:", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Clears the form back to blank and notifies the parent. This modal
//   // stays mounted between opens (the parent just toggles `isOpen`), so
//   // without this the fields would still show the last entry next time
//   // it's opened.
//   const handleClose = () => {
//     setForm(EMPTY_FORM);
//     setItems([]);
//     setContactNameOptions([]);
//     setShowReleaseCertificate(false);
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       {ReactDOM.createPortal(
//         <div className="dr-modal-overlay">
//           <div className="dr-modal dr-modal--large">
//             <CdmsModalHeader
//               title="DELIVERY RECEIPT (CERTIFICATE)"
//               onClose={handleClose}
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
//                     <select
//                       value={form.preparedBy}
//                       onChange={handleChange("preparedBy")}
//                     >
//                       <option value="">Select...</option>
//                       {preparedByOptions.map((u) => (
//                         <option key={u._id} value={u.fullName || u.name}>
//                           {u.fullName || u.name}
//                         </option>
//                       ))}
//                     </select>
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
//                 onClick={handleSave}
//                 disabled={saving}
//               >
//                 {saving ? "Saving..." : "Save"}
//               </button>
//               <button className="dr-btn" onClick={handleClose}>
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

//       <ReleaseCertificateModal
//         isOpen={showReleaseCertificate}
//         onClose={() => setShowReleaseCertificate(false)}
//         onAddItem={handleReleaseCertificateAdd}
//         addedIds={items.map((it) => it.id)}
//       />
//     </>
//   );
// };

// export default DeliveryReceiptCertificateModal;
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import CustomerLookupModal from "../jobreceipt/CustomerLookupModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import ReleaseCertificateModal from "./ReleaseCertificateModal";
import "./DeliveryReceiptModals.css";

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

// Step 2 modal (shown after "Release Certificate" is chosen in
// DeliveryTypeModal). Mirrors DeliveryReceiptUnitModal field-for-field
// and behavior-for-behavior, with one deliberate difference: a job
// that already had its instrument released (unitDelivered === true)
// can still show up here and be released for certificate, since the
// two release types are tracked independently (certificateDelivered
// vs unitDelivered) rather than sharing one "delivered" flag.
const DeliveryReceiptCertificateModal = ({
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
  const [showReleaseCertificate, setShowReleaseCertificate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ---- Confirm dialog (same pattern as the Unit modal) ----
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
  // (see performSave), shared with the Unit modal's same sequence.
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
    setShowReleaseCertificate(true);
  };

  const handleReleaseCertificateAdd = (item) => {
    setItems((prev) => [...prev, item]);
  };

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
          type: type || "certificate",
          items,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setSaveError("Failed to save delivery receipt. Please try again.");
        return;
      }

      // Flag every job logged into this receipt as certificate-delivered.
      // Deliberately separate from unitDelivered so a job already
      // released as an instrument can still be released here, and vice
      // versa.
      await Promise.all(
        items.map((item) =>
          fetch(`${API}/api/jobnumbers/update-details`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobNumber: item.jobNumber,
              certificateDelivered: true,
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
      `Are you sure you want to save Delivery Receipt ${form.deliveryReceiptId}? This will mark ${items.length} job(s) as certificate-delivered.`,
      performSave,
      "default",
    );
  };

  const performClose = () => {
    setForm(EMPTY_FORM);
    setItems([]);
    setContactNameOptions([]);
    setShowReleaseCertificate(false);
    setSaveError("");
    onClose();
  };

  const handleExitClick = () => {
    hideDialog();
    if (items.length === 0) {
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
              title="DELIVERY RECEIPT (CERTIFICATE)"
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

      <ReleaseCertificateModal
        isOpen={showReleaseCertificate}
        onClose={() => setShowReleaseCertificate(false)}
        onAddItem={handleReleaseCertificateAdd}
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

export default DeliveryReceiptCertificateModal;
