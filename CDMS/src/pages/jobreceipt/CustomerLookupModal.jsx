import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

const CustomerLookupTable = ({ onSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  const filtered = customers.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerID?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="lookup-search">
        <input
          type="text"
          placeholder="Search by company name or customer ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      {loading ? (
        <p className="lookup-loading">Loading customers...</p>
      ) : (
        <div className="lookup-table-wrapper">
          <table className="lookup-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Company Name</th>
                <th>Address</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>VAT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((customer) => (
                  <tr
                    key={customer.customerID}
                    className="lookup-row"
                    onClick={() => onSelect(customer)}
                  >
                    <td>{customer.customerID}</td>
                    <td>{customer.companyName}</td>
                    <td>{customer.companyAddress}</td>
                    <td>{customer.contactNames?.join(", ")}</td>
                    <td>{customer.phoneNumber}</td>
                    <td>{customer.vat}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="jr-no-data">
                    No customers found
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

const CustomerLookupModal = ({ onClose, onSelect }) =>
  createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="lookup-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="lookup-modal-header">
          <h2>Select Customer</h2>
          <button className="jr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <CustomerLookupTable onSelect={onSelect} />
      </div>
    </div>,
    document.body,
  );

export default CustomerLookupModal;
