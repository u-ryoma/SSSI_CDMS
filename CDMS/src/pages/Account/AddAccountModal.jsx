import { useState } from "react";
import CdmsModalHeader from "../IncomingCalibration/CdmsModalHeader";
import "./AddAccountModal.css";

export default function AddAccountModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState({ text: "", success: false });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage({ text: data.message, success: data.success });
      if (data.success) {
        setForm({ username: "", name: "", email: "", password: "", role: "" });
        onSuccess();
      }
    } catch (err) {
      setMessage({ text: "Connection failed.", success: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="aa-modal-overlay" onClick={onClose}>
      <div className="aa-modal" onClick={(e) => e.stopPropagation()}>
        <CdmsModalHeader
          title="ADD NEW ACCOUNT"
          subtitleBottom="Create a new user account"
          onClose={onClose}
        />

        <form className="account-form" onSubmit={handleSubmit}>
          <div className="aa-form-grid">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group aa-form-full">
              <label>Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="clerk">Clerk</option>
                <option value="technician">Technician</option>
                <option value="typist">Typist</option>
              </select>
            </div>
          </div>

          {message.text && (
            <div
              className={`form-message ${message.success ? "success" : "error"}`}
            >
              {message.text}
            </div>
          )}

          <div className="aa-modal-actions">
            {/* <button
              type="button"
              className="btn-cancel-lg"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button> */}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
