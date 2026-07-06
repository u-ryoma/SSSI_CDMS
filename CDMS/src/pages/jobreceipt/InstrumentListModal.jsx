// import React, { useState, useEffect } from "react";
// import { createPortal } from "react-dom";

// const API = import.meta.env.VITE_API_URL;

// const InstrumentListModal = ({ onClose, onSelect }) => {
//   const [instruments, setInstruments] = useState([]);
//   const [search, setSearch] = useState("");
//   const [searchBy, setSearchBy] = useState("description");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchInstruments();
//   }, []);

//   const fetchInstruments = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/api/instruments`);
//       const data = await res.json();
//       setInstruments(data);
//     } catch (err) {
//       console.error("Failed to fetch instruments", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtered = instruments.filter((item) =>
//     item[searchBy]?.toLowerCase().includes(search.toLowerCase()),
//   );

//   return createPortal(
//     <div className="jr-modal-overlay" onClick={onClose}>
//       <div className="il-modal-wrapper" onClick={(e) => e.stopPropagation()}>
//         {/* FIXED HEADER */}
//         <div className="jr-modal-header">
//           <div className="jr-modal-header-left">
//             <div className="jr-cdms-logo">CDMS</div>
//             <div className="jr-modal-title">
//               <span className="jr-modal-title-sub">
//                 CALIBRATION DATABASE AND MONITORING SYSTEM
//               </span>
//               <span className="jr-modal-title-main">INSTRUMENT LIST</span>
//               <span className="jr-modal-title-sub">
//                 SCIENTIFIC STANDARDS SERVICES
//               </span>
//             </div>
//           </div>
//           <button className="jr-modal-close" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         <div className="il-content">
//           <div className="il-search-row">
//             <input
//               type="text"
//               placeholder="Search..."
//               className="il-search-input"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               autoFocus
//             />
//             <select
//               className="il-search-select"
//               value={searchBy}
//               onChange={(e) => setSearchBy(e.target.value)}
//             >
//               <option value="description">Description</option>
//               <option value="type">Type</option>
//               <option value="range">Range</option>
//             </select>
//           </div>

//           <div className="il-table-wrapper">
//             {loading ? (
//               <p className="il-no-data">Loading instruments...</p>
//             ) : (
//               <table className="il-table">
//                 <thead>
//                   <tr>
//                     <th>Description</th>
//                     <th>Range</th>
//                     <th>Uncertainty</th>
//                     <th>Remarks</th>
//                     <th>Unit Price</th>
//                     <th>Date Due</th>
//                     <th>Type</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.length > 0 ? (
//                     filtered.map((item, index) => (
//                       <tr
//                         key={index}
//                         className="il-row"
//                         onClick={() => onSelect(item)}
//                       >
//                         <td>{item.description}</td>
//                         <td>{item.range}</td>
//                         <td>{item.uncertainty}</td>
//                         <td>{item.remarks}</td>
//                         <td>{item.unitPrice}</td>
//                         <td>{item.dateDue}</td>
//                         <td>{item.type}</td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" className="il-no-data">
//                         No instruments found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           <div className="il-footer">
//             <button className="jr-action-btn">Add New</button>
//             <button className="jr-action-btn" onClick={onClose}>
//               Exit
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// export default InstrumentListModal;
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

const emptyForm = {
  description: "",
  range: "",
  uncertainty: "",
  remarks: "",
  unitPrice: "",
  dateDue: "",
  type: "",
};

