// export default function ForTyping() {
//   return (
//     <div>
//       <h1>For Typing</h1>
//       <p>For Typing coming soon.</p>
//     </div>
//   );
// }
import React, { useState } from "react";
import "./Ongoinglistcalib.css";

const ForTyping = () => {
  const [company, setCompany] = useState("");
  const [search, setSearch] = useState("");

  const companies = ["Company Name", "Contact Name", "JR ID"];

  const calibrations = [
    // {
    //   jobNumber: "JOB-001",
    //   dateRec: "2026-05-08",
    //   priority: "High",
    //   oic: "Engr. Santos",
    //   company: "ABC Company",
    //   description: "Calibration",
    //   brand: "Fluke",
    //   model: "F101",
    //   serialNo: "SN001",
    //   eta: "2026-05-15",
    //   remarks: "Waiting",
    // },
  ];

  const filteredCalibrations = calibrations.filter(
    (c) =>
      (!company || c.company === company) &&
      (!search || c.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="calibration-container">
      {/* Header */}
      <div className="calibration-header">
        {/* <h1>CALIBRATION DATABASE AND MONITORING SYSTEM (CDMS)</h1> */}
        <h2>CALIBRATION REPORT FOR TYPING</h2>
      </div>

      {/* Tabs */}
      <div className="calibration-tabs">
        <button className="active">List of Jobs</button>
        {/* <button>Add Job</button> */}
      </div>

      {/* Search bar */}
      <div className="calibration-search">
        {/* <label>Company Name:</label> */}
        <select value={company} onChange={(e) => setCompany(e.target.value)}>
          {/* <option value="">Company Name</option> */}
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

        <button>Re-Log</button>
        <button>Quick Log</button>
        <button>Refresh</button>
      </div>

      {/* Table */}
      <div className="calibration-table-wrapper">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Job Number</th>
              <th>Date Rec</th>
              <th>Priority</th>
              <th>OIC</th>
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
            {filteredCalibrations.map((c, idx) => (
              <tr key={idx}>
                <td>{c.jobNumber}</td>
                <td>{c.dateRec}</td>
                <td>{c.priority}</td>
                <td>{c.oic}</td>
                <td>{c.company}</td>
                <td>{c.description}</td>
                <td>{c.brand}</td>
                <td>{c.model}</td>
                <td>{c.serialNo}</td>
                <td>{c.eta}</td>
                <td>{c.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForTyping;
