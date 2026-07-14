import React, { useState } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

const AdminPasswordModal = ({ onClose, onVerified }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-admin-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setPassword("");
        onVerified();
      } else {
        setError(data.message || "Incorrect admin password.");
      }
    } catch (err) {
      console.error("Failed to verify admin password:", err);
      setError("Failed to verify admin password.");
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleVerify();
  };

  return createPortal(
    <div className="jr-modal-overlay" onClick={onClose}>
      <div
        className="ac-modal-wrapper"
        style={{ maxWidth: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="jr-modal-header">
          <div className="jr-modal-header-left">
            <div className="jr-cdms-logo">CDMS</div>
            <div className="jr-modal-title">
              <span className="jr-modal-title-main">
                ADMIN VERIFICATION REQUIRED
              </span>
            </div>
          </div>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ac-content">
          <p style={{ marginBottom: "12px", fontSize: "0.9rem" }}>
            Editing these fields requires admin password confirmation.
          </p>

          {error && <p className="ac-error">{error}</p>}

          <div className="ac-field-row">
            <label>Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={verifying}
            />
          </div>

          <div className="ac-footer">
            <button
              className="jr-save-btn"
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Verify"}
            </button>
            <button
              className="jr-action-btn"
              onClick={onClose}
              disabled={verifying}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AdminPasswordModal;