const InstrumentListModal = ({ onClose, onSelect }) => {
  const [instruments, setInstruments] = useState([]);
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("description");
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInstruments();
  }, []);

  const fetchInstruments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/instruments`);
      const data = await res.json();
      setInstruments(data);
    } catch (err) {
      console.error("Failed to fetch instruments", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = instruments.filter((item) =>
    item[searchBy]?.toLowerCase().includes(search.toLowerCase()),
  );

  const updateField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleOpenAddForm = () => {
    setFormData(emptyForm);
    setError("");
    setConfirming(false);
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setConfirming(false);
    setError("");
  };

  const handleRequestSave = () => {
    if (!formData.description.trim()) {
      setError("Description is required.");
      return;
    }
    setError("");
    setConfirming(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/instruments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success !== false) {
        await fetchInstruments();
        setShowAddForm(false);
        setConfirming(false);
        setFormData(emptyForm);
      } else {
        setError(data.message || "Failed to save instrument.");
        setConfirming(false);
      }
    } catch (err) {
      console.error("Failed to save instrument", err);
      setError("Failed to save instrument.");
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <div className="il-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* FIXED HEADER */}
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-sub">
                CALIBRATION DATABASE AND MONITORING SYSTEM
              </span>
              <span className="jr-modal-title-main">
                {showAddForm ? "ADD INSTRUMENT" : "INSTRUMENT LIST"}
              </span>
              <span className="jr-modal-title-sub">
                SCIENTIFIC STANDARDS SERVICES
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="il-content">
          {!showAddForm ? (
            <>
              <div className="il-search-row">
                <input
                  type="text"
                  placeholder="Search..."
                  className="il-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                <select
                  className="il-search-select"
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                >
                  <option value="description">Description</option>
                  <option value="type">Type</option>
                  <option value="range">Range</option>
                </select>
              </div>

              <div className="il-table-wrapper">
                {loading ? (
                  <p className="il-no-data">Loading instruments...</p>
                ) : (
                  <table className="il-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Range</th>
                        <th>Uncertainty</th>
                        <th>Remarks</th>
                        <th>Unit Price</th>
                        <th>Date Due</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length > 0 ? (
                        filtered.map((item, index) => (
                          <tr
                            key={index}
                            className="il-row"
                            onClick={() => onSelect(item)}
                          >
                            <td>{item.description}</td>
                            <td>{item.range}</td>
                            <td>{item.uncertainty}</td>
                            <td>{item.remarks}</td>
                            <td>{item.unitPrice}</td>
                            <td>{item.dateDue}</td>
                            <td>{item.type}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="il-no-data">
                            No instruments found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="il-footer">
                <button className="jr-action-btn" onClick={handleOpenAddForm}>
                  Add New
                </button>
                <button className="jr-action-btn" onClick={onClose}>
                  Exit
                </button>
              </div>
            </>
          ) : (
            <div className="il-add-form">
              {error && <p className="il-error">{error}</p>}

              <div className="il-form-grid">
                <label>
                  Description
                  <input
                    type="text"
                    value={formData.description}
                    onChange={updateField("description")}
                    autoFocus
                  />
                </label>
                <label>
                  Type
                  <select value={formData.type} onChange={updateField("type")}>
                    <option value="">-- Select --</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="electrical">Electrical</option>
                  </select>
                </label>
                <label>
                  Range
                  <input
                    type="text"
                    value={formData.range}
                    onChange={updateField("range")}
                  />
                </label>
                <label>
                  Uncertainty
                  <input
                    type="text"
                    value={formData.uncertainty}
                    onChange={updateField("uncertainty")}
                  />
                </label>
                <label>
                  Unit Price
                  <input
                    type="text"
                    value={formData.unitPrice}
                    onChange={updateField("unitPrice")}
                  />
                </label>
                <label>
                  Date Due
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={formData.dateDue}
                    onChange={updateField("dateDue")}
                  />
                </label>
                <label className="il-form-full">
                  Remarks
                  <textarea
                    rows={3}
                    value={formData.remarks}
                    onChange={updateField("remarks")}
                  />
                </label>
              </div>

              {confirming && (
                <div className="il-confirm-prompt">
                  <p>Are you sure you want to save this new instrument?</p>
                  <div className="il-confirm-actions">
                    <button
                      className="jr-action-btn"
                      onClick={() => setConfirming(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      className="jr-action-btn il-confirm-btn"
                      onClick={handleConfirmSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Confirm"}
                    </button>
                  </div>
                </div>
              )}

              <div className="il-footer">
                <button
                  className="jr-action-btn"
                  onClick={handleRequestSave}
                  disabled={confirming}
                >
                  Save
                </button>
                <button
                  className="jr-action-btn"
                  onClick={handleCancelAdd}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default InstrumentListModal;
