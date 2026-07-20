import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

// =====================
// ADD CONTACT MODAL (shared: used by AddReceiptModal and JobNumberModal)
// =====================
const AddContactSubModal = ({ customerID, onClose, onContactAdded }) => {
  const [contactID, setContactID] = useState("");
  const [reserving, setReserving] = useState(true);
  const [contactName, setContactName] = useState("");
  const [contactType, setContactType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    reserveContactID();
  }, []);

  const reserveContactID = async () => {
    setReserving(true);
    try {
      const res = await fetch(`${API}/api/contacts/reserve`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setContactID(data.contactID);
      } else {
        setError("Failed to reserve a Contact ID.");
      }
    } catch (err) {
      console.error("Failed to reserve contact ID:", err);
      setError("Failed to reserve a Contact ID.");
    } finally {
      setReserving(false);
    }
  };

  const handleSave = async () => {
    if (!contactName.trim()) {
      setError("Contact Name is required.");
      return;
    }
    if (!contactType) {
      setError("Contact Type is required.");
      return;
    }
    if (!remarks.trim()) {
      setError("Remarks is required.");
      return;
    }
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`${API}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactID,
          customerID,
          contactName,
          contactType,
          remarks,
        }),
      });
      const data = await res.json();

      if (data.success) {
        onContactAdded(data.contact);
        onClose();
      } else {
        setError(data.message || "Failed to save contact.");
      }
    } catch (err) {
      console.error("Failed to save contact:", err);
      setError("Failed to save contact.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <div className="ac-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-main">
                CONTACT INFORMATION DETAILS
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ac-content">
          <div className="ac-id-row">
            <div className="ac-id-field">
              <label>Contact ID</label>
              <input
                type="text"
                value={reserving ? "Reserving..." : contactID}
                disabled
                className="jr-input-auto"
              />
            </div>
            <div className="ac-id-field">
              <label>Customer ID</label>
              <input
                type="text"
                value={customerID}
                disabled
                className="jr-input-auto"
              />
            </div>
          </div>

          {error && <p className="ac-error">{error}</p>}

          <div className="ac-field-row">
            <label>Contact Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="ac-field-row">
            <label>Contact Type</label>
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="Primary">Primary</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="ac-field-row ac-field-row-textarea">
            <label>Remarks</label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="ac-footer">
            <button
              className="jr-save-btn"
              onClick={handleSave}
              disabled={saving || reserving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className="jr-action-btn"
              onClick={onClose}
              disabled={saving}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddContactSubModal;
