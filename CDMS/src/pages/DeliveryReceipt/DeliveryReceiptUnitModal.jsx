// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";
// import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader"; // adjust path to wherever this actually lives
// import "./DeliveryReceiptModals.css";

// const API = import.meta.env.VITE_API_URL;

// // Step 2 modal (shown after "Release Instrument" is chosen in
// // DeliveryTypeModal). Mirrors the "DELIVERY RECEIPT (UNIT)" screen:
// // customer lookup, company/contact details, an itemized instrument
// // table, remarks, and the print/save/exit action row.
// //
// // jobReceiptID (optional) can be passed in from the list row that
// // triggered "Add New" so the form can prefill company/contact info from
// // the matching job receipt - wire that up once you decide how "Add New"
// // should associate to a specific job.
// const DeliveryReceiptUnitModal = ({
//   isOpen,
//   onClose,
//   onSaved,
//   jobReceiptID,
// }) => {
//   const [form, setForm] = useState({
//     deliveryReceiptId: "",
//     date: "",
//     customerId: "",
//     companyName: "",
//     address: "",
//     contactInfo: "",
//     reference: "",
//     contactName: "",
//     preparedBy: "",
//     remarks: "",
//   });
//   const [items, setItems] = useState([]);
//   const [preparedByOptions, setPreparedByOptions] = useState([]);
//   const [contactNameOptions, setContactNameOptions] = useState([]);
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

//   // TODO: point this at whatever endpoint generates the next
//   // "DR/xxxx/yy" sequence (mirrors jobReceiptID generation elsewhere).
//   const fetchNextDeliveryReceiptId = async () => {
//     try {
//       const res = await fetch(`${API}/api/deliveryreceipts/next-id`);
//       const data = await res.json();
//       setForm((prev) => ({ ...prev, deliveryReceiptId: data.nextId || "" }));
//     } catch (err) {
//       console.error("Failed to fetch next delivery receipt ID:", err);
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

//   // TODO: open the customer lookup picker (the small icon button next to
//   // Customer ID) - not implemented yet.
//   const handleCustomerLookup = () => {
//     console.log("Open customer lookup");
//   };

//   const handleAddItem = () => {
//     setItems((prev) => [...prev, { id: Date.now(), value: "" }]);
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
//         body: JSON.stringify({ ...form, jobReceiptID, items }),
//       });
//       const data = await res.json();
//       if (onSaved) onSaved(data);
//       onClose();
//     } catch (err) {
//       console.error("Failed to save delivery receipt:", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!isOpen) return null;

//   return ReactDOM.createPortal(
//     <div className="dr-modal-overlay">
//       <div className="dr-modal dr-modal--large">
//         <CdmsModalHeader title="DELIVERY RECEIPT (UNIT)" onClose={onClose} />

//         <div className="dr-modal-body">
//           <div className="dr-form-grid">
//             <div className="dr-form-col">
//               <div className="dr-field dr-field--inline">
//                 <label>Customer ID</label>
//                 <input
//                   type="text"
//                   value={form.customerId}
//                   onChange={handleChange("customerId")}
//                 />
//                 <button
//                   type="button"
//                   className="dr-icon-btn"
//                   onClick={handleCustomerLookup}
//                   aria-label="Search customer"
//                 >
//                   🔍
//                 </button>
//               </div>

//               <div className="dr-field">
//                 <label>Company Name</label>
//                 <textarea
//                   rows={4}
//                   value={form.companyName}
//                   onChange={handleChange("companyName")}
//                 />
//               </div>

//               <div className="dr-field">
//                 <label>Contact Info</label>
//                 <textarea
//                   rows={4}
//                   value={form.contactInfo}
//                   onChange={handleChange("contactInfo")}
//                 />
//               </div>
//             </div>

//             <div className="dr-form-col">
//               <div className="dr-field dr-field--inline dr-field--right">
//                 <label>Delivery Receipt ID</label>
//                 <input type="text" value={form.deliveryReceiptId} readOnly />
//               </div>

