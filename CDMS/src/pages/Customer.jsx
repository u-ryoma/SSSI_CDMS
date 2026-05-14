// customer.jsx

import React, { useState } from "react";
import "./customer.css";

const Customer = () => {
  const [activeTab, setActiveTab] = useState("allcustomer");

  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    contactNames: [""],
    phoneNumber: "",
    faxNumber: "",
    email: "",
    vat: "",
    remarks: "",
  });

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE CONTACT CHANGE
  const handleContactChange = (index, value) => {
    const updatedContacts = [...formData.contactNames];
    updatedContacts[index] = value;

    setFormData({
      ...formData,
      contactNames: updatedContacts,
    });
  };

  // ADD CONTACT FIELD
  const addContactField = () => {
    setFormData({
      ...formData,
      contactNames: [...formData.contactNames, ""],
    });
  };

  // SAVE CUSTOMER
  const handleSubmit = (e) => {
    e.preventDefault();

    const newCustomer = {
      customerId: customers.length + 1,
      ...formData,
    };

    setCustomers([...customers, newCustomer]);

    // RESET FORM
    setFormData({
      companyName: "",
      companyAddress: "",
      contactNames: [""],
      phoneNumber: "",
      faxNumber: "",
      email: "",
      vat: "",
      remarks: "",
    });

    alert("Customer Added Successfully!");
  };

  return (
    <div className="customer-container">
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
          <form onSubmit={handleSubmit}>
            {/* CUSTOMER ID */}
            <div className="form-group">
              {/* <label>Customer ID</label>

              <input type="text" value={customers.length + 1} disabled /> */}
            </div>
            {/* COMPANY NAME */}
            <div className="form-group">
              <label>Company Name</label>

              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            {/* COMPANY ADDRESS */}
            <div className="form-group">
              <label>Company Address</label>

              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                required
              />
            </div>

            {/* CONTACT NAMES */}
            <div className="form-group">
              <label>Contact Name(s)</label>

              <div className="contact-wrapper">
                {formData.contactNames.map((contact, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Contact Name ${index + 1}`}
                    value={contact}
                    onChange={(e) => handleContactChange(index, e.target.value)}
                    className="contact-input"
                  />
                ))}

                <button
                  type="button"
                  className="add-contact-btn"
                  onClick={addContactField}
                >
                  + Add Contact
                </button>
              </div>
            </div>

            {/* PHONE NUMBER */}
            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            {/* FAX NUMBER */}
            <div className="form-group">
              <label>Fax Number</label>

              <input
                type="text"
                name="faxNumber"
                value={formData.faxNumber}
                onChange={handleChange}
              />
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* VAT */}
            <div className="form-group">
              <label>VAT</label>

              <input
                type="text"
                name="vat"
                value={formData.vat}
                onChange={handleChange}
              />
            </div>

            {/* REMARKS */}
            <div className="form-group">
              <label>Remarks</label>

              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>

            {/* SAVE BUTTON */}
            <div className="button-wrapper">
              <button type="submit" className="save-btn">
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALL CUSTOMERS TAB */}
      {activeTab === "allcustomer" && (
        <div className="customer-card">
          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
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
                  <tr key={customer.customerId}>
                    <td>{customer.customerId}</td>
                    <td>{customer.companyName}</td>
                    <td>{customer.companyAddress}</td>

                    <td>
                      {customer.contactNames.map((name, index) => (
                        <div key={index}>{name}</div>
                      ))}
                    </td>

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
  );
};

export default Customer;
