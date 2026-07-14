import React, { useState } from "react";
import "./QuotationList.css";

const QtnForSend = () => {
  const [company, setCompany] = useState("");
  const [search, setSearch] = useState("");

  const companies = ["Company Name", "Contact Name", "JR ID"];

  const quotations = [
    // {
    //   quotationId: "Q-001",
    //   date: "2026-05-08",
    //   companyName: "XYZ Corp",
    //   companyAddress: "123 Main St, Pasig",
    //   contactInfo: "xyz@example.com",
    //   contactName: "John Doe",
    //   refNo: "REF-1001",
    //   preparedBy: "Alice",
    //   checkedBy: "Bob",
    //   sentBy: "Charlie",
    // },
  ];

  const filteredQuotations = quotations.filter(
    (q) =>
      (!company || q.companyName === company) &&
      (!search || q.refNo.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="quotation-container">
      {/* Header */}
      <div className="quotation-header">
        {/* <h1>CALIBRATION DATABASE AND MONITORING SYSTEM (CDMS)</h1> */}
        <h2>QUOTATION FOR SEND</h2>
      </div>

      {/* Tabs */}
      <div className="quotation-tabs">
        <button className="active">List of Quotations</button>
        {/* <button>Add New Quotation</button> */}
      </div>

      {/* Search bar */}
      <div className="quotation-search">
        {/* <label>Company Name:</label> */}
        <select value={company} onChange={(e) => setCompany(e.target.value)}>
          {/* <option value="">-- Select Company --</option> */}
          {companies.map((comp, idx) => (
            <option key={idx} value={comp}>
              {comp}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* <button>Add New</button> */}
        <button>Refresh</button>
      </div>

      {/* Table */}
      <div className="quotation-table-wrapper">
        <table className="quotation-table">
          <thead>
            <tr>
              <th>Quotation ID</th>
              <th>Date</th>
              <th>Company Name</th>
              <th>Company Address</th>
              <th>Contact Info</th>
              <th>Contact Name</th>
              <th>Ref No.</th>
              <th>Prepared By</th>
              <th>Checked By</th>
              <th>Sent By</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.map((q, idx) => (
              <tr key={idx}>
                <td>{q.quotationId}</td>
                <td>{q.date}</td>
                <td>{q.companyName}</td>
                <td>{q.companyAddress}</td>
                <td>{q.contactInfo}</td>
                <td>{q.contactName}</td>
                <td>{q.refNo}</td>
                <td>{q.preparedBy}</td>
                <td>{q.checkedBy}</td>
                <td>{q.sentBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QtnForSend;