//               <div className="dr-field dr-field--inline dr-field--right">
//                 <label>Date</label>
//                 <input
//                   type="date"
//                   value={form.date}
//                   onChange={handleChange("date")}
//                 />
//               </div>

//               <div className="dr-field">
//                 <label>Address</label>
//                 <textarea
//                   rows={4}
//                   value={form.address}
//                   onChange={handleChange("address")}
//                 />
//               </div>

//               <div className="dr-field dr-field--inline dr-field--right">
//                 <label>Reference</label>
//                 <input
//                   type="text"
//                   value={form.reference}
//                   onChange={handleChange("reference")}
//                 />
//               </div>

//               <div className="dr-field dr-field--inline dr-field--right">
//                 <label>Contact Name</label>
//                 <select
//                   value={form.contactName}
//                   onChange={handleChange("contactName")}
//                 >
//                   <option value="">---</option>
//                   {contactNameOptions.map((c) => (
//                     <option key={c._id || c} value={c.name || c}>
//                       {c.name || c}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="dr-field dr-field--inline dr-field--right">
//                 <label>Prepared By</label>
//                 <select
//                   value={form.preparedBy}
//                   onChange={handleChange("preparedBy")}
//                 >
//                   <option value="">Select...</option>
//                   {preparedByOptions.map((u) => (
//                     <option key={u._id} value={u.fullName || u.name}>
//                       {u.fullName || u.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="dr-modal-actions">
//             <button className="dr-btn" onClick={handleAddItem}>
//               Add
//             </button>
//             <button className="dr-btn" onClick={handleLoadOldSystem}>
//               Load Old System
//             </button>
//           </div>

//           <div className="dr-table-wrapper">
//             <table className="dr-table">
//               <tbody>
//                 {items.length > 0 ? (
//                   items.map((item, idx) => (
//                     <tr key={item.id}>
//                       <td>
//                         <input
//                           type="text"
//                           value={item.value}
//                           onChange={(e) => {
//                             const val = e.target.value;
//                             setItems((prev) =>
//                               prev.map((it, i) =>
//                                 i === idx ? { ...it, value: val } : it,
//                               ),
//                             );
//                           }}
//                         />
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td className="no-data">No items added</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="dr-field">
//             <label>Remarks</label>
//             <textarea
//               rows={3}
//               value={form.remarks}
//               onChange={handleChange("remarks")}
//             />
//           </div>
//         </div>

