// export default function AssetMonitoring() {
//   return (
//     <div>
//       <h1>Asset Monitoring</h1>
//       <p>Asset Monitoring coming soon.</p>
//     </div>
//   );
// }
import React, { useState } from "react";
import "./assetmonitoring.css";

const CalibrationSystem = () => {
  const [activeTab, setActiveTab] = useState("Search");

  return (
    <div className="calibration-container">
      {/* HEADER */}
      <header className="calibration-header">
        {/* <h1>CDMS CALIBRATION DATABASE AND MONITORING SYSTEM</h1> */}
        <h2>ASSET MONITORING SYSTEM</h2>
      </header>

      {/* TABS */}
      {/* <nav className="calibration-tabs">
        {["Search", "Delivery Receipt", "Refresh"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav> */}

      {/* SEARCH BAR */}
      <div className="calibration-search">
        <select>
          <option value="standardId">Standard ID</option>
          <option value="assetNo">Asset No</option>
          <option value="description">Description</option>
        </select>
        <input type="text" placeholder="Search..." />
        <button>Refresh</button>
      </div>

      {/* TABLE */}
      <div className="calibration-table-wrapper">
        <table className="calibration-table">
          <thead>
            <tr>
              <th>Standard ID</th>
              <th>Asset No</th>
              <th>Description</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Serial No.</th>
              <th>Range</th>
              <th>Date Cal</th>
              <th>Date Due</th>
              <th>Cycle</th>
              <th>Centre</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {/* <td>STD-001</td>
              <td>A-100</td>
              <td>Pressure Gauge</td>
              <td>Yokogawa</td>
              <td>PG-200</td>
              <td>SN12345</td>
              <td>0-100 PSI</td>
              <td>2026-05-01</td>
              <td>2027-05-01</td>
              <td>12 Months</td>
              <td>Main Lab</td> */}
            </tr>
            {/* Add more rows dynamically */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalibrationSystem;
