// export default function InstrumentTag() {
//   return (
//     <div>
//       <h1>Instrument Tag</h1>
//       <p>Instrument Tag coming soon.</p>
//     </div>
//   );
// }
// instrumenttag.jsx

import React, { useState } from "react";
import "./instrumenttag.css";

const InstrumentTag = () => {
  const [activeTab, setActiveTab] = useState("list");

  const [records, setRecords] = useState([
    {
      jobNumber: "JOB-001",
      dateRec: "2026-05-08",
      priority: "High",
      company: "ABC Company",
      description: "Pressure Gauge",
      brand: "Fluke",
      model: "PG-101",
      serialNo: "SN-1001",
      eta: "2026-05-15",
      remarks: "Pending",
    },
  ]);

  const [formData, setFormData] = useState({
    jobNumber: "",
    dateRec: "",
    priority: "",
    company: "",
    description: "",
    brand: "",
    model: "",
    serialNo: "",
    eta: "",
    remarks: "",
  });

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SAVE RECORD
  const handleSubmit = (e) => {
    e.preventDefault();

    setRecords([...records, formData]);

    setFormData({
      jobNumber: "",
      dateRec: "",
      priority: "",
      company: "",
      description: "",
      brand: "",
      model: "",
      serialNo: "",
      eta: "",
      remarks: "",
    });

    alert("Instrument Tag Added Successfully!");
  };

  return (
    <div className="instrument-container">
      {/* HEADER */}
      <div className="instrument-header">
        <div>
          {/* <h1>CALIBRATION DATABASE AND MONITORING SYSTEM</h1> */}
          <h2>INSTRUMENT TAG / PIC</h2>
        </div>
      </div>

      {/* TABS */}
      <div className="instrument-tabs">
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          Instrument List
        </button>

        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Add Instrument
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="search-bar">
        <select>
          <option>Company Name</option>
          <option>Job Number</option>
          <option>Brand</option>
        </select>

        <input type="text" placeholder="Search..." />

        <button>Search</button>

        <select>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>

        <button>Log Printed</button>

        <button>Re-Print</button>

        <button>Refresh</button>
      </div>

      {/* LIST TAB */}
      {activeTab === "list" && (
        <div className="table-wrapper">
          <table className="instrument-table">
            <thead>
              <tr>
                <th>Job Number</th>
                <th>Date Rec</th>
                <th>Priority</th>
                <th>Company</th>
                <th>Description</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Serial No</th>
                <th>ETA</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td>{record.jobNumber}</td>
                  <td>{record.dateRec}</td>
                  <td>{record.priority}</td>
                  <td>{record.company}</td>
                  <td>{record.description}</td>
                  <td>{record.brand}</td>
                  <td>{record.model}</td>
                  <td>{record.serialNo}</td>
                  <td>{record.eta}</td>
                  <td>{record.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD TAB */}
      {activeTab === "add" && (
        <div className="instrument-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Number</label>

              <input
                type="text"
                name="jobNumber"
                value={formData.jobNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Date Received</label>

              <input
                type="date"
                name="dateRec"
                value={formData.dateRec}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Priority</label>

              <input
                type="text"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company</label>

              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Brand</label>

              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Model</label>

              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Serial No</label>

              <input
                type="text"
                name="serialNo"
                value={formData.serialNo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>ETA</label>

              <input
                type="date"
                name="eta"
                value={formData.eta}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Remarks</label>

              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>

            <div className="button-wrapper">
              <button type="submit" className="save-btn">
                Save Instrument
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InstrumentTag;