//         <div className="dr-modal-footer">
//           <button className="dr-btn dr-btn--link" disabled>
//             Modification History
//           </button>
//           <button className="dr-btn" onClick={handleOpenCamera}>
//             Open Camera
//           </button>
//           <button className="dr-btn" onClick={handleOpenFolder}>
//             Open Folder
//           </button>
//           <div className="dr-modal-footer-spacer" />
//           <button className="dr-btn" onClick={handlePrint} disabled>
//             Print
//           </button>
//           <button
//             className="dr-btn dr-btn--primary"
//             onClick={handleSave}
//             disabled={saving}
//           >
//             {saving ? "Saving..." : "Save"}
//           </button>
//           <button className="dr-btn" onClick={onClose}>
//             Exit
//           </button>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default DeliveryReceiptUnitModal;
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import CustomerLookupModal from "../jobreceipt/CustomerLookupModal"; // adjust path to wherever this actually lives
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
// DeliveryTypeModal). Mirrors the "DELIVERY RECEIPT (UNIT)" screen:
// customer lookup, company/contact details, an itemized instrument
// table, remarks, and the print/save/exit action row.
//
// jobReceiptID (optional) can be passed in from the list row that
// triggered "Add New" so the form can prefill company/contact info from
// the matching job receipt - wire that up once you decide how "Add New"
// should associate to a specific job.
const DeliveryReceiptUnitModal = ({
  isOpen,
  onClose,
  onSaved,
  jobReceiptID,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([]);
  const [preparedByOptions, setPreparedByOptions] = useState([]);
  const [contactNameOptions, setContactNameOptions] = useState([]);
  const [showCustomerLookup, setShowCustomerLookup] = useState(false);
  const [showReleaseUnit, setShowReleaseUnit] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchNextDeliveryReceiptId();
    fetchPreparedByOptions();
    setForm((prev) => ({
      ...prev,
      date: new Date().toISOString().slice(0, 10),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Builds the next ID in the form DR/0001/26, DR/0002/26, ... scoped to
  // the current year. This assumes a GET /api/deliveryreceipts endpoint
  // that returns existing receipts with a `deliveryReceiptId` field - swap
  // this for a dedicated /next-id backend endpoint later if you want the
  // sequence generated server-side (safer against race conditions when
  // two people click "Add New" at the same time).
  const fetchNextDeliveryReceiptId = async () => {
    const yy = String(new Date().getFullYear()).slice(-2);
    try {
      const res = await fetch(`${API}/api/deliveryreceipts`);
      const data = await res.json();
      const receipts = Array.isArray(data) ? data : [];

      let maxSeq = 0;
      receipts.forEach((r) => {
        const match = r.deliveryReceiptId?.match(/^DR\/(\d{4})\/(\d{2})$/);
        if (match && match[2] === yy) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      });

      const nextSeq = String(maxSeq + 1).padStart(4, "0");
      setForm((prev) => ({
        ...prev,
        deliveryReceiptId: `DR/${nextSeq}/${yy}`,
      }));
    } catch (err) {
      console.error("Failed to fetch next delivery receipt ID:", err);
      // Fall back to DR/0001/yy so the field isn't left blank.
      setForm((prev) => ({ ...prev, deliveryReceiptId: `DR/0001/${yy}` }));
    }
  };

  // TODO: confirm this is the right endpoint/shape for staff who can be
  // selected as "Prepared By" (likely the same users collection used for
  // admin/owner login).
  const fetchPreparedByOptions = async () => {
    try {
      const res = await fetch(`${API}/api/users`);
      const data = await res.json();
      setPreparedByOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch prepared-by options:", err);
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
    setShowCustomerLookup(false);
  };

  const handleAddItem = () => setShowReleaseUnit(true);

  const handleReleaseUnitAdd = (item) => {
    setItems((prev) => [...prev, item]);
  };

  // TODO: hook this up to whatever the "Load Old System" import flow does
  // elsewhere in the app.
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/deliveryreceipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jobReceiptID, items }),
      });
      const data = await res.json();
      if (onSaved) onSaved(data);
      handleClose();
    } catch (err) {
      console.error("Failed to save delivery receipt:", err);
    } finally {
      setSaving(false);
    }
  };

  // Clears the form back to blank and notifies the parent. This modal
  // stays mounted between opens (the parent just toggles `isOpen`), so
  // without this the fields would still show the last entry next time
  // it's opened.
  const handleClose = () => {
    setForm(EMPTY_FORM);
    setItems([]);
    setContactNameOptions([]);
    setShowReleaseUnit(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {ReactDOM.createPortal(
        <div className="dr-modal-overlay">
          <div className="dr-modal dr-modal--large">
            <CdmsModalHeader
              title="DELIVERY RECEIPT (UNIT)"
              onClose={handleClose}
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
                    <select
                      value={form.preparedBy}
                      onChange={handleChange("preparedBy")}
                    >
                      <option value="">Select...</option>
                      {preparedByOptions.map((u) => (
                        <option key={u._id} value={u.fullName || u.name}>
                          {u.fullName || u.name}
                        </option>
                      ))}
                    </select>
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
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item, idx) => (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="text"
                              value={item.value}
                              onChange={(e) => {
                                const val = e.target.value;
                                setItems((prev) =>
                                  prev.map((it, i) =>
                                    i === idx ? { ...it, value: val } : it,
                                  ),
                                );
                              }}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="no-data">No items added</td>
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
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button className="dr-btn" onClick={handleClose}>
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
      />
    </>
  );
};

export default DeliveryReceiptUnitModal;
