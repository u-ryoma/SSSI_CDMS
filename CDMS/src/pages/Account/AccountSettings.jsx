import { useState, useEffect } from "react";
import AddAccountModal from "./AddAccountModal";
import "./AccountSettings.css";

// ==========================
// ALL ACCOUNTS TAB
// ==========================
function AllAccounts({ onAddClick }) {
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
        <div className="aa-modal-overlay">
          <div className="aa-confirm-modal">
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete this account?</p>
            <div className="aa-confirm-actions">
              <button
                className="btn-cancel-lg"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </button>
              <button className="btn-delete-lg" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="accounts-header">
        <div>
          <h3>All Accounts</h3>
          <p className="tab-subtitle">Manage existing user accounts.</p>
        </div>
        <button className="btn-add-account" onClick={onAddClick}>
          + Add Account
        </button>
      </div>

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="account-settings">
      <div className="as-banner">
        <h2>Account Settings</h2>
      </div>

      <AllAccounts key={refreshKey} onAddClick={() => setShowAddModal(true)} />

      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
