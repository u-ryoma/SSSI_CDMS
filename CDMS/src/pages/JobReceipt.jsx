// export default function JobReceipt() {
//   return (
//     <div>
//       <h1>Job Receipt</h1>
//       <p>Job Receipt coming soon.</p>
//     </div>
//   );
// }
// // Job Receipt ID -> Date -> Company Name -> Company Address -> Contact Info ->
// // Contact Name -> Ref no. -> Prepared by -> Add% -> Discount %  -> Total Price

// jobreceipt.jsx

import React, { useState } from "react";
import "./jobreceipt.css";

const JobReceipt = () => {
  const [activeTab, setActiveTab] = useState("list");

  const [receipts, setReceipts] = useState([
    {
      // jrId: "JR-001",
      // date: "2026-05-08",
      // companyName: "ABC Company",
      // companyAddress: "Manila, Philippines",
      // contactInfo: "09123456789",
      // contactName: "Juan Dela Cruz",
      // refNo: "REF-001",
      // preparedBy: "Admin",
      // addPercent: "12%",
    },
  ]);

  const [formData, setFormData] = useState({
    jrId: "",
    date: "",
    companyName: "",
    companyAddress: "",
    contactInfo: "",
    contactName: "",
    refNo: "",
    preparedBy: "",
    addPercent: "",
  });

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SAVE RECEIPT
  const handleSubmit = (e) => {
    e.preventDefault();

    setReceipts([...receipts, formData]);

    setFormData({
      jrId: "",
      date: "",
      companyName: "",
      companyAddress: "",
      contactInfo: "",
      contactName: "",
      refNo: "",
      preparedBy: "",
      addPercent: "",
    });

    alert("Job Receipt Added Successfully!");
  };

  return (
    <div className="receipt-container">
      {/* HEADER */}
      <div className="receipt-header">
        <div>
          {/* <h1>CALIBRATION DATABASE AND MONITORING SYSTEM</h1> */}
          <h2>JOB RECEIPT</h2>
        </div>
      </div>

      {/* TABS */}
      <div className="receipt-tabs">
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          Job Receipt List
        </button>

        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Add New
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="search-bar">
        <select>
          <option>Company Name</option>
          <option>JR ID</option>
          <option>Contact Name</option>
        </select>

        <input type="text" placeholder="Search..." />

        <button>Search</button>

        <select>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>

        {/* <button>Add New</button> */}

        <button>Refresh</button>
      </div>

      {/* LIST TAB */}
      {activeTab === "list" && (
        <div className="table-wrapper">
          <table className="receipt-table">
            <thead>
              <tr>
                <th>JR ID</th>
                <th>Date</th>
                <th>Company Name</th>
                <th>Company Address</th>
                <th>Contact Info</th>
                <th>Contact Name</th>
                <th>Ref No.</th>
                <th>Prepared By</th>
                <th>Add %</th>
              </tr>
            </thead>

            <tbody>
              {receipts.map((receipt, index) => (
                <tr key={index}>
                  <td>{receipt.jrId}</td>
                  <td>{receipt.date}</td>
                  <td>{receipt.companyName}</td>
                  <td>{receipt.companyAddress}</td>
                  <td>{receipt.contactInfo}</td>
                  <td>{receipt.contactName}</td>
                  <td>{receipt.refNo}</td>
                  <td>{receipt.preparedBy}</td>
                  <td>{receipt.addPercent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD TAB */}
      {activeTab === "add" && (
        <div className="receipt-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>JR ID</label>

              <input
                type="text"
                name="jrId"
                value={formData.jrId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date</label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>

              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company Address</label>

              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Contact Info</label>

              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Contact Name</label>

              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Ref No.</label>

              <input
                type="text"
                name="refNo"
                value={formData.refNo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Prepared By</label>

              <input
                type="text"
                name="preparedBy"
                value={formData.preparedBy}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Add %</label>

              <input
                type="text"
                name="addPercent"
                value={formData.addPercent}
                onChange={handleChange}
              />
            </div>

            <div className="button-wrapper">
              <button type="submit" className="save-btn">
                Save Receipt
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default JobReceipt;
