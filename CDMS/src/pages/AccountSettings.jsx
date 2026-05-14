import { useState, useEffect } from "react";
import "./AddAccount.css";

// ==========================
// ADD ACCOUNT TAB
// ==========================
function AddAccount() {
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState({ text: "", success: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      }
    } catch (err) {
      setMessage({ text: "Connection failed.", success: false });
    }
  };

  return (
    <div className="tab-content">
      <h3>Add New Account</h3>
      <p className="tab-subtitle">Create a new user account.</p>
      <form className="account-form" onSubmit={handleSubmit}>
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
        <div className="form-group">
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
        <button type="submit" className="btn-primary">
          Register
        </button>
      </form>
      {message.text && (
        <div
          className={`form-message ${message.success ? "success" : "error"}`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

// ==========================
// ALL ACCOUNTS TAB
// ==========================
function AllAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState({ text: "", success: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts`);
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      setError("Failed to load accounts.");
    }
  }

  function startEdit(account) {
    setEditingId(account._id);
    setEditForm({
      username: account.username,
      name: account.name,
      email: account.email || "",
      role: account.role,
      password: "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function handleUpdate(id) {
    try {
      const updateData = {
        username: editForm.username,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };
      if (editForm.password && editForm.password.trim() !== "") {
        updateData.password = editForm.password;
      }
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/accounts/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        },
      );
      const data = await res.json();
      setMessage({ text: data.message, success: data.success });
      if (data.success) {
        setEditingId(null);
        fetchAccounts();
      }
    } catch (err) {
      setMessage({ text: "Update failed.", success: false });
    }
  }

  function handleDelete(id) {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/accounts/${deleteId}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      setMessage({ text: data.message, success: data.success });
      if (data.success) fetchAccounts();
    } catch (err) {
      setMessage({ text: "Delete failed.", success: false });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="tab-content">
      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "28px",
              width: "320px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 8px", color: "#18181b" }}>
              Delete Account
            </h3>
            <p
              style={{
                color: "#71717a",
                fontSize: "0.875rem",
                margin: "0 0 20px",
              }}
            >
              Are you sure you want to delete this account?
            </p>
            <div
              style={{ display: "flex", gap: "8px", justifyContent: "center" }}
            >
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
                style={{
                  padding: "9px 18px",
                  background: "#f4f4f5",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  color: "#3f3f46",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "9px 18px",
                  background: "#dc2626",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "white",
                  fontWeight: "500",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <h3>All Accounts</h3>
      <p className="tab-subtitle">Manage existing user accounts.</p>

      {message.text && (
        <div
          className={`form-message ${message.success ? "success" : "error"}`}
        >
          {message.text}
        </div>
      )}

      {error && <p className="form-message error">{error}</p>}

      <div className="accounts-table-wrapper">
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc._id}>
                {editingId === acc._id ? (
                  <>
                    <td>
                      <input
                        className="table-input"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="table-input"
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="owner">Owner</option>
                        <option value="clerk">Clerk</option>
                        <option value="technician">Technician</option>
                        <option value="typist">Typist</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="password"
                        placeholder="New password"
                        value={editForm.password}
                        onChange={(e) =>
                          setEditForm({ ...editForm, password: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-save"
                          onClick={() => handleUpdate(acc._id)}
                        >
                          Save
                        </button>
                        <button className="btn-cancel" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{acc.username}</td>
                    <td>{acc.name}</td>
                    <td>{acc.email}</td>
                    <td>
                      <span className={`role-badge ${acc.role}`}>
                        {acc.role}
                      </span>
                    </td>
                    <td>••••••••</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => startEdit(acc)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(acc._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================
// MAIN COMPONENT
// ==========================
export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("add");

  return (
    <div className="account-settings">
      <div className="settings-topnav">
        <button
          className={`topnav-btn ${activeTab === "add" ? "active" : ""}`}
          onClick={() => setActiveTab("add")}
        >
          Add Account
        </button>
        <button
          className={`topnav-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Accounts
        </button>
      </div>

      {activeTab === "add" && <AddAccount />}
      {activeTab === "all" && <AllAccounts />}
    </div>
  );
}
