// export default function ConcernOut() {
//   return (
//     <div>
//       <h1>Concern Outgoing</h1>
//       <p>Concern Outgoing coming soon.</p>
//     </div>
//   );
// }
import React, { useState } from "react";
import "./concernout.css";

const ConcernOut = () => {
  const [company, setCompany] = useState("");
  const [search, setSearch] = useState("");

  const companies = ["Company Name", "Contact Name", "JR ID"];

  const jobs = [
    {
      jobNumber: "JOB-002",
      dateRec: "2026-05-09",
      priority: "Medium",
      oic: "Engr. Reyes",
      company: "XYZ Corp",
      description: "Outgoing Concern",
      brand: "Keysight",
      model: "K200",
      serialNo: "SN002",
      eta: "2026-05-20",
      remarks: "Pending shipment",
    },
  ];

  const filteredJobs = jobs.filter(
    (j) =>
      (!company || j.company === company) &&
      (!search || j.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="outgoing-container">
      {/* Header */}
      <div className="outgoing-header">
        {/* <h1>CDMS CALIBRATION DATABASE AND MONITORING SYSTEM</h1> */}
        <h2>OUTGOING CONCERN</h2>
      </div>

      {/* Tabs */}
      <div className="outgoing-tabs">
        <button className="active">List of Concerns</button>
        {/* <button>Add Concern</button> */}
      </div>

      {/* Search bar */}
      <div className="outgoing-search">
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

        <button>Search</button>
        <select>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
      </div>

      {/* Table */}
      <div className="outgoing-table-wrapper">
        <table className="outgoing-table">
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
            {filteredJobs.map((j, idx) => (
              <tr key={idx}>
                <td>{j.jobNumber}</td>
                <td>{j.dateRec}</td>
                <td>{j.priority}</td>
                <td>{j.oic}</td>
                <td>{j.company}</td>
                <td>{j.description}</td>
                <td>{j.brand}</td>
                <td>{j.model}</td>
                <td>{j.serialNo}</td>
                <td>{j.eta}</td>
                <td>{j.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConcernOut;
