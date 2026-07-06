import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./customer.css";

const API = import.meta.env.VITE_API_URL;

const emptyForm = {
  companyName: "",
  companyAddress: "",
  contactNames: [""],
  phoneNumber: "",
  faxNumber: "",
  email: "",
  vat: "",
  remarks: "",
};

const ConfirmDialog = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  type,
}) =>
  createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          {onCancel && (
            <button className="cancel-btn" onClick={onCancel}>
              {cancelLabel || "Cancel"}
            </button>
          )}
          <button
            className={type === "danger" ? "confirm-btn-danger" : "confirm-btn"}
            onClick={onConfirm}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );

const CustomerForm = ({
  formData,
  onSubmit,
  submitLabel,
  isModal,
  onDelete,
  onChangeField,
  onContactChange,
  onAddContact,
  onRemoveContact,
}) => (
  <form onSubmit={onSubmit}>
    <div className="form-group">
      <label>Company Name</label>
      <input
        type="text"
        name="companyName"
        value={formData.companyName}
        onChange={onChangeField}
        required
      />
    </div>

    <div className="form-group">
      <label>Company Address</label>
      <textarea
        name="companyAddress"
        value={formData.companyAddress}
        onChange={onChangeField}
        required
      />
    </div>

    <div className="form-group">
      <label>Contact Name(s)</label>
      <div className="contact-wrapper">
        {formData.contactNames.map((contact, index) => (
          <div key={index} className="contact-row">
            <input
              type="text"
              placeholder={`Contact Name ${index + 1}`}
              value={contact}
              onChange={(e) => onContactChange(index, e.target.value)}
              className="contact-input"
            />
            {formData.contactNames.length > 1 && (
              <button
                type="button"
                className="remove-contact-btn"
                onClick={() => onRemoveContact(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="add-contact-btn"
          onClick={onAddContact}
        >
          + Add Contact
        </button>
      </div>
    </div>

    <div className="form-group">
      <label>Phone Number</label>
      <input
        type="text"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={onChangeField}
      />
    </div>

    <div className="form-group">
      <label>Fax Number</label>
      <input
        type="text"
        name="faxNumber"
        value={formData.faxNumber}
        onChange={onChangeField}
      />
    </div>

    <div className="form-group">
      <label>Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={onChangeField}
      />
    </div>

    <div className="form-group">
      <label>VAT</label>
      <input
        type="text"
        name="vat"
        value={formData.vat}
        onChange={onChangeField}
      />
    </div>

    <div className="form-group">
      <label>Remarks</label>
      <textarea
        name="remarks"
        value={formData.remarks}
        onChange={onChangeField}
      />
    </div>

    <div className="button-wrapper">
      <button type="submit" className="save-btn">
        {submitLabel}
      </button>
      {isModal && (
        <button type="button" className="delete-btn" onClick={onDelete}>
          Delete Customer
        </button>
      )}
    </div>
  </form>
);

const Modal = ({
  selectedCustomer,
  formData,
  onClose,
  onSubmit,
  onDelete,
  onChangeField,
  onContactChange,
  onAddContact,
  onRemoveContact,
}) =>
  createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Customer — {selectedCustomer?.customerID}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <CustomerForm
          formData={formData}
          onSubmit={onSubmit}
          submitLabel="Update Customer"
          isModal={true}
          onDelete={onDelete}
          onChangeField={onChangeField}
          onContactChange={onContactChange}
          onAddContact={onAddContact}
          onRemoveContact={onRemoveContact}
        />
      </div>
    </div>,
    document.body,
  );

const Customer = () => {
  const [activeTab, setActiveTab] = useState("allcustomer");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmLabel: "OK",
    cancelLabel: "Cancel",
    type: "default",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/customers`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  const hideDialog = () => {
    setDialog({
      show: false,
      title: "",
      message: "",
      onConfirm: null,
      onCancel: null,
      confirmLabel: "OK",
      cancelLabel: "Cancel",
      type: "default",
    });
  };

  const showSuccess = (title, message) => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm: hideDialog,
      onCancel: null,
      confirmLabel: "OK",
      cancelLabel: null,
      type: "default",
    });
  };

  const showConfirm = (title, message, onConfirm) => {
    setDialog({
      show: true,
      title,
      message,
      onConfirm,
      onCancel: hideDialog,
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      type: "danger",
    });
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleContactChange = (index, value) => {
    const updated = [...formData.contactNames];
    updated[index] = value;
    setFormData({ ...formData, contactNames: updated });
  };

  const addContactField = () =>
    setFormData({
      ...formData,
      contactNames: [...formData.contactNames, ""],
    });

  const removeContactField = (index) => {
    const updated = formData.contactNames.filter((_, i) => i !== index);
    setFormData({ ...formData, contactNames: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setFormData(emptyForm);
        fetchCustomers();
        setActiveTab("allcustomer");
        showSuccess(
          "Customer Added!",
          `Customer has been successfully added with ID: ${data.customerID}.`,
        );
      }
    } catch (err) {
      console.error("Failed to save customer", err);
    }
  };

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      companyName: customer.companyName,
      companyAddress: customer.companyAddress,
      contactNames: customer.contactNames?.length
        ? customer.contactNames
        : [""],
      phoneNumber: customer.phoneNumber || "",
      faxNumber: customer.faxNumber || "",
      email: customer.email || "",
      vat: customer.vat || "",
      remarks: customer.remarks || "",
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${API}/api/customers/${selectedCustomer.customerID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchCustomers();
        showSuccess(
          "Customer Updated!",
          "Customer details have been successfully updated.",
        );
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDelete = () => {
    showConfirm(
      "Confirm Delete",
      `Are you sure you want to delete ${selectedCustomer.companyName}?`,
      async () => {
        try {
          const res = await fetch(
            `${API}/api/customers/${selectedCustomer.customerID}`,
            { method: "DELETE" },
          );
          const data = await res.json();
          if (data.success) {
            hideDialog();
            setShowModal(false);
            fetchCustomers();
            showSuccess(
              "Customer Deleted!",
              "Customer has been successfully deleted.",
            );
          }
        } catch (err) {
          console.error("Delete failed", err);
        }
      },
    );
  };

  return (
    <div className="customer-container">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>List of Customers</h1>
      </div>

      {/* TABS */}
      <div className="customer-tabs">
        <button
          className={activeTab === "allcustomer" ? "active" : ""}
          onClick={() => setActiveTab("allcustomer")}
        >
          All Customers
        </button>
        <button
          className={activeTab === "customer" ? "active" : ""}
          onClick={() => setActiveTab("customer")}
        >
          Add Customer
        </button>
      </div>

      {/* ADD CUSTOMER TAB */}
      {activeTab === "customer" && (
        <div className="customer-card">
          <CustomerForm
            formData={formData}
            onSubmit={handleSubmit}
            submitLabel="Save Customer"
            isModal={false}
            onChangeField={handleChange}
            onContactChange={handleContactChange}
            onAddContact={addContactField}
            onRemoveContact={removeContactField}
          />
        </div>
      )}

      {/* ALL CUSTOMERS TAB */}
      {activeTab === "allcustomer" && (
        <div className="customer-card">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Company</th>
                    <th>Address</th>
                    <th>Contacts</th>
                    <th>Phone</th>
                    <th>Fax</th>
                    <th>Email</th>
                    <th>VAT</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <tr
                        key={customer.customerID}
                        onClick={() => handleRowClick(customer)}
                        className="clickable-row"
                      >
                        <td>{customer.customerID}</td>
                        <td>{customer.companyName}</td>
                        <td>{customer.companyAddress}</td>
                        <td>{customer.contactNames?.join(", ")}</td>
                        <td>{customer.phoneNumber}</td>
                        <td>{customer.faxNumber}</td>
                        <td>{customer.email}</td>
                        <td>{customer.vat}</td>
                        <td>{customer.remarks}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-data">
                        No Customer Records Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PORTAL MODAL */}
      {showModal && (
        <Modal
          selectedCustomer={selectedCustomer}
          formData={formData}
          onClose={() => setShowModal(false)}
          onSubmit={handleUpdate}
          onDelete={handleDelete}
          onChangeField={handleChange}
          onContactChange={handleContactChange}
          onAddContact={addContactField}
          onRemoveContact={removeContactField}
        />
      )}

      {/* CONFIRM DIALOG */}
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
    </div>
  );
};

export default Customer;
